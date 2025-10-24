/**
 * Report a Problem Form Handler
 * Version: 1.0 | Created: 2025-10-18 | Author: Dwayne Wright
 * Purpose: Form validation, auto-detection, and submission handling
 * Dependencies: None (vanilla JavaScript)
 */

'use strict';

(function() {
    // ========================================
    // CONFIGURATION
    // ========================================

    const CONFIG = {
        maxDescriptionLength: 2000,
        maxStepsLength: 1000,
        submitEndpoint: '/api/report-problem', // Backend endpoint (to be implemented)
        autoSaveInterval: 30000 // Auto-save draft every 30 seconds
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================

    const elements = {
        form: null,
        categorySelect: null,
        referenceIdInput: null,
        pageUrlInput: null,
        descriptionTextarea: null,
        stepsTextarea: null,
        browserInfoInput: null,
        contactEmailInput: null,
        charCount: null,
        submitButton: null,
        resetButton: null,
        successMessage: null,
        submitAnotherButton: null
    };

    // ========================================
    // INITIALIZATION
    // ========================================

    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupForm);
        } else {
            setupForm();
        }
    }

    function setupForm() {
        // Get all DOM elements
        elements.form = document.getElementById('report-problem-form');
        elements.categorySelect = document.getElementById('problem-category');
        elements.referenceIdInput = document.getElementById('reference-id');
        elements.pageUrlInput = document.getElementById('page-url');
        elements.descriptionTextarea = document.getElementById('problem-description');
        elements.stepsTextarea = document.getElementById('steps-to-reproduce');
        elements.browserInfoInput = document.getElementById('browser-info');
        elements.contactEmailInput = document.getElementById('contact-email');
        elements.charCount = document.getElementById('char-count');
        elements.submitButton = elements.form?.querySelector('.btn-submit');
        elements.resetButton = elements.form?.querySelector('.btn-reset');
        elements.successMessage = document.getElementById('success-message');
        elements.submitAnotherButton = document.getElementById('submit-another');

        if (!elements.form) {
            console.warn('Report problem form not found on this page');
            return;
        }

        // Auto-detect and populate fields
        autoDetectEnvironment();

        // Set up event listeners
        setupEventListeners();

        // Load draft from localStorage
        loadDraft();

        // Set up auto-save
        startAutoSave();

        console.log('Report Problem form initialized');
    }

    // ========================================
    // AUTO-DETECTION
    // ========================================

    function autoDetectEnvironment() {
        // Detect and populate page URL
        if (elements.pageUrlInput) {
            // Check for URL parameter first (e.g., ?from=page.html)
            const urlParams = new URLSearchParams(window.location.search);
            const fromParam = urlParams.get('from') || urlParams.get('page');

            let pageUrl = '';

            if (fromParam) {
                // URL parameter takes precedence
                pageUrl = fromParam;
            } else if (document.referrer && !document.referrer.includes('report-problem.html')) {
                // Use referrer if it exists and is not the report page itself
                pageUrl = document.referrer;
            }

            // Only set value if we have a valid URL
            if (pageUrl) {
                elements.pageUrlInput.value = pageUrl;
            }

            console.log('Auto-detected page URL:', pageUrl || 'No referrer detected - user can enter manually');
        }

        // Detect and populate browser/device info
        if (elements.browserInfoInput) {
            const browserInfo = getBrowserInfo();
            elements.browserInfoInput.value = browserInfo;
        }

        // Check for reference ID in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const refId = urlParams.get('ref') || urlParams.get('refId');
        if (refId && elements.referenceIdInput) {
            elements.referenceIdInput.value = refId;
        }

        // Check for pre-selected category
        const category = urlParams.get('category');
        if (category && elements.categorySelect) {
            elements.categorySelect.value = category;
        }
    }

    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        let osName = 'Unknown';

        // Detect browser
        if (ua.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
            browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
        } else if (ua.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
            browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
        } else if (ua.indexOf('Safari') > -1) {
            browserName = 'Safari';
            browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
        } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
            browserName = 'Edge';
            browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
        }

        // Detect OS
        if (ua.indexOf('Win') > -1) osName = 'Windows';
        else if (ua.indexOf('Mac') > -1) osName = 'macOS';
        else if (ua.indexOf('Linux') > -1) osName = 'Linux';
        else if (ua.indexOf('Android') > -1) osName = 'Android';
        else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
            osName = 'iOS';
        }

        // Screen size
        const screenSize = `${window.screen.width}x${window.screen.height}`;
        const viewport = `${window.innerWidth}x${window.innerHeight}`;

        return `${browserName} ${browserVersion} on ${osName} | Screen: ${screenSize} | Viewport: ${viewport}`;
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    function setupEventListeners() {
        // Form submission
        if (elements.form) {
            elements.form.addEventListener('submit', handleSubmit);
        }

        // Form reset
        if (elements.resetButton) {
            elements.resetButton.addEventListener('click', handleReset);
        }

        // Character counter for description
        if (elements.descriptionTextarea && elements.charCount) {
            elements.descriptionTextarea.addEventListener('input', updateCharCount);
            updateCharCount(); // Initial count
        }

        // Submit another report button
        if (elements.submitAnotherButton) {
            elements.submitAnotherButton.addEventListener('click', handleSubmitAnother);
        }

        // Reference ID validation
        if (elements.referenceIdInput) {
            elements.referenceIdInput.addEventListener('blur', validateReferenceId);
        }

        // Email validation
        if (elements.contactEmailInput) {
            elements.contactEmailInput.addEventListener('blur', validateEmail);
        }

        // Category change - update placeholder text
        if (elements.categorySelect && elements.descriptionTextarea) {
            elements.categorySelect.addEventListener('change', updateDescriptionPlaceholder);
        }
    }

    // ========================================
    // FORM VALIDATION
    // ========================================

    function validateForm() {
        const errors = [];

        // Category is required
        if (!elements.categorySelect || !elements.categorySelect.value) {
            errors.push('Please select a problem category');
        }

        // Description is required
        if (!elements.descriptionTextarea || !elements.descriptionTextarea.value.trim()) {
            errors.push('Please provide a description of the problem');
        } else if (elements.descriptionTextarea.value.trim().length < 20) {
            errors.push('Description must be at least 20 characters');
        }

        // Reference ID format validation (if provided)
        if (elements.referenceIdInput && elements.referenceIdInput.value.trim()) {
            const refIdPattern = /^[A-Z]{3}-[A-Z0-9]{3,4}-[0-9]{3}$/;
            if (!refIdPattern.test(elements.referenceIdInput.value.trim())) {
                errors.push('Invalid Reference ID format (e.g., AGY-CIE-001)');
            }
        }

        // Email validation (if provided)
        if (elements.contactEmailInput && elements.contactEmailInput.value.trim()) {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(elements.contactEmailInput.value.trim())) {
                errors.push('Invalid email address format');
            }
        }

        return errors;
    }

    function validateReferenceId() {
        if (!elements.referenceIdInput || !elements.referenceIdInput.value.trim()) return;

        const refId = elements.referenceIdInput.value.trim().toUpperCase();
        const pattern = /^[A-Z]{3}-[A-Z0-9]{3,4}-[0-9]{3}$/;

        if (pattern.test(refId)) {
            elements.referenceIdInput.style.borderColor = '#4caf50';
            elements.referenceIdInput.value = refId; // Normalize to uppercase
        } else {
            elements.referenceIdInput.style.borderColor = '#ff4444';
        }
    }

    function validateEmail() {
        if (!elements.contactEmailInput || !elements.contactEmailInput.value.trim()) {
            elements.contactEmailInput.style.borderColor = '';
            return;
        }

        const email = elements.contactEmailInput.value.trim();
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (pattern.test(email)) {
            elements.contactEmailInput.style.borderColor = '#4caf50';
        } else {
            elements.contactEmailInput.style.borderColor = '#ff4444';
        }
    }

    // ========================================
    // FORM SUBMISSION
    // ========================================

    function handleSubmit(event) {
        event.preventDefault();

        // Validate form
        const errors = validateForm();
        if (errors.length > 0) {
            alert('Please fix the following errors:\n\n' + errors.join('\n'));
            return;
        }

        // Collect form data
        const formData = collectFormData();

        // Show loading state
        setSubmitButtonLoading(true);

        // Submit to backend (simulated for now)
        submitReport(formData)
            .then(response => {
                console.log('Report submitted successfully:', response);
                showSuccessMessage();
                clearDraft();
            })
            .catch(error => {
                console.error('Error submitting report:', error);
                alert('An error occurred while submitting your report. Please try again or contact support@jamwathq.com');
            })
            .finally(() => {
                setSubmitButtonLoading(false);
            });
    }

    function collectFormData() {
        return {
            category: elements.categorySelect?.value || '',
            referenceId: elements.referenceIdInput?.value.trim() || null,
            pageUrl: elements.pageUrlInput?.value || '',
            description: elements.descriptionTextarea?.value.trim() || '',
            stepsToReproduce: elements.stepsTextarea?.value.trim() || null,
            browserInfo: elements.browserInfoInput?.value || '',
            contactEmail: elements.contactEmailInput?.value.trim() || null,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }

    function submitReport(data) {
        // Simulated API call (replace with actual backend endpoint)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success
                console.log('Submitting report:', data);

                // Store in localStorage as fallback until backend is ready
                saveReportToLocalStorage(data);

                resolve({ success: true, reportId: generateReportId() });
            }, 1500);
        });
    }

    function saveReportToLocalStorage(data) {
        try {
            const reports = JSON.parse(localStorage.getItem('jamwat_problem_reports') || '[]');
            reports.push(data);
            localStorage.setItem('jamwat_problem_reports', JSON.stringify(reports));
            console.log('Report saved to localStorage (total:', reports.length + ')');
        } catch (e) {
            console.error('Failed to save report to localStorage:', e);
        }
    }

    function generateReportId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `RPT-${timestamp}-${random}`.toUpperCase();
    }

    // ========================================
    // UI UPDATES
    // ========================================

    function setSubmitButtonLoading(isLoading) {
        if (!elements.submitButton) return;

        if (isLoading) {
            elements.submitButton.disabled = true;
            elements.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            elements.submitButton.disabled = false;
            elements.submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
        }
    }

    function updateCharCount() {
        if (!elements.descriptionTextarea || !elements.charCount) return;

        const count = elements.descriptionTextarea.value.length;
        elements.charCount.textContent = count;

        // Visual feedback for character limit
        if (count > CONFIG.maxDescriptionLength * 0.9) {
            elements.charCount.style.color = '#ff4444';
        } else if (count > CONFIG.maxDescriptionLength * 0.7) {
            elements.charCount.style.color = '#ffa500';
        } else {
            elements.charCount.style.color = '#ffee00';
        }
    }

    function updateDescriptionPlaceholder() {
        if (!elements.categorySelect || !elements.descriptionTextarea) return;

        const category = elements.categorySelect.value;
        const placeholders = {
            'navigation': 'Example: I clicked on the "Agencies" link but it took me to the FAQ page instead...',
            'content': 'Example: The news article titled "..." has incorrect information about...',
            'design': 'Example: On mobile, the navigation menu overlaps the content when...',
            'performance': 'Example: The page takes more than 10 seconds to load when...',
            'review': 'Example: My review for [Agency Name] is not showing up, or contains errors...',
            'user-info': 'Example: My profile shows incorrect information for...',
            'account-deletion': 'Example: I would like to delete my account associated with email...',
            'accessibility': 'Example: Screen readers cannot access the...',
            'mobile': 'Example: On iPhone/Android, the buttons are too small to tap...',
            'authentication': 'Example: I cannot log in with Google/Facebook. The error message says...',
            'other': 'Please describe the issue you\'re experiencing in detail...'
        };

        elements.descriptionTextarea.placeholder = placeholders[category] || placeholders['other'];
    }

    function showSuccessMessage() {
        if (!elements.form || !elements.successMessage) return;

        // Hide form, show success message
        elements.form.style.display = 'none';
        elements.successMessage.style.display = 'block';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleSubmitAnother() {
        if (!elements.form || !elements.successMessage) return;

        // Reset and show form
        elements.form.reset();
        elements.form.style.display = 'block';
        elements.successMessage.style.display = 'none';

        // Re-populate auto-detected fields
        autoDetectEnvironment();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleReset(event) {
        if (!confirm('Are you sure you want to clear the form? All entered information will be lost.')) {
            event.preventDefault();
            return false;
        }

        clearDraft();

        // Re-populate auto-detected fields after reset
        setTimeout(() => {
            autoDetectEnvironment();
        }, 100);
    }

    // ========================================
    // DRAFT AUTO-SAVE
    // ========================================

    let autoSaveTimer = null;

    function startAutoSave() {
        if (autoSaveTimer) clearInterval(autoSaveTimer);

        autoSaveTimer = setInterval(() => {
            saveDraft();
        }, CONFIG.autoSaveInterval);
    }

    function saveDraft() {
        if (!elements.form) return;

        try {
            const draft = {
                category: elements.categorySelect?.value || '',
                referenceId: elements.referenceIdInput?.value || '',
                description: elements.descriptionTextarea?.value || '',
                stepsToReproduce: elements.stepsTextarea?.value || '',
                contactEmail: elements.contactEmailInput?.value || '',
                savedAt: new Date().toISOString()
            };

            // Only save if there's meaningful content
            if (draft.description.trim().length > 10) {
                localStorage.setItem('jamwat_report_draft', JSON.stringify(draft));
                console.log('Draft auto-saved');
            }
        } catch (e) {
            console.error('Failed to save draft:', e);
        }
    }

    function loadDraft() {
        try {
            const draftJson = localStorage.getItem('jamwat_report_draft');
            if (!draftJson) return;

            const draft = JSON.parse(draftJson);

            // Check if draft is recent (within 24 hours)
            const savedAt = new Date(draft.savedAt);
            const hoursSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);

            if (hoursSinceSave > 24) {
                clearDraft();
                return;
            }

            // Ask user if they want to restore draft
            if (confirm('We found a saved draft from ' + savedAt.toLocaleString() + '. Would you like to restore it?')) {
                if (elements.categorySelect && draft.category) elements.categorySelect.value = draft.category;
                if (elements.referenceIdInput && draft.referenceId) elements.referenceIdInput.value = draft.referenceId;
                if (elements.descriptionTextarea && draft.description) elements.descriptionTextarea.value = draft.description;
                if (elements.stepsTextarea && draft.stepsToReproduce) elements.stepsTextarea.value = draft.stepsToReproduce;
                if (elements.contactEmailInput && draft.contactEmail) elements.contactEmailInput.value = draft.contactEmail;

                updateCharCount();
                console.log('Draft restored');
            } else {
                clearDraft();
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
            clearDraft();
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem('jamwat_report_draft');
            console.log('Draft cleared');
        } catch (e) {
            console.error('Failed to clear draft:', e);
        }
    }

    // ========================================
    // START INITIALIZATION
    // ========================================

    init();

})();
