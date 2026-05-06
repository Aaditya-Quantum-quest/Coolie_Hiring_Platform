const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { encrypt, decrypt, hashField } = require('../utils/encrypt')

// ─── PASSWORD ───────────────────────────────────────────────
const hashPassword = async (password) => bcrypt.hash(password, 12)
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash)

// ─── JWT TOKENS ─────────────────────────────────────────────
const generateTokens = (payload) => ({
    accessToken: jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '3d', // Changed to 3 days
    }),
    // FIX: use JWT_REFRESH_SECRET (not JWT_SECRET) so the two tokens
    // are signed with different keys and can be independently verified/revoked
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '3d', // Changed to 3 days
    }),
})

// ─── REFRESH TOKEN STORE ────────────────────────────────────
const storeRefreshToken = async (userId, userType, refreshToken) => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1 AND user_type = $2', [userId, userType])
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, user_type, token_hash, expires_at) VALUES ($1,$2,$3,$4)',
        [userId, userType, tokenHash, expiresAt]
    )
}

const verifyRefreshToken = async (refreshToken, userType) => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const result = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token_hash=$1 AND user_type=$2 AND expires_at > NOW()',
        [tokenHash, userType]
    )
    return result.rows[0] || null
}

const deleteRefreshToken = async (userId, userType) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1 AND user_type=$2', [userId, userType])
}

// ─── FILE URL HELPER ────────────────────────────────────────
const buildFileUrl = (filePath) => {
    if (!filePath) return null
    const parts = filePath.replace(/\\/g, '/').split('uploads/')
    return parts.length > 1 ? '/uploads/' + parts[1] : null
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER SERVICE
// ═══════════════════════════════════════════════════════════

const findCustomerByEmail = async (email) => {
    const r = await pool.query('SELECT * FROM customers WHERE email=$1', [email])
    return r.rows[0] || null
}

const findCustomerByPhone = async (phone) => {
    const r = await pool.query('SELECT * FROM customers WHERE phone=$1', [phone])
    return r.rows[0] || null
}

const createCustomer = async ({ name, email, password, phone, city }) => {
    const password_hash = await hashPassword(password)
    const r = await pool.query(
        `INSERT INTO customers (name, email, password_hash, phone, city)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, name, email, phone, city, created_at`,
        [name, email, password_hash, phone, city || null]
    )
    return r.rows[0]
}

const getCustomerById = async (id) => {
    const r = await pool.query(
        `SELECT id, name, email, phone, city, profile_photo_url, is_active, is_banned, created_at
         FROM customers WHERE id=$1`,
        [id]
    )
    return r.rows[0] || null
}

// ─── Customer Login Lockout ──────────────────────────────────
const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutes

const checkCustomerLock = async (id) => {
    const r = await pool.query('SELECT login_attempts, locked_until FROM customers WHERE id=$1', [id])
    return r.rows[0] || null
}

const incrementCustomerAttempts = async (id) => {
    await pool.query(
        `UPDATE customers
         SET login_attempts = login_attempts + 1,
             locked_until = CASE WHEN login_attempts + 1 >= $2
                            THEN NOW() + INTERVAL '30 minutes'
                            ELSE locked_until END
         WHERE id = $1`,
        [id, MAX_ATTEMPTS]
    )
    const r = await pool.query('SELECT login_attempts FROM customers WHERE id=$1', [id])
    return r.rows[0]?.login_attempts || 0
}

const resetCustomerAttempts = async (id) => {
    await pool.query('UPDATE customers SET login_attempts=0, locked_until=NULL WHERE id=$1', [id])
}

// ═══════════════════════════════════════════════════════════
// COOLIE SERVICE
// ═══════════════════════════════════════════════════════════

const findCoolieByEmail = async (email) => {
    const r = await pool.query('SELECT * FROM coolies WHERE email=$1', [email])
    return r.rows[0] || null
}

const findCoolieByPhone = async (phone) => {
    const r = await pool.query('SELECT * FROM coolies WHERE phone=$1', [phone])
    return r.rows[0] || null
}

const findCoolieByAadhaarHash = async (aadhaar_number) => {
    const hash = hashField(aadhaar_number)
    const r = await pool.query('SELECT id FROM coolies WHERE aadhaar_number_hash=$1', [hash])
    return r.rows[0] || null
}

/**
 * Find coolie by their system-generated Coolie ID (for login)
 */
const findCoolieByCoolieId = async (coolieId) => {
    const r = await pool.query('SELECT * FROM coolies WHERE coolie_id=$1', [coolieId])
    return r.rows[0] || null
}

/**
 * Create coolie with encrypted sensitive fields.
 * is_active = FALSE until admin approves.
 */
const createCoolie = async (data, files) => {
    const {
        name, email, password, phone, alt_phone,
        date_of_birth, gender, address, city, state, pincode,
        station_name, station_code, age,
        aadhaar_number, secondary_doc_type, secondary_doc_number,
        bank_name, ifsc_code, upi_id,
        working_platforms, languages_spoken,
    } = data

    const password_hash = await hashPassword(password)

    // Parse JSON array fields (sent as strings via form-data)
    const platforms = working_platforms
        ? (typeof working_platforms === 'string' ? JSON.parse(working_platforms) : working_platforms)
        : []
    const languages = languages_spoken
        ? (typeof languages_spoken === 'string' ? JSON.parse(languages_spoken) : languages_spoken)
        : []

    // 🔐 Encrypt sensitive fields
    const aadhaar_number_hash = hashField(aadhaar_number)        // for uniqueness check
    const aadhaar_number_enc = encrypt(aadhaar_number)           // encrypted storage
    const secondary_doc_number_enc = encrypt(secondary_doc_number)

    // Build upload file URLs
    const passport_photo_url = buildFileUrl(files?.passport_photo?.[0]?.path)
    const aadhaar_front_url = buildFileUrl(files?.aadhaar_front?.[0]?.path)
    const aadhaar_back_url = buildFileUrl(files?.aadhaar_back?.[0]?.path)
    const secondary_doc_front_url = buildFileUrl(files?.secondary_doc_front?.[0]?.path)
    const secondary_doc_back_url = buildFileUrl(files?.secondary_doc_back?.[0]?.path)

    const r = await pool.query(
        `INSERT INTO coolies (
            name, email, password_hash, phone, alt_phone,
            date_of_birth, gender, address, city, state, pincode,
            station_name, station_code, working_platforms, age, languages_spoken,
            aadhaar_number_hash, aadhaar_number_enc, aadhaar_front_url, aadhaar_back_url,
            secondary_doc_type, secondary_doc_number_enc, secondary_doc_front_url, secondary_doc_back_url,
            passport_photo_url,
            bank_name, ifsc_code, upi_id,
            is_active, temp_password
        ) VALUES (
            $1,$2,$3,$4,$5,
            $6,$7,$8,$9,$10,$11,
            $12,$13,$14,$15,$16,
            $17,$18,$19,$20,
            $21,$22,$23,$24,
            $25,
            $26,$27,$28,
            FALSE, $29
        )
        RETURNING id, name, email, phone, station_name, verification_status, created_at`,
        [
            name, email, password_hash, phone, alt_phone || null,
            date_of_birth, gender, address, city, state, pincode,
            station_name, station_code || null, platforms, age || 18, languages,
            aadhaar_number_hash, aadhaar_number_enc, aadhaar_front_url, aadhaar_back_url,
            secondary_doc_type, secondary_doc_number_enc, secondary_doc_front_url, secondary_doc_back_url,
            passport_photo_url,
            bank_name || null, ifsc_code || null, upi_id || null,
            password // store plain password temporarily for approval email
        ]
    )

    // Send "Registration Received" email
    const { sendRegistrationReceivedEmail } = require('../utils/mailer')
    await sendRegistrationReceivedEmail(email, name).catch(console.error)

    return r.rows[0]
}

const getCoolieById = async (id) => {
    const r = await pool.query(
        `SELECT id, coolie_id, name, email, phone, alt_phone, station_name, station_code,
                passport_photo_url, qr_code_url, age, languages_spoken,
                gender, date_of_birth, address, city, state, pincode,
                bank_name, ifsc_code, upi_id,
                aadhaar_number_enc, secondary_doc_number_enc,
                aadhaar_front_url, aadhaar_back_url, secondary_doc_front_url, secondary_doc_back_url,
                rating_avg, total_trips,
                verification_status, is_verified, is_active, is_suspended, created_at
         FROM coolies WHERE id=$1`,
        [id]
    )
    const coolie = r.rows[0]
    if (!coolie) return null

    // Decrypt document numbers for the owner
    try {
        if (coolie.aadhaar_number_enc) {
            coolie.aadhaar_number = decrypt(coolie.aadhaar_number_enc)
        }
        if (coolie.secondary_doc_number_enc) {
            coolie.secondary_doc_number = decrypt(coolie.secondary_doc_number_enc)
        }
    } catch (err) {
        console.error('[Decryption Error] Failed to decrypt document numbers:', err.message)
    }

    // Remove encrypted versions from response
    delete coolie.aadhaar_number_enc
    delete coolie.secondary_doc_number_enc

    return coolie
}

// ─── Coolie Login Lockout ────────────────────────────────────
const checkCoolieLock = async (id) => {
    const r = await pool.query('SELECT login_attempts, locked_until FROM coolies WHERE id=$1', [id])
    return r.rows[0] || null
}

const incrementCoolieAttempts = async (id) => {
    await pool.query(
        `UPDATE coolies
         SET login_attempts = login_attempts + 1,
             locked_until = CASE WHEN login_attempts + 1 >= $2
                            THEN NOW() + INTERVAL '30 minutes'
                            ELSE locked_until END
         WHERE id = $1`,
        [id, MAX_ATTEMPTS]
    )
    const r = await pool.query('SELECT login_attempts FROM coolies WHERE id=$1', [id])
    return r.rows[0]?.login_attempts || 0
}

const resetCoolieAttempts = async (id) => {
    await pool.query('UPDATE coolies SET login_attempts=0, locked_until=NULL WHERE id=$1', [id])
}

// ═══════════════════════════════════════════════════════════
// ADMIN SERVICE
// ═══════════════════════════════════════════════════════════

const findAdminByEmail = async (email) => {
    const r = await pool.query('SELECT * FROM admins WHERE email=$1', [email])
    return r.rows[0] || null
}

const getAdminById = async (id) => {
    const r = await pool.query('SELECT id, name, email, role FROM admins WHERE id=$1', [id])
    return r.rows[0] || null
}

const getPendingCoolies = async () => {
    const r = await pool.query(
        `SELECT id, name, email, phone, city, station_name, station_code,
                passport_photo_url, aadhaar_front_url, aadhaar_back_url,
                secondary_doc_type, secondary_doc_front_url, secondary_doc_back_url,
                verification_status, verification_level,
                age, date_of_birth, gender, address, state, pincode,
                created_at
         FROM coolies
         WHERE verification_status IN ('pending','level1_approved','under_review')
         ORDER BY created_at ASC`
    )
    return r.rows
}

const getCoolieForAdmin = async (id) => {
    const r = await pool.query(
        `SELECT id, coolie_id, name, email, phone, alt_phone,
                date_of_birth, gender, address, city, state, pincode,
                station_name, station_code, working_platforms, age, languages_spoken,
                passport_photo_url, aadhaar_front_url, aadhaar_back_url,
                secondary_doc_type, secondary_doc_front_url, secondary_doc_back_url,
                aadhaar_number_enc, secondary_doc_number_enc,
                bank_name, ifsc_code, upi_id,
                qr_code_url, verification_status, verification_level,
                level1_approved_at, level2_approved_at,
                rejection_reason, is_verified, is_active,
                created_at
         FROM coolies WHERE id=$1`,
        [id]
    )
    const coolie = r.rows[0];
    if (!coolie) return null;

    return {
        ...coolie,
        aadhaar_number: decrypt(coolie.aadhaar_number_enc),
        secondary_doc_number: decrypt(coolie.secondary_doc_number_enc)
    };
}

/**
 * Level 1 approval — document verification
 */
const approveLevel1 = async (coolieId, adminId) => {
    await pool.query(
        `UPDATE coolies SET
            verification_status = 'level1_approved',
            verification_level = 1,
            level1_approved_by = $2,
            level1_approved_at = NOW()
         WHERE id = $1`,
        [coolieId, adminId]
    )
}

/**
 * Level 2 approval — final approval
 * Generates: Coolie ID, QR code, activates account, sends email
 */
const approveLevel2 = async (coolieDbId, adminId) => {
    // Get coolie details for ID generation and email
    const r = await pool.query('SELECT name, email, station_name, temp_password FROM coolies WHERE id=$1', [coolieDbId])
    const coolie = r.rows[0]
    if (!coolie) throw new Error('Coolie not found')

    // Generate unique Coolie ID
    const { generateUniqueCoolieId } = require('../utils/generateCoolieId')
    const generatedCoolieId = await generateUniqueCoolieId(pool, coolie.station_name)

    // Generate QR code
    const { generateCoolieQR } = require('../utils/qrcode')
    const qrCodeUrl = await generateCoolieQR(generatedCoolieId)

    // Update DB — activate account and CLEAR temp_password
    await pool.query(
        `UPDATE coolies SET
            coolie_id = $2,
            qr_code_url = $3,
            verification_status = 'approved',
            verification_level = 2,
            is_verified = TRUE,
            is_active = TRUE,
            level2_approved_by = $4,
            level2_approved_at = NOW(),
            temp_password = NULL
         WHERE id = $1`,
        [coolieDbId, generatedCoolieId, qrCodeUrl, adminId]
    )

    // Send approval email with ID and plain password
    const { sendApprovalEmail } = require('../utils/mailer')
    await sendApprovalEmail(coolie.email, coolie.name, generatedCoolieId, coolie.temp_password).catch(console.error)

    return { coolie_id: generatedCoolieId, qr_code_url: qrCodeUrl }
}

/**
 * Reject coolie with reason
 */
const rejectCoolie = async (coolieDbId, adminId, reason) => {
    const r = await pool.query('SELECT name, email FROM coolies WHERE id=$1', [coolieDbId])
    const coolie = r.rows[0]

    await pool.query(
        `UPDATE coolies SET
            verification_status = 'rejected',
            rejection_reason = $2,
            is_active = FALSE
         WHERE id = $1`,
        [coolieDbId, reason || 'Documents could not be verified']
    )

    const { sendRejectionEmail } = require('../utils/mailer')
    await sendRejectionEmail(coolie?.email, coolie?.name, reason).catch(console.error)
}

// ─── PASSWORD RESET ────────────────────────────────────────
const generateResetToken = () => Math.floor(100000 + Math.random() * 900000).toString()

const createPasswordResetToken = async (email, userType) => {
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    await pool.query(
        'DELETE FROM password_reset_tokens WHERE email = $1 AND user_type = $2',
        [email, userType]
    )
    await pool.query(
        'INSERT INTO password_reset_tokens (email, token, expires_at, user_type) VALUES ($1, $2, $3, $4)',
        [email, token, expiresAt, userType]
    )
    return token
}

const findPasswordResetToken = async (token) => {
    const result = await pool.query(
        'SELECT * FROM password_reset_tokens WHERE token = $1 AND is_used = FALSE AND expires_at > NOW()',
        [token]
    )
    return result.rows[0] || null
}

const markResetTokenAsUsed = async (token) => {
    await pool.query(
        'UPDATE password_reset_tokens SET is_used = TRUE WHERE token = $1',
        [token]
    )
}

const updateCustomerPassword = async (email, newPassword) => {
    const hashedPassword = await hashPassword(newPassword)
    await pool.query(
        'UPDATE customers SET password_hash = $1, login_attempts = 0, locked_until = NULL WHERE email = $2',
        [hashedPassword, email]
    )
}

const updateCooliePassword = async (email, newPassword) => {
    const hashedPassword = await hashPassword(newPassword)
    await pool.query(
        'UPDATE coolies SET password_hash = $1, login_attempts = 0, locked_until = NULL WHERE email = $2',
        [hashedPassword, email]
    )
}

module.exports = {

    generateTokens, storeRefreshToken, verifyRefreshToken, deleteRefreshToken,

    comparePassword,
    // customer
    findCustomerByEmail, findCustomerByPhone, createCustomer, getCustomerById,
    checkCustomerLock, incrementCustomerAttempts, resetCustomerAttempts,
    // coolie
    findCoolieByEmail, findCoolieByPhone, findCoolieByAadhaarHash,
    findCoolieByCoolieId, createCoolie, getCoolieById,
    checkCoolieLock, incrementCoolieAttempts, resetCoolieAttempts,
    // admin
    findAdminByEmail, getAdminById,
    getPendingCoolies, getCoolieForAdmin,
    approveLevel1, approveLevel2, rejectCoolie,
    // password reset
    generateResetToken, createPasswordResetToken, findPasswordResetToken, 
    markResetTokenAsUsed, updateCustomerPassword, updateCooliePassword,
    // constants
    MAX_ATTEMPTS,
}