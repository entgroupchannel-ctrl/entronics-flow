-- Add missing columns to existing suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC,
ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS erp_sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS erp_supplier_code TEXT UNIQUE;

-- Update supplier_grade to use enum (if not already)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_grade') THEN
    CREATE TYPE supplier_grade AS ENUM ('A+', 'A', 'B+', 'B', 'C');
  END IF;
END $$;

-- Create supplier_products table (สินค้าของซัพพลายเออร์)
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT,
  description TEXT,
  unit_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  minimum_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_evaluations table (การประเมินซัพพลายเออร์)
CREATE TABLE IF NOT EXISTS public.supplier_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  
  evaluated_by UUID REFERENCES auth.users(id),
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  quality_score NUMERIC(2,1) NOT NULL CHECK (quality_score >= 0 AND quality_score <= 5),
  price_score NUMERIC(2,1) NOT NULL CHECK (price_score >= 0 AND price_score <= 5),
  delivery_score NUMERIC(2,1) NOT NULL CHECK (delivery_score >= 0 AND delivery_score <= 5),
  communication_score NUMERIC(2,1) CHECK (communication_score >= 0 AND communication_score <= 5),
  
  overall_rating NUMERIC(2,1) GENERATED ALWAYS AS (
    (quality_score + price_score + delivery_score + COALESCE(communication_score, 0)) / 
    CASE WHEN communication_score IS NULL THEN 3 ELSE 4 END
  ) STORED,
  
  comments TEXT,
  order_reference TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_inquiries table (ใบสอบราคาสินค้า)
CREATE TABLE IF NOT EXISTS public.product_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number TEXT NOT NULL UNIQUE,
  
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  
  product_name TEXT NOT NULL,
  product_description TEXT,
  quantity INTEGER NOT NULL,
  target_price NUMERIC,
  currency TEXT DEFAULT 'THB',
  
  required_delivery_date DATE,
  special_requirements TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'quoted', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_responses table (การตอบกลับใบสอบราคา)
CREATE TABLE IF NOT EXISTS public.supplier_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES public.product_inquiries(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  
  quoted_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  lead_time_days INTEGER,
  minimum_quantity INTEGER DEFAULT 1,
  
  validity_days INTEGER DEFAULT 30,
  payment_terms TEXT,
  delivery_terms TEXT,
  
  response_notes TEXT,
  attachments_url TEXT[],
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'negotiating')),
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sync_logs table (บันทึกการซิงค์ข้อมูล)
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  sync_type TEXT NOT NULL, -- 'supplier', 'product', 'inquiry', etc.
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'retry')),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('to_erp', 'from_erp', 'bidirectional')),
  
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  synced_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  sync_data JSONB,
  response_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for supplier_products
CREATE POLICY "Users can view supplier products" ON public.supplier_products
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can manage supplier products" ON public.supplier_products
  FOR ALL USING (can_manage_customers(auth.uid()));

-- Create RLS policies for supplier_evaluations
CREATE POLICY "Users can view supplier evaluations" ON public.supplier_evaluations
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can create supplier evaluations" ON public.supplier_evaluations
  FOR INSERT WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = evaluated_by);

CREATE POLICY "Users can update their own evaluations" ON public.supplier_evaluations
  FOR UPDATE USING (auth.uid() = evaluated_by OR has_role(auth.uid(), 'admin'));

-- Create RLS policies for product_inquiries
CREATE POLICY "Users can view product inquiries" ON public.product_inquiries
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can create product inquiries" ON public.product_inquiries
  FOR INSERT WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Users can update product inquiries" ON public.product_inquiries
  FOR UPDATE USING (can_manage_customers(auth.uid()));

-- Create RLS policies for supplier_responses
CREATE POLICY "Users can view supplier responses" ON public.supplier_responses
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can manage supplier responses" ON public.supplier_responses
  FOR ALL USING (can_manage_customers(auth.uid()));

-- Create RLS policies for sync_logs
CREATE POLICY "Admins can view sync logs" ON public.sync_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage sync logs" ON public.sync_logs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_grade ON public.suppliers(supplier_grade);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_sync_status ON public.suppliers(erp_sync_status);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON public.supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_evaluations_supplier ON public.supplier_evaluations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_status ON public.product_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_supplier_responses_inquiry ON public.supplier_responses(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_entity ON public.sync_logs(entity_id, entity_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_supplier_products_updated_at
  BEFORE UPDATE ON public.supplier_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_inquiries_updated_at
  BEFORE UPDATE ON public.product_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_responses_updated_at
  BEFORE UPDATE ON public.supplier_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_logs_updated_at
  BEFORE UPDATE ON public.sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-generate inquiry numbers
CREATE TRIGGER set_inquiry_number_trigger
  BEFORE INSERT ON public.product_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_inquiry_number();

-- Create trigger to update supplier scores when evaluations change
CREATE TRIGGER update_supplier_scores_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.supplier_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_scores();