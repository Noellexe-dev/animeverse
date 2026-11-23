-- ANIMEVERSE: tablas y reglas para la comunidad compartida.
-- Ejecutar en Supabase → SQL Editor → New query → Run.

-- 1. Tablas
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  anime_id text not null,
  author text not null,
  text text not null,
  rating integer not null check (rating between 1 and 10),
  likes integer not null default 0
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author text not null,
  text text not null
);

-- 2. Row Level Security (acceso abierto para esta demo)
alter table public.posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select using (true);

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts for insert with check (true);

drop policy if exists "posts_update" on public.posts;
create policy "posts_update" on public.posts for update using (true) with check (true);

drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete" on public.posts for delete using (true);

drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (true);

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert with check (true);

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments for delete using (true);

-- 3. Realtime para que los nuevos posts aparezcan sin recargar
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

-- 4. Publicaciones de ejemplo (se insertan una sola vez)
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
