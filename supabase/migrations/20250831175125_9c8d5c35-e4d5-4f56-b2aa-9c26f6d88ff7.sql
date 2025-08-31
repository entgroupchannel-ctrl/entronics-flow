-- Fix remaining security warning: Function Search Path Mutable
-- Update the is_admin function to have proper search_path configuration

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND role = 'admin'
  );
$$;