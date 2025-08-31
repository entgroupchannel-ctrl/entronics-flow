-- Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  customer_type text NOT NULL DEFAULT 'ลูกค้า' CHECK (customer_type IN ('ลูกค้า', 'ผู้จำหน่าย', 'ผู้จำหน่าย/ลูกค้า')),
  status text DEFAULT 'ปกติ',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view customers" 
ON public.customers 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create customers" 
ON public.customers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update customers" 
ON public.customers 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete customers" 
ON public.customers 
FOR DELETE 
TO authenticated
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.customers (name, contact_person, phone, email, customer_type, status, created_by) VALUES
('101 Training Co.,Ltd', 'Ms. Nithima Chuai', '06-5526-6591', 'nithima@101training.co.th', 'ลูกค้า', 'สำคัญ', (SELECT id FROM auth.users LIMIT 1)),
('101TRAINING COMPANY LIMITED', 'Ms.Nithima Chuai', '065-5266591', 'Nithima@101training.co.th', 'ลูกค้า', 'สำคัญ', (SELECT id FROM auth.users LIMIT 1)),
('108 OA Co.,Ltd.', 'Lamul Lunkhunto', '02 410 4488', 'lamul@108oa.co.th', 'ลูกค้า', 'ปกติ', (SELECT id FROM auth.users LIMIT 1)),
('24 Automation CO.,LTD.', 'คุณอดิศักดิ์ อินดี', '02-015-6610', 'info@24automation.com', 'ลูกค้า', 'ปกติ', (SELECT id FROM auth.users LIMIT 1)),
('2 Be Shop (บริษัทอีไลฟ์ จิตเสียส์ จำกัด)', '', '', '', 'ผู้จำหน่าย', 'ปกติ', (SELECT id FROM auth.users LIMIT 1));