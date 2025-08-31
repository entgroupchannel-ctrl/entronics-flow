-- Create function to check if user can manage inventory using profiles table
CREATE OR REPLACE FUNCTION public.can_manage_inventory(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role IN ('admin', 'accountant')
  )
$$;

-- Drop existing policies and recreate with role restrictions
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- Update existing policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "All authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

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