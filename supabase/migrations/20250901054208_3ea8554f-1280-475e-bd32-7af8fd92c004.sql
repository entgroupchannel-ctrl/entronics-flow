-- Insert new delivery methods (skip if already exists)
INSERT INTO public.delivery_methods (name, code, description, is_active, tracking_url_template) 
SELECT name, code, description, is_active, tracking_url_template FROM (
  VALUES 
    ('LALAMOVE', 'LALAMOVE', 'LALAMOVE - จัดส่งด่วนในเมือง', true, 'https://www.lalamove.com/th/tracking/{tracking_number}'),
    ('J&T Express', 'JNT', 'J&T Express', true, 'https://www.jtexpress.co.th/index/query/track_ing_index/{tracking_number}'),
    ('Flash Express', 'FLASH', 'Flash Express', true, 'https://www.flashexpress.co.th/tracking/{tracking_number}')
) AS v(name, code, description, is_active, tracking_url_template)
WHERE NOT EXISTS (
  SELECT 1 FROM public.delivery_methods dm 
  WHERE dm.code = v.code
);

-- Add staff assignment fields to delivery_orders if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'delivery_orders' AND column_name = 'assigned_staff_id') THEN
    ALTER TABLE public.delivery_orders 
    ADD COLUMN assigned_staff_id UUID REFERENCES public.staff(id),
    ADD COLUMN assignment_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN assignment_notes TEXT,
    ADD COLUMN courier_contact_name TEXT,
    ADD COLUMN courier_contact_phone TEXT;
  END IF;
END $$;

-- Create function to update staff workload (replace if exists)
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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_staff_workload_trigger ON public.delivery_orders;
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