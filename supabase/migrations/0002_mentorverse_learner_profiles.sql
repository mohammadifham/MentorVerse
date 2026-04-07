create table if not exists public.mentorverse_learner_profiles (
  user_id text primary key,
  name text not null,
  phone text not null,
  email text not null,
  course text not null,
  profile_dp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mentorverse_learner_profiles enable row level security;

create index if not exists mentorverse_learner_profiles_email_idx
  on public.mentorverse_learner_profiles (email);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'mentorverse_learner_profiles'
      and policyname = 'MentorVerse service role can manage learner profiles'
  ) then
    create policy "MentorVerse service role can manage learner profiles"
      on public.mentorverse_learner_profiles
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
      and tablename = 'mentorverse_learner_profiles'
      and policyname = 'Authenticated users can read their own learner profile'
  ) then
    create policy "Authenticated users can read their own learner profile"
      on public.mentorverse_learner_profiles
      for select
      to authenticated
      using (user_id = auth.uid()::text);
  end if;
end $$;
