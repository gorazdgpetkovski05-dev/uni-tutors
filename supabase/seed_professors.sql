-- Seed script: Create professor accounts for Nikola Jankoski and Dragan
-- Run this in the Supabase SQL editor after creating the auth accounts manually,
-- OR use the steps below to create both auth user + profile + professor record.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > Authentication > Users > Add User
--    Create: nikola.jankoski@gmail.com (set a password)
--    Create: dragan@gmail.com (set a password)
-- 2. Copy the UUIDs of the newly created users from the Auth dashboard.
-- 3. Replace <NIKOLA_UUID> and <DRAGAN_UUID> below with the actual UUIDs.
-- 4. Run this script in Supabase SQL Editor.

-- ─── Nikola Jankoski ────────────────────────────────────────────────────────────

-- Create profile (if not auto-created by trigger)
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '<NIKOLA_UUID>',
  'Nikola Jankoski',
  'professor',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
  SET full_name = 'Nikola Jankoski',
      role = 'professor',
      updated_at = now();

-- Create professor record
INSERT INTO professors (id, specialty, bio, rating, avatar_url, created_at)
VALUES (
  '<NIKOLA_UUID>',
  'Senior Software Engineer',
  'Experienced software engineer specializing in full-stack development, algorithms, and system design. Passionate about helping students master computer science fundamentals.',
  4.9,
  'https://ui-avatars.com/api/?name=Nikola+Jankoski&background=6366f1&color=fff&size=128',
  now()
)
ON CONFLICT (id) DO UPDATE
  SET specialty = 'Senior Software Engineer',
      rating = 4.9,
      updated_at = now();

-- ─── Dragan ─────────────────────────────────────────────────────────────────────

-- Create profile (if not auto-created by trigger)
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '<DRAGAN_UUID>',
  'Dragan',
  'professor',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dragan',
      role = 'professor',
      updated_at = now();

-- Create professor record
INSERT INTO professors (id, specialty, bio, rating, avatar_url, created_at)
VALUES (
  '<DRAGAN_UUID>',
  'Financial Analyst & Economist',
  'Financial analyst and economist with deep expertise in macroeconomics, financial modeling, and business analysis. Helps students excel in economics and finance courses.',
  4.8,
  'https://ui-avatars.com/api/?name=Dragan&background=8b5cf6&color=fff&size=128',
  now()
)
ON CONFLICT (id) DO UPDATE
  SET specialty = 'Financial Analyst & Economist',
      rating = 4.8,
      updated_at = now();

-- ─── Verify ──────────────────────────────────────────────────────────────────────
SELECT p.id, p.full_name, p.role, pr.specialty, pr.rating
FROM profiles p
JOIN professors pr ON pr.id = p.id
WHERE p.role = 'professor';
