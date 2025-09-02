-- Fix the search path issues for the functions we just created
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

CREATE OR REPLACE FUNCTION public.log_customer_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log customer data access for audit purposes
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_user_action('customer_created', 'customer', NEW.id::text, 
      jsonb_build_object('customer_name', NEW.name, 'customer_type', NEW.customer_type));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_user_action('customer_updated', 'customer', NEW.id::text,
      jsonb_build_object('customer_name', NEW.name));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_user_action('customer_deleted', 'customer', OLD.id::text,
      jsonb_build_object('customer_name', OLD.name));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;