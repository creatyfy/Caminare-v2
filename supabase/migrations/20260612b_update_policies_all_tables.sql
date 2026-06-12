-- =============================================================================
-- Caminare — Migration: policies + grants de UPDATE (dono) p/ edição e soft delete
-- =============================================================================
-- Sintoma: editar crença/emoção/padrão ou excluir registro "não salva" — o
-- UPDATE afeta 0 linhas (RLS sem policy de UPDATE) ou dá permission denied
-- (faltando GRANT UPDATE). Esta migration garante, de forma idempotente, para
-- entries, beliefs, emotions e patterns:
--   1) RLS habilitado;
--   2) policy de UPDATE só para o dono (auth.uid() = user_id);
--   3) GRANT UPDATE ao papel authenticated.
-- Cobre tanto soft delete (deleted_at) quanto edição de conteúdo.
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array['entries', 'beliefs', 'emotions', 'patterns'] loop
    execute format('alter table public.%I enable row level security', t);

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = t || '_update_own'
    ) then
      execute format(
        'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
        t || '_update_own', t
      );
    end if;

    execute format('grant update on public.%I to authenticated', t);
  end loop;
end $$;
