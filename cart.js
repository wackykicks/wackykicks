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
        this.updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
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
    addToCart(product, quantity = 1, size = null) {
        // Create unique item ID based on product ID and size
        const itemId = size ? `${product.id}_${size}` : product.id;
        
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
                quantity: quantity,
                addedAt: new Date().toISOString()
            };
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.showSuccessMessage(`${product.name} added to cart!`);
        
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
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Update cart count in navigation
    updateCartCount() {
        const countElements = document.querySelectorAll('.cart-count, #navCartCount');
        const count = this.getTotalItems();
        
        countElements.forEach(element => {
            if (element) {
                const oldCount = parseInt(element.textContent) || 0;
                element.textContent = count;
                
                if (count === 0) {
                    element.classList.add('hidden');
                } else {
                    element.classList.remove('hidden');
                    
                    // Add pulse animation if count increased
                    if (count > oldCount) {
                        element.classList.add('updated');
                        setTimeout(() => element.classList.remove('updated'), 500);
                    }
                }
            }
        });
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
            itemText += ` x ${item.quantity}`;
            return itemText;
        }).join('\n');
    }
}

// Initialize cart
const cart = new ShoppingCart();

// WhatsApp Checkout Function
function checkoutViaWhatsApp() {
    if (cart.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const cartItems = cart.getCartForWhatsApp();
    const total = cart.getCartTotal();
    const shipping = total >= 999 ? 0 : 99;
    const finalTotal = total + shipping;

    const message = `Hello WackyKicks! I'd like to place an order:

${cartItems}

Subtotal: ₹${total}
Shipping: ${shipping === 0 ? 'FREE' : `₹${shipping}`}
Total: ₹${finalTotal}

Please confirm the order and provide payment details.`;

    const whatsappUrl = `https://wa.me/918138999550?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Add to cart function for product pages
function addToCart(productData, quantity = 1, size = null) {
    return cart.addToCart(productData, quantity, size);
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
});

// Export for global use
window.cart = cart;
window.addToCart = addToCart;
window.quickAddToCart = quickAddToCart;
window.checkoutViaWhatsApp = checkoutViaWhatsApp;