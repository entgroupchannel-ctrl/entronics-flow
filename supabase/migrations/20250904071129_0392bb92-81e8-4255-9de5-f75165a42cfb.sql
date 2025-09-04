-- Add source_system column to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN source_system TEXT NOT NULL DEFAULT 'manual';