
-- FINKI Tutors - Final Admin & Booking Fixes
-- ⚠️ WARNING: THIS WILL DROP EXISTING TABLES TO ENSURE EVERYTHING WORKS ⚠️

-- 1. CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.lectures CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.site_config CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS public.booking_type_enum CASCADE;
DROP TYPE IF EXISTS public.booking_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 2. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. ENUMS
create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.booking_status as enum ('pending', 'approved', 'rejected');
create type public.booking_type_enum as enum ('single', 'full');

-- 4. PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role public.user_role default 'student', 
  xp integer default 0,
  level integer default 1,
  credits integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. COURSES
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  code text not null,
  description text,
  professor_id text, -- TEXT to support 'p1' etc
  professor_name text,
  image text,
  price_full integer not null default 6000,
  price_single integer not null default 750,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. LECTURES
create table public.lectures (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  date timestamp with time zone not null,
  duration integer default 90,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. BOOKINGS
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default auth.uid() references public.profiles(id) on delete cascade,
  user_email text, 
  course_id uuid references public.courses(id) on delete cascade,
  course_title text,
  type public.booking_type_enum not null,
  status public.booking_status default 'pending',
  date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. SITE CONFIGURATION
create table public.site_config (
  id integer primary key generated always as identity,
  key text unique not null,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.site_config (key, value) values 
('landing_page', '{
  "heroTitle": "Master your subjects at",
  "heroSubtitle": "Book expert professors for specific lectures or full courses. Flexible pricing designed for students.",
  "statsStudents": "1,200+",
  "statsProfessors": "50+",
  "statsLectures": "3,500+",
  "statsPassRate": "98%"
}'::jsonb)
on conflict (key) do nothing;

-- 9. ACHIEVEMENTS
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  icon text not null,
  xp_reward integer default 100
);

-- 10. SECURITY (Row Level Security)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lectures enable row level security;
alter table public.bookings enable row level security;
alter table public.site_config enable row level security;

-- HELPER FUNCTION: is_admin() - ROBUST VERSION
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'::public.user_role
  );
end;
$$ language plpgsql security definer set search_path = public;

-- POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can update any profile" on public.profiles for update using (public.is_admin());

-- Courses
create policy "Courses viewable by everyone" on public.courses for select using (true);
create policy "Admins/Teachers insert courses" on public.courses for insert with check (
  public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'::public.user_role)
);
create policy "Admins/Teachers update courses" on public.courses for update using (
  public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'::public.user_role)
);

-- Lectures
create policy "Lectures viewable by everyone" on public.lectures for select using (true);
create policy "Admins/Teachers manage lectures" on public.lectures for all using (
  public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'::public.user_role)
);

-- Bookings Policies
-- 1. View: Users see own, Admins/Teachers see all
create policy "Users view own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Teachers/Admins view all bookings" on public.bookings for select using (
  public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'::public.user_role)
);

-- 2. Insert: Authenticated users can insert
create policy "Authenticated users insert bookings" on public.bookings for insert with check (auth.uid() = user_id);

-- 3. Update: Admins/Teachers can update status
create policy "Admins/Teachers update bookings" on public.bookings for update using (
  public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'::public.user_role)
);

-- Config
create policy "Config viewable by everyone" on public.site_config for select using (true);
create policy "Admins update config" on public.site_config for update using (public.is_admin());

-- 11. AUTOMATIC PROFILE CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'student'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 12. DATA RECOVERY & SEEDING

-- Restore Profiles
insert into public.profiles (id, email, full_name, role)
select id, email, raw_user_meta_data->>'full_name', 'student'::public.user_role
from auth.users
where id not in (select id from public.profiles);

-- FIX: Ensure Admin exists and has role
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'gorazd.g.petkovski05@gmail.com';
  
  IF admin_uid IS NOT NULL THEN
    -- Update existing profile if exists
    UPDATE public.profiles SET role = 'admin' WHERE id = admin_uid;
    
    -- Insert if missing (edge case)
    IF NOT FOUND THEN
       INSERT INTO public.profiles (id, email, full_name, role) 
       VALUES (admin_uid, 'gorazd.g.petkovski05@gmail.com', 'Gorazd Admin', 'admin')
       ON CONFLICT (id) DO UPDATE SET role = 'admin';
    END IF;
  END IF;
END $$;


-- Seed Courses
INSERT INTO public.courses (title, code, description, professor_name, professor_id, image, price_full, price_single) VALUES 
('Advanced Programming', 'CS-202', 'Master C++ and Algorithms. Ideal for FINKI and Computer Science students wanting to ace their midterms.', 'Nikola Jankoski', 'p1', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 6000, 750),
('Digital Marketing 101', 'MKT-101', 'Practical marketing strategies, SEO, and Social Media management. Suitable for Economics and Business students.', 'Dragan', 'p2', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 6000, 750),
('Human Anatomy Basics', 'MED-105', 'Comprehensive review of skeletal and muscular systems. Essential for Medical Faculty students.', 'Dr. Sarah Trajkov', 'p3', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 6000, 750);

-- Seed Lectures
DO $$
DECLARE
    course_rec RECORD;
BEGIN
    FOR course_rec IN SELECT id, title FROM public.courses LOOP
        INSERT INTO public.lectures (course_id, title, date, duration) VALUES
        (course_rec.id, 'Session 1: Introduction', NOW() + INTERVAL '1 day', 90),
        (course_rec.id, 'Session 2: Deep Dive', NOW() + INTERVAL '3 days', 90),
        (course_rec.id, 'Session 3: Advanced Concepts', NOW() + INTERVAL '5 days', 90),
        (course_rec.id, 'Session 4: Exam Prep', NOW() + INTERVAL '7 days', 90);
    END LOOP;
END $$;
