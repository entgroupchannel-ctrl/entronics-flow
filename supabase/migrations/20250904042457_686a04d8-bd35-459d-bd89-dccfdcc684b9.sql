-- เพิ่มสถานะและข้อมูลสำหรับการลงทะเบียน Supplier
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_registration_status TEXT DEFAULT 'draft';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_application_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_approved_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS supplier_approved_by UUID;
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
  uploaded_by UUID,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID,
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

-- สร้าง trigger สำหรับ supplier_documents updated_at (ถ้ายังไม่มี)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_supplier_documents_updated_at'
  ) THEN
    CREATE TRIGGER update_supplier_documents_updated_at
      BEFORE UPDATE ON public.supplier_documents
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;