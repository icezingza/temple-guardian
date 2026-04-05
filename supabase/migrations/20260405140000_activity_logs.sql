-- Activity log table: records every save/clear action on kutis
-- Run this in the Supabase SQL editor after the initial kutis migration.

CREATE TABLE public.activity_logs (
  id           UUID             NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kuti_id      UUID             NOT NULL REFERENCES public.kutis(id),
  -- Stored as TEXT to match kutis.kuti_number column type
  kuti_number  TEXT             NOT NULL,
  action_type  TEXT             NOT NULL,   -- 'UPDATE' | 'CLEAR'
  old_data     JSONB            NOT NULL DEFAULT '{}',
  new_data     JSONB            NOT NULL DEFAULT '{}',
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read and insert (auth will be added later, same as kutis)
CREATE POLICY "Anyone can view activity_logs"
  ON public.activity_logs FOR SELECT USING (true);

CREATE POLICY "Anyone can insert activity_logs"
  ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Index for fast recent-logs queries
CREATE INDEX activity_logs_created_at_idx
  ON public.activity_logs (created_at DESC);

CREATE INDEX activity_logs_kuti_id_idx
  ON public.activity_logs (kuti_id);
