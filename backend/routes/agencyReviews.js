const express = require('express');
const router = express.Router();
const AgencyReview = require('../models/AgencyReview');
const { isAuthenticated } = require('../middleware/auth');

const parseRating = (value, fieldName, errors) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
        errors.push(`${fieldName} must be an integer between 1 and 5.`);
    }
    return parsed;
};

const sanitizeComments = (text = '') => text.trim().replace(/\s+/g, ' ');

// Submit a new agency review (Protected)
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const {
            agencyId,
            agencyName,
            applicationProcess,
            customerService,
            communication,
            supportServices,
            overallExperience,
            overallRating,
            comments,
            usageFrequency,
            tosAccepted
        } = req.body;

        const errors = [];

        if (!tosAccepted) {
            errors.push('Terms of Service must be accepted before submitting a review.');
        }

        if (!agencyId || typeof agencyId !== 'string') {
            errors.push('Agency identifier is required.');
        }

        if (!agencyName || typeof agencyName !== 'string') {
            errors.push('Agency name is required.');
        }

        const parsedRatings = {
            applicationProcess: parseRating(applicationProcess, 'Application process rating', errors),
            customerService: parseRating(customerService, 'Customer service rating', errors),
            communication: parseRating(communication, 'Communication rating', errors),
            supportServices: parseRating(supportServices, 'Support services rating', errors),
            overallExperience: parseRating(overallExperience, 'Overall experience rating', errors)
        };

        const parsedUsageFrequency = Number(usageFrequency);
        if (!Number.isInteger(parsedUsageFrequency) || parsedUsageFrequency < 1 || parsedUsageFrequency > 5) {
            errors.push('Usage frequency must be between 1 and 5.');
        }

        const cleanedComments = sanitizeComments(comments);
        if (!cleanedComments || cleanedComments.length < 20) {
            errors.push('Comments must be at least 20 characters.');
        }

        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review submission.',
                errors
            });
        }

        const compositeRating = Number(overallRating) || (
            (parsedRatings.applicationProcess +
                parsedRatings.customerService +
                parsedRatings.communication +
                parsedRatings.supportServices +
                parsedRatings.overallExperience) /
            5
        );

        const review = new AgencyReview({
            userId: req.user._id,
            userFirstName: req.user.firstName,
            agencyId: agencyId.trim().toLowerCase(),
            agencyName: agencyName.trim(),
            applicationProcess: parsedRatings.applicationProcess,
            customerService: parsedRatings.customerService,
            communication: parsedRatings.communication,
            supportServices: parsedRatings.supportServices,
            overallExperience: parsedRatings.overallExperience,
            overallRating: Number(compositeRating.toFixed(1)),
            usageFrequency: parsedUsageFrequency,
            comments: cleanedComments,
            tosAcceptedAt: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip
        });

        await review.save();

        console.log(`✅ Agency review submitted by ${req.user.firstName} for ${review.agencyName}`);

        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            review: {
                id: review._id,
                agencyId: review.agencyId,
                agencyName: review.agencyName,
                overallRating: review.overallRating,
                createdAt: review.createdAt
            }
        });
    } catch (error) {
        console.error('Error submitting agency review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit agency review. Please try again later.'
        });
    }
});

// Public: get approved reviews for an agency
router.get('/:agencyId', async (req, res) => {
    try {
        const agencyId = String(req.params.agencyId || '').trim().toLowerCase();
        if (!agencyId) {
            return res.status(400).json({
                success: false,
                message: 'Agency identifier is required.'
            });
        }

        const reviews = await AgencyReview.find({ agencyId })
            .populate('userId', 'profilePicture firstName')
            .select('userFirstName overallRating comments createdAt usageFrequency userId')
            .sort({ createdAt: -1 })
            .limit(50);

        // Transform to include profile picture from populated user
        const reviewsWithProfile = reviews.map(review => ({
            userFirstName: review.userFirstName,
            userProfilePicture: review.userId?.profilePicture || null,
            overallRating: review.overallRating,
            comments: review.comments,
            createdAt: review.createdAt,
            usageFrequency: review.usageFrequency
        }));

        return res.json({
            success: true,
            count: reviewsWithProfile.length,
            reviews: reviewsWithProfile
        });
    } catch (error) {
        console.error('Error fetching agency reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agency reviews.'
        });
    }
});

module.exports = router;
