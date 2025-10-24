const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    authProvider: {
        type: String,
        enum: ['google', 'facebook'],
        required: true
    },
    providerId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'unknown'],
        default: 'unknown'
    },
    profilePicture: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index for provider and providerId
userSchema.index({ authProvider: 1, providerId: 1 }, { unique: true });

// Index for email lookups
userSchema.index({ email: 1 });

// Update last login on each authentication
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Static method to find or create user
userSchema.statics.findOrCreate = async function(profile, provider) {
    try {
        let user = await this.findOne({
            authProvider: provider,
            providerId: profile.id
        });

        if (user) {
            // Update last login
            await user.updateLastLogin();
            return user;
        }

        // Extract first name from different providers
        let firstName;
        if (provider === 'google') {
            firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        } else if (provider === 'facebook') {
            firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        }

        // Get email
        const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.com`;

        // Get profile picture
        let profilePicture = null;
        if (provider === 'google') {
            profilePicture = profile.photos?.[0]?.value || null;
        } else if (provider === 'facebook') {
            profilePicture = profile.photos?.[0]?.value || null;
        }

        // Extract gender from profile (if available)
        let gender = 'unknown';
        if (profile.gender) {
            const genderValue = profile.gender.toLowerCase();
            if (['male', 'female', 'other'].includes(genderValue)) {
                gender = genderValue;
            }
        }

        // Create new user with minimal data
        user = await this.create({
            authProvider: provider,
            providerId: profile.id,
            email: email,
            firstName: firstName,
            gender: gender,
            profilePicture: profilePicture
        });

        console.log(`✅ New user created: ${firstName} (${provider})`);
        return user;

    } catch (error) {
        console.error('Error in findOrCreate:', error);
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
