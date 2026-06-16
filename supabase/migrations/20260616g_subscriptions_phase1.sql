-- =============================================================================
-- Caminare — Migration: Fase 1 de assinatura/trial/limites (sem IAP ainda)
-- =============================================================================
-- A tabela public.subscriptions JÁ EXISTIA (criada no Studio), com enums
-- subscription_status (trial|active|past_due|canceled|expired) e subscription_plan
-- (monthly|annual = CADÊNCIA, p/ IAP na Fase 2), + trial_ends_at,
-- current_period_start/end, external_id. Esta migration é ADITIVA:
--   1) enum subscription_tier (basico|avancado) + coluna `tier` → define o limite
--      mensal (Básico 150 / Avançado 250), separado da cadência;
--   2) GRANT SELECT pro authenticated (a policy "select own" já existia, faltava grant);
--   3) handle_new_user passa a criar a linha de assinatura em trial no signup
--      (antes só criava profile; trial_ends_at usa o default now()+15d);
--   4) RPC dev_set_subscription (admin) p/ simular estados no teste de navegador.
--
-- Já aplicada via MCP no projeto xyflfmmlfylxrxtkjrbz (migration
-- "subscriptions_phase1_entitlement"). Mantida aqui p/ versionamento.
-- =============================================================================

-- 1) Tier (limite) separado da cadência (cobrança) ------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_tier') then
    create type public.subscription_tier as enum ('basico', 'avancado');
  end if;
end $$;

alter table public.subscriptions
  add column if not exists tier public.subscription_tier;

-- 2) Usuário lê a própria assinatura (policy já existia; faltava o GRANT) ----
grant select on public.subscriptions to authenticated;

-- 3) Signup cria profile + assinatura em trial -----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- 4) RPC de teste (admin): força o estado da PRÓPRIA assinatura ------------
create or replace function public.dev_set_subscription(
  p_status        text        default null,
  p_plan          text        default null,
  p_tier          text        default null,
  p_trial_ends_at timestamptz default null,
  p_period_end    timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_is_admin boolean;
begin
  select coalesce(is_admin, false) into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'apenas admin pode usar dev_set_subscription';
  end if;

  insert into public.subscriptions (user_id, status, plan, tier, trial_ends_at, current_period_end)
  values (
    auth.uid(),
    coalesce(p_status::public.subscription_status, 'trial'),
    p_plan::public.subscription_plan,
    p_tier::public.subscription_tier,
    coalesce(p_trial_ends_at, now() + interval '15 days'),
    p_period_end
  )
  on conflict (user_id) do update set
    status             = coalesce(p_status::public.subscription_status, public.subscriptions.status),
    plan               = p_plan::public.subscription_plan,
    tier               = p_tier::public.subscription_tier,
    trial_ends_at      = coalesce(p_trial_ends_at, public.subscriptions.trial_ends_at),
    current_period_end = p_period_end,
    updated_at         = now();
end;
$$;

grant execute on function public.dev_set_subscription(text, text, text, timestamptz, timestamptz) to authenticated;
