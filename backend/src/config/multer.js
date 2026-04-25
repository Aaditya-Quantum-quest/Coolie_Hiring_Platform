const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload dirs exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// Disk storage factory
const createStorage = (folder) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '../../uploads', folder)
            ensureDir(dir)
            cb(null, dir)
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase()
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
            cb(null, uniqueName)
        },
    })

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only JPEG, PNG, or PDF files are allowed'), false)
    }
}

const limits = { fileSize: 2 * 1024 * 1024 } // 2MB max

// Coolie KYC — 4 files: passport_photo, aadhaar_front, aadhaar_back, secondary_doc
const coolieUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let folder = 'misc'
            if (file.fieldname === 'passport_photo') folder = 'passport_photos'
            else if (file.fieldname === 'aadhaar_front') folder = 'aadhaar'
            else if (file.fieldname === 'aadhaar_back') folder = 'aadhaar'
            else if (file.fieldname === 'secondary_doc') folder = 'secondary_docs'

            const dir = path.join(__dirname, '../../uploads', folder)
            ensureDir(dir)
            cb(null, dir)
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase()
            cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
        },
    }),
    fileFilter,
    limits,
}).fields([
    { name: 'passport_photo', maxCount: 1 },
    { name: 'aadhaar_front', maxCount: 1 },
    { name: 'aadhaar_back', maxCount: 1 },
    { name: 'secondary_doc', maxCount: 1 },
])

// Customer profile photo (single optional)
const customerPhotoUpload = multer({
    storage: createStorage('profile_photos'),
    fileFilter,
    limits,
}).single('profile_photo')

module.exports = { coolieUpload, customerPhotoUpload }
