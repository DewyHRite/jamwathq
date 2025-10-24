const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
                scope: ['profile', 'email']  // Minimal scopes
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await User.findOrCreate(profile, 'google');
                    return done(null, user);
                } catch (error) {
                    console.error('Google OAuth error:', error);
                    return done(error, null);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy configured');
} else {
    console.log('⚠️  Google OAuth not configured (missing credentials in .env)');
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',
                profileFields: ['id', 'emails', 'name', 'picture.type(large)'],  // Minimal fields
                scope: ['email', 'public_profile']  // Minimal scopes
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await User.findOrCreate(profile, 'facebook');
                    return done(null, user);
                } catch (error) {
                    console.error('Facebook OAuth error:', error);
                    return done(error, null);
                }
            }
        )
    );
    console.log('✅ Facebook OAuth strategy configured');
} else {
    console.log('⚠️  Facebook OAuth not configured (missing credentials in .env)');
}

module.exports = passport;
