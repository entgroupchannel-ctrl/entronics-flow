-- Update receipt_items table to store document-based entries
ALTER TABLE public.receipt_items
  DROP COLUMN IF EXISTS product_id,
  DROP COLUMN IF EXISTS product_name,
  DROP COLUMN IF EXISTS product_sku,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS quantity,
  DROP COLUMN IF EXISTS unit_price,
  DROP COLUMN IF EXISTS discount_amount,
  DROP COLUMN IF EXISTS discount_type,
  DROP COLUMN IF EXISTS line_total,
  DROP COLUMN IF EXISTS is_software;

-- Add document-based columns
ALTER TABLE public.receipt_items
  ADD COLUMN document_number TEXT NOT NULL,
  ADD COLUMN document_date DATE NOT NULL,
  ADD COLUMN due_date DATE,
  ADD COLUMN subtotal_before_tax NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN payment_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN sequence_number INTEGER NOT NULL DEFAULT 1;