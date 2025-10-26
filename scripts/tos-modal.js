/**
 * JamWatHQ Terms of Service Modal
 * Displays ToS on first visit, tracks acceptance in localStorage
 * CSP-compliant (no inline scripts)
 */

'use strict';

(function(window, document) {
    const TOS_STORAGE_KEY = 'jamwathq_tos_accepted';
    const COOKIES_STORAGE_KEY = 'jamwathq_cookies_acknowledged';
    
    // Check if user has already accepted ToS
    function hasAcceptedToS() {
        try {
            const acceptance = localStorage.getItem(TOS_STORAGE_KEY);
            return acceptance === 'true';
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    // Record ToS acceptance
    function acceptToS() {
        try {
            localStorage.setItem(TOS_STORAGE_KEY, 'true');
            localStorage.setItem(COOKIES_STORAGE_KEY, 'true');
            localStorage.setItem(TOS_STORAGE_KEY + '_timestamp', new Date().toISOString());
            return true;
        } catch (e) {
            console.error('Failed to record ToS acceptance:', e);
            return false;
        }
    }

    // Create modal HTML
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'tos-modal';
        modal.className = 'tos-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'tos-modal-title');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
            <div class="tos-modal-overlay"></div>
            <div class="tos-modal-content">
                <div class="tos-modal-header">
                    <h2 id="tos-modal-title">Welcome to JamWatHQ! 🇯🇲</h2>
                </div>
                <div class="tos-modal-body">
                    <p><strong>Your #1 Jamaican J-1 Visa Info Hub</strong></p>
                    <p>Before you continue, please review our Terms of Service and Cookie Policy:</p>
                    
                    <div class="tos-summary">
                        <h3>📋 Quick Summary:</h3>
                        <ul>
                            <li><strong>🎓 Educational Project:</strong> We provide J-1 visa information for the Jamaican community</li>
                            <li><strong>🍪 Cookies:</strong> We use essential cookies for login and security</li>
                            <li><strong>🔒 Privacy:</strong> Your data is secure and never sold</li>
                            <li><strong>📢 Ads:</strong> We display native ads to cover hosting costs</li>
                            <li><strong>⚖️ Disclaimer:</strong> We're not a visa agency or legal advisor</li>
                        </ul>
                    </div>

                    <div class="tos-agreement">
                        <label class="tos-checkbox-label">
                            <input type="checkbox" id="tos-agree-checkbox" class="tos-checkbox">
                            <span>I have read and agree to the <a href="tos.html" target="_blank">Terms of Service</a> and <a href="tos.html#section-6" target="_blank">Cookie Policy</a></span>
                        </label>
                    </div>
                </div>
                <div class="tos-modal-footer">
                    <button id="tos-decline" class="tos-btn tos-btn-danger">
                        <i class="fas fa-times"></i> Decline
                    </button>
                    <button id="tos-learn-more" class="tos-btn tos-btn-secondary">
                        <i class="fas fa-book-open"></i> Learn More
                    </button>
                    <button id="tos-accept" class="tos-btn tos-btn-primary" disabled>
                        <i class="fas fa-check"></i> Accept & Continue
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Add modal styles
    function addStyles() {
        if (document.getElementById('tos-modal-styles')) {
            return; // Already added
        }

        const style = document.createElement('style');
        style.id = 'tos-modal-styles';
        style.textContent = `
            .tos-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: tosModalFadeIn 0.3s ease-out;
            }

            @keyframes tosModalFadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            .tos-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
            }

            .tos-modal-content {
                position: relative;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                animation: tosModalSlideUp 0.3s ease-out;
                border: 3px solid #ffee00;
            }

            @keyframes tosModalSlideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .tos-modal-header {
                padding: 1.5em;
                border-bottom: 2px solid #ffee00;
                background: linear-gradient(135deg, #ffee00 0%, #fff700 100%);
            }

            .tos-modal-header h2 {
                margin: 0;
                color: #000;
                font-size: 1.5em;
                font-weight: bold;
            }

            .tos-modal-body {
                padding: 1.5em;
                overflow-y: auto;
                flex: 1;
                color: #333;
            }

            .tos-modal-body p {
                margin: 0 0 1em 0;
                line-height: 1.6;
            }

            .tos-summary {
                background: #f9f9f9;
                border-left: 4px solid #28a745;
                padding: 1em;
                margin: 1em 0;
                border-radius: 4px;
            }

            .tos-summary h3 {
                margin-top: 0;
                color: #28a745;
                font-size: 1.1em;
            }

            .tos-summary ul {
                margin: 0.5em 0 0 0;
                padding-left: 1.5em;
            }

            .tos-summary li {
                margin: 0.5em 0;
                line-height: 1.6;
            }

            .tos-agreement {
                margin: 1.5em 0;
                padding: 1em;
                background: #fff9e6;
                border: 2px solid #ffee00;
                border-radius: 8px;
            }

            .tos-checkbox-label {
                display: flex;
                align-items: flex-start;
                cursor: pointer;
                user-select: none;
                position: relative;
            }

            /* Custom checkbox styling for better visibility */
            .tos-checkbox {
                position: relative;
                margin: 0.2em 0.5em 0 0;
                cursor: pointer;
                width: 24px;
                height: 24px;
                min-width: 24px; /* Prevent shrinking */
                min-height: 24px;
                flex-shrink: 0;
                appearance: none; /* Remove default styling */
                -webkit-appearance: none;
                -moz-appearance: none;
                background: #ffffff;
                border: 2.5px solid #28a745;
                border-radius: 4px;
                outline: none;
                transition: all 0.2s ease;
            }

            /* Hover state for checkbox */
            .tos-checkbox:hover {
                border-color: #218838;
                background: #f0fff4;
                transform: scale(1.05);
            }

            /* Focus state for accessibility */
            .tos-checkbox:focus {
                box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
                border-color: #28a745;
            }

            /* Checked state - adds visible checkmark */
            .tos-checkbox:checked {
                background: #28a745;
                border-color: #28a745;
            }

            /* Custom checkmark using CSS (visible when checked) */
            .tos-checkbox:checked::after {
                content: '';
                position: absolute;
                left: 7px;
                top: 3px;
                width: 6px;
                height: 11px;
                border: solid #ffffff;
                border-width: 0 3px 3px 0;
                transform: rotate(45deg);
                display: block;
            }

            /* Disabled state */
            .tos-checkbox:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .tos-checkbox-label span {
                line-height: 1.6;
            }

            .tos-checkbox-label a {
                color: #28a745;
                text-decoration: none;
                border-bottom: 1px dotted #28a745;
                font-weight: bold;
            }

            .tos-checkbox-label a:hover {
                color: #ffee00;
                border-bottom-color: #ffee00;
            }

            .tos-modal-footer {
                padding: 1em 1.5em;
                border-top: 1px solid #ddd;
                display: flex;
                gap: 1em;
                justify-content: flex-end;
                align-items: center;
                background: #f5f5f5;
            }

            /* Fallback for browsers without gap support */
            .tos-modal-footer > * + * {
                margin-left: 1em;
            }

            @supports (gap: 1em) {
                .tos-modal-footer > * + * {
                    margin-left: 0;
                }
            }

            /* Button base styles - responsive text handling */
            .tos-btn {
                padding: 0.75em 1.25em;
                border: none;
                border-radius: 6px;
                font-size: 0.95em; /* Slightly smaller to prevent overflow */
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.4em; /* Reduced gap for better fit */
                text-align: center;
                line-height: 1.2;
                min-width: 0; /* Allow buttons to shrink if needed */
                max-width: 100%; /* Prevent overflow from parent */
                box-sizing: border-box;
                /* Allow text to wrap on very small screens if needed */
                white-space: normal;
                word-break: break-word;
            }

            /* Icon sizing in buttons */
            .tos-btn i {
                flex-shrink: 0; /* Icons don't shrink */
                font-size: 1em;
            }

            .tos-btn:focus {
                outline: 2px solid #28a745;
                outline-offset: 2px;
            }

            .tos-btn-primary {
                background: #28a745;
                color: #fff;
            }

            .tos-btn-primary:not(:disabled):hover {
                background: #218838;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            }

            .tos-btn-primary:disabled {
                background: #ccc;
                color: #888;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .tos-btn-secondary {
                background: #ffee00; /* Yellow background */
                color: #000; /* Black text for contrast */
                border: 2px solid #ffee00;
            }

            .tos-btn-secondary:hover {
                background: #fff700; /* Brighter yellow on hover */
                border-color: #fff700;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 238, 0, 0.4);
            }

            .tos-btn-danger {
                background: #dc3545;
                color: #fff;
                border: 2px solid #dc3545;
            }

            .tos-btn-danger:hover {
                background: #c82333;
                border-color: #bd2130;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
            }

            /* Mobile responsive - Tablet and below */
            @media (max-width: 768px) {
                .tos-modal-content {
                    width: 95%;
                    max-height: 95vh;
                }

                .tos-modal-header,
                .tos-modal-body,
                .tos-modal-footer {
                    padding: 1em;
                }

                .tos-modal-header h2 {
                    font-size: 1.2em;
                }

                .tos-modal-footer {
                    flex-direction: column-reverse; /* Stack buttons vertically */
                    gap: 0.75em;
                }

                /* Full width buttons on mobile for better usability */
                .tos-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 0.875em 1em; /* Reduced horizontal padding */
                    font-size: 0.9em; /* Slightly smaller font */
                    text-align: center;
                    white-space: normal; /* Allow wrapping if needed */
                    min-height: 44px; /* Touch-friendly minimum size */
                }

                /* Ensure checkbox is larger on mobile for easier tapping */
                .tos-checkbox {
                    width: 26px;
                    height: 26px;
                    min-width: 26px;
                    min-height: 26px;
                    margin-right: 0.75em;
                }

                /* Adjust checkmark position for larger mobile checkbox */
                .tos-checkbox:checked::after {
                    left: 8px;
                    top: 3px;
                }

                .tos-summary {
                    padding: 0.75em;
                }

                .tos-summary ul {
                    padding-left: 1.2em;
                }

                .tos-agreement {
                    padding: 0.75em;
                }
            }

            /* Extra small devices - Enhanced button text handling */
            @media (max-width: 480px) {
                .tos-modal-content {
                    width: 98%;
                    max-height: 98vh;
                    border-radius: 8px;
                }

                .tos-modal-header,
                .tos-modal-body,
                .tos-modal-footer {
                    padding: 0.75em;
                }

                .tos-modal-header h2 {
                    font-size: 1.1em;
                }

                .tos-summary h3 {
                    font-size: 1em;
                }

                /* Optimized button sizing for small screens */
                .tos-btn {
                    padding: 0.75em 0.875em; /* Tighter padding */
                    font-size: 0.85em; /* Smaller font to prevent overflow */
                    min-height: 44px; /* Maintain touch target */
                    gap: 0.35em; /* Reduced gap between icon and text */
                }

                /* Slightly smaller icon on very small screens */
                .tos-btn i {
                    font-size: 0.9em;
                }

                /* Ensure checkbox label text doesn't overflow */
                .tos-checkbox-label {
                    font-size: 0.9em;
                }

                .tos-checkbox-label span {
                    line-height: 1.5;
                }
            }

            /* Prevent body scroll when modal is open */
            body.tos-modal-open {
                overflow: hidden;
            }
        `;

        document.head.appendChild(style);
    }

    // Close modal with animation
    function closeModal(modal) {
        modal.style.animation = 'tosModalFadeOut 0.3s ease-out';
        document.body.classList.remove('tos-modal-open');
        
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Initialize modal
    function initModal() {
        // Check if already accepted
        if (hasAcceptedToS()) {
            return;
        }

        // Add styles
        addStyles();

        // Create modal
        const modal = createModal();
        document.body.classList.add('tos-modal-open');

        // Get elements
        const checkbox = document.getElementById('tos-agree-checkbox');
        const acceptBtn = document.getElementById('tos-accept');
        const declineBtn = document.getElementById('tos-decline');
        const learnMoreBtn = document.getElementById('tos-learn-more');

        // Enable/disable accept button based on checkbox
        checkbox.addEventListener('change', function() {
            acceptBtn.disabled = !this.checked;
        });

        // Accept button handler
        acceptBtn.addEventListener('click', function() {
            if (acceptToS()) {
                closeModal(modal);

                // Show welcome banner after a short delay
                setTimeout(() => {
                    if (window.JamWatHQ && window.JamWatHQ.showWelcomeBanner) {
                        window.JamWatHQ.showWelcomeBanner();
                    }
                }, 500);
            }
        });

        // Decline button handler - redirect to Google
        declineBtn.addEventListener('click', function() {
            const confirmed = confirm(
                'If you decline the Terms of Service, you will not be able to use JamWatHQ. ' +
                'You will be redirected to Google.com.\n\n' +
                'Are you sure you want to decline?'
            );

            if (confirmed) {
                // Redirect to Google
                window.location.href = 'https://www.google.com';
            }
        });

        // Learn more button handler
        learnMoreBtn.addEventListener('click', function() {
            window.open('tos.html', '_blank');
        });

        // Prevent closing by clicking overlay (force users to make a choice)
        // If you want to allow closing, uncomment this:
        /*
        const overlay = modal.querySelector('.tos-modal-overlay');
        overlay.addEventListener('click', function() {
            if (confirm('You need to accept our Terms of Service to use this website. Continue without accepting?')) {
                closeModal(modal);
            }
        });
        */

        // Keyboard accessibility
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Uncomment to allow ESC key to close
                // closeModal(modal);
            }
        });

        // Focus first interactive element
        checkbox.focus();
    }

    // Export to global namespace
    window.JamWatHQ = window.JamWatHQ || {};
    window.JamWatHQ.tosModal = {
        init: initModal,
        hasAccepted: hasAcceptedToS,
        accept: acceptToS
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModal);
    } else {
        initModal();
    }

})(window, document);
