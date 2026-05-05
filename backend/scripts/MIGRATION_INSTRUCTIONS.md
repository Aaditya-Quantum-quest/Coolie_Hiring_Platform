# Database Migration: Add Position Fields to Bookings

## Overview
This migration adds two new columns to the `bookings` table:
- `starting_position` - Where the customer needs the coolie (e.g., "Platform 5", "Entrance Gate A")
- `end_position` - Where the customer wants to go (e.g., "Exit B", "Platform 2")

## Migration Steps

### Option 1: Using Supabase SQL Editor (Recommended)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `add_position_columns.sql`
4. Click "Run" to execute the migration

### Option 2: Using psql
```bash
psql "postgresql://postgres.iyoeggzqrwuyqjffsseg:MyName%23Aaditya@aws-1-ap-south-1.pooler.supabase.com:6543/postgres" -f backend/scripts/add_position_columns.sql
```

### Option 3: Using Node.js Script
```bash
node backend/scripts/add_position_columns.js
```

## Verification
After running the migration, verify the columns exist:
```sql
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('starting_position', 'end_position');
```

Expected output:
```
column_name       | data_type         | character_maximum_length
------------------+-------------------+-------------------------
starting_position | character varying | 200
end_position      | character varying | 200
```

## Rollback (if needed)
If you need to remove these columns:
```sql
ALTER TABLE bookings 
DROP COLUMN IF EXISTS starting_position,
DROP COLUMN IF EXISTS end_position;
```

## Backend Changes
The following files have been updated to support these new fields:
- `backend/src/controllers/booking.controller.js` - Added fields to createBooking and getMyBookings
- `backend/src/config/schema.sql` - Updated schema for new installations
- Frontend booking form will need to be updated to include these input fields
