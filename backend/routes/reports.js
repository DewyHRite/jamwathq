const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Review = require('../models/Review');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/securityLogger');
const { logUserReport, logTrafficReport, logAdReport } = require('../utils/reportLogger');

const calculatePercentChange = (current, previous) => {
    if (previous === null || previous === undefined) {
        return null;
    }
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return Number.isFinite(change) ? Number(change.toFixed(2)) : null;
};

const formatPercentChange = (value) => {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
};

const getActiveSessionCount = async (sessionStore) => {
    if (!sessionStore || typeof sessionStore.length !== 'function') {
        return null;
    }

    return new Promise((resolve) => {
        sessionStore.length((error, length) => {
            if (error) {
                console.error('Failed to read active session count:', error.message);
                return resolve(null);
            }
            return resolve(length);
        });
    });
};

router.use(requireAdmin);

router.get('/users', async (req, res) => {
    const generatedAt = new Date();

    try {
        const totalUsers = await User.countDocuments();

        const lastSevenDays = new Date(generatedAt);
        lastSevenDays.setDate(generatedAt.getDate() - 7);

        const previousWindowStart = new Date(generatedAt);
        previousWindowStart.setDate(generatedAt.getDate() - 14);

        const newSignups = await User.countDocuments({ createdAt: { $gte: lastSevenDays } });
        const previousSignups = await User.countDocuments({
            createdAt: {
                $gte: previousWindowStart,
                $lt: lastSevenDays
            }
        });

        const thirtyDaysAgo = new Date(generatedAt);
        thirtyDaysAgo.setDate(generatedAt.getDate() - 30);

        const sixtyDaysAgo = new Date(generatedAt);
        sixtyDaysAgo.setDate(generatedAt.getDate() - 60);

        const activeLast30 = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
        const activePrevious30 = await User.countDocuments({
            lastLogin: {
                $gte: sixtyDaysAgo,
                $lt: thirtyDaysAgo
            }
        });

        const currentRetentionRate = totalUsers ? (activeLast30 / totalUsers) * 100 : 0;
        const previousRetentionRate = totalUsers ? (activePrevious30 / totalUsers) * 100 : 0;
        const retentionChange = calculatePercentChange(currentRetentionRate, previousRetentionRate);

        const activeSessions = await getActiveSessionCount(req.app.locals.sessionStore);

        const responsePayload = {
            success: true,
            generatedAt: generatedAt.toISOString(),
            metrics: {
                totalUsers,
                newSignups: {
                    currentPeriod: newSignups,
                    previousPeriod: previousSignups,
                    changePercent: calculatePercentChange(newSignups, previousSignups)
                },
                activeSessions: {
                    current: activeSessions,
                    note: activeSessions === null ? 'Session store does not expose length() metric.' : 'Total active sessions across the cluster.'
                },
                retentionRate: {
                    currentPeriod: Number(currentRetentionRate.toFixed(2)),
                    previousPeriod: Number(previousRetentionRate.toFixed(2)),
                    changePercent: retentionChange
                }
            },
            recommendations: [
                'Review onboarding funnel if new signups drop more than 10% week-over-week.',
                'Monitor cohort retention to ensure returning user percentage stays above 40%.',
                'Audit session expiration cadence to prevent session fixation.'
            ]
        };

        const actor = (req.user && req.user.email) ? req.user.email : 'unknown-user';

        await Promise.all([
            logSecurityEvent({
                description: `${actor} accessed /api/reports/users`,
                severity: 'Info'
            }),
            logUserReport([
                {
                    date: responsePayload.generatedAt,
                    metric: 'Total registered users',
                    value: totalUsers,
                    change: 'N/A',
                    notes: 'Aggregate across Google and Facebook providers.'
                },
                {
                    date: responsePayload.generatedAt,
                    metric: 'New signups (7 days)',
                    value: newSignups,
                    change: formatPercentChange(responsePayload.metrics.newSignups.changePercent ?? null),
                    notes: 'Week-over-week comparison calculated against prior 7-day window.'
                },
                {
                    date: responsePayload.generatedAt,
                    metric: 'Active sessions',
                    value: activeSessions ?? 'Data unavailable',
                    change: 'N/A',
                    notes: responsePayload.metrics.activeSessions.note
                },
                {
                    date: responsePayload.generatedAt,
                    metric: '30-day retention rate',
                    value: `${Number(currentRetentionRate.toFixed(2))}%`,
                    change: formatPercentChange(retentionChange),
                    notes: 'Retention derived from lastLogin timestamps.'
                }
            ])
        ]);

        return res.json(responsePayload);
    } catch (error) {
        console.error('Failed to generate user analytics report:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to generate user analytics report.'
        });
    }
});

router.get('/traffic', async (req, res) => {
    const generatedAt = new Date();

    try {
        const responsePayload = {
            success: true,
            generatedAt: generatedAt.toISOString(),
            metrics: {
                visits: {
                    currentPeriod: null,
                    previousPeriod: null,
                    changePercent: null,
                    note: 'Integrate with analytics provider (e.g., Plausible, GA4) to populate visit metrics.'
                },
                uniqueVisitors: {
                    currentPeriod: null,
                    previousPeriod: null,
                    changePercent: null,
                    note: 'Awaiting analytics data ingestion pipeline.'
                },
                averageSessionDuration: {
                    currentPeriod: null,
                    previousPeriod: null,
                    changePercent: null,
                    note: 'Pending instrumentation.'
                },
                bounceRate: {
                    currentPeriod: null,
                    previousPeriod: null,
                    changePercent: null,
                    note: 'Pending instrumentation.'
                },
                topTrafficSources: []
            },
            recommendations: [
                'Deploy client-side analytics SDK with server-side event validation.',
                'Schedule nightly ETL job to snapshot week-over-week traffic deltas.',
                'Configure alerting when bounce rate exceeds 55%.'
            ]
        };

        const actor = (req.user && req.user.email) ? req.user.email : 'unknown-user';

        await Promise.all([
            logSecurityEvent({
                description: `${actor} accessed /api/reports/traffic`,
                severity: 'Info'
            }),
            logTrafficReport([
                {
                    date: responsePayload.generatedAt,
                    metric: 'Traffic data status',
                    value: 'Pending integration',
                    change: 'N/A',
                    notes: 'Awaiting analytics provider connection.'
                }
            ])
        ]);

        return res.json(responsePayload);
    } catch (error) {
        console.error('Failed to generate traffic analytics report:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to generate traffic analytics report.'
        });
    }
});

router.get('/ads', async (req, res) => {
    const generatedAt = new Date();

    try {
        const sevenDaysAgo = new Date(generatedAt);
        sevenDaysAgo.setDate(generatedAt.getDate() - 7);

        const currentApprovedReviews = await Review.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            isApproved: true
        });

        const previousApprovedReviews = await Review.countDocuments({
            createdAt: {
                $lt: sevenDaysAgo,
                $gte: new Date(generatedAt.getTime() - 14 * 24 * 60 * 60 * 1000)
            },
            isApproved: true
        });

        const mockImpressions = currentApprovedReviews * 25;
        const mockClicks = currentApprovedReviews * 4;
        const previousMockImpressions = previousApprovedReviews * 25;
        const previousMockClicks = previousApprovedReviews * 4;

        const ctr = mockImpressions ? (mockClicks / mockImpressions) * 100 : 0;
        const previousCtr = previousMockImpressions ? (previousMockClicks / previousMockImpressions) * 100 : 0;

        const responsePayload = {
            success: true,
            generatedAt: generatedAt.toISOString(),
            metrics: {
                impressions: {
                    currentPeriod: mockImpressions,
                    previousPeriod: previousMockImpressions,
                    changePercent: calculatePercentChange(mockImpressions, previousMockImpressions),
                    note: 'Proxy metric using approved review volume until ad provider integration is complete.'
                },
                clicks: {
                    currentPeriod: mockClicks,
                    previousPeriod: previousMockClicks,
                    changePercent: calculatePercentChange(mockClicks, previousMockClicks),
                    note: 'Proxy metric derived from review submissions (assumes 16% click-through).' 
                },
                clickThroughRate: {
                    currentPeriod: Number(ctr.toFixed(2)),
                    previousPeriod: Number(previousCtr.toFixed(2)),
                    changePercent: calculatePercentChange(ctr, previousCtr)
                },
                estimatedRevenue: {
                    currentPeriod: Number((mockClicks * 0.85).toFixed(2)),
                    previousPeriod: Number((previousMockClicks * 0.85).toFixed(2)),
                    changePercent: calculatePercentChange(mockClicks * 0.85, previousMockClicks * 0.85),
                    note: 'Estimated using placeholder CPC of $0.85.'
                }
            },
            recommendations: [
                'Integrate native-ads.js tracking pixels to replace proxy metrics with real impressions/clicks.',
                'Validate ad performance weekly; flag CTR variance greater than 20%.',
                'Ensure Sponsored labels remain visible to comply with FTC guidelines.'
            ]
        };

        const actor = (req.user && req.user.email) ? req.user.email : 'unknown-user';

        await Promise.all([
            logSecurityEvent({
                description: `${actor} accessed /api/reports/ads`,
                severity: 'Info'
            }),
            logAdReport([
                {
                    date: responsePayload.generatedAt,
                    metric: 'Ad metrics (proxy)',
                    value: `Impressions: ${mockImpressions}, Clicks: ${mockClicks}, CTR: ${responsePayload.metrics.clickThroughRate.currentPeriod}%`,
                    change: formatPercentChange(responsePayload.metrics.impressions.changePercent ?? null),
                    notes: 'Proxy values until ad tracking is wired into analytics pipeline.'
                }
            ])
        ]);

        return res.json(responsePayload);
    } catch (error) {
        console.error('Failed to generate advertising analytics report:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to generate advertising analytics report.'
        });
    }
});

module.exports = router;
