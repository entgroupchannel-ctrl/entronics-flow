-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  withholding_tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_software BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Create policies for quotations
CREATE POLICY "Users can view their own quotations" 
ON public.quotations 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own quotations" 
ON public.quotations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quotations" 
ON public.quotations 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quotations" 
ON public.quotations 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for quotation items
CREATE POLICY "Users can view quotation items for their quotations" 
ON public.quotation_items 
FOR SELECT 
USING (
  quotation_id IN (
    SELECT id FROM public.quotations WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can create quotation items for their quotations" 
ON public.quotation_items 
FOR INSERT 
WITH CHECK (
  quotation_id IN (
    SELECT id FROM public.quotations WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update quotation items for their quotations" 
ON public.quotation_items 
FOR UPDATE 
USING (
  quotation_id IN (
    SELECT id FROM public.quotations WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete quotation items for their quotations" 
ON public.quotation_items 
FOR DELETE 
USING (
  quotation_id IN (
    SELECT id FROM public.quotations WHERE created_by = auth.uid()
  )
);

-- Create function to generate quotation number
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  quotation_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN q.quotation_number ~ ('^QT' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(q.quotation_number FROM LENGTH(q.quotation_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.quotations q;
  
  quotation_number := 'QT' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN quotation_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate quotation number
CREATE OR REPLACE FUNCTION public.set_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quotation_number IS NULL OR NEW.quotation_number = '' THEN
    NEW.quotation_number := generate_quotation_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_quotation_number_trigger
  BEFORE INSERT ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION set_quotation_number();

-- Create trigger for updated_at
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();