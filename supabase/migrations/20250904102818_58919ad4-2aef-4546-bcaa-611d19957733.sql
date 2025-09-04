-- Create storage bucket for transfer documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfer-documents', 'transfer-documents', false);

-- Create RLS policies for transfer documents
CREATE POLICY "Authenticated users can upload transfer documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transfer-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view transfer documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'transfer-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update transfer documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'transfer-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete transfer documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'transfer-documents' AND auth.uid() IS NOT NULL);

-- Add fields to store transfer documents URLs
ALTER TABLE international_transfer_requests 
ADD COLUMN transfer_evidence_urls TEXT[],
ADD COLUMN actual_transfer_date DATE,
ADD COLUMN transfer_slip_url TEXT,
ADD COLUMN transfer_confirmation_url TEXT;