const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetPassword() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.log('Usage: node scripts/resetAdminPassword.js <email> <newPassword>');
        process.exit(1);
    }

    try {
        console.log(`--- Resetting password for ${email} ---`);
        
        // 1. Check if admin exists
        const existing = await pool.query('SELECT id, role FROM admins WHERE email=$1', [email]);
        if (existing.rows.length === 0) {
            console.error(`❌ Admin with email "${email}" not found.`);
            process.exit(1);
        }

        // 2. Hash new password
        const password_hash = await bcrypt.hash(newPassword, 12);

        // 3. Update DB
        await pool.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [password_hash, email]);

        console.log(`✅ Password updated successfully for ${email} (${existing.rows[0].role})!`);
    } catch (err) {
        console.error('❌ Failed to reset password:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

resetPassword();
