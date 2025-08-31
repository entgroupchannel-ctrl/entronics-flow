-- Create function to check if user can manage inventory
CREATE OR REPLACE FUNCTION public.can_manage_inventory(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'accountant'::app_role)
  )
$$;

-- Update products table RLS policies
DROP POLICY IF EXISTS "Only admins and accountants can create products" ON public.products;
DROP POLICY IF EXISTS "Only admins and accountants can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins and accountants can delete products" ON public.products;

CREATE POLICY "Only admins and accountants can create products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Only admins and accountants can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Only admins and accountants can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.can_manage_inventory(auth.uid()));

-- Insert default admin role for existing users (if they don't have any roles)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ORDER BY created_at
LIMIT 1
ON CONFLICT DO NOTHING;