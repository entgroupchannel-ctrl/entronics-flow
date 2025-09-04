-- Add document attachment fields to international_transfer_requests table
ALTER TABLE public.international_transfer_requests 
ADD COLUMN IF NOT EXISTS pi_document_url TEXT,
ADD COLUMN IF NOT EXISTS ci_document_url TEXT,
ADD COLUMN IF NOT EXISTS awb_document_url TEXT,
ADD COLUMN IF NOT EXISTS packing_list_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_urls TEXT[];