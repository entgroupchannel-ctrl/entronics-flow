-- Create storage bucket for payment evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-evidence', 'payment-evidence', false);

-- Create policies for payment evidence uploads
CREATE POLICY "Users can upload their own payment evidence" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own payment evidence" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all payment evidence" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-evidence' AND can_manage_inventory(auth.uid()));

CREATE POLICY "Users can update their own payment evidence" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own payment evidence" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);