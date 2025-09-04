-- Create purchase-orders storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('purchase-orders', 'purchase-orders', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for purchase-orders bucket
CREATE POLICY "Authenticated users can view PO documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'purchase-orders' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload PO documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'purchase-orders' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own PO documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'purchase-orders' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own PO documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'purchase-orders' 
  AND auth.role() = 'authenticated'
);

-- Create table to track PO attachments
CREATE TABLE IF NOT EXISTS public.purchase_order_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on attachments table
ALTER TABLE public.purchase_order_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attachments table
CREATE POLICY "Authenticated users can view PO attachments" ON public.purchase_order_attachments
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create PO attachments" ON public.purchase_order_attachments
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own PO attachments" ON public.purchase_order_attachments
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own PO attachments" ON public.purchase_order_attachments
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

-- Add trigger for updated_at
CREATE TRIGGER update_purchase_order_attachments_updated_at
  BEFORE UPDATE ON public.purchase_order_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();