-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  receipt_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month with RE prefix
  SELECT COALESCE(MAX(
    CASE 
      WHEN r.receipt_number ~ ('^RE' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(r.receipt_number FROM LENGTH(r.receipt_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.receipts r;
  
  receipt_number := 'RE' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN receipt_number;
END;
$function$;

-- Fix trigger function search path
CREATE OR REPLACE FUNCTION public.set_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$function$;