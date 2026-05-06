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
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
]
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Trust proxy (important for Render / Railway / Heroku)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const allowed =
                allowedOrigins.includes(origin) ||
                /https:\/\/coolie-hiring-platform.*\.vercel\.app$/.test(origin);
            if (allowed) callback(null, true);
            else callback(new Error(`Socket CORS blocked: ${origin}`));
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

setupSocketHandlers(io);

// Make io accessible in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

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
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const allowed =
                allowedOrigins.includes(origin) ||
                /https:\/\/coolie-hiring-platform.*\.vercel\.app$/.test(origin);
            if (allowed) callback(null, true);
            else callback(new Error(`CORS blocked: ${origin}`));
        },
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
    max: 1000, // Increased from 200 to 1000 to handle polling
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
const fs = require('fs');
app.use('/uploads', (req, res, next) => {
    const localPath = path.join(__dirname, '../uploads', req.path);
    if (fs.existsSync(localPath) && fs.lstatSync(localPath).isFile()) {
        return next();
    }
    
    // Only fallback to production Render server if NOT in production
    // AND NOT already on the production host to avoid infinite loops
    const isProduction = process.env.NODE_ENV === 'production';
    const isRenderHost = req.get('host') === 'coolie-hiring-platform.onrender.com';

    if (!isProduction && !isRenderHost) {
        return res.redirect(`https://coolie-hiring-platform.onrender.com/uploads${req.path}`);
    }
    
    // If on production or already on Render host and file doesn't exist, just 404
    res.status(404).json({ success: false, message: 'File not found' });
});

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
app.use('/api/v1/coolies', coolieRoutes);

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
        const startTime = Date.now();
        await pool.query('SELECT 1');
        const responseTime = Date.now() - startTime;

        res.status(200).json({
            success: true,
            message: 'Coolie Hiring API Running',
            environment: process.env.NODE_ENV,
            database: {
                status: 'connected',
                responseTime: `${responseTime}ms`
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            database: {
                status: 'disconnected',
                error: err.message
            },
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

    // DB Test with retry logic
    let dbConnected = false;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (!dbConnected && retryCount < maxRetries) {
        try {
            await pool.query('SELECT 1');
            console.log('✅ PostgreSQL connected');
            dbConnected = true;
        } catch (err) {
            retryCount++;
            console.error(`❌ Database connection failed (attempt ${retryCount}/${maxRetries}):`, err.message);
            
            if (retryCount < maxRetries) {
                console.log(`⏳ Retrying in ${retryCount * 2} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
            } else {
                console.error('❌ Max database connection retries reached. Server will continue but database features may not work.');
            }
        }
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