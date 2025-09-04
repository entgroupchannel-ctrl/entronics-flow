-- Create foreign key relationship between international_transfer_requests and profiles
ALTER TABLE international_transfer_requests 
ADD CONSTRAINT international_transfer_requests_requested_by_fkey 
FOREIGN KEY (requested_by) REFERENCES profiles(user_id) ON DELETE SET NULL;