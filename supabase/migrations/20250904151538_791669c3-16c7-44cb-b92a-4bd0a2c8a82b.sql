-- Add missing columns to existing suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC,
ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS erp_sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS erp_supplier_code TEXT UNIQUE;

-- Create RLS policies for new tables
CREATE POLICY "Users can view supplier products" ON public.supplier_products
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can manage supplier products" ON public.supplier_products
  FOR ALL USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can view supplier evaluations" ON public.supplier_evaluations
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can create supplier evaluations" ON public.supplier_evaluations
  FOR INSERT WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = evaluated_by);

CREATE POLICY "Users can update their own evaluations" ON public.supplier_evaluations
  FOR UPDATE USING (auth.uid() = evaluated_by OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view product inquiries" ON public.product_inquiries
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can create product inquiries" ON public.product_inquiries
  FOR INSERT WITH CHECK (can_manage_customers(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Users can update product inquiries" ON public.product_inquiries
  FOR UPDATE USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can view supplier responses" ON public.supplier_responses
  FOR SELECT USING (can_manage_customers(auth.uid()));

CREATE POLICY "Users can manage supplier responses" ON public.supplier_responses
  FOR ALL USING (can_manage_customers(auth.uid()));

CREATE POLICY "Admins can view sync logs" ON public.sync_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage sync logs" ON public.sync_logs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_grade ON public.suppliers(supplier_grade);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_sync_status ON public.suppliers(erp_sync_status);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON public.supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_evaluations_supplier ON public.supplier_evaluations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_status ON public.product_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_supplier_responses_inquiry ON public.supplier_responses(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_entity ON public.sync_logs(entity_id, entity_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_supplier_products_updated_at
  BEFORE UPDATE ON public.supplier_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_inquiries_updated_at
  BEFORE UPDATE ON public.product_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_responses_updated_at
  BEFORE UPDATE ON public.supplier_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_logs_updated_at
  BEFORE UPDATE ON public.sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-generate inquiry numbers
CREATE TRIGGER set_inquiry_number_trigger
  BEFORE INSERT ON public.product_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_inquiry_number();