-- ANIMEVERSE V4 — arreglo opcional para bases de datos antiguas
-- La web ya funciona sin ejecutar esto. Solo úsalo si quieres que la columna
-- `anime_id` acepte publicaciones sin anime de forma nativa.
-- Supabase → SQL Editor → New query → pegar → Run → Success.

do $$
begin
  alter table public.posts alter column anime_id drop not null;
exception when undefined_column then null;
end $$;

do $$
begin
  alter table public.posts alter column text drop not null;
exception when undefined_column then null;
end $$;

do $$
begin
  alter table public.posts alter column author drop not null;
exception when undefined_column then null;
end $$;

do $$
begin
  alter table public.posts alter column rating drop not null;
exception when undefined_column then null;
end $$;
