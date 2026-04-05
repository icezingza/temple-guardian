
-- Create enum for kuti statuses
CREATE TYPE public.kuti_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');

-- Create kutis table
CREATE TABLE public.kutis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kuti_number TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  status public.kuti_status NOT NULL DEFAULT 'available',
  notes TEXT DEFAULT '',
  x_percent NUMERIC NOT NULL DEFAULT 0,
  y_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kutis ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (auth will be added later)
CREATE POLICY "Anyone can view kutis" ON public.kutis FOR SELECT USING (true);
CREATE POLICY "Anyone can insert kutis" ON public.kutis FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update kutis" ON public.kutis FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete kutis" ON public.kutis FOR DELETE USING (true);

-- Timestamp trigger
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
