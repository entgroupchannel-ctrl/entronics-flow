-- Fix critical security issues: Update RLS policies and secure database functions

-- 1. Check and fix Customer RLS Policies - Replace overly permissive policies with user-specific access
-- Drop all existing customer policies first
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
  DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers; 
  DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;
  DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
  DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
  DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create secure customer policies - users can only access customers they created
CREATE POLICY "Users can view their own customers"
ON public.customers
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own customers"  
ON public.customers
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customers"
ON public.customers
FOR DELETE
USING (auth.uid() = created_by);

-- 2. Fix Profile Data Access - Require authentication for viewing profiles
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Secure Database Functions - Add proper search_path configuration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;