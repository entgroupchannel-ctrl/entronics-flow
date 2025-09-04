-- Create international transfer requests table
CREATE TABLE public.international_transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.customers(id),
  supplier_name TEXT NOT NULL,
  supplier_bank_name TEXT NOT NULL,
  supplier_bank_address TEXT,
  supplier_account_number TEXT NOT NULL,
  supplier_swift_code TEXT,
  
  -- Transfer details
  transfer_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate NUMERIC,
  thb_equivalent NUMERIC,
  
  -- Reference documents
  purchase_order_number TEXT,
  invoice_reference TEXT,
  
  -- Payment details
  payment_purpose TEXT NOT NULL,
  payment_deadline DATE,
  requested_transfer_date DATE NOT NULL,
  
  -- Status and approval
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT NOT NULL DEFAULT 'normal',
  
  -- Customer payment info
  customer_id UUID REFERENCES public.customers(id),
  customer_payment_status TEXT DEFAULT 'pending',
  customer_paid_amount NUMERIC DEFAULT 0,
  customer_remaining_amount NUMERIC DEFAULT 0,
  
  -- Fees and costs
  transfer_fee NUMERIC DEFAULT 0,
  bank_charges NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  
  -- Approval workflow
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  finance_approved_by UUID REFERENCES auth.users(id),
  finance_approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Transfer execution
  transfer_executed_at TIMESTAMP WITH TIME ZONE,
  transfer_reference_number TEXT,
  actual_transfer_amount NUMERIC,
  actual_exchange_rate NUMERIC,
  
  -- Notes and attachments
  notes TEXT,
  internal_notes TEXT,
  attachment_urls TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.international_transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authorized users can view transfer requests"
ON public.international_transfer_requests
FOR SELECT
TO authenticated
USING (can_manage_customers(auth.uid()));

CREATE POLICY "Accountants can create transfer requests"
ON public.international_transfer_requests
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'accountant'::app_role) AND 
  auth.uid() = requested_by
);

CREATE POLICY "Accountants can update their own draft requests"
ON public.international_transfer_requests
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'accountant'::app_role) AND requested_by = auth.uid() AND status = 'draft') OR
  can_manage_customers(auth.uid())
);

CREATE POLICY "Admins can delete transfer requests"
ON public.international_transfer_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate transfer number
CREATE OR REPLACE FUNCTION public.generate_transfer_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  transfer_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month with TF prefix
  SELECT COALESCE(MAX(
    CASE 
      WHEN itr.transfer_number ~ ('^TF' || current_year || current_month || '[0-9]{4}$')
      THEN SUBSTRING(itr.transfer_number FROM LENGTH(itr.transfer_number) - 3)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.international_transfer_requests itr;
  
  transfer_number := 'TF' || current_year || current_month || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN transfer_number;
END;
$$;

-- Create trigger to set transfer number
CREATE OR REPLACE FUNCTION public.set_transfer_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.transfer_number IS NULL OR NEW.transfer_number = '' THEN
    NEW.transfer_number := generate_transfer_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_transfer_number_trigger
BEFORE INSERT ON public.international_transfer_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_transfer_number();

-- Create trigger for updated_at
CREATE TRIGGER update_international_transfer_requests_updated_at
BEFORE UPDATE ON public.international_transfer_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_international_transfer_requests_status ON public.international_transfer_requests(status);
CREATE INDEX idx_international_transfer_requests_requested_by ON public.international_transfer_requests(requested_by);
CREATE INDEX idx_international_transfer_requests_supplier_id ON public.international_transfer_requests(supplier_id);
CREATE INDEX idx_international_transfer_requests_customer_id ON public.international_transfer_requests(customer_id);