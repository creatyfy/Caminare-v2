-- =============================================================================
-- Caminare — Migration: função get_admin_users() para o painel admin
-- =============================================================================
-- Retorna a lista de usuários cadastrados pra exibir na aba Usuários do
-- painel admin. Só admins conseguem chamar (security definer + check de
-- is_admin na entrada).
--
-- Inclui contagem de registros por usuário pra dar uma noção rápida de
-- quem está ativo.
-- =============================================================================

create or replace function public.get_admin_users()
returns table (
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamptz,
  entries_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  is_caller_admin boolean;
begin
  select coalesce(profiles.is_admin, false) into is_caller_admin
  from public.profiles where profiles.id = auth.uid();

  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.full_name,
    coalesce(p.is_admin, false) as is_admin,
    u.created_at,
    (
      select count(*)::bigint
      from public.entries e
      where e.user_id = u.id and e.deleted_at is null
    ) as entries_count
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

grant execute on function public.get_admin_users() to authenticated;
