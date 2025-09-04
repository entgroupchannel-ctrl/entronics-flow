-- Create Purchase Orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'cancelled')),
  currency TEXT NOT NULL DEFAULT 'THB',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_terms TEXT DEFAULT '30 วัน',
  delivery_address TEXT,
  special_instructions TEXT,
  attachment_urls TEXT[],
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Purchase Order Items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_sequence INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_orders
CREATE POLICY "Authorized users can view purchase orders" 
ON public.purchase_orders 
FOR SELECT 
USING (can_manage_customers(auth.uid()));

CREATE POLICY "Authorized users can create purchase orders" 
ON public.purchase_orders 
FOR INSERT 
WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Authorized users can update purchase orders" 
ON public.purchase_orders 
FOR UPDATE 
USING (can_manage_customers(auth.uid()));

CREATE POLICY "Only admins can delete purchase orders" 
ON public.purchase_orders 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for purchase_order_items
CREATE POLICY "Users can view items for accessible purchase orders" 
ON public.purchase_order_items 
FOR SELECT 
USING (purchase_order_id IN (
  SELECT id FROM public.purchase_orders 
  WHERE can_manage_customers(auth.uid())
));

CREATE POLICY "Users can create items for accessible purchase orders" 
ON public.purchase_order_items 
FOR INSERT 
WITH CHECK (purchase_order_id IN (
  SELECT id FROM public.purchase_orders 
  WHERE can_manage_customers(auth.uid())
));

CREATE POLICY "Users can update items for accessible purchase orders" 
ON public.purchase_order_items 
FOR UPDATE 
USING (purchase_order_id IN (
  SELECT id FROM public.purchase_orders 
  WHERE can_manage_customers(auth.uid())
));

CREATE POLICY "Users can delete items for accessible purchase orders" 
ON public.purchase_order_items 
FOR DELETE 
USING (purchase_order_id IN (
  SELECT id FROM public.purchase_orders 
  WHERE can_manage_customers(auth.uid())
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
  sequence_num INTEGER;
  po_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN po.po_number ~ ('^PO' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(po.po_number FROM LENGTH(po.po_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.purchase_orders po;
  
  po_number := 'PO' || current_year || LPAD(sequence_num::TEXT, 6, '0');
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

CREATE TRIGGER set_purchase_order_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_po_number();

-- Create trigger to update updated_at
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();