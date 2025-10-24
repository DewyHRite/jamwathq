'use strict';

(function (window, document) {
    const usStates = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
        'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
        'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
        'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
        'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
        'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];

    let selectedState = null;
    let selectedRating = 0;
    const stateReviews = {};

    const authManager = window.authManager;

    if (!authManager) {
        console.warn('Auth manager not available; share experience page will operate in read-only mode.');
    }

    /**
     * Shows "Under Development" popup for database-dependent features
     * @param {string} featureName - Name of the feature being accessed
     */
    function showUnderDevelopmentPopup(featureName) {
        // Check if modal already exists
        let modal = document.getElementById('under-dev-modal');

        if (!modal) {
            // Create modal HTML
            modal = document.createElement('div');
            modal.id = 'under-dev-modal';
            modal.className = 'modal';
            modal.style.cssText = 'display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); justify-content: center; align-items: center;';

            modal.innerHTML = `
                <div class="modal-content" style="background-color: #1a1a1a; margin: 0; padding: 30px; border: 3px solid #ffee00; width: 90%; max-width: 500px; border-radius: 10px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 10px 40px rgba(255, 238, 0, 0.4); z-index: 10001;">
                    <span class="close-modal" style="color: #ffee00; float: right; font-size: 32px; font-weight: bold; cursor: pointer; line-height: 20px;" title="Close">&times;</span>
                    <h2 style="color: #ffee00; margin-top: 0; margin-bottom: 0.5em; font-size: 1.8em;">
                        <i class="fas fa-tools"></i> Feature Under Development
                    </h2>
                    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 1em; font-size: 1.1em;">
                        <strong>"${featureName}"</strong> is currently under development and requires database integration.
                    </p>
                    <p style="color: #ffffff; line-height: 1.6; margin-bottom: 1em;">
                        To help us complete this feature and bring it to you, we need to generate revenue through advertisements.
                        Your support by viewing ads on our site helps fund the development of features like:
                    </p>
                    <ul style="color: #ffffff; line-height: 1.8; margin-bottom: 1em; padding-left: 20px;">
                        <li>Agency reviews and ratings</li>
                        <li>User experiences by state</li>
                        <li>Community feedback system</li>
                        <li>Database storage and management</li>
                    </ul>
                    <p style="color: #ffee00; line-height: 1.6; margin-bottom: 1.5em; font-weight: bold;">
                        <i class="fas fa-heart"></i> Thank you for your patience and support!
                    </p>
                    <button class="btn-close-dev-modal" style="background: #28a745; color: #fff; border: none; padding: 12px 30px; font-size: 1.1em; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; transition: all 0.3s ease;">
                        Got It!
                    </button>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            const closeBtn = modal.querySelector('.close-modal');
            const gotItBtn = modal.querySelector('.btn-close-dev-modal');

            const closeModal = () => {
                modal.style.display = 'none';
            };

            closeBtn.addEventListener('click', closeModal);
            gotItBtn.addEventListener('click', closeModal);

            // Close on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Add hover effect to button
            gotItBtn.addEventListener('mouseenter', function() {
                this.style.background = '#23963d';
                this.style.transform = 'scale(1.05)';
            });
            gotItBtn.addEventListener('mouseleave', function() {
                this.style.background = '#28a745';
                this.style.transform = 'scale(1)';
            });
        }

        // Show the modal
        modal.style.display = 'flex';
    }

    const initializeStateData = () => {
        usStates.forEach((state) => {
            stateReviews[state] = {
                reviewCount: 0,
                avgRating: 0,
                avgWage: 0
            };
        });
    };

    const openModal = (stateName) => {
        selectedState = stateName;
        const modal = document.getElementById('reviewModal');
        const modalTitle = document.getElementById('modalTitle');

        if (modal && modalTitle) {
            modalTitle.textContent = `Share Your Experience in ${stateName}`;
            modal.classList.add('show');
        }

        document.querySelectorAll('.state-button').forEach((button) => {
            button.classList.toggle('selected', button.dataset.state === stateName);
        });
    };

    const closeModal = () => {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.classList.remove('show');
        }
        resetForm();
    };

    const setRating = (rating) => {
        selectedRating = rating;
        const ratingInput = document.getElementById('rating');
        if (ratingInput) {
            ratingInput.value = rating;
        }

        document.querySelectorAll('.star-rating i').forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    };

    const resetForm = () => {
        const form = document.getElementById('experienceForm');
        if (form) {
            form.reset();
        }
        selectedRating = 0;
        document.querySelectorAll('.star-rating i').forEach((star) => {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        });
        document.querySelectorAll('.state-button').forEach((button) => {
            button.classList.remove('selected');
        });
    };

    const updateStateReview = (state, rating, wage) => {
        const data = stateReviews[state];
        if (!data) {
            return;
        }

        const totalRating = (Number(data.avgRating) * data.reviewCount) + rating;
        const totalWage = (Number(data.avgWage) * data.reviewCount) + wage;

        data.reviewCount += 1;
        data.avgRating = totalRating / data.reviewCount;
        data.avgWage = totalWage / data.reviewCount;

        renderScoreboard();
    };

    const renderScoreboard = () => {
        const container = document.getElementById('scoreboard-container');
        if (!container) {
            return;
        }

        const sortedStates = Object.entries(stateReviews)
            .sort((a, b) => Number(b[1].avgRating) - Number(a[1].avgRating))
            .slice(0, 25);

        const entries = sortedStates.map(([state, data], index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const numericRating = Number(data.avgRating) || 0;
            const avgWage = Number(data.avgWage) || 0;
            const fullStars = Math.floor(numericRating);
            const hasHalfStar = numericRating % 1 >= 0.5;
            let starsHTML = '';

            for (let i = 0; i < fullStars; i += 1) {
                starsHTML += '<i class="fas fa-star"></i>';
            }
            if (hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            }
            for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i += 1) {
                starsHTML += '<i class="far fa-star"></i>';
            }

            return `
                <div class="scoreboard-item">
                    <div class="scoreboard-rank ${isTop3 ? 'top3' : ''}">#${rank}</div>
                    <div class="scoreboard-state">${state}</div>
                    <div class="scoreboard-stats">
                        <div class="scoreboard-rating">
                            <span class="scoreboard-stars">${starsHTML}</span>
                            <span>${numericRating.toFixed(1)}</span>
                        </div>
                        <div class="scoreboard-reviews">${data.reviewCount} reviews</div>
                    </div>
                    <div class="scoreboard-avg-wage">Avg. Wage: $${avgWage.toFixed(2)}/hr</div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="scoreboard-list">
                ${entries.join('')}
            </div>
        `;
    };

    const loadStatsFromServer = async () => {
        if (!authManager || typeof authManager.fetchReviewStats !== 'function') {
            renderScoreboard();
            return;
        }

        try {
            const stats = await authManager.fetchReviewStats();
            usStates.forEach((state) => {
                const serverData = stats.find((entry) => entry.state === state);
                if (serverData) {
                    stateReviews[state] = {
                        reviewCount: serverData.reviewCount,
                        avgRating: Number(serverData.avgRating) || 0,
                        avgWage: Number(serverData.avgWage) || 0
                    };
                }
            });
            renderScoreboard();
        } catch (error) {
            console.error('Error loading stats from server:', error);
            renderScoreboard();
        }
    };

    const initializeMap = () => {
        const grid = document.getElementById('states-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '';
        usStates.forEach((stateName) => {
            const button = document.createElement('div');
            button.className = 'state-button';
            button.textContent = stateName;
            button.dataset.state = stateName;
            button.addEventListener('click', () => openModal(stateName));
            grid.appendChild(button);
        });
    };

    const submitExperience = async (event) => {
        event.preventDefault();

        // SHOW UNDER DEVELOPMENT POPUP - Feature requires ad funding
        showUnderDevelopmentPopup('Share Your Experience');
        return;

        /* ORIGINAL CODE - DISABLED FOR LIVE RELEASE
        if (!selectedState) {
            alert('Please choose a state before submitting.');
            return;
        }

        if (selectedRating === 0) {
            alert('Please select a rating before submitting.');
            return;
        }

        const wagesInput = document.getElementById('wages');
        const wageText = wagesInput ? wagesInput.value : '';
        const wageValue = parseFloat(String(wageText).replace(/[^0-9.]/g, '')) || 0;

        // Get usage frequency
        const usageFrequencyInput = document.getElementById('usageFrequency');
        const usageFrequency = usageFrequencyInput ? parseInt(usageFrequencyInput.value) : 0;

        // Validate usage frequency
        if (!usageFrequency || usageFrequency < 1 || usageFrequency > 10) {
            alert('Please select how many times you have used JamWatHQ.');
            return;
        }

        const payload = {
            state: selectedState,
            jobTitle: document.getElementById('jobTitle')?.value || '',
            employer: document.getElementById('employer')?.value || '',
            city: document.getElementById('city')?.value || '',
            wages: wageText,
            hoursPerWeek: document.getElementById('hoursPerWeek')?.value || '',
            rating: selectedRating,
            experience: document.getElementById('experience')?.value || '',
            timesUsed: usageFrequency,
            usageFrequency: usageFrequency,
            tosAccepted: true
        };

        if (!authManager || typeof authManager.submitReview !== 'function') {
            alert('Authentication service unavailable. Please try again later.');
            return;
        }

        const result = await authManager.submitReview(payload);
        if (result && result.success) {
            updateStateReview(selectedState, selectedRating, wageValue);
            alert(`Thank you for sharing your experience in ${selectedState}! Your review has been submitted successfully.`);
            closeModal();
            await loadStatsFromServer();
        } else {
            alert('Failed to submit review. Please make sure you are logged in and try again.');
        }
        */
    };

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('reviewModal');
        if (modal && event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('DOMContentLoaded', async () => {
        if (authManager && typeof authManager.init === 'function') {
            await authManager.init();
        }

        initializeStateData();
        initializeMap();
        await loadStatsFromServer();

        const form = document.getElementById('experienceForm');
        if (form) {
            form.addEventListener('submit', submitExperience);
        }

        document.querySelectorAll('.star-rating i').forEach((star) => {
            const value = Number(star.dataset.rating || 0);
            star.addEventListener('click', () => setRating(value));
        });
    });

    window.setRating = setRating;
    window.submitExperience = submitExperience;
    window.closeModal = closeModal;
})(window, document);
