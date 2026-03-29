-- ============================================
-- XP & Level System Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add XP/level columns to profiles
alter table profiles add column if not exists xp int not null default 0;
alter table profiles add column if not exists level int not null default 1;

-- 2. Add discount/price tracking to enrollments
alter table enrollments add column if not exists discount_percent numeric not null default 0;
alter table enrollments add column if not exists price_paid numeric;

-- 3. Create XP ledger table
create table if not exists student_xp (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  amount int not null,
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_student_xp_student on student_xp(student_id);

-- 4. RLS for student_xp
alter table student_xp enable row level security;

create policy "Students can view own XP" on student_xp
  for select using (auth.uid() = student_id);

create policy "System can insert XP" on student_xp
  for insert with check (true);

create policy "Admins can manage XP" on student_xp
  for all using (is_admin());

-- 5. Auto-update XP cache on profiles
create or replace function update_student_xp_cache()
returns trigger as $$
declare
  total_xp int;
  new_level int;
begin
  select coalesce(sum(amount), 0) into total_xp
  from student_xp where student_id = new.student_id;

  if total_xp >= 300 then new_level := 3;
  elsif total_xp >= 100 then new_level := 2;
  else new_level := 1;
  end if;

  update profiles set xp = total_xp, level = new_level where id = new.student_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_xp_insert on student_xp;
create trigger on_xp_insert
  after insert on student_xp
  for each row execute function update_student_xp_cache();
