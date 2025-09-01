-- Add source field to service_requests table
ALTER TABLE public.service_requests 
ADD COLUMN source TEXT NOT NULL DEFAULT 'staff';

-- Add check constraint for source values
ALTER TABLE public.service_requests 
ADD CONSTRAINT service_requests_source_check 
CHECK (source IN ('staff', 'technician', 'customer'));

-- Add comment
COMMENT ON COLUMN public.service_requests.source IS 'Source of the service request: staff, technician, or customer';