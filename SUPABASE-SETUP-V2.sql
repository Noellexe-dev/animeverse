-- ============================================================
-- ANIMEVERSE V2 — cuentas, comunidad, catálogo personal y chats
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tablas
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.posts add column if not exists image_url text;
alter table public.comments add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Las publicaciones pueden ser solo imagen y el autor se obtiene del perfil
alter table public.posts alter column text drop not null;
alter table public.posts alter column author drop not null;
alter table public.posts alter column rating drop not null;
alter table public.comments alter column author drop not null;

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.anime_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  anime_id text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz not null default now(),
  unique (user_id, anime_id)
);

create table if not exists public.anime_library (
  user_id uuid not null references auth.users(id) on delete cascade,
  anime_id text not null,
  status text not null check (status in ('favorito', 'viendo', 'visto')),
  rating integer check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, anime_id)
);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_participants_idx on public.messages(sender_id, recipient_id);
create index if not exists messages_created_idx on public.messages(created_at);

-- ------------------------------------------------------------
-- 2. Permisos explícitos (importante: el rol anon necesita grants)
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.posts, public.comments, public.likes,
  public.anime_reviews, public.anime_library, public.follows, public.messages
to anon, authenticated;

-- ------------------------------------------------------------
-- 3. Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.anime_reviews enable row level security;
alter table public.anime_library enable row level security;
alter table public.follows enable row level security;
alter table public.messages enable row level security;

-- Borrar políticas anteriores para evitar conflictos
drop policy if exists "posts_select" on public.posts;
drop policy if exists "posts_insert" on public.posts;
drop policy if exists "posts_update" on public.posts;
drop policy if exists "posts_delete" on public.posts;
drop policy if exists "comments_select" on public.comments;
drop policy if exists "comments_insert" on public.comments;
drop policy if exists "comments_delete" on public.comments;

-- Perfiles: públicos, propios, o de alguien que te sigue / sigues
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (
  is_public
  or id = auth.uid()
  or exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.following_id = id)
  or exists (select 1 from public.follows f where f.following_id = auth.uid() and f.follower_id = id)
);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles for delete using (id = auth.uid());

create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = user_id);

drop policy if exists "likes_select" on public.likes;
create policy "likes_select" on public.likes for select using (true);
drop policy if exists "likes_insert" on public.likes;
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
drop policy if exists "likes_delete" on public.likes;
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

drop policy if exists "reviews_select" on public.anime_reviews;
create policy "reviews_select" on public.anime_reviews for select using (true);
drop policy if exists "reviews_insert" on public.anime_reviews;
create policy "reviews_insert" on public.anime_reviews for insert with check (auth.uid() = user_id);
drop policy if exists "reviews_update" on public.anime_reviews;
create policy "reviews_update" on public.anime_reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reviews_delete" on public.anime_reviews;
create policy "reviews_delete" on public.anime_reviews for delete using (auth.uid() = user_id);

drop policy if exists "library_select" on public.anime_library;
create policy "library_select" on public.anime_library for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = user_id and p.is_public)
);
drop policy if exists "library_insert" on public.anime_library;
create policy "library_insert" on public.anime_library for insert with check (auth.uid() = user_id);
drop policy if exists "library_update" on public.anime_library;
create policy "library_update" on public.anime_library for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "library_delete" on public.anime_library;
create policy "library_delete" on public.anime_library for delete using (auth.uid() = user_id);

drop policy if exists "follows_select" on public.follows;
create policy "follows_select" on public.follows for select using (
  auth.uid() = follower_id or auth.uid() = following_id
);
drop policy if exists "follows_insert" on public.follows;
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
drop policy if exists "follows_delete" on public.follows;
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = recipient_id
);
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id);
drop policy if exists "messages_delete" on public.messages;
create policy "messages_delete" on public.messages for delete using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- ------------------------------------------------------------
-- 4. Crear perfil automáticamente al registrarse
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'fan_' || left(replace(new.id::text, '-', ''), 8)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 5. Funciones: borrar cuenta y limpiar mensajes antiguos
-- ------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_my_account() to authenticated;

create or replace function public.cleanup_old_messages()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.messages where created_at < now() - interval '7 days';
end;
$$;

grant execute on function public.cleanup_old_messages() to anon, authenticated;

-- ------------------------------------------------------------
-- 6. Almacenamiento de imágenes
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

drop policy if exists "post_images_read" on storage.objects;
create policy "post_images_read" on storage.objects for select
using (bucket_id = 'post-images');

drop policy if exists "post_images_insert" on storage.objects;
create policy "post_images_insert" on storage.objects for insert
with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

drop policy if exists "post_images_delete" on storage.objects;
create policy "post_images_delete" on storage.objects for delete
using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ------------------------------------------------------------
-- 7. Realtime
-- ------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.posts;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 8. Publicaciones de ejemplo (compatibles con la versión anterior)
-- ------------------------------------------------------------
insert into public.posts (id, anime_id, author, text, rating, likes, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'fullmetal-alchemist-brotherhood', 'Maru', 'El equilibrio perfecto entre acción, drama y una historia que no pierde el ritmo. Lo recomiendo siempre.', 10, 12, now() - interval '26 hours'),
  ('22222222-2222-4222-8222-222222222222', 'spirited-away', 'Saku', 'Para una tarde lluviosa no hay nada mejor. La animación es pura magia.', 9, 8, now() - interval '8 hours'),
  ('33333333-3333-4333-8333-333333333333', 'cyberpunk-edgerunners', 'Kuro', 'Solo 10 episodios y te deja pensando durante días. La banda sonora increíble.', 9, 6, now() - interval '3 hours')
on conflict (id) do nothing;

insert into public.comments (id, post_id, author, text, created_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Kuro', 'Totalmente. El final es de los mejores que he visto.', now() - interval '20 hours')
on conflict (id) do nothing;
