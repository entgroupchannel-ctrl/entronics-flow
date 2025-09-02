-- First, drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;

-- Create a function to check if user can manage customers (using existing roles only)
CREATE OR REPLACE FUNCTION public.can_manage_customers(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'accountant'::app_role)
  )
$$;

-- Create more restrictive policies for customer data access
-- Only authorized roles can view customer data
CREATE POLICY "Authorized roles can view customers" 
ON public.customers 
FOR SELECT 
TO authenticated
USING (can_manage_customers(auth.uid()));

-- Only authorized roles can create customers
CREATE POLICY "Authorized roles can create customers" 
ON public.customers 
FOR INSERT 
TO authenticated
WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = created_by);

-- Only authorized roles can update customers
CREATE POLICY "Authorized roles can update customers" 
ON public.customers 
FOR UPDATE 
TO authenticated
USING (can_manage_customers(auth.uid()));

-- Only admins can delete customers (most restrictive for data retention)
CREATE POLICY "Only admins can delete customers" 
ON public.customers 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add audit logging for customer data access
CREATE OR REPLACE FUNCTION public.log_customer_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log customer data access for audit purposes
  IF TG_OP = 'INSERT' THEN
    PERFORM log_user_action('customer_created', 'customer', NEW.id::text, 
      jsonb_build_object('customer_name', NEW.name, 'customer_type', NEW.customer_type));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_user_action('customer_updated', 'customer', NEW.id::text,
      jsonb_build_object('customer_name', NEW.name));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_user_action('customer_deleted', 'customer', OLD.id::text,
      jsonb_build_object('customer_name', OLD.name));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for audit logging
CREATE TRIGGER customer_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION log_customer_access();

-- Add comments to document sensitive fields
COMMENT ON COLUMN public.customers.citizen_id IS 'SENSITIVE: Personal identification number - handle with care';
COMMENT ON COLUMN public.customers.tax_id IS 'SENSITIVE: Tax identification number - handle with care';
COMMENT ON COLUMN public.customers.bank_account IS 'SENSITIVE: Banking information - handle with care';
COMMENT ON COLUMN public.customers.phone IS 'SENSITIVE: Personal contact information - handle with care';
COMMENT ON COLUMN public.customers.email IS 'SENSITIVE: Personal contact information - handle with care';