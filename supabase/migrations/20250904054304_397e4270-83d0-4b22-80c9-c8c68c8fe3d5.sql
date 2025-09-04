-- Add comprehensive payment terms fields to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN payment_method TEXT DEFAULT 'bank_transfer',
ADD COLUMN payment_terms_type TEXT DEFAULT 'credit',
ADD COLUMN payment_due_days INTEGER DEFAULT 30,
ADD COLUMN advance_payment_percentage NUMERIC DEFAULT 0,
ADD COLUMN advance_payment_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_schedule JSONB DEFAULT '[]'::jsonb,
ADD COLUMN cash_discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN cash_discount_days INTEGER DEFAULT 0,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN installment_count INTEGER DEFAULT 1,
ADD COLUMN late_payment_fee_percentage NUMERIC DEFAULT 0,
ADD COLUMN payment_currency TEXT DEFAULT 'THB';

-- Create payment schedules table for installment tracking
CREATE TABLE IF NOT EXISTS public.purchase_order_payment_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  paid_date DATE,
  paid_amount NUMERIC DEFAULT 0,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on payment schedules table
ALTER TABLE public.purchase_order_payment_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment schedules
CREATE POLICY "Authenticated users can view payment schedules" ON public.purchase_order_payment_schedules
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create payment schedules" ON public.purchase_order_payment_schedules
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update payment schedules" ON public.purchase_order_payment_schedules
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete payment schedules" ON public.purchase_order_payment_schedules
FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_payment_schedules_updated_at
  BEFORE UPDATE ON public.purchase_order_payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();