-- Add total_earnings column to coolies table
ALTER TABLE coolies 
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_coolies_total_earnings ON coolies(total_earnings);

-- Update existing coolies with calculated earnings from completed bookings
UPDATE coolies c
SET total_earnings = COALESCE(
    (SELECT SUM(b.amount) 
     FROM bookings b 
     WHERE b.coolie_id = c.id 
     AND b.status = 'completed'),
    0.00
);

-- Create a function to automatically update total_earnings when a booking is completed
CREATE OR REPLACE FUNCTION update_coolie_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if status changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE coolies
        SET total_earnings = total_earnings + NEW.amount
        WHERE id = NEW.coolie_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update earnings
DROP TRIGGER IF EXISTS trigger_update_coolie_earnings ON bookings;
CREATE TRIGGER trigger_update_coolie_earnings
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_coolie_earnings();

-- Also handle INSERT case (if booking is created as completed)
CREATE OR REPLACE FUNCTION insert_coolie_earnings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE coolies
        SET total_earnings = total_earnings + NEW.amount
        WHERE id = NEW.coolie_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_insert_coolie_earnings ON bookings;
CREATE TRIGGER trigger_insert_coolie_earnings
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION insert_coolie_earnings();
