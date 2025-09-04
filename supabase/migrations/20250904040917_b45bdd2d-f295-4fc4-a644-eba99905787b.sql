-- Add supplier specific columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS supplier_code TEXT,
ADD COLUMN IF NOT EXISTS supplier_category TEXT,
ADD COLUMN IF NOT EXISTS supplier_country TEXT,
ADD COLUMN IF NOT EXISTS supplier_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC,
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC,
ADD COLUMN IF NOT EXISTS preferred_payment_method TEXT,
ADD COLUMN IF NOT EXISTS banking_swift_code TEXT,
ADD COLUMN IF NOT EXISTS banking_correspondent_bank TEXT,
ADD COLUMN IF NOT EXISTS banking_routing_number TEXT,
ADD COLUMN IF NOT EXISTS banking_iban TEXT,
ADD COLUMN IF NOT EXISTS contact_person_finance TEXT,
ADD COLUMN IF NOT EXISTS contact_email_finance TEXT,
ADD COLUMN IF NOT EXISTS contact_phone_finance TEXT,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS delivery_rating INTEGER CHECK (delivery_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS price_rating INTEGER CHECK (price_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS last_order_date DATE,
ADD COLUMN IF NOT EXISTS total_orders_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tax_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS business_license_url TEXT,
ADD COLUMN IF NOT EXISTS is_preferred_supplier BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supplier_notes TEXT;

-- Create supplier categories table
CREATE TABLE IF NOT EXISTS public.supplier_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default supplier categories
INSERT INTO public.supplier_categories (name, description) VALUES
('อิเล็กทรอนิกส์', 'สินค้าและอะไหล่อิเล็กทรอนิกส์'),
('เครื่องจักร', 'เครื่องจักรและอุปกรณ์อุตสาหกรรม'),
('วัตถุดิบ', 'วัตถุดิบและส่วนประกอบ'),
('บรรจุภัณฑ์', 'วัสดุบรรจุภัณฑ์'),
('เซอร์วิส', 'บริการต่างๆ'),
('อื่นๆ', 'หมวดหมู่อื่นๆ')
ON CONFLICT (name) DO NOTHING;

-- Create supplier payment history table
CREATE TABLE IF NOT EXISTS public.supplier_payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  transfer_request_id UUID REFERENCES public.international_transfer_requests(id),
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate NUMERIC,
  thb_amount NUMERIC,
  payment_method TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies for supplier_categories
CREATE POLICY "Everyone can view active supplier categories"
ON public.supplier_categories
FOR SELECT
TO authenticated
USING (is_active = TRUE);

CREATE POLICY "Admins can manage supplier categories"
ON public.supplier_categories
FOR ALL
TO authenticated
USING (can_manage_customers(auth.uid()));

-- Create policies for supplier_payment_history
CREATE POLICY "Authorized users can view supplier payment history"
ON public.supplier_payment_history
FOR SELECT
TO authenticated
USING (can_manage_customers(auth.uid()));

CREATE POLICY "Authorized users can manage supplier payment history"
ON public.supplier_payment_history
FOR ALL
TO authenticated
USING (can_manage_customers(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_supplier_categories_updated_at
BEFORE UPDATE ON public.supplier_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_payment_history_updated_at
BEFORE UPDATE ON public.supplier_payment_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_supplier_code ON public.customers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_customers_supplier_category ON public.customers(supplier_category);
CREATE INDEX IF NOT EXISTS idx_customers_supplier_country ON public.customers(supplier_country);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON public.customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_supplier_payment_history_supplier_id ON public.supplier_payment_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payment_history_payment_date ON public.supplier_payment_history(payment_date);

-- Create view for supplier summary
CREATE OR REPLACE VIEW public.supplier_summary AS
SELECT 
  c.id,
  c.name,
  c.supplier_code,
  c.supplier_category,
  c.supplier_country,
  c.supplier_currency,
  c.bank_name,
  c.bank_account,
  c.banking_swift_code,
  c.contact_person,
  c.contact_person_finance,
  c.contact_email_finance,
  c.email,
  c.phone,
  c.quality_rating,
  c.delivery_rating,
  c.price_rating,
  c.last_order_date,
  c.total_orders_count,
  c.total_orders_value,
  c.compliance_status,
  c.is_preferred_supplier,
  c.created_at,
  c.updated_at,
  COALESCE(recent_transfers.recent_transfer_count, 0) as recent_transfer_count,
  COALESCE(recent_transfers.recent_transfer_amount, 0) as recent_transfer_amount
FROM public.customers c
LEFT JOIN (
  SELECT 
    supplier_id,
    COUNT(*) as recent_transfer_count,
    SUM(transfer_amount) as recent_transfer_amount
  FROM public.international_transfer_requests
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY supplier_id
) recent_transfers ON c.id = recent_transfers.supplier_id
WHERE c.customer_type = 'ผู้จัดจำหน่าย';