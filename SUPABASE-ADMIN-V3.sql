-- ============================================================
-- ANIMEVERSE V3 — panel de administración, verificación y reportes
-- Ejecutar DESPUÉS de SUPABASE-SETUP-V2.sql
-- SQL Editor → New query → pegar todo → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Nuevas columnas en perfiles
-- ------------------------------------------------------------
alter table public.profiles add column if not exists role text not null default 'user' check (role in ('user', 'mod', 'admin'));
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists last_active_at timestamptz;

-- ------------------------------------------------------------
-- 2. Funciones auxiliares (van antes de las políticas)
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'mod'));
$$;

create or replace function public.is_active_user()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_banned = false);
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_active_user() to anon, authenticated;

-- ------------------------------------------------------------
-- 3. Tabla de reportes / mensajes a la administración
-- ------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  kind text not null check (kind in ('problema', 'sugerencia', 'usuario', 'publicacion')),
  message text not null,
  status text not null default 'abierto' check (status in ('abierto', 'en revision', 'resuelto')),
  admin_reply text,
  created_at timestamptz not null default now()
);

create index if not exists reports_created_idx on public.reports(created_at desc);

grant select, insert on public.reports to anon, authenticated;
alter table public.reports enable row level security;

drop policy if exists "reports_select" on public.reports;
create policy "reports_select" on public.reports for select using (
  auth.uid() = reporter_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'mod'))
);
drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports for insert with check (auth.uid() = reporter_id and public.is_active_user());

-- ------------------------------------------------------------
-- 4. Cuenta administradora y actividad
-- ------------------------------------------------------------
-- El primer usuario registrado se vuelve administradora automáticamente.
-- Si ya tenías cuenta antes, usa el botón "Reclamar administración" en tu perfil.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  total integer;
  new_role text := 'user';
begin
  select count(*) into total from public.profiles;
  if total = 0 then new_role := 'admin'; end if;

  insert into public.profiles (id, username, display_name, role, last_active_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'fan_' || left(replace(new.id::text, '-', ''), 8)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    new_role,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.claim_admin()
returns text language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid()) then
    return 'Primero crea tu perfil.';
  end if;
  if exists (select 1 from public.profiles where role = 'admin') then
    return 'Ya existe una administradora.';
  end if;
  update public.profiles set role = 'admin' where id = auth.uid();
  return 'Listo, ahora eres la administradora.';
end;
$$;
grant execute on function public.claim_admin() to authenticated;

create or replace function public.touch_last_active()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set last_active_at = now() where id = auth.uid();
end;
$$;
grant execute on function public.touch_last_active() to authenticated;

-- ------------------------------------------------------------
-- 5. Bloquear cuentas baneadas en nuevas escrituras
-- ------------------------------------------------------------
drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id and public.is_active_user());
drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id and public.is_active_user());
drop policy if exists "likes_insert" on public.likes;
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id and public.is_active_user());
drop policy if exists "reviews_insert" on public.anime_reviews;
create policy "reviews_insert" on public.anime_reviews for insert with check (auth.uid() = user_id and public.is_active_user());
drop policy if exists "library_insert" on public.anime_library;
create policy "library_insert" on public.anime_library for insert with check (auth.uid() = user_id and public.is_active_user());
drop policy if exists "follows_insert" on public.follows;
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id and public.is_active_user());
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id and public.is_active_user());

-- ------------------------------------------------------------
-- 6. Lecturas de administración
-- ------------------------------------------------------------
create or replace function public.admin_list_users()
returns table (
  id uuid, username text, display_name text, email text, role text,
  is_verified boolean, is_banned boolean, created_at timestamptz,
  last_active_at timestamptz, posts bigint, comments bigint, reviews bigint, reports bigint
)
language sql security definer set search_path = public as $$
  select p.id, p.username, p.display_name, u.email, p.role, p.is_verified, p.is_banned,
         p.created_at, p.last_active_at,
         (select count(*) from public.posts where user_id = p.id),
         (select count(*) from public.comments where user_id = p.id),
         (select count(*) from public.anime_reviews where user_id = p.id),
         (select count(*) from public.reports where reporter_id = p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

create or replace function public.admin_list_reports()
returns table (
  id uuid, kind text, message text, status text, admin_reply text, created_at timestamptz,
  reporter text, reporter_email text, reported text, post_text text
)
language sql security definer set search_path = public as $$
  select r.id, r.kind, r.message, r.status, r.admin_reply, r.created_at,
         p.username, u.email,
         (select rp.username from public.profiles rp where rp.id = r.reported_user_id),
         (select left(pt.text, 120) from public.posts pt where pt.id = r.post_id)
  from public.reports r
  left join public.profiles p on p.id = r.reporter_id
  left join auth.users u on u.id = r.reporter_id
  where public.is_staff()
  order by r.created_at desc;
$$;

create or replace function public.admin_list_posts()
returns table (
  id uuid, text text, image_url text, created_at timestamptz,
  author text, likes bigint, comments bigint, reports bigint
)
language sql security definer set search_path = public as $$
  select pt.id, pt.text, pt.image_url, pt.created_at, p.username,
         (select count(*) from public.likes l where l.post_id = pt.id),
         (select count(*) from public.comments c where c.post_id = pt.id),
         (select count(*) from public.reports r where r.post_id = pt.id)
  from public.posts pt
  left join public.profiles p on p.id = pt.user_id
  where public.is_admin()
  order by pt.created_at desc
  limit 100;
$$;

create or replace function public.admin_list_comments()
returns table (id uuid, text text, created_at timestamptz, author text, post_id uuid)
language sql security definer set search_path = public as $$
  select c.id, c.text, c.created_at, p.username, c.post_id
  from public.comments c
  left join public.profiles p on p.id = c.user_id
  where public.is_admin()
  order by c.created_at desc
  limit 100;
$$;

create or replace function public.admin_stats()
returns table (users bigint, posts bigint, comments bigint, reviews bigint, open_reports bigint, banned bigint, verified bigint)
language sql security definer set search_path = public as $$
  select
    (select count(*) from public.profiles),
    (select count(*) from public.posts),
    (select count(*) from public.comments),
    (select count(*) from public.anime_reviews),
    (select count(*) from public.reports where status = 'abierto'),
    (select count(*) from public.profiles where is_banned),
    (select count(*) from public.profiles where is_verified)
  where public.is_admin();
$$;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_list_reports() to authenticated;
grant execute on function public.admin_list_posts() to authenticated;
grant execute on function public.admin_list_comments() to authenticated;
grant execute on function public.admin_stats() to authenticated;

-- ------------------------------------------------------------
-- 7. Acciones de administración
-- ------------------------------------------------------------
create or replace function public.admin_set_verified(target uuid, value boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  update public.profiles set is_verified = value where id = target;
end;
$$;

create or replace function public.admin_set_banned(target uuid, value boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  if target = auth.uid() then raise exception 'No puedes banearte a ti misma'; end if;
  update public.profiles set is_banned = value where id = target;
end;
$$;

create or replace function public.admin_set_role(target uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  if target = auth.uid() then raise exception 'No puedes cambiar tu propio rol'; end if;
  if new_role not in ('user', 'mod', 'admin') then raise exception 'Rol no válido'; end if;
  update public.profiles set role = new_role where id = target;
end;
$$;

create or replace function public.admin_delete_user(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  if target = auth.uid() then raise exception 'No puedes borrarte a ti misma desde el panel'; end if;
  delete from auth.users where id = target;
end;
$$;

create or replace function public.admin_delete_post(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  delete from public.posts where id = target;
end;
$$;

create or replace function public.admin_delete_comment(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  delete from public.comments where id = target;
end;
$$;

create or replace function public.admin_delete_review(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  delete from public.anime_reviews where id = target;
end;
$$;

create or replace function public.admin_reply_report(target uuid, reply text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  update public.reports set admin_reply = reply, status = 'resuelto' where id = target;
end;
$$;

create or replace function public.admin_close_report(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  update public.reports set status = 'resuelto' where id = target;
end;
$$;

grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;
grant execute on function public.admin_set_banned(uuid, boolean) to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_delete_post(uuid) to authenticated;
grant execute on function public.admin_delete_comment(uuid) to authenticated;
grant execute on function public.admin_delete_review(uuid) to authenticated;
grant execute on function public.admin_reply_report(uuid, text) to authenticated;
grant execute on function public.admin_close_report(uuid) to authenticated;
