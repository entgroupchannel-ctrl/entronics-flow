-- Create tax_invoices table (ใบส่งสินค้า/ใบกำกับภาษี)
CREATE TABLE public.tax_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_invoice_number TEXT NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  tax_invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  withholding_tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_terms TEXT DEFAULT '30 วัน',
  project_name TEXT,
  po_number TEXT
);

-- Create tax_invoice_items table
CREATE TABLE public.tax_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_invoice_id UUID REFERENCES public.tax_invoices(id) ON DELETE CASCADE,
  product_id UUID,
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

-- Enable RLS
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax_invoices
CREATE POLICY "Users can create their own tax invoices" 
ON public.tax_invoices 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own tax invoices" 
ON public.tax_invoices 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own tax invoices" 
ON public.tax_invoices 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tax invoices" 
ON public.tax_invoices 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for tax_invoice_items
CREATE POLICY "Users can create tax invoice items for their tax invoices" 
ON public.tax_invoice_items 
FOR INSERT 
WITH CHECK (tax_invoice_id IN (
  SELECT id FROM public.tax_invoices WHERE created_by = auth.uid()
));

CREATE POLICY "Users can view tax invoice items for their tax invoices" 
ON public.tax_invoice_items 
FOR SELECT 
USING (tax_invoice_id IN (
  SELECT id FROM public.tax_invoices WHERE created_by = auth.uid()
));

CREATE POLICY "Users can update tax invoice items for their tax invoices" 
ON public.tax_invoice_items 
FOR UPDATE 
USING (tax_invoice_id IN (
  SELECT id FROM public.tax_invoices WHERE created_by = auth.uid()
));

CREATE POLICY "Users can delete tax invoice items for their tax invoices" 
ON public.tax_invoice_items 
FOR DELETE 
USING (tax_invoice_id IN (
  SELECT id FROM public.tax_invoices WHERE created_by = auth.uid()
));

-- Update invoice number generation to use BL prefix
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
  
  -- Get next sequence number for this month with BL prefix
  SELECT COALESCE(MAX(
    CASE 
      WHEN inv.invoice_number ~ ('^BL' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(inv.invoice_number FROM LENGTH(inv.invoice_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.invoices inv;
  
  invoice_number := 'BL' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN invoice_number;
END;
$$;

-- Create function to generate tax invoice numbers with INV prefix
CREATE OR REPLACE FUNCTION public.generate_tax_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  tax_invoice_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month with INV prefix
  SELECT COALESCE(MAX(
    CASE 
      WHEN tinv.tax_invoice_number ~ ('^INV' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(tinv.tax_invoice_number FROM LENGTH(tinv.tax_invoice_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.tax_invoices tinv;
  
  tax_invoice_number := 'INV' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN tax_invoice_number;
END;
$$;

-- Create trigger to auto-generate tax invoice numbers
CREATE OR REPLACE FUNCTION public.set_tax_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tax_invoice_number IS NULL OR NEW.tax_invoice_number = '' THEN
    NEW.tax_invoice_number := generate_tax_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_tax_invoice_number
  BEFORE INSERT ON public.tax_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tax_invoice_number();

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_tax_invoices_updated_at
  BEFORE UPDATE ON public.tax_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();