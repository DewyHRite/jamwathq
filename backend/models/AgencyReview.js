const mongoose = require('mongoose');

const ratingField = () => ({
    type: Number,
    required: true,
    min: 1,
    max: 5
});

const agencyReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userFirstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    agencyId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    agencyName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    applicationProcess: ratingField(),
    customerService: ratingField(),
    communication: ratingField(),
    supportServices: ratingField(),
    overallExperience: ratingField(),
    overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    usageFrequency: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        required: true,
        trim: true,
        minlength: 20,
        maxlength: 2000
    },
    tosAcceptedAt: {
        type: Date,
        required: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

agencyReviewSchema.index({ agencyId: 1, createdAt: -1 });
agencyReviewSchema.index({ userId: 1, agencyId: 1 });
agencyReviewSchema.index({ overallRating: -1 });

agencyReviewSchema.methods.canEdit = function(userId) {
    return this.userId.toString() === userId.toString();
};

const AgencyReview = mongoose.model('AgencyReview', agencyReviewSchema);

module.exports = AgencyReview;
