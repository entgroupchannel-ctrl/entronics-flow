-- Create RLS policies for payment-evidence storage bucket

-- Allow authenticated users to upload their own payment evidence
CREATE POLICY "Users can upload payment evidence"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-evidence' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to view payment evidence they uploaded
CREATE POLICY "Users can view their payment evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-evidence' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their payment evidence
CREATE POLICY "Users can update their payment evidence"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-evidence' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete their payment evidence
CREATE POLICY "Users can delete their payment evidence"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-evidence' 
  AND auth.uid() IS NOT NULL
);