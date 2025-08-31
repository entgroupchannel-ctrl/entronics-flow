-- Fix the ambiguous ticket_number issue in generate_ticket_number function
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  ticket_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month with explicit table reference
  SELECT COALESCE(MAX(
    CASE 
      WHEN sr.ticket_number ~ ('^SR' || current_year || current_month || '[0-9]{4}$')
      THEN SUBSTRING(sr.ticket_number FROM LENGTH(sr.ticket_number) - 3)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.service_requests sr;
  
  ticket_number := 'SR' || current_year || current_month || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN ticket_number;
END;
$$;

-- Create device types management table
CREATE TABLE public.device_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device brands management table
CREATE TABLE public.device_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device models management table
CREATE TABLE public.device_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES public.device_brands(id) ON DELETE CASCADE,
  type_id UUID REFERENCES public.device_types(id) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, brand_id)
);

-- Enable RLS on device tables
ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

-- Create policies for device types
CREATE POLICY "Everyone can view device types" 
ON public.device_types FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage device types" 
ON public.device_types FOR ALL 
USING (can_manage_inventory(auth.uid()));

-- Create policies for device brands
CREATE POLICY "Everyone can view device brands" 
ON public.device_brands FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage device brands" 
ON public.device_brands FOR ALL 
USING (can_manage_inventory(auth.uid()));

-- Create policies for device models
CREATE POLICY "Everyone can view device models" 
ON public.device_models FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage device models" 
ON public.device_models FOR ALL 
USING (can_manage_inventory(auth.uid()));

-- Insert initial device types
INSERT INTO public.device_types (name, description) VALUES
  ('โทรศัพท์มือถือ', 'สมาร์ทโฟนและมือถือทุกประเภท'),
  ('คอมพิวเตอร์', 'เดสก์ท็อป โน้ตบุ๊ค และแท็บเล็ต'),
  ('เครื่องใช้ไฟฟ้า', 'เครื่องใช้ไฟฟ้าในบ้าน'),
  ('อุปกรณ์เสียง', 'หูฟัง ลำโพง และเครื่องเสียง'),
  ('เครื่องใช้สำนักงาน', 'เครื่องพิมพ์ เครื่องสแกน และอุปกรณ์สำนักงาน');

-- Insert initial device brands
INSERT INTO public.device_brands (name, description) VALUES
  ('Apple', 'ผลิตภัณฑ์ Apple iPhone iPad Mac'),
  ('Samsung', 'ผลิตภัณฑ์ Samsung Galaxy และอุปกรณ์อิเล็กทรอนิกส์'),
  ('Huawei', 'ผลิตภัณฑ์ Huawei และ Honor'),
  ('HP', 'คอมพิวเตอร์และเครื่องพิมพ์ HP'),
  ('Dell', 'คอมพิวเตอร์และแล็ปท็อป Dell'),
  ('Lenovo', 'คอมพิวเตอร์และแท็บเล็ต Lenovo'),
  ('Asus', 'คอมพิวเตอร์และอุปกรณ์ Asus'),
  ('Sony', 'เครื่องเสียงและอิเล็กทรอนิกส์ Sony'),
  ('LG', 'เครื่องใช้ไฟฟ้าและอิเล็กทรอนิกส์ LG'),
  ('Xiaomi', 'ผลิตภัณฑ์ Xiaomi และ Redmi');

-- Insert initial device models
INSERT INTO public.device_models (name, brand_id, type_id) 
SELECT 'iPhone 15 Pro', b.id, t.id
FROM public.device_brands b, public.device_types t
WHERE b.name = 'Apple' AND t.name = 'โทรศัพท์มือถือ';

INSERT INTO public.device_models (name, brand_id, type_id) 
SELECT 'Galaxy S24 Ultra', b.id, t.id
FROM public.device_brands b, public.device_types t
WHERE b.name = 'Samsung' AND t.name = 'โทรศัพท์มือถือ';

INSERT INTO public.device_models (name, brand_id, type_id) 
SELECT 'MacBook Pro M3', b.id, t.id
FROM public.device_brands b, public.device_types t
WHERE b.name = 'Apple' AND t.name = 'คอมพิวเตอร์';

INSERT INTO public.device_models (name, brand_id, type_id) 
SELECT 'XPS 13', b.id, t.id
FROM public.device_brands b, public.device_types t
WHERE b.name = 'Dell' AND t.name = 'คอมพิวเตอร์';

-- Add triggers for updated_at
CREATE TRIGGER update_device_types_updated_at
  BEFORE UPDATE ON public.device_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_brands_updated_at
  BEFORE UPDATE ON public.device_brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_models_updated_at
  BEFORE UPDATE ON public.device_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();