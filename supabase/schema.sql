-- Laila — Nosso Mapa de Comidas v6
-- Execute no SQL Editor do Supabase antes de publicar o site.
-- Pode executar novamente se você já tiver rodado uma versão antiga deste arquivo.

create extension if not exists pgcrypto;

create table if not exists public.food_responses (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null unique,
  respondent text not null default 'Laila',
  project_version integer not null default 6,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.food_responses
  alter column project_version set default 6;

alter table public.food_responses enable row level security;

-- O site público só pode INSERIR. Não pode listar, editar nem apagar respostas.
revoke all on table public.food_responses from anon, authenticated;
grant insert on table public.food_responses to anon, authenticated;
grant all on table public.food_responses to service_role;

-- Remove policies antigas, caso você tenha testado versões anteriores.
drop policy if exists "public_can_insert_laila_food_map_v3" on public.food_responses;
drop policy if exists "public_can_insert_laila_food_map_v4" on public.food_responses;
drop policy if exists "public_can_insert_laila_food_map_v5" on public.food_responses;
drop policy if exists "public_can_insert_laila_food_map_v6" on public.food_responses;

create policy "public_can_insert_laila_food_map_v6"
on public.food_responses
for insert
to anon, authenticated
with check (
  respondent = 'Laila'
  and project_version = 6
  and jsonb_typeof(payload) = 'object'
  and payload->>'project' = 'laila-food-map'
  and payload->>'version' = '6'
  and pg_column_size(payload) < 500000
);

create index if not exists food_responses_created_at_idx
  on public.food_responses(created_at desc);

create index if not exists food_responses_payload_gin_idx
  on public.food_responses using gin(payload);

-- Não existe policy pública de SELECT, UPDATE ou DELETE.
-- Você lê as respostas pelo Dashboard do Supabase, autenticado na sua conta.
