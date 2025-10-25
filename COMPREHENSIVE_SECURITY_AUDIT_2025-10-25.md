# Comprehensive Web Security Audit & Remediation Plan
**JamWatHQ Production Website**
**Date:** 2025-10-25
**Scope:** All 9 HTML files in Release Version
**Backup:** `Backups/security-review-20251025`

---

## Executive Summary

This audit analyzed all 9 HTML files for security vulnerabilities across input handling, output encoding, CSP compliance, inline scripts, form security, secrets exposure, and dependency integrity.

**Critical Findings:**
- **21 inline script tags** across 7 files (blocks CSP implementation)
- **0 CSP headers** currently deployed
- **Multiple forms** without CSRF protection
- **OAuth credentials** referenced in frontend code
- **XSS risks** in user-generated content display
- **No SRI** on CDN dependencies

**Remediation Strategy:**
- Create dedicated external JS modules for each HTML (8 new files)
- Implement CSP headers (strict-dynamic + nonce-based)
- Add CSRF tokens to all forms
- Move OAuth to backend-only
- Implement output encoding for all dynamic content
- Add SRI to all CDN resources

---

## File-by-File Analysis

### 1. about.html

**Current Status:**
- **Inline Scripts:** 3 script tags
- **Forms:** 0
- **External Dependencies:** jQuery, Font Awesome CDN
- **User Input:** None
- **Dynamic Content:** None

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline scripts block CSP | HIGH | 3 inline script tags prevent `script-src 'self'` policy |
| Missing SRI on CDN resources | MEDIUM | Font Awesome CDN lacks integrity checks |
| No security headers referenced | MEDIUM | No CSP, X-Frame-Options, or X-Content-Type-Options |

**Inline Script Analysis:**

**Script 1 (Header/Navigation Enhancement):**
```javascript
// Current location: <script> tag after <nav>
// Function: Enhances dropdown functionality, mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const dropdowns = document.querySelectorAll('.dropdown');
    // ... 45 lines of navigation logic
});
```

**Script 2 (TOS Banner Integration):**
```javascript
// Current location: <script> tag in <body>
// Function: Initializes TOS banner on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.TOSBanner !== 'undefined') {
        window.TOSBanner.init();
    }
});
```

**Script 3 (Profile Hub Integration):**
```javascript
// Current location: <script> tag in <body>
// Function: Initializes profile hub functionality
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.ProfileHub !== 'undefined') {
        window.ProfileHub.init();
    }
});
```

**Root Cause:**
- Legacy development pattern (inline scripts for quick prototyping)
- No CSP policy enforced during development
- Navigation logic not modularized

**Remediation Plan:**

**Step 1: Create External Module**
- **File:** `/scripts/page-about.js`
- **Purpose:** Consolidate all about.html-specific initialization logic

```javascript
// /scripts/page-about.js
'use strict';

/**
 * About Page Initialization Module
 * Handles navigation, TOS banner, and profile hub for about.html
 */
(function() {
    // Navigation enhancement logic (moved from Script 1)
    function initNavigation() {
        const nav = document.querySelector('nav');
        const dropdowns = document.querySelectorAll('.dropdown');
        // ... existing navigation logic
    }

    // TOS Banner initialization (moved from Script 2)
    function initTOSBanner() {
        if (typeof window.TOSBanner !== 'undefined') {
            window.TOSBanner.init();
        }
    }

    // Profile Hub initialization (moved from Script 3)
    function initProfileHub() {
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    }

    // Page initialization
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initTOSBanner();
        initProfileHub();
    });
})();
```

**Step 2: Update about.html**
```diff
<!-- Remove inline scripts -->
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    const nav = document.querySelector('nav');
-    // ... navigation logic
-});
-</script>
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    if (typeof window.TOSBanner !== 'undefined') {
-        window.TOSBanner.init();
-    }
-});
-</script>
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    if (typeof window.ProfileHub !== 'undefined') {
-        window.ProfileHub.init();
-    }
-});
-</script>

<!-- Add external script reference -->
+<script src="scripts/page-about.js" defer></script>
```

**Step 3: Add SRI to CDN Resources**
```diff
-<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
+<link rel="stylesheet"
+      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
+      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
+      crossorigin="anonymous"
+      referrerpolicy="no-referrer">
```

**Step 4: Add CSP Meta Tag (Interim Solution)**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://cdnjs.cloudflare.com;
               style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self' https://cdnjs.cloudflare.com;
               connect-src 'self' https://jamwathq.com;">
```

**Testing Checklist:**
- [ ] Navigation dropdown functionality works
- [ ] Mobile menu toggle works
- [ ] TOS banner displays and functions
- [ ] Profile hub initializes correctly
- [ ] No console errors
- [ ] CSP violations check (browser console)
- [ ] External script loads successfully

---

### 2. agencies.html

**Current Status:**
- **Inline Scripts:** 3 script tags
- **Forms:** 1 (agency filtering/search)
- **External Dependencies:** jQuery, native-ads.js, agencies.js, auth-client.js
- **User Input:** Search/filter inputs, agency review forms
- **Dynamic Content:** Agency listings, review submissions, filtered layouts

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline scripts block CSP | HIGH | 3 inline script tags prevent strict CSP |
| Form lacks CSRF protection | HIGH | Agency search/filter form vulnerable to CSRF |
| User input not sanitized | HIGH | Agency search terms may contain XSS payloads |
| Review display uses innerHTML | CRITICAL | User-submitted reviews rendered without encoding |
| No rate limiting on API calls | MEDIUM | Agency filter API calls not throttled |
| Missing SRI on CDN resources | MEDIUM | jQuery CDN lacks integrity checks |

**Inline Script Analysis:**

**Script 1 (Native Ads Initialization):**
```javascript
// Current location: <script> tag before </body>
// Function: Initializes native ad system
document.addEventListener('DOMContentLoaded', function() {
    if (typeof NativeAds !== 'undefined') {
        NativeAds.init({
            container: '.agency-list-wrapper',
            adFrequency: 10,
            adType: 'agency-card'
        });
    }
});
```

**Script 2 (Agency Filtering Initialization):**
```javascript
// Current location: <script> tag before </body>
// Function: Initializes agency filtering and search
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('agency-filter-form');
    const searchInput = document.getElementById('agency-search');

    // Filter handler - SECURITY ISSUE: No input sanitization
    filterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value; // Raw user input
        const response = await fetch(`/api/agencies/search?q=${searchTerm}`);
        const agencies = await response.json();
        displayAgencies(agencies); // Uses innerHTML - XSS risk
    });
});
```

**Script 3 (Profile Hub Integration):**
```javascript
// Current location: <script> tag before </body>
// Function: Initializes profile hub
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.ProfileHub !== 'undefined') {
        window.ProfileHub.init();
    }
});
```

**Root Cause:**
- No input validation/sanitization on search terms
- Using innerHTML to render user-generated content (reviews, agency data)
- No CSRF tokens on forms
- Legacy inline script pattern

**Remediation Plan:**

**Step 1: Create External Module**
- **File:** `/scripts/page-agencies.js`
- **Purpose:** Secure agencies page initialization with input sanitization

```javascript
// /scripts/page-agencies.js
'use strict';

/**
 * Agencies Page Initialization Module
 * Handles native ads, agency filtering, and profile hub
 * SECURITY: Implements input sanitization and output encoding
 */
(function() {
    // Input sanitization utility
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Safe HTML rendering (avoids innerHTML with user data)
    function renderAgencySafe(agency) {
        const card = document.createElement('div');
        card.className = 'agency-card';

        const title = document.createElement('h3');
        title.textContent = agency.name; // textContent auto-escapes

        const description = document.createElement('p');
        description.textContent = agency.description;

        card.appendChild(title);
        card.appendChild(description);

        return card;
    }

    // Native ads initialization
    function initNativeAds() {
        if (typeof NativeAds !== 'undefined') {
            NativeAds.init({
                container: '.agency-list-wrapper',
                adFrequency: 10,
                adType: 'agency-card'
            });
        }
    }

    // Agency filtering with security controls
    function initAgencyFiltering() {
        const filterForm = document.getElementById('agency-filter-form');
        const searchInput = document.getElementById('agency-search');

        if (!filterForm || !searchInput) return;

        // Add CSRF token to form
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

        filterForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Sanitize input
            const rawSearchTerm = searchInput.value;
            const sanitizedTerm = sanitizeInput(rawSearchTerm);

            // Validate length
            if (sanitizedTerm.length > 100) {
                console.error('Search term too long');
                return;
            }

            try {
                const response = await fetch('/api/agencies/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ q: sanitizedTerm })
                });

                if (!response.ok) throw new Error('Search failed');

                const agencies = await response.json();

                // Safe rendering
                const container = document.querySelector('.agency-list-wrapper');
                container.innerHTML = ''; // Clear existing
                agencies.forEach(agency => {
                    const card = renderAgencySafe(agency);
                    container.appendChild(card);
                });

            } catch (error) {
                console.error('Agency search error:', error);
                // Display user-friendly error message
            }
        });
    }

    // Profile hub initialization
    function initProfileHub() {
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    }

    // Page initialization
    document.addEventListener('DOMContentLoaded', function() {
        initNativeAds();
        initAgencyFiltering();
        initProfileHub();
    });
})();
```

**Step 2: Update agencies.html**
```diff
<!-- Add CSRF meta tag in <head> -->
+<meta name="csrf-token" content="{{ csrf_token }}">

<!-- Add CSP meta tag -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self' https://cdnjs.cloudflare.com;
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data: https:;
+               connect-src 'self' https://jamwathq.com;">

<!-- Remove all inline scripts -->
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    if (typeof NativeAds !== 'undefined') {
-        NativeAds.init({...});
-    }
-});
-</script>
-[... remove other inline scripts ...]

<!-- Add external script reference -->
+<script src="scripts/page-agencies.js" defer></script>

<!-- Update jQuery with SRI -->
-<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
+<script src="https://code.jquery.com/jquery-3.6.0.min.js"
+        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
+        crossorigin="anonymous"></script>
```

**Step 3: Backend Updates Required**

Create CSRF middleware in backend:
```javascript
// backend/middleware/csrf.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

module.exports = csrfProtection;
```

Update agencies search endpoint:
```javascript
// backend/routes/agencies.js
const csrfProtection = require('../middleware/csrf');

// Change GET to POST for search
router.post('/api/agencies/search', csrfProtection, async (req, res) => {
    const { q } = req.body;

    // Server-side input validation
    if (!q || typeof q !== 'string' || q.length > 100) {
        return res.status(400).json({ error: 'Invalid search term' });
    }

    // Server-side sanitization
    const sanitized = q.replace(/[<>\"']/g, '');

    // Query database with sanitized input
    const agencies = await Agency.find({
        name: { $regex: sanitized, $options: 'i' }
    }).limit(50);

    res.json(agencies);
});
```

**Step 4: agencies.js Updates (Existing File)**

Review and update existing agencies.js for security:
```diff
// In displayAgencies function
function displayAgencies(agencies) {
-    let html = '';
-    agencies.forEach(agency => {
-        html += `<div class="agency-card">
-                    <h3>${agency.name}</h3>
-                    <p>${agency.description}</p>
-                 </div>`;
-    });
-    container.innerHTML = html; // XSS vulnerability

+    // Use safe DOM manipulation
+    agencies.forEach(agency => {
+        const card = document.createElement('div');
+        card.className = 'agency-card';
+
+        const title = document.createElement('h3');
+        title.textContent = agency.name; // Auto-escapes
+
+        const desc = document.createElement('p');
+        desc.textContent = agency.description;
+
+        card.appendChild(title);
+        card.appendChild(desc);
+        container.appendChild(card);
+    });
}
```

**Testing Checklist:**
- [ ] Agency search works with sanitized input
- [ ] XSS test: Search for `<script>alert('XSS')</script>` - should be escaped
- [ ] CSRF token present in form
- [ ] Native ads display correctly
- [ ] Profile hub initializes
- [ ] No console errors
- [ ] CSP violations check
- [ ] Review rendering doesn't execute user scripts
- [ ] Rate limiting test (multiple rapid searches)

---

### 3. faq.html

**Current Status:**
- **Inline Scripts:** 4 script tags
- **Forms:** 0
- **External Dependencies:** jQuery, Font Awesome
- **User Input:** None
- **Dynamic Content:** FAQ accordion/expand functionality

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline scripts block CSP | HIGH | 4 inline script tags prevent strict CSP |
| Missing SRI on CDN resources | MEDIUM | CDN resources lack integrity checks |
| No security headers | MEDIUM | No CSP, X-Frame-Options configured |

**Inline Script Analysis:**

**Script 1 (FAQ Accordion Logic):**
```javascript
// Current location: <script> tag in <body>
// Function: Handles FAQ expand/collapse
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', function() {
            const isOpen = item.classList.contains('open');

            // Close all other FAQs
            faqItems.forEach(i => i.classList.remove('open'));

            // Toggle current FAQ
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
});
```

**Script 2 (Navigation Enhancement):**
```javascript
// Current location: <script> tag in <body>
// Function: Navigation dropdown logic (duplicate from about.html)
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const dropdowns = document.querySelectorAll('.dropdown');
    // ... navigation logic
});
```

**Script 3 (TOS Banner Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.TOSBanner !== 'undefined') {
        window.TOSBanner.init();
    }
});
```

**Script 4 (Profile Hub Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoads', function() {
    if (typeof window.ProfileHub !== 'undefined') {
        window.ProfileHub.init();
    }
});
```

**Root Cause:**
- FAQ-specific logic embedded inline
- Duplicate navigation logic across multiple pages
- No modularization of common initialization code

**Remediation Plan:**

**Step 1: Create Shared Navigation Module**
- **File:** `/scripts/shared-navigation.js`
- **Purpose:** DRY principle - single source for navigation logic

```javascript
// /scripts/shared-navigation.js
'use strict';

/**
 * Shared Navigation Module
 * Used across all pages for consistent navigation behavior
 */
window.SharedNavigation = (function() {
    function init() {
        const nav = document.querySelector('nav');
        const dropdowns = document.querySelectorAll('.dropdown');

        if (!nav || dropdowns.length === 0) return;

        // Dropdown hover/click logic
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');

            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });

            // Close on outside click
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = nav.querySelector('.mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                nav.classList.toggle('mobile-active');
            });
        }
    }

    return { init };
})();
```

**Step 2: Create FAQ-Specific Module**
- **File:** `/scripts/page-faq.js`
- **Purpose:** FAQ accordion logic and page initialization

```javascript
// /scripts/page-faq.js
'use strict';

/**
 * FAQ Page Initialization Module
 * Handles accordion, navigation, TOS, and profile hub
 */
(function() {
    // FAQ accordion logic
    function initFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');

        if (faqItems.length === 0) return;

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (!question || !answer) return;

            question.addEventListener('click', function() {
                const isOpen = item.classList.contains('open');

                // Close all other FAQs (accordion behavior)
                faqItems.forEach(i => i.classList.remove('open'));

                // Toggle current FAQ
                if (!isOpen) {
                    item.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    }

    // TOS banner initialization
    function initTOSBanner() {
        if (typeof window.TOSBanner !== 'undefined') {
            window.TOSBanner.init();
        }
    }

    // Profile hub initialization
    function initProfileHub() {
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    }

    // Page initialization
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.SharedNavigation !== 'undefined') {
            window.SharedNavigation.init();
        }
        initFAQAccordion();
        initTOSBanner();
        initProfileHub();
    });
})();
```

**Step 3: Update faq.html**
```diff
<!-- Add CSP meta tag in <head> -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self' https://cdnjs.cloudflare.com;
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data: https:;
+               font-src 'self' https://cdnjs.cloudflare.com;
+               connect-src 'self' https://jamwathq.com;">

<!-- Update CDN with SRI -->
-<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
+<link rel="stylesheet"
+      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
+      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
+      crossorigin="anonymous"
+      referrerpolicy="no-referrer">

<!-- Remove all inline scripts -->
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    const faqItems = document.querySelectorAll('.faq-item');
-    // ... FAQ logic
-});
-</script>
-[... remove other 3 inline scripts ...]

<!-- Add external script references -->
+<script src="scripts/shared-navigation.js" defer></script>
+<script src="scripts/page-faq.js" defer></script>
```

**Testing Checklist:**
- [ ] FAQ accordion expands on click
- [ ] Only one FAQ open at a time (accordion behavior)
- [ ] Navigation dropdowns work
- [ ] Mobile menu toggle works
- [ ] TOS banner displays
- [ ] Profile hub initializes
- [ ] No console errors
- [ ] CSP violations check
- [ ] Smooth animation on FAQ expand/collapse

---

### 4. guide.html

**Current Status:**
- **Inline Scripts:** 4 script tags
- **Forms:** 0
- **External Dependencies:** jQuery, Font Awesome
- **User Input:** None (read-only guide content)
- **Dynamic Content:** Table of contents navigation, section anchors

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline scripts block CSP | HIGH | 4 inline script tags prevent strict CSP |
| Anchor-based navigation vulnerable to XSS | MEDIUM | URL hash not sanitized before DOM manipulation |
| Missing SRI on CDN resources | MEDIUM | CDN lacks integrity checks |

**Inline Script Analysis:**

**Script 1 (Table of Contents Generation):**
```javascript
// Current location: <script> tag in <body>
// Function: Auto-generates TOC from h2 headings
document.addEventListener('DOMContentLoaded', function() {
    const tocContainer = document.getElementById('table-of-contents');
    const headings = document.querySelectorAll('h2[id]');

    let tocHTML = '<ul>';
    headings.forEach(heading => {
        const id = heading.id; // SECURITY ISSUE: No sanitization
        const text = heading.textContent;
        tocHTML += `<li><a href="#${id}">${text}</a></li>`; // XSS if id is malicious
    });
    tocHTML += '</ul>';

    tocContainer.innerHTML = tocHTML; // innerHTML with potential XSS
});
```

**Script 2 (Smooth Scroll to Anchors):**
```javascript
// Current location: <script> tag in <body>
// Function: Smooth scroll on TOC link click
document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('#table-of-contents a');

    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1); // SECURITY ISSUE
            const target = document.getElementById(targetId);

            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
```

**Script 3 (TOS Banner Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.TOSBanner !== 'undefined') {
        window.TOSBanner.init();
    }
});
```

**Script 4 (Profile Hub Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.ProfileHub !== 'undefined') {
        window.ProfileHub.init();
    }
});
```

**Root Cause:**
- Dynamic HTML generation using innerHTML with unsanitized IDs
- URL hash values used directly without validation
- No consideration for malicious anchor IDs

**Remediation Plan:**

**Step 1: Create Guide-Specific Module**
- **File:** `/scripts/page-guide.js`
- **Purpose:** Secure TOC generation and smooth scroll with input validation

```javascript
// /scripts/page-guide.js
'use strict';

/**
 * Guide Page Initialization Module
 * Handles TOC generation, smooth scroll, and page initialization
 * SECURITY: Validates anchor IDs and uses safe DOM manipulation
 */
(function() {
    // Validate anchor ID (alphanumeric and hyphens only)
    function isValidAnchorId(id) {
        return /^[a-zA-Z0-9\-_]+$/.test(id);
    }

    // Safe TOC generation (no innerHTML with user data)
    function generateTableOfContents() {
        const tocContainer = document.getElementById('table-of-contents');
        const headings = document.querySelectorAll('h2[id]');

        if (!tocContainer || headings.length === 0) return;

        const ul = document.createElement('ul');

        headings.forEach(heading => {
            const id = heading.id;

            // Validate ID before using
            if (!isValidAnchorId(id)) {
                console.warn(`Invalid heading ID: ${id}`);
                return;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent; // textContent auto-escapes

            li.appendChild(a);
            ul.appendChild(li);
        });

        tocContainer.appendChild(ul);
    }

    // Smooth scroll with security validation
    function initSmoothScroll() {
        const tocContainer = document.getElementById('table-of-contents');

        if (!tocContainer) return;

        tocContainer.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();

                const href = e.target.getAttribute('href');
                if (!href || !href.startsWith('#')) return;

                const targetId = href.substring(1);

                // Validate target ID
                if (!isValidAnchorId(targetId)) {
                    console.warn(`Invalid anchor ID: ${targetId}`);
                    return;
                }

                const target = document.getElementById(targetId);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update URL hash safely
                    history.pushState(null, '', `#${targetId}`);
                }
            }
        });
    }

    // Handle direct navigation via URL hash
    function handleUrlHash() {
        const hash = window.location.hash;

        if (!hash) return;

        const targetId = hash.substring(1);

        // Validate hash
        if (!isValidAnchorId(targetId)) {
            console.warn(`Invalid URL hash: ${targetId}`);
            return;
        }

        const target = document.getElementById(targetId);

        if (target) {
            // Small delay to ensure page is rendered
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    // TOS banner initialization
    function initTOSBanner() {
        if (typeof window.TOSBanner !== 'undefined') {
            window.TOSBanner.init();
        }
    }

    // Profile hub initialization
    function initProfileHub() {
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    }

    // Page initialization
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.SharedNavigation !== 'undefined') {
            window.SharedNavigation.init();
        }
        generateTableOfContents();
        initSmoothScroll();
        handleUrlHash();
        initTOSBanner();
        initProfileHub();
    });
})();
```

**Step 2: Update guide.html**
```diff
<!-- Add CSP meta tag in <head> -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self' https://cdnjs.cloudflare.com;
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data: https:;
+               font-src 'self' https://cdnjs.cloudflare.com;
+               connect-src 'self' https://jamwathq.com;">

<!-- Remove all inline scripts -->
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    const tocContainer = document.getElementById('table-of-contents');
-    // ... TOC generation logic
-});
-</script>
-[... remove other 3 inline scripts ...]

<!-- Add external script references -->
+<script src="scripts/shared-navigation.js" defer></script>
+<script src="scripts/page-guide.js" defer></script>
```

**Step 3: Review H2 IDs in guide.html**

Ensure all h2 IDs follow safe naming convention:
```html
<!-- Good examples -->
<h2 id="getting-started">Getting Started</h2>
<h2 id="account-setup">Account Setup</h2>
<h2 id="writing-reviews">Writing Reviews</h2>

<!-- Avoid special characters, spaces, or user-generated IDs -->
```

**Testing Checklist:**
- [ ] Table of contents generates correctly
- [ ] TOC links scroll smoothly to sections
- [ ] URL hash navigation works (e.g., /guide.html#getting-started)
- [ ] Invalid hash values don't break page
- [ ] XSS test: Try navigating to /guide.html#<script>alert('XSS')</script>
- [ ] Navigation works
- [ ] TOS banner displays
- [ ] Profile hub initializes
- [ ] No console errors
- [ ] CSP violations check

---

### 5. index.html

**Current Status:**
- **Inline Scripts:** 0 ✅ (Already compliant!)
- **Forms:** 0
- **External Dependencies:** jQuery, Font Awesome, main.js, auth-client.js
- **User Input:** None (landing page)
- **Dynamic Content:** Hero section, featured agencies

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Missing SRI on CDN resources | MEDIUM | jQuery and Font Awesome lack integrity checks |
| No CSP meta tag | MEDIUM | No Content Security Policy defined |
| External scripts not using defer | LOW | Scripts may block rendering |

**Root Cause:**
- index.html is already well-structured with external scripts
- Lacks CSP and SRI implementation
- No input/output security concerns (static landing page)

**Remediation Plan:**

**Step 1: Add Security Headers**
```diff
<!-- Add CSP meta tag in <head> -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self' https://code.jquery.com https://cdnjs.cloudflare.com;
+               style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
+               img-src 'self' data: https:;
+               font-src 'self' https://cdnjs.cloudflare.com;
+               connect-src 'self' https://jamwathq.com;">

+<meta http-equiv="X-Frame-Options" content="DENY">
+<meta http-equiv="X-Content-Type-Options" content="nosniff">
+<meta name="referrer" content="no-referrer-when-downgrade">
```

**Step 2: Add SRI to CDN Resources**
```diff
<!-- Update jQuery -->
-<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
+<script src="https://code.jquery.com/jquery-3.6.0.min.js"
+        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
+        crossorigin="anonymous"
+        defer></script>

<!-- Update Font Awesome -->
-<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
+<link rel="stylesheet"
+      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
+      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
+      crossorigin="anonymous"
+      referrerpolicy="no-referrer">
```

**Step 3: Add defer to Local Scripts**
```diff
-<script src="scripts/main.js"></script>
-<script src="scripts/auth-client.js"></script>
+<script src="scripts/main.js" defer></script>
+<script src="scripts/auth-client.js" defer></script>
```

**Testing Checklist:**
- [ ] Page loads correctly
- [ ] Hero section displays
- [ ] Featured agencies render
- [ ] Navigation works
- [ ] Authentication flow works (if implemented)
- [ ] No console errors
- [ ] CSP violations check
- [ ] SRI validation passes

---

### 6. news.html

**Current Status:**
- **Inline Scripts:** 3 script tags
- **Forms:** 0
- **External Dependencies:** jQuery, Font Awesome
- **User Input:** None (news article display)
- **Dynamic Content:** News articles, timestamps

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline scripts block CSP | HIGH | 3 inline script tags prevent strict CSP |
| Date rendering may expose timezone | LOW | Client-side date formatting reveals user location |
| Missing SRI on CDN resources | MEDIUM | CDN lacks integrity checks |

**Inline Script Analysis:**

**Script 1 (News Article Rendering):**
```javascript
// Current location: <script> tag in <body>
// Function: Renders news articles with timestamps
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/news');
        const articles = await response.json();

        const container = document.getElementById('news-container');

        articles.forEach(article => {
            const articleHTML = `
                <article class="news-article">
                    <h3>${article.title}</h3>
                    <p class="date">${new Date(article.date).toLocaleDateString()}</p>
                    <p>${article.content}</p>
                </article>
            `; // SECURITY ISSUE: innerHTML with server data
            container.innerHTML += articleHTML;
        });
    } catch (error) {
        console.error('Failed to load news:', error);
    }
});
```

**Script 2 (TOS Banner Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.TOSBanner !== 'undefined') {
        window.TOSBanner.init();
    }
});
```

**Script 3 (Profile Hub Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.ProfileHub !== 'undefined') {
        window.ProfileHub.init();
    }
});
```

**Root Cause:**
- Using innerHTML to render server-provided news content (even trusted server data should use safe DOM methods)
- No sanitization layer between API and display
- Inline scripts prevent CSP

**Remediation Plan:**

**Step 1: Create News-Specific Module**
- **File:** `/scripts/page-news.js`
- **Purpose:** Secure news article rendering with safe DOM manipulation

```javascript
// /scripts/page-news.js
'use strict';

/**
 * News Page Initialization Module
 * Handles news article fetching and rendering
 * SECURITY: Uses safe DOM manipulation even for trusted server data
 */
(function() {
    // Safe article rendering
    function renderArticle(article) {
        const articleElement = document.createElement('article');
        articleElement.className = 'news-article';

        // Title
        const title = document.createElement('h3');
        title.textContent = article.title; // textContent auto-escapes

        // Date
        const dateP = document.createElement('p');
        dateP.className = 'date';
        try {
            const dateObj = new Date(article.date);
            dateP.textContent = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            dateP.textContent = 'Date unavailable';
        }

        // Content
        const content = document.createElement('p');
        content.textContent = article.content;

        // Assemble article
        articleElement.appendChild(title);
        articleElement.appendChild(dateP);
        articleElement.appendChild(content);

        return articleElement;
    }

    // Fetch and display news articles
    async function loadNewsArticles() {
        const container = document.getElementById('news-container');

        if (!container) return;

        try {
            const response = await fetch('/api/news', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const articles = await response.json();

            // Validate response structure
            if (!Array.isArray(articles)) {
                throw new Error('Invalid response format');
            }

            // Clear container
            container.innerHTML = '';

            // Render each article safely
            articles.forEach(article => {
                if (article && article.title && article.content) {
                    const articleElement = renderArticle(article);
                    container.appendChild(articleElement);
                }
            });

        } catch (error) {
            console.error('Failed to load news:', error);
            container.textContent = 'Unable to load news articles. Please try again later.';
        }
    }

    // TOS banner initialization
    function initTOSBanner() {
        if (typeof window.TOSBanner !== 'undefined') {
            window.TOSBanner.init();
        }
    }

    // Profile hub initialization
    function initProfileHub() {
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    }

    // Page initialization
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.SharedNavigation !== 'undefined') {
            window.SharedNavigation.init();
        }
        loadNewsArticles();
        initTOSBanner();
        initProfileHub();
    });
})();
```

**Step 2: Update news.html**
```diff
<!-- Add CSP meta tag in <head> -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self' https://cdnjs.cloudflare.com;
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data: https:;
+               font-src 'self' https://cdnjs.cloudflare.com;
+               connect-src 'self' https://jamwathq.com;">

<!-- Remove all inline scripts -->
-<script>
-document.addEventListener('DOMContentLoaded', async function() {
-    // ... news loading logic
-});
-</script>
-[... remove other 2 inline scripts ...]

<!-- Add external script references -->
+<script src="scripts/shared-navigation.js" defer></script>
+<script src="scripts/page-news.js" defer></script>
```

**Step 3: Backend Validation (Optional Enhancement)**

Add server-side sanitization for news content:
```javascript
// backend/routes/news.js
router.get('/api/news', async (req, res) => {
    try {
        const articles = await News.find()
            .sort({ date: -1 })
            .limit(20);

        // Server-side sanitization (defense in depth)
        const sanitized = articles.map(article => ({
            title: article.title.substring(0, 200),
            content: article.content.substring(0, 2000),
            date: article.date.toISOString()
        }));

        res.json(sanitized);
    } catch (error) {
        console.error('News fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});
```

**Testing Checklist:**
- [ ] News articles load and display correctly
- [ ] Dates format properly
- [ ] XSS test: Create news article with `<script>` tags - should be escaped
- [ ] Navigation works
- [ ] TOS banner displays
- [ ] Profile hub initializes
- [ ] Error handling displays user-friendly message
- [ ] No console errors
- [ ] CSP violations check

---

### 7. report-problem.html

**Current Status:**
- **Inline Scripts:** 1 script tag
- **Forms:** 1 (problem report submission)
- **External Dependencies:** jQuery, report-problem.js
- **User Input:** HIGH (text area, email, description fields)
- **Dynamic Content:** Form submission, validation messages

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline script blocks CSP | HIGH | 1 inline script tag prevents strict CSP |
| Form lacks CSRF protection | CRITICAL | Report submission vulnerable to CSRF attacks |
| No input validation | HIGH | User inputs not validated client-side |
| No rate limiting | MEDIUM | Form can be spammed |
| Email field not validated | MEDIUM | Could accept malformed emails |
| Text area unlimited length | MEDIUM | Could accept extremely long inputs |

**Inline Script Analysis:**

**Script 1 (Form Initialization):**
```javascript
// Current location: <script> tag in <body>
// Function: Initializes report form
document.addEventListener('DOMContentLoaded', function() {
    if (typeof ReportProblem !== 'undefined') {
        ReportProblem.init();
    }
});
```

**Root Cause:**
- Simple initialization inline (easily moved to external file)
- Main security issues are in the form itself and backend validation

**Remediation Plan:**

**Step 1: Update Existing report-problem.js**

The existing [report-problem.js](scripts/report-problem.js) file needs security enhancements:

```javascript
// /scripts/report-problem.js
'use strict';

/**
 * Report Problem Module
 * Handles problem report form submission with security controls
 * SECURITY: Input validation, CSRF protection, rate limiting
 */
window.ReportProblem = (function() {
    let submissionCount = 0;
    const MAX_SUBMISSIONS = 3;
    const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms

    // Input sanitization utility
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Email validation
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) && email.length <= 254;
    }

    // Check rate limit
    function checkRateLimit() {
        const lastReset = localStorage.getItem('reportProblem_lastReset');
        const currentTime = Date.now();

        // Reset counter if window expired
        if (!lastReset || (currentTime - parseInt(lastReset)) > RATE_LIMIT_WINDOW) {
            submissionCount = 0;
            localStorage.setItem('reportProblem_lastReset', currentTime.toString());
            return true;
        }

        // Check submission count
        const stored = localStorage.getItem('reportProblem_count');
        submissionCount = stored ? parseInt(stored) : 0;

        return submissionCount < MAX_SUBMISSIONS;
    }

    // Increment submission count
    function incrementSubmissionCount() {
        submissionCount++;
        localStorage.setItem('reportProblem_count', submissionCount.toString());
    }

    // Display validation error
    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;

        // Remove existing error
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();

        field.parentElement.appendChild(errorDiv);
        field.classList.add('invalid');
    }

    // Clear validation error
    function clearError(field) {
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
        field.classList.remove('invalid');
    }

    // Validate form
    function validateForm(formData) {
        let isValid = true;
        const form = document.getElementById('report-problem-form');

        // Validate email
        const emailField = form.querySelector('[name="email"]');
        const email = formData.get('email');
        if (!email || !isValidEmail(email)) {
            showError(emailField, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailField);
        }

        // Validate problem description
        const descField = form.querySelector('[name="description"]');
        const description = formData.get('description');
        if (!description || description.trim().length < 10) {
            showError(descField, 'Please provide a description (at least 10 characters)');
            isValid = false;
        } else if (description.length > 2000) {
            showError(descField, 'Description too long (max 2000 characters)');
            isValid = false;
        } else {
            clearError(descField);
        }

        return isValid;
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusDiv = document.getElementById('submission-status');

        // Check rate limit
        if (!checkRateLimit()) {
            statusDiv.textContent = `Too many submissions. Please try again later.`;
            statusDiv.className = 'status-error';
            return;
        }

        // Get form data
        const formData = new FormData(form);

        // Validate
        if (!validateForm(formData)) {
            return;
        }

        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        if (!csrfToken) {
            console.error('CSRF token not found');
            statusDiv.textContent = 'Security error. Please refresh the page.';
            statusDiv.className = 'status-error';
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const response = await fetch('/api/report-problem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    email: sanitizeInput(formData.get('email')),
                    description: sanitizeInput(formData.get('description')),
                    page: window.location.pathname
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            // Success
            statusDiv.textContent = 'Thank you! Your report has been submitted.';
            statusDiv.className = 'status-success';
            form.reset();
            incrementSubmissionCount();

        } catch (error) {
            console.error('Submission error:', error);
            statusDiv.textContent = 'Failed to submit report. Please try again.';
            statusDiv.className = 'status-error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Report';
        }
    }

    // Initialize
    function init() {
        const form = document.getElementById('report-problem-form');
        if (!form) return;

        form.addEventListener('submit', handleSubmit);

        // Real-time validation
        const emailField = form.querySelector('[name="email"]');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    showError(this, 'Invalid email address');
                } else {
                    clearError(this);
                }
            });
        }

        // Character counter for description
        const descField = form.querySelector('[name="description"]');
        if (descField) {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            descField.parentElement.appendChild(counter);

            descField.addEventListener('input', function() {
                const length = this.value.length;
                counter.textContent = `${length} / 2000 characters`;

                if (length > 2000) {
                    counter.classList.add('over-limit');
                } else {
                    counter.classList.remove('over-limit');
                }
            });
        }
    }

    return { init };
})();
```

**Step 2: Create Page-Specific Module**
- **File:** `/scripts/page-report-problem.js`
- **Purpose:** Initialize report-problem page

```javascript
// /scripts/page-report-problem.js
'use strict';

/**
 * Report Problem Page Initialization
 * Handles initialization of report form and common page elements
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize shared navigation
        if (typeof window.SharedNavigation !== 'undefined') {
            window.SharedNavigation.init();
        }

        // Initialize report problem form
        if (typeof window.ReportProblem !== 'undefined') {
            window.ReportProblem.init();
        }

        // Initialize TOS banner
        if (typeof window.TOSBanner !== 'undefined') {
            window.TOSBanner.init();
        }

        // Initialize profile hub
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    });
})();
```

**Step 3: Update report-problem.html**
```diff
<!-- Add CSRF meta tag in <head> -->
+<meta name="csrf-token" content="{{ csrf_token }}">

<!-- Add CSP meta tag -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self';
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data:;
+               connect-src 'self' https://jamwathq.com;">

<!-- Remove inline script -->
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    if (typeof ReportProblem !== 'undefined') {
-        ReportProblem.init();
-    }
-});
-</script>

<!-- Add external script references -->
+<script src="scripts/shared-navigation.js" defer></script>
+<script src="scripts/report-problem.js" defer></script>
+<script src="scripts/page-report-problem.js" defer></script>

<!-- Add submission status container if not present -->
+<div id="submission-status"></div>
```

**Step 4: Backend Updates Required**

Create secure backend endpoint:
```javascript
// backend/routes/reportProblem.js
const express = require('express');
const router = express.Router();
const csrfProtection = require('../middleware/csrf');
const rateLimit = require('express-rate-limit');

// Rate limiter: 3 requests per hour per IP
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many reports. Please try again later.' }
});

// Input validation
function validateReportInput(data) {
    const errors = [];

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email) || data.email.length > 254) {
        errors.push('Invalid email address');
    }

    // Validate description
    if (!data.description || data.description.trim().length < 10) {
        errors.push('Description too short');
    }
    if (data.description && data.description.length > 2000) {
        errors.push('Description too long');
    }

    return errors;
}

router.post('/api/report-problem', csrfProtection, reportLimiter, async (req, res) => {
    try {
        const { email, description, page } = req.body;

        // Validate input
        const validationErrors = validateReportInput({ email, description });
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
        }

        // Server-side sanitization
        const sanitizedData = {
            email: email.trim().toLowerCase(),
            description: description.trim().substring(0, 2000),
            page: page || 'unknown',
            timestamp: new Date(),
            ip: req.ip
        };

        // Save to database (implement based on your DB)
        // await ProblemReport.create(sanitizedData);

        // Send email notification to admins
        // await sendAdminNotification(sanitizedData);

        res.json({ success: true, message: 'Report submitted successfully' });

    } catch (error) {
        console.error('Report submission error:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

module.exports = router;
```

**Step 5: Add CSS for Validation Styles**
```css
/* Add to /styles/report-problem.css */
.field-error {
    color: #d32f2f;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

input.invalid,
textarea.invalid {
    border-color: #d32f2f;
}

.char-counter {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
}

.char-counter.over-limit {
    color: #d32f2f;
    font-weight: bold;
}

.status-success {
    padding: 1rem;
    background: #4caf50;
    color: white;
    border-radius: 4px;
    margin-top: 1rem;
}

.status-error {
    padding: 1rem;
    background: #d32f2f;
    color: white;
    border-radius: 4px;
    margin-top: 1rem;
}
```

**Testing Checklist:**
- [ ] Form validates email format
- [ ] Form validates description length (10-2000 chars)
- [ ] Character counter displays correctly
- [ ] CSRF token sent with submission
- [ ] Rate limiting works (test 4 submissions in 1 hour)
- [ ] XSS test: Submit `<script>alert('XSS')</script>` - should be escaped
- [ ] SQL injection test: Submit `'; DROP TABLE users; --` - should be sanitized
- [ ] Submission success message displays
- [ ] Submission error handling works
- [ ] No console errors
- [ ] CSP violations check

---

### 8. share-experience.html

**Current Status:**
- **Inline Scripts:** 0 ✅ (Already compliant!)
- **Forms:** 1 (review submission form)
- **External Dependencies:** share-experience-page.js, auth-client.js, tos-modal.js
- **User Input:** CRITICAL (review text, rating, agency selection)
- **Dynamic Content:** Review submissions, user ratings

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Form lacks CSRF protection | CRITICAL | Review submission vulnerable to CSRF |
| User review content not sanitized | CRITICAL | XSS risk in review display |
| No rate limiting on reviews | HIGH | Users can spam reviews |
| Agency selection not validated | HIGH | Could submit reviews for non-existent agencies |
| Rating not validated client-side | MEDIUM | Could submit invalid rating values |
| Missing SRI on external scripts | MEDIUM | Script integrity not verified |

**Root Cause:**
- share-experience.html already uses external scripts (good!)
- Security issues are in [share-experience-page.js](scripts/share-experience-page.js) and backend validation

**Remediation Plan:**

**Step 1: Review and Update share-experience-page.js**

The existing file needs security enhancements. Key changes needed:

```javascript
// /scripts/share-experience-page.js
// ADD these security functions at the top:

'use strict';

// Input sanitization
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Rating validation
function isValidRating(rating) {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
}

// Agency ID validation
function isValidAgencyId(id) {
    // MongoDB ObjectId format or your custom format
    return /^[a-f\d]{24}$/i.test(id);
}

// UPDATE the form submission handler:
async function handleReviewSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!csrfToken) {
        showError('Security error. Please refresh the page.');
        return;
    }

    // Get form data
    const formData = new FormData(form);
    const agencyId = formData.get('agencyId');
    const rating = formData.get('rating');
    const reviewText = formData.get('reviewText');

    // Client-side validation
    if (!agencyId || !isValidAgencyId(agencyId)) {
        showError('Invalid agency selection');
        return;
    }

    if (!rating || !isValidRating(rating)) {
        showError('Please select a rating (1-5 stars)');
        return;
    }

    if (!reviewText || reviewText.trim().length < 20) {
        showError('Review must be at least 20 characters');
        return;
    }

    if (reviewText.length > 2000) {
        showError('Review too long (max 2000 characters)');
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch('/api/reviews/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                agencyId: sanitizeInput(agencyId),
                rating: parseInt(rating),
                reviewText: sanitizeInput(reviewText),
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Submission failed');
        }

        const result = await response.json();

        // Success
        showSuccess('Thank you! Your review has been submitted.');
        form.reset();

    } catch (error) {
        console.error('Review submission error:', error);
        showError(error.message || 'Failed to submit review. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
    }
}
```

**Step 2: Update share-experience.html**
```diff
<!-- Add CSRF meta tag in <head> -->
+<meta name="csrf-token" content="{{ csrf_token }}">

<!-- Add CSP meta tag -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self';
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data: https:;
+               connect-src 'self' https://jamwathq.com;">

<!-- Add validation attributes to form fields -->
<form id="review-form">
-    <select name="agencyId">
+    <select name="agencyId" required>
        <option value="">Select Agency</option>
        <!-- ... options -->
    </select>

-    <input type="number" name="rating" min="1" max="5">
+    <input type="number" name="rating" min="1" max="5" required>

-    <textarea name="reviewText"></textarea>
+    <textarea name="reviewText"
+              minlength="20"
+              maxlength="2000"
+              required></textarea>
+
+    <div class="char-counter">0 / 2000 characters</div>
</form>
```

**Step 3: Backend Security Updates**

Update backend review submission endpoint:
```javascript
// backend/routes/reviews.js
const csrfProtection = require('../middleware/csrf');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiter: 5 reviews per hour per user
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many reviews. Please try again later.' }
});

// Input validation middleware
const validateReview = [
    body('agencyId')
        .isMongoId()
        .withMessage('Invalid agency ID'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be 1-5'),
    body('reviewText')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Review must be 20-2000 characters')
        .escape() // Server-side sanitization
];

router.post('/api/reviews/submit',
    csrfProtection,
    reviewLimiter,
    validateReview,
    async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg
            });
        }

        const { agencyId, rating, reviewText } = req.body;

        // Verify agency exists
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }

        // Check if user already reviewed this agency
        const userId = req.user?.id || req.session?.userId;
        if (userId) {
            const existingReview = await Review.findOne({
                userId,
                agencyId
            });
            if (existingReview) {
                return res.status(400).json({
                    error: 'You have already reviewed this agency'
                });
            }
        }

        // Create review
        const review = await Review.create({
            agencyId,
            userId,
            rating,
            reviewText,
            timestamp: new Date(),
            ip: req.ip,
            verified: false // Admin verification required
        });

        res.json({
            success: true,
            reviewId: review._id
        });

    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

module.exports = router;
```

**Step 4: Review Display Security**

Ensure reviews are displayed safely:
```javascript
// In any file that displays reviews (agencies.js, share-experience-page.js)
function displayReview(review) {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-card';

    // Rating stars
    const rating = document.createElement('div');
    rating.className = 'rating';
    rating.textContent = '⭐'.repeat(review.rating);

    // Review text (textContent auto-escapes)
    const text = document.createElement('p');
    text.textContent = review.reviewText; // SAFE - no innerHTML

    // Timestamp
    const date = document.createElement('span');
    date.className = 'review-date';
    date.textContent = new Date(review.timestamp).toLocaleDateString();

    reviewElement.appendChild(rating);
    reviewElement.appendChild(text);
    reviewElement.appendChild(date);

    return reviewElement;
}
```

**Testing Checklist:**
- [ ] Form validates all required fields
- [ ] CSRF token sent with submission
- [ ] Rating validation works (1-5 only)
- [ ] Review length validation works (20-2000 chars)
- [ ] Character counter displays correctly
- [ ] Rate limiting works (test 6 submissions in 1 hour)
- [ ] XSS test: Submit review with `<script>alert('XSS')</script>` - should be escaped in display
- [ ] SQL injection test: Submit review with SQL commands - should be sanitized
- [ ] Duplicate review prevention works
- [ ] Invalid agency ID rejected
- [ ] Review display doesn't execute user scripts
- [ ] No console errors
- [ ] CSP violations check

---

### 9. tos.html

**Current Status:**
- **Inline Scripts:** 3 script tags
- **Forms:** 0
- **External Dependencies:** jQuery, Font Awesome
- **User Input:** None (static legal content)
- **Dynamic Content:** None

**Security Findings:**

| Finding | Severity | Issue |
|---------|----------|-------|
| Inline scripts block CSP | HIGH | 3 inline script tags prevent strict CSP |
| Missing SRI on CDN resources | MEDIUM | CDN lacks integrity checks |
| Legal content not versioned | LOW | TOS updates not tracked with timestamps |

**Inline Script Analysis:**

**Script 1 (Navigation Enhancement):**
```javascript
// Current location: <script> tag in <body>
// Function: Navigation dropdown logic (duplicate from other pages)
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    // ... navigation logic
});
```

**Script 2 (TOS Banner Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.TOSBanner !== 'undefined') {
        window.TOSBanner.init();
    }
});
```

**Script 3 (Profile Hub Integration):**
```javascript
// Current location: <script> tag in <body>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.ProfileHub !== 'undefined') {
        window.ProfileHub.init();
    }
});
```

**Root Cause:**
- Duplicate navigation logic across pages
- Simple initialization code inline (easily externalized)

**Remediation Plan:**

**Step 1: Create TOS-Specific Module**
- **File:** `/scripts/page-tos.js`
- **Purpose:** TOS page initialization

```javascript
// /scripts/page-tos.js
'use strict';

/**
 * Terms of Service Page Initialization
 * Handles navigation and common page elements
 */
(function() {
    // Display TOS version and last updated date
    function displayTOSMetadata() {
        const versionElement = document.getElementById('tos-version');
        const dateElement = document.getElementById('tos-date');

        if (versionElement) {
            // Could fetch from API or read from meta tag
            const version = document.querySelector('meta[name="tos-version"]')?.content || '1.0';
            versionElement.textContent = `Version ${version}`;
        }

        if (dateElement) {
            const date = document.querySelector('meta[name="tos-date"]')?.content;
            if (date) {
                const dateObj = new Date(date);
                dateElement.textContent = `Last Updated: ${dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}`;
            }
        }
    }

    // TOS banner initialization
    function initTOSBanner() {
        if (typeof window.TOSBanner !== 'undefined') {
            window.TOSBanner.init();
        }
    }

    // Profile hub initialization
    function initProfileHub() {
        if (typeof window.ProfileHub !== 'undefined') {
            window.ProfileHub.init();
        }
    }

    // Page initialization
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.SharedNavigation !== 'undefined') {
            window.SharedNavigation.init();
        }
        displayTOSMetadata();
        initTOSBanner();
        initProfileHub();
    });
})();
```

**Step 2: Update tos.html**
```diff
<!-- Add TOS metadata in <head> -->
+<meta name="tos-version" content="1.0">
+<meta name="tos-date" content="2025-01-15">

<!-- Add CSP meta tag -->
+<meta http-equiv="Content-Security-Policy"
+      content="default-src 'self';
+               script-src 'self' https://cdnjs.cloudflare.com;
+               style-src 'self' 'unsafe-inline';
+               img-src 'self' data:;
+               font-src 'self' https://cdnjs.cloudflare.com;
+               connect-src 'self';">

<!-- Add version display in content -->
+<div class="tos-metadata">
+    <span id="tos-version"></span>
+    <span id="tos-date"></span>
+</div>

<!-- Remove all inline scripts -->
-<script>
-document.addEventListener('DOMContentLoaded', function() {
-    const nav = document.querySelector('nav');
-    // ... navigation logic
-});
-</script>
-[... remove other 2 inline scripts ...]

<!-- Add external script references -->
+<script src="scripts/shared-navigation.js" defer></script>
+<script src="scripts/page-tos.js" defer></script>
```

**Step 3: Add CSS for TOS Metadata**
```css
/* Add to existing stylesheet or create /styles/tos.css */
.tos-metadata {
    font-size: 0.875rem;
    color: #666;
    padding: 1rem 0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 2rem;
}

.tos-metadata span {
    margin-right: 1rem;
}
```

**Testing Checklist:**
- [ ] TOS content displays correctly
- [ ] Version and date display correctly
- [ ] Navigation works
- [ ] TOS banner displays
- [ ] Profile hub initializes
- [ ] No console errors
- [ ] CSP violations check
- [ ] Page prints correctly (for legal archival)

---

## Summary of New Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `/scripts/shared-navigation.js` | DRY - Single navigation module for all pages | HIGH |
| `/scripts/page-about.js` | about.html initialization | HIGH |
| `/scripts/page-agencies.js` | agencies.html secure filtering/search | CRITICAL |
| `/scripts/page-faq.js` | FAQ accordion logic | HIGH |
| `/scripts/page-guide.js` | Guide TOC and smooth scroll | HIGH |
| `/scripts/page-news.js` | News article secure rendering | HIGH |
| `/scripts/page-report-problem.js` | Report form initialization | HIGH |
| `/scripts/page-tos.js` | TOS page initialization | MEDIUM |
| `backend/middleware/csrf.js` | CSRF protection middleware | CRITICAL |
| `backend/routes/reportProblem.js` | Report problem backend | CRITICAL |

**Note:** `share-experience-page.js` and `report-problem.js` already exist and need updates, not creation.

---

## Backend Security Requirements

### 1. Install Required Dependencies
```bash
npm install csurf express-rate-limit express-validator helmet
```

### 2. Update server.js with Security Middleware

```javascript
// backend/server.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://code.jquery.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://jamwathq.com"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP'
});

app.use(globalLimiter);

// Cookie parser (required for CSRF)
app.use(cookieParser());

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Add CSRF token to all page renders
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
    next();
});
```

### 3. Database Model Security

Ensure Review model includes security fields:
```javascript
// backend/models/Review.js
const reviewSchema = new Schema({
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 2000
    },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String }, // For abuse tracking
    verified: { type: Boolean, default: false }, // Admin verification
    reported: { type: Boolean, default: false }
});

// Index for preventing duplicate reviews
reviewSchema.index({ userId: 1, agencyId: 1 }, { unique: true });
```

---

## CSP Implementation Strategy

### Phase 1: Meta Tag CSP (Interim - Implemented in This Plan)
- Add CSP meta tags to all HTML files
- Allows testing without server configuration changes
- Limitations: Cannot use `report-uri`, less strict than header-based CSP

### Phase 2: Server Header CSP (Production)
- Move CSP to server headers (Helmet middleware)
- Implement CSP reporting endpoint
- Enable `upgrade-insecure-requests`
- Use `strict-dynamic` for better security

```javascript
// Production CSP (backend/server.js)
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'strict-dynamic'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Required for existing styles
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'"],
        reportUri: "/api/csp-report"
    }
}));

// CSP violation reporting endpoint
app.post('/api/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
    console.log('CSP Violation:', req.body);
    // Log to database for monitoring
    res.status(204).end();
});
```

---

## Testing Strategy

### Per-File Testing
Each HTML file remediation should follow this test sequence:

1. **Functional Testing**
   - All features work as before
   - No JavaScript errors in console
   - Forms submit correctly
   - Dynamic content loads

2. **Security Testing**
   - XSS test: Input `<script>alert('XSS')</script>` in all input fields
   - CSRF test: Submit form without CSRF token (should fail)
   - Rate limiting test: Exceed rate limits (should block)
   - Input validation test: Submit invalid data (should reject)

3. **CSP Testing**
   - Check browser console for CSP violations
   - Verify no inline script errors
   - Verify external scripts load with SRI

4. **Performance Testing**
   - Page load time comparison (before/after)
   - Lighthouse audit score
   - Core Web Vitals check

### Automated Testing Script

Create test script to validate all pages:
```javascript
// scripts/security-test.js
const pages = [
    'about.html',
    'agencies.html',
    'faq.html',
    'guide.html',
    'index.html',
    'news.html',
    'report-problem.html',
    'share-experience.html',
    'tos.html'
];

async function testPage(page) {
    console.log(`Testing ${page}...`);

    // Check for inline scripts
    const response = await fetch(`/${page}`);
    const html = await response.text();
    const inlineScripts = (html.match(/<script(?![^>]*src=)[^>]*>/g) || []).length;

    if (inlineScripts > 0) {
        console.error(`❌ ${page}: Found ${inlineScripts} inline script(s)`);
    } else {
        console.log(`✅ ${page}: No inline scripts`);
    }

    // Check for CSP meta tag
    if (html.includes('Content-Security-Policy')) {
        console.log(`✅ ${page}: CSP meta tag present`);
    } else {
        console.error(`❌ ${page}: CSP meta tag missing`);
    }

    // Check for SRI on CDN resources
    const cdnLinksWithoutSRI = (html.match(/https:\/\/cdnjs\.cloudflare\.com[^>]*(?!integrity=)/g) || []).length;
    if (cdnLinksWithoutSRI > 0) {
        console.warn(`⚠️  ${page}: ${cdnLinksWithoutSRI} CDN resource(s) without SRI`);
    }
}

pages.forEach(testPage);
```

---

## Implementation Priority

### Critical Priority (Implement First)
1. **agencies.html** - Has form with user input, XSS risks, CSRF vulnerability
2. **share-experience.html** - Critical user review submission, XSS/CSRF risks
3. **report-problem.html** - User input form, CSRF vulnerability
4. **Backend CSRF middleware** - Required for all form security

### High Priority (Implement Second)
5. **shared-navigation.js** - DRY principle, used by all pages
6. **about.html** - Common entry point
7. **faq.html** - Common user destination
8. **guide.html** - Anchor-based XSS risk
9. **news.html** - Dynamic content rendering

### Medium Priority (Implement Third)
10. **index.html** - Already mostly compliant, just needs SRI/CSP
11. **tos.html** - Static content, low risk

---

## Rollback Plan

If security updates cause issues:

### Per-File Rollback
```bash
# Restore from backup
cp "Backups/security-review-20251025/[filename]" "[destination]"

# Example:
cp "Backups/security-review-20251025/agencies.html" "frontend/agencies.html"
```

### Full Rollback
```bash
# Restore all HTML files
cp -r "Backups/security-review-20251025/"* "./"

# Remove new external JS files
rm scripts/page-*.js
rm scripts/shared-navigation.js

# Restart server
npm restart
```

---

## Post-Implementation Checklist

After implementing all remediation plans:

- [ ] All 9 HTML files have zero inline scripts
- [ ] All HTML files have CSP meta tags
- [ ] All CDN resources have SRI hashes
- [ ] All forms have CSRF protection
- [ ] All user inputs validated client and server-side
- [ ] All dynamic content rendered safely (no innerHTML with user data)
- [ ] Rate limiting implemented on all forms
- [ ] Backend validation matches frontend validation
- [ ] All external JS files created and tested
- [ ] shared-navigation.js eliminates code duplication
- [ ] Browser console shows zero CSP violations
- [ ] Browser console shows zero JavaScript errors
- [ ] All functional tests pass
- [ ] All security tests pass
- [ ] Lighthouse audit score maintained or improved
- [ ] Documentation updated

---

## Future Enhancements

### After Initial Implementation

1. **Migrate to Server Header CSP**
   - Remove meta tag CSP
   - Implement helmet CSP headers
   - Add CSP reporting endpoint
   - Monitor CSP violations

2. **Implement SRI Automation**
   - Create build script to auto-generate SRI hashes
   - Implement CDN fallback (if CDN fails, load from self)

3. **Add Security Monitoring**
   - Implement CSP violation logging
   - Monitor rate limiting blocks
   - Track CSRF token failures
   - Alert on suspicious patterns

4. **Enhance Input Validation**
   - Add profanity filter for reviews
   - Implement sentiment analysis
   - Add spam detection
   - Implement CAPTCHA for high-risk forms

5. **Implement OAuth Security**
   - Rotate OAuth credentials (already planned)
   - Implement OAuth state parameter validation
   - Add OAuth scope restrictions

---

## Approval Required

**This document serves as the comprehensive security audit and remediation plan for all 9 HTML files.**

**User Approval Points:**
1. ✅ Overall strategy (external JS files, CSP, CSRF, input sanitization)
2. ✅ File-by-file remediation plans
3. ✅ Backend security requirements
4. ✅ Testing strategy
5. ✅ Implementation priority order

**Next Steps:**
Upon user approval, implementation will proceed in test repository:
1. Create all new external JS files
2. Update all HTML files (remove inline scripts, add CSP)
3. Implement backend CSRF middleware
4. Add SRI to all CDN resources
5. Test each page individually
6. Deploy to test.jamwathq.test.git
7. Conduct comprehensive security testing
8. Upon successful testing, deploy to production

---

**End of Comprehensive Security Audit Document**
