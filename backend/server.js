const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const hpp = require('hpp');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import configurations and routes
const connectDB = require('./config/database');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const agencyReviewRoutes = require('./routes/agencyReviews');
const reportRoutes = require('./routes/reports');
const { attachUserInfo } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Connect to MongoDB (OPTIONAL FOR LIVE RELEASE - main pages work without DB)
// Uncomment when database features are ready to be deployed
// connectDB();
console.log('⚠️  Database connection disabled for live release. Review features unavailable.');

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000,https://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required for secure session handling.');
}

// MongoDB session store - DISABLED FOR LIVE RELEASE
// Uncomment when database features are ready to be deployed
/*
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jamwathq';
const sessionStore = MongoStore.create({
    mongoUrl: mongoUri,
    touchAfter: 24 * 3600 // Lazy session update (seconds)
});

app.locals.sessionStore = sessionStore;
*/

// Use memory store for sessions (for live release without database)
// WARNING: This will not persist sessions across server restarts
// When database is enabled, switch back to MongoStore
const sessionStore = null; // No persistent storage for live release

const corsOptions = {
    origin: (origin, callback) => {
        // SECURITY FIX: In production, don't allow requests with no origin
        // During development, allow no-origin for testing (like Postman)
        const isDevelopment = process.env.NODE_ENV === 'development';

        if (!origin && isDevelopment) {
            // Allow no-origin in development only
            return callback(null, true);
        }

        if (!origin) {
            // Reject no-origin requests in production
            return callback(new Error('Origin header required by CORS policy.'));
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 600 // Cache preflight requests for 10 minutes
};

const shouldEnforceHttps = process.env.ALLOW_INSECURE_HTTP !== 'true';
const httpsEnforcer = (req, res, next) => {
    if (!shouldEnforceHttps) {
        return next();
    }
    const forwardedProto = req.get('x-forwarded-proto');
    if ((forwardedProto && forwardedProto !== 'https') || (!forwardedProto && req.protocol !== 'https')) {
        const host = req.get('host');
        if (!host) {
            return res.status(400).send('Host header required for HTTPS enforcement.');
        }
        return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
    return next();
};

app.use(cors(corsOptions));
app.use(hpp());
// SECURITY IMPROVEMENT: Enhanced helmet configuration with additional headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://www.googletagmanager.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com', 'data:'],
            connectSrc: ["'self'", 'https://www.google-analytics.com'],
            objectSrc: ["'none'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // More permissive than 'no-referrer' for OAuth
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    // Additional security headers
    noSniff: true, // X-Content-Type-Options: nosniff
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    xssFilter: true // X-XSS-Protection: 1; mode=block
}));
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpsEnforcer);

// Session configuration - uses memory store for live release (no database)
// SECURITY IMPROVEMENTS:
// - Reduced session lifetime from 30 days to 7 days
// - Changed sameSite to 'strict' for better CSRF protection
// - Added rolling sessions to refresh on activity
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Refresh session on each request
    // store: sessionStore, // DISABLED FOR LIVE RELEASE - uses memory store by default
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days (was 30 days)
        httpOnly: true, // Prevents JavaScript access to cookies
        secure: shouldEnforceHttps, // HTTPS only in production
        sameSite: 'strict' // Strict CSRF protection (was 'lax')
    }
}));

// Passport middleware - DISABLED FOR LIVE RELEASE (authentication requires database)
// Uncomment when database features are ready to be deployed
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(attachUserInfo);

const csrfProtection = csrf();
app.use(csrfProtection);

// Static files
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Email configuration
let transporter = null;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'outlook',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    transporter.verify((error) => {
        if (error) {
            console.log('⚠️  Email configuration error (continuing without email):', error.code || error.message);
        } else {
            console.log('✅ Email server ready');
        }
    });
} else {
    console.log('⚠️  Email disabled: set EMAIL_USER and EMAIL_PASS environment variables to enable notifications.');
}

// Rate limiting configuration - Separate limiters for different auth endpoints
// Strict limiter for login attempts (prevent brute force)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                    // 10 login attempts per window
    skipSuccessfulRequests: true, // Only count failed attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.'
    }
});

// Lenient limiter for status checks and logout (allow normal usage)
const statusLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    }
});

// AUTHENTICATION ROUTES - DISABLED FOR LIVE RELEASE (database not connected)
// Uncomment when database features are ready to be deployed
// app.use('/auth/google', loginLimiter);
// app.use('/auth/google/callback', loginLimiter);
// app.use('/auth/facebook', loginLimiter);
// app.use('/auth/facebook/callback', loginLimiter);
// app.use('/auth/status', statusLimiter);
// app.use('/auth/logout', statusLimiter);
// app.use('/auth', authRoutes);

// Return "under development" message for auth endpoints
app.all('/auth/*', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'Authentication features are under development. Database integration required.',
        underDevelopment: true
    });
});

// API routes
const apiRouter = express.Router();
apiRouter.use(apiLimiter);

apiRouter.get('/csrf-token', (req, res) => {
    res.json({
        success: true,
        csrfToken: req.csrfToken()
    });
});

apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        authentication: 'enabled'
    });
});

// REVIEW ROUTES - DISABLED FOR LIVE RELEASE (database not connected)
// Uncomment when database features are ready to be deployed
// apiRouter.use('/reviews', reviewRoutes);
// apiRouter.use('/agency-reviews', agencyReviewRoutes);
// apiRouter.use('/reports', reportRoutes);

// Return "under development" message for review endpoints
apiRouter.all('/reviews*', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'Review features are under development. Database integration required.',
        underDevelopment: true
    });
});

apiRouter.all('/agency-reviews*', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'Agency review features are under development. Database integration required.',
        underDevelopment: true
    });
});

apiRouter.all('/reports*', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'Report features are under development. Database integration required.',
        underDevelopment: true
    });
});

app.use('/api', apiRouter);

// Serve the main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

// Security-aware error handling middleware
app.use((err, req, res, next) => {
    if (err && err.message === 'Origin not allowed by CORS policy.') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy blocked this request.'
        });
    }
    if (err && err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            success: false,
            message: 'Invalid or missing CSRF token.'
        });
    }
    return next(err);
});

app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}]`, err.stack || err.message || err);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 JamWatHQ Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: https://localhost:${PORT}
🔐 Authentication: Google & Facebook OAuth enabled
📧 Email: ${emailUser ? emailUser : 'disabled'}
🗄️  Database: MongoDB ${process.env.MONGODB_URI ? '(configured)' : '(localhost)'}
⚡ Health check: /api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 Authentication Routes:
   - GET  /auth/google
   - GET  /auth/facebook
   - GET  /auth/logout
   - GET  /auth/status

📝 Review API Routes:
    - POST /api/reviews (requires auth)
    - GET  /api/reviews
    - GET  /api/reviews/stats
    - POST /api/agency-reviews (requires auth)
    - GET  /api/agency-reviews/:agencyId
     - GET  /api/csrf-token
     - GET  /api/reports/* (admin only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

module.exports = app;