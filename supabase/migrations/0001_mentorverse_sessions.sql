create extension if not exists "pgcrypto";

create table if not exists public.mentorverse_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  topic text not null,
  answer text,
  confidence numeric not null default 0,
  score integer not null default 0,
  response_time integer,
  weak_topics text[] not null default '{}',
  strong_topics text[] not null default '{}',
  question text,
  feedback text,
  level text not null default 'medium',
  created_at timestamptz not null default now()
);

alter table public.mentorverse_sessions enable row level security;

create index if not exists mentorverse_sessions_user_id_idx
  on public.mentorverse_sessions (user_id);

create index if not exists mentorverse_sessions_topic_idx
  on public.mentorverse_sessions (topic);

create index if not exists mentorverse_sessions_created_at_idx
  on public.mentorverse_sessions (created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'mentorverse_sessions'
      and policyname = 'MentorVerse service role can manage sessions'
  ) then
    create policy "MentorVerse service role can manage sessions"
      on public.mentorverse_sessions
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'mentorverse_sessions'
      and policyname = 'Authenticated users can read their own sessions'
  ) then
    create policy "Authenticated users can read their own sessions"
      on public.mentorverse_sessions
      for select
      to authenticated
      using (user_id = auth.uid()::text);
  end if;
end $$;
