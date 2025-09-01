-- Add unique constraint to prevent duplicate technicians
-- First, remove existing duplicates by keeping only the latest record for each name+email combination
DELETE FROM public.technicians t1 
WHERE t1.id NOT IN (
  SELECT MAX(t2.id) 
  FROM public.technicians t2 
  WHERE t2.name = t1.name AND t2.email = t1.email
);

-- Add unique constraint on name and email combination
ALTER TABLE public.technicians 
ADD CONSTRAINT unique_technician_name_email UNIQUE (name, email);

-- Add comment for clarity
COMMENT ON CONSTRAINT unique_technician_name_email ON public.technicians 
IS 'Ensures no duplicate technicians with same name and email';