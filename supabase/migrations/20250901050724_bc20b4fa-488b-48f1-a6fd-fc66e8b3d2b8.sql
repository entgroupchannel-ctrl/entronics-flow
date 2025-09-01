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