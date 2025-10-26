// Authentication Client-Side Handler
// API Configuration - Backend server URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin; // Use same origin in production

class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.csrfToken = null;
        this.csrfFetchedAt = 0;
        this.apiBaseUrl = API_BASE_URL;
    }

    async ensureCsrfToken(force = false) {
        const TEN_MINUTES = 10 * 60 * 1000;
        const now = Date.now();

        if (!force && this.csrfToken && now - this.csrfFetchedAt < TEN_MINUTES) {
            return this.csrfToken;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/csrf-token`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (!response.ok || !data.csrfToken) {
                throw new Error(data.message || 'Failed to fetch CSRF token');
            }

            this.csrfToken = data.csrfToken;
            this.csrfFetchedAt = now;
            return this.csrfToken;
        } catch (error) {
            console.error('Error retrieving CSRF token:', error);
            throw error;
        }
    }

    // Check authentication status on page load
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/status`, {
                credentials: 'include'
            });
            const data = await response.json();

            const previousAuthState = this.isAuthenticated;
            this.isAuthenticated = data.authenticated;
            this.user = data.user;

            // Dispatch event if auth state changed
            if (previousAuthState !== this.isAuthenticated) {
                this.dispatchAuthStateChange(data);
            }

            return data;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return { authenticated: false, user: null };
        }
    }

    // Dispatch custom event when auth state changes
    dispatchAuthStateChange(authData) {
        const event = new CustomEvent('authStateChanged', {
            detail: {
                isAuthenticated: authData.authenticated,
                user: authData.user
            }
        });
        window.dispatchEvent(event);
    }

    // Initialize authentication UI
    async init() {
        const status = await this.checkAuthStatus();

        // Check for auth-related URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const authParam = urlParams.get('auth');

        if (authParam === 'success') {
            this.showNotification('Successfully logged in!', 'success');
            // Remove the parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Dispatch event to update profile hub
            this.dispatchAuthStateChange(status);
        } else if (authParam === 'failed') {
            this.showNotification('Authentication failed. Please try again.', 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (authParam === 'loggedout') {
            this.showNotification('You have been logged out.', 'info');
            window.history.replaceState({}, document.title, window.location.pathname);
            // Dispatch event to update profile hub
            this.dispatchAuthStateChange({ authenticated: false, user: null });
        }

        this.updateUI(status);
        return status;
    }

    // Update UI based on authentication status
    updateUI(status) {
        const authGate = document.getElementById('auth-gate');
        const userProfile = document.getElementById('user-profile');
        const stateSelection = document.getElementById('state-selection');

        // Check if we're on the share-experience page
        const isShareExperiencePage = window.location.pathname.includes('share-experience');

        if (status.authenticated && status.user) {
            // User is logged in
            if (authGate) authGate.style.display = 'none';
            if (stateSelection) stateSelection.style.display = 'block';

            if (userProfile) {
                userProfile.style.display = 'flex';
                const userName = document.getElementById('user-name');
                const userAvatar = document.getElementById('user-avatar');

                if (userName) {
                    userName.textContent = `Welcome, ${status.user.firstName}!`;
                }

                if (userAvatar && status.user.profilePicture) {
                    userAvatar.src = status.user.profilePicture;
                    userAvatar.alt = status.user.firstName;
                }
            }
        } else {
            // User is not logged in
            if (authGate) authGate.style.display = 'block';
            // IMPORTANT: On share-experience page, state selector should always be visible
            // Users need to select a state before being prompted to log in
            if (stateSelection) {
                if (isShareExperiencePage) {
                    stateSelection.style.display = 'block';
                } else {
                    stateSelection.style.display = 'none';
                }
            }
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    // Login with Google
    loginWithGoogle() {
        window.location.href = `${this.apiBaseUrl}/auth/google`;
    }

    // Login with Facebook
    loginWithFacebook() {
        window.location.href = `${this.apiBaseUrl}/auth/facebook`;
    }

    // Logout
    logout() {
        if (confirm('Are you sure you want to log out?')) {
            window.location.href = `${this.apiBaseUrl}/auth/logout`;
        }
    }

    // Submit review (with authentication)
    async submitReview(reviewData) {
        try {
            if (!reviewData || reviewData.tosAccepted !== true) {
                throw new Error('Terms of Service acceptance is required before submitting a review.');
            }

            if (typeof reviewData.usageFrequency === 'undefined') {
                throw new Error('Usage frequency is required.');
            }

            const csrfToken = await this.ensureCsrfToken();

            const response = await fetch(`${this.apiBaseUrl}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification('Please log in to submit a review', 'error');
                    return null;
                }
                if (response.status === 403 && data.message && data.message.toLowerCase().includes('csrf')) {
                    const refreshedToken = await this.ensureCsrfToken(true);
                    return this.submitReviewWithToken(reviewData, refreshedToken);
                }
                throw new Error(data.message || 'Failed to submit review');
            }

            return data;
        } catch (error) {
            console.error('Error submitting review:', error);
            this.showNotification(error.message, 'error');
            return null;
        }
    }

    async submitReviewWithToken(reviewData, csrfToken) {
        try {
            if (!reviewData || reviewData.tosAccepted !== true) {
                throw new Error('Terms of Service acceptance is required before submitting a review.');
            }

            if (typeof reviewData.usageFrequency === 'undefined') {
                throw new Error('Usage frequency is required.');
            }

            const response = await fetch(`${this.apiBaseUrl}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit review');
            }

            return data;
        } catch (error) {
            console.error('Error submitting review after refreshing CSRF token:', error);
            this.showNotification(error.message, 'error');
            return null;
        }
    }

    async submitAgencyReview(reviewData) {
        try {
            if (!reviewData || reviewData.tosAccepted !== true) {
                throw new Error('Terms of Service acceptance is required before submitting a review.');
            }

            if (typeof reviewData.usageFrequency === 'undefined') {
                throw new Error('Usage frequency is required.');
            }

            const csrfToken = await this.ensureCsrfToken();

            const response = await fetch(`${this.apiBaseUrl}/api/agency-reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification('Please log in to submit a review', 'error');
                    return null;
                }

                if (response.status === 403 && data.message && data.message.toLowerCase().includes('csrf')) {
                    const refreshedToken = await this.ensureCsrfToken(true);
                    return this.submitAgencyReviewWithToken(reviewData, refreshedToken);
                }

                // Log detailed error information
                console.error('❌ Backend validation errors:', data);
                if (data.errors && Array.isArray(data.errors)) {
                    console.error('Specific errors:', data.errors.join(', '));
                }

                const errorMsg = data.errors ? data.errors.join(', ') : (data.message || 'Failed to submit agency review');
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error('Error submitting agency review:', error);
            this.showNotification(error.message, 'error');
            return null;
        }
    }

    async submitAgencyReviewWithToken(reviewData, csrfToken) {
        try {
            if (!reviewData || reviewData.tosAccepted !== true) {
                throw new Error('Terms of Service acceptance is required before submitting a review.');
            }

            if (typeof reviewData.usageFrequency === 'undefined') {
                throw new Error('Usage frequency is required.');
            }

            const response = await fetch(`${this.apiBaseUrl}/api/agency-reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error((data && data.message) || 'Failed to submit agency review');
            }

            return data;
        } catch (error) {
            console.error('Error submitting agency review after refreshing CSRF token:', error);
            this.showNotification(error.message, 'error');
            return null;
        }
    }

    // Fetch reviews statistics
    async fetchReviewStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/reviews/stats`);
            const data = await response.json();

            if (data.success) {
                return data.stats;
            }
            return [];
        } catch (error) {
            console.error('Error fetching review stats:', error);
            return [];
        }
    }

    // Fetch all reviews
    async fetchReviews() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/reviews`);
            const data = await response.json();

            if (data.success) {
                return data.reviews;
            }
            return [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    // Show notification to user
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffee00'};
            color: ${type === 'info' ? '#000' : '#fff'};
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    // Get current user info
    getUser() {
        return this.user;
    }

    // Check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create global auth manager instance
const authManager = new AuthManager();
window.authManager = authManager;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authManager;
}
