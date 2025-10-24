const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // User actions
            'user_view', 'user_update', 'user_delete', 'user_ban', 'user_unban',
            // Review actions
            'review_view', 'review_approve', 'review_reject', 'review_update', 'review_delete',
            // Agency actions
            'agency_create', 'agency_update', 'agency_delete', 'agency_verify',
            // Content actions
            'content_update', 'news_create', 'news_update', 'news_delete',
            // System actions
            'settings_update', 'backup_create', 'backup_restore', 'cache_clear',
            // Auth actions
            'admin_login', 'admin_logout', 'admin_create', 'admin_update', 'admin_delete'
        ]
    },
    targetType: {
        type: String,
        enum: ['user', 'review', 'agency', 'content', 'news', 'admin', 'settings', 'system'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
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
    }
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// Index for efficient querying
activityLogSchema.index({ adminId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ timestamp: -1 });

// Static method to log activity
activityLogSchema.statics.log = function(data) {
    return this.create(data);
};

// Static method to get admin's recent activity
activityLogSchema.statics.getAdminActivity = function(adminId, limit = 50) {
    return this.find({ adminId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('adminId', 'firstName lastName email')
        .lean();
};

// Static method to get activity by action type
activityLogSchema.statics.getByAction = function(action, limit = 100) {
    return this.find({ action })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('adminId', 'firstName lastName email')
        .lean();
};

// Static method to get recent activity
activityLogSchema.statics.getRecent = function(limit = 50) {
    return this.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('adminId', 'firstName lastName email')
        .lean();
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
