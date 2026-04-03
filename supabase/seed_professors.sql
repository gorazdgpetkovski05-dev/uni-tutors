-- Seed script: Create professor accounts for Nikola Jankoski and Dragan
-- Run this in the Supabase SQL editor after creating the auth accounts manually,
-- OR use the steps below to create both auth user + profile + professor record.
--
-- PREREQUISITES:
--   Run supabase/migration_safe.sql FIRST to ensure the professors table
--   has the bio, avatar_url, rating, and updated_at columns.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > Authentication > Users > Add User
--    Create: nikola.jankoski@gmail.com (set a password)
--    Create: dragan@gmail.com (set a password)
-- 2. Copy the UUIDs of the newly created users from the Auth dashboard.
-- 3. Replace <NIKOLA_UUID> and <DRAGAN_UUID> below with the actual UUIDs.
-- 4. Run this script in Supabase SQL Editor.
--
-- NOTE ON AVATARS:
--   The avatar_url values below use ui-avatars.com as placeholders.
--   For production, replace them with actual photo URLs uploaded to
--   Supabase Storage (e.g. supabase.storage.from('avatars').getPublicUrl(...))
--   or any other hosted image service.

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

-- Create professor record (includes bio and avatar_url columns)
INSERT INTO professors (id, specialty, bio, rating, avatar_url, created_at, updated_at)
VALUES (
  '<NIKOLA_UUID>',
  'Senior Software Engineer',
  'Experienced software engineer specializing in full-stack development, algorithms, and system design. Passionate about helping students master computer science fundamentals.',
  4.9,
  'https://ui-avatars.com/api/?name=Nikola+Jankoski&background=6366f1&color=fff&size=128',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
  SET specialty = EXCLUDED.specialty,
      bio = EXCLUDED.bio,
      rating = EXCLUDED.rating,
      avatar_url = EXCLUDED.avatar_url,
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

-- Create professor record (includes bio and avatar_url columns)
INSERT INTO professors (id, specialty, bio, rating, avatar_url, created_at, updated_at)
VALUES (
  '<DRAGAN_UUID>',
  'Financial Analyst & Economist',
  'Financial analyst and economist with deep expertise in macroeconomics, financial modeling, and business analysis. Helps students excel in economics and finance courses.',
  4.8,
  'https://ui-avatars.com/api/?name=Dragan&background=8b5cf6&color=fff&size=128',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
  SET specialty = EXCLUDED.specialty,
      bio = EXCLUDED.bio,
      rating = EXCLUDED.rating,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();

-- ─── Verify ──────────────────────────────────────────────────────────────────────
SELECT p.id, p.full_name, p.role, pr.specialty, pr.bio, pr.rating, pr.avatar_url
FROM profiles p
JOIN professors pr ON pr.id = p.id
WHERE p.role = 'professor';
