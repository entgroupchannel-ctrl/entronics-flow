-- Add transfer request document field to international_transfer_requests table
ALTER TABLE public.international_transfer_requests 
ADD COLUMN IF NOT EXISTS transfer_request_document_url TEXT;