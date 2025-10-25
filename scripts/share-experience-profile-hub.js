/**
 * Profile Hub Management
 * Extracted from inline scripts for security (CSP compliance)
 */

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
        profileBtn.textContent = ''; // Clear existing content
        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'profile-username';
        usernameSpan.textContent = username; // textContent auto-escapes HTML
        const logoutSpan = document.createElement('span');
        logoutSpan.className = 'profile-logout';
        logoutSpan.textContent = '(Logout)';
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
  console.log('handleProfileHub called');
  const profileBtn = document.getElementById('profile-hub-btn');
  console.log('profileBtn:', profileBtn);

  if (!profileBtn) {
    console.error('Profile button not found!');
    return;
  }

  if (profileBtn.classList.contains('logged-in')) {
    console.log('User is logged in, logging out...');
    // User is logged in - perform logout
    if (window.authManager) {
      window.authManager.logout();
    }
  } else {
    console.log('User is not logged in, showing modal...');
    // User is not logged in - show login modal
    const loginModal = document.getElementById('loginModal');
    console.log('loginModal:', loginModal);

    if (loginModal) {
      console.log('Setting modal display to flex');
      loginModal.style.display = 'flex';
      console.log('Modal display after setting:', loginModal.style.display);
    } else {
      console.error('Login modal not found!');
    }
  }
}

// Initialize profile hub on page load
function initializeProfileHub() {
  // Attach click handler to profile button
  const profileBtn = document.getElementById('profile-hub-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', handleProfileHub);
  }

  // Wait a bit for authManager to initialize
  setTimeout(updateProfileHub, 500);

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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfileHub);
} else {
  initializeProfileHub();
}
