create table if not exists public.mentorverse_code_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  problem_id text not null,
  problem_title text not null,
  topic text not null,
  language text not null,
  version text not null,
  score integer not null default 0,
  passed boolean not null default false,
  output text,
  error text,
  ai_feedback text,
  created_at timestamptz not null default now()
);

alter table public.mentorverse_code_submissions enable row level security;

create index if not exists mentorverse_code_submissions_user_id_idx
  on public.mentorverse_code_submissions (user_id);

create index if not exists mentorverse_code_submissions_created_at_idx
  on public.mentorverse_code_submissions (created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'mentorverse_code_submissions'
      and policyname = 'MentorVerse service role can manage code submissions'
  ) then
    create policy "MentorVerse service role can manage code submissions"
      on public.mentorverse_code_submissions
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
      and tablename = 'mentorverse_code_submissions'
      and policyname = 'Authenticated users can read their own code submissions'
  ) then
    create policy "Authenticated users can read their own code submissions"
      on public.mentorverse_code_submissions
      for select
      to authenticated
      using (user_id = auth.uid()::text);
  end if;
end $$;
