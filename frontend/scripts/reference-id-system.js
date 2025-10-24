/**
 * Reference ID System for JamWatHQ
 * Provides unique, human-readable reference IDs for all content cards
 * Format: {TYPE}-{CODE}-{NUMBER}
 *
 * PERMANENT ID SYSTEM:
 * - IDs are assigned once and stored in localStorage
 * - Content is identified by unique hash (title + metadata)
 * - Reordering content preserves existing IDs
 * - New content gets the next available sequential ID
 *
 * Examples:
 * - AGY-CIE-001 (Agency: CIEE, #001)
 * - NEWS-2025-042 (News: Year 2025, #042)
 * - GDE-VIS-003 (Guide: Visa topic, #003)
 * - FAQ-GEN-015 (FAQ: General category, #015)
 */

'use strict';

(function(window) {
    const ReferenceIDSystem = {
        // Storage keys for persistent ID mapping
        STORAGE_KEYS: {
            AGENCY: 'refid_agencies',
            NEWS: 'refid_news',
            GUIDE: 'refid_guides',
            FAQ: 'refid_faqs',
            COUNTERS: 'refid_counters'
        },
        /**
         * Creates a unique hash for content identification
         * @param {string} contentKey - Unique identifier for the content (title, name, etc.)
         * @returns {string} Hash string
         */
        createContentHash: function(contentKey) {
            // Simple hash function for content identification
            let hash = 0;
            const str = contentKey.trim().toLowerCase();
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(36);
        },

        /**
         * Load ID mappings from localStorage
         * @param {string} storageKey - Storage key for content type
         * @returns {object} ID mapping object
         */
        loadIDMapping: function(storageKey) {
            try {
                const stored = localStorage.getItem(storageKey);
                return stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.error('Failed to load ID mapping:', e);
                return {};
            }
        },

        /**
         * Save ID mappings to localStorage
         * @param {string} storageKey - Storage key for content type
         * @param {object} mapping - ID mapping object
         */
        saveIDMapping: function(storageKey, mapping) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(mapping));
            } catch (e) {
                console.error('Failed to save ID mapping:', e);
            }
        },

        /**
         * Load counters from localStorage
         * @returns {object} Counters object
         */
        loadCounters: function() {
            try {
                const stored = localStorage.getItem(this.STORAGE_KEYS.COUNTERS);
                return stored ? JSON.parse(stored) : {
                    agency: 0,
                    news: {},
                    guide: 0,
                    faq: 0
                };
            } catch (e) {
                console.error('Failed to load counters:', e);
                return { agency: 0, news: {}, guide: 0, faq: 0 };
            }
        },

        /**
         * Save counters to localStorage
         * @param {object} counters - Counters object
         */
        saveCounters: function(counters) {
            try {
                localStorage.setItem(this.STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
            } catch (e) {
                console.error('Failed to save counters:', e);
            }
        },

        /**
         * Get or assign permanent reference ID
         * @param {string} type - Type of content
         * @param {string} contentHash - Unique hash of content
         * @param {object} data - Data for ID generation
         * @returns {string} Reference ID
         */
        getOrAssignID: function(type, contentHash, data) {
            const storageKey = this.STORAGE_KEYS[type.toUpperCase()];
            const mapping = this.loadIDMapping(storageKey);

            // Check if this content already has an ID
            if (mapping[contentHash]) {
                return mapping[contentHash];
            }

            // Generate new ID
            const newID = this.generateNewID(type, data);

            // Store the mapping
            mapping[contentHash] = newID;
            this.saveIDMapping(storageKey, mapping);

            return newID;
        },

        /**
         * Generates a new reference ID with next sequential number
         * @param {string} type - Type of content
         * @param {object} data - Data for ID generation
         * @returns {string} New reference ID
         */
        generateNewID: function(type, data) {
            const counters = this.loadCounters();

            switch(type.toLowerCase()) {
                case 'agency':
                    counters.agency++;
                    this.saveCounters(counters);
                    return this.generateAgencyID(data, counters.agency);
                case 'news':
                    const year = data.year || new Date().getFullYear();
                    if (!counters.news[year]) {
                        counters.news[year] = 0;
                    }
                    counters.news[year]++;
                    this.saveCounters(counters);
                    return this.generateNewsID(data, counters.news[year]);
                case 'guide':
                    counters.guide++;
                    this.saveCounters(counters);
                    return this.generateGuideID(data, counters.guide);
                case 'faq':
                    counters.faq++;
                    this.saveCounters(counters);
                    return this.generateFAQID(data, counters.faq);
                default:
                    return 'UNK-000-000';
            }
        },

        /**
         * Generates agency reference ID
         * Format: AGY-{3-letter-code}-{number}
         */
        generateAgencyID: function(data, sequentialNumber) {
            const code = data.code || this.extractCode(data.name);
            const number = String(sequentialNumber || data.index || 1).padStart(3, '0');
            return `AGY-${code.toUpperCase()}-${number}`;
        },

        /**
         * Generates news reference ID
         * Format: NEWS-{YYYY}-{number}
         */
        generateNewsID: function(data, sequentialNumber) {
            const year = data.year || new Date().getFullYear();
            const number = String(sequentialNumber || data.index || 1).padStart(3, '0');
            return `NEWS-${year}-${number}`;
        },

        /**
         * Generates guide reference ID
         * Format: GDE-{topic-code}-{number}
         */
        generateGuideID: function(data, sequentialNumber) {
            const code = data.code || this.extractCode(data.topic || data.title);
            const number = String(sequentialNumber || data.index || 1).padStart(3, '0');
            return `GDE-${code.toUpperCase()}-${number}`;
        },

        /**
         * Generates FAQ reference ID
         * Format: FAQ-{category-code}-{number}
         */
        generateFAQID: function(data, sequentialNumber) {
            const code = data.code || this.extractCode(data.category || 'GENERAL');
            const number = String(sequentialNumber || data.index || 1).padStart(3, '0');
            return `FAQ-${code.toUpperCase()}-${number}`;
        },

        /**
         * Extracts a 3-letter code from a name/title
         * Uses first 3 consonants or first 3 letters
         */
        extractCode: function(text) {
            if (!text) return 'UNK';

            // Remove special characters and spaces
            const cleaned = text.replace(/[^a-zA-Z]/g, '');

            // Try to get first 3 consonants
            const consonants = cleaned.match(/[BCDFGHJKLMNPQRSTVWXYZ]/gi);
            if (consonants && consonants.length >= 3) {
                return consonants.slice(0, 3).join('');
            }

            // Fallback to first 3 letters
            return cleaned.slice(0, 3).toUpperCase() || 'UNK';
        },

        /**
         * Creates a visible reference ID badge
         * @param {string} refId - The reference ID
         * @param {string} position - Position of badge (top-right, bottom-right, etc.)
         * @returns {HTMLElement} Badge element
         */
        createBadge: function(refId, position = 'top-right') {
            const badge = document.createElement('div');
            badge.className = `ref-id-badge ref-id-${position}`;
            badge.setAttribute('data-ref-id', refId);
            badge.title = 'Click to copy Reference ID';

            const idSpan = document.createElement('span');
            idSpan.className = 'ref-id-text';
            idSpan.textContent = refId;

            const copyIcon = document.createElement('i');
            copyIcon.className = 'fa fa-copy ref-id-copy-icon';

            badge.appendChild(idSpan);
            badge.appendChild(copyIcon);

            // Add click to copy functionality
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(refId);
                this.showCopyFeedback(badge);
            });

            return badge;
        },

        /**
         * Copies text to clipboard
         */
        copyToClipboard: function(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).catch(err => {
                    console.error('Failed to copy:', err);
                    this.fallbackCopy(text);
                });
            } else {
                this.fallbackCopy(text);
            }
        },

        /**
         * Fallback copy method for older browsers
         */
        fallbackCopy: function(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            document.body.removeChild(textarea);
        },

        /**
         * Shows visual feedback when ID is copied
         */
        showCopyFeedback: function(badge) {
            const originalContent = badge.innerHTML;
            badge.classList.add('copied');
            badge.innerHTML = '<i class="fa fa-check"></i> Copied!';

            setTimeout(() => {
                badge.classList.remove('copied');
                badge.innerHTML = originalContent;
            }, 2000);
        },

        /**
         * Adds reference ID to an existing card element
         * Uses permanent ID system with localStorage
         * @param {HTMLElement} cardElement - The card element
         * @param {string} type - Type of content
         * @param {string} contentKey - Unique identifier (title, name, etc.)
         * @param {object} data - Data for ID generation
         * @param {string} position - Badge position
         */
        addToCard: function(cardElement, type, contentKey, data, position = 'top-right') {
            // Create hash for this content
            const contentHash = this.createContentHash(contentKey);

            // Get or assign permanent ID
            const refId = this.getOrAssignID(type, contentHash, data);

            // Store reference ID as data attribute
            cardElement.setAttribute('data-ref-id', refId);
            cardElement.setAttribute('data-content-hash', contentHash);

            // Create and append badge
            const badge = this.createBadge(refId, position);
            cardElement.style.position = 'relative'; // Ensure card is positioned
            cardElement.insertBefore(badge, cardElement.firstChild);

            return refId;
        },

        /**
         * Initializes reference IDs for all cards on the page
         */
        initializeAll: function() {
            this.initializeAgencies();
            this.initializeNews();
            this.initializeGuides();
            this.initializeFAQs();
        },

        /**
         * Initialize agency cards with reference IDs
         */
        initializeAgencies: function() {
            const agencyCards = document.querySelectorAll('.agency-wrapper, [id^="wrapper-"]');
            agencyCards.forEach((wrapper) => {
                const agencyCard = wrapper.querySelector('.agency-info');
                if (!agencyCard || agencyCard.hasAttribute('data-ref-id')) return;

                const agencyName = wrapper.querySelector('header h3')?.textContent || '';
                const agencyId = wrapper.id.replace('wrapper-', '');

                // Use agency name as unique content key
                this.addToCard(agencyCard, 'agency', agencyName, {
                    name: agencyName,
                    code: agencyId.slice(0, 3)
                }, 'top-right');
            });
        },

        /**
         * Initialize news cards with reference IDs
         */
        initializeNews: function() {
            const newsCards = document.querySelectorAll('.news-info');
            newsCards.forEach((card) => {
                if (card.hasAttribute('data-ref-id')) return;

                const title = card.querySelector('header h3')?.textContent?.trim() || '';
                const yearSection = Array.from(card.querySelectorAll('section')).find(section =>
                    section.textContent.toLowerCase().includes('year:')
                );
                const yearMatch = yearSection?.textContent.match(/\d{4}/);
                const year = yearMatch ? yearMatch[0] : new Date().getFullYear();

                // Use title + year as unique content key
                const contentKey = `${title}|${year}`;

                this.addToCard(card, 'news', contentKey, {
                    title: title,
                    year: year
                }, 'top-right');
            });
        },

        /**
         * Initialize guide cards with reference IDs
         */
        initializeGuides: function() {
            const guideCards = document.querySelectorAll('.guide-info, .guide-card, [class*="guide"]');
            guideCards.forEach((card) => {
                if (card.hasAttribute('data-ref-id')) return;

                const title = card.querySelector('h3, h2, h4')?.textContent?.trim() || '';
                const topic = card.getAttribute('data-topic') || title;

                // Use title as unique content key
                this.addToCard(card, 'guide', title, {
                    title: title,
                    topic: topic,
                    code: this.extractCode(topic)
                }, 'top-right');
            });
        },

        /**
         * Initialize FAQ cards with reference IDs
         */
        initializeFAQs: function() {
            const faqCards = document.querySelectorAll('.faq-info, .faq-item, .faq-card');
            faqCards.forEach((card) => {
                if (card.hasAttribute('data-ref-id')) return;

                const question = card.querySelector('h3, h4, .faq-question')?.textContent?.trim() || '';
                const category = card.getAttribute('data-category') || 'GENERAL';

                // Use question as unique content key
                this.addToCard(card, 'faq', question, {
                    question: question,
                    category: category,
                    code: this.extractCode(category)
                }, 'top-right');
            });
        },

        /**
         * Admin utility: Reset all reference IDs (use with caution)
         * This clears all stored ID mappings and counters
         */
        resetAllIDs: function() {
            if (confirm('WARNING: This will reset ALL reference IDs. This action cannot be undone. Continue?')) {
                localStorage.removeItem(this.STORAGE_KEYS.AGENCY);
                localStorage.removeItem(this.STORAGE_KEYS.NEWS);
                localStorage.removeItem(this.STORAGE_KEYS.GUIDE);
                localStorage.removeItem(this.STORAGE_KEYS.FAQ);
                localStorage.removeItem(this.STORAGE_KEYS.COUNTERS);
                console.log('All reference IDs have been reset.');
                location.reload();
            }
        },

        /**
         * Admin utility: Export reference ID mappings
         * Returns JSON of all current ID assignments
         */
        exportIDMappings: function() {
            return {
                agencies: this.loadIDMapping(this.STORAGE_KEYS.AGENCY),
                news: this.loadIDMapping(this.STORAGE_KEYS.NEWS),
                guides: this.loadIDMapping(this.STORAGE_KEYS.GUIDE),
                faqs: this.loadIDMapping(this.STORAGE_KEYS.FAQ),
                counters: this.loadCounters(),
                exportDate: new Date().toISOString()
            };
        },

        /**
         * Admin utility: View current reference ID statistics
         */
        getStats: function() {
            const counters = this.loadCounters();
            const agencies = Object.keys(this.loadIDMapping(this.STORAGE_KEYS.AGENCY)).length;
            const news = Object.keys(this.loadIDMapping(this.STORAGE_KEYS.NEWS)).length;
            const guides = Object.keys(this.loadIDMapping(this.STORAGE_KEYS.GUIDE)).length;
            const faqs = Object.keys(this.loadIDMapping(this.STORAGE_KEYS.FAQ)).length;

            console.log('=== Reference ID System Statistics ===');
            console.log(`Agencies: ${agencies} cards, next ID: AGY-XXX-${String(counters.agency + 1).padStart(3, '0')}`);
            console.log(`News: ${news} cards`);
            for (const [year, count] of Object.entries(counters.news)) {
                console.log(`  - ${year}: ${count} articles, next ID: NEWS-${year}-${String(count + 1).padStart(3, '0')}`);
            }
            console.log(`Guides: ${guides} cards, next ID: GDE-XXX-${String(counters.guide + 1).padStart(3, '0')}`);
            console.log(`FAQs: ${faqs} cards, next ID: FAQ-XXX-${String(counters.faq + 1).padStart(3, '0')}`);
            console.log('=====================================');

            return { agencies, news, guides, faqs, counters };
        }
    };

    // Export to window
    window.ReferenceIDSystem = ReferenceIDSystem;

    // Auto-initialize on DOM load if not already initialized
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ReferenceIDSystem.initializeAll();
        });
    } else {
        // DOM already loaded, initialize immediately
        ReferenceIDSystem.initializeAll();
    }

})(window);
