-- =============================================================================
-- Caminare — Migration: vínculo crença→registro + policies de UPDATE (soft delete)
-- =============================================================================
-- 1) Adiciona beliefs.source_entry_id para amarrar a crença ao registro que a
--    gerou (a tela de validação passa a mostrar só as crenças daquele registro).
-- 2) Garante policies de UPDATE para o dono em entries e beliefs — sem elas o
--    soft delete (UPDATE deleted_at) afeta 0 linhas sob RLS e "some" ao recarregar.
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- =============================================================================

-- 1) Coluna de vínculo crença → registro de origem (nullable: crenças avulsas
--    adicionadas manualmente ficam com source_entry_id null).
alter table public.beliefs
  add column if not exists source_entry_id uuid
  references public.entries(id) on delete set null;

create index if not exists beliefs_source_entry_id_idx
  on public.beliefs (source_entry_id);

-- 2) RLS: dono pode atualizar (inclui soft delete via deleted_at) os próprios
--    registros e crenças. Guarda com pg_policies pois CREATE POLICY não aceita
--    IF NOT EXISTS.
alter table public.entries enable row level security;
alter table public.beliefs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'entries'
      and policyname = 'entries_update_own'
  ) then
    create policy "entries_update_own" on public.entries
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'beliefs'
      and policyname = 'beliefs_update_own'
  ) then
    create policy "beliefs_update_own" on public.beliefs
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
