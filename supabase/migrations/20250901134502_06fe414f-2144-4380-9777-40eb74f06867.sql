-- Create function to update invoice status when tax invoice is created
CREATE OR REPLACE FUNCTION public.update_invoice_status_on_tax_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update invoice status to 'วางบิลแล้ว' when tax invoice is created
  IF NEW.invoice_id IS NOT NULL THEN
    UPDATE public.invoices 
    SET status = 'วางบิลแล้ว',
        updated_at = now()
    WHERE id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically update invoice status
CREATE TRIGGER trigger_update_invoice_status_on_tax_invoice
    AFTER INSERT ON public.tax_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_invoice_status_on_tax_invoice();