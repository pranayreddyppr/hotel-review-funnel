-- Run this in the Supabase SQL Editor to set up the reviews table.
-- Go to: your Supabase project > SQL Editor > New query > paste this > Run

CREATE TABLE IF NOT EXISTS reviews (
  id          BIGSERIAL PRIMARY KEY,
  hotel_slug  TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback    TEXT,
  token       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast token lookups (used by saveFeedback)
CREATE INDEX IF NOT EXISTS idx_reviews_token ON reviews (token);

-- Index for filtering by hotel (used by getReviews and admin dashboard)
CREATE INDEX IF NOT EXISTS idx_reviews_hotel_slug ON reviews (hotel_slug);

-- Index for sorting newest first
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

-- ── 2024 additions ────────────────────────────────────────────────────────────
-- Run these if your table already exists (safe to run multiple times)

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS room_number TEXT;

-- Index for fast duplicate lookups (room + hotel + date)
CREATE INDEX IF NOT EXISTS idx_reviews_room ON reviews (hotel_slug, room_number, created_at DESC);
