const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { isAuthenticated } = require('../middleware/auth');

// Submit a new review (Protected - requires authentication)
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const {
            state,
            jobTitle,
            employer,
            city,
            wages,
            hoursPerWeek,
            rating,
            experience,
            timesUsed,
            tosAccepted
        } = req.body;

        // CRITICAL: Validate user is authenticated (double-check)
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in to submit a review.'
            });
        }

        // CRITICAL: Validate TOS acceptance
        if (!tosAccepted || tosAccepted !== true) {
            return res.status(400).json({
                success: false,
                message: 'You must accept the Terms of Service to submit a review.'
            });
        }

        // Validate required fields
        if (!state || !jobTitle || !wages || !hoursPerWeek || !rating || !experience || !timesUsed) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Validate timesUsed
        const timesUsedValue = parseInt(timesUsed);
        if (isNaN(timesUsedValue) || timesUsedValue < 1 || timesUsedValue > 10) {
            return res.status(400).json({
                success: false,
                message: 'Invalid usage frequency value'
            });
        }

        // Parse wages (remove $ and other non-numeric characters)
        const wageValue = parseFloat(wages.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(wageValue) || wageValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wage value'
            });
        }

        // Create new review
        const review = new Review({
            userId: req.user._id,
            userFirstName: req.user.firstName,
            userGender: req.user.gender || 'unknown',
            state,
            jobTitle,
            employer: employer || '',
            city: city || '',
            wages: wageValue,
            hoursPerWeek: parseInt(hoursPerWeek),
            rating: parseInt(rating),
            experience,
            timesUsed: timesUsedValue,
            tosAccepted: true,
            tosAcceptedAt: new Date(),
            isApproved: true  // Auto-approve (can be changed to false for moderation)
        });

        await review.save();

        console.log(`✅ New review submitted by ${req.user.firstName} for ${state} (TOS accepted)`);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            review: {
                id: review._id,
                state: review.state,
                rating: review.rating,
                createdAt: review.createdAt
            }
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review. Please try again.'
        });
    }
});

// Get all approved reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
            .select('userFirstName state jobTitle employer city wages hoursPerWeek rating experience createdAt')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});

// Get reviews for a specific state
router.get('/state/:state', async (req, res) => {
    try {
        const { state } = req.params;

        const reviews = await Review.find({
            state,
            isApproved: true
        })
            .select('userFirstName userGender jobTitle employer city wages hoursPerWeek rating experience timesUsed createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            state,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error('Error fetching state reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews for state'
        });
    }
});

// Get state statistics (for scoreboard)
router.get('/stats', async (req, res) => {
    try {
        const stats = await Review.getAllStatesStats();

        res.json({
            success: true,
            count: stats.length,
            stats
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Get state analytics (visitor count and average revisit)
router.get('/analytics', async (req, res) => {
    try {
        const analytics = await Review.getStateAnalytics();

        res.json({
            success: true,
            count: analytics.length,
            analytics
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });
    }
});

// Get current user's reviews (Protected)
router.get('/my-reviews', isAuthenticated, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your reviews'
        });
    }
});

// Delete a review (Protected - user can only delete their own)
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (!review.canEdit(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        await Review.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
});

module.exports = router;
