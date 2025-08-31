-- Update the first user to be admin (replace with your actual email)
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com' -- เปลี่ยนเป็นอีเมลของคุณ
  LIMIT 1
);

-- Create admin role check function for future use
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND role = 'admin'
  );
$$;