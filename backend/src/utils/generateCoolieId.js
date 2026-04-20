const crypto = require('crypto')

// Station code maps (add more as needed)
const STATION_CODES = {
    // Delhi
    'new delhi': 'NDLS',
    'delhi': 'DLI',
    'hazrat nizamuddin': 'NZM',
    'anand vihar': 'ANVT',
    // Mumbai
    'mumbai cst': 'CSTM',
    'mumbai central': 'MMCT',
    'lokmanya tilak': 'LTT',
    'bandra terminus': 'BDTS',
    // Kolkata
    'howrah': 'HWH',
    'sealdah': 'SDAH',
    'kolkata': 'KOAA',
    // Chennai
    'chennai central': 'MAS',
    'chennai egmore': 'MS',
    // Bangalore
    'bangalore': 'SBC',
    'krantivira': 'SBC',
    // Hyderabad
    'hyderabad deccan': 'HYB',
    'secunderabad': 'SC',
    // Ahmedabad
    'ahmedabad': 'ADI',
    // Pune
    'pune': 'PUNE',
    // Jaipur
    'jaipur': 'JP',
    // Patna
    'patna': 'PNBE',
    // Lucknow
    'lucknow': 'LKO',
}

/**
 * Get station code for a station name.
 * Falls back to first 4 chars uppercased if not in map.
 */
const getStationCode = (stationName) => {
    const normalized = stationName.toLowerCase().trim()

    // Direct match
    if (STATION_CODES[normalized]) return STATION_CODES[normalized]

    // Partial match
    for (const [key, code] of Object.entries(STATION_CODES)) {
        if (normalized.includes(key) || key.includes(normalized)) return code
    }

    // Fallback: first 4 uppercase letters
    return stationName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'STNX'
}

/**
 * Generate a secure, non-sequential Coolie ID.
 * Format: CL-{STATION_CODE}-{6 random alphanumeric chars}
 * Example: CL-NDLS-X8F4K2
 *
 * Uses crypto.randomBytes for cryptographic security.
 */
const generateCoolieId = (stationName) => {
    const stationCode = getStationCode(stationName)

    // Generate 6 cryptographically random alphanumeric characters (uppercase)
    const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars: 0,1,I,O
    const randomBytes = crypto.randomBytes(6)
    const randomPart = Array.from(randomBytes)
        .map((byte) => CHARSET[byte % CHARSET.length])
        .join('')

    return `CL-${stationCode}-${randomPart}`
}

/**
 * Check if a generated Coolie ID is unique in the DB.
 * Returns a guaranteed-unique ID.
 */
const generateUniqueCoolieId = async (pool, stationName) => {
    let coolieId
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
        coolieId = generateCoolieId(stationName)
        const result = await pool.query('SELECT id FROM coolies WHERE coolie_id = $1', [coolieId])
        if (result.rows.length === 0) isUnique = true
        attempts++
    }

    if (!isUnique) throw new Error('Failed to generate unique Coolie ID after 10 attempts')

    return coolieId
}

module.exports = { generateCoolieId, generateUniqueCoolieId, getStationCode }
