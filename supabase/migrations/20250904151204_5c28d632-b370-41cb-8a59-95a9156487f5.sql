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