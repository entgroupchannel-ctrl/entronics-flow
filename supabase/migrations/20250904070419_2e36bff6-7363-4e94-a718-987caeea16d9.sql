-- Create purchase_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  quotation_id UUID REFERENCES public.quotations(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  payment_terms TEXT,
  payment_terms_type TEXT DEFAULT 'cash',
  credit_terms_days INTEGER,
  advance_payment_percentage NUMERIC(5,2) DEFAULT 0,
  advance_payment_amount NUMERIC(15,2) DEFAULT 0,
  shipping_method TEXT,
  shipping_cost NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchase orders" 
ON public.purchase_orders 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own purchase orders" 
ON public.purchase_orders 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own purchase orders" 
ON public.purchase_orders 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own purchase orders" 
ON public.purchase_orders 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create purchase order items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_sku TEXT,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_software BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for items
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for items
CREATE POLICY "Users can manage items for their purchase orders" 
ON public.purchase_order_items 
FOR ALL 
USING (purchase_order_id IN (
  SELECT id FROM public.purchase_orders WHERE created_by = auth.uid()
));

-- Create function to generate PO number
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  po_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month with PO prefix
  SELECT COALESCE(MAX(
    CASE 
      WHEN po.po_number ~ ('^PO' || current_year || current_month || '[0-9]{5}$')
      THEN SUBSTRING(po.po_number FROM LENGTH(po.po_number) - 4)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.purchase_orders po;
  
  po_number := 'PO' || current_year || current_month || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN po_number;
END;
$$;

-- Create trigger to set PO number
CREATE OR REPLACE FUNCTION public.set_po_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := generate_po_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS set_po_number_trigger ON public.purchase_orders;
CREATE TRIGGER set_po_number_trigger
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_po_number();

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_customer_id ON public.purchase_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_quotation_id ON public.purchase_orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_date ON public.purchase_orders(po_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);