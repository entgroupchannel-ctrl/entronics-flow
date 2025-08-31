-- First, let's check what role type we have in profiles
-- Update the profiles role column to use our target roles
DO $$
BEGIN
    -- Update existing role values to match our system
    UPDATE public.profiles 
    SET role = CASE 
        WHEN role = 'admin' THEN 'admin'::text
        WHEN role = 'user' THEN 'user'::text
        ELSE 'user'::text
    END;
END $$;

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

-- Update products table RLS policies
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;

-- New policies for products table
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