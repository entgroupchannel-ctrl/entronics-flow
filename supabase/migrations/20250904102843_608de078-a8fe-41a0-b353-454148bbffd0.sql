-- Add fields to store transfer documents URLs
ALTER TABLE international_transfer_requests 
ADD COLUMN IF NOT EXISTS transfer_evidence_urls TEXT[],
ADD COLUMN IF NOT EXISTS actual_transfer_date DATE,
ADD COLUMN IF NOT EXISTS transfer_slip_url TEXT,
ADD COLUMN IF NOT EXISTS transfer_confirmation_url TEXT;