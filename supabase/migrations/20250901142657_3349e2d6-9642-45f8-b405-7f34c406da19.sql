-- Create receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_id UUID REFERENCES public.invoices(id),
  tax_invoice_id UUID REFERENCES public.tax_invoices(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  payment_method TEXT NOT NULL DEFAULT 'เงินสด',
  payment_reference TEXT,
  bank_name TEXT,
  bank_account TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  withholding_tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  amount_change NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own receipts" 
ON public.receipts 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own receipts" 
ON public.receipts 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own receipts" 
ON public.receipts 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own receipts" 
ON public.receipts 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create receipt items table
CREATE TABLE public.receipt_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'amount',
  line_total NUMERIC NOT NULL DEFAULT 0,
  is_software BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for receipt items
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for receipt items
CREATE POLICY "Users can create receipt items for their receipts" 
ON public.receipt_items 
FOR INSERT 
WITH CHECK (receipt_id IN (
  SELECT id FROM public.receipts WHERE created_by = auth.uid()
));

CREATE POLICY "Users can view receipt items for their receipts" 
ON public.receipt_items 
FOR SELECT 
USING (receipt_id IN (
  SELECT id FROM public.receipts WHERE created_by = auth.uid()
));

CREATE POLICY "Users can update receipt items for their receipts" 
ON public.receipt_items 
FOR UPDATE 
USING (receipt_id IN (
  SELECT id FROM public.receipts WHERE created_by = auth.uid()
));

CREATE POLICY "Users can delete receipt items for their receipts" 
ON public.receipt_items 
FOR DELETE 
USING (receipt_id IN (
  SELECT id FROM public.receipts WHERE created_by = auth.uid()
));

-- Create function to generate receipt number
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

-- Create trigger function to set receipt number
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

-- Create trigger for automatic receipt number generation
CREATE TRIGGER set_receipt_number_trigger
  BEFORE INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_receipt_number();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();