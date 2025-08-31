-- เพิ่มฟิลด์ใหม่ในตาราง customers
ALTER TABLE public.customers 
ADD COLUMN person_type text DEFAULT 'นิติบุคคล' CHECK (person_type IN ('นิติบุคคล', 'บุคคลธรรมดา')),
ADD COLUMN tax_id text, -- รหัสนิติบุคคล/หมายเลขผู้เสียภาษี 13 หลัก
ADD COLUMN citizen_id text, -- เลขบัตรประจำตัวประชาชน
ADD COLUMN contact_type text DEFAULT 'ลูกค้า',
ADD COLUMN province text,
ADD COLUMN district text,
ADD COLUMN sub_district text,
ADD COLUMN postal_code text,
ADD COLUMN bank_name text,
ADD COLUMN bank_account text,
ADD COLUMN bank_branch text,
ADD COLUMN swift_code text,
ADD COLUMN bank_address text,
ADD COLUMN website text,
ADD COLUMN line_id text,
ADD COLUMN facebook text,
ADD COLUMN contact_position text;