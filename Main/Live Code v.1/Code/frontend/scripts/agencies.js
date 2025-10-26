// List of Agency Page - Filter and Review System
// JamWatHQ - Optimized for performance

let totalReviews = 0;
let totalRating = 0;
const agencyReviews = {};


/**
 * Filters agencies based on search criteria
 */
function filterAgencies() {
    const searchInput = document.getElementById('searchAgencyForm').value.toLowerCase();
    const locationFilter = document.getElementById('locationForm').value.toLowerCase();
    const servicesFilter = document.getElementById('servicesForm').value.toLowerCase();
    const minRating = parseFloat(document.getElementById('ratingForm').value) || 0;

    // Check if any filter is active
    const isFiltering = searchInput || locationFilter || servicesFilter || minRating > 0;

    const agencies = document.querySelectorAll('.agency-info');
    agencies.forEach(agency => {
        const agencyName = agency.querySelector('header h3')?.textContent.toLowerCase() || '';
        const location = agency.querySelector('.location-tag')?.textContent.toLowerCase() || '';
        const services = Array.from(agency.querySelectorAll('section')).find(section =>
            section.textContent.toLowerCase().includes('services:')
        )?.textContent.toLowerCase() || '';

        // Extract rating
        const ratingSpan = agency.querySelector('[id^="ratingText-"]');
        let rating = 0;
        if (ratingSpan) {
            const match = ratingSpan.textContent.match(/^([\d.]+) average/);
            if (match) rating = parseFloat(match[1]);
        }

        if (
            (agencyName.includes(searchInput) || !searchInput) &&
            (location.includes(locationFilter) || !locationFilter) &&
            (services.includes(servicesFilter) || !servicesFilter) &&
            (rating >= minRating)
        ) {
            agency.style.display = '';
        } else {
            agency.style.display = 'none';
        }
    });

    // Apply filtered layout: move ads to sidebar or bottom
    applyFilteredLayout(isFiltering);
}

/**
 * Clears all filter inputs and shows all agencies
 */
function clearFilters() {
    document.getElementById('searchAgencyForm').value = '';
    document.getElementById('locationForm').value = '';
    document.getElementById('servicesForm').value = '';
    document.getElementById('ratingForm').value = '';

    document.querySelectorAll('.agency-info').forEach(agency => {
        agency.style.display = '';
    });

    // Reset to normal layout
    applyFilteredLayout(false);
}

/**
 * Applies filtered or normal layout based on filter state
 * @param {boolean} isFiltering - Whether filters are currently active
 */
function applyFilteredLayout(isFiltering) {
    const container = document.querySelector('article.box.post');
    const ads = document.querySelectorAll('.native-ad');

    if (isFiltering) {
        // Add filtered class to container for responsive layout
        container?.classList.add('filtering-active', 'content-wrapper');

        // Show only ONE ad when filtering - hide all others
        ads.forEach((ad, index) => {
            if (index === 0) {
                // Keep first ad visible
                ad.style.display = '';
                ad.style.opacity = '1';
            } else {
                // Hide all other ads to avoid clutter
                ad.style.display = 'none';
            }
        });
    } else {
        // Remove filtered class to restore normal layout
        container?.classList.remove('filtering-active', 'content-wrapper');

        // Show all ads in normal view
        ads.forEach(ad => {
            ad.style.display = '';
            ad.style.opacity = '';
        });
    }
}

/**
 * Toggles the review form visibility for an agency
 * @param {HTMLElement} buttonElement - The button that was clicked
 * @param {Event} event - The click event (optional)
 */
function toggleReviewSection(buttonElement, event) {
    // Stop event propagation to prevent card toggle
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const agencyElement = buttonElement.closest('.agency-info');
    const reviewSection = agencyElement.querySelector('.review-section');

    if (!agencyElement || !reviewSection) {
        console.error('Could not find agency element or review section');
        return;
    }

    // If the card is condensed (STATE 1), expand to semi-expanded (STATE 2)
    if (agencyElement.classList.contains('condensed')) {
        agencyElement.classList.remove('condensed');
        agencyElement.classList.add('expanded');
    }

    // Toggle between STATE 2 (semi-expanded) and STATE 3 (fully expanded)
    if (reviewSection.style.display === 'none' || reviewSection.style.display === '') {
        // Check if user is logged in before showing review form
        if (!window.authManager || !window.authManager.isLoggedIn()) {
            // User is not logged in - trigger login modal
            // Save the current agency ID to session storage so we can return here after login
            const agencyId = agencyElement.closest('[id^="wrapper-"]')?.id.replace('wrapper-', '');
            if (agencyId) {
                sessionStorage.setItem('returnToAgency', agencyId);
                sessionStorage.setItem('openReviewForm', 'true');
            }

            // Open the login modal (function defined in agencies.html)
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            } else {
                alert('Please log in to leave a review.');
            }
            return;
        }

        // User is logged in - Enter STATE 3: Fully Expanded
        reviewSection.style.display = 'inline';
        agencyElement.classList.add('reviewing');
        buttonElement.textContent = 'Cancel';
        buttonElement.classList.remove('btn-primary');
        buttonElement.classList.add('btn-secondary');
    } else {
        // Return to STATE 2: Semi-Expanded
        reviewSection.style.display = 'none';
        agencyElement.classList.remove('reviewing');
        buttonElement.textContent = 'Leave a Review';
        buttonElement.classList.remove('btn-secondary');
        buttonElement.classList.add('btn-primary');
    }
}

/**
 * Submits a review for an agency
 * @param {string} agencyKey - Unique identifier for the agency
 */
async function submitReviewGeneric(agencyKey) {
    const applicationProcess = parseInt(document.querySelector(`input[name="applicationProcess-${agencyKey}"]:checked`)?.value || 0);
    const customerService = parseInt(document.querySelector(`input[name="customerService-${agencyKey}"]:checked`)?.value || 0);
    const communication = parseInt(document.querySelector(`input[name="communication-${agencyKey}"]:checked`)?.value || 0);
    const supportServices = parseInt(document.querySelector(`input[name="supportServices-${agencyKey}"]:checked`)?.value || 0);
    const overallExperience = parseInt(document.querySelector(`input[name="overallExperience-${agencyKey}"]:checked`)?.value || 0);
    const comments = document.getElementById(`comments-${agencyKey}`)?.value.trim();
    const usageFrequency = parseInt(document.getElementById(`usageFrequency-${agencyKey}`)?.value || 0);

    // Validate all required fields
    if (!applicationProcess || !customerService || !communication || !supportServices || !overallExperience) {
        alert('Please rate all categories before submitting your review.');
        return;
    }

    if (!comments || comments.length < 20) {
        alert('Please provide comments of at least 20 characters before submitting your review.');
        return;
    }

    if (!usageFrequency || usageFrequency < 1 || usageFrequency > 5) {
        alert('Please select how frequently you used this agency.');
        return;
    }

    // Check if user is authenticated
    if (!window.authManager || !window.authManager.isLoggedIn()) {
        alert('Please log in to submit a review.');
        return;
    }

    // Calculate overall rating
    const overallRating = (applicationProcess + customerService + communication + supportServices + overallExperience) / 5;

    // Get agency name from the page
    const agencyWrapper = document.getElementById(`wrapper-${agencyKey}`);
    const agencyName = agencyWrapper?.querySelector('header h3')?.textContent.trim() || agencyKey;

    // Prepare payload for backend API
    const payload = {
        agencyId: agencyKey,
        agencyName: agencyName,
        applicationProcess: applicationProcess,
        customerService: customerService,
        communication: communication,
        supportServices: supportServices,
        overallExperience: overallExperience,
        overallRating: parseFloat(overallRating.toFixed(1)),
        comments: comments,
        usageFrequency: usageFrequency,
        tosAccepted: true
    };

    // Submit to backend API
    const result = await window.authManager.submitAgencyReview(payload);

    if (result && result.success) {
        // Fetch updated reviews from backend to get accurate average
        try {
            const response = await fetch(`${API_BASE_URL}/api/agency-reviews/${agencyKey}`);
            const data = await response.json();

            if (data.success && data.reviews && data.reviews.length > 0) {
                // Calculate average from all reviews including the new one
                const totalReviews = data.reviews.length;
                const totalRating = data.reviews.reduce((sum, review) => sum + review.overallRating, 0);
                const averageRating = (totalRating / totalReviews).toFixed(1);

                // Update rating text
                const ratingText = document.getElementById(`ratingText-${agencyKey}`);
                if (ratingText) ratingText.textContent = `${averageRating} average based on ${totalReviews} reviews.`;

                // Update stars display
                const stars = document.getElementById(`averageRating-${agencyKey}`)?.children;
                if (stars) {
                    for (let i = 0; i < stars.length; i++) {
                        stars[i].className = i < Math.round(averageRating) ? 'fa fa-star checked' : 'fa fa-star';
                    }
                }

                // Update condensed rating display in header
                updateCondensedRating(agencyKey, averageRating, totalReviews);

                // Update local array for consistency
                agencyReviews[agencyKey] = data.reviews.map(r => r.overallRating);
            }
        } catch (error) {
            console.error('Error fetching updated reviews:', error);
        }

        // Reset form
        document.getElementById(`reviewForm-${agencyKey}`).reset();

        // Close review section and return to semi-expanded state (STATE 2)
        const reviewSection = agencyWrapper?.querySelector('.review-section');
        const reviewButton = agencyWrapper?.querySelector('button[onclick*="toggleReviewSection"]');
        if (reviewSection) reviewSection.style.display = 'none';
        if (reviewButton) {
            reviewButton.textContent = 'Leave a Review';
            reviewButton.classList.remove('btn-secondary');
            reviewButton.classList.add('btn-primary');
        }
        agencyWrapper?.classList.remove('reviewing');

        alert('Thank you for your review! It has been submitted successfully.');
    } else {
        alert('Failed to submit review. Please make sure you are logged in and try again.');
    }
}

/**
 * Updates the condensed rating display in the header
 * @param {string} agencyKey - Unique identifier for the agency
 * @param {number} averageRating - The average rating
 * @param {number} totalReviews - Total number of reviews
 */
function updateCondensedRating(agencyKey, averageRating, totalReviews) {
    const wrapper = document.getElementById(`wrapper-${agencyKey}`);
    if (!wrapper) return;

    const header = wrapper.querySelector('.agency-info header');
    if (!header) return;

    // Check if condensed rating already exists
    let condensedRating = header.querySelector('.condensed-rating');

    if (!condensedRating) {
        // Create condensed rating element
        condensedRating = document.createElement('span');
        condensedRating.className = 'condensed-rating';
        header.appendChild(condensedRating);
    }

    // Update the rating display in X.X/5 format
    condensedRating.textContent = `${averageRating}/5`;
}

/**
 * Toggles agency card between condensed and expanded states
 * @param {HTMLElement} cardElement - The agency card element
 */
function toggleAgencyCard(cardElement) {
    const isCondensed = cardElement.classList.contains('condensed');

    if (isCondensed) {
        // Expand the card
        cardElement.classList.remove('condensed');
        cardElement.classList.add('expanded');
    } else {
        // Collapse the card
        cardElement.classList.remove('expanded');
        cardElement.classList.add('condensed');
    }
}

/**
 * Initialize review form handlers and agency card toggles on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    if (window.MLSSData && typeof window.MLSSData.apply === 'function') {
        window.MLSSData.apply();
    }

    // Initialize review forms
    document.querySelectorAll('form[id^="reviewForm-"]').forEach(form => {
        const agencyKey = form.id.replace('reviewForm-', '');
        const submitBtn = form.querySelector('button[type="button"]');
        if (submitBtn) {
            submitBtn.onclick = function() {
                submitReviewGeneric(agencyKey);
            };
        }
    });

    // Initialize all agency cards as condensed
    const agencyCards = document.querySelectorAll('.agency-info.compact');
    agencyCards.forEach(card => {
        // Set initial state as condensed
        card.classList.add('condensed');

        // Add click handler to toggle expansion
        card.addEventListener('click', function(event) {
            // Don't toggle if clicking on a link, button, or form element
            if (event.target.tagName === 'A' ||
                event.target.tagName === 'BUTTON' ||
                event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA' ||
                event.target.closest('form') ||
                event.target.closest('button')) {
                return;
            }

            // Don't toggle if clicking on the "View Past Reviews" button area
            if (event.target.classList.contains('view-past-reviews-btn')) {
                return;
            }

            toggleAgencyCard(card);
        });
    });

    // Initialize condensed ratings for all agencies
    document.querySelectorAll('.agency-wrapper').forEach(wrapper => {
        const agencyKey = wrapper.id.replace('wrapper-', '');
        const ratingTextElem = document.getElementById(`ratingText-${agencyKey}`);

        if (ratingTextElem) {
            // Parse existing rating if any
            const match = ratingTextElem.textContent.match(/^([\d.]+) average based on (\d+) reviews/);
            if (match) {
                const avgRating = parseFloat(match[1]);
                const numReviews = parseInt(match[2]);
                updateCondensedRating(agencyKey, avgRating, numReviews);
            } else {
                // No reviews yet, show 0.0/5
                updateCondensedRating(agencyKey, 0.0, 0);
            }
        }
    });

    applyFilteredLayout(false);

    // Handle post-login redirect to agency and open review form
    const returnToAgency = sessionStorage.getItem('returnToAgency');
    const shouldOpenReviewForm = sessionStorage.getItem('openReviewForm');

    if (returnToAgency && shouldOpenReviewForm === 'true' && window.authManager && window.authManager.isLoggedIn()) {
        // Clear the session storage flags
        sessionStorage.removeItem('returnToAgency');
        sessionStorage.removeItem('openReviewForm');

        // Wait for page to fully load, then scroll to and open the review form
        setTimeout(() => {
            const agencyWrapper = document.getElementById(`wrapper-${returnToAgency}`);
            if (agencyWrapper) {
                // Scroll to the agency
                agencyWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Expand the card if condensed
                const agencyCard = agencyWrapper.querySelector('.agency-info');
                if (agencyCard && agencyCard.classList.contains('condensed')) {
                    agencyCard.classList.remove('condensed');
                    agencyCard.classList.add('expanded');
                }

                // Find and click the "Leave a Review" button to open the form
                setTimeout(() => {
                    const reviewButton = agencyWrapper.querySelector('button[data-action="toggle-review"]');
                    if (reviewButton) {
                        reviewButton.click();
                    }
                }, 500);
            }
        }, 1000);
    }
});

/**
 * Event Delegation for All Interactive Elements
 * Handles clicks on all buttons without inline onclick handlers
 * This avoids CSP violations from Content Security Policy
 */
document.addEventListener('click', function(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const agencyId = target.getAttribute('data-agency-id');

  console.log("[Agencies] Click detected - action:", action, "agencyId:", agencyId);
  switch(action) {
    case 'toggle-review':
      // Call toggleReviewSection function with the button and event
      if (typeof toggleReviewSection === 'function') {
        toggleReviewSection(target, e);
        console.log("[Agencies] toggleReviewSection check:", typeof toggleReviewSection);
      }
      break;

    case 'toggle-past-reviews':
      // Call togglePastReviews with the agency ID
      if (agencyId && typeof togglePastReviews === 'function') {
        console.log("[Agencies] togglePastReviews check:", typeof togglePastReviews, window.togglePastReviews);
        togglePastReviews(agencyId);
      }
      break;

    case 'close-past-reviews':
      // Call closePastReviews with the agency ID
      if (agencyId && typeof closePastReviews === 'function') {
        closePastReviews(agencyId);
      }
      break;

    case 'validate-submit':
      // Call validateAndSubmitReview with event and agency ID
      if (agencyId && typeof validateAndSubmitReview === 'function') {
        e.preventDefault();
        validateAndSubmitReview(e, agencyId);
      }
      break;

    case 'open-jamaica-modal':
      // Call openJamaicaLegalModal with event
      console.log("[Agencies] openJamaicaLegalModal check:", typeof openJamaicaLegalModal, window.openJamaicaLegalModal);
      if (typeof openJamaicaLegalModal === 'function') {
        e.preventDefault();
        openJamaicaLegalModal(e);
      }
      break;

    case 'close-jamaica-modal':
      // Call closeJamaicaLegalModal
      if (typeof closeJamaicaLegalModal === 'function') {
        closeJamaicaLegalModal();
      }
      break;

    case 'clear-filters':
      // Call clearFilters
      if (typeof clearFilters === 'function') {
        clearFilters();
      }
      break;

    case 'accept-tos':
      // Call acceptTOS
      if (typeof acceptTOS === 'function') {
        acceptTOS();
      }
      break;

    case 'decline-tos':
      // Call declineTOS
      if (typeof declineTOS === 'function') {
        declineTOS();
      }
      break;

    default:
      console.warn('[Agencies] Unknown data-action:', action);
  }
});

console.log('[Agencies] Event delegation initialized for all interactive elements');
