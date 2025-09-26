/**
 * 🚀 Universal Floating Alerts System
 * Replaces all alert() calls with beautiful floating notifications
 */

class FloatingAlerts {
    constructor() {
        this.init();
        this.overrideAlert();
    }

    init() {
        // Create alert container if it doesn't exist
        if (!document.querySelector('.alert-container')) {
            const container = document.createElement('div');
            container.className = 'alert-container';
            document.body.appendChild(container);
        }
    }

    /**
     * Show a floating alert
     * @param {string} message - The alert message
     * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
     * @param {string} title - Optional title
     * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
     */
    show(message, type = 'info', title = '', duration = 4000) {
        const container = document.querySelector('.alert-container');
        if (!container) return;

        // Create alert element
        const alert = document.createElement('div');
        alert.className = `floating-alert ${type}`;
        
        // Get appropriate icon
        const icon = this.getIcon(type);
        
        // Build alert HTML
        alert.innerHTML = `
            <div class="alert-icon">${icon}</div>
            <div class="alert-content">
                ${title ? `<div class="alert-title">${title}</div>` : ''}
                <div class="alert-message">${message}</div>
            </div>
            <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
            ${duration > 0 ? '<div class="alert-progress"></div>' : ''}
        `;

        // Add to container
        container.appendChild(alert);

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(alert);
            }, duration);
        }

        // Click to close
        alert.addEventListener('click', (e) => {
            if (e.target.classList.contains('alert-close')) {
                this.hide(alert);
            }
        });

        return alert;
    }

    hide(alert) {
        if (alert && alert.parentElement) {
            alert.classList.add('closing');
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 300);
        }
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Success shorthand
    success(message, title = 'Success!', duration = 4000) {
        return this.show(message, 'success', title, duration);
    }

    // Error shorthand
    error(message, title = 'Error!', duration = 5000) {
        return this.show(message, 'error', title, duration);
    }

    // Warning shorthand
    warning(message, title = 'Warning!', duration = 4000) {
        return this.show(message, 'warning', title, duration);
    }

    // Info shorthand
    info(message, title = '', duration = 4000) {
        return this.show(message, 'info', title, duration);
    }

    // Override the native alert function
    overrideAlert() {
        // Store original alert
        window.originalAlert = window.alert;
        
        // Replace alert with floating version
        window.alert = (message) => {
            // Determine type based on message content
            let type = 'info';
            let title = 'Alert';
            
            if (message.toLowerCase().includes('success') || 
                message.toLowerCase().includes('added') ||
                message.toLowerCase().includes('updated') ||
                message.toLowerCase().includes('uploaded') ||
                message.toLowerCase().includes('submitted') ||
                message.toLowerCase().includes('deleted') ||
                message.toLowerCase().includes('copied')) {
                type = 'success';
                title = 'Success!';
            } else if (message.toLowerCase().includes('error') || 
                       message.toLowerCase().includes('failed') || 
                       message.toLowerCase().includes('not found') ||
                       message.toLowerCase().includes('invalid')) {
                type = 'error';
                title = 'Error!';
            } else if (message.toLowerCase().includes('please') || 
                       message.toLowerCase().includes('required') ||
                       message.toLowerCase().includes('select') ||
                       message.toLowerCase().includes('fill')) {
                type = 'warning';
                title = 'Please Note';
            }
            
            this.show(message, type, title);
        };
    }

    // Restore original alert (if needed)
    restoreAlert() {
        if (window.originalAlert) {
            window.alert = window.originalAlert;
        }
    }
}

// Specific alert functions for common use cases
window.FloatingAlertManager = {
    // Cart-related alerts
    addedToCart: (productName) => {
        return alerts.success(`${productName} has been added to your cart!`, 'Added to Cart!');
    },
    
    removedFromCart: (productName) => {
        return alerts.info(`${productName} has been removed from your cart.`, 'Removed from Cart');
    },
    
    cartEmpty: () => {
        return alerts.warning('Your cart is empty! Add some products first.', 'Cart Empty');
    },
    
    // Product-related alerts
    productAdded: () => {
        return alerts.success('Product has been added successfully!', 'Product Added!');
    },
    
    productUpdated: () => {
        return alerts.success('Product has been updated successfully!', 'Product Updated!');
    },
    
    productDeleted: () => {
        return alerts.success('Product has been deleted successfully!', 'Product Deleted!');
    },
    
    // Review-related alerts
    reviewSubmitted: () => {
        return alerts.success('Your review has been submitted successfully! Thank you for your feedback.', 'Review Submitted!');
    },
    
    reviewError: () => {
        return alerts.error('Failed to submit your review. Please try again.', 'Review Error');
    },
    
    // Form validation alerts
    pleaseSelectSize: () => {
        return alerts.warning('Please select a size before adding to cart.', 'Size Required');
    },
    
    pleaseSelectRating: () => {
        return alerts.warning('Please select a rating for your review.', 'Rating Required');
    },
    
    pleaseFillAllFields: () => {
        return alerts.warning('Please fill in all required fields.', 'Fields Required');
    },
    
    // Upload-related alerts
    uploadSuccess: (count = 1) => {
        return alerts.success(`${count} image${count > 1 ? 's' : ''} uploaded successfully!`, 'Upload Complete!');
    },
    
    uploadError: (error) => {
        return alerts.error(`Upload failed: ${error}`, 'Upload Error');
    },
    
    // Buy Now alerts
    buyNowSuccess: (productName) => {
        return alerts.success(`Redirecting you to purchase ${productName}...`, 'Buy Now!');
    },
    
    // Link/Copy alerts
    linkCopied: () => {
        return alerts.success('Link has been copied to your clipboard!', 'Link Copied!');
    },
    
    copyFailed: () => {
        return alerts.error('Failed to copy link. Please try again.', 'Copy Failed');
    },
    
    // Generic alerts
    operationSuccess: (operation) => {
        return alerts.success(`${operation} completed successfully!`, 'Success!');
    },
    
    operationError: (operation, error) => {
        return alerts.error(`${operation} failed: ${error}`, 'Operation Failed');
    }
};

// Initialize the alerts system
const alerts = new FloatingAlerts();

// Make it globally available
window.alerts = alerts;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 Floating Alerts System initialized');
    });
} else {
    console.log('🎯 Floating Alerts System initialized');
}