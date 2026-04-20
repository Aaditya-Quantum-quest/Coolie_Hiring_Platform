const crypto = require('crypto')

const ALGORITHM = 'aes-256-cbc'

// Derive a 32-byte key from the JWT_SECRET (never store the raw key anywhere)
const getKey = () => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set in .env')
    return crypto.scryptSync(process.env.JWT_SECRET, 'coolie-salt-v1', 32)
}

/**
 * Encrypt a plain-text string.
 * Returns: "iv_hex:encrypted_hex"
 */
const encrypt = (plainText) => {
    if (!plainText) return null
    const key = getKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()])
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt an encrypted string produced by encrypt().
 */
const decrypt = (encryptedText) => {
    if (!encryptedText) return null
    try {
        const [ivHex, encryptedHex] = encryptedText.split(':')
        if (!ivHex || !encryptedHex) return null
        const key = getKey()
        const iv = Buffer.from(ivHex, 'hex')
        const encryptedBuf = Buffer.from(encryptedHex, 'hex')
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        const decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()])
        return decrypted.toString('utf8')
    } catch {
        return null
    }
}

/**
 * Hash sensitive data for searchability (one-way).
 * Used for lookups (e.g. "does this Aadhaar already exist?")
 */
const hashField = (value) => {
    if (!value) return null
    return crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback').update(String(value)).digest('hex')
}

module.exports = { encrypt, decrypt, hashField }
