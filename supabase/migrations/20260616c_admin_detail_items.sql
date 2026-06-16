-- =============================================================================
-- Caminare — Migration: abas de detalhe do admin passam a expor os ITENS
--                       (separáveis por status), não só contagens/ranking.
-- =============================================================================
-- Complementa 20260616b. Aplicar DEPOIS dela (ou sozinha — usa create or
-- replace e só toca get_admin_beliefs e get_admin_emotions).
--
-- 1) get_admin_beliefs: deixa de excluir rejeitadas e de limitar a 20. Agora
--    retorna `items` com TODAS as crenças do período (todos os status), cada
--    uma com content, content_original, validation, occurrence_count e
--    last_seen_at — o front filtra por status e mostra "antes → depois" nas
--    editadas. Mantém os KPIs (total/confirmed/rejected/edited/ignored).
-- 2) get_admin_emotions: além do `top` geral, adiciona `items` agrupado por
--    (name, validation) com a contagem — o front monta o ranking de nomes
--    dentro do status escolhido (ex.: "emoções mais rejeitadas").
--
-- get_admin_patterns já retorna todos os status com `validation` na lista
-- (20260616b), então não precisa mudar aqui.
--
-- Mantém o check is_admin (security definer) e os grants.
-- Casts ::text seguem seguros para enum OU text+check.
-- =============================================================================


-- 1) get_admin_beliefs — todos os status + texto original
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
    'items', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select
          b.content as content,
          b.content_original as content_original,
          b.validation::text as validation,
          b.occurrence_count as occurrence_count,
          b.last_seen_at as last_seen_at
        from public.beliefs b
        where b.deleted_at is null
          and (p_since is null or b.last_seen_at >= p_since)
        order by b.occurrence_count desc, b.last_seen_at desc
        limit 500
      ) t
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_admin_beliefs(timestamptz) to authenticated;


-- 2) get_admin_emotions — KPIs + intensidade + top geral + items por status
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
    ),
    'items', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select e.name as name, e.validation::text as validation, count(*)::int as count
        from public.emotions e
        where (p_since is null or e.created_at >= p_since)
        group by e.name, e.validation::text
        order by count(*) desc, e.name asc
        limit 500
      ) t
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_admin_emotions(timestamptz) to authenticated;
