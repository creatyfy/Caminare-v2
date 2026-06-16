-- =============================================================================
-- Caminare — Migration: policy de SELECT com `deleted_at IS NULL` bloqueava o
--                       soft delete (UPDATE deleted_at) → 403 / 42501
-- =============================================================================
-- Sintoma: excluir registro no Histórico (entries) e editar/excluir crença ou
-- padrão no Insights (beliefs/patterns) voltava
--   42501: new row violates row-level security policy for table "<tabela>"
-- mesmo com GRANT UPDATE e policy de UPDATE corretos (auth.uid() = user_id).
--
-- Causa (confirmada reproduzindo no banco como o próprio usuário): a policy de
-- SELECT exigia `auth.uid() = user_id AND deleted_at IS NULL`. Ao gravar
-- `deleted_at = now()`, a linha "nova" deixa de satisfazer essa condição e o
-- Postgres derruba o UPDATE. Atualizar qualquer outra coluna (ex.: processing_
-- status) funcionava — só o soft delete quebrava. `emotions` não tinha essa
-- condição no SELECT (e "exclui" via validation='ignored'), por isso não falhava.
--
-- Fix: remover `deleted_at IS NULL` da policy de SELECT. A restrição de dono
-- (auth.uid() = user_id) permanece, e o app já filtra `.is('deleted_at', null)`
-- em todas as leituras (Histórico, Insights, contadores) — então os excluídos
-- continuam ocultos na UI; o RLS só deixa de bloquear a gravação do deleted_at.
--
-- ATENÇÃO: aplicar à mão no SQL Editor do projeto Supabase (xyflfmmlfylxrxtkjrbz).
-- O deploy do Vercel NÃO roda migrations.
-- =============================================================================

alter policy "entries: select own"  on public.entries  using (auth.uid() = user_id);
alter policy "beliefs: select own"  on public.beliefs  using (auth.uid() = user_id);
alter policy "patterns: select own" on public.patterns using (auth.uid() = user_id);
