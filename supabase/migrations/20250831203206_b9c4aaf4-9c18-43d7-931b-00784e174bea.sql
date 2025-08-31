-- Check if sales role exists and add it if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sales' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE public.app_role ADD VALUE 'sales';
  END IF;
END $$;

-- Insert some sample sales staff for testing (optional)
-- You can remove this if you prefer to add users manually
INSERT INTO public.user_roles (user_id, role) 
SELECT profiles.user_id, 'sales'::app_role 
FROM public.profiles 
WHERE profiles.user_id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'sales'::app_role
)
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;