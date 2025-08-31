-- Fix search path for security functions
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  sequence_num INTEGER;
  ticket_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN ticket_number ~ ('^SR' || current_year || current_month || '[0-9]{4}$')
      THEN SUBSTRING(ticket_number FROM LENGTH(ticket_number) - 3)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.service_requests;
  
  ticket_number := 'SR' || current_year || current_month || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN ticket_number;
END;
$$;

CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auto_assign_technician(request_id UUID)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  best_technician UUID;
BEGIN
  -- Find available technician with lowest workload
  SELECT id INTO best_technician
  FROM public.technicians
  WHERE is_available = true
  ORDER BY current_workload ASC, rating DESC
  LIMIT 1;
  
  IF best_technician IS NOT NULL THEN
    -- Update service request
    UPDATE public.service_requests 
    SET assigned_technician_id = best_technician,
        status = 'assigned'::service_status
    WHERE id = request_id;
    
    -- Update technician workload
    UPDATE public.technicians 
    SET current_workload = current_workload + 1
    WHERE id = best_technician;
    
    -- Add status history
    INSERT INTO public.service_status_history (
      service_request_id, old_status, new_status, changed_by, notes
    ) VALUES (
      request_id, 'pending'::service_status, 'assigned'::service_status, 
      auth.uid(), 'Auto-assigned to technician'
    );
  END IF;
  
  RETURN best_technician;
END;
$$;