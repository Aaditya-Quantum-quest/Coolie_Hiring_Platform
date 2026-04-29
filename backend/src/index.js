require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const compression = require('compression');

const { createServer } = require('http');
const { Server } = require('socket.io');

const pool = require('./config/db');
const setupSocketHandlers = require('./socket/socketHandler');

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const rankingRoutes = require('./routes/rankings.routes');
const locationRoutes = require('./routes/location.routes');
const coolieRoutes = require('./routes/coolie.routes');
const customerRoutes = require('./routes/customer.routes');
const bookingRoutes = require('./routes/booking.routes');
const configRoutes = require('./routes/config.routes');

// Business Modules
const businessAuthRoutes = require('./routes/business/auth.routes');
const businessOwnerRoutes = require('./routes/business/owner.routes');
const businessPublicRoutes = require('./routes/business/public.routes');
const businessAdminRoutes = require('./routes/admin/businessAdmin.routes');

// ─────────────────────────────────────────────────────────────
// APP INIT
// ─────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// Render uses dynamic port
const PORT = process.env.PORT || 5000;

// Frontend domain
const CLIENT_URL =
    process.env.CLIENT_URL || 'http://localhost:5173';

// Trust proxy (important for Render / Railway / Heroku)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

setupSocketHandlers(io);

// ─────────────────────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin',
        },
    })
);

app.use(compression());

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─────────────────────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Try again later.',
    },
});

app.use(globalLimiter);

// ─────────────────────────────────────────────────────────────
// BODY PARSER
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// STATIC FILES
// ─────────────────────────────────────────────────────────────
app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'), {
        index: false,
    })
);

// ─────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────

// Main Auth
app.use('/api/auth', authLimiter, authRoutes);

// Admin
app.use('/api/v1/admin', adminRoutes);

// Rankings / XP / Leaderboard
app.use('/api/v1/rankings', rankingRoutes);

// GPS / Location
app.use('/api/location', locationRoutes);

// Coolie
app.use('/api/coolie', coolieRoutes);

// Customer
app.use('/api/customer', customerRoutes);

// Bookings
app.use('/api/bookings', bookingRoutes);

// App Config
app.use('/api/config', configRoutes);

// Business / Hotels / Restaurants
app.use('/api/v1/business/auth', businessAuthRoutes);
app.use('/api/v1/owner', businessOwnerRoutes);
app.use('/api/v1/public', businessPublicRoutes);
app.use('/api/v1/admin/businesses', businessAdminRoutes);

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            success: true,
            message: 'Coolie Hiring API Running',
            environment: process.env.NODE_ENV,
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            database: 'disconnected',
        });
    }
});

// ─────────────────────────────────────────────────────────────
// 404 ROUTE
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err.stack || err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large.',
        });
    }

    res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
        error: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// ─────────────────────────────────────────────────────────────
// START SERVER FIRST (BEST FOR RENDER)
// ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', async () => {
    console.log('────────────────────────────────');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Frontend Origin: ${CLIENT_URL}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
    console.log('────────────────────────────────');

    // DB Test
    try {
        await pool.query('SELECT 1');
        console.log('✅ PostgreSQL connected');
    } catch (err) {
        console.error('❌ Database failed:', err.message);
    }

    // Cron Jobs
    try {
        require('./crons/demotionCron');
        require('./crons/leaderboardCron');
        console.log('⏰ Cron jobs started');
    } catch (err) {
        console.error('❌ Cron error:', err.message);
    }
});

// ─────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received. Closing server...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received. Closing server...');
    await pool.end();
    process.exit(0);
});

module.exports = app;