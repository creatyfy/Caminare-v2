-- =============================================================================
-- Idioma do registro.
-- -----------------------------------------------------------------------------
-- Guarda o idioma (BCP-47, ex.: 'pt-BR', 'es-ES') de cada entrada. É a fonte de
-- verdade do idioma da transcrição e do idioma em que a IA gera emoções,
-- crenças, padrões e insights daquele registro — separado do idioma da interface
-- do app (que segue sendo só PT/EN).
--
-- Seguro de reaplicar (IF NOT EXISTS). O código degrada sem a coluna
-- (createTextEntry trata 42703), então a ordem de deploy não quebra nada.
-- =============================================================================

alter table public.entries add column if not exists language text;
