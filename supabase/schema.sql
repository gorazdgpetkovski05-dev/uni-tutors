-- ============================================
-- UniTutors MK - Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

create type user_role as enum ('student', 'professor', 'admin');
create type enrollment_status as enum ('pending', 'approved', 'rejected', 'completed', 'cancelled');
create type session_status as enum ('scheduled', 'completed', 'missed', 'cancelled');
create type course_status as enum ('draft', 'published', 'archived');
create type ticket_status as enum ('pending', 'in_review', 'approved', 'rejected');
create type support_ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type support_ticket_priority as enum ('low', 'medium', 'high');
create type notification_type as enum (
  'booking_request', 'booking_approved', 'booking_rejected', 'booking_completed',
  'review_received', 'ticket_update', 'course_proposal', 'support_ticket', 'general'
);

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'student',
  full_name text not null default '',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- PROFESSORS
-- ============================================

create table professors (
  id uuid references profiles(id) on delete cascade primary key,
  specialty text not null default '',
  custom_tag text,
  created_at timestamptz not null default now()
);

-- ============================================
-- COURSES
-- ============================================

create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  code text not null,
  description text not null default '',
  professor_id uuid references professors(id) on delete set null,
  image text,
  university text,
  price_full numeric not null default 0,
  price_single numeric not null default 0,
  custom_price_display text,
  status course_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- CURRICULUM ITEMS
-- ============================================

create table curriculum_items (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  sort_order int not null default 0
);

-- ============================================
-- MIDTERMS
-- ============================================

create table midterms (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  sessions int,
  price numeric not null default 0
);

-- ============================================
-- ENROLLMENTS (Booking Requests)
-- ============================================

create table enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  status enrollment_status not null default 'pending',
  booking_type text not null default 'full', -- 'single', 'full', 'midterm'
  message text,
  discord_link text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- SESSIONS (Tracking)
-- ============================================

create table sessions (
  id uuid default uuid_generate_v4() primary key,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  status session_status not null default 'scheduled',
  title text,
  notes text,
  session_date timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- REVIEWS
-- ============================================

create table reviews (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  professor_id uuid references professors(id) on delete cascade not null,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(enrollment_id) -- one review per enrollment
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type notification_type not null default 'general',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- ============================================
-- COURSE PROPOSAL TICKETS (Professors)
-- ============================================

create table course_proposals (
  id uuid default uuid_generate_v4() primary key,
  professor_id uuid references professors(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  course_code text,
  university text,
  status ticket_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- SUPPORT TICKETS (All Users)
-- ============================================

create table support_tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  subject text not null,
  description text not null default '',
  status support_ticket_status not null default 'open',
  priority support_ticket_priority not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table support_ticket_messages (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references support_tickets(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- VIEWS: Professor average rating
-- ============================================

create or replace view professor_ratings as
select
  professor_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*) as review_count
from reviews
group by professor_id;

-- ============================================
-- INDEXES
-- ============================================

create index idx_enrollments_student on enrollments(student_id);
create index idx_enrollments_course on enrollments(course_id);
create index idx_enrollments_status on enrollments(status);
create index idx_sessions_enrollment on sessions(enrollment_id);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(user_id, read);
create index idx_reviews_course on reviews(course_id);
create index idx_reviews_professor on reviews(professor_id);
create index idx_courses_status on courses(status);
create index idx_courses_professor on courses(professor_id);
create index idx_support_tickets_user on support_tickets(user_id);
create index idx_course_proposals_professor on course_proposals(professor_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table professors enable row level security;
alter table courses enable row level security;
alter table curriculum_items enable row level security;
alter table midterms enable row level security;
alter table enrollments enable row level security;
alter table sessions enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table course_proposals enable row level security;
alter table support_tickets enable row level security;
alter table support_ticket_messages enable row level security;

-- Helper: check if user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Helper: check if user is professor
create or replace function is_professor()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'professor'
  );
$$ language sql security definer;

-- PROFILES policies
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can update any profile" on profiles
  for update using (is_admin());

-- PROFESSORS policies
create policy "Professors are viewable by everyone" on professors
  for select using (true);

create policy "Professors can update own record" on professors
  for update using (auth.uid() = id);

create policy "Admins can manage professors" on professors
  for all using (is_admin());

-- COURSES policies
create policy "Published courses are viewable by everyone" on courses
  for select using (status = 'published' or is_admin() or (is_professor() and professor_id = auth.uid()));

create policy "Admins can manage courses" on courses
  for all using (is_admin());

create policy "Professors can update own courses" on courses
  for update using (is_professor() and professor_id = auth.uid());

-- CURRICULUM ITEMS policies
create policy "Curriculum viewable if course is viewable" on curriculum_items
  for select using (
    exists (
      select 1 from courses where courses.id = curriculum_items.course_id
      and (courses.status = 'published' or is_admin() or (is_professor() and courses.professor_id = auth.uid()))
    )
  );

create policy "Admins can manage curriculum" on curriculum_items
  for all using (is_admin());

-- MIDTERMS policies
create policy "Midterms viewable if course is viewable" on midterms
  for select using (
    exists (
      select 1 from courses where courses.id = midterms.course_id
      and (courses.status = 'published' or is_admin())
    )
  );

create policy "Admins can manage midterms" on midterms
  for all using (is_admin());

-- ENROLLMENTS policies
create policy "Students can view own enrollments" on enrollments
  for select using (auth.uid() = student_id);

create policy "Students can create enrollments" on enrollments
  for insert with check (auth.uid() = student_id);

create policy "Professors can view enrollments for their courses" on enrollments
  for select using (
    exists (
      select 1 from courses where courses.id = enrollments.course_id and courses.professor_id = auth.uid()
    )
  );

create policy "Admins can manage enrollments" on enrollments
  for all using (is_admin());

-- SESSIONS policies
create policy "Users can view sessions for their enrollments" on sessions
  for select using (
    exists (
      select 1 from enrollments where enrollments.id = sessions.enrollment_id
      and (enrollments.student_id = auth.uid() or is_admin() or exists (
        select 1 from courses where courses.id = enrollments.course_id and courses.professor_id = auth.uid()
      ))
    )
  );

create policy "Admins can manage sessions" on sessions
  for all using (is_admin());

create policy "Professors can view/update/delete sessions for their courses" on sessions
  for select using (
    exists (
      select 1 from enrollments
      join courses on courses.id = enrollments.course_id
      where enrollments.id = sessions.enrollment_id and courses.professor_id = auth.uid()
    )
  );

create policy "Professors can update sessions for their courses" on sessions
  for update using (
    exists (
      select 1 from enrollments
      join courses on courses.id = enrollments.course_id
      where enrollments.id = sessions.enrollment_id and courses.professor_id = auth.uid()
    )
  );

create policy "Professors can delete sessions for their courses" on sessions
  for delete using (
    exists (
      select 1 from enrollments
      join courses on courses.id = enrollments.course_id
      where enrollments.id = sessions.enrollment_id and courses.professor_id = auth.uid()
    )
  );

create policy "Professors can insert sessions for their courses" on sessions
  for insert with check (
    exists (
      select 1 from enrollments
      join courses on courses.id = enrollments.course_id
      where enrollments.id = sessions.enrollment_id and courses.professor_id = auth.uid()
    )
  );

-- REVIEWS policies
create policy "Reviews are viewable by everyone" on reviews
  for select using (true);

create policy "Students can create reviews for completed enrollments" on reviews
  for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from enrollments where enrollments.id = reviews.enrollment_id
      and enrollments.student_id = auth.uid() and enrollments.status = 'completed'
    )
  );

create policy "Admins can manage reviews" on reviews
  for all using (is_admin());

-- NOTIFICATIONS policies
create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

create policy "System can create notifications" on notifications
  for insert with check (is_admin() or auth.uid() = user_id or is_professor());

create policy "Admins can manage notifications" on notifications
  for all using (is_admin());

-- COURSE PROPOSALS policies
create policy "Professors can view own proposals" on course_proposals
  for select using (auth.uid() = professor_id);

create policy "Professors can create proposals" on course_proposals
  for insert with check (auth.uid() = professor_id);

create policy "Admins can manage proposals" on course_proposals
  for all using (is_admin());

-- SUPPORT TICKETS policies
create policy "Users can view own tickets" on support_tickets
  for select using (auth.uid() = user_id);

create policy "Users can create tickets" on support_tickets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tickets" on support_tickets
  for update using (auth.uid() = user_id);

create policy "Admins can manage tickets" on support_tickets
  for all using (is_admin());

-- SUPPORT TICKET MESSAGES policies
create policy "Users can view messages for own tickets" on support_ticket_messages
  for select using (
    exists (
      select 1 from support_tickets where support_tickets.id = support_ticket_messages.ticket_id
      and (support_tickets.user_id = auth.uid() or is_admin())
    )
  );

create policy "Users can send messages to own tickets" on support_ticket_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from support_tickets where support_tickets.id = support_ticket_messages.ticket_id
      and (support_tickets.user_id = auth.uid() or is_admin())
    )
  );

create policy "Admins can manage ticket messages" on support_ticket_messages
  for all using (is_admin());

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at before update on courses
  for each row execute function update_updated_at();

create trigger set_updated_at before update on enrollments
  for each row execute function update_updated_at();

create trigger set_updated_at before update on course_proposals
  for each row execute function update_updated_at();

create trigger set_updated_at before update on support_tickets
  for each row execute function update_updated_at();

-- ============================================
-- SEED DATA: Insert existing courses & professors
-- Run AFTER you have created admin/professor users
-- ============================================

-- NOTE: After creating your admin user via signup, run:
-- UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
--
-- After creating professor users, run:
-- UPDATE profiles SET role = 'professor' WHERE id = '<professor-user-id>';
-- INSERT INTO professors (id, specialty, custom_tag) VALUES ('<professor-user-id>', 'Computer Science', 'Top Rated');
