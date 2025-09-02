-- เพิ่มฟิลด์เวลาในการยกเลิกใบเสร็จ
ALTER TABLE public.receipts 
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;

-- เปลี่ยน receipt_date ให้เก็บเวลาด้วย
ALTER TABLE public.receipts 
ALTER COLUMN receipt_date TYPE TIMESTAMP WITH TIME ZONE USING receipt_date::timestamp;

-- อัพเดต default value สำหรับ receipt_date ให้เป็น now()
ALTER TABLE public.receipts 
ALTER COLUMN receipt_date SET DEFAULT now();

-- เพิ่ม comment เพื่ออธิบายฟิลด์ใหม่
COMMENT ON COLUMN public.receipts.cancelled_at IS 'เวลาที่ยกเลิกใบเสร็จ';
COMMENT ON COLUMN public.receipts.receipt_date IS 'วันเวลาออกใบเสร็จ';
COMMENT ON COLUMN public.payment_records.payment_date IS 'วันเวลาที่รับชำระเงิน';