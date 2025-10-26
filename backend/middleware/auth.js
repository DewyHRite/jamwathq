// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    // If request is an API call, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in with Google or Facebook.',
            authenticated: false
        });
    }

    // Otherwise redirect to home page
    res.redirect('/?auth=required');
};

// Middleware to check auth status without requiring it
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.userInfo = {
            id: req.user._id,
            firstName: req.user.firstName,
            email: req.user.email,
            profilePicture: req.user.profilePicture,
            authProvider: req.user.authProvider
        };
    }
    next();
};

// Middleware to pass user info to views/responses
const attachUserInfo = (req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
};

const parseAdminEmails = () => {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(entry => entry.trim().toLowerCase())
        .filter(Boolean);
};

const requireAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: 'Administrator authentication required.'
        });
    }

    const adminEmails = parseAdminEmails();

    if (!adminEmails.length) {
        return res.status(500).json({
            success: false,
            message: 'Administrator access is not configured. Set ADMIN_EMAILS environment variable.'
        });
    }

    if (!adminEmails.includes((req.user.email || '').toLowerCase())) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to access this resource.'
        });
    }

    return next();
};

module.exports = {
    isAuthenticated,
    checkAuth,
    attachUserInfo,
    requireAdmin
};
