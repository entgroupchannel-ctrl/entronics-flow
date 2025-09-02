-- Add customer_branch column to quotations table
ALTER TABLE public.quotations 
ADD COLUMN customer_branch TEXT;