-- =============================================================================
-- Caminare — Migration: tabela feedback + painel de admin
-- =============================================================================
-- Rode esta migration no SQL Editor do Supabase (Studio > SQL Editor > New
-- query) UMA VEZ. Ela é idempotente, então pode ser rodada de novo sem
-- estragar nada se você já tiver criado parte do schema.
--
-- Depois de rodar, marque seu próprio usuário como admin (instruções no
-- final do arquivo).
-- =============================================================================


-- 1) Tabela de feedback (canal de sugestões dentro do app)
-- -----------------------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  status text not null default 'new' check (status in ('new','read','resolved')),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own"
  on public.feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "feedback_select_own" on public.feedback;
create policy "feedback_select_own"
  on public.feedback for select
  to authenticated
  using (auth.uid() = user_id);

create index if not exists feedback_user_id_idx on public.feedback (user_id);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx on public.feedback (status);


-- 2) Flag de administrador em profiles
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean default false;


-- 3) Função: estatísticas do painel de admin
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
    'total_users', (
      select count(*) from public.profiles where deleted_at is null
    ),
    'users_trial', 0,             -- depende do módulo de assinatura
    'users_active', 0,            -- depende do módulo de assinatura
    'subs_annual_active', 0,      -- depende do módulo de assinatura
    'subs_monthly_active', 0,     -- depende do módulo de assinatura
    'users_apple', 0,             -- depende da integração com as lojas
    'users_google', 0,            -- depende da integração com as lojas

    -- Engajamento
    'total_entries', (
      select count(*) from public.entries where deleted_at is null
    ),
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
    'emotions_confirmed', (select count(*) from public.emotions where validation = 'confirmed'),
    'emotions_rejected', (select count(*) from public.emotions where validation = 'rejected'),
    'emotions_adjusted', (select count(*) from public.emotions where validation = 'adjusted'),

    -- Pensamentos (placeholder: hoje pensamentos vivem em arrays JSON dentro
    -- de entry_analysis_logs; não há tracking por-pensamento. Quando criarmos
    -- a tabela de validação individual, atualizar estes selects.)
    'thoughts_total', 0,
    'thoughts_confirmed', 0,
    'thoughts_rejected', 0,
    'thoughts_adjusted', 0,

    -- Crenças
    'beliefs_total', (select count(*) from public.beliefs where deleted_at is null),
    'beliefs_confirmed', (select count(*) from public.beliefs where validation = 'confirmed'),
    'beliefs_rejected', (select count(*) from public.beliefs where validation = 'rejected'),
    'beliefs_adjusted', (select count(*) from public.beliefs where validation = 'adjusted'),

    -- Padrões
    'patterns_total', (select count(*) from public.patterns where deleted_at is null),
    'patterns_confirmed', (select count(*) from public.patterns where validation = 'confirmed'),
    'patterns_rejected', (select count(*) from public.patterns where validation = 'rejected'),
    'patterns_adjusted', (select count(*) from public.patterns where validation = 'adjusted'),

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


-- 4) Função: lista de sugestões (com filtro opcional por status)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_feedback(p_status text default null)
returns table (
  id uuid,
  user_id uuid,
  message text,
  status text,
  created_at timestamptz,
  user_email text,
  user_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  is_caller_admin boolean;
begin
  select coalesce(is_admin, false) into is_caller_admin
  from public.profiles where id = auth.uid();

  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select
    f.id,
    f.user_id,
    f.message,
    f.status,
    f.created_at,
    u.email::text as user_email,
    p.full_name as user_name
  from public.feedback f
  left join auth.users u on u.id = f.user_id
  left join public.profiles p on p.id = f.user_id
  where (p_status is null or f.status = p_status)
  order by f.created_at desc;
end;
$$;

grant execute on function public.get_admin_feedback(text) to authenticated;


-- 5) Função: atualizar status de uma sugestão (somente admin)
-- -----------------------------------------------------------------------------
create or replace function public.update_feedback_status(
  p_feedback_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_caller_admin boolean;
begin
  select coalesce(is_admin, false) into is_caller_admin
  from public.profiles where id = auth.uid();

  if not coalesce(is_caller_admin, false) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_status not in ('new', 'read', 'resolved') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;

  update public.feedback set status = p_status where id = p_feedback_id;
end;
$$;

grant execute on function public.update_feedback_status(uuid, text) to authenticated;


-- =============================================================================
-- COMO TORNAR UM USUÁRIO ADMIN
-- =============================================================================
-- 1) Crie a conta normalmente no app (faça o cadastro).
-- 2) No SQL Editor do Supabase, rode (trocando o email):
--
--    update public.profiles set is_admin = true
--    where id = (select id from auth.users where email = 'voce@exemplo.com');
--
-- 3) Para conferir os admins atuais:
--
--    select p.id, u.email, p.is_admin
--    from public.profiles p
--    join auth.users u on u.id = p.id
--    where p.is_admin = true;
--
-- 4) Acesse /admin no app logado com essa conta.
-- =============================================================================
