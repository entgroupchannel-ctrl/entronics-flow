-- Update RLS policy to allow admins to create transfer requests
DROP POLICY IF EXISTS "Accountants can create transfer requests" ON international_transfer_requests;

CREATE POLICY "Accountants and admins can create transfer requests" 
ON international_transfer_requests 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'accountant'::app_role) OR has_role(auth.uid(), 'admin'::app_role)) 
  AND (auth.uid() = requested_by)
);

-- Also update the update policy to allow admins
DROP POLICY IF EXISTS "Accountants can update their own draft requests" ON international_transfer_requests;

CREATE POLICY "Accountants and admins can update transfer requests" 
ON international_transfer_requests 
FOR UPDATE 
USING (
  ((has_role(auth.uid(), 'accountant'::app_role) OR has_role(auth.uid(), 'admin'::app_role)) 
   AND (requested_by = auth.uid()) AND (status = 'draft'::text)) 
  OR can_manage_customers(auth.uid())
);