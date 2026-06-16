-- =============================================================================
-- Caminare — Migration: GRANT UPDATE nas tabelas editáveis (destrava edição/
--                       exclusão no Histórico e Insights + marcação 'ignored')
-- =============================================================================
-- Sintomas: não dá pra excluir registro no Histórico; no Insights não edita nem
-- exclui crença; emoções/crenças "ignoradas" não contabilizam.
--
-- Causa: faltava o privilégio de tabela GRANT UPDATE para o papel `authenticated`
-- em parte das tabelas → o UPDATE (edição, soft delete via deleted_at, e a
-- marcação validation='ignored') voltava 403. As POLICIES de UPDATE (*_update_own)
-- já existem e estão corretas — é só o GRANT que faltava.
--
-- Idempotente: GRANT pode ser reaplicado sem erro. Reforça o que 20260612b já
-- fazia em loop, de forma explícita, para garantir cobertura das 4 tabelas.
-- =============================================================================

grant update on
  public.entries,
  public.beliefs,
  public.emotions,
  public.patterns
to authenticated;
