-- Insert sample technicians
INSERT INTO public.technicians (name, email, phone, specialization, is_available, current_workload, rating, total_jobs) VALUES
('สมชาย วิไลพร', 'somchai@company.com', '081-234-5678', 'hardware', true, 0, 4.8, 45),
('สุนิษา ทองดี', 'sunisa@company.com', '082-345-6789', 'electrical', true, 0, 4.9, 52),
('วิรัช ใจดี', 'virach@company.com', '083-456-7890', 'general', true, 0, 4.7, 38);

-- Create a function to auto-assign technician when service request is created
CREATE OR REPLACE FUNCTION public.auto_assign_technician_on_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_tech_id UUID;
BEGIN
  -- Auto assign technician when new service request is created
  IF NEW.assigned_technician_id IS NULL THEN
    assigned_tech_id := auto_assign_technician(NEW.id);
    
    IF assigned_tech_id IS NOT NULL THEN
      NEW.assigned_technician_id := assigned_tech_id;
      NEW.status := 'assigned'::service_status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_technician ON public.service_requests;
CREATE TRIGGER trigger_auto_assign_technician
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_technician_on_creation();