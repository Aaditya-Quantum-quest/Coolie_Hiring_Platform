-- Migration: Add starting_position and end_position columns to bookings table
-- Run this in your PostgreSQL client (pgAdmin, psql, or Supabase SQL Editor)

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS starting_position VARCHAR(200),
ADD COLUMN IF NOT EXISTS end_position VARCHAR(200);

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('starting_position', 'end_position');
