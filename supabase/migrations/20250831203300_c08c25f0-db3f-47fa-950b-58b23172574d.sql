-- Add sample sales staff role to existing users for testing
INSERT INTO public.user_roles (user_id, role) 
SELECT profiles.user_id, 'sales'::app_role 
FROM public.profiles 
WHERE profiles.user_id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'sales'::app_role
)
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;