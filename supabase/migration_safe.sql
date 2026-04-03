-- ============================================
-- UniTutors MK - Safe Idempotent Migration
-- Can be run multiple times on an existing database
-- ============================================
-- Usage: Run this in the Supabase SQL Editor.
-- It is fully idempotent — every statement is guarded with
-- IF NOT EXISTS / IF EXISTS / OR REPLACE so it is safe to
-- execute repeatedly without errors or data loss.
-- ============================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ADD MISSING COLUMNS
--    ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- ============================================

-- 1a. profiles: gamification columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp int NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level int NOT NULL DEFAULT 1;

-- 1b. professors: bio, avatar_url, rating, updated_at
ALTER TABLE professors ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';
ALTER TABLE professors ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE professors ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 0;
ALTER TABLE professors ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 1c. courses: bilingual (English) fields
ALTER TABLE courses ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS description_en text;

-- 1d. curriculum_items: bilingual (English) fields
ALTER TABLE curriculum_items ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE curriculum_items ADD COLUMN IF NOT EXISTS description_en text;

-- 1e. midterms: bilingual (English) field
ALTER TABLE midterms ADD COLUMN IF NOT EXISTS title_en text;

-- 1f. enrollments: payment tracking
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS discount_percent numeric NOT NULL DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS price_paid numeric;

-- ============================================
-- 2. STUDENT XP TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS student_xp (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount int NOT NULL,
  reason text NOT NULL DEFAULT '',
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 3. INDEXES (IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_student_xp_student ON student_xp(student_id);
CREATE INDEX IF NOT EXISTS idx_student_xp_created ON student_xp(created_at);

-- Ensure core indexes exist (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_sessions_enrollment ON sessions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_professor ON reviews(professor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_professor ON courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_course_proposals_professor ON course_proposals(professor_id);

-- ============================================
-- 4. ROW LEVEL SECURITY - ENABLE
--    (enable is idempotent — no-op if already on)
-- ============================================

ALTER TABLE student_xp ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES (DROP IF EXISTS + CREATE)
--    This pattern makes every policy idempotent.
-- ============================================

-- 5a. student_xp policies
DROP POLICY IF EXISTS "Students can view own XP" ON student_xp;
CREATE POLICY "Students can view own XP" ON student_xp
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "System can insert XP" ON student_xp;
CREATE POLICY "System can insert XP" ON student_xp
  FOR INSERT WITH CHECK (is_admin() OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can manage XP" ON student_xp;
CREATE POLICY "Admins can manage XP" ON student_xp
  FOR ALL USING (is_admin());

-- 5b. profiles policies (idempotent re-create)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (is_admin());

-- 5c. professors policies
DROP POLICY IF EXISTS "Professors are viewable by everyone" ON professors;
CREATE POLICY "Professors are viewable by everyone" ON professors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Professors can update own record" ON professors;
CREATE POLICY "Professors can update own record" ON professors
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage professors" ON professors;
CREATE POLICY "Admins can manage professors" ON professors
  FOR ALL USING (is_admin());

-- 5d. courses policies
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
CREATE POLICY "Published courses are viewable by everyone" ON courses
  FOR SELECT USING (
    status = 'published'
    OR is_admin()
    OR (is_professor() AND professor_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Professors can update own courses" ON courses;
CREATE POLICY "Professors can update own courses" ON courses
  FOR UPDATE USING (is_professor() AND professor_id = auth.uid());

-- 5e. curriculum_items policies
DROP POLICY IF EXISTS "Curriculum viewable if course is viewable" ON curriculum_items;
CREATE POLICY "Curriculum viewable if course is viewable" ON curriculum_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = curriculum_items.course_id
        AND (courses.status = 'published' OR is_admin() OR (is_professor() AND courses.professor_id = auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Admins can manage curriculum" ON curriculum_items;
CREATE POLICY "Admins can manage curriculum" ON curriculum_items
  FOR ALL USING (is_admin());

-- 5f. midterms policies
DROP POLICY IF EXISTS "Midterms viewable if course is viewable" ON midterms;
CREATE POLICY "Midterms viewable if course is viewable" ON midterms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = midterms.course_id
        AND (courses.status = 'published' OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage midterms" ON midterms;
CREATE POLICY "Admins can manage midterms" ON midterms
  FOR ALL USING (is_admin());

-- 5g. enrollments policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can create enrollments" ON enrollments;
CREATE POLICY "Students can create enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Professors can view enrollments for their courses" ON enrollments;
CREATE POLICY "Professors can view enrollments for their courses" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id AND courses.professor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
CREATE POLICY "Admins can manage enrollments" ON enrollments
  FOR ALL USING (is_admin());

-- 5h. sessions policies
DROP POLICY IF EXISTS "Users can view sessions for their enrollments" ON sessions;
CREATE POLICY "Users can view sessions for their enrollments" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = sessions.enrollment_id
        AND (
          enrollments.student_id = auth.uid()
          OR is_admin()
          OR EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = enrollments.course_id AND courses.professor_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Admins can manage sessions" ON sessions;
CREATE POLICY "Admins can manage sessions" ON sessions
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Professors can view/update/delete sessions for their courses" ON sessions;
CREATE POLICY "Professors can view/update/delete sessions for their courses" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = sessions.enrollment_id AND courses.professor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professors can update sessions for their courses" ON sessions;
CREATE POLICY "Professors can update sessions for their courses" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = sessions.enrollment_id AND courses.professor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professors can delete sessions for their courses" ON sessions;
CREATE POLICY "Professors can delete sessions for their courses" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = sessions.enrollment_id AND courses.professor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professors can insert sessions for their courses" ON sessions;
CREATE POLICY "Professors can insert sessions for their courses" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = sessions.enrollment_id AND courses.professor_id = auth.uid()
    )
  );

-- 5i. reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can create reviews for completed enrollments" ON reviews;
CREATE POLICY "Students can create reviews for completed enrollments" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = reviews.enrollment_id
        AND enrollments.student_id = auth.uid()
        AND enrollments.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (is_admin());

-- 5j. notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (is_admin() OR auth.uid() = user_id OR is_professor());

DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (is_admin());

-- 5k. course_proposals policies
DROP POLICY IF EXISTS "Professors can view own proposals" ON course_proposals;
CREATE POLICY "Professors can view own proposals" ON course_proposals
  FOR SELECT USING (auth.uid() = professor_id);

DROP POLICY IF EXISTS "Professors can create proposals" ON course_proposals;
CREATE POLICY "Professors can create proposals" ON course_proposals
  FOR INSERT WITH CHECK (auth.uid() = professor_id);

DROP POLICY IF EXISTS "Admins can manage proposals" ON course_proposals;
CREATE POLICY "Admins can manage proposals" ON course_proposals
  FOR ALL USING (is_admin());

-- 5l. support_tickets policies
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage tickets" ON support_tickets;
CREATE POLICY "Admins can manage tickets" ON support_tickets
  FOR ALL USING (is_admin());

-- 5m. support_ticket_messages policies
DROP POLICY IF EXISTS "Users can view messages for own tickets" ON support_ticket_messages;
CREATE POLICY "Users can view messages for own tickets" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_messages.ticket_id
        AND (support_tickets.user_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Users can send messages to own tickets" ON support_ticket_messages;
CREATE POLICY "Users can send messages to own tickets" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_messages.ticket_id
        AND (support_tickets.user_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage ticket messages" ON support_ticket_messages;
CREATE POLICY "Admins can manage ticket messages" ON support_ticket_messages
  FOR ALL USING (is_admin());

-- ============================================
-- 6. HELPER FUNCTIONS (CREATE OR REPLACE)
-- ============================================

-- is_admin / is_professor helpers (idempotent via OR REPLACE)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_professor()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'professor'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at trigger to professors (safe: drop first)
DROP TRIGGER IF EXISTS set_updated_at ON professors;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON professors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Ensure updated_at triggers exist on other tables too
-- (DROP + CREATE pattern for full idempotency)
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON courses;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON enrollments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON course_proposals;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON course_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON support_tickets;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. XP AUTO-UPDATE TRIGGER
--    Recalculates total XP and level on every
--    insert into student_xp.
-- ============================================

CREATE OR REPLACE FUNCTION update_student_xp()
RETURNS trigger AS $$
DECLARE
  total_xp int;
  new_level int;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_xp
  FROM student_xp WHERE student_id = NEW.student_id;

  new_level := CASE
    WHEN total_xp >= 500 THEN 3
    WHEN total_xp >= 200 THEN 2
    ELSE 1
  END;

  UPDATE profiles SET xp = total_xp, level = new_level
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_xp_insert ON student_xp;
CREATE TRIGGER on_xp_insert
  AFTER INSERT ON student_xp
  FOR EACH ROW EXECUTE FUNCTION update_student_xp();

-- ============================================
-- 9. PROFESSOR RATINGS VIEW (OR REPLACE)
-- ============================================

CREATE OR REPLACE VIEW professor_ratings AS
SELECT
  professor_id,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating,
  COUNT(*) AS review_count
FROM reviews
GROUP BY professor_id;

-- ============================================
-- DONE. All migrations applied idempotently.
-- ============================================
