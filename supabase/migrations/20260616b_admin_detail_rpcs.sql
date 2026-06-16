-- =============================================================================
-- Caminare — Migration: RPCs admin de detalhe (Emoções, Crenças, Padrões) +
--                       get_admin_stats com contadores 'ignored'
-- =============================================================================
-- Reorganização do painel admin em abas dedicadas. Cada aba precisa de mais que
-- contagens, então criamos RPCs admin-only (SECURITY DEFINER, checando is_admin)
-- que entregam KPIs + quebras por validação/intensidade + rankings.
--
-- 1) get_admin_stats: passa a incluir *_ignored e corrige a contagem de
--    "editadas" (o status real é 'edited', não 'adjusted' — a versão antiga
--    contava 'adjusted' e sempre voltava 0). Casts ::text deixam os SELECTs
--    seguros tanto se `validation` for ENUM quanto TEXT, e não quebram se o
--    valor 'ignored' ainda não existir no enum/CHECK (apenas conta 0).
-- 2) get_admin_emotions(p_since): KPIs + quebra por intensidade + "mais
--    frequentes" (ranking global por nome).
-- 3) get_admin_beliefs(p_since): KPIs + "crenças recorrentes" (por ocorrência).
-- 4) get_admin_patterns(p_since): KPIs + lista de padrões detectados.
--
-- p_since (timestamptz, default null) = início da janela de período (7/30/90
-- dias ou null = tudo). Filtra por created_at (emoções), last_seen_at (crenças)
-- e last_updated_at (padrões).
--
-- Idempotente (create or replace). Aplicar DEPOIS de 20260616 (que adiciona o
-- valor 'ignored'); ainda assim, as contagens usam ::text e não quebram se a
-- migration de enum não tiver rodado.
--
-- OBS: `categoria` (crenças) e `severidade` (padrões) NÃO são persistidas hoje
-- (a IA retorna, mas não há coluna). As RPCs devolvem severity como null; se o
-- cliente quiser usar, criar coluna e gravar nos endpoints (ver memória do
-- projeto). Por isso "por categoria" em crenças fica como opcional/futuro.
-- =============================================================================


-- 1) get_admin_stats — agora com *_ignored e "editadas" corretas ('edited').
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  is_caller_admin boolean;
begin
  select coalesce(is_admin, false) into is_caller_admin
  from public.profiles where id = auth.uid();

  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select json_build_object(
    -- Usuários
    'total_users', (select count(*) from public.profiles where deleted_at is null),
    'users_trial', 0,
    'users_active', 0,
    'subs_annual_active', 0,
    'subs_monthly_active', 0,
    'users_apple', 0,
    'users_google', 0,

    -- Engajamento
    'total_entries', (select count(*) from public.entries where deleted_at is null),
    'avg_weekly_entries_per_user', coalesce(
      (
        select count(*)::numeric
        from public.entries
        where deleted_at is null and created_at > now() - interval '28 days'
      )
      / nullif(
        (
          select count(distinct user_id)
          from public.entries
          where deleted_at is null and created_at > now() - interval '28 days'
        ), 0
      ) / 4.0,
      0
    ),

    -- Emoções
    'emotions_total', (select count(*) from public.emotions),
    'emotions_confirmed', (select count(*) from public.emotions where validation::text = 'confirmed'),
    'emotions_rejected', (select count(*) from public.emotions where validation::text = 'rejected'),
    'emotions_adjusted', (select count(*) from public.emotions where validation::text = 'edited'),
    'emotions_ignored', (select count(*) from public.emotions where validation::text = 'ignored'),

    -- Pensamentos (sem tracking individual hoje)
    'thoughts_total', 0,
    'thoughts_confirmed', 0,
    'thoughts_rejected', 0,
    'thoughts_adjusted', 0,
    'thoughts_ignored', 0,

    -- Crenças
    'beliefs_total', (select count(*) from public.beliefs where deleted_at is null),
    'beliefs_confirmed', (select count(*) from public.beliefs where validation::text = 'confirmed'),
    'beliefs_rejected', (select count(*) from public.beliefs where validation::text = 'rejected'),
    'beliefs_adjusted', (select count(*) from public.beliefs where validation::text = 'edited'),
    'beliefs_ignored', (select count(*) from public.beliefs where validation::text = 'ignored'),

    -- Padrões
    'patterns_total', (select count(*) from public.patterns where deleted_at is null),
    'patterns_confirmed', (select count(*) from public.patterns where validation::text = 'confirmed'),
    'patterns_rejected', (select count(*) from public.patterns where validation::text = 'rejected'),
    'patterns_adjusted', (select count(*) from public.patterns where validation::text = 'edited'),
    'patterns_ignored', (select count(*) from public.patterns where validation::text = 'ignored'),

    -- Sugestões dos usuários
    'feedback_total', (select count(*) from public.feedback),
    'feedback_new', (select count(*) from public.feedback where status = 'new'),
    'feedback_read', (select count(*) from public.feedback where status = 'read'),
    'feedback_resolved', (select count(*) from public.feedback where status = 'resolved')
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_admin_stats() to authenticated;


-- 2) get_admin_emotions — KPIs + intensidade + mais frequentes
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_emotions(p_since timestamptz default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  is_caller_admin boolean;
begin
  select coalesce(is_admin, false) into is_caller_admin
  from public.profiles where id = auth.uid();
  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select json_build_object(
    'total',     (select count(*) from public.emotions e where (p_since is null or e.created_at >= p_since)),
    'confirmed', (select count(*) from public.emotions e where validation::text = 'confirmed' and (p_since is null or e.created_at >= p_since)),
    'rejected',  (select count(*) from public.emotions e where validation::text = 'rejected'  and (p_since is null or e.created_at >= p_since)),
    'edited',    (select count(*) from public.emotions e where validation::text = 'edited'    and (p_since is null or e.created_at >= p_since)),
    'ignored',   (select count(*) from public.emotions e where validation::text = 'ignored'   and (p_since is null or e.created_at >= p_since)),
    'by_intensity', json_build_object(
      'subtle',      (select count(*) from public.emotions e where intensity::text = 'subtle'      and (p_since is null or e.created_at >= p_since)),
      'moderate',    (select count(*) from public.emotions e where intensity::text = 'moderate'    and (p_since is null or e.created_at >= p_since)),
      'strong',      (select count(*) from public.emotions e where intensity::text = 'strong'      and (p_since is null or e.created_at >= p_since)),
      'very_strong', (select count(*) from public.emotions e where intensity::text = 'very_strong' and (p_since is null or e.created_at >= p_since))
    ),
    'top', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select e.name as name, count(*)::int as count
        from public.emotions e
        where (p_since is null or e.created_at >= p_since)
        group by e.name
        order by count(*) desc, e.name asc
        limit 20
      ) t
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_admin_emotions(timestamptz) to authenticated;


-- 3) get_admin_beliefs — KPIs + crenças recorrentes (por ocorrência)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_beliefs(p_since timestamptz default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  is_caller_admin boolean;
begin
  select coalesce(is_admin, false) into is_caller_admin
  from public.profiles where id = auth.uid();
  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select json_build_object(
    'total',     (select count(*) from public.beliefs b where b.deleted_at is null and (p_since is null or b.last_seen_at >= p_since)),
    'confirmed', (select count(*) from public.beliefs b where b.deleted_at is null and validation::text = 'confirmed' and (p_since is null or b.last_seen_at >= p_since)),
    'rejected',  (select count(*) from public.beliefs b where b.deleted_at is null and validation::text = 'rejected'  and (p_since is null or b.last_seen_at >= p_since)),
    'edited',    (select count(*) from public.beliefs b where b.deleted_at is null and validation::text = 'edited'    and (p_since is null or b.last_seen_at >= p_since)),
    'ignored',   (select count(*) from public.beliefs b where b.deleted_at is null and validation::text = 'ignored'   and (p_since is null or b.last_seen_at >= p_since)),
    'recurrent', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select b.content as content, b.occurrence_count as occurrence_count, b.validation::text as validation
        from public.beliefs b
        where b.deleted_at is null
          and validation::text <> 'rejected'
          and (p_since is null or b.last_seen_at >= p_since)
        order by b.occurrence_count desc, b.last_seen_at desc
        limit 20
      ) t
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_admin_beliefs(timestamptz) to authenticated;


-- 4) get_admin_patterns — KPIs + lista de padrões detectados
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_patterns(p_since timestamptz default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  is_caller_admin boolean;
begin
  select coalesce(is_admin, false) into is_caller_admin
  from public.profiles where id = auth.uid();
  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select json_build_object(
    'total',     (select count(*) from public.patterns p where p.deleted_at is null and (p_since is null or p.last_updated_at >= p_since)),
    'confirmed', (select count(*) from public.patterns p where p.deleted_at is null and validation::text = 'confirmed' and (p_since is null or p.last_updated_at >= p_since)),
    'rejected',  (select count(*) from public.patterns p where p.deleted_at is null and validation::text = 'rejected'  and (p_since is null or p.last_updated_at >= p_since)),
    'edited',    (select count(*) from public.patterns p where p.deleted_at is null and validation::text = 'edited'    and (p_since is null or p.last_updated_at >= p_since)),
    'ignored',   (select count(*) from public.patterns p where p.deleted_at is null and validation::text = 'ignored'   and (p_since is null or p.last_updated_at >= p_since)),
    'list', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select
          p.description as description,
          p.occurrence_count as occurrence_count,
          p.validation::text as validation,
          null::text as severity   -- severidade não é persistida hoje
        from public.patterns p
        where p.deleted_at is null
          and (p_since is null or p.last_updated_at >= p_since)
        order by p.occurrence_count desc, p.last_updated_at desc
        limit 50
      ) t
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_admin_patterns(timestamptz) to authenticated;
