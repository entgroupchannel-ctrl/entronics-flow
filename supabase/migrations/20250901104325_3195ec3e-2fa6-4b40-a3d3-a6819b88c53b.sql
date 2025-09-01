-- Fix search_path for the invoice number generation functions
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;  
  sequence_num INTEGER;
  invoice_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN inv.invoice_number ~ ('^IV' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(inv.invoice_number FROM LENGTH(inv.invoice_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.invoices inv;
  
  invoice_number := 'IV' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN invoice_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;