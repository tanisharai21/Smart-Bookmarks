-- =============================================================
-- Smart Bookmark App — Supabase Database Setup
-- Run this in the Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ENABLE UUID EXTENSION (usually already enabled)
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 2. CREATE BOOKMARKS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  url        TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. INDEXES for performance
-- ─────────────────────────────────────────────────────────────
-- Index for fast lookups by user_id (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id 
  ON public.bookmarks(user_id);

-- Index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at 
  ON public.bookmarks(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- Each user can only access their own bookmarks.
-- ─────────────────────────────────────────────────────────────

-- SELECT: Users can only read their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert bookmarks for themselves
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATE: (Optional) Users can update their own bookmarks
-- Uncomment if you add editing functionality later
-- CREATE POLICY "Users can update own bookmarks"
--   ON public.bookmarks
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 6. ENABLE REALTIME
-- Add the bookmarks table to Supabase's realtime publication
-- ─────────────────────────────────────────────────────────────

-- Check if supabase_realtime publication exists and add table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 7. VERIFY SETUP
-- Run these queries to confirm everything is correct
-- ─────────────────────────────────────────────────────────────

-- Verify table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookmarks' 
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bookmarks';

-- Verify policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bookmarks';
