create table if not exists public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unique(student_id, subject_id)
);

alter table public.student_subjects enable row level security;

create policy "Anyone can view student subjects"
  on public.student_subjects for select using (true);

create policy "Admins can manage student subjects"
  on public.student_subjects for all
  using (
    exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  );
