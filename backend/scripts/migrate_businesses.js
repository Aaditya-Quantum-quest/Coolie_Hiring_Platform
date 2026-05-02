const db = require('../src/config/db');

async function migrate() {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            ALTER TABLE businesses
                ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'pending',
                ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS level1_approved_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS level1_approved_by UUID,
                ADD COLUMN IF NOT EXISTS level2_approved_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS level2_approved_by UUID,
                ADD COLUMN IF NOT EXISTS rejection_reason TEXT
        `);

        // Sync existing 'approved' businesses to level 2
        await client.query(`
            UPDATE businesses
            SET verification_level = 2, verification_status = 'fully_approved'
            WHERE status = 'approved'
        `);

        // Sync existing 'rejected' businesses
        await client.query(`
            UPDATE businesses
            SET verification_status = 'rejected'
            WHERE status = 'rejected'
        `);

        await client.query('COMMIT');
        console.log('SUCCESS: businesses table migration complete!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('ERROR:', e.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
