-- =============================================================================
-- Caminare — Migration: auto-criar profile quando um novo usuário se cadastrar
-- =============================================================================
-- Antes desta migration, o profile da pessoa só era criado se algum código no
-- app fizesse INSERT, o que nem sempre acontecia. Resultado: usuários sem
-- linha em public.profiles, o que quebra leituras (getProfile retorna null
-- com fallback) e operações que dependem dela (como is_admin).
--
-- Esta migration cria uma function + trigger que dispara automaticamente
-- toda vez que um novo registro é inserido em auth.users (signup), criando
-- a linha equivalente em public.profiles.
-- =============================================================================

-- 1) Função que cria o profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) Trigger que chama a function após cada novo usuário
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Bonus: criar profile pra usuários EXISTENTES que ainda não têm
-- (corrige histórico, idempotente, não estraga ninguém)
insert into public.profiles (id, full_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
