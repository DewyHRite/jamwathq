const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const SecurityLog = require('../models/SecurityLog');

// JWT Secret (should be in .env)
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET || 'change-this-in-production';

/**
 * Generate JWT token for admin
 */
exports.generateToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id,
            email: admin.email,
            role: admin.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * Verify JWT token and attach admin to request
 */
exports.verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get admin from database
        const admin = await Admin.findById(decoded.id).select('-password -twoFactorSecret');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - admin not found'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        // Attach admin to request
        req.admin = admin;
        next();

    } catch (error) {
        // Log invalid token attempt
        await SecurityLog.log({
            type: 'invalid_token',
            severity: 'medium',
            message: 'Invalid JWT token provided',
            details: { error: error.message },
            ip: req.ip,
            userAgent: req.get('user-agent')
        });

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Check if admin has required role
 */
exports.requireRole = (roles) => {
    // Ensure roles is an array
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    return async (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.admin.role)) {
            // Log unauthorized access attempt
            await ActivityLog.log({
                adminId: req.admin._id,
                action: 'unauthorized_access',
                targetType: 'system',
                details: {
                    requiredRole: roles,
                    actualRole: req.admin.role,
                    path: req.path
                },
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            await SecurityLog.log({
                type: 'unauthorized_access',
                severity: 'medium',
                message: `Admin attempted to access ${req.path} without sufficient permissions`,
                details: {
                    adminId: req.admin._id,
                    adminEmail: req.admin.email,
                    requiredRole: roles,
                    actualRole: req.admin.role
                },
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

/**
 * Super admin only middleware
 */
exports.requireSuperAdmin = exports.requireRole('super_admin');

/**
 * Super admin or moderator middleware
 */
exports.requireModerator = exports.requireRole(['super_admin', 'moderator']);

/**
 * Log admin activity
 */
exports.logActivity = (action, targetType) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to log activity after successful response
        res.send = function(data) {
            // Only log if response was successful (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                ActivityLog.log({
                    adminId: req.admin._id,
                    action: action,
                    targetType: targetType,
                    targetId: req.params.id || null,
                    details: {
                        method: req.method,
                        path: req.path,
                        query: req.query,
                        body: req.body
                    },
                    ip: req.ip,
                    userAgent: req.get('user-agent')
                }).catch(err => {
                    console.error('Failed to log activity:', err);
                });
            }

            // Call original send function
            originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Rate limiting for admin endpoints
 */
exports.adminRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    const requestCounts = new Map();

    return (req, res, next) => {
        const key = `${req.ip}-${req.admin ? req.admin._id : 'anonymous'}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or initialize request count for this key
        if (!requestCounts.has(key)) {
            requestCounts.set(key, []);
        }

        const requests = requestCounts.get(key);

        // Remove old requests outside the window
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);
        requestCounts.set(key, recentRequests);

        // Check if limit exceeded
        if (recentRequests.length >= maxRequests) {
            // Log rate limit violation
            SecurityLog.log({
                type: 'rate_limit_violation',
                severity: 'medium',
                message: 'Admin API rate limit exceeded',
                details: {
                    adminId: req.admin ? req.admin._id : null,
                    adminEmail: req.admin ? req.admin.email : null,
                    path: req.path,
                    requestCount: recentRequests.length
                },
                ip: req.ip,
                userAgent: req.get('user-agent')
            }).catch(err => {
                console.error('Failed to log security event:', err);
            });

            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        // Add current request timestamp
        recentRequests.push(now);

        next();
    };
};

/**
 * Session-based admin authentication middleware
 */
exports.requireSession = (req, res, next) => {
    if (!req.session || !req.session.adminId) {
        return res.status(401).json({
            success: false,
            message: 'Admin session required'
        });
    }

    Admin.findById(req.session.adminId)
        .select('-password -twoFactorSecret')
        .then(admin => {
            if (!admin) {
                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    message: 'Invalid session - admin not found'
                });
            }

            if (!admin.isActive) {
                req.session.destroy();
                return res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
            }

            req.admin = admin;
            next();
        })
        .catch(err => {
            console.error('Session authentication error:', err);
            return res.status(500).json({
                success: false,
                message: 'Session authentication failed'
            });
        });
};

module.exports = exports;
