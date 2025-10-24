/**
 * Native Ads Manager for JamWatHQ
 * Handles ad loading, tracking, and performance optimization
 */

(function() {
	'use strict';

	// Configuration
	const AdManager = {
		config: {
			// Replace with your actual ad network IDs
			googleAdSenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
			mediaNetId: 'XXXXXXXXXX',
			// Ad refresh interval (in milliseconds) - set to 0 to disable
			refreshInterval: 0,
			// Lazy loading threshold (pixels from viewport)
			lazyLoadThreshold: 200,
			// Track ad impressions
			trackImpressions: true
		},

		// Track loaded ads
		loadedAds: new Set(),

		// Initialize ad manager
		init: function() {
			console.log('🎯 JamWatHQ Native Ads Manager Initialized');
			
			// Load ads when DOM is ready
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', () => this.loadAds());
			} else {
				this.loadAds();
			}

			// Setup lazy loading for ads
			this.setupLazyLoading();

			// Setup impression tracking
			if (this.config.trackImpressions) {
				this.setupImpressionTracking();
			}
		},

		// Load all ads on the page
		loadAds: function() {
			console.log('📡 Loading native ads...');

			// Load Google AdSense ads
			this.loadAdSenseAds();

			// Load Media.net ads
			this.loadMediaNetAds();

			// Add click tracking to native ad links
			this.setupClickTracking();
		},

		// Load Google AdSense ads
		loadAdSenseAds: function() {
			const adSenseContainers = document.querySelectorAll('.adsense-native');
			
			if (adSenseContainers.length === 0) {
				return;
			}

			// Check if AdSense script is already loaded
			if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
				const script = document.createElement('script');
				script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.googleAdSenseId}`;
				script.async = true;
				script.crossOrigin = 'anonymous';
				script.onerror = () => {
					console.warn('⚠️ Failed to load AdSense script');
					this.handleAdLoadError(adSenseContainers, 'adsense');
				};
				document.head.appendChild(script);
			}

			// Initialize AdSense ads
			adSenseContainers.forEach((container, index) => {
				try {
					(adsbygoogle = window.adsbygoogle || []).push({});
					this.loadedAds.add(`adsense-${index}`);
					container.classList.remove('loading');
				} catch (e) {
					console.warn('⚠️ AdSense ad failed to load:', e);
					this.handleAdLoadError([container], 'adsense');
				}
			});
		},

		// Load Media.net ads
		loadMediaNetAds: function() {
			// Check if Media.net script is loaded
			if (typeof window._mNHandle === 'undefined') {
				// Load Media.net script if needed
				// Uncomment and configure if using Media.net
				/*
				const script = document.createElement('script');
				script.src = '//contextual.media.net/dmjs/v2/XXXXXXXXXX.js';
				script.async = true;
				document.head.appendChild(script);
				*/
			}
		},

		// Setup lazy loading for ads (load when near viewport)
		setupLazyLoading: function() {
			if (!('IntersectionObserver' in window)) {
				console.log('⚠️ IntersectionObserver not supported, loading all ads immediately');
				return;
			}

			const adContainers = document.querySelectorAll('.native-ad[data-lazy="true"]');
			
			if (adContainers.length === 0) {
				return;
			}

			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting && !entry.target.dataset.loaded) {
						this.loadLazyAd(entry.target);
						entry.target.dataset.loaded = 'true';
						observer.unobserve(entry.target);
					}
				});
			}, {
				rootMargin: `${this.config.lazyLoadThreshold}px`
			});

			adContainers.forEach(ad => observer.observe(ad));
		},

		// Load a single lazy-loaded ad
		loadLazyAd: function(container) {
			console.log('📥 Loading lazy ad:', container.id || container.className);
			
			// Add specific loading logic here based on ad type
			const adType = container.dataset.adType;
			
			if (adType === 'adsense') {
				// Load AdSense ad
				try {
					(adsbygoogle = window.adsbygoogle || []).push({});
				} catch (e) {
					console.warn('Failed to load lazy AdSense ad:', e);
				}
			}
		},

		// Setup click tracking for native ads
		// UPDATED (2025-10-16): Make entire ad container clickable instead of just CTA buttons
		setupClickTracking: function() {
			const adContainers = document.querySelectorAll('.native-ad');

			adContainers.forEach((container, index) => {
				// Extract the ad URL from the title link
				const titleLink = container.querySelector('.ad-title a');
				if (!titleLink) return;

				const adUrl = titleLink.href;

				// Make the entire container clickable
				container.style.cursor = 'pointer';
				container.setAttribute('role', 'link');
				container.setAttribute('tabindex', '0');
				container.setAttribute('aria-label', `Sponsored ad: ${titleLink.textContent}`);

				// Handle click on container
				container.addEventListener('click', (e) => {
					// Don't trigger if clicking on a link inside (to avoid double-click)
					if (e.target.tagName === 'A' || e.target.closest('a')) {
						this.trackAdClick(titleLink, index);
						return;
					}

					// Track the click
					this.trackAdClick(titleLink, index);

					// Open the ad URL
					window.open(adUrl, '_blank', 'noopener,noreferrer');
				});

				// Handle keyboard activation (Enter/Space)
				container.addEventListener('keydown', (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						this.trackAdClick(titleLink, index);
						window.open(adUrl, '_blank', 'noopener,noreferrer');
					}
				});

				// Add hover effect
				container.addEventListener('mouseenter', () => {
					container.style.transform = 'translateY(-2px)';
				});

				container.addEventListener('mouseleave', () => {
					container.style.transform = '';
				});
			});
		},

		// Track ad clicks
		trackAdClick: function(link, index) {
			const adContainer = link.closest('.native-ad');
			const adType = adContainer.className.match(/native-ad-(\w+)/)?.[1] || 'unknown';
			
			console.log(`🖱️ Ad clicked: ${adType} (${index})`);

			// Send to Google Analytics if available
			if (typeof gtag !== 'undefined') {
				gtag('event', 'ad_click', {
					'event_category': 'Native Ads',
					'event_label': adType,
					'value': index
				});
			}

			// Send to your own analytics endpoint if needed
			this.sendAnalytics('ad_click', {
				adType: adType,
				adIndex: index,
				url: link.href,
				timestamp: new Date().toISOString()
			});
		},

		// Setup impression tracking
		setupImpressionTracking: function() {
			if (!('IntersectionObserver' in window)) {
				return;
			}

			const adContainers = document.querySelectorAll('.native-ad');
			
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting && 
						entry.intersectionRatio >= 0.5 && 
						!entry.target.dataset.impressionTracked) {
						
						this.trackImpression(entry.target);
						entry.target.dataset.impressionTracked = 'true';
					}
				});
			}, {
				threshold: 0.5 // Track when 50% of ad is visible
			});

			adContainers.forEach(ad => observer.observe(ad));
		},

		// Track ad impressions
		trackImpression: function(adContainer) {
			const adType = adContainer.className.match(/native-ad-(\w+)/)?.[1] || 'unknown';
			
			console.log(`👁️ Ad impression: ${adType}`);

			// Send to Google Analytics if available
			if (typeof gtag !== 'undefined') {
				gtag('event', 'ad_impression', {
					'event_category': 'Native Ads',
					'event_label': adType
				});
			}

			// Send to your own analytics endpoint
			this.sendAnalytics('ad_impression', {
				adType: adType,
				timestamp: new Date().toISOString()
			});
		},

		// Handle ad loading errors
		handleAdLoadError: function(containers, adType) {
			containers.forEach(container => {
				container.classList.add('ad-error');
				container.style.display = 'none'; // Hide failed ads
			});
			
			console.warn(`⚠️ ${adType} ads failed to load - containers hidden`);
		},

		// Send analytics data
		sendAnalytics: function(eventType, data) {
			// Uncomment and configure your analytics endpoint
			/*
			fetch('/api/ad-analytics', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					event: eventType,
					data: data
				})
			}).catch(err => {
				console.warn('Failed to send analytics:', err);
			});
			*/
		},

		// Refresh ads (if enabled)
		refreshAds: function() {
			if (this.config.refreshInterval === 0) {
				return;
			}

			console.log('🔄 Refreshing ads...');
			
			// Clear existing ads
			this.loadedAds.clear();
			
			// Reload ads
			this.loadAds();
		},

		// Public API
		addAd: function(container, options) {
			console.log('➕ Adding new ad:', options);
			// Logic to dynamically add ads
		},

		removeAd: function(adId) {
			console.log('➖ Removing ad:', adId);
			// Logic to remove ads
		}
	};

	// Initialize on page load
	AdManager.init();

	// Expose to global scope for manual control
	window.JamWatAdManager = AdManager;

	// Auto-refresh ads if configured
	if (AdManager.config.refreshInterval > 0) {
		setInterval(() => {
			AdManager.refreshAds();
		}, AdManager.config.refreshInterval);
	}

})();

/**
 * Helper function to manually load ads
 * Call this after dynamically adding ad containers to the page
 */
function loadJamWatAds() {
	if (window.JamWatAdManager) {
		window.JamWatAdManager.loadAds();
	}
}

/**
 * Helper function to track custom ad events
 */
function trackAdEvent(eventType, adData) {
	if (window.JamWatAdManager) {
		window.JamWatAdManager.sendAnalytics(eventType, adData);
	}
}
