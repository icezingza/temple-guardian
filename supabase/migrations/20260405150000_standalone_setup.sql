-- ============================================================
-- Temple Guardian: Full Setup Migration (Standalone)
-- ============================================================
-- NOTE: This migration uses a simplified schema (kuti_number INTEGER,
-- resident_name TEXT). The main codebase uses TEXT kuti_number and
-- additional fields (notes, x_percent, y_percent).
-- Run the existing migrations instead if using the full app:
--   20260405130613_*.sql  → kutis table
--   20260405140000_activity_logs.sql → activity_logs table
-- ============================================================

-- 1. สร้างตารางกุฏิ
CREATE TABLE IF NOT EXISTS kutis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kuti_number INTEGER UNIQUE NOT NULL,
  resident_name TEXT,
  status TEXT DEFAULT 'available',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้างตารางบันทึกประวัติ
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kuti_id UUID REFERENCES kutis(id),
  kuti_number INTEGER,
  action_type TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ใส่ข้อมูลกุฏิเริ่มต้น (1-33, ไม่มี 16 และ 27)
INSERT INTO kutis (kuti_number, status)
VALUES
  (1, 'available'), (2, 'available'), (3, 'available'), (4, 'available'), (5, 'available'),
  (6, 'available'), (7, 'available'), (8, 'available'), (9, 'available'), (10, 'available'),
  (11, 'available'), (12, 'available'), (13, 'available'), (14, 'available'), (15, 'available'),
  (17, 'available'), (18, 'available'), (19, 'available'), (20, 'available'),
  (21, 'available'), (22, 'available'), (23, 'available'), (24, 'available'), (25, 'available'),
  (26, 'available'), (28, 'available'), (29, 'available'), (30, 'available'),
  (31, 'available'), (32, 'available'), (33, 'available')
ON CONFLICT (kuti_number) DO NOTHING;

-- 4. ตั้งค่าความปลอดภัย (RLS) - kutis
ALTER TABLE kutis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON kutis;
CREATE POLICY "Public Access" ON kutis FOR ALL USING (true) WITH CHECK (true);

-- 5. ตั้งค่าความปลอดภัย (RLS) - activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert" ON activity_logs;
CREATE POLICY "Public Insert" ON activity_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Read" ON activity_logs;
CREATE POLICY "Public Read" ON activity_logs FOR SELECT USING (true);
