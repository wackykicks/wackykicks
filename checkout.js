// Checkout Page JavaScript

// Get order data from URL parameters or localStorage
function getOrderData() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if coming from Buy Now button (single product)
    if (urlParams.get('source') === 'buynow') {
        // Try to get data from sessionStorage first
        const buyNowData = sessionStorage.getItem('buyNowProduct');
        if (buyNowData) {
            try {
                const productData = JSON.parse(buyNowData);
                console.log('Loading order from Buy Now (sessionStorage):', productData.product);
                // Clear after reading
                sessionStorage.removeItem('buyNowProduct');
                return {
                    items: [{
                        name: productData.product,
                        price: productData.price,
                        quantity: parseInt(productData.quantity || '1'),
                        size: productData.size || '',
                        color: productData.color || '',
                        image: productData.image || 'https://via.placeholder.com/80'
                    }],
                    source: 'buynow'
                };
            } catch (e) {
                console.error('Error parsing buyNowProduct:', e);
            }
        }
    }
    
    // Fallback: Check URL parameters (for backward compatibility)
    if (urlParams.has('product')) {
        console.log('Loading order from Buy Now (URL params):', urlParams.get('product'));
        return {
            items: [{
                name: urlParams.get('product'),
                price: urlParams.get('price'),
                quantity: parseInt(urlParams.get('quantity') || '1'),
                size: urlParams.get('size') || '',
                color: urlParams.get('color') || '',
                image: urlParams.get('image') || 'https://via.placeholder.com/80'
            }],
            source: 'buynow'
        };
    }
    
    // Check if coming from cart (using correct localStorage key)
    const cartData = localStorage.getItem('wackykicks_cart');
    console.log('Checking for cart data with key "wackykicks_cart"');
    
    if (cartData) {
        try {
            const cart = JSON.parse(cartData);
            console.log('Cart data found:', cart);
            
            if (Array.isArray(cart) && cart.length > 0) {
                // Ensure cart items have required fields
                const items = cart.map(item => {
                    // Handle image from various sources
                    let imageUrl = item.image || item.img;
                    
                    // If image is still not found, check for imgUrl (might be array)
                    if (!imageUrl && item.imgUrl) {
                        imageUrl = Array.isArray(item.imgUrl) ? item.imgUrl[0] : item.imgUrl;
                    }
                    
                    // Fallback to other possible fields
                    if (!imageUrl) {
                        imageUrl = item.photo || item.productImage || 'https://via.placeholder.com/80';
                    }
                    
                    return {
                        name: item.name || item.productName || 'Unknown Product',
                        price: item.price || item.productPrice || '0',
                        quantity: item.quantity || 1,
                        size: item.size || '',
                        color: item.color || '',
                        image: imageUrl
                    };
                });
                
                console.log('Processed cart items:', items);
                
                return {
                    items: items,
                    source: 'cart'
                };
            } else {
                console.warn('Cart is empty or not an array');
            }
        } catch (e) {
            console.error('Error parsing cart data:', e);
        }
    } else {
        console.log('No cart data in localStorage with key "wackykicks_cart"');
    }
    
    // No order data, redirect to home
    console.log('No order data found, redirecting to home');
    window.location.href = 'index.html';
    return null;
}

// Display order summary
function displayOrderSummary() {
    const orderData = getOrderData();
    if (!orderData) return;
    
    const summaryContent = document.getElementById('orderSummaryContent');
    const orderTotal = document.getElementById('orderTotal');
    
    let total = 0;
    let itemsHTML = '';
    
    orderData.items.forEach(item => {
        const priceStr = (item.price || '0').toString().replace(/[^0-9.-]+/g, '');
        const itemPrice = parseFloat(priceStr) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        const itemTotal = itemPrice * itemQty;
        total += itemTotal;
        
        let metaInfo = [];
        if (item.size) metaInfo.push(`Size: ${item.size}`);
        if (item.color) metaInfo.push(`Color: ${item.color}`);
        if (itemQty > 1) metaInfo.push(`Qty: ${itemQty}`);
        
        // Handle image from various sources, check if array
        let itemImage = item.image || item.img;
        if (!itemImage && item.imgUrl) {
            itemImage = Array.isArray(item.imgUrl) ? item.imgUrl[0] : item.imgUrl;
        }
        if (!itemImage) {
            itemImage = item.photo || 'https://via.placeholder.com/80';
        }
        
        const itemName = item.name || item.productName || 'Product';
        
        itemsHTML += `
            <div class="order-item">
                <img src="${itemImage}" alt="${itemName}" class="order-item-image" onerror="this.src='https://via.placeholder.com/80'">
                <div class="order-item-details">
                    <div class="order-item-name">${itemName}</div>
                    ${metaInfo.length > 0 ? `<div class="order-item-meta">${metaInfo.join(' • ')}</div>` : ''}
                    <div class="order-item-price">₹${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
    });
    
    summaryContent.innerHTML = itemsHTML;
    orderTotal.textContent = `₹${total.toFixed(2)}`;
}

// Load and display saved addresses
function loadSavedAddresses() {
    if (!window.addressManager) return;
    
    const addresses = window.addressManager.getAddresses();
    if (addresses.length === 0) return;
    
    const section = document.getElementById('savedAddressesSection');
    const list = document.getElementById('savedAddressesList');
    
    let addressesHTML = '';
    addresses.forEach(addr => {
        addressesHTML += `
            <div class="saved-address-card" onclick="selectAddress(${addr.id})" id="addr-card-${addr.id}">
                <button class="delete-btn" onclick="event.stopPropagation(); deleteAddress(${addr.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="saved-address-name">${addr.fullName}</div>
                <div class="saved-address-details">
                    ${addr.address}<br>
                    ${addr.district ? addr.district + ', ' : ''}${addr.state} - ${addr.pincode}
                </div>
                <div class="saved-address-phone">
                    <i class="fas fa-phone"></i> ${addr.phone}
                </div>
            </div>
        `;
    });
    
    list.innerHTML = addressesHTML;
    section.style.display = 'block';
}

// Select a saved address
function selectAddress(id) {
    if (!window.addressManager) return;
    
    const addresses = window.addressManager.getAddresses();
    const selectedAddr = addresses.find(addr => addr.id === id);
    
    if (selectedAddr) {
        // Fill form
        document.getElementById('fullName').value = selectedAddr.fullName;
        document.getElementById('phone').value = selectedAddr.phone;
        document.getElementById('secondaryPhone').value = selectedAddr.secondaryPhone || '';
        document.getElementById('address').value = selectedAddr.address;
        document.getElementById('pincode').value = selectedAddr.pincode;
        document.getElementById('state').value = selectedAddr.state;
        
        // Load districts and set district
        if (selectedAddr.state) {
            loadDistricts(selectedAddr.state);
            setTimeout(() => {
                if (selectedAddr.district) {
                    document.getElementById('district').value = selectedAddr.district;
                }
            }, 100);
        }
        
        // Visual feedback
        document.querySelectorAll('.saved-address-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById(`addr-card-${id}`).classList.add('selected');
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Delete a saved address
function deleteAddress(id) {
    if (!window.addressManager) return;
    
    if (confirm('Delete this saved address?')) {
        window.addressManager.deleteAddress(id);
        
        const card = document.getElementById(`addr-card-${id}`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.remove();
                
                // Hide section if no addresses left
                const list = document.getElementById('savedAddressesList');
                if (list && list.children.length === 0) {
                    document.getElementById('savedAddressesSection').style.display = 'none';
                }
            }, 300);
        }
    }
}

// Submit checkout
function submitCheckout() {
    const form = document.getElementById('checkoutForm');
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        secondaryPhone: document.getElementById('secondaryPhone').value.trim(),
        address: document.getElementById('address').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        district: document.getElementById('district').value.trim(),
        state: document.getElementById('state').value.trim()
    };
    
    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.address || 
        !formData.district || !formData.state || !formData.pincode) {
        alert('Please fill in all required fields marked with *');
        return;
    }
    
    // Validate phone numbers
    if (!/^[0-9]{10}$/.test(formData.phone)) {
        alert('Please enter a valid 10-digit primary mobile number');
        return;
    }
    
    if (formData.secondaryPhone && !/^[0-9]{10}$/.test(formData.secondaryPhone)) {
        alert('Please enter a valid 10-digit secondary mobile number or leave it empty');
        return;
    }
    
    // Validate pincode
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
        alert('Please enter a valid 6-digit pincode');
        return;
    }
    
    // Save address if checkbox is checked
    const saveAddress = document.getElementById('saveAddress');
    if (saveAddress && saveAddress.checked && window.addressManager) {
        window.addressManager.saveAddress(formData);
    }
    
    // Get order data
    const orderData = getOrderData();
    if (!orderData) return;
    
    // Create WhatsApp message
    let message = `🛍️ *New Order from WackyKicks*\n\n`;
    
    // Order items
    message += `*📦 ORDER DETAILS*\n`;
    let total = 0;
    orderData.items.forEach((item, index) => {
        const itemPrice = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
        const itemTotal = itemPrice * (item.quantity || 1);
        total += itemTotal;
        
        message += `${index + 1}. ${item.name}\n`;
        if (item.size) message += `   Size: ${item.size}\n`;
        if (item.color) message += `   Color: ${item.color}\n`;
        if (item.quantity && item.quantity > 1) message += `   Quantity: ${item.quantity}\n`;
        message += `   Price: ₹${itemTotal.toFixed(2)}\n\n`;
    });
    
    message += `💰 *Total Amount: ₹${total.toFixed(2)}*\n\n`;
    
    // Customer details
    message += `*👤 CUSTOMER INFORMATION*\n`;
    message += `Name: ${formData.fullName}\n`;
    message += `Primary Phone: ${formData.phone}\n`;
    if (formData.secondaryPhone) {
        message += `Secondary Phone: ${formData.secondaryPhone}\n`;
    }
    
    // Shipping address
    message += `\n*📍 SHIPPING ADDRESS*\n`;
    message += `${formData.address}\n`;
    message += `${formData.district}, ${formData.state} - ${formData.pincode}\n`;
    
    // Encode and redirect to WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '918138999550';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Clear cart if order came from cart
    if (orderData.source === 'cart') {
        localStorage.removeItem('wackykicks_cart');
        console.log('Cart cleared after successful order');
    }
    
    // Redirect to WhatsApp with multi-device support
    redirectToWhatsAppMultiDevice(whatsappURL);
}

// Enhanced WhatsApp redirect function with mobile and desktop support
function redirectToWhatsAppMultiDevice(whatsappUrl) {
    console.log('🚀 Starting WhatsApp redirect:', whatsappUrl);
    
    // Method 1: Try window.open (works best for desktop)
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
    
    // Method 3: Link click simulation (fallback for desktop)
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
        // Last resort: show alert
        alert(`Please open WhatsApp manually with this link: ${whatsappUrl}`);
    }
}

// No longer using Google Maps Autocomplete - removed for faster page load

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    loadSavedAddresses();
    
    // Setup pincode listener for auto-lookup
    setupPincodeListener();
    
    // Update cart count
    const cartData = localStorage.getItem('wackykicks_cart');
    const cart = cartData ? JSON.parse(cartData) : [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
    
    console.log('Checkout page initialized successfully');
});

// Load districts based on selected state
function loadDistricts(stateName) {
    const districtSelect = document.getElementById('district');
    
    if (!stateName) {
        districtSelect.innerHTML = '<option value="">Select State First</option>';
        districtSelect.disabled = true;
        return;
    }
    
    const districts = window.indianStatesDistricts ? window.indianStatesDistricts[stateName] : [];
    
    if (districts && districts.length > 0) {
        districtSelect.disabled = false;
        districtSelect.innerHTML = '<option value="">Select District</option>';
        
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } else {
        districtSelect.innerHTML = '<option value="">No districts available</option>';
        districtSelect.disabled = true;
    }
}

// Pincode lookup using India Post API (free, no API key required)
async function lookupPincode(pincode) {
    if (!/^[0-9]{6}$/.test(pincode)) return;
    
    const helperText = document.getElementById('pincodeHelper');
    if (helperText) {
        helperText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up location...';
    }
    
    try {
        // Using India Post API - free and no API key needed
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            const district = postOffice.District;
            const state = postOffice.State;
            
            console.log('Pincode lookup successful:', { pincode, district, state, postOffice });
            
            // Auto-fill state and district
            if (state) {
                const stateSelect = document.getElementById('state');
                stateSelect.value = state;
                loadDistricts(state);
                
                // Wait for districts to load, then set district
                setTimeout(() => {
                    if (district) {
                        const districtSelect = document.getElementById('district');
                        districtSelect.value = district;
                        
                        if (helperText) {
                            helperText.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i> ${district}, ${state}`;
                        }
                    }
                }, 100);
            }
        } else {
            console.log('Pincode not found or invalid');
            if (helperText) {
                helperText.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #dc3545;"></i> Invalid pincode';
            }
        }
    } catch (error) {
        console.error('Pincode lookup error:', error);
        if (helperText) {
            helperText.innerHTML = '<i class="fas fa-map-marker-alt"></i> Auto-fills state & district';
        }
    }
}

// Setup pincode input listener
function setupPincodeListener() {
    const pincodeInput = document.getElementById('pincode');
    if (pincodeInput) {
        // Lookup on blur (when user leaves the field)
        pincodeInput.addEventListener('blur', (e) => {
            const pincode = e.target.value.trim();
            if (pincode.length === 6) {
                lookupPincode(pincode);
            }
        });
        
        // Also lookup when user types 6 digits
        pincodeInput.addEventListener('input', (e) => {
            const pincode = e.target.value.trim();
            if (pincode.length === 6 && /^[0-9]{6}$/.test(pincode)) {
                lookupPincode(pincode);
            }
        });
    }
}

// Make functions globally available
window.selectAddress = selectAddress;
window.deleteAddress = deleteAddress;
window.submitCheckout = submitCheckout;
window.loadDistricts = loadDistricts;
