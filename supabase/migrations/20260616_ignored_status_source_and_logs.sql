-- =============================================================================
-- Caminare — Migration: status 'ignored', origem (ai/manual), dispensas de
--                       padrão e log bruto de crenças sugeridas por registro
-- =============================================================================
-- Objetivo (fidelidade de treino): por relato, saber o que a IA sugeriu e o que
-- o usuário fez com CADA item — confirmed | edited | rejected | ignored — sem
-- perder nada, distinguindo sugestão da IA de adição manual.
--
-- 1) Acrescenta o valor 'ignored' ao enum de `validation` de emotions, beliefs e
--    patterns (item não tocado ao avançar = ignorado, ≠ rejeitado).
-- 2) Adiciona `source` ('ai' | 'manual') em emotions e beliefs.
-- 3) Adiciona `dismiss_count` em patterns (nº de vezes que o modal foi adiado;
--    ao atingir o limite a app marca o padrão como 'ignored').
-- 4) Cria `entry_belief_logs`: JSON bruto do conjunto de crenças sugeridas por
--    registro (espelha entry_analysis_logs.raw_response), para não perder o que
--    a IA propôs mesmo quando a sugestão é deduplicada e não vira card.
--
-- Idempotente: pode rodar mais de uma vez sem erro.
--
-- OBS p/ o dev: o schema das tabelas de IA (emotions/beliefs/patterns) foi criado
-- no Studio, não nas migrations. Este bloco assume que `validation` é um ENUM
-- (como `intensity` → emotion_intensity). Se no seu schema `validation` for um
-- CHECK constraint em texto, o passo (1) não faz efeito — nesse caso ajuste o
-- CHECK manualmente para incluir 'ignored'. O código da app é resiliente: se o
-- enum ainda não tiver 'ignored', o update de "ignorado" apenas não persiste
-- (não quebra o fluxo) até esta migration ser aplicada.
-- =============================================================================

-- 1) Enum de validation: adiciona 'ignored' a cada tipo enum que respalda a
--    coluna `validation` das três tabelas (descobre o nome do tipo em runtime).
do $$
declare
  tbl text;
  enum_type text;
begin
  foreach tbl in array array['emotions', 'beliefs', 'patterns'] loop
    select t.typname into enum_type
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_type t on t.oid = a.atttypid
    where n.nspname = 'public'
      and c.relname = tbl
      and a.attname = 'validation'
      and t.typtype = 'e';

    if enum_type is not null then
      if not exists (
        select 1 from pg_enum e
        join pg_type t on t.oid = e.enumtypid
        where t.typname = enum_type and e.enumlabel = 'ignored'
      ) then
        execute format('alter type public.%I add value %L', enum_type, 'ignored');
      end if;
    end if;

    enum_type := null;
  end loop;
end $$;

-- 2) Origem do item: 'ai' (sugerido pelos endpoints) x 'manual' (adicionado pelo
--    usuário). Default 'ai' — o que vem da IA é a maioria; o código grava
--    'manual' explicitamente em addEntryEmotion/addBelief.
alter table public.emotions
  add column if not exists source text not null default 'ai';
alter table public.beliefs
  add column if not exists source text not null default 'ai';

-- 3) Contador de adiamentos do modal de padrão na home. Ao atingir o limite da
--    app (PATTERN_DISMISS_LIMIT), o padrão é marcado como validation='ignored'.
alter table public.patterns
  add column if not exists dismiss_count integer not null default 0;

-- 4) Log bruto das crenças sugeridas por registro (treino). Espelha o papel de
--    entry_analysis_logs.raw_response, mas para a etapa de crenças. Gravado pelo
--    endpoint com service role; o usuário (dono) pode ler o próprio log.
create table if not exists public.entry_belief_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  raw_response text not null,
  ai_model text,
  created_at timestamptz not null default now()
);

create index if not exists entry_belief_logs_entry_id_idx
  on public.entry_belief_logs (entry_id);

alter table public.entry_belief_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'entry_belief_logs'
      and policyname = 'entry_belief_logs_select_own'
  ) then
    create policy "entry_belief_logs_select_own" on public.entry_belief_logs
      for select using (auth.uid() = user_id);
  end if;
end $$;

grant select on public.entry_belief_logs to authenticated;
