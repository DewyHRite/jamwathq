const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userFirstName: {
        type: String,
        required: true,
        trim: true
    },
    userGender: {
        type: String,
        enum: ['male', 'female', 'other', 'unknown'],
        default: 'unknown'
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    employer: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    wages: {
        type: Number,
        required: true,
        min: 0
    },
    hoursPerWeek: {
        type: Number,
        required: true,
        min: 1,
        max: 80
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    experience: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    timesUsed: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
        default: 1
    },
    tosAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    tosAcceptedAt: {
        type: Date,
        required: function() {
            return this.tosAccepted === true;
        }
    },
    isApproved: {
        type: Boolean,
        default: true  // Auto-approve by default; can be changed for moderation
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
reviewSchema.index({ state: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ state: 1, userId: 1 }); // For analytics queries
reviewSchema.index({ tosAccepted: 1 }); // For filtering accepted reviews

// Static method to get state statistics
reviewSchema.statics.getStateStats = async function(state) {
    try {
        const reviews = await this.find({ state, isApproved: true });

        if (reviews.length === 0) {
            return {
                state,
                reviewCount: 0,
                avgRating: 0,
                avgWage: 0
            };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const totalWage = reviews.reduce((sum, review) => sum + review.wages, 0);

        return {
            state,
            reviewCount: reviews.length,
            avgRating: (totalRating / reviews.length).toFixed(1),
            avgWage: (totalWage / reviews.length).toFixed(2)
        };
    } catch (error) {
        console.error('Error getting state stats:', error);
        throw error;
    }
};

// Static method to get all states statistics
reviewSchema.statics.getAllStatesStats = async function() {
    try {
        const stats = await this.aggregate([
            { $match: { isApproved: true } },
            {
                $group: {
                    _id: '$state',
                    reviewCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    avgWage: { $avg: '$wages' }
                }
            },
            { $sort: { avgRating: -1 } }
        ]);

        return stats.map(stat => ({
            state: stat._id,
            reviewCount: stat.reviewCount,
            avgRating: parseFloat(stat.avgRating.toFixed(1)),
            avgWage: parseFloat(stat.avgWage.toFixed(2))
        }));
    } catch (error) {
        console.error('Error getting all states stats:', error);
        throw error;
    }
};

// Static method to get state analytics (visitor count and average revisit)
reviewSchema.statics.getStateAnalytics = async function() {
    try {
        const analytics = await this.aggregate([
            // Only include approved reviews with TOS accepted
            { $match: { isApproved: true, tosAccepted: true } },
            {
                $group: {
                    _id: {
                        state: '$state',
                        userId: '$userId'
                    },
                    timesUsed: { $first: '$timesUsed' }, // Get the timesUsed value for this user-state combo
                    reviewCount: { $sum: 1 } // Count reviews per user-state
                }
            },
            {
                $group: {
                    _id: '$_id.state',
                    totalVisitors: { $sum: 1 }, // Count unique users (visitors) per state
                    avgRevisit: { $avg: '$timesUsed' } // Average of timesUsed across unique users
                }
            },
            { $sort: { totalVisitors: -1 } }
        ]);

        return analytics.map(stat => ({
            state: stat._id,
            totalVisitors: stat.totalVisitors,
            avgRevisit: parseFloat(stat.avgRevisit.toFixed(2))
        }));
    } catch (error) {
        console.error('Error getting state analytics:', error);
        throw error;
    }
};

// Instance method to check if user can edit this review
reviewSchema.methods.canEdit = function(userId) {
    return this.userId.toString() === userId.toString();
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
