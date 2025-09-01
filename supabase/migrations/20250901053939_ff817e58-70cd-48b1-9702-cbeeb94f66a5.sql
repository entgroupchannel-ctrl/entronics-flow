-- Create staff table for company employees
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  position TEXT DEFAULT 'driver',
  department TEXT DEFAULT 'delivery',
  is_available BOOLEAN NOT NULL DEFAULT true,
  current_workload INTEGER NOT NULL DEFAULT 0,
  max_workload INTEGER NOT NULL DEFAULT 5,
  vehicle_type TEXT, -- รถยนต์, รถจักรยานยนต์, รถกระบะ
  vehicle_plate TEXT,
  license_number TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  hire_date DATE,
  salary NUMERIC,
  notes TEXT,
  rating NUMERIC DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff
CREATE POLICY "Admins can manage staff" 
ON public.staff 
FOR ALL 
USING (can_manage_inventory(auth.uid()));

CREATE POLICY "Staff can view their own profile" 
ON public.staff 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view active staff" 
ON public.staff 
FOR SELECT 
USING (is_active = true);

-- Insert new delivery methods
INSERT INTO public.delivery_methods (name, code, description, is_active, tracking_url_template) VALUES
('LALAMOVE', 'LALAMOVE', 'LALAMOVE - จัดส่งด่วนในเมือง', true, 'https://www.lalamove.com/th/tracking/{tracking_number}'),
('J&T Express', 'JNT', 'J&T Express', true, 'https://www.jtexpress.co.th/index/query/track_ing_index/{tracking_number}'),
('Flash Express', 'FLASH', 'Flash Express', true, 'https://www.flashexpress.co.th/tracking/{tracking_number}');

-- Add staff assignment fields to delivery_orders
ALTER TABLE public.delivery_orders 
ADD COLUMN assigned_staff_id UUID REFERENCES public.staff(id),
ADD COLUMN assignment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN assignment_notes TEXT,
ADD COLUMN courier_contact_name TEXT,
ADD COLUMN courier_contact_phone TEXT;

-- Create trigger for staff updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update staff workload
CREATE OR REPLACE FUNCTION public.update_staff_workload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update workload when delivery is assigned
  IF TG_OP = 'INSERT' AND NEW.assigned_staff_id IS NOT NULL THEN
    UPDATE public.staff 
    SET current_workload = current_workload + 1
    WHERE id = NEW.assigned_staff_id;
  END IF;
  
  -- Update workload when assignment changes
  IF TG_OP = 'UPDATE' THEN
    -- Remove from old staff
    IF OLD.assigned_staff_id IS NOT NULL AND (NEW.assigned_staff_id IS NULL OR NEW.assigned_staff_id != OLD.assigned_staff_id) THEN
      UPDATE public.staff 
      SET current_workload = GREATEST(current_workload - 1, 0)
      WHERE id = OLD.assigned_staff_id;
    END IF;
    
    -- Add to new staff
    IF NEW.assigned_staff_id IS NOT NULL AND (OLD.assigned_staff_id IS NULL OR NEW.assigned_staff_id != OLD.assigned_staff_id) THEN
      UPDATE public.staff 
      SET current_workload = current_workload + 1
      WHERE id = NEW.assigned_staff_id;
    END IF;
    
    -- Update delivery stats when completed
    IF OLD.status != 'delivered' AND NEW.status = 'delivered' AND NEW.assigned_staff_id IS NOT NULL THEN
      UPDATE public.staff 
      SET successful_deliveries = successful_deliveries + 1,
          current_workload = GREATEST(current_workload - 1, 0)
      WHERE id = NEW.assigned_staff_id;
    END IF;
  END IF;
  
  -- Update workload when delivery is deleted
  IF TG_OP = 'DELETE' AND OLD.assigned_staff_id IS NOT NULL THEN
    UPDATE public.staff 
    SET current_workload = GREATEST(current_workload - 1, 0)
    WHERE id = OLD.assigned_staff_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for staff workload updates
CREATE TRIGGER update_staff_workload_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_workload();

-- Function to auto-assign available staff
CREATE OR REPLACE FUNCTION public.auto_assign_staff(delivery_order_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  best_staff UUID;
BEGIN
  -- Find available staff with lowest workload
  SELECT id INTO best_staff
  FROM public.staff
  WHERE is_available = true 
    AND is_active = true 
    AND current_workload < max_workload
  ORDER BY current_workload ASC, rating DESC, total_deliveries ASC
  LIMIT 1;
  
  IF best_staff IS NOT NULL THEN
    -- Update delivery order
    UPDATE public.delivery_orders 
    SET assigned_staff_id = best_staff,
        assignment_date = now(),
        status = CASE WHEN status = 'preparing' THEN 'assigned' ELSE status END
    WHERE id = delivery_order_id;
  END IF;
  
  RETURN best_staff;
END;
$$;

-- Insert sample staff data
INSERT INTO public.staff (staff_code, name, phone, email, position, vehicle_type, vehicle_plate, is_available) VALUES
('DRV001', 'สมชาย ใจดี', '081-234-5678', 'somchai@entgroup.co.th', 'driver', 'รถจักรยานยนต์', 'กข-1234', true),
('DRV002', 'สมหญิง รวดเร็ว', '082-345-6789', 'somying@entgroup.co.th', 'driver', 'รถยนต์', 'บจ-5678', true),
('DRV003', 'วิทยา ขับดี', '083-456-7890', 'wittaya@entgroup.co.th', 'driver', 'รถกระบะ', 'งด-9012', false);

-- Add comment for documentation
COMMENT ON TABLE public.staff IS 'พนักงานบริษัทสำหรับการจัดส่ง';
COMMENT ON COLUMN public.staff.staff_code IS 'รหัสพนักงาน';
COMMENT ON COLUMN public.staff.current_workload IS 'จำนวนงานที่รับผิดชอบอยู่ปัจจุบัน';
COMMENT ON COLUMN public.staff.max_workload IS 'จำนวนงานสูงสุดที่รับได้';
COMMENT ON COLUMN public.staff.vehicle_type IS 'ประเภทยานพาหนะ';
COMMENT ON COLUMN public.staff.rating IS 'คะแนนเฉลี่ยจากการประเมิน';