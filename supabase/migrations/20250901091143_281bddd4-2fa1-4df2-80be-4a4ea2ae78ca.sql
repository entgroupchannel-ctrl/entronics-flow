-- Add new status options to quotation_status enum
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'delivery_note_created';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'tax_invoice_created';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'cash_receipt_created';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'split_payment_invoice';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'split_payment_delivery';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'split_payment_receipt';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'downpayment_delivery';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'downpayment_receipt';