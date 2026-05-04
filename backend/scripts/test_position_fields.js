/**
 * Test script to verify position fields are working
 * Run: node backend/scripts/test_position_fields.js
 */

const pool = require('../src/config/db');

async function testPositionFields() {
    try {
        console.log('🧪 Testing position fields implementation...\n');

        // Test 1: Check if columns exist
        console.log('Test 1: Checking if columns exist in database...');
        const columnsCheck = await pool.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            AND column_name IN ('starting_position', 'end_position')
            ORDER BY column_name
        `);

        if (columnsCheck.rows.length === 2) {
            console.log('✅ Both columns exist:');
            columnsCheck.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}(${col.character_maximum_length})`);
            });
        } else {
            console.log('❌ Columns not found. Please run the migration first.');
            console.log('   Run: node backend/scripts/add_position_columns.js');
            process.exit(1);
        }

        // Test 2: Check existing bookings
        console.log('\nTest 2: Checking existing bookings...');
        const bookingsCheck = await pool.query(`
            SELECT COUNT(*) as total,
                   COUNT(starting_position) as with_starting,
                   COUNT(end_position) as with_ending
            FROM bookings
        `);
        
        const stats = bookingsCheck.rows[0];
        console.log(`✅ Bookings in database: ${stats.total}`);
        console.log(`   - With starting_position: ${stats.with_starting}`);
        console.log(`   - With end_position: ${stats.with_ending}`);

        // Test 3: Sample query
        console.log('\nTest 3: Sample booking with position fields...');
        const sampleBooking = await pool.query(`
            SELECT booking_ref, platform, starting_position, end_position, status
            FROM bookings
            ORDER BY created_at DESC
            LIMIT 1
        `);

        if (sampleBooking.rows.length > 0) {
            const booking = sampleBooking.rows[0];
            console.log('✅ Latest booking:');
            console.log(`   - Booking Ref: ${booking.booking_ref}`);
            console.log(`   - Platform: ${booking.platform}`);
            console.log(`   - From: ${booking.starting_position || 'Not set'}`);
            console.log(`   - To: ${booking.end_position || 'Not set'}`);
            console.log(`   - Status: ${booking.status}`);
        } else {
            console.log('ℹ️  No bookings found in database');
        }

        console.log('\n✅ All tests passed! Position fields are ready to use.');
        console.log('\n📝 Next steps:');
        console.log('   1. Update frontend booking form to include "From" and "To" fields');
        console.log('   2. Send startingPosition and endPosition in booking API request');
        console.log('   3. Display these fields in booking details page');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

testPositionFields()
    .then(() => {
        console.log('\n✅ Testing completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Testing failed:', err);
        process.exit(1);
    });
