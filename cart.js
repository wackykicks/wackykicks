// ✅ Calculate discount percentage (robust for string inputs)
function calculateDiscountPercentage(oldPrice, newPrice) {
    const o = parseFloat(oldPrice);
    const n = parseFloat(newPrice);
    if (!isFinite(o) || !isFinite(n) || o <= n) {
        return null; // No discount or invalid prices
    }
    const discount = ((o - n) / o) * 100;
    return Math.round(discount); // Round to nearest whole number
}

// Cart Management System
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    // Initialize cart
    init() {
        // Ensure DOM is ready before updating cart count
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateCartCount();
                if (window.location.pathname.includes('cart.html')) {
                    this.renderCart();
                }
            });
        } else {
            this.updateCartCount();
            if (window.location.pathname.includes('cart.html')) {
                this.renderCart();
            }
        }
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const saved = localStorage.getItem('wackykicks_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('wackykicks_cart', JSON.stringify(this.cart));
            this.updateCartCount();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add item to cart
    addToCart(product, quantity = 1, size = null, color = null) {
        // Create unique item ID based on product ID, size, and color
        let itemId = product.id;
        if (size && color) {
            itemId = `${product.id}_${size}_${color}`;
        } else if (size) {
            itemId = `${product.id}_${size}`;
        } else if (color) {
            itemId = `${product.id}_${color}`;
        }
        
        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.itemId === itemId);
        
        if (existingItem) {
            // Update quantity if item exists
            existingItem.quantity += quantity;
        } else {
            // Add new item to cart
            const cartItem = {
                itemId: itemId,
                id: product.id,
                name: product.name,
                price: product.newPrice || product.price,
                oldPrice: product.oldPrice || null,
                image: product.img || product.imgUrl?.[0],
                size: size,
                color: color,
                quantity: quantity,
                addedAt: new Date().toISOString()
            };
            this.cart.push(cartItem);
        }

        this.saveCart();
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.addedToCart(product.name);
        } else {
            this.showSuccessMessage(`${product.name} added to cart!`);
        }
        
        // Update cart display if on cart page
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }

        return true;
    }

    // Remove item from cart
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.itemId !== itemId);
        this.saveCart();
        
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }
    }

    // Update item quantity
    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.itemId === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                
                if (window.location.pathname.includes('cart.html')) {
                    this.renderCart();
                }
            }
        }
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    }

    // Get total items count
    getTotalItems() {
        if (!this.cart || !Array.isArray(this.cart)) {
            return 0;
        }
        
        return this.cart.reduce((total, item) => {
            const quantity = parseInt(item.quantity) || 0;
            return total + quantity;
        }, 0);
    }

    // Update cart count in navigation
    updateCartCount() {
        const count = this.getTotalItems();
        
        // Find all cart count elements with multiple selectors
        const selectors = [
            '.cart-count',
            '#cartCount',
            '#navCartCount',
            '[data-cart-count]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element) {
                    const oldCount = parseInt(element.textContent) || 0;
                    element.textContent = count;
                    
                    // Update visibility based on count
                    if (count === 0) {
                        element.classList.add('hidden');
                        element.style.display = 'none';
                    } else {
                        element.classList.remove('hidden');
                        element.style.display = '';
                        
                        // Add pulse animation if count increased
                        if (count > oldCount) {
                            element.classList.add('updated');
                            setTimeout(() => element.classList.remove('updated'), 500);
                        }
                    }
                }
            });
        });
        
        // Log for debugging
        console.log(`Cart count updated: ${count} items`);
    }

    // Render cart page
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.getElementById('cartContent');

        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';

        if (!cartItems) return;

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-item-id="${item.itemId}">
                <a href="product.html?id=${item.id}" class="product-link">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='Logo/1000163691.jpg'">
                </a>
                <div class="item-details">
                    <a href="product.html?id=${item.id}" class="product-link">
                        <div class="item-name">${item.name}</div>
                    </a>
                    <div class="item-info">
                        ${item.size ? `<div class="item-size">Size: ${item.size}</div>` : ''}
                        ${item.color ? `<div class="item-color">Color: ${item.color}</div>` : ''}
                        <div class="item-price">
                            ${item.oldPrice ? `<span class="old-price">₹${item.oldPrice}</span>` : ''}
                            <span class="new-price">₹${item.price}</span>
                            ${calculateDiscountPercentage(item.oldPrice, item.price) ? `<span class="cart-discount">${calculateDiscountPercentage(item.oldPrice, item.price)}% OFF</span>` : ''}
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cart.updateQuantity('${item.itemId}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                               onchange="cart.updateQuantity('${item.itemId}', parseInt(this.value) || 1)">
                        <button class="qty-btn" onclick="cart.updateQuantity('${item.itemId}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-btn" onclick="cart.removeFromCart('${item.itemId}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    // Update cart summary
    updateCartSummary() {
        const totalItems = this.getTotalItems();
        const subtotal = this.getCartTotal();
        const shipping = subtotal >= 999 ? 0 : 99;
        const total = subtotal + shipping;

        // Update summary elements
        const totalItemsEl = document.getElementById('totalItems');
        const subtotalEl = document.getElementById('subtotalAmount');
        const shippingEl = document.getElementById('shippingCost');
        const totalEl = document.getElementById('totalAmount');

        if (totalItemsEl) totalItemsEl.textContent = totalItems;
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
        if (totalEl) totalEl.textContent = `₹${total.toFixed(0)}`;
    }

    // Show success message
    showSuccessMessage(message) {
        // Remove existing message
        const existing = document.querySelector('.cart-success-message');
        if (existing) existing.remove();

        // Create new message with enhanced styling
        const messageEl = document.createElement('div');
        messageEl.className = 'cart-success-message';
        messageEl.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div class="message-content">
                <div class="message-title">Added to Cart!</div>
                <div class="message-text">${message}</div>
            </div>
        `;

        document.body.appendChild(messageEl);

        // Add vibration feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Auto remove after 4 seconds
        setTimeout(() => {
            messageEl.classList.add('fade-out');
            setTimeout(() => messageEl.remove(), 400);
        }, 4000);
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }
    }

    // Get cart items for WhatsApp checkout
    getCartForWhatsApp() {
        return this.cart.map(item => {
            let itemText = `${item.name} - ₹${item.price}`;
            if (item.size) itemText += ` (Size: ${item.size})`;
            if (item.color) itemText += ` (Color: ${item.color})`;
            itemText += ` x ${item.quantity}`;
            return itemText;
        }).join('\n');
    }
}

// Initialize cart
const cart = new ShoppingCart();

// ✅ Enhanced WhatsApp Checkout Function (Direct, No Address)
function checkoutViaWhatsApp() {
    console.log('🛒 Checkout via WhatsApp clicked');
    
    // Check if cart object exists
    if (!cart) {
        console.error('❌ Cart object not found');
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Checkout', 'Cart system not initialized');
        } else {
            alert('Cart system error. Please refresh the page.');
        }
        return;
    }
    
    // Check if cart is empty
    if (!cart.cart || cart.cart.length === 0) {
        console.log('❌ Cart is empty');
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.cartEmpty();
        } else {
            alert('Your cart is empty! Please add some items before checkout.');
        }
        return;
    }

    try {
        // Check if required methods exist
        if (typeof cart.getCartForWhatsApp !== 'function') {
            throw new Error('getCartForWhatsApp method not found');
        }
        if (typeof cart.getCartTotal !== 'function') {
            throw new Error('getCartTotal method not found');
        }
        
        // Gather cart details
        const cartItems = cart.getCartForWhatsApp();
        const total = cart.getCartTotal();
        const shipping = total >= 999 ? 0 : 99;
        const finalTotal = total + shipping;

        console.log('📊 Cart details:', { total, shipping, finalTotal, itemCount: cart.cart.length });

        // Create formatted WhatsApp message
        let message = `🛍️ *hi WackyKicks*\n\n`;
        message += `📋 *Order Details:*\n${cartItems}\n\n`;
        message += `💰 *Order Summary:*\n`;
        message += `• Subtotal: ₹${total}\n`;
        message += `• Shipping: ${shipping === 0 ? 'FREE ✅' : `₹${shipping}`}\n`;
        message += `• *Total: ₹${finalTotal}*\n\n`;
        message += `📞 Please confirm this order and provide payment details.\n`;
        message += `🙏 Thank you for choosing WackyKicks!`;

        console.log('📱 Sending to WhatsApp:', message);
        
        // Show success feedback
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationSuccess('WhatsApp redirect');
        } else if (window.alerts) {
            window.alerts.success('Redirecting to WhatsApp...', 'Please wait');
        }

        // Redirect to WhatsApp
        simpleRedirectToWhatsApp(message);
        
    } catch (error) {
        console.error('❌ Error during checkout:', error);
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Checkout', error.message || 'Please try again');
        } else {
            alert('Checkout failed. Please try again.');
        }
    }
}

// ✅ Enhanced WhatsApp Redirect Function with Multiple Fallbacks
function simpleRedirectToWhatsApp(message, phoneNumber = '918138999550') {
    console.log('🚀 Starting WhatsApp redirect with message:', message);
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log('🔗 WhatsApp URL:', whatsappUrl);
    
    // Method 1: Try window.open (most reliable for mobile)
    try {
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) {
            console.log('✅ WhatsApp opened using window.open');
            return;
        }
    } catch (error) {
        console.warn('⚠️ window.open failed:', error);
    }
    
    // Method 2: Direct navigation for mobile devices
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('📱 Mobile device detected, using direct navigation');
        window.location.href = whatsappUrl;
        return;
    }
    
    // Method 3: Link click simulation (fallback)
    try {
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ WhatsApp redirect using link click');
    } catch (error) {
        console.error('❌ All redirect methods failed:', error);
        // Last resort: show the URL to user
        if (window.alerts) {
            window.alerts.info('Please open WhatsApp manually', `Copy this link: ${whatsappUrl}`);
        } else {
            alert(`Please open this link manually: ${whatsappUrl}`);
        }
    }
}

// ✅ Enhanced WhatsApp Redirect/Forward Function (shared with product)
function redirectToWhatsApp(message, phoneNumber = '918138999550') {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Show loading/forwarding indicator
    showForwardingIndicator();
    
    // Multiple fallback methods for maximum compatibility
    if (isMobileDevice()) {
        // On mobile devices, try to open WhatsApp app directly
        setTimeout(() => {
            hideForwardingIndicator();
            // Try WhatsApp app first
            window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            
            // Fallback to web WhatsApp after a delay
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 2000);
        }, 500);
    } else {
        // On desktop, open web WhatsApp in new tab
        setTimeout(() => {
            hideForwardingIndicator();
            window.open(whatsappUrl, '_blank');
        }, 800);
    }
}

// ✅ Device Detection Function
function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for mobile patterns
    const mobilePatterns = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
        /Mobile/i
    ];
    
    return mobilePatterns.some(pattern => userAgent.match(pattern)) || 
           window.innerWidth <= 768 ||
           ('ontouchstart' in window);
}

// ✅ Forwarding Indicator Functions
function showForwardingIndicator() {
    // Remove existing indicator
    hideForwardingIndicator();
    
    // Create forwarding indicator
    const indicator = document.createElement('div');
    indicator.id = 'whatsappForwardingIndicator';
    indicator.innerHTML = `
        <div class="forwarding-content">
            <div class="forwarding-spinner">
                <i class="fab fa-whatsapp"></i>
            </div>
            <div class="forwarding-text">
                <h3>Forwarding to WhatsApp...</h3>
                <p>Please wait while we redirect you</p>
            </div>
        </div>
    `;
    
    // Add CSS styles
    indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    // Add styles for content
    const style = document.createElement('style');
    style.textContent = `
        .forwarding-content {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            max-width: 300px;
            width: 90%;
        }
        .forwarding-spinner {
            font-size: 3rem;
            color: #25D366;
            margin-bottom: 20px;
            animation: pulse 1.5s infinite;
        }
        .forwarding-text h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.3rem;
        }
        .forwarding-text p {
            margin: 0;
            color: #666;
            font-size: 0.95rem;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(indicator);
}

function hideForwardingIndicator() {
    const indicator = document.getElementById('whatsappForwardingIndicator');
    if (indicator) {
        indicator.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            indicator.remove();
            // Remove the style element
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
                if (style.textContent.includes('forwarding-content')) {
                    style.remove();
                }
            });
        }, 300);
    }
}

// Add to cart function for product pages
function addToCart(productData, quantity = 1, size = null, color = null) {
    return cart.addToCart(productData, quantity, size, color);
}

// Quick add to cart function (for product cards)
function quickAddToCart(productId, productName, productPrice, productImage, productOldPrice = null) {
    const product = {
        id: productId,
        name: productName,
        price: productPrice,
        oldPrice: productOldPrice,
        img: productImage
    };
    
    return cart.addToCart(product, 1, null);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    cart.init();
    
    // Additional safety check - update cart count after a short delay
    setTimeout(() => {
        cart.updateCartCount();
    }, 500);
    
    // Set up periodic cart count sync (every 30 seconds)
    setInterval(() => {
        cart.updateCartCount();
    }, 30000);
});

// Export for global use
window.cart = cart;
window.addToCart = addToCart;
window.quickAddToCart = quickAddToCart;
window.checkoutViaWhatsApp = checkoutViaWhatsApp;

// ✅ Test function to debug cart status
window.testCart = function() {
    console.log('🧪 Cart Debug Test:');
    console.log('Cart object:', cart);
    console.log('Cart items:', cart ? cart.cart : 'NO CART');
    console.log('Cart methods available:', {
        getCartTotal: typeof cart?.getCartTotal,
        getCartForWhatsApp: typeof cart?.getCartForWhatsApp
    });
    console.log('Alert systems available:', {
        FloatingAlertManager: typeof window.FloatingAlertManager,
        alerts: typeof window.alerts,
        operationSuccess: typeof window.FloatingAlertManager?.operationSuccess,
        success: typeof window.alerts?.success
    });
};