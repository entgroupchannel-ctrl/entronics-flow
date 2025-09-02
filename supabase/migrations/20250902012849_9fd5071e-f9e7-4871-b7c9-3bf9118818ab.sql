-- Fix ambiguous column reference in can_issue_receipt_for_tax_invoice function
CREATE OR REPLACE FUNCTION public.can_issue_receipt_for_tax_invoice(tax_invoice_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invoice_total_amount NUMERIC;
  total_payments NUMERIC;
BEGIN
  -- Get tax invoice total amount with explicit table reference
  SELECT tax_invoices.total_amount INTO invoice_total_amount
  FROM public.tax_invoices
  WHERE tax_invoices.id = tax_invoice_id_param;
  
  -- Get total verified payments with explicit table reference
  SELECT COALESCE(SUM(payment_records.amount_received), 0) INTO total_payments
  FROM public.payment_records
  WHERE payment_records.tax_invoice_id = tax_invoice_id_param
    AND payment_records.verification_status = 'verified';
  
  -- Return true if payments >= invoice amount
  RETURN (total_payments >= invoice_total_amount);
END;
$function$;