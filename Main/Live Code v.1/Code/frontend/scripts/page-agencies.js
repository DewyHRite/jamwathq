'use strict';

/**
 * Agencies Page Initialization Module
 * Handles authentication, profile hub, video ads for agencies.html
 * SECURITY: Removes inline scripts, enables CSP
 * 
 * This file consolidates three inline script blocks:
 * 1. Authentication & Review Logic (~500 lines)
 * 2. Profile Hub Management (~150 lines)
 * 3. Video Ad Initialization (~20 lines)
 */
(function() {
    // ========================================================================
    // SCRIPT 1: Authentication & Review Logic
    // ========================================================================
    
      // Store pending review data for TOS confirmation
      let pendingReviewData = null;

      // Use centralized auth manager
      let isUserLoggedIn = false;
      let currentUser = {
        firstName: '',
        profilePic: '',
        email: '',
        googleId: ''
      };

      // Check authentication status using auth manager
      async function checkExistingSession() {
        try {
          const status = await window.authManager.checkAuthStatus();
          if (status.authenticated && status.user) {
            isUserLoggedIn = true;
            currentUser = {
              firstName: status.user.firstName || '',
              profilePic: status.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(status.user.firstName || 'User')}&background=ffee00&color=000`,
              email: status.user.email || '',
              googleId: status.user.googleId || status.user._id || ''
            };
            console.log('User session restored:', currentUser);
          } else {
            isUserLoggedIn = false;
            currentUser = {
              firstName: '',
              profilePic: '',
              email: '',
              googleId: ''
            };
          }
          updateHUD();
        } catch (error) {
          console.error('Error checking session:', error);
          isUserLoggedIn = false;
        }
      }

      // Login with Google - redirect to backend OAuth
      function loginWithGoogle() {
        window.authManager.loginWithGoogle();
      }

      // Login with Facebook - redirect to backend OAuth
      function loginWithFacebook() {
        window.authManager.loginWithFacebook();
      }

      // Logout function - use centralized logout
      function logout() {
        window.authManager.logout();
      }

      // Update HUD to show/hide based on login status
      function updateHUD() {
        const hudElement = document.getElementById('user-hud');
        const usernameElement = document.getElementById('hud-username');

        if (isUserLoggedIn && currentUser.firstName) {
          // User is logged in - show HUD
          usernameElement.textContent = currentUser.firstName;
          hudElement.style.display = 'block';
        } else {
          // User is not logged in - hide HUD
          hudElement.style.display = 'none';
        }
      }

      // Login Modal Functions
      function openLoginModal() {
        const modal = document.getElementById("loginModal");
        modal.style.display = "block";
        // Focus first focusable element (Google sign-in button)
        setTimeout(() => {
          const focusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusableElement) focusableElement.focus();
        }, 100);
      }

      function closeLoginModal() {
        const modal = document.getElementById("loginModal");
        modal.style.display = "none";
      }

      // Jamaica Legal Modal Functions
      function openJamaicaLegalModal(event) {
        if (event) event.preventDefault();
        const modal = document.getElementById("jamaicaLegalModal");
        modal.style.display = "block";
        // Focus close button for accessibility
        setTimeout(() => {
          const closeBtn = modal.querySelector('.close-modal-btn');
          if (closeBtn) closeBtn.focus();
        }, 100);
      }

      function closeJamaicaLegalModal() {
        const modal = document.getElementById("jamaicaLegalModal");
        modal.style.display = "none";
      }

      /**
       * Opens past reviews in a modal popup
       * @param {string} agencyId - The agency identifier
       */
      async function togglePastReviews(agencyId) {
        const modal = document.getElementById("reviews-modal-" + agencyId);
        const reviewsBox = document.getElementById("reviews-" + agencyId);
        const wrapper = document.getElementById("wrapper-" + agencyId);

        if (!modal || !reviewsBox) {
          console.error('Could not find reviews modal or box for agency:', agencyId);
          return;
        }

        // Get agency name from the header
        const agencyNameElement = wrapper?.querySelector('header h3');
        const agencyName = agencyNameElement?.textContent?.trim() || 'Agency';

        // Show reviews - fetch from backend if not already loaded
        if (!reviewsBox.dataset.loaded) {
          // Show loading message
          reviewsBox.innerHTML = `
            <div class="past-reviews-header">
              <div class="past-reviews-agency-name">${agencyName}</div>
              <button class="hide-reviews-btn" data-action="close-past-reviews" data-agency-id='${agencyId}'>
                <i class="fas fa-times-circle"></i> Hide Reviews
              </button>
            </div>
            <h3>Past Reviews</h3>
            <div class="loading-message" style="text-align: center; padding: 2em; color: #ffee00;">
              <i class="fas fa-spinner fa-spin"></i> Loading reviews...
            </div>
          `;

          try {
            // Fetch reviews from backend
            const response = await fetch(`${API_BASE_URL}/api/agency-reviews/${agencyId}`);
            const data = await response.json();

            if (data.success && data.reviews && data.reviews.length > 0) {
              // Calculate and update average rating from fetched reviews
              const totalReviews = data.reviews.length;
              const totalRating = data.reviews.reduce((sum, review) => sum + review.overallRating, 0);
              const averageRating = (totalRating / totalReviews).toFixed(1);

              // Update rating text in expanded view
              const ratingText = document.getElementById(`ratingText-${agencyId}`);
              if (ratingText) ratingText.textContent = `${averageRating} average based on ${totalReviews} reviews.`;

              // Update stars display in expanded view
              const starsContainer = document.getElementById(`averageRating-${agencyId}`);
              if (starsContainer && starsContainer.children) {
                for (let i = 0; i < starsContainer.children.length; i++) {
                  starsContainer.children[i].className = i < Math.round(averageRating) ? 'fa fa-star checked' : 'fa fa-star';
                }
              }

              // Update condensed rating in header (using agencies.js function)
              if (typeof updateCondensedRating === 'function') {
                updateCondensedRating(agencyId, averageRating, totalReviews);
              }

              // Render reviews
              const reviewsHTML = data.reviews.map(review => {
                const stars = '★'.repeat(Math.round(review.overallRating)) + '☆'.repeat(5 - Math.round(review.overallRating));
                const date = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const frequencyLabels = ['N/A', 'Once', 'Twice', '3 times', '4 times', '5+ times'];
                const frequency = frequencyLabels[review.usageFrequency] || 'N/A';

                // Profile picture or initial avatar
                const avatar = review.userProfilePicture
                  ? `<img src="${review.userProfilePicture}" alt="${review.userFirstName}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover;" />`
                  : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #ffee00; color: #000; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 18px;">${review.userFirstName.charAt(0).toUpperCase()}</div>`;

                return `
                  <div class="review-item" style="background: #1a1a1a; padding: 1em; margin-bottom: 1em; border-radius: 6px; border-left: 3px solid #ffee00; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                      <div style="display: flex; align-items: center;">
                        ${avatar}
                        <strong style="color: #ffee00; word-wrap: break-word; overflow-wrap: break-word;">${review.userFirstName}</strong>
                      </div>
                      <span style="color: #ffd700; font-size: 1.2em;">${stars}</span>
                    </div>
                    <div style="color: #999; font-size: 0.85em; margin-bottom: 0.5em;">
                      ${date} • Used ${frequency}
                    </div>
                    <p style="color: #fff; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${review.comments}</p>
                  </div>
                `;
              }).join('');

              reviewsBox.innerHTML = `
                <div class="past-reviews-header">
                  <div class="past-reviews-agency-name">${agencyName}</div>
                  <button class="hide-reviews-btn" data-action="close-past-reviews" data-agency-id='${agencyId}'>
                    <i class="fas fa-times-circle"></i> Hide Reviews
                  </button>
                </div>
                <h3>Past Reviews</h3>
                ${reviewsHTML}
              `;
            } else {
              reviewsBox.innerHTML = `
                <div class="past-reviews-header">
                  <div class="past-reviews-agency-name">${agencyName}</div>
                  <button class="hide-reviews-btn" data-action="close-past-reviews" data-agency-id='${agencyId}'>
                    <i class="fas fa-times-circle"></i> Hide Reviews
                  </button>
                </div>
                <h3>Past Reviews</h3>
                <div class="no-reviews-message">No reviews as yet</div>
              `;
            }

            reviewsBox.dataset.loaded = 'true';
          } catch (error) {
            console.error('Error fetching agency reviews:', error);
            reviewsBox.innerHTML = `
              <div class="past-reviews-header">
                <div class="past-reviews-agency-name">${agencyName}</div>
                <button class="hide-reviews-btn" data-action="close-past-reviews" data-agency-id='${agencyId}'>
                  <i class="fas fa-times-circle"></i> Hide Reviews
                </button>
              </div>
              <h3>Past Reviews</h3>
              <div class="error-message" style="color: #ff6b6b; text-align: center;">Failed to load reviews. Please try again later.</div>
            `;
          }
        }

        // Show the modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }

      /**
       * Closes the past reviews modal popup
       * @param {string} agencyId - The agency identifier
       */
      function closePastReviews(agencyId) {
        const modal = document.getElementById("reviews-modal-" + agencyId);
        if (modal) {
          modal.classList.remove('show');
          document.body.style.overflow = ''; // Restore background scrolling
        }
      }

      // Close modal when clicking outside the reviews box
      window.addEventListener('click', function(event) {
        if (event.target.classList.contains('past-reviews-modal')) {
          const modalId = event.target.id.replace('reviews-modal-', '');
          closePastReviews(modalId);
        }
      });

      // TOS Modal Functions
      function openTOSModal() {
        const modal = document.getElementById("tosModal");
        const checkbox = document.getElementById("tosCheckbox");
        checkbox.checked = false;
        toggleTOSAcceptButton();
        modal.style.display = "block";
        // Focus checkbox for accessibility
        setTimeout(() => {
          if (checkbox) checkbox.focus();
        }, 100);
      }

      function closeTOSModal() {
        const modal = document.getElementById("tosModal");
        modal.style.display = "none";
      }

      function toggleTOSAcceptButton() {
        const checkbox = document.getElementById("tosCheckbox");
        const acceptBtn = document.getElementById("tosAcceptBtn");
        acceptBtn.disabled = !checkbox.checked;
      }

      async function acceptTOS() {
        closeTOSModal();

        if (!pendingReviewData) {
          alert("No pending review data found.");
          return;
        }

        // Submit the review to the backend API
        const { agencyId, form } = pendingReviewData;

        try {
          // Collect form data
          const formData = new FormData(form);
          const reviewData = {
            agencyId: agencyId,
            agencyName: form.querySelector('[name="agencyName"]')?.value || document.querySelector('#wrapper-' + agencyId + ' h3')?.textContent?.trim() || agencyId,
            applicationProcess: parseInt(formData.get('applicationProcess-' + agencyId)) || 0,
            customerService: parseInt(formData.get('customerService-' + agencyId)) || 0,
            communication: parseInt(formData.get('communication-' + agencyId)) || 0,
            supportServices: parseInt(formData.get('supportServices-' + agencyId)) || 0,
            overallExperience: parseInt(formData.get('overallExperience-' + agencyId)) || 0,
            comments: formData.get('comments-' + agencyId) || '',
            usageFrequency: parseInt(formData.get('usageFrequency-' + agencyId)) || 1,
            tosAccepted: true
          };

          // Debug: Log the review data to see what's being sent
          console.log('🔍 Review data being submitted:', JSON.stringify(reviewData, null, 2));
          console.log('🔍 Form fields found:');
          console.log('  - applicationProcess:', formData.get('applicationProcess-' + agencyId));
          console.log('  - customerService:', formData.get('customerService-' + agencyId));
          console.log('  - communication:', formData.get('communication-' + agencyId));
          console.log('  - supportServices:', formData.get('supportServices-' + agencyId));
          console.log('  - overallExperience:', formData.get('overallExperience-' + agencyId));
          console.log('  - comments:', formData.get('comments-' + agencyId));
          console.log('  - usageFrequency:', formData.get('usageFrequency-' + agencyId));

          // Submit using auth manager
          const result = await window.authManager.submitAgencyReview(reviewData);

          if (result && result.success) {
            alert('Thank you for your review! Your feedback helps the community.');
            form.reset();

            // Clear the reviews cache so it will be reloaded
            const reviewsBox = document.getElementById('reviews-' + agencyId);
            if (reviewsBox) {
              delete reviewsBox.dataset.loaded;
            }

            // Close the review form
            const reviewSection = document.querySelector(`#wrapper-${agencyId} .review-section`);
            if (reviewSection) reviewSection.style.display = 'none';

            // Reset the "Leave a Review" button to default state
            const agencyWrapper = document.getElementById(`wrapper-${agencyId}`);
            const agencyInfo = agencyWrapper?.querySelector('.agency-info');
            const reviewButton = agencyWrapper?.querySelector('button[onclick*="toggleReviewSection"]');
            if (reviewButton) {
              reviewButton.textContent = 'Leave a Review';
              reviewButton.classList.remove('btn-secondary');
              reviewButton.classList.add('btn-primary');
            }

            // Remove the 'reviewing' class from the agency-info element
            agencyInfo?.classList.remove('reviewing');

            // Show the updated reviews
            setTimeout(() => {
              togglePastReviews(agencyId);
            }, 500);
          } else {
            throw new Error(result?.message || 'Failed to submit review');
          }
        } catch (error) {
          console.error('Error submitting agency review:', error);
          alert('Failed to submit your review. Please try again. Error: ' + error.message);
        }

        pendingReviewData = null;
      }

      function declineTOS() {
        closeTOSModal();
        pendingReviewData = null;
        alert('Review submission cancelled. Your review has not been saved.');
      }

      // Close TOS modal when clicking outside (don't allow - user must make deliberate choice)
      window.onclick = function(event) {
        const tosModal = document.getElementById("tosModal");
        // Don't close TOS modal when clicking outside
      }

      // Enhanced form validation for ALL review forms with TOS confirmation
      // Generic function that validates mandatory usage frequency field before showing TOS
      // Works for all 70 agency forms by extracting agency ID from the event target
      // NOTE: Login check is now done when clicking "Leave a Review" button, not on submit
      function validateAndSubmitReview(event, agencyId) {
        event.preventDefault();

        const form = document.getElementById('reviewForm-' + agencyId);
        const usageFrequency = document.getElementById('usageFrequency-' + agencyId);

        // STEP 1: Check if usage frequency is selected (required field)
        if (!usageFrequency || !usageFrequency.value) {
          alert('Please select how many times you have used this agency. This is a required field.');
          if (usageFrequency) usageFrequency.focus();
          return false;
        }

        // STEP 2: HTML5 form validation check
        if (!form.checkValidity()) {
          form.reportValidity();
          return false;
        }

        // STEP 3: Store pending review data for TOS confirmation
        pendingReviewData = {
          agencyId: agencyId,
          form: form
        };

        // Show TOS modal - user must accept before submission
        openTOSModal();

        return false;
      }

      // Backward compatibility wrapper for agencies that still call specific validation functions
      function validateAndSubmitReview10881(event) {
        return validateAndSubmitReview(event, '10881');
      }

      // Keyboard accessibility - Escape key closes modals (except TOS which requires explicit action)
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
          const loginModal = document.getElementById('loginModal');

          // Only close login modal with Escape - TOS requires explicit decline
          if (loginModal && loginModal.style.display === 'block') {
            closeLoginModal();
            pendingReviewData = null; // Clear pending data when user cancels
          }
        }
      });

      // Check for existing login session on page load
      document.addEventListener('DOMContentLoaded', function() {
        checkExistingSession();

        // Update HUD to show login status
        updateHUD();

        if (isUserLoggedIn) {
          console.log('User is logged in:', currentUser.firstName);
        } else {
          console.log('User is not logged in');
        }

        // Load existing ratings for all agencies
        loadAllAgencyRatings();
      });

      /**
       * Loads existing ratings for all agencies on the page
       * Fetches reviews from backend and updates rating displays
       */
      async function loadAllAgencyRatings() {
        console.log('Loading existing agency ratings...');

        // Get all agency wrapper elements
        const agencyWrappers = document.querySelectorAll('[id^="wrapper-"]');

        for (const wrapper of agencyWrappers) {
          const agencyId = wrapper.id.replace('wrapper-', '');

          try {
            // Fetch reviews for this agency
            const response = await fetch(`${API_BASE_URL}/api/agency-reviews/${agencyId}`);
            const data = await response.json();

            if (data.success && data.reviews && data.reviews.length > 0) {
              // Calculate average rating
              const totalReviews = data.reviews.length;
              const totalRating = data.reviews.reduce((sum, review) => sum + review.overallRating, 0);
              const averageRating = (totalRating / totalReviews).toFixed(1);

              // Update rating text
              const ratingText = document.getElementById(`ratingText-${agencyId}`);
              if (ratingText) {
                ratingText.textContent = `${averageRating} average based on ${totalReviews} reviews.`;
              }

              // Update stars display
              const starsContainer = document.getElementById(`averageRating-${agencyId}`);
              if (starsContainer && starsContainer.children) {
                for (let i = 0; i < starsContainer.children.length; i++) {
                  starsContainer.children[i].className = i < Math.round(averageRating) ? 'fa fa-star checked' : 'fa fa-star';
                }
              }

              // Update condensed rating in header
              if (typeof updateCondensedRating === 'function') {
                updateCondensedRating(agencyId, averageRating, totalReviews);
              }

              console.log(`✅ Loaded ${totalReviews} reviews for ${agencyId} (avg: ${averageRating})`);
            }
          } catch (error) {
            console.error(`Error loading ratings for ${agencyId}:`, error);
            // Continue with next agency even if one fails
          }
        }

        console.log('✅ Finished loading all agency ratings');
      }

    // ========================================================================
    // SCRIPT 2: Profile Hub Management
    // ========================================================================

      // Update profile hub based on login status
      function updateProfileHub() {
        const profileBtn = document.getElementById('profile-hub-btn');
        if (!profileBtn) return;

        // Check if user is logged in using authManager
        if (window.authManager) {
          window.authManager.checkAuthStatus().then(status => {
            if (status.authenticated && status.user) {
              // User is logged in - show username and logout option
              const username = status.user.firstName || status.user.name || status.user.email.split('@')[0];
              // SECURITY FIX: Use safe DOM manipulation instead of innerHTML
              profileBtn.textContent = "";
              const usernameSpan = document.createElement("span");
              usernameSpan.className = "profile-username";
              usernameSpan.textContent = username;
              const logoutSpan = document.createElement("span");
              logoutSpan.className = "profile-logout";
              logoutSpan.textContent = "(Logout)";
              profileBtn.appendChild(usernameSpan);
              profileBtn.appendChild(logoutSpan);
              profileBtn.classList.add('logged-in');
              profileBtn.title = `Logged in as ${status.user.email}`;
            } else {
              // User is not logged in - show login button
              profileBtn.textContent = 'Login';
              profileBtn.classList.remove('logged-in');
              profileBtn.title = 'Click to login';
            }
          }).catch(err => {
            console.error('Error checking auth status:', err);
            profileBtn.textContent = 'Login';
            profileBtn.classList.remove('logged-in');
          });
        } else {
          // authManager not available yet - show login
          profileBtn.textContent = 'Login';
          profileBtn.classList.remove('logged-in');
        }
      }

      // Handle login/logout button click
      function handleProfileHub() {
        const profileBtn = document.getElementById('profile-hub-btn');
        if (!profileBtn) return;

        if (profileBtn.classList.contains('logged-in')) {
          // User is logged in - perform logout
          if (window.authManager) {
            window.authManager.logout();
          }
        } else {
          // User is not logged in - show login modal
          const loginModal = document.getElementById('loginModal');
          if (loginModal) {
            loginModal.style.display = 'flex';
          }
        }
      }

      // Initialize profile hub on page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          // Wait a bit for authManager to initialize
          setTimeout(updateProfileHub, 500);
        });
      } else {
        setTimeout(updateProfileHub, 500);
      }

      // Listen for auth state changes
      window.addEventListener('authStateChanged', function(event) {
        console.log('Auth state changed:', event.detail);
        updateProfileHub();
      });

      // Also update when page becomes visible (user returns to tab)
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
          updateProfileHub();
        }
      });


    // ========================================================================
    // SCRIPT 3: Video Ad Initialization
    // ========================================================================

      // Example: Load a video ad when page loads (desktop only)
      document.addEventListener('DOMContentLoaded', function() {
        // Check if desktop
        if (window.innerWidth > 1024 && window.VideoAdController) {
          // Example video ad - replace with actual ad network integration
          /*
          VideoAdController.loadVideo('path/to/your/video-ad.mp4', {
            sponsor: 'Your Sponsor Name',
            sponsorUrl: 'https://sponsor-website.com',
            duration: '0:30',
            autoplay: false  // Set to true for autoplay (will be muted)
          });
          */

          // For now, the placeholder will show until a video is loaded
          console.log('Video ad container ready for desktop view');
        }
      });

  // ========================================================================
  // GLOBAL EXPORTS - Functions needed by agencies.js event delegation
  // ========================================================================
  
  // Export functions to global scope for event delegation in agencies.js
  window.openJamaicaLegalModal = openJamaicaLegalModal;
  window.closeJamaicaLegalModal = closeJamaicaLegalModal;
  window.togglePastReviews = togglePastReviews;
  window.closePastReviews = closePastReviews;
  window.validateAndSubmitReview = validateAndSubmitReview;
  window.acceptTOS = acceptTOS;
  window.declineTOS = declineTOS;
  window.openTOSModal = openTOSModal;
  window.closeTOSModal = closeTOSModal;
  window.openLoginModal = openLoginModal;
  window.closeLoginModal = closeLoginModal;
  
})();
console.log('[Page-Agencies] Module loaded and functions exported');
