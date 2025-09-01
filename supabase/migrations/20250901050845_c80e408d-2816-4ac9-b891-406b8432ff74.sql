-- Functions for generating numbers
CREATE OR REPLACE FUNCTION public.generate_repair_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  repair_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN ro.repair_number ~ ('^RP' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(ro.repair_number FROM LENGTH(ro.repair_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.repair_orders ro;
  
  repair_number := 'RP' || current_year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN repair_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_delivery_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  delivery_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN del_ord.delivery_number ~ ('^DL' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(del_ord.delivery_number FROM LENGTH(del_ord.delivery_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.delivery_orders del_ord;
  
  delivery_number := 'DL' || current_year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN delivery_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  claim_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN wc.claim_number ~ ('^CL' || current_year || '[0-9]{6}$')
      THEN SUBSTRING(wc.claim_number FROM LENGTH(wc.claim_number) - 5)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.warranty_claims wc;
  
  claim_number := 'CL' || current_year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN claim_number;
END;
$$;

-- Triggers for auto-generating numbers
CREATE OR REPLACE FUNCTION public.set_repair_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.repair_number IS NULL OR NEW.repair_number = '' THEN
    NEW.repair_number := generate_repair_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_delivery_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.delivery_number IS NULL OR NEW.delivery_number = '' THEN
    NEW.delivery_number := generate_delivery_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_set_repair_number 
  BEFORE INSERT ON public.repair_orders 
  FOR EACH ROW EXECUTE FUNCTION set_repair_number();

CREATE TRIGGER trigger_set_delivery_number 
  BEFORE INSERT ON public.delivery_orders 
  FOR EACH ROW EXECUTE FUNCTION set_delivery_number();

CREATE TRIGGER trigger_set_claim_number 
  BEFORE INSERT ON public.warranty_claims 
  FOR EACH ROW EXECUTE FUNCTION set_claim_number();

-- Create triggers for updated_at
CREATE TRIGGER update_repair_orders_updated_at
  BEFORE UPDATE ON public.repair_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_orders_updated_at
  BEFORE UPDATE ON public.delivery_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_warranties_updated_at
  BEFORE UPDATE ON public.product_warranties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_claims_updated_at
  BEFORE UPDATE ON public.warranty_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_methods_updated_at
  BEFORE UPDATE ON public.delivery_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set warranty dates and generate registration code
CREATE OR REPLACE FUNCTION public.set_warranty_info()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set warranty start date if not provided
  IF NEW.warranty_start_date IS NULL THEN
    NEW.warranty_start_date := CURRENT_DATE;
  END IF;
  
  -- Set warranty end date based on start date and period
  IF NEW.warranty_end_date IS NULL AND NEW.warranty_period_days IS NOT NULL THEN
    NEW.warranty_end_date := NEW.warranty_start_date + INTERVAL '1 day' * NEW.warranty_period_days;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_warranty_info
  BEFORE INSERT ON public.delivery_items
  FOR EACH ROW EXECUTE FUNCTION set_warranty_info();

-- Function to auto-create warranty record when delivery item is created
CREATE OR REPLACE FUNCTION public.create_warranty_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create warranty for items with warranty period
  IF NEW.warranty_period_days > 0 THEN
    INSERT INTO public.product_warranties (
      delivery_item_id,
      customer_id,
      product_name,
      serial_number,
      registration_code,
      warranty_start_date,
      warranty_end_date
    ) VALUES (
      NEW.id,
      (SELECT customer_id FROM public.delivery_orders WHERE id = NEW.delivery_order_id),
      NEW.item_name,
      CASE WHEN array_length(NEW.serial_numbers, 1) > 0 THEN NEW.serial_numbers[1] ELSE NULL END,
      'REG' || EXTRACT(YEAR FROM now())::TEXT || LPAD(floor(random() * 1000000)::TEXT, 6, '0'),
      COALESCE(NEW.warranty_start_date, CURRENT_DATE),
      COALESCE(NEW.warranty_end_date, CURRENT_DATE + INTERVAL '1 day' * NEW.warranty_period_days)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_warranty_record
  AFTER INSERT ON public.delivery_items
  FOR EACH ROW EXECUTE FUNCTION create_warranty_record();