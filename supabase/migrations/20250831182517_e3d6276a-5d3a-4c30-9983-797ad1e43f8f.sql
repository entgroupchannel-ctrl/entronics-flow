-- Create enum for service request status
CREATE TYPE service_status AS ENUM (
  'pending',
  'assigned',
  'in_progress', 
  'waiting_parts',
  'completed',
  'cancelled'
);

-- Create enum for priority levels
CREATE TYPE priority_level AS ENUM (
  'low',
  'medium', 
  'high',
  'urgent'
);

-- Create enum for technician specialization
CREATE TYPE tech_specialization AS ENUM (
  'general',
  'electrical',
  'mechanical',
  'software',
  'hardware'
);

-- Create technicians table
CREATE TABLE public.technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialization tech_specialization DEFAULT 'general',
  is_available BOOLEAN DEFAULT true,
  current_workload INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service requests table  
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  problem_description TEXT NOT NULL,
  priority priority_level DEFAULT 'medium',
  status service_status DEFAULT 'pending',
  assigned_technician_id UUID REFERENCES public.technicians(id),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
  customer_feedback TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service images table for storing image references
CREATE TABLE public.service_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  google_drive_id TEXT,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create status history table for tracking changes
CREATE TABLE public.service_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  old_status service_status,
  new_status service_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parts used table
CREATE TABLE public.service_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  part_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts ENABLE ROW LEVEL SECURITY;

-- Create policies for technicians
CREATE POLICY "Authenticated users can view technicians" 
ON public.technicians FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage technicians" 
ON public.technicians FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for service requests  
CREATE POLICY "All authenticated users can view service requests" 
ON public.service_requests FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create service requests" 
ON public.service_requests FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and accountants can update service requests" 
ON public.service_requests FOR UPDATE 
USING (can_manage_inventory(auth.uid()));

CREATE POLICY "Assigned technicians can update their service requests" 
ON public.service_requests FOR UPDATE 
USING (assigned_technician_id IN (
  SELECT id FROM public.technicians WHERE user_id = auth.uid()
));

-- Create policies for service images
CREATE POLICY "Users can view service images" 
ON public.service_images FOR SELECT 
USING (true);

CREATE POLICY "Users can upload service images" 
ON public.service_images FOR INSERT 
WITH CHECK (true);

-- Create policies for status history
CREATE POLICY "Users can view status history" 
ON public.service_status_history FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert status history" 
ON public.service_status_history FOR INSERT 
WITH CHECK (auth.uid() = changed_by);

-- Create policies for service parts
CREATE POLICY "Users can view service parts" 
ON public.service_parts FOR SELECT 
USING (true);

CREATE POLICY "Admins and accountants can manage service parts" 
ON public.service_parts FOR ALL 
USING (can_manage_inventory(auth.uid()));

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-assign technicians
CREATE OR REPLACE FUNCTION auto_assign_technician(request_id UUID)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;