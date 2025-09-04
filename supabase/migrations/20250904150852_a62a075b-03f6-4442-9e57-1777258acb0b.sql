-- Create supplier grade enum (if not exists)
DO $$ BEGIN
    CREATE TYPE supplier_grade AS ENUM ('A+', 'A', 'B+', 'B', 'C');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to existing suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC,
ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS erp_sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS erp_supplier_code TEXT UNIQUE;

-- Update supplier_grade column to use enum (only if it's currently text)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' 
        AND column_name = 'supplier_grade' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE public.suppliers 
        ALTER COLUMN supplier_grade TYPE supplier_grade 
        USING supplier_grade::supplier_grade;
    END IF;
END $$;

-- Create supplier_products table (if not exists)
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

-- Create supplier_evaluations table (if not exists)
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

-- Create product_inquiries table (if not exists)
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

-- Create supplier_responses table (if not exists)
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

-- Create sync_logs table (if not exists)
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

-- Enable RLS on new tables (skip if already enabled)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_products'
  ) THEN
    ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_evaluations'
  ) THEN
    ALTER TABLE public.supplier_evaluations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_inquiries'
  ) THEN
    ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_responses'
  ) THEN
    ALTER TABLE public.supplier_responses ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sync_logs'
  ) THEN
    ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies for supplier_products
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_products' AND policyname = 'Users can view supplier products'
  ) THEN
    CREATE POLICY "Users can view supplier products" ON public.supplier_products
      FOR SELECT USING (can_manage_customers(auth.uid()));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_products' AND policyname = 'Users can manage supplier products'
  ) THEN
    CREATE POLICY "Users can manage supplier products" ON public.supplier_products
      FOR ALL USING (can_manage_customers(auth.uid()));
  END IF;
END $$;

-- Create RLS policies for supplier_evaluations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_evaluations' AND policyname = 'Users can view supplier evaluations'
  ) THEN
    CREATE POLICY "Users can view supplier evaluations" ON public.supplier_evaluations
      FOR SELECT USING (can_manage_customers(auth.uid()));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_evaluations' AND policyname = 'Users can create supplier evaluations'
  ) THEN
    CREATE POLICY "Users can create supplier evaluations" ON public.supplier_evaluations
      FOR INSERT WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = evaluated_by);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_evaluations' AND policyname = 'Users can update their own evaluations'
  ) THEN
    CREATE POLICY "Users can update their own evaluations" ON public.supplier_evaluations
      FOR UPDATE USING (auth.uid() = evaluated_by OR has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Create RLS policies for product_inquiries
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_inquiries' AND policyname = 'Users can view product inquiries'
  ) THEN
    CREATE POLICY "Users can view product inquiries" ON public.product_inquiries
      FOR SELECT USING (can_manage_customers(auth.uid()));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_inquiries' AND policyname = 'Users can create product inquiries'
  ) THEN
    CREATE POLICY "Users can create product inquiries" ON public.product_inquiries
      FOR INSERT WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = created_by);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_inquiries' AND policyname = 'Users can update product inquiries'
  ) THEN
    CREATE POLICY "Users can update product inquiries" ON public.product_inquiries
      FOR UPDATE USING (can_manage_customers(auth.uid()));
  END IF;
END $$;

-- Create RLS policies for supplier_responses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_responses' AND policyname = 'Users can view supplier responses'
  ) THEN
    CREATE POLICY "Users can view supplier responses" ON public.supplier_responses
      FOR SELECT USING (can_manage_customers(auth.uid()));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_responses' AND policyname = 'Users can manage supplier responses'
  ) THEN
    CREATE POLICY "Users can manage supplier responses" ON public.supplier_responses
      FOR ALL USING (can_manage_customers(auth.uid()));
  END IF;
END $$;

-- Create RLS policies for sync_logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sync_logs' AND policyname = 'Admins can view sync logs'
  ) THEN
    CREATE POLICY "Admins can view sync logs" ON public.sync_logs
      FOR SELECT USING (has_role(auth.uid(), 'admin'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sync_logs' AND policyname = 'System can manage sync logs'
  ) THEN
    CREATE POLICY "System can manage sync logs" ON public.sync_logs
      FOR ALL USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Create indexes for better performance (skip if exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_grade') THEN
    CREATE INDEX idx_suppliers_grade ON public.suppliers(supplier_grade);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_sync_status') THEN
    CREATE INDEX idx_suppliers_sync_status ON public.suppliers(erp_sync_status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_supplier_products_supplier') THEN
    CREATE INDEX idx_supplier_products_supplier ON public.supplier_products(supplier_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_supplier_evaluations_supplier') THEN
    CREATE INDEX idx_supplier_evaluations_supplier ON public.supplier_evaluations(supplier_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_inquiries_status') THEN
    CREATE INDEX idx_product_inquiries_status ON public.product_inquiries(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_supplier_responses_inquiry') THEN
    CREATE INDEX idx_supplier_responses_inquiry ON public.supplier_responses(inquiry_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sync_logs_status') THEN
    CREATE INDEX idx_sync_logs_status ON public.sync_logs(sync_status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sync_logs_entity') THEN
    CREATE INDEX idx_sync_logs_entity ON public.sync_logs(entity_id, entity_type);
  END IF;
END $$;

-- Create triggers for updated_at columns (skip if exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_supplier_products_updated_at'
  ) THEN
    CREATE TRIGGER update_supplier_products_updated_at
      BEFORE UPDATE ON public.supplier_products
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_inquiries_updated_at'
  ) THEN
    CREATE TRIGGER update_product_inquiries_updated_at
      BEFORE UPDATE ON public.product_inquiries
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_supplier_responses_updated_at'
  ) THEN
    CREATE TRIGGER update_supplier_responses_updated_at
      BEFORE UPDATE ON public.supplier_responses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_sync_logs_updated_at'
  ) THEN
    CREATE TRIGGER update_sync_logs_updated_at
      BEFORE UPDATE ON public.sync_logs
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_inquiry_number_trigger'
  ) THEN
    CREATE TRIGGER set_inquiry_number_trigger
      BEFORE INSERT ON public.product_inquiries
      FOR EACH ROW
      EXECUTE FUNCTION public.set_inquiry_number();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_supplier_scores_trigger'
  ) THEN
    CREATE TRIGGER update_supplier_scores_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.supplier_evaluations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_supplier_scores();
  END IF;
END $$;