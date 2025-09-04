-- Update all pending and draft suppliers to approved status
UPDATE public.customers 
SET 
  supplier_registration_status = 'approved',
  supplier_approved_date = now(),
  supplier_approved_by = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1),
  updated_at = now()
WHERE customer_type = 'ผู้จำหน่าย' 
  AND supplier_registration_status IN ('pending', 'draft');