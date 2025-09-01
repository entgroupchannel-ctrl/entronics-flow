-- ลบ trigger เดิม
DROP TRIGGER IF EXISTS trigger_auto_assign_technician ON public.service_requests;

-- สร้าง trigger ใหม่ที่ทำงาน AFTER INSERT แทน BEFORE INSERT
CREATE TRIGGER trigger_auto_assign_technician_after
  AFTER INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_technician_on_creation();

-- ปรับฟังก์ชัน auto_assign_technician_on_creation ให้ไม่ return NEW
CREATE OR REPLACE FUNCTION public.auto_assign_technician_on_creation()
RETURNS TRIGGER
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
  END IF;
  
  RETURN NULL; -- สำหรับ AFTER trigger ไม่ต้อง return NEW
END;
$function$;