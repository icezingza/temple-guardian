-- ============================================================
-- Temple Guardian – Full schema fix for project tgxxtnwgnbyuigluyfii
--
-- Run this entire script in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/tgxxtnwgnbyuigluyfii/sql/new
--
-- Safe to run on a fresh project OR one that already has the
-- simplified (resident_name / INTEGER kuti_number) schema.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Drop old objects if they exist (wrong schema)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.kutis CASCADE;
DROP TYPE  IF EXISTS public.kuti_status CASCADE;

-- ────────────────────────────────────────────────────────────
-- 2. Enum
-- ────────────────────────────────────────────────────────────
CREATE TYPE public.kuti_status AS ENUM (
  'available',
  'occupied',
  'reserved',
  'maintenance'
);

-- ────────────────────────────────────────────────────────────
-- 3. kutis table
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.kutis (
  id           UUID             NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kuti_number  TEXT             NOT NULL UNIQUE,
  name         TEXT             NOT NULL DEFAULT '',
  status       public.kuti_status NOT NULL DEFAULT 'available',
  notes        TEXT             NOT NULL DEFAULT '',
  x_percent    NUMERIC          NOT NULL DEFAULT 0,
  y_percent    NUMERIC          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kutis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view kutis"   ON public.kutis FOR SELECT USING (true);
CREATE POLICY "Anyone can insert kutis" ON public.kutis FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update kutis" ON public.kutis FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete kutis" ON public.kutis FOR DELETE USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_kutis_updated_at
  BEFORE UPDATE ON public.kutis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 4. activity_logs table
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.activity_logs (
  id           UUID             NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kuti_id      UUID             NOT NULL REFERENCES public.kutis(id),
  kuti_number  TEXT             NOT NULL,
  action_type  TEXT             NOT NULL,   -- 'UPDATE' | 'CLEAR'
  old_data     JSONB            NOT NULL DEFAULT '{}',
  new_data     JSONB            NOT NULL DEFAULT '{}',
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity_logs"
  ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activity_logs"
  ON public.activity_logs FOR INSERT WITH CHECK (true);

CREATE INDEX activity_logs_created_at_idx ON public.activity_logs (created_at DESC);
CREATE INDEX activity_logs_kuti_id_idx    ON public.activity_logs (kuti_id);

-- ────────────────────────────────────────────────────────────
-- 5. Seed – 31 kutis with map positions
--    (kuti numbers 1-15, 17-26, 28-33; no 16 or 27)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.kutis (kuti_number, x_percent, y_percent) VALUES
  ('1',  15, 73),
  ('2',  28, 73),
  ('3',  40, 73),
  ('4',  53, 73),
  ('5',  90, 77),
  ('6',  75, 67),
  ('7',  90, 67),
  ('8',  12, 53),
  ('9',  25, 53),
  ('10', 38, 53),
  ('11', 52, 53),
  ('12', 68, 53),
  ('13', 78, 53),
  ('14', 90, 55),
  ('15', 90, 43),
  ('17', 82, 28),
  ('18', 78, 23),
  ('19', 15, 39),
  ('20',  5, 35),
  ('21',  7, 17),
  ('22', 22,  9),
  ('23', 12,  7),
  ('24',  7,  3),
  ('25', 58,  5),
  ('26', 88,  4),
  ('28', 62, 15),
  ('29', 27, 16),
  ('30', 20, 33),
  ('31', 58, 33),
  ('32', 85, 29),
  ('33', 78, 13);

-- ────────────────────────────────────────────────────────────
-- 6. Verify
-- ────────────────────────────────────────────────────────────
SELECT count(*) AS total_kutis FROM public.kutis;
-- Expected: 31
