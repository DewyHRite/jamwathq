const express = require('express');
const router = express.Router();
const passport = require('passport');

// Get client URL from environment (fallback to localhost:8000 for development)
const CLIENT_URL = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0].trim() : 'http://localhost:8000';

// Google OAuth Routes
router.get('/google',
    (req, res, next) => {
        // Store the referring page in session to redirect back after auth
        const referer = req.get('Referrer') || req.get('Referer');
        if (referer) {
            // Extract the page from the referer URL
            const refererUrl = new URL(referer);
            req.session.returnTo = refererUrl.pathname + refererUrl.search;
        }
        next();
    },
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${CLIENT_URL}/?auth=failed`,
        failureMessage: true
    }),
    (req, res) => {
        // Successful authentication - redirect back to the page they came from
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo; // Clean up

        // Construct full URL for frontend
        const redirectUrl = `${CLIENT_URL}${returnTo}${returnTo.includes('?') ? '&' : '?'}auth=success`;
        res.redirect(redirectUrl);
    }
);

// Facebook OAuth Routes
router.get('/facebook',
    (req, res, next) => {
        // Store the referring page in session to redirect back after auth
        const referer = req.get('Referrer') || req.get('Referer');
        if (referer) {
            const refererUrl = new URL(referer);
            req.session.returnTo = refererUrl.pathname + refererUrl.search;
        }
        next();
    },
    passport.authenticate('facebook', {
        scope: ['email', 'public_profile']
    })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${CLIENT_URL}/?auth=failed`,
        failureMessage: true
    }),
    (req, res) => {
        // Successful authentication - redirect back to the page they came from
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;

        // Construct full URL for frontend
        const redirectUrl = `${CLIENT_URL}${returnTo}${returnTo.includes('?') ? '&' : '?'}auth=success`;
        res.redirect(redirectUrl);
    }
);

// Logout Route
router.get('/logout', (req, res) => {
    // Store the referring page before destroying session
    const referer = req.get('Referrer') || req.get('Referer');
    let returnTo = '/';
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            returnTo = refererUrl.pathname + refererUrl.search;
        } catch (e) {
            // Invalid referer URL, use default
        }
    }

    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            // Redirect back to the page they came from on frontend
            const redirectUrl = `${CLIENT_URL}${returnTo}${returnTo.includes('?') ? '&' : '?'}auth=loggedout`;
            res.redirect(redirectUrl);
        });
    });
});

// API endpoint to check authentication status
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true,
            user: {
                id: req.user._id,
                firstName: req.user.firstName,
                email: req.user.email,
                profilePicture: req.user.profilePicture,
                authProvider: req.user.authProvider
            }
        });
    } else {
        res.json({
            authenticated: false,
            user: null
        });
    }
});

// API endpoint to get current user details
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                firstName: req.user.firstName,
                email: req.user.email,
                profilePicture: req.user.profilePicture,
                authProvider: req.user.authProvider,
                createdAt: req.user.createdAt
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
});

module.exports = router;
