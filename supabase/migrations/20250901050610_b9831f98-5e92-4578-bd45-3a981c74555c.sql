-- สร้างตารางสำหรับวิธีการจัดส่ง
CREATE TABLE public.delivery_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tracking_url_template TEXT, -- template สำหรับสร้าง tracking URL
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert ข้อมูลวิธีการจัดส่งเริ่มต้น
INSERT INTO public.delivery_methods (name, code, description, tracking_url_template) VALUES
('พนักงานส่งเอง', 'STAFF', 'พนักงานบริษัทจัดส่งเอง', null),
('Kerry Express', 'KERRY', 'Kerry Express', 'https://th.kerryexpress.com/th/track/?track={tracking_number}'),
('EMS Thailand Post', 'EMS', 'EMS ไปรษณีย์ไทย', 'https://track.thailandpost.co.th/?trackNumber={tracking_number}'),
('ลูกค้ามารับเอง', 'PICKUP', 'ลูกค้ามารับสินค้าที่บริษัท', null);

-- สร้างตารางสำหรับใบรับซ่อม
CREATE TABLE public.repair_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repair_number TEXT NOT NULL UNIQUE,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  received_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_completion_date DATE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'completed', 'ready_to_ship', 'shipped')),
  item_description TEXT NOT NULL,
  problem_description TEXT,
  repair_notes TEXT,
  repair_cost NUMERIC(10,2),
  parts_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  received_by UUID,
  completed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับ Purchase Orders
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  customer_company TEXT,
  po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready_to_ship', 'shipped', 'delivered')),
  total_amount NUMERIC(12,2),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับใบจัดส่งหลัก
CREATE TABLE public.delivery_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL CHECK (order_type IN ('repair', 'new_product', 'warranty_replacement')),
  repair_order_id UUID REFERENCES public.repair_orders(id),
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  customer_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_method_id UUID NOT NULL REFERENCES public.delivery_methods(id),
  tracking_number TEXT,
  tracking_url TEXT,
  status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'ready_to_ship', 'shipped', 'in_transit', 'delivered', 'failed', 'returned')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'express')),
  scheduled_date DATE,
  shipped_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  shipping_cost NUMERIC(10,2),
  insurance_cost NUMERIC(10,2),
  has_insurance BOOLEAN NOT NULL DEFAULT false,
  insurance_value NUMERIC(12,2),
  weight_kg NUMERIC(8,2),
  dimensions_cm TEXT, -- format: "length x width x height"
  special_instructions TEXT,
  delivery_notes TEXT,
  signature_required BOOLEAN NOT NULL DEFAULT false,
  cod_amount NUMERIC(10,2), -- cash on delivery
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับรายการสินค้าในใบจัดส่ง
CREATE TABLE public.delivery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  item_name TEXT NOT NULL,
  item_sku TEXT,
  barcode TEXT,
  qr_code TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  serial_numbers TEXT[], -- array of serial numbers
  warranty_start_date DATE,
  warranty_end_date DATE,
  warranty_period_days INTEGER DEFAULT 7,
  is_warranty_active BOOLEAN NOT NULL DEFAULT true,
  condition_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับสื่อ (รูปภาพ/วิดีโอ)
CREATE TABLE public.delivery_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  delivery_item_id UUID REFERENCES public.delivery_items(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  media_stage TEXT NOT NULL CHECK (media_stage IN ('before_repair', 'after_repair', 'before_shipping', 'delivered', 'damaged')),
  description TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับการติดตามสถานะ
CREATE TABLE public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  status_message TEXT NOT NULL,
  location TEXT,
  tracking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_internal BOOLEAN NOT NULL DEFAULT true, -- true = internal update, false = from shipping provider
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับระบบประกัน
CREATE TABLE public.product_warranties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_item_id UUID NOT NULL REFERENCES public.delivery_items(id),
  customer_id UUID,
  product_name TEXT NOT NULL,
  serial_number TEXT,
  registration_code TEXT UNIQUE, -- รหัสสำหรับลูกค้าลงทะเบียน
  warranty_start_date DATE NOT NULL,
  warranty_end_date DATE NOT NULL,
  warranty_type TEXT NOT NULL DEFAULT 'standard' CHECK (warranty_type IN ('standard', 'extended', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'claimed', 'void')),
  registration_date TIMESTAMP WITH TIME ZONE,
  registered_by_customer BOOLEAN NOT NULL DEFAULT false,
  claim_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับการเคลมประกัน
CREATE TABLE public.warranty_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_id UUID NOT NULL REFERENCES public.product_warranties(id),
  claim_number TEXT NOT NULL UNIQUE,
  claim_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  problem_description TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected', 'processing', 'completed')),
  resolution TEXT,
  replacement_delivery_id UUID REFERENCES public.delivery_orders(id),
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Delivery methods - anyone can view, only admins can modify
CREATE POLICY "Anyone can view delivery methods" ON public.delivery_methods FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery methods" ON public.delivery_methods FOR ALL USING (can_manage_inventory(auth.uid()));

-- Repair orders - authenticated users can view and create, admins can manage
CREATE POLICY "Authenticated users can view repair orders" ON public.repair_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create repair orders" ON public.repair_orders FOR INSERT WITH CHECK (auth.uid() = received_by);
CREATE POLICY "Admins can manage repair orders" ON public.repair_orders FOR ALL USING (can_manage_inventory(auth.uid()));

-- Purchase orders - similar to repair orders
CREATE POLICY "Authenticated users can view purchase orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create purchase orders" ON public.purchase_orders FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage purchase orders" ON public.purchase_orders FOR ALL USING (can_manage_inventory(auth.uid()));

-- Delivery orders - authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view delivery orders" ON public.delivery_orders FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery orders" ON public.delivery_orders FOR ALL USING (can_manage_inventory(auth.uid()));

-- Delivery items - authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view delivery items" ON public.delivery_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery items" ON public.delivery_items FOR ALL USING (can_manage_inventory(auth.uid()));

-- Delivery media - authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view delivery media" ON public.delivery_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery media" ON public.delivery_media FOR ALL USING (can_manage_inventory(auth.uid()));

-- Delivery tracking - authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view delivery tracking" ON public.delivery_tracking FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery tracking" ON public.delivery_tracking FOR ALL USING (can_manage_inventory(auth.uid()));

-- Product warranties - public can view with registration code, authenticated users can view all
CREATE POLICY "Public can view warranties with registration code" ON public.product_warranties FOR SELECT USING (registration_code IS NOT NULL);
CREATE POLICY "Authenticated users can view all warranties" ON public.product_warranties FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage warranties" ON public.product_warranties FOR ALL USING (can_manage_inventory(auth.uid()));

-- Warranty claims - public can submit, authenticated users can view, admins can manage
CREATE POLICY "Public can submit warranty claims" ON public.warranty_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view warranty claims" ON public.warranty_claims FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage warranty claims" ON public.warranty_claims FOR ALL USING (can_manage_inventory(auth.uid()));

-- Functions for generating numbers
CREATE OR REPLACE FUNCTION public.generate_repair_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  repair_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN ro.repair_number ~ ('^RP' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(ro.repair_number FROM LENGTH(ro.repair_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.repair_orders ro;
  
  repair_number := 'RP' || current_year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN repair_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_delivery_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  delivery_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN do.delivery_number ~ ('^DL' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(do.delivery_number FROM LENGTH(do.delivery_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.delivery_orders do;
  
  delivery_number := 'DL' || current_year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN delivery_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  claim_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN wc.claim_number ~ ('^CL' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(wc.claim_number FROM LENGTH(wc.claim_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.warranty_claims wc;
  
  claim_number := 'CL' || current_year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN claim_number;
END;
$$;

-- Triggers for auto-generating numbers
CREATE OR REPLACE FUNCTION public.set_repair_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.repair_number IS NULL OR NEW.repair_number = '' THEN
    NEW.repair_number := generate_repair_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_delivery_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.delivery_number IS NULL OR NEW.delivery_number = '' THEN
    NEW.delivery_number := generate_delivery_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_set_repair_number 
  BEFORE INSERT ON public.repair_orders 
  FOR EACH ROW EXECUTE FUNCTION set_repair_number();

CREATE TRIGGER trigger_set_delivery_number 
  BEFORE INSERT ON public.delivery_orders 
  FOR EACH ROW EXECUTE FUNCTION set_delivery_number();

CREATE TRIGGER trigger_set_claim_number 
  BEFORE INSERT ON public.warranty_claims 
  FOR EACH ROW EXECUTE FUNCTION set_claim_number();

-- Create triggers for updated_at
CREATE TRIGGER update_repair_orders_updated_at
  BEFORE UPDATE ON public.repair_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_orders_updated_at
  BEFORE UPDATE ON public.delivery_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_warranties_updated_at
  BEFORE UPDATE ON public.product_warranties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_claims_updated_at
  BEFORE UPDATE ON public.warranty_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_methods_updated_at
  BEFORE UPDATE ON public.delivery_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set warranty dates and generate registration code
CREATE OR REPLACE FUNCTION public.set_warranty_info()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set warranty start date if not provided
  IF NEW.warranty_start_date IS NULL THEN
    NEW.warranty_start_date := CURRENT_DATE;
  END IF;
  
  -- Set warranty end date based on start date and period
  IF NEW.warranty_end_date IS NULL AND NEW.warranty_period_days IS NOT NULL THEN
    NEW.warranty_end_date := NEW.warranty_start_date + INTERVAL '1 day' * NEW.warranty_period_days;
  END IF;
  
  -- Generate registration code if not provided
  IF NEW.registration_code IS NULL THEN
    NEW.registration_code := 'REG' || EXTRACT(YEAR FROM now())::TEXT || LPAD(floor(random() * 1000000)::TEXT, 6, '0');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_warranty_info
  BEFORE INSERT ON public.delivery_items
  FOR EACH ROW EXECUTE FUNCTION set_warranty_info();

-- Function to auto-create warranty record when delivery item is created
CREATE OR REPLACE FUNCTION public.create_warranty_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create warranty for items with warranty period
  IF NEW.warranty_period_days > 0 THEN
    INSERT INTO public.product_warranties (
      delivery_item_id,
      customer_id,
      product_name,
      serial_number,
      registration_code,
      warranty_start_date,
      warranty_end_date
    ) VALUES (
      NEW.id,
      (SELECT customer_id FROM public.delivery_orders WHERE id = NEW.delivery_order_id),
      NEW.item_name,
      CASE WHEN array_length(NEW.serial_numbers, 1) > 0 THEN NEW.serial_numbers[1] ELSE NULL END,
      'REG' || EXTRACT(YEAR FROM now())::TEXT || LPAD(floor(random() * 1000000)::TEXT, 6, '0'),
      COALESCE(NEW.warranty_start_date, CURRENT_DATE),
      COALESCE(NEW.warranty_end_date, CURRENT_DATE + INTERVAL '1 day' * NEW.warranty_period_days)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_warranty_record
  AFTER INSERT ON public.delivery_items
  FOR EACH ROW EXECUTE FUNCTION create_warranty_record();