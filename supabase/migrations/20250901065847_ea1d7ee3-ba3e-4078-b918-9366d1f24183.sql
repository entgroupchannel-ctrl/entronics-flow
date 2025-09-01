-- Add acknowledgment fields to service_requests table
ALTER TABLE public.service_requests 
ADD COLUMN acknowledged_at timestamp with time zone,
ADD COLUMN acknowledgment_notes text;