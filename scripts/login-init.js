/**
 * Login Button Initialization
 * Centralized script to initialize login buttons across all pages
 * This avoids CSP violations from inline onclick handlers
 */

(function() {
  'use strict';

  /**
   * Shows "Under Development" popup for authentication features
   */
  function showAuthUnderDevelopmentPopup() {
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
            <strong>"User Authentication"</strong> is currently under development and requires database integration.
          </p>
          <p style="color: #ffffff; line-height: 1.6; margin-bottom: 1em;">
            To help us complete this feature and bring it to you, we need to generate revenue through advertisements.
            Your support by viewing ads on our site helps fund the development of features like:
          </p>
          <ul style="color: #ffffff; line-height: 1.8; margin-bottom: 1em; padding-left: 20px;">
            <li>User login and authentication</li>
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

  // Initialize event listeners for login modal buttons
  function initializeLoginButtons() {
    console.log('[Login Init] Initializing login buttons...');

    // Profile hub button - Show "Under Development" popup
    const profileBtn = document.getElementById('profile-hub-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', function() {
        showAuthUnderDevelopmentPopup();
      });
      console.log('[Login Init] Profile hub button listener attached');
    }

    // Google login button - Show "Under Development" popup
    const googleBtn = document.getElementById('btn-google-login');
    if (googleBtn) {
      googleBtn.addEventListener('click', function() {
        showAuthUnderDevelopmentPopup();
      });
      console.log('[Login Init] Google login button listener attached');
    }

    // Facebook login button - Show "Under Development" popup
    const facebookBtn = document.getElementById('btn-facebook-login');
    if (facebookBtn) {
      facebookBtn.addEventListener('click', function() {
        showAuthUnderDevelopmentPopup();
      });
      console.log('[Login Init] Facebook login button listener attached');
    }

    // Cancel button
    const cancelBtn = document.getElementById('btn-cancel-login');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if (typeof closeLoginModal === 'function') {
          closeLoginModal();
        }
      });
      console.log('[Login Init] Cancel button listener attached');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoginButtons);
  } else {
    initializeLoginButtons();
  }

})();
