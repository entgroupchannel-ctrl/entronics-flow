-- Add HQ/Branch field to customers table
ALTER TABLE public.customers 
ADD COLUMN hq_branch text;