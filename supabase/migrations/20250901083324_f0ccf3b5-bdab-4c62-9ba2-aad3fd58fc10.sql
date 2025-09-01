-- ลบ foreign key constraint ที่อ้างอิงไปยัง auth.users
ALTER TABLE public.service_status_history 
DROP CONSTRAINT IF EXISTS service_status_history_changed_by_fkey;

-- เปลี่ยน service_request_id ให้เป็น NOT NULL เพื่อป้องกันข้อผิดพลาด
ALTER TABLE public.service_status_history 
ALTER COLUMN service_request_id SET NOT NULL;

-- สร้าง index เพื่อประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_service_status_history_service_request_id 
ON public.service_status_history(service_request_id);

CREATE INDEX IF NOT EXISTS idx_service_status_history_changed_by 
ON public.service_status_history(changed_by);