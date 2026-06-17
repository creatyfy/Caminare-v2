-- =============================================================================
-- Caminare — Migration: Fase 4 (backend de IAP — validação + webhooks)
-- =============================================================================
-- ADITIVA e idempotente. NÃO recria a tabela subscriptions (criada no Studio).
-- Aplicar À MÃO no SQL Editor do projeto xyflfmmlfylxrxtkjrbz (Vercel não roda
-- migrations). As Edge/Serverless functions de IAP degradam com segurança se
-- esta migration ainda não tiver sido aplicada (tratam 42703/42P01), então a
-- ordem de deploy é flexível — mas o ideal é aplicar antes de ligar as lojas.
--
-- O que faz:
--   1) coluna subscriptions.source ('apple'|'google') — de onde veio a assinatura;
--   2) tabela iap_events — dedup idempotente das notificações de webhook;
--   3) RLS em iap_events trancada (só o service role escreve; ninguém lê via API).
-- =============================================================================

-- 1) Origem da assinatura -----------------------------------------------------
alter table public.subscriptions
  add column if not exists source text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscriptions_source_check'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_source_check
      check (source is null or source in ('apple', 'google'));
  end if;
end $$;

-- 2) Dedup de eventos de webhook (idempotência) -------------------------------
create table if not exists public.iap_events (
  event_id   text primary key,           -- Apple notificationUUID / Google messageId
  platform   text not null check (platform in ('apple', 'google')),
  type       text,                        -- notificationType / kind
  created_at timestamptz not null default now()
);

-- 3) RLS: tabela é interna (só service role). Ligada e SEM policies = nega tudo
--    pro anon/authenticated; o service role ignora RLS. Não há GRANT pro
--    authenticated de propósito.
alter table public.iap_events enable row level security;

-- Limpeza opcional (housekeeping): manter só ~90 dias de eventos.
-- (Rodar manualmente ou via cron/pg_cron se quiser — não é obrigatório.)
-- delete from public.iap_events where created_at < now() - interval '90 days';
