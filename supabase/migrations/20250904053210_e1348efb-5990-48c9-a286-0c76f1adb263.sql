-- Add customer PO number field to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN customer_po_number TEXT;