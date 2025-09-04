-- Create supplier_documents table for PI, CI, AWB and related documents
CREATE TABLE public.supplier_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('PI', 'CI', 'AWB', 'packing_list', 'certificate', 'other')),
  document_number TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by UUID,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplier_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view supplier documents" 
ON public.supplier_documents 
FOR SELECT 
USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can create supplier documents" 
ON public.supplier_documents 
FOR INSERT 
WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = uploaded_by);

CREATE POLICY "Users can update supplier documents" 
ON public.supplier_documents 
FOR UPDATE 
USING (can_manage_customers(auth.uid()));

CREATE POLICY "Admins can delete supplier documents" 
ON public.supplier_documents 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_supplier_documents_updated_at
  BEFORE UPDATE ON public.supplier_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();