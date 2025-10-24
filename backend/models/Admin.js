const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'moderator', 'viewer'],
        default: 'viewer'
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastIP: {
        type: String,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
    return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockedUntil && this.lockedUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockedUntil: 1 }
        });
    }

    // Otherwise, increment
    const updates = { $inc: { loginAttempts: 1 } };

    // Lock the account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockedUntil: Date.now() + (2 * 60 * 60 * 1000) }; // 2 hours
    }

    return this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockedUntil: 1 }
    });
};

// Update last login
adminSchema.methods.updateLastLogin = function(ip) {
    return this.updateOne({
        $set: {
            lastLogin: Date.now(),
            lastIP: ip
        }
    });
};

// Get full name
adminSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting to JSON
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

// Remove password when converting to JSON
adminSchema.methods.toJSON = function() {
    const admin = this.toObject();
    delete admin.password;
    delete admin.twoFactorSecret;
    return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
