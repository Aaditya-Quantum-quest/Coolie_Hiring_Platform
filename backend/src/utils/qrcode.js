const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs')

const QR_DIR = path.join(__dirname, '../../uploads/qrcodes')

/**
 * Generate a QR code PNG for a verified coolie's profile.
 * QR data links to the coolie's public profile URL.
 *
 * @param {string} coolieId - e.g. CL-NDLS-X8F4K2
 * @param {string} clientUrl - frontend base URL
 * @returns {string} - local file path of saved QR image
 */
const generateCoolieQR = async (coolieId, clientUrl = process.env.CLIENT_URL || 'http://localhost:5173') => {
    // Ensure directory exists
    if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true })

    const profileUrl = `${clientUrl}/coolie/${coolieId}`
    const filename = `qr-${coolieId}.png`
    const filePath = path.join(QR_DIR, filename)

    await QRCode.toFile(filePath, profileUrl, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
            dark: '#1a1a2e',   // Deep navy QR dots
            light: '#ffffff',  // White background
        },
    })

    return `/uploads/qrcodes/${filename}`
}

/**
 * Generate QR as base64 data URL (for embedding in email or response)
 */
const generateCoolieQRBase64 = async (coolieId, clientUrl) => {
    const profileUrl = `${clientUrl || process.env.CLIENT_URL || 'http://localhost:5173'}/coolie/${coolieId}`
    return QRCode.toDataURL(profileUrl, { width: 300, margin: 2 })
}

module.exports = { generateCoolieQR, generateCoolieQRBase64 }
