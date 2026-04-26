require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const path = require('path')

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const rankingRoutes = require('./routes/rankings.routes')
const locationRoutes = require('./routes/location.routes')
const coolieRoutes = require('./routes/coolie.routes')
const customerRoutes = require('./routes/customer.routes')
const bookingRoutes = require('./routes/booking.routes')
const configRoutes = require('./routes/config.routes')

// Business (Hotels & Restaurants) routes
const businessAuthRoutes = require('./routes/business/auth.routes')
const businessOwnerRoutes = require('./routes/business/owner.routes')
const businessPublicRoutes = require('./routes/business/public.routes')
const businessAdminRoutes = require('./routes/admin/businessAdmin.routes')

const { createServer } = require('http')
const { Server } = require('socket.io')
const setupSocketHandlers = require('./socket/socketHandler')

const app = express()
const httpServer = createServer(app)

// ─── SOCKET.IO SETUP ───────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
})

// Initialize Socket event handlers
setupSocketHandlers(io)

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving static images
    })
)

// ─── CORS ───────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,         // Allow cookies to be sent cross-origin
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
)

// ─── RATE LIMITERS ──────────────────────────────────────────────────
// Global rate limit: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
})

// Strict rate limit for auth routes: 100 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased for development to prevent false positives
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
    skipSuccessfulRequests: true,   // Don't count successful requests
})

app.use(globalLimiter)

// ─── BODY PARSERS ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── STATIC FILE SERVING (Uploaded documents & photos) ─────────────
// Access uploaded files via: https://coolie-hiring-platform-backend.onrender.com/uploads/...
app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'), {
        // Basic security: don't allow directory listing
        index: false,
    })
)

// ─── ROUTES ────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/v1/admin', adminRoutes) // Removed authLimiter here as it was limiting dashboard polling
app.use('/api/v1/rankings', rankingRoutes)
app.use('/api/location', locationRoutes)
app.use('/api/coolie', coolieRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/config', configRoutes)

// Business (Hotels & Restaurants)
app.use('/api/v1/business/auth', businessAuthRoutes)
app.use('/api/v1/owner', businessOwnerRoutes)
app.use('/api/v1/public', businessPublicRoutes)
app.use('/api/v1/admin/businesses', businessAdminRoutes)

// ─── HEALTH CHECK ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Coolie Hiring API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    })
})

// ─── 404 HANDLER ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
})

// ─── GLOBAL ERROR HANDLER ──────────────────────────────────────────
app.use((err, req, res, next) => {
    // Multer errors (file too large, wrong type)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' })
    }
    if (err.message?.includes('Only JPEG')) {
        return res.status(415).json({ success: false, message: err.message })
    }

    console.error('Unhandled error:', err)
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
    })
})

// ─── START SERVER ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

// Boot up DB connection then start server
const pool = require('./config/db')

pool.query('SELECT 1').then(() => {
    httpServer.listen(PORT, () => {
        console.log(`\n🚀 Server & Socket.IO running on http://localhost:${PORT}`)
        console.log(`📁 Environment: ${process.env.NODE_ENV}`)
        console.log(`📂 Uploads served at: http://localhost:${PORT}/uploads`)
        console.log(`🔐 Auth API at: http://localhost:${PORT}/api/auth`)
        console.log(`🏆 Rankings API at: http://localhost:${PORT}/api/v1/rankings\n`)
    })

    // Start cron jobs
    require('./crons/demotionCron')
    require('./crons/leaderboardCron')
    console.log('⏰ Cron jobs registered (DemotionCron + LeaderboardCron)')
}).catch((err) => {
    console.error('❌ Could not connect to PostgreSQL:', err.message)
    console.error('💡 Make sure PostgreSQL is running and DATABASE_URL in .env is correct.')
    process.exit(1)
})

module.exports = app
