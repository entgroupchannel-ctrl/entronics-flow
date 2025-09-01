-- First, let's add a line_id field to service_requests table for customer info
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_line_id TEXT;

-- Add warranty tracking fields to delivery_orders if not exist
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS warranty_tracking_enabled BOOLEAN DEFAULT true;

-- Update delivery_items to ensure warranty triggers properly
-- Create trigger to auto-update warranty start date when delivery is marked as delivered
CREATE OR REPLACE FUNCTION update_warranty_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- When delivery status changes to 'delivered', update warranty start dates
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Update warranty start date for all items in this delivery
    UPDATE delivery_items 
    SET warranty_start_date = CURRENT_DATE,
        warranty_end_date = CURRENT_DATE + INTERVAL '1 day' * warranty_period_days
    WHERE delivery_order_id = NEW.id
      AND warranty_period_days > 0
      AND warranty_start_date IS NULL;
      
    -- Update any existing warranty records  
    UPDATE product_warranties 
    SET warranty_start_date = CURRENT_DATE,
        warranty_end_date = CURRENT_DATE + INTERVAL '1 day' * 
          (SELECT warranty_period_days FROM delivery_items 
           WHERE delivery_items.id = product_warranties.delivery_item_id LIMIT 1)
    WHERE delivery_item_id IN (
      SELECT id FROM delivery_items WHERE delivery_order_id = NEW.id
    )
    AND warranty_start_date < CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on delivery_orders
DROP TRIGGER IF EXISTS trigger_update_warranty_on_delivery ON delivery_orders;
CREATE TRIGGER trigger_update_warranty_on_delivery
  AFTER UPDATE ON delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_warranty_on_delivery();