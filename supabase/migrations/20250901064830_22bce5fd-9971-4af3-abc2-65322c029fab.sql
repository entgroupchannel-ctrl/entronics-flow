-- Add support for repaired items in products table
ALTER TABLE public.products 
ADD COLUMN item_condition text DEFAULT 'new',
ADD COLUMN repair_order_id uuid REFERENCES public.repair_orders(id),
ADD COLUMN service_request_id uuid REFERENCES public.service_requests(id),
ADD COLUMN repaired_date timestamp with time zone,
ADD COLUMN repair_notes text;

-- Create index for better performance when filtering by condition
CREATE INDEX idx_products_condition ON public.products(item_condition);
CREATE INDEX idx_products_repair_order ON public.products(repair_order_id);
CREATE INDEX idx_products_service_request ON public.products(service_request_id);

-- Add new categories for repaired equipment
INSERT INTO public.system_settings (setting_key, setting_value, description, category) 
VALUES 
('product_conditions', '["new", "refurbished", "repaired", "used"]', 'Available product conditions', 'inventory')
ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = '["new", "refurbished", "repaired", "used"]',
updated_at = now();