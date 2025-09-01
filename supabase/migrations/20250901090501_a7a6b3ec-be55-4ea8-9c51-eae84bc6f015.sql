-- Update quotations table to support new status and workflow tracking
-- Add new status enum type for quotations
DO $$ BEGIN
    CREATE TYPE quotation_status AS ENUM (
        'draft',
        'wait_for_approve', 
        'approved',
        'rejected',
        'invoice_created',
        'downpayment_invoice',
        'conversion_invoice', 
        'purchase_order_created',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new process type enum
DO $$ BEGIN
    CREATE TYPE process_type AS ENUM (
        'standard',
        'downpayment',
        'conversion',
        'purchase_order'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to quotations table
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS workflow_status quotation_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS process_type process_type,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_by UUID,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS next_document_type TEXT,
ADD COLUMN IF NOT EXISTS parent_quotation_id UUID REFERENCES quotations(id);

-- Create quotation workflow history table
CREATE TABLE IF NOT EXISTS quotation_workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    from_status quotation_status,
    to_status quotation_status NOT NULL,
    action_type TEXT NOT NULL,
    performed_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on workflow history table
ALTER TABLE quotation_workflow_history ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow history
CREATE POLICY "Users can view workflow history for their quotations" 
ON quotation_workflow_history 
FOR SELECT 
USING (quotation_id IN (
    SELECT id FROM quotations WHERE created_by = auth.uid()
));

CREATE POLICY "Users can create workflow history for their quotations" 
ON quotation_workflow_history 
FOR INSERT 
WITH CHECK (quotation_id IN (
    SELECT id FROM quotations WHERE created_by = auth.uid()
));

-- Function to log workflow changes
CREATE OR REPLACE FUNCTION log_quotation_workflow_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if workflow_status actually changed
    IF OLD.workflow_status IS DISTINCT FROM NEW.workflow_status THEN
        INSERT INTO quotation_workflow_history (
            quotation_id,
            from_status,
            to_status,
            action_type,
            performed_by,
            notes
        ) VALUES (
            NEW.id,
            OLD.workflow_status,
            NEW.workflow_status,
            CASE 
                WHEN NEW.workflow_status = 'approved' THEN 'approve'
                WHEN NEW.workflow_status = 'rejected' THEN 'reject'
                WHEN NEW.workflow_status = 'invoice_created' THEN 'create_invoice'
                WHEN NEW.workflow_status = 'downpayment_invoice' THEN 'downpayment_invoice'
                WHEN NEW.workflow_status = 'conversion_invoice' THEN 'conversion_invoice'
                WHEN NEW.workflow_status = 'purchase_order_created' THEN 'create_purchase_order'
                ELSE 'status_change'
            END,
            auth.uid(),
            'Status changed from ' || COALESCE(OLD.workflow_status::text, 'null') || ' to ' || NEW.workflow_status::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for workflow logging
DROP TRIGGER IF EXISTS quotation_workflow_change_trigger ON quotations;
CREATE TRIGGER quotation_workflow_change_trigger
    AFTER UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION log_quotation_workflow_change();

-- Update existing quotations to have wait_for_approve status if they are currently 'sent'
UPDATE quotations 
SET workflow_status = 'wait_for_approve' 
WHERE status = 'sent' AND workflow_status = 'draft';