-- เพิ่มสถานะและข้อมูลสำหรับการลงทะเบียน Supplier
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_registration_status TEXT DEFAULT 'draft';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_application_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_approved_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_rejection_reason TEXT;

-- เพิ่มข้อมูลสำหรับ Supplier ต่างประเทศ
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_registration_number TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS main_products TEXT[];
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS reference_contacts JSONB;

-- เพิ่ม indexes สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_customers_supplier_status ON public.customers(supplier_registration_status) WHERE customer_type = 'ผู้จัดจำหน่าย';
CREATE INDEX IF NOT EXISTS idx_customers_supplier_country ON public.customers(supplier_country) WHERE customer_type = 'ผู้จัดจำหน่าย';

-- สร้างตาราง supplier_documents สำหรับเก็บเอกสารประกอบการสมัคร
CREATE TABLE IF NOT EXISTS public.supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'business_license', 'tax_certificate', 'bank_statement', 'product_catalog', 'quality_certificate'
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for supplier_documents
ALTER TABLE public.supplier_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for supplier_documents
CREATE POLICY "Authorized users can manage supplier documents" ON public.supplier_documents
  FOR ALL USING (can_manage_customers(auth.uid()));

-- สร้างตาราง supplier_evaluation สำหรับการประเมิน Supplier
CREATE TABLE IF NOT EXISTS public.supplier_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  evaluated_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- คะแนนการประเมิน (1-5)
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  price_score INTEGER CHECK (price_score >= 1 AND price_score <= 5),
  delivery_score INTEGER CHECK (delivery_score >= 1 AND delivery_score <= 5),
  communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
  service_score INTEGER CHECK (service_score >= 1 AND service_score <= 5),
  
  overall_score NUMERIC GENERATED ALWAYS AS ((quality_score + price_score + delivery_score + communication_score + service_score)::NUMERIC / 5) STORED,
  
  strengths TEXT,
  weaknesses TEXT,
  recommendations TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for supplier_evaluations
ALTER TABLE public.supplier_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS policies for supplier_evaluations
CREATE POLICY "Authorized users can manage supplier evaluations" ON public.supplier_evaluations
  FOR ALL USING (can_manage_customers(auth.uid()));

-- สร้าง function เพื่อปรับปรุงคะแนนใน customers table
CREATE OR REPLACE FUNCTION public.update_supplier_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_quality NUMERIC;
  avg_price NUMERIC;
  avg_reliability NUMERIC;
  total_evaluations INTEGER;
BEGIN
  -- Calculate average scores from evaluations
  SELECT 
    AVG(quality_score),
    AVG(price_score),
    AVG(delivery_score),
    COUNT(*)
  INTO avg_quality, avg_price, avg_reliability, total_evaluations
  FROM public.supplier_evaluations
  WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  
  -- Update supplier scores
  UPDATE public.customers
  SET 
    quality_rating = COALESCE(avg_quality, quality_rating),
    price_rating = COALESCE(avg_price, price_rating),
    delivery_rating = COALESCE(avg_reliability, delivery_rating),
    updated_at = now()
  WHERE id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- สร้าง trigger สำหรับการปรับปรุงคะแนน
DROP TRIGGER IF EXISTS update_supplier_scores_trigger ON public.supplier_evaluations;
CREATE TRIGGER update_supplier_scores_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.supplier_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_supplier_scores();

-- อัปเดต trigger สำหรับ updated_at
CREATE TRIGGER update_supplier_documents_updated_at
  BEFORE UPDATE ON public.supplier_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_evaluations_updated_at
  BEFORE UPDATE ON public.supplier_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();