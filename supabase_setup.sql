-- ============================================================
-- Moran's Health Hub - Supabase Schema (MVP)
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- 1. פרופיל משתמש (שורה אחת בלבד)
CREATE TABLE IF NOT EXISTS user_profile (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT DEFAULT 'מורן',
  age         NUMERIC DEFAULT 42.8,
  height_cm   NUMERIC DEFAULT 180,
  start_weight NUMERIC DEFAULT 75.05,
  target_weight_min NUMERIC DEFAULT 71.5,
  target_weight_max NUMERIC DEFAULT 73.0,
  target_bf_min NUMERIC DEFAULT 11,
  target_bf_max NUMERIC DEFAULT 13,
  diet_phase  TEXT DEFAULT 'transitioning', -- keto / transitioning / regular
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. מדדי גוף לאורך זמן (מהמשקל החכם)
CREATE TABLE IF NOT EXISTS body_metrics (
  id            BIGSERIAL PRIMARY KEY,
  measured_at   TIMESTAMPTZ DEFAULT NOW(),
  weight        NUMERIC NOT NULL,
  body_fat_pct  NUMERIC,
  muscle_mass   NUMERIC,
  water_pct     NUMERIC,
  visceral_fat  NUMERIC,
  bmi           NUMERIC,
  bmr           NUMERIC,
  notes         TEXT,
  photo_url     TEXT
);
CREATE INDEX IF NOT EXISTS idx_body_metrics_date ON body_metrics(measured_at DESC);

-- 3. מוצרים בבית (Pantry)
CREATE TABLE IF NOT EXISTS pantry_items (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT, -- protein / vegetable / nut / oil / carb / dairy / other
  in_stock    BOOLEAN DEFAULT TRUE,
  notes       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. תפריטים שבועיים
CREATE TABLE IF NOT EXISTS weekly_menus (
  id          BIGSERIAL PRIMARY KEY,
  week_start  DATE NOT NULL,
  days        JSONB NOT NULL, -- [{day:'ראשון',lunch:'...',dinner:'...',cal:2700,protein:130}, ...]
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. יומן אימונים
CREATE TABLE IF NOT EXISTS workout_log (
  id            BIGSERIAL PRIMARY KEY,
  workout_date  DATE NOT NULL,
  day_name      TEXT, -- ראשון / רביעי / שישי
  is_release    BOOLEAN DEFAULT FALSE,
  exercises     JSONB,  -- [{name,sets,reps,weight}, ...]
  rating        INT,    -- 1-5
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. צעידות יומיות
CREATE TABLE IF NOT EXISTS daily_walks (
  id          BIGSERIAL PRIMARY KEY,
  walk_date   DATE NOT NULL UNIQUE,
  km          NUMERIC NOT NULL,
  duration_min INT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. הנחיות מהדיאטנית/מאמן (BYOC log)
CREATE TABLE IF NOT EXISTS coach_messages (
  id          BIGSERIAL PRIMARY KEY,
  persona     TEXT NOT NULL, -- dietitian / trainer / team
  prompt_sent TEXT,           -- ה-prompt שהועתק ל-Claude.ai
  response    TEXT,           -- התשובה שהודבקה חזרה
  context_snapshot JSONB,     -- תמונת מצב בזמן ההנחיה
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coach_messages_date ON coach_messages(created_at DESC);

-- ============================================================
-- אתחול: שורה ראשונה ב-user_profile
-- ============================================================
INSERT INTO user_profile (name, age, height_cm, start_weight)
SELECT 'מורן', 42.8, 180, 75.05
WHERE NOT EXISTS (SELECT 1 FROM user_profile);

-- ============================================================
-- שלבים אחרי הרצת ה-SQL:
-- 1. Storage → Create new bucket: "scale-photos" (public)
-- 2. Settings → API → העתק את: Project URL ו-anon public key
-- 3. הדבק אותם באפליקציה (כפתור הגדרות ⚙️)
-- ============================================================
