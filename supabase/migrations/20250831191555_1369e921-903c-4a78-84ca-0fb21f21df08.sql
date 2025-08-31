-- Fix function search path security warnings
ALTER FUNCTION public.generate_quotation_number() SET search_path = 'public';
ALTER FUNCTION public.set_quotation_number() SET search_path = 'public';