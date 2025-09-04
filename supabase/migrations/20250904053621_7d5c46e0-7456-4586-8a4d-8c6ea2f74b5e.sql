-- Add sales_person_id field to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN sales_person_id UUID REFERENCES auth.users(id);