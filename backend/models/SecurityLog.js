const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'failed_login',
            'suspicious_activity',
            'rate_limit_violation',
            'cors_rejection',
            'invalid_token',
            'unauthorized_access',
            'account_lockout',
            'sql_injection_attempt',
            'xss_attempt',
            'brute_force_detected',
            'unusual_ip',
            'session_hijack_attempt'
        ]
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    message: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// Index for efficient querying
securityLogSchema.index({ type: 1, timestamp: -1 });
securityLogSchema.index({ severity: 1, timestamp: -1 });
securityLogSchema.index({ ip: 1, timestamp: -1 });
securityLogSchema.index({ resolved: 1, timestamp: -1 });
securityLogSchema.index({ timestamp: -1 });

// Static method to log security event
securityLogSchema.statics.log = function(data) {
    return this.create(data);
};

// Static method to get unresolved alerts
securityLogSchema.statics.getUnresolved = function(severity = null) {
    const query = { resolved: false };
    if (severity) {
        query.severity = severity;
    }
    return this.find(query)
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();
};

// Static method to get recent security events
securityLogSchema.statics.getRecent = function(limit = 100) {
    return this.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('resolvedBy', 'firstName lastName email')
        .lean();
};

// Static method to get events by IP
securityLogSchema.statics.getByIP = function(ip, limit = 50) {
    return this.find({ ip })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

// Static method to get critical alerts
securityLogSchema.statics.getCritical = function() {
    return this.find({ severity: 'critical', resolved: false })
        .sort({ timestamp: -1 })
        .lean();
};

// Static method to resolve alert
securityLogSchema.statics.resolve = function(id, adminId) {
    return this.findByIdAndUpdate(id, {
        resolved: true,
        resolvedBy: adminId,
        resolvedAt: new Date()
    }, { new: true });
};

// Static method to get statistics
securityLogSchema.statics.getStats = async function(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const stats = await this.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                criticalCount: {
                    $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
                },
                highCount: {
                    $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return stats;
};

module.exports = mongoose.model('SecurityLog', securityLogSchema);
