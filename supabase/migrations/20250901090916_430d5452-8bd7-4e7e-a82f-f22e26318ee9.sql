-- Update default workflow status from 'draft' to 'wait_for_approve'
ALTER TABLE quotations 
ALTER COLUMN workflow_status SET DEFAULT 'wait_for_approve'::quotation_status;

-- Update existing draft quotations to wait_for_approve
UPDATE quotations 
SET workflow_status = 'wait_for_approve'::quotation_status 
WHERE workflow_status = 'draft'::quotation_status;