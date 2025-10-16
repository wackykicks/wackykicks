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

// ✅ Enhanced WhatsApp Checkout Function with User Information Modal
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
        
        // Show user information modal for cart checkout
        showCartUserInfoModal();
        
    } catch (error) {
        console.error('❌ Error during checkout:', error);
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Checkout', error.message || 'Please try again');
        } else {
            alert('Checkout failed. Please try again.');
        }
    }
}

// ✅ Show User Information Modal for Cart Checkout
function showCartUserInfoModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('cartUserInfoModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="cartUserInfoModal" class="user-info-modal">
            <div class="user-info-modal-content">
                <div class="modal-header">
                    <h2>Complete Your Order</h2>
                    <button class="close-modal" onclick="closeCartUserInfoModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-subtitle">Please provide your information to proceed with WhatsApp order</p>
                    
                    <form id="cartUserInfoForm" onsubmit="event.preventDefault(); submitCartUserInfo();">
                        <!-- Personal Information -->
                        <div class="form-section">
                            <h3>Personal Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="cartFullName">Name <span class="required">*</span></label>
                                    <input type="text" id="cartFullName" name="fullName" placeholder="Enter your name" required>
                                </div>
                                <div class="form-group">
                                    <label for="cartPhone">Mobile No. <span class="required">*</span></label>
                                    <input type="tel" id="cartPhone" name="phone" placeholder="Enter mobile number" required pattern="[0-9]{10}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="cartAltPhone">Alt Mobile No.</label>
                                <input type="tel" id="cartAltPhone" name="altPhone" placeholder="Alternate mobile number" pattern="[0-9]{10}">
                            </div>
                        </div>
                        
                        <!-- Delivery Address -->
                        <div class="form-section">
                            <h3>Delivery Address</h3>
                            <div class="form-group">
                                <label for="cartAddress">Address Line 1 (Flat/House No.) <span class="required">*</span></label>
                                <input type="text" id="cartAddress" name="address" placeholder="Enter flat/house number" required>
                            </div>
                            <div class="form-group">
                                <label for="cartAddressLine2">Address Line 2</label>
                                <input type="text" id="cartAddressLine2" name="addressLine2" placeholder="Street, Area, Locality (optional)">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="cartCity">City <span class="required">*</span></label>
                                    <input type="text" id="cartCity" name="city" placeholder="Enter city" required>
                                </div>
                                <div class="form-group">
                                    <label for="cartState">State <span class="required">*</span></label>
                                    <input type="text" id="cartState" name="state" placeholder="Enter state" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="cartPincode">Pincode <span class="required">*</span></label>
                                <input type="text" id="cartPincode" name="pincode" placeholder="Enter 6-digit pincode" required pattern="[0-9]{6}">
                            </div>
                        </div>
                        
                        <!-- Additional Information -->
                        <div class="form-section">
                            <h3>Additional Information</h3>
                            <div class="form-group">
                                <label for="cartDeliveryInstructions">Delivery Instructions</label>
                                <textarea id="cartDeliveryInstructions" name="deliveryInstructions" rows="3" placeholder="Any special instructions for delivery (optional)"></textarea>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="closeCartUserInfoModal()">Cancel</button>
                            <button type="submit" class="btn-primary">
                                <i class="fab fa-whatsapp"></i> Continue to WhatsApp
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles if not already added
    if (!document.getElementById('cartUserInfoModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'cartUserInfoModalStyles';
        styles.textContent = `
            .user-info-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                overflow-y: auto;
            }
            
            .user-info-modal-content {
                background: white;
                border-radius: 15px;
                max-width: 700px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                padding: 25px 30px;
                border-bottom: 2px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                color: #333;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 2rem;
                color: #999;
                cursor: pointer;
                transition: color 0.3s;
                padding: 0;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-modal:hover {
                color: #333;
            }
            
            .modal-body {
                padding: 25px 30px;
            }
            
            .modal-subtitle {
                color: #666;
                margin: 0 0 25px 0;
                font-size: 0.95rem;
            }
            
            .form-section {
                margin-bottom: 30px;
            }
            
            .form-section h3 {
                font-size: 1.1rem;
                color: #333;
                margin: 0 0 15px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #333;
                font-size: 0.9rem;
            }
            
            .required {
                color: #e74c3c;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 0.95rem;
                transition: border-color 0.3s;
                font-family: inherit;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #25d366;
            }
            
            .modal-footer {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
            }
            
            .btn-secondary,
            .btn-primary {
                padding: 12px 30px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-secondary {
                background: #f0f0f0;
                color: #666;
            }
            
            .btn-secondary:hover {
                background: #e0e0e0;
            }
            
            .btn-primary {
                background: #25d366;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary:hover {
                background: #20b858;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3);
            }
            
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .modal-header {
                    padding: 20px;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .modal-header h2 {
                    font-size: 1.2rem;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('cartFullName')?.focus();
    }, 100);
}

// ✅ Close Cart User Info Modal
function closeCartUserInfoModal() {
    const modal = document.getElementById('cartUserInfoModal');
    if (modal) {
        modal.style.animation = 'modalSlideOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

// ✅ Submit Cart User Info and Redirect to WhatsApp
function submitCartUserInfo() {
    console.log('📋 Submitting cart user info');
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('cartFullName').value.trim(),
        phone: document.getElementById('cartPhone').value.trim(),
        altPhone: document.getElementById('cartAltPhone').value.trim(),
        address: document.getElementById('cartAddress').value.trim(),
        addressLine2: document.getElementById('cartAddressLine2').value.trim(),
        city: document.getElementById('cartCity').value.trim(),
        state: document.getElementById('cartState').value.trim(),
        pincode: document.getElementById('cartPincode').value.trim(),
        deliveryInstructions: document.getElementById('cartDeliveryInstructions').value.trim()
    };
    
    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
        alert('Please fill in all required fields marked with *');
        return;
    }
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    // Validate pincode
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
        alert('Please enter a valid 6-digit pincode');
        return;
    }
    
    console.log('✅ Form data validated:', formData);
    
    // Gather cart details
    const cartItems = cart.getCartForWhatsApp();
    const total = cart.getCartTotal();
    const shipping = total >= 999 ? 0 : 99;
    const finalTotal = total + shipping;
    
    // Create WhatsApp message
    let message = `Hey WackyKicks! I'm interested in buying:\n\n`;
    message += `🛍️ *Order Details*\n${cartItems}\n\n`;
    message += `💰 *Order Summary*\n`;
    message += `Subtotal: ₹${total}\n`;
    message += `Shipping: ${shipping === 0 ? 'FREE ✅' : `₹${shipping}`}\n`;
    message += `*Total: ₹${finalTotal}*\n\n`;
    
    message += `👤 *Customer Information*\n`;
    message += `Name: ${formData.fullName}\n`;
    message += `Mobile No.: ${formData.phone}\n`;
    if (formData.altPhone) message += `Alt Mobile No.: ${formData.altPhone}\n`;
    
    message += `\n📍 *Delivery Address*\n`;
    message += `${formData.address}\n`;
    if (formData.addressLine2) message += `${formData.addressLine2}\n`;
    message += `${formData.city}, ${formData.state} - ${formData.pincode}\n`;
    
    if (formData.deliveryInstructions) {
        message += `\n📝 *Delivery Instructions*\n${formData.deliveryInstructions}\n`;
    }
    
    console.log('📱 WhatsApp message prepared:', message);
    
    // Close modal
    closeCartUserInfoModal();
    
    // Show success feedback
    if (window.FloatingAlertManager) {
        window.FloatingAlertManager.operationSuccess('WhatsApp redirect');
    } else if (window.alerts) {
        window.alerts.success('Redirecting to WhatsApp...', 'Please wait');
    }
    
    // Redirect directly to WhatsApp
    simpleRedirectToWhatsApp(message);
}

// Add modalSlideOut animation
if (!document.getElementById('cartModalSlideOutAnimation')) {
    const slideOutAnimation = document.createElement('style');
    slideOutAnimation.id = 'cartModalSlideOutAnimation';
    slideOutAnimation.textContent = `
        @keyframes modalSlideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-30px);
            }
        }
    `;
    document.head.appendChild(slideOutAnimation);
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
window.showCartUserInfoModal = showCartUserInfoModal;
window.closeCartUserInfoModal = closeCartUserInfoModal;
window.submitCartUserInfo = submitCartUserInfo;

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