/**
 * DOM Security Helpers
 * Safe alternatives to innerHTML for dynamic content creation
 * Prevents XSS attacks by avoiding innerHTML where possible
 */

/**
 * Safely set text content (no HTML parsing)
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text content to set
 */
function setTextContent(element, text) {
    element.textContent = text;
}

/**
 * Create element with safe text content
 * @param {string} tagName - HTML tag name
 * @param {string} textContent - Text content
 * @param {Object} attributes - HTML attributes as key-value pairs
 * @returns {HTMLElement}
 */
function createElement(tagName, textContent = '', attributes = {}) {
    const element = document.createElement(tagName);
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    // Set attributes safely
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style') {
            // Handle style as object or string
            if (typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.style.cssText = value;
            }
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    }
    
    return element;
}

/**
 * Create a modal dialog safely without innerHTML
 * @param {Object} config - Modal configuration
 * @returns {HTMLElement}
 */
function createModal(config) {
    const {
        id = 'modal',
        title = '',
        content = '',
        closeButtonText = '×',
        buttons = []
    } = config;
    
    // Create modal container
    const modal = createElement('div', '', {
        id: id,
        className: 'modal',
        style: {
            display: 'none',
            position: 'fixed',
            zIndex: '10000',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center'
        }
    });
    
    // Create modal content container
    const modalContent = createElement('div', '', {
        className: 'modal-content',
        style: {
            backgroundColor: '#1a1a1a',
            margin: '0',
            padding: '30px',
            border: '3px solid #ffee00',
            width: '90%',
            maxWidth: '500px',
            borderRadius: '10px',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 10px 40px rgba(255, 238, 0, 0.4)',
            zIndex: '10001'
        }
    });
    
    // Create close button
    const closeButton = createElement('span', closeButtonText, {
        className: 'close-modal',
        title: 'Close',
        style: {
            color: '#ffee00',
            float: 'right',
            fontSize: '32px',
            fontWeight: 'bold',
            cursor: 'pointer',
            lineHeight: '20px'
        }
    });
    
    closeButton.onclick = () => {
        modal.style.display = 'none';
    };
    
    // Create title
    const titleElement = createElement('h2', title, {
        style: {
            color: '#ffee00',
            marginTop: '0',
            marginBottom: '0.5em',
            fontSize: '1.8em'
        }
    });
    
    // Create content paragraph
    const contentElement = createElement('p', content, {
        style: {
            color: '#ffffff',
            lineHeight: '1.6',
            marginBottom: '1em',
            fontSize: '1.1em'
        }
    });
    
    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(titleElement);
    modalContent.appendChild(contentElement);
    
    // Add custom buttons if provided
    buttons.forEach(btnConfig => {
        const button = createElement('button', btnConfig.text, {
            className: btnConfig.className || 'btn-standard',
            style: btnConfig.style || {}
        });
        
        if (btnConfig.onClick) {
            button.onclick = btnConfig.onClick;
        }
        
        modalContent.appendChild(button);
    });
    
    modal.appendChild(modalContent);
    
    // Close modal when clicking outside
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    return modal;
}

/**
 * Show existing modal
 * @param {string} modalId - Modal element ID
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Hide existing modal
 * @param {string} modalId - Modal element ID
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export functions for use in other scripts
window.DOMHelpers = {
    setTextContent,
    createElement,
    createModal,
    showModal,
    hideModal
};
