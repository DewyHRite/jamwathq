/**
 * Video Ad Controller
 * Manages bottom-left video ad placement (desktop only)
 */

'use strict';

(function(window, document) {
    const VideoAdController = {
        container: null,
        player: null,
        isMuted: true,
        isMinimized: false,
        isHidden: false,

        /**
         * Initialize the video ad controller
         */
        init: function() {
            // Only initialize on desktop
            if (window.innerWidth <= 1024) {
                console.log('Video ad hidden - mobile/tablet view');
                return;
            }

            this.container = document.getElementById('video-ad-container');
            if (!this.container) {
                console.warn('Video ad container not found');
                return;
            }

            this.player = this.container.querySelector('.video-ad-player');

            this.attachEventListeners();
            this.setupVideoPlayer();
            this.animateEntry();

            console.log('Video ad controller initialized');
        },

        /**
         * Attach event listeners to controls
         */
        attachEventListeners: function() {
            // Minimize button
            const minimizeBtn = this.container.querySelector('.video-ad-minimize');
            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', () => this.minimize());
            }

            // Close button
            const closeBtn = this.container.querySelector('.video-ad-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            // Restore button (shown when minimized)
            const restoreBtn = this.container.querySelector('.video-ad-restore');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', () => this.restore());
            }

            // Sound toggle
            const soundBtn = this.container.querySelector('.video-ad-sound');
            if (soundBtn) {
                soundBtn.addEventListener('click', () => this.toggleSound());
            }

            // Window resize handler
            window.addEventListener('resize', () => this.handleResize());

            // Video events
            if (this.player) {
                this.player.addEventListener('play', () => this.onVideoPlay());
                this.player.addEventListener('pause', () => this.onVideoPause());
                this.player.addEventListener('ended', () => this.onVideoEnded());
                this.player.addEventListener('error', (e) => this.onVideoError(e));
            }
        },

        /**
         * Setup video player
         */
        setupVideoPlayer: function() {
            if (!this.player) return;

            // Start muted for autoplay compliance
            this.player.muted = true;
            this.player.volume = 0.5;

            // Update mute button
            this.updateSoundButton();

            // Hide placeholder when video loads
            this.player.addEventListener('loadeddata', () => {
                const placeholder = this.container.querySelector('.video-ad-placeholder');
                if (placeholder) {
                    placeholder.classList.add('hidden');
                }
            });
        },

        /**
         * Load a video ad
         * @param {string} videoUrl - URL of the video to load
         * @param {object} options - Additional options (sponsor, duration, etc.)
         */
        loadVideo: function(videoUrl, options = {}) {
            if (!this.player) return;

            this.player.src = videoUrl;

            // Update sponsor info if provided
            if (options.sponsor) {
                const sponsorLink = this.container.querySelector('.video-ad-sponsor');
                if (sponsorLink) {
                    sponsorLink.textContent = options.sponsor;
                    if (options.sponsorUrl) {
                        sponsorLink.href = options.sponsorUrl;
                    }
                }
            }

            // Update duration if provided
            if (options.duration) {
                const durationSpan = this.container.querySelector('.video-ad-duration');
                if (durationSpan) {
                    durationSpan.textContent = options.duration;
                }
            }

            // Auto-play if specified
            if (options.autoplay) {
                this.player.play().catch(err => {
                    console.log('Autoplay prevented:', err);
                });
            }
        },

        /**
         * Minimize the video ad
         */
        minimize: function() {
            this.container.classList.add('minimized');
            this.isMinimized = true;

            // Pause video when minimized
            if (this.player && !this.player.paused) {
                this.player.pause();
            }

            console.log('Video ad minimized');
        },

        /**
         * Restore the video ad from minimized state
         */
        restore: function() {
            this.container.classList.remove('minimized');
            this.isMinimized = false;

            console.log('Video ad restored');
        },

        /**
         * Close/hide the video ad
         */
        close: function() {
            this.container.classList.add('hidden');
            this.isHidden = true;

            // Pause and reset video
            if (this.player) {
                this.player.pause();
                this.player.currentTime = 0;
            }

            // Store preference in sessionStorage
            sessionStorage.setItem('videoAdClosed', 'true');

            console.log('Video ad closed');
        },

        /**
         * Show the video ad (if not closed by user)
         */
        show: function() {
            // Check if user previously closed it
            const wasClosed = sessionStorage.getItem('videoAdClosed');
            if (wasClosed === 'true') {
                console.log('Video ad remains closed (user preference)');
                return;
            }

            this.container.classList.remove('hidden');
            this.isHidden = false;

            console.log('Video ad shown');
        },

        /**
         * Toggle sound on/off
         */
        toggleSound: function() {
            if (!this.player) return;

            this.isMuted = !this.isMuted;
            this.player.muted = this.isMuted;

            this.updateSoundButton();

            console.log('Video ad sound:', this.isMuted ? 'muted' : 'unmuted');
        },

        /**
         * Update sound button icon
         */
        updateSoundButton: function() {
            const soundBtn = this.container.querySelector('.video-ad-sound');
            if (!soundBtn) return;

            const icon = soundBtn.querySelector('i');
            if (!icon) return;

            if (this.isMuted) {
                icon.className = 'fa fa-volume-mute';
                soundBtn.classList.add('muted');
                soundBtn.title = 'Unmute';
            } else {
                icon.className = 'fa fa-volume-up';
                soundBtn.classList.remove('muted');
                soundBtn.title = 'Mute';
            }
        },

        /**
         * Handle window resize
         */
        handleResize: function() {
            // Hide on mobile/tablet
            if (window.innerWidth <= 1024) {
                this.container.style.display = 'none';
            } else {
                // Only show if not closed by user
                if (!this.isHidden) {
                    this.container.style.display = 'block';
                }
            }
        },

        /**
         * Animate entry of video ad
         */
        animateEntry: function() {
            // Delay entry animation slightly
            setTimeout(() => {
                this.container.classList.add('animate-in');
            }, 500);
        },

        /**
         * Video event handlers
         */
        onVideoPlay: function() {
            console.log('Video ad playing');
        },

        onVideoPause: function() {
            console.log('Video ad paused');
        },

        onVideoEnded: function() {
            console.log('Video ad ended');

            // Reset to beginning
            if (this.player) {
                this.player.currentTime = 0;
            }

            // Could automatically minimize or close after video ends
            // this.minimize();
        },

        onVideoError: function(error) {
            console.error('Video ad error:', error);

            // Show placeholder
            const placeholder = this.container.querySelector('.video-ad-placeholder');
            if (placeholder) {
                placeholder.classList.remove('hidden');
                placeholder.querySelector('.video-ad-placeholder-text').textContent =
                    'Unable to load video ad';
            }
        },

        /**
         * Get current state
         */
        getState: function() {
            return {
                isMinimized: this.isMinimized,
                isHidden: this.isHidden,
                isMuted: this.isMuted,
                isPlaying: this.player && !this.player.paused,
                currentTime: this.player ? this.player.currentTime : 0
            };
        }
    };

    // Export to window
    window.VideoAdController = VideoAdController;

    // Auto-initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            VideoAdController.init();
        });
    } else {
        VideoAdController.init();
    }

})(window, document);

/**
 * Example Usage:
 *
 * // Load a video ad
 * VideoAdController.loadVideo('path/to/video.mp4', {
 *     sponsor: 'Sponsor Name',
 *     sponsorUrl: 'https://example.com',
 *     duration: '0:30',
 *     autoplay: true
 * });
 *
 * // Programmatically control
 * VideoAdController.minimize();
 * VideoAdController.restore();
 * VideoAdController.close();
 * VideoAdController.show();
 * VideoAdController.toggleSound();
 *
 * // Get current state
 * const state = VideoAdController.getState();
 */
