-- Create payment records table to track actual payments
CREATE TABLE public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number TEXT NOT NULL UNIQUE,
  tax_invoice_id UUID NOT NULL REFERENCES public.tax_invoices(id),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  bank_name TEXT,
  bank_account TEXT,
  depositor_name TEXT,
  amount_received NUMERIC NOT NULL,
  payment_evidence_url TEXT,
  payment_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment records
CREATE POLICY "Users can create payment records" 
ON public.payment_records 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view payment records for their tax invoices" 
ON public.payment_records 
FOR SELECT 
USING (tax_invoice_id IN (
  SELECT id FROM public.tax_invoices WHERE created_by = auth.uid()
));

CREATE POLICY "Users can update payment records for their tax invoices" 
ON public.payment_records 
FOR UPDATE 
USING (tax_invoice_id IN (
  SELECT id FROM public.tax_invoices WHERE created_by = auth.uid()
));

CREATE POLICY "Admins can manage all payment records" 
ON public.payment_records 
FOR ALL 
USING (can_manage_inventory(auth.uid()));

-- Generate payment number function
CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  payment_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month with PAY prefix
  SELECT COALESCE(MAX(
    CASE 
      WHEN p.payment_number ~ ('^PAY' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(p.payment_number FROM LENGTH(p.payment_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.payment_records p;
  
  payment_number := 'PAY' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN payment_number;
END;
$function$;

-- Create trigger function to set payment number
CREATE OR REPLACE FUNCTION public.set_payment_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
    NEW.payment_number := generate_payment_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for automatic payment number generation
CREATE TRIGGER set_payment_number_trigger
  BEFORE INSERT ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_payment_number();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update receipts table to require tax_invoice_id and payment verification
ALTER TABLE public.receipts 
  ALTER COLUMN tax_invoice_id SET NOT NULL,
  ADD COLUMN payment_record_id UUID REFERENCES public.payment_records(id),
  ADD COLUMN can_issue_receipt BOOLEAN NOT NULL DEFAULT false;

-- Create function to check if receipt can be issued
CREATE OR REPLACE FUNCTION public.can_issue_receipt_for_tax_invoice(tax_invoice_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  total_amount NUMERIC;
  total_payments NUMERIC;
BEGIN
  -- Get tax invoice total amount
  SELECT total_amount INTO total_amount
  FROM public.tax_invoices
  WHERE id = tax_invoice_id_param;
  
  -- Get total verified payments
  SELECT COALESCE(SUM(amount_received), 0) INTO total_payments
  FROM public.payment_records
  WHERE tax_invoice_id = tax_invoice_id_param
    AND verification_status = 'verified';
  
  -- Return true if payments >= invoice amount
  RETURN (total_payments >= total_amount);
END;
$function$;

-- Create trigger to update can_issue_receipt when payments change
CREATE OR REPLACE FUNCTION public.update_receipt_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update can_issue_receipt for the tax invoice
  UPDATE public.tax_invoices
  SET updated_at = now()
  WHERE id = COALESCE(NEW.tax_invoice_id, OLD.tax_invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for payment record changes
CREATE TRIGGER update_receipt_eligibility_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_receipt_eligibility();

-- Update receipts RLS policies to ensure only verified payments can create receipts
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;

CREATE POLICY "Users can create receipts only with verified payments" 
ON public.receipts 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND tax_invoice_id IS NOT NULL
  AND can_issue_receipt_for_tax_invoice(tax_invoice_id) = true
);