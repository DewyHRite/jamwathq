/**
 * JamWatHQ Welcome Banner ("Hello Molly")
 * Displays greeting and cookie notice after ToS acceptance
 * Auto-fades or can be manually dismissed
 * CSP-compliant (no inline scripts)
 */

'use strict';

(function(window, document) {
    const BANNER_STORAGE_KEY = 'jamwathq_banner_dismissed';
    const BANNER_DISPLAY_DURATION = 8000; // 8 seconds before auto-fade
    const BANNER_FADE_DURATION = 500; // Fade animation duration

    // Check if banner has been dismissed
    function isBannerDismissed() {
        try {
            return localStorage.getItem(BANNER_STORAGE_KEY) === 'true';
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    // Record banner dismissal
    function dismissBanner() {
        try {
            localStorage.setItem(BANNER_STORAGE_KEY, 'true');
            localStorage.setItem(BANNER_STORAGE_KEY + '_timestamp', new Date().toISOString());
        } catch (e) {
            console.error('Failed to record banner dismissal:', e);
        }
    }

    // Get user's first name from auth if available
    function getUserName() {
        // Check if user is logged in (authManager from auth-client.js)
        if (window.authManager && typeof window.authManager.isAuthenticated === 'function') {
            try {
                if (window.authManager.isAuthenticated()) {
                    const user = window.authManager.getCurrentUser();
                    if (user && user.firstName) {
                        return user.firstName;
                    }
                }
            } catch (e) {
                // Silently fail if auth not available
            }
        }
        return 'Friend'; // Default greeting
    }

    // Create banner HTML
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'welcome-banner';
        banner.className = 'welcome-banner';
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'polite');

        const userName = getUserName();
        const greeting = getGreeting();

        banner.innerHTML = `
            <div class="welcome-banner-content">
                <div class="welcome-banner-icon">🇯🇲</div>
                <div class="welcome-banner-text">
                    <strong>${greeting}, ${userName}!</strong>
                    <span class="welcome-banner-message">
                        Welcome to JamWatHQ. We use cookies to keep you logged in and for security. 
                        <a href="policy.html#cookies" target="_blank">Learn more</a>
                    </span>
                </div>
                <button class="welcome-banner-close" aria-label="Dismiss welcome message">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(banner);
        return banner;
    }

    // Get appropriate greeting based on time of day
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }

    // Add banner styles
    function addStyles() {
        if (document.getElementById('welcome-banner-styles')) {
            return; // Already added
        }

        const style = document.createElement('style');
        style.id = 'welcome-banner-styles';
        style.textContent = `
            .welcome-banner {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                max-width: 600px;
                width: 90%;
                animation: welcomeBannerSlideDown 0.5s ease-out;
            }

            @keyframes welcomeBannerSlideDown {
                from {
                    transform: translateX(-50%) translateY(-100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }

            .welcome-banner.fading {
                animation: welcomeBannerFadeOut 0.5s ease-out forwards;
            }

            @keyframes welcomeBannerFadeOut {
                to {
                    transform: translateX(-50%) translateY(-20px);
                    opacity: 0;
                }
            }

            .welcome-banner-content {
                background: linear-gradient(135deg, #ffee00 0%, #fff700 100%);
                border: 3px solid #28a745;
                border-radius: 12px;
                padding: 1em 1.5em;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 1em;
            }

            .welcome-banner-icon {
                font-size: 2em;
                flex-shrink: 0;
                animation: welcomeBannerWave 1s ease-in-out infinite;
            }

            @keyframes welcomeBannerWave {
                0%, 100% {
                    transform: rotate(0deg);
                }
                25% {
                    transform: rotate(-10deg);
                }
                75% {
                    transform: rotate(10deg);
                }
            }

            .welcome-banner-text {
                flex: 1;
                color: #000;
                line-height: 1.5;
            }

            .welcome-banner-text strong {
                display: block;
                font-size: 0.95em;
                margin-bottom: 0.3em;
            }

            .welcome-banner-message {
                display: block;
                font-size: 0.85em;
                color: #333;
            }

            .welcome-banner-message a {
                color: #28a745;
                text-decoration: none;
                border-bottom: 1px dotted #28a745;
                font-weight: bold;
            }

            .welcome-banner-message a:hover {
                color: #000;
                border-bottom-color: #000;
            }

            .welcome-banner-close {
                background: transparent;
                border: none;
                color: #000;
                font-size: 1.2em;
                cursor: pointer;
                padding: 0.5em;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .welcome-banner-close:hover {
                background: rgba(0, 0, 0, 0.1);
                transform: scale(1.1) rotate(90deg);
            }

            .welcome-banner-close:focus {
                outline: 2px solid #28a745;
                outline-offset: 2px;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .welcome-banner {
                    top: 10px;
                    width: 95%;
                }

                .welcome-banner-content {
                    padding: 0.75em 1em;
                    gap: 0.75em;
                }

                .welcome-banner-icon {
                    font-size: 1.5em;
                }

                .welcome-banner-text strong {
                    font-size: 1em;
                }

                .welcome-banner-message {
                    font-size: 0.85em;
                }
            }

            /* Ensure banner is above other fixed elements but below modal */
            .welcome-banner {
                z-index: 9999;
            }

            #tos-modal {
                z-index: 10000;
            }
        `;

        document.head.appendChild(style);
    }

    // Remove banner from DOM
    function removeBanner(banner) {
        banner.classList.add('fading');
        setTimeout(() => {
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, BANNER_FADE_DURATION);
    }

    // Show welcome banner
    function showBanner() {
        // Don't show if already dismissed
        if (isBannerDismissed()) {
            return;
        }

        // Don't show if ToS not accepted yet
        if (window.JamWatHQ && window.JamWatHQ.tosModal) {
            if (!window.JamWatHQ.tosModal.hasAccepted()) {
                return;
            }
        }

        // Add styles
        addStyles();

        // Create and show banner
        const banner = createBanner();

        // Close button handler
        const closeBtn = banner.querySelector('.welcome-banner-close');
        closeBtn.addEventListener('click', function() {
            dismissBanner();
            removeBanner(banner);
        });

        // Auto-dismiss after duration
        const autoHideTimer = setTimeout(() => {
            if (banner && banner.parentNode) {
                dismissBanner();
                removeBanner(banner);
            }
        }, BANNER_DISPLAY_DURATION);

        // Clear timer if manually dismissed
        closeBtn.addEventListener('click', function() {
            clearTimeout(autoHideTimer);
        }, { once: true });

        // Keyboard accessibility (ESC to dismiss)
        const escapeHandler = function(e) {
            if (e.key === 'Escape' && banner && banner.parentNode) {
                dismissBanner();
                removeBanner(banner);
                document.removeEventListener('keydown', escapeHandler);
                clearTimeout(autoHideTimer);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // Reset banner (useful for testing)
    function resetBanner() {
        try {
            localStorage.removeItem(BANNER_STORAGE_KEY);
            localStorage.removeItem(BANNER_STORAGE_KEY + '_timestamp');
        } catch (e) {
            console.error('Failed to reset banner:', e);
        }
    }

    // Export to global namespace
    window.JamWatHQ = window.JamWatHQ || {};
    window.JamWatHQ.welcomeBanner = {
        show: showBanner,
        isDismissed: isBannerDismissed,
        reset: resetBanner
    };

    // Make showWelcomeBanner available directly (called by ToS modal)
    window.JamWatHQ.showWelcomeBanner = showBanner;

    // Auto-show banner when page loads (if conditions are met)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Delay banner appearance slightly to ensure ToS modal checks complete
            setTimeout(showBanner, 100);
        });
    } else {
        setTimeout(showBanner, 100);
    }

})(window, document);
