-- Add Line ID field to staff table
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS line_id TEXT;