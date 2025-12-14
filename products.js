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

// ✅ WhatsApp Buy Now with User Information Modal
function copyToWhatsApp(productName, productPrice) {
    console.log('🛍️ Buy Now clicked for:', productName);
    
    // Show user information modal
    showUserInfoModal(productName, productPrice);
}

// ✅ Show User Information Modal - Redirect to checkout page
function showUserInfoModal(productName, productPrice, quantity = 1, size = '', color = '', image = '') {
    // Redirect to checkout page with product details
    const params = new URLSearchParams({
        product: productName,
        price: productPrice,
        quantity: quantity,
        size: size || '',
        color: color || '',
        image: image || ''
    });
    
    window.location.href = `checkout.html?${params.toString()}`;
    return; // Exit function after redirect
    
    // Old modal code below (keeping for reference, won't execute)
    const existingModal = document.getElementById('userInfoModal');
    if (existingModal) {
        existingModal.remove();
    }

    const savedAddresses = window.addressManager ? window.addressManager.getAddresses() : [];
    const lastAddress = window.addressManager ? window.addressManager.getLastAddress() : null;
    
    let savedAddressesHTML = '';
    if (savedAddresses.length > 0) {
        savedAddressesHTML = `
            <div class="saved-addresses-section">
                <h3>Saved Addresses</h3>
                <div class="saved-addresses-list">
                    ${savedAddresses.map((addr, index) => `
                        <div class="saved-address-item" onclick="selectSavedAddress(${addr.id})" id="saved-addr-${addr.id}">
                            <button class="delete-address" onclick="event.stopPropagation(); deleteSavedAddress(${addr.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            <div class="address-name">${addr.fullName}</div>
                            <div class="address-details">
                                ${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                                Phone: ${addr.phone}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="address-divider"><span>OR ADD NEW ADDRESS</span></div>
            </div>
        `;
    }
    
    // Create modal HTML with saved addresses
    const modalHTML = `
        <div id="userInfoModal" class="user-info-modal">
            <div class="user-info-modal-content">
                <div class="modal-header">
                    <h2>Shipping Address</h2>
                    <button class="close-modal" onclick="closeUserInfoModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-subtitle">Where should we deliver your order?</p>
                    
                    ${savedAddressesHTML}
                    
                    <form id="userInfoForm" class="address-form" onsubmit="event.preventDefault(); submitUserInfo('${productName.replace(/'/g, "\\'")}', '${productPrice}', ${quantity}, '${size}', '${color}');">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="fullName">Full Name <span class="required">*</span></label>
                                <input type="text" id="fullName" name="fullName" placeholder="Enter your name" value="${lastAddress ? lastAddress.fullName : ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Mobile Number <span class="required">*</span></label>
                                <input type="tel" id="phone" name="phone" placeholder="10-digit number" value="${lastAddress ? lastAddress.phone : ''}" required pattern="[0-9]{10}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="address">Address <span class="required">*</span></label>
                            <input type="text" id="address" name="address" placeholder="Start typing your address..." value="${lastAddress ? lastAddress.address : ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="pincode">Pincode <span class="required">*</span></label>
                                <input type="text" id="pincode" name="pincode" placeholder="6-digit pincode" value="${lastAddress ? lastAddress.pincode : ''}" required pattern="[0-9]{6}">
                            </div>
                            <div class="form-group">
                                <label for="city">City <span class="required">*</span></label>
                                <input type="text" id="city" name="city" placeholder="City" value="${lastAddress ? lastAddress.city : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="state">State <span class="required">*</span></label>
                            <select id="state" name="state" required>
                                <option value="">Select State</option>
                                <option value="Andhra Pradesh" ${lastAddress && lastAddress.state === 'Andhra Pradesh' ? 'selected' : ''}>Andhra Pradesh</option>
                                <option value="Arunachal Pradesh" ${lastAddress && lastAddress.state === 'Arunachal Pradesh' ? 'selected' : ''}>Arunachal Pradesh</option>
                                <option value="Assam" ${lastAddress && lastAddress.state === 'Assam' ? 'selected' : ''}>Assam</option>
                                <option value="Bihar" ${lastAddress && lastAddress.state === 'Bihar' ? 'selected' : ''}>Bihar</option>
                                <option value="Chhattisgarh" ${lastAddress && lastAddress.state === 'Chhattisgarh' ? 'selected' : ''}>Chhattisgarh</option>
                                <option value="Goa" ${lastAddress && lastAddress.state === 'Goa' ? 'selected' : ''}>Goa</option>
                                <option value="Gujarat" ${lastAddress && lastAddress.state === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
                                <option value="Haryana" ${lastAddress && lastAddress.state === 'Haryana' ? 'selected' : ''}>Haryana</option>
                                <option value="Himachal Pradesh" ${lastAddress && lastAddress.state === 'Himachal Pradesh' ? 'selected' : ''}>Himachal Pradesh</option>
                                <option value="Jharkhand" ${lastAddress && lastAddress.state === 'Jharkhand' ? 'selected' : ''}>Jharkhand</option>
                                <option value="Karnataka" ${lastAddress && lastAddress.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
                                <option value="Kerala" ${lastAddress && lastAddress.state === 'Kerala' ? 'selected' : ''}>Kerala</option>
                                <option value="Madhya Pradesh" ${lastAddress && lastAddress.state === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
                                <option value="Maharashtra" ${lastAddress && lastAddress.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
                                <option value="Manipur" ${lastAddress && lastAddress.state === 'Manipur' ? 'selected' : ''}>Manipur</option>
                                <option value="Meghalaya" ${lastAddress && lastAddress.state === 'Meghalaya' ? 'selected' : ''}>Meghalaya</option>
                                <option value="Mizoram" ${lastAddress && lastAddress.state === 'Mizoram' ? 'selected' : ''}>Mizoram</option>
                                <option value="Nagaland" ${lastAddress && lastAddress.state === 'Nagaland' ? 'selected' : ''}>Nagaland</option>
                                <option value="Odisha" ${lastAddress && lastAddress.state === 'Odisha' ? 'selected' : ''}>Odisha</option>
                                <option value="Punjab" ${lastAddress && lastAddress.state === 'Punjab' ? 'selected' : ''}>Punjab</option>
                                <option value="Rajasthan" ${lastAddress && lastAddress.state === 'Rajasthan' ? 'selected' : ''}>Rajasthan</option>
                                <option value="Sikkim" ${lastAddress && lastAddress.state === 'Sikkim' ? 'selected' : ''}>Sikkim</option>
                                <option value="Tamil Nadu" ${lastAddress && lastAddress.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
                                <option value="Telangana" ${lastAddress && lastAddress.state === 'Telangana' ? 'selected' : ''}>Telangana</option>
                                <option value="Tripura" ${lastAddress && lastAddress.state === 'Tripura' ? 'selected' : ''}>Tripura</option>
                                <option value="Uttar Pradesh" ${lastAddress && lastAddress.state === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
                                <option value="Uttarakhand" ${lastAddress && lastAddress.state === 'Uttarakhand' ? 'selected' : ''}>Uttarakhand</option>
                                <option value="West Bengal" ${lastAddress && lastAddress.state === 'West Bengal' ? 'selected' : ''}>West Bengal</option>
                                <option value="Andaman and Nicobar Islands" ${lastAddress && lastAddress.state === 'Andaman and Nicobar Islands' ? 'selected' : ''}>Andaman and Nicobar Islands</option>
                                <option value="Chandigarh" ${lastAddress && lastAddress.state === 'Chandigarh' ? 'selected' : ''}>Chandigarh</option>
                                <option value="Dadra and Nagar Haveli and Daman and Diu" ${lastAddress && lastAddress.state === 'Dadra and Nagar Haveli and Daman and Diu' ? 'selected' : ''}>Dadra and Nagar Haveli and Daman and Diu</option>
                                <option value="Delhi" ${lastAddress && lastAddress.state === 'Delhi' ? 'selected' : ''}>Delhi</option>
                                <option value="Jammu and Kashmir" ${lastAddress && lastAddress.state === 'Jammu and Kashmir' ? 'selected' : ''}>Jammu and Kashmir</option>
                                <option value="Ladakh" ${lastAddress && lastAddress.state === 'Ladakh' ? 'selected' : ''}>Ladakh</option>
                                <option value="Lakshadweep" ${lastAddress && lastAddress.state === 'Lakshadweep' ? 'selected' : ''}>Lakshadweep</option>
                                <option value="Puducherry" ${lastAddress && lastAddress.state === 'Puducherry' ? 'selected' : ''}>Puducherry</option>
                            </select>
                        </div>
                        
                        <div class="save-address-check">
                            <input type="checkbox" id="saveAddress" checked>
                            <label for="saveAddress">Save this address for future orders</label>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="closeUserInfoModal()">Cancel</button>
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
    
    // Display modal
    const modal = document.getElementById('userInfoModal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    // Initialize Google Maps Autocomplete
    setTimeout(() => {
        if (window.initAddressAutocomplete) {
            window.initAddressAutocomplete('address');
        }
    }, 500);
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = savedAddresses.length > 0 ? null : document.getElementById('fullName');
        firstInput?.focus();
    }, 100);
}    // Add modal styles if not already added
    if (!document.getElementById('userInfoModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'userInfoModalStyles';
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
        document.getElementById('fullName')?.focus();
    }, 100);

// Select saved address
function selectSavedAddress(id) {
    if (!window.addressManager) return;
    
    const addresses = window.addressManager.getAddresses();
    const selectedAddr = addresses.find(addr => addr.id === id);
    
    if (selectedAddr) {
        // Fill form with selected address
        document.getElementById('fullName').value = selectedAddr.fullName;
        document.getElementById('phone').value = selectedAddr.phone;
        document.getElementById('address').value = selectedAddr.address;
        document.getElementById('pincode').value = selectedAddr.pincode;
        document.getElementById('city').value = selectedAddr.city;
        document.getElementById('state').value = selectedAddr.state;
        
        // Visual feedback
        document.querySelectorAll('.saved-address-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.getElementById(`saved-addr-${id}`).classList.add('selected');
    }
}

// Delete saved address
function deleteSavedAddress(id) {
    if (!window.addressManager) return;
    
    if (confirm('Delete this saved address?')) {
        window.addressManager.deleteAddress(id);
        
        // Remove from DOM
        const element = document.getElementById(`saved-addr-${id}`);
        if (element) {
            element.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                element.remove();
                
                // If no saved addresses left, remove the section
                const list = document.querySelector('.saved-addresses-list');
                if (list && list.children.length === 0) {
                    document.querySelector('.saved-addresses-section')?.remove();
                }
            }, 300);
        }
    }
}

// ✅ Close User Info Modal
function closeUserInfoModal() {
    const modal = document.getElementById('userInfoModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

window.selectSavedAddress = selectSavedAddress;
window.deleteSavedAddress = deleteSavedAddress;

// ✅ Submit User Info and Redirect to WhatsApp
function submitUserInfo(productName, productPrice) {
    console.log('📋 Submitting user info for:', productName);
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim()
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
    
    // Save address if checkbox is checked
    const saveAddress = document.getElementById('saveAddress');
    if (saveAddress && saveAddress.checked && window.addressManager) {
        window.addressManager.saveAddress(formData);
        console.log('💾 Address saved for future use');
    }
    
    // Create WhatsApp message
    let message = `Hey WackyKicks! I'm interested in buying:\n\n`;
    message += `🛍️ *Product Details*\n`;
    message += `Product: ${productName}\n`;
    message += `Price: ₹${productPrice}\n\n`;
    
    message += `👤 *Customer Information*\n`;
    message += `Name: ${formData.fullName}\n`;
    message += `Mobile No.: ${formData.phone}\n`;
    
    message += `\n📍 *Delivery Address*\n`;
    message += `${formData.address}\n`;
    message += `${formData.city}, ${formData.state} - ${formData.pincode}\n`;
    
    console.log('📱 WhatsApp message prepared:', message);
    
    // Close modal
    closeUserInfoModal();
    
    // Redirect directly to WhatsApp
    simpleRedirectToWhatsApp(message);
}

// Add modalSlideOut animation
const slideOutAnimation = document.createElement('style');
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
        alert(`Please open this link manually: ${whatsappUrl}`);
    }
}

function proceedWithoutAddress() {
    console.log('🚀 proceedWithoutAddress called');
    if (!currentPurchaseData) {
        console.error('❌ No currentPurchaseData found');
        return;
    }
    
    console.log('📦 Current purchase data:', currentPurchaseData);
    
    // Close modal first
    closeAddressModal();
    
    // Proceed with WhatsApp message without address
    const { productName, productPrice, quantity } = currentPurchaseData;
    
    const qtyMsg = quantity > 1 ? `\nQuantity: ${quantity}` : '';
    
    const message = `Hey WackyKicks! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}${qtyMsg}`;
    
    console.log('📱 Using simple redirect with message:', message);
    
    // Use simple redirect directly
    simpleRedirectToWhatsApp(message);
}

function proceedWithAddress() {
    console.log('🚀 proceedWithAddress called');
    if (!currentPurchaseData) {
        console.error('❌ No currentPurchaseData found');
        return;
    }
    
    console.log('📦 Current purchase data:', currentPurchaseData);
    
    // Get address data
    const addressData = getAddressFormData();
    console.log('📍 Address data:', addressData);
    
    // Save address to localStorage for future use
    if (addressData.hasData) {
        saveAddressToStorage(addressData);
    }
    
    // Close modal first
    closeAddressModal();
    
    // Proceed with WhatsApp message including address
    const { productName, productPrice, quantity } = currentPurchaseData;
    
    const qtyMsg = quantity > 1 ? `\nQuantity: ${quantity}` : '';
    
    // Add address to message if provided
    let addressMsg = '';
    if (addressData.hasData) {
        addressMsg = `\n\n📍 Delivery Address:`;
        if (addressData.fullName) addressMsg += `\nName: ${addressData.fullName}`;
        if (addressData.phoneNumber) addressMsg += `\nPhone: ${addressData.phoneNumber}`;
        if (addressData.addressLine1) addressMsg += `\nAddress: ${addressData.addressLine1}`;
        if (addressData.addressLine2) addressMsg += `, ${addressData.addressLine2}`;
        if (addressData.city) addressMsg += `\nCity: ${addressData.city}`;
        if (addressData.state) addressMsg += `\nState: ${addressData.state}`;
        if (addressData.pincode) addressMsg += `\nPincode: ${addressData.pincode}`;
        if (addressData.landmark) addressMsg += `\nLandmark: ${addressData.landmark}`;
    }
    
    const message = `Hey WackyKicks! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}${qtyMsg}${addressMsg}`;
    
    console.log('📱 Using simple redirect with message:', message);
    
    // Use simple redirect directly
    simpleRedirectToWhatsApp(message);
}

// ✅ Enhanced WhatsApp Redirect/Forward Function
function redirectToWhatsApp(message, phoneNumber = '918138999550') {
    console.log('🔄 redirectToWhatsApp called with:', { message, phoneNumber });
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log('🔗 WhatsApp URL:', whatsappUrl);
    
    // Validate message and phone number
    if (!message || !phoneNumber) {
        console.error('❌ Missing message or phone number for WhatsApp redirect');
        return;
    }
    
    try {
        console.log('📱 Starting WhatsApp redirect process...');
        
        // Show loading/forwarding indicator
        showForwardingIndicator();
        
        // Safety timeout to always hide indicator
        const safetyTimeout = setTimeout(() => {
            console.log('⏰ Safety timeout reached, hiding indicator');
            hideForwardingIndicator();
        }, 3000);
        
        // Simplified and more reliable approach
        if (isMobileDevice()) {
            console.log('📱 Mobile device detected');
            // On mobile devices - try app first, then web
            const whatsappAppUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            console.log('📱 Mobile WhatsApp URL:', whatsappAppUrl);
            
            // Create a more reliable redirect mechanism
            setTimeout(() => {
                let redirected = false;
                
                // Try to detect if app opens by checking page visibility
                const visibilityHandler = () => {
                    if (document.hidden) {
                        console.log('👁️ Page hidden - app likely opened');
                        redirected = true;
                        clearTimeout(safetyTimeout);
                        hideForwardingIndicator();
                        document.removeEventListener('visibilitychange', visibilityHandler);
                    }
                };
                
                document.addEventListener('visibilitychange', visibilityHandler);
                
                // Try to open WhatsApp app
                try {
                    console.log('🚀 Attempting to open WhatsApp app');
                    window.location.href = whatsappAppUrl;
                } catch (error) {
                    console.log('❌ App redirect failed:', error);
                }
                
                // Fallback to web version after delay
                setTimeout(() => {
                    if (!redirected && !document.hidden) {
                        console.log('🌐 Opening web WhatsApp as fallback');
                        // App didn't open, use web version
                        document.removeEventListener('visibilitychange', visibilityHandler);
                        window.open(whatsappUrl, '_blank');
                    }
                    clearTimeout(safetyTimeout);
                    hideForwardingIndicator();
                }, 1200);
                
            }, 300);
            
        } else {
            console.log('💻 Desktop device detected');
            // On desktop - directly open web WhatsApp
            setTimeout(() => {
                console.log('🌐 Opening web WhatsApp');
                window.open(whatsappUrl, '_blank');
                clearTimeout(safetyTimeout);
                hideForwardingIndicator();
            }, 500);
        }
        
    } catch (error) {
        console.error('❌ Error in WhatsApp redirect:', error);
        hideForwardingIndicator();
        // Use emergency fallback
        console.log('� Using emergency fallback redirect');
        emergencyWhatsAppRedirect(message, phoneNumber);
    }
}

// ✅ Simple WhatsApp Redirect Fallback Function
function simpleWhatsAppRedirect(message, phoneNumber = '918138999550') {
    console.log('🔄 simpleWhatsAppRedirect called');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log('🔗 Simple redirect URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
}

// ✅ Emergency WhatsApp redirect (for testing)
function emergencyWhatsAppRedirect(message, phoneNumber = '918138999550') {
    console.log('🚨 Emergency WhatsApp redirect called');
    console.log('📱 Message:', message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log('🔗 URL:', whatsappUrl);
    
    // Create invisible link and click it
    try {
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.position = 'absolute';
        link.style.left = '-9999px';
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 100);
        
        console.log('✅ Emergency link click executed');
        
    } catch (error) {
        console.error('❌ Emergency link method failed:', error);
        
        // Last resort fallbacks
        try {
            window.open(whatsappUrl, '_blank');
            console.log('✅ window.open executed');
        } catch (error) {
            console.error('❌ window.open failed:', error);
            try {
                window.location.href = whatsappUrl;
                console.log('✅ window.location.href executed');
            } catch (error2) {
                console.error('❌ All redirect methods failed:', error2);
                alert(`Unable to open WhatsApp automatically. Please copy this URL: ${whatsappUrl}`);
            }
        }
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
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(indicator);
}

function hideForwardingIndicator() {
    const indicator = document.getElementById('whatsappForwardingIndicator');
    if (indicator) {
        // Add fadeOut animation if not already defined
        const existingStyle = document.querySelector('style[data-forwarding-style]');
        if (!existingStyle) {
            const fadeOutStyle = document.createElement('style');
            fadeOutStyle.setAttribute('data-forwarding-style', 'true');
            fadeOutStyle.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(fadeOutStyle);
        }
        
        indicator.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
            // Remove the style elements
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
                if (style.textContent.includes('forwarding-content') || style.getAttribute('data-forwarding-style')) {
                    style.remove();
                }
            });
        }, 300);
    }
}

function getAddressFormData() {
    const fullName = document.getElementById('fullName')?.value.trim() || '';
    const phoneNumber = document.getElementById('phoneNumber')?.value.trim() || '';
    const addressLine1 = document.getElementById('addressLine1')?.value.trim() || '';
    const addressLine2 = document.getElementById('addressLine2')?.value.trim() || '';
    const city = document.getElementById('city')?.value.trim() || '';
    const state = document.getElementById('state')?.value.trim() || '';
    const pincode = document.getElementById('pincode')?.value.trim() || '';
    const landmark = document.getElementById('landmark')?.value.trim() || '';
    
    const hasData = fullName || phoneNumber || addressLine1 || city || state || pincode;
    
    return {
        fullName,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark,
        hasData
    };
}

// ✅ Address Storage Functions
function saveAddressToStorage(addressData) {
    try {
        localStorage.setItem('wackykicks_saved_address', JSON.stringify(addressData));
        console.log('Address saved to localStorage');
    } catch (error) {
        console.error('Error saving address:', error);
    }
}

function loadSavedAddress() {
    try {
        const savedAddress = localStorage.getItem('wackykicks_saved_address');
        if (savedAddress) {
            const addressData = JSON.parse(savedAddress);
            
            // Fill form fields with saved data
            if (addressData.fullName) document.getElementById('fullName').value = addressData.fullName;
            if (addressData.phoneNumber) document.getElementById('phoneNumber').value = addressData.phoneNumber;
            if (addressData.addressLine1) document.getElementById('addressLine1').value = addressData.addressLine1;
            if (addressData.addressLine2) document.getElementById('addressLine2').value = addressData.addressLine2;
            if (addressData.city) document.getElementById('city').value = addressData.city;
            if (addressData.state) document.getElementById('state').value = addressData.state;
            if (addressData.pincode) document.getElementById('pincode').value = addressData.pincode;
            if (addressData.landmark) document.getElementById('landmark').value = addressData.landmark;
            
            console.log('Address loaded from localStorage');
            return addressData;
        }
    } catch (error) {
        console.error('Error loading saved address:', error);
    }
    return null;
}

function hasSavedAddress() {
    try {
        const savedAddress = localStorage.getItem('wackykicks_saved_address');
        return savedAddress !== null;
    } catch (error) {
        console.error('Error checking saved address:', error);
        return false;
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('addressModal');
    if (event.target === modal) {
        closeAddressModal();
    }
});

// Close modal on Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAddressModal();
    }
});

// ✅ Get Product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// ✅ Load Single Product (for product.html)
function loadProduct() {
    const productDetails = document.getElementById('productDetails');
    if (!productId) {
        productDetails.innerHTML = '<p>Product ID is missing in URL.</p>';
        return;
    }

    db.collection("products").doc(productId).get().then(doc => {
        if (!doc.exists) {
            productDetails.innerHTML = `<p>Product not found.</p>`;
            return;
        }

        const product = doc.data();
        const images = product.imgUrl || [];

        // Check if product is out of stock via category assignment or stock field
        const isOutOfStockByCategory = product.categories && product.categories.includes('out-of-stock');
        const isOutOfStockByStock = typeof product.stock !== 'undefined' && Number(product.stock) <= 0;
        const outOfStock = isOutOfStockByCategory || isOutOfStockByStock;

        let galleryHTML = '<div class="slider">';
        images.forEach(url => {
            galleryHTML += `
                <div class="image-slide">
                    <img src="${url}" alt="${product.name}">
                </div>
            `;
        });
        galleryHTML += '</div><div class="pagination" id="pagination"></div>';

        // Generate sizes HTML if available
        let sizesHTML = '';
        if (product.sizes && product.sizes.length > 0 && !outOfStock) {
            sizesHTML = `
                <div class="sizes">
                    <label>Size:</label>
                    <div class="size-options">
                        ${product.sizes.map(size => `<span class="size-option">${size}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Generate buttons HTML based on stock status
        let buttonsHTML = '';
        if (outOfStock) {
            buttonsHTML = `
                <div class="out-of-stock-notice">
                    <span class="out-of-stock-badge">Out of Stock</span>
                    <p class="out-of-stock-text">This product is currently unavailable</p>
                </div>
                <button class="share-btn" onclick="shareProduct('${product.name}', '${product.newPrice || product.price}', window.location.href)">Share</button>
            `;
        } else {
            buttonsHTML = `
                <button class="buy-now" onclick="copyToWhatsApp('${product.name}', '${product.newPrice || product.price}')">Buy Now</button>
                <button class="share-btn" onclick="shareProduct('${product.name}', '${product.newPrice || product.price}', window.location.href)">Share</button>
            `;
        }

        // For product page (product.js)
        productDetails.innerHTML = `
            <div class="product-container">
                <div class="product-gallery">
                    ${galleryHTML}
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <div class="price">
                        ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
                        <span class="new-price">₹${product.newPrice || product.price}</span>
                    </div>
                    <p class="description">${product.description || 'No description available.'}</p>
                    ${sizesHTML}
                    ${buttonsHTML}
                </div>
            </div>
        `;

        // Hide fixed product bar if product is out of stock
        if (outOfStock) {
            const fixedBar = document.querySelector('.fixed-product-bar');
            if (fixedBar) {
                fixedBar.style.display = 'none';
            }
        }

        // ✅ Setup Slider Dots
        setupSlider();
    }).catch(error => {
        console.error("Error loading product: ", error);
        productDetails.innerHTML = `<p>Error loading product details.</p>`;
    });
}

// ✅ Slider Setup Function
function setupSlider() {
    const slider = document.querySelector('.slider');
    const pagination = document.getElementById('pagination');
    const slides = document.querySelectorAll('.image-slide');

    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');

        dot.addEventListener('click', () => {
            slider.scrollTo({
                left: slider.offsetWidth * index,
                behavior: 'smooth'
            });
        });

        pagination.appendChild(dot);
    });

    slider.addEventListener('scroll', () => {
        const index = Math.round(slider.scrollLeft / slider.offsetWidth);
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    });
}


// Remove pagination variables
let allProducts = [];
let filteredProducts = [];
let isSearching = false;
let selectedCategories = [];

// Filter products by categories (single category selection)
function filterProducts(categories = [], categoryData = null) {
    console.log('🔍 filterProducts called with categories:', categories);
    console.log('🔍 filterProducts called with categoryData:', categoryData);
    
    // Check if products are loaded
    if (!window.productsLoaded || allProducts.length === 0) {
        console.log('⏳ Products not loaded yet, storing filter for later:', categories);
        window.pendingCategoryFilter = categories;
        return;
    }
    
    selectedCategories = categories;
    
    if (categories.length === 0) {
        // Show all products if no category selected
        console.log('📋 No categories selected, showing all products');
        if (isSearching) {
            renderProducts(filteredProducts);
        } else {
            renderProducts(allProducts);
        }
        return;
    }
    
    // Filter products that match the single selected category
    const categoryId = categories[0]; // Only one category can be selected
    console.log('🎯 Filtering by category:', categoryId);
    
    // Get additional category information if available
    const categoryInfo = categoryData && categoryData[0] ? categoryData[0] : null;
    console.log('🎯 Category info:', categoryInfo);
    
    const categoryFilteredProducts = allProducts.filter(product => {
        if (!product.categories || !Array.isArray(product.categories) || product.categories.length === 0) {
            console.log('❌ Product has no categories:', product.name);
            return false;
        }
        
        console.log(`🔍 Checking product "${product.name}" with categories:`, product.categories);
        
        // Simplified category matching - check multiple common variations
        const hasCategory = product.categories.some(cat => {
            if (!cat || typeof cat !== 'string') return false;
            
            // Convert both to lowercase for comparison
            const productCategory = cat.toLowerCase().trim();
            const filterCategory = categoryId.toLowerCase().trim();
            
            // Also check against category name if available
            const categoryName = categoryInfo ? categoryInfo.name.toLowerCase().trim() : null;
            
            console.log(`  🔍 Comparing "${productCategory}" with filter "${filterCategory}"${categoryName ? ` and name "${categoryName}"` : ''}`);
            
            // Check for exact match after normalization
            const exactMatch = productCategory === filterCategory;
            const nameMatch = categoryName && productCategory === categoryName;
            
                    // Handle special category mappings
                    const specialMatches = {
                        'shoes': ['shoe', 'sneakers', 'footwear'],
                        'watches': ['watch', 'timepiece', 'analog', 'digital', 'mechanical', 'quartz'],
                        'accessories': ['accessory', 'acc'],
                        'nike': ['nike shoes', 'nike sneakers'],
                        'adidas': ['adidas shoes', 'adidas sneakers'],
                        'today offer': ['todays offer', 'today\'s offer', 'todays offers', 'today\'s offers', 'special offer'],
                        'out-of-stock': ['out of stock', 'outofstock', 'sold out'],
                        'sunglasses': ['sunglass', 'sun glasses', 'sun glass', 'eyewear', 'glasses'],
                        'smartwatch': ['smart watch', 'smartwatches', 'apple watch', 'fitness watch', 'wearable'],
                        'gadgets': ['gadget', 'electronics', 'electronic']
                    };            // Check if filterCategory has special matches
            let specialMatch = false;
            if (specialMatches[filterCategory]) {
                specialMatch = specialMatches[filterCategory].includes(productCategory);
            }
            
            // Check if categoryName has special matches
            let nameSpecialMatch = false;
            if (categoryName && specialMatches[categoryName]) {
                nameSpecialMatch = specialMatches[categoryName].includes(productCategory);
            }
            
            // Check reverse mapping (if product category has special matches)
            let reverseSpecialMatch = false;
            Object.keys(specialMatches).forEach(key => {
                if (specialMatches[key].includes(productCategory)) {
                    if (key === filterCategory || (categoryName && key === categoryName)) {
                        reverseSpecialMatch = true;
                    }
                }
            });
            
            // Special exclusion rules to prevent wrong categorization
            let isExcluded = false;
            
            // If filtering for smartwatch, exclude analog/traditional watches
            if (filterCategory === 'smartwatch' || (categoryName && categoryName.toLowerCase() === 'smartwatch')) {
                const analogWatchKeywords = ['analog', 'mechanical', 'quartz', 'fossil', 'casio', 'traditional', 'classic', 'vintage'];
                const isAnalogWatch = analogWatchKeywords.some(keyword => 
                    productCategory.includes(keyword) || 
                    (product.name && product.name.toLowerCase().includes(keyword))
                );
                
                // Only allow if it's specifically marked as smartwatch-related
                const isSmartWatch = productCategory.includes('smart') || 
                                   productCategory.includes('apple') ||
                                   productCategory.includes('fitness') ||
                                   productCategory.includes('wearable') ||
                                   (product.name && (
                                       product.name.toLowerCase().includes('smart') ||
                                       product.name.toLowerCase().includes('apple watch') ||
                                       product.name.toLowerCase().includes('fitness') ||
                                       product.name.toLowerCase().includes('digital')
                                   ));
                
                if (isAnalogWatch && !isSmartWatch) {
                    isExcluded = true;
                }
            }
            
            // If filtering for watches, exclude smartwatches unless they're also tagged as watch
            if (filterCategory === 'watches' || (categoryName && categoryName.toLowerCase() === 'watches')) {
                const isSmartWatch = productCategory.includes('smart') || 
                                   (product.name && product.name.toLowerCase().includes('smart'));
                
                // Don't exclude smartwatches from watches category, let them appear in both
                // This allows users to find smartwatches in both categories if appropriately tagged
            }
            
            const isMatch = (exactMatch || nameMatch || specialMatch || nameSpecialMatch || reverseSpecialMatch) && !isExcluded;
            
            if (isMatch) {
                console.log(`    ✅ Match found: "${cat}" matches filter "${categoryId}"${categoryName ? ` or name "${categoryInfo.name}"` : ''}`);
            } else if (isExcluded) {
                console.log(`    ❌ Excluded: "${cat}" excluded from "${categoryId}" due to exclusion rules`);
            }
            
            return isMatch;
        });
        
        return hasCategory;
    });
    
    console.log('✅ Filtered products found:', categoryFilteredProducts.length);
    if (categoryFilteredProducts.length > 0) {
        console.log('📦 Products in category:');
        categoryFilteredProducts.forEach(p => console.log(`  - ${p.name} (categories: ${p.categories.join(', ')})`));
    } else {
        console.log('❌ No products found for category:', categoryId);
        console.log('📊 All products and their categories:');
        allProducts.forEach(p => {
            if (p.categories && Array.isArray(p.categories)) {
                console.log(`  - ${p.name}: [${p.categories.join(', ')}]`);
            } else {
                console.log(`  - ${p.name}: NO CATEGORIES`);
            }
        });
        console.log('📊 Available categories in all products:');
        const allCategories = new Set();
        allProducts.forEach(p => {
            if (p.categories && Array.isArray(p.categories)) {
                p.categories.forEach(cat => allCategories.add(cat));
            }
        });
        console.log('Available categories:', Array.from(allCategories).sort());
    }
    
    if (isSearching) {
        // Apply search filter to category-filtered products
        const searchTerm = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
        const searchAndCategoryFiltered = categoryFilteredProducts.filter(product =>
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
        renderProducts(searchAndCategoryFiltered);
    } else {
        renderProducts(categoryFilteredProducts);
    }
}

// Render products function (no pagination)
function renderProducts(productsToShow = allProducts) {
    console.log('🎨 Rendering products...');
    console.log('📦 Products to show:', productsToShow.length);
    
    const productList = document.getElementById('productList');
    console.log('🎯 Product list element found:', !!productList);
    
    if (!productList) {
        console.error('❌ Product list element not found! Check if element with id="productList" exists');
        return;
    }
    
    productList.innerHTML = '';
    
    if (productsToShow.length === 0) {
        console.log('📭 No products to display');
        productList.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or category filters</p>
            </div>
        `;
        return;
    }
    
    console.log('✅ Adding products to DOM...');
    productsToShow.forEach((product, index) => {
        console.log(`📦 Adding product ${index + 1}:`, product.name);
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Calculate discount percentage
        const discountPercentage = calculateDiscountPercentage(product.oldPrice, product.newPrice || product.price);
        
        // Check if product is out of stock via category assignment or stock field
        const isOutOfStockByCategory = product.categories && product.categories.includes('out-of-stock');
        const isOutOfStockByStock = typeof product.stock !== 'undefined' && Number(product.stock) <= 0;
        const outOfStock = isOutOfStockByCategory || isOutOfStockByStock;
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-link">
                ${discountPercentage && !outOfStock ? `<span class=\"tag discount-tag\">${discountPercentage}% OFF</span>` : ''}
                ${outOfStock ? `<span class=\"tag out-stock-tag\">Out of Stock</span>` : ''}
                <div class="img-wrapper">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <h3>${product.name}</h3>
                <div class="price">
                    ${product.oldPrice ? `<span class=\"old-price\">₹${product.oldPrice}</span>` : ''}
                    <span class="new-price">₹${product.newPrice || product.price}</span>
                </div>
            </a>
            ${outOfStock ? 
                '<div class="out-of-stock-message">Currently Unavailable</div>' : 
                `<button class="buy-now" onclick="event.stopPropagation(); copyToWhatsApp('${product.name.replace(/'/g, "\\'")}', '${product.newPrice || product.price}')">Buy Now</button>`
            }
        `;
        productList.appendChild(productCard);
    });

    console.log('✅ Products rendered successfully');
    
    // Hide pagination controls if present
    const paginationDiv = document.querySelector('.product-pagination');
    if (paginationDiv) paginationDiv.style.display = 'none';
    
    // Equalize card heights after DOM is updated
    setTimeout(equalizeCardHeights, 100);
}

// Function to equalize all product card heights
function equalizeCardHeights() {
    const cards = document.querySelectorAll('.product-card');
    if (cards.length === 0) return;
    
    // Reset heights first
    cards.forEach(card => card.style.height = 'auto');
    
    // Find the tallest card
    let maxHeight = 0;
    cards.forEach(card => {
        const cardHeight = card.offsetHeight;
        if (cardHeight > maxHeight) {
            maxHeight = cardHeight;
        }
    });
    
    // Set all cards to the same height
    cards.forEach(card => {
        card.style.height = maxHeight + 'px';
    });
}

// Search function (with single category selection support)
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm) {
        let productsToFilter = allProducts;
        
        // If a category is selected, first filter by that single category
        if (selectedCategories.length > 0) {
            const categoryId = selectedCategories[0]; // Only one category selected
            productsToFilter = allProducts.filter(product => {
                if (!product.categories || !Array.isArray(product.categories) || product.categories.length === 0) return false;
                
                // Use the same improved category matching logic
                return product.categories.some(cat => {
                    if (!cat || typeof cat !== 'string') return false;
                    
                    const productCategory = cat.toLowerCase().trim();
                    const filterCategory = categoryId.toLowerCase().trim();
                    
                    // Exact match
                    const exactMatch = productCategory === filterCategory;
                    
                    // Handle special category mappings
                    const specialMatches = {
                        'shoes': ['shoe', 'sneakers', 'footwear'],
                        'watches': ['watch', 'timepiece', 'analog', 'digital', 'mechanical', 'quartz'],
                        'accessories': ['accessory', 'acc'],
                        'nike': ['nike shoes', 'nike sneakers'],
                        'adidas': ['adidas shoes', 'adidas sneakers'],
                        'today offer': ['todays offer', 'today\'s offer', 'todays offers', 'today\'s offers', 'special offer'],
                        'out-of-stock': ['out of stock', 'outofstock', 'sold out'],
                        'sunglasses': ['sunglass', 'sun glasses', 'sun glass', 'eyewear', 'glasses'],
                        'smartwatch': ['smart watch', 'smartwatches', 'apple watch', 'fitness watch', 'wearable'],
                        'gadgets': ['gadget', 'electronics', 'electronic']
                    };
                    
                    let specialMatch = false;
                    if (specialMatches[filterCategory]) {
                        specialMatch = specialMatches[filterCategory].includes(productCategory);
                    }
                    
                    let reverseSpecialMatch = false;
                    Object.keys(specialMatches).forEach(key => {
                        if (specialMatches[key].includes(productCategory) && key === filterCategory) {
                            reverseSpecialMatch = true;
                        }
                    });
                    
                    // Apply same exclusion rules for search
                    let isExcluded = false;
                    if (filterCategory === 'smartwatch') {
                        const analogWatchKeywords = ['analog', 'mechanical', 'quartz', 'fossil', 'casio', 'traditional', 'classic', 'vintage'];
                        const isAnalogWatch = analogWatchKeywords.some(keyword => 
                            productCategory.includes(keyword) || 
                            (product.name && product.name.toLowerCase().includes(keyword))
                        );
                        
                        const isSmartWatch = productCategory.includes('smart') || 
                                           productCategory.includes('apple') ||
                                           productCategory.includes('fitness') ||
                                           productCategory.includes('wearable') ||
                                           (product.name && (
                                               product.name.toLowerCase().includes('smart') ||
                                               product.name.toLowerCase().includes('apple watch') ||
                                               product.name.toLowerCase().includes('fitness') ||
                                               product.name.toLowerCase().includes('digital')
                                           ));
                        
                        if (isAnalogWatch && !isSmartWatch) {
                            isExcluded = true;
                        }
                    }
                    
                    return (exactMatch || specialMatch || reverseSpecialMatch) && !isExcluded;
                });
            });
        }
        
        filteredProducts = productsToFilter.filter(product =>
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
        isSearching = true;
        renderProducts(filteredProducts);
    } else {
        isSearching = false;
        filterProducts(selectedCategories); // Reapply category filter
    }
}

// Initial load
function loadProducts() {
    console.log('🔄 Starting to load products...');
    console.log('📱 Firebase db available:', typeof db !== 'undefined');
    
    if (typeof db === 'undefined') {
        console.error('❌ Firebase database not initialized');
        return;
    }

    // Force fresh query from server (bypass cache)
    db.collection("products").get({ source: 'server' }).then(snapshot => {
        console.log('✅ Connected to Firebase successfully');
        console.log('📦 Number of products found:', snapshot.size);
        
        allProducts = [];
        snapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            const firstImage = Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl;
            
            console.log(`📦 Loading product: ${product.name}`);
            console.log(`   - ID: ${productId}`);
            console.log(`   - Categories: ${product.categories ? JSON.stringify(product.categories) : 'NONE'}`);
            console.log(`   - Image: ${firstImage}`);
            
            allProducts.push({ 
                ...product, 
                id: productId, 
                img: firstImage,
                categories: product.categories || [] // Ensure categories array exists
            });
        });
        
        // Sort products: newest first (with createdAt), then existing products
        allProducts.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (a.createdAt) {
                return -1; // a comes first
            } else if (b.createdAt) {
                return 1; // b comes first
            }
            return 0; // keep existing order for products without createdAt
        });
        
        console.log('🎯 Products loaded:', allProducts.length);
        console.log('📋 All products with categories:');
        allProducts.forEach(p => {
            console.log(`  - ${p.name}: [${p.categories.join(', ')}]`);
        });
        
        // Render products
        renderProducts(allProducts);
        
        // Notify category system that products are loaded
        window.productsLoaded = true;
        
        // Trigger any pending category filters
        if (window.pendingCategoryFilter) {
            console.log('🔄 Applying pending category filter:', window.pendingCategoryFilter);
            filterProducts(window.pendingCategoryFilter);
            delete window.pendingCategoryFilter;
        }
    }).catch(error => {
        console.error("❌ Error fetching products: ", error);
        console.log('🔄 Loading fallback demo data...');
        
        // Fallback to demo data if Firebase fails
        allProducts = [
            {
                id: '1',
                name: 'Nike Zoom Vomero 5 White',
                price: 850,
                newPrice: 850,
                img: 'https://via.placeholder.com/200x200?text=Nike+Shoe',
                categories: ['nike', 'shoes']
            },
            {
                id: '2',
                name: 'Fossil Watch Classic',
                price: 1200,
                newPrice: 950,
                oldPrice: 1200,
                img: 'https://via.placeholder.com/200x200?text=Fossil+Watch',
                categories: ['fossil', 'watches']
            }
        ];
        console.log('✅ Demo products loaded:', allProducts.length);
        renderProducts(allProducts);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing products...');
    console.log('🔍 Checking for productList element:', !!document.getElementById('productList'));
    loadProducts();

    // Inline search wiring
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const dropdown = document.getElementById('searchSuggestions');

    function hideDropdown() {
        if (dropdown) dropdown.style.display = 'none';
    }
    function showDropdown() {
        if (dropdown) dropdown.style.display = 'block';
    }
    function renderSuggestions(list) {
        if (!dropdown) return;
        if (!list || list.length === 0) {
            dropdown.innerHTML = '';
            hideDropdown();
            return;
        }
        const top = list.slice(0, 8);
        dropdown.innerHTML = top.map(p => {
            const img = Array.isArray(p.imgUrl) ? p.imgUrl[0] : (p.img || p.imgUrl || '');
            return `
                <div class="search-suggestion" role="option" data-id="${p.id}">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <div class="text-content">
                        <div class="title">${p.name || 'Product'}</div>
                        <div class="subtitle">${(p.description || '').slice(0, 80)}</div>
                    </div>
                    <i class="fas fa-arrow-up-right-from-square go" aria-hidden="true"></i>
                </div>`;
        }).join('');
        showDropdown();
    }

    if (input) {
        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            if (clearBtn) clearBtn.style.display = q ? 'inline-flex' : 'none';
            if (!q) {
                renderProducts(allProducts);
                hideDropdown();
                return;
            }
            // local filter over loaded products
            const base = (selectedCategories && selectedCategories.length)
                ? allProducts.filter(p => {
                    if (!p.categories || !Array.isArray(p.categories)) return false;
                    const categoryId = selectedCategories[0];
                    return p.categories.some(cat => {
                        if (!cat || typeof cat !== 'string') return false;
                        
                        const productCategory = cat.toLowerCase().trim();
                        const filterCategory = categoryId.toLowerCase().trim();
                        
                        const exactMatch = productCategory === filterCategory;
                        
                        const specialMatches = {
                            'shoes': ['shoe', 'sneakers', 'footwear'],
                            'watches': ['watch', 'timepiece', 'analog', 'digital', 'mechanical', 'quartz'],
                            'accessories': ['accessory', 'acc'],
                            'nike': ['nike shoes', 'nike sneakers'],
                            'adidas': ['adidas shoes', 'adidas sneakers'],
                            'today offer': ['todays offer', 'today\'s offer', 'todays offers', 'today\'s offers', 'special offer'],
                            'out-of-stock': ['out of stock', 'outofstock', 'sold out'],
                            'sunglasses': ['sunglass', 'sun glasses', 'sun glass', 'eyewear', 'glasses'],
                            'smartwatch': ['smart watch', 'smartwatches', 'apple watch', 'fitness watch', 'wearable'],
                            'gadgets': ['gadget', 'electronics', 'electronic']
                        };
                        
                        let specialMatch = false;
                        if (specialMatches[filterCategory]) {
                            specialMatch = specialMatches[filterCategory].includes(productCategory);
                        }
                        
                        let reverseSpecialMatch = false;
                        Object.keys(specialMatches).forEach(key => {
                            if (specialMatches[key].includes(productCategory) && key === filterCategory) {
                                reverseSpecialMatch = true;
                            }
                        });
                        
                        // Apply exclusion rules here too
                        let isExcluded = false;
                        if (filterCategory === 'smartwatch') {
                            const analogWatchKeywords = ['analog', 'mechanical', 'quartz', 'fossil', 'casio', 'traditional', 'classic', 'vintage'];
                            const isAnalogWatch = analogWatchKeywords.some(keyword => 
                                productCategory.includes(keyword) || 
                                (p.name && p.name.toLowerCase().includes(keyword))
                            );
                            
                            const isSmartWatch = productCategory.includes('smart') || 
                                               productCategory.includes('apple') ||
                                               productCategory.includes('fitness') ||
                                               productCategory.includes('wearable') ||
                                               (p.name && (
                                                   p.name.toLowerCase().includes('smart') ||
                                                   p.name.toLowerCase().includes('apple watch') ||
                                                   p.name.toLowerCase().includes('fitness') ||
                                                   p.name.toLowerCase().includes('digital')
                                               ));
                            
                            if (isAnalogWatch && !isSmartWatch) {
                                isExcluded = true;
                            }
                        }
                        
                        return (exactMatch || specialMatch || reverseSpecialMatch) && !isExcluded;
                    });
                })
                : allProducts;
            const matches = base.filter(p =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
            renderSuggestions(matches);
            renderProducts(matches);
        });

        input.addEventListener('focus', () => {
            const q = input.value.trim().toLowerCase();
            if (!q) return;
            const base = (selectedCategories && selectedCategories.length)
                ? allProducts.filter(p => {
                    if (!p.categories || !Array.isArray(p.categories)) return false;
                    const categoryId = selectedCategories[0];
                    return p.categories.some(cat => {
                        if (!cat || typeof cat !== 'string') return false;
                        
                        const productCategory = cat.toLowerCase().trim();
                        const filterCategory = categoryId.toLowerCase().trim();
                        
                        return productCategory === filterCategory;
                    });
                })
                : allProducts;
            const matches = base.filter(p =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
            renderSuggestions(matches);
        });

        document.addEventListener('click', (e) => {
            if (!dropdown) return;
            const container = document.querySelector('.search-container');
            if (container && !container.contains(e.target)) hideDropdown();
        });

        if (dropdown) {
            dropdown.addEventListener('click', (e) => {
                const item = e.target.closest('.search-suggestion');
                if (!item) return;
                const id = item.getAttribute('data-id');
                if (id) {
                    window.location.href = `product.html?id=${id}`;
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                clearBtn.style.display = 'none';
                hideDropdown();
                renderProducts(allProducts);
                input.focus();
            });
        }
    }
});

// Add resize listener to re-equalize heights
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(equalizeCardHeights, 250);
});

// ✅ Today's Offer Section
function loadTodaysOffers() {
    const todaysOfferGrid = document.getElementById('todaysOfferGrid');
    if (!todaysOfferGrid) return;

    // Show loading state
    todaysOfferGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p>Loading today's special offers...</p>
        </div>
    `;

    // Query products from "today offer" category
    db.collection("products")
        .where("categories", "array-contains", "today offer")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                todaysOfferGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
                        <i class="fas fa-gift" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.6;"></i>
                        <h3 style="margin: 0 0 10px 0;">No Special Offers Today</h3>
                        <p style="margin: 0; opacity: 0.8;">Check back soon for amazing deals!</p>
                        <button onclick="document.getElementById('product-grid').scrollIntoView({behavior: 'smooth'})" 
                                style="margin-top: 20px; padding: 12px 25px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">
                            Browse All Products
                        </button>
                    </div>
                `;
                return;
            }

            // Convert to array and limit to 2 products
            const allProducts = [];
            snapshot.forEach(doc => {
                allProducts.push({ id: doc.id, ...doc.data() });
            });

            const displayProducts = allProducts.slice(0, 2); // Only show first 2 products
            const hasMoreProducts = allProducts.length > 2;

            let offerHTML = '';
            displayProducts.forEach(product => {
                const firstImage = (product.imgUrl && product.imgUrl[0]) || 'https://via.placeholder.com/200x200?text=No+Image';
                
                // Calculate discount percentage
                const discount = calculateDiscountPercentage(product.oldPrice, product.newPrice);
                
                // Check if product is out of stock
                const isOutOfStockByCategory = product.categories && product.categories.includes('out-of-stock');
                const isOutOfStockByStock = typeof product.stock !== 'undefined' && Number(product.stock) <= 0;
                const outOfStock = isOutOfStockByCategory || isOutOfStockByStock;
                
                // Generate offer product card with 1:1 ratio image
                offerHTML += `
                    <div class="offer-product-card" onclick="window.location.href='product.html?id=${product.id}'">
                        <div class="offer-image-container">
                            <img src="${firstImage}" alt="${product.name}" loading="lazy">
                            ${outOfStock ? '<div class="offer-out-of-stock-badge">Out of Stock</div>' : ''}
                        </div>
                        <h3 style="font-size: 1.1rem; margin: 10px 0; font-weight: 600; line-height: 1.3;">${product.name}</h3>
                        <div class="offer-price">
                            ${product.oldPrice ? `<span class="offer-old-price">₹${product.oldPrice}</span>` : ''}
                            <span class="offer-new-price">₹${product.newPrice}</span>
                            ${discount ? `<span class="offer-discount">${discount}% OFF</span>` : ''}
                        </div>
                        ${outOfStock ? 
                            '<div class="offer-out-of-stock-message">Currently Unavailable</div>' :
                            `<div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button onclick="event.stopPropagation(); copyToWhatsApp('${product.name}', '${product.newPrice}')" 
                                        style="flex: 1; padding: 10px; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                    <i class="fab fa-whatsapp"></i> Buy Now
                                </button>
                            </div>`
                        }
                    </div>
                `;
            });

            // Add "View More" button if there are more than 2 products
            if (hasMoreProducts) {
                offerHTML += `
                    <div class="offer-view-more-card" onclick="showAllTodaysOffers()">
                        <div class="offer-view-more-content">
                            <i class="fas fa-plus" style="font-size: 0.9rem; margin-bottom: 2px; color: rgba(255,255,255,0.8);"></i>
                            <h3 style="margin: 2px 0 0 0; font-size: 0.75rem; color: rgba(255,255,255,0.9); font-weight: 600;">View More</h3>
                        </div>
                    </div>
                `;
            }

            todaysOfferGrid.innerHTML = offerHTML;
            
            // Store all products for "View More" functionality
            window.allTodaysOffers = allProducts;
            
            // Start countdown timer
            startOfferCountdown();
        })
        .catch(error => {
            console.error("Error loading today's offers:", error);
            todaysOfferGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.6;"></i>
                    <p>Unable to load today's offers. Please try again later.</p>
                </div>
            `;
        });
}

// ✅ Countdown Timer for Today's Offers
function startOfferCountdown() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!hoursElement || !minutesElement || !secondsElement) return;

    // Set countdown to end of day (midnight)
    function updateCountdown() {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const timeLeft = endOfDay - now;
        
        if (timeLeft <= 0) {
            // Reset for next day
            const nextDay = new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            const newTimeLeft = nextDay - now;
            
            const hours = Math.floor(newTimeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((newTimeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((newTimeLeft % (1000 * 60)) / 1000);
            
            hoursElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');
            secondsElement.textContent = seconds.toString().padStart(2, '0');
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Update countdown immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ✅ Show all today's offers function
function showAllTodaysOffers() {
    const todaysOfferGrid = document.getElementById('todaysOfferGrid');
    if (!todaysOfferGrid || !window.allTodaysOffers) return;

    let offerHTML = '';
    window.allTodaysOffers.forEach(product => {
        const firstImage = (product.imgUrl && product.imgUrl[0]) || 'https://via.placeholder.com/200x200?text=No+Image';
        
        // Calculate discount percentage
        const discount = calculateDiscountPercentage(product.oldPrice, product.newPrice);
        
        // Check if product is out of stock
        const isOutOfStockByCategory = product.categories && product.categories.includes('out-of-stock');
        const isOutOfStockByStock = typeof product.stock !== 'undefined' && Number(product.stock) <= 0;
        const outOfStock = isOutOfStockByCategory || isOutOfStockByStock;
        
        // Generate offer product card with 1:1 ratio image
        offerHTML += `
            <div class="offer-product-card" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="offer-image-container">
                    <img src="${firstImage}" alt="${product.name}" loading="lazy">
                    ${outOfStock ? '<div class="offer-out-of-stock-badge">Out of Stock</div>' : ''}
                </div>
                <h3 style="font-size: 1.1rem; margin: 10px 0; font-weight: 600; line-height: 1.3;">${product.name}</h3>
                <div class="offer-price">
                    ${product.oldPrice ? `<span class="offer-old-price">₹${product.oldPrice}</span>` : ''}
                    <span class="offer-new-price">₹${product.newPrice}</span>
                    ${discount ? `<span class="offer-discount">${discount}% OFF</span>` : ''}
                </div>
                ${outOfStock ? 
                    '<div class="offer-out-of-stock-message">Currently Unavailable</div>' :
                    `<div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="event.stopPropagation(); copyToWhatsApp('${product.name}', '${product.newPrice}')" 
                                style="flex: 1; padding: 10px; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                            <i class="fab fa-whatsapp"></i> Buy Now
                        </button>
                    </div>`
                }
            </div>
        `;
    });

    // Add "Show Less" button
    offerHTML += `
        <div class="offer-view-more-card" onclick="loadTodaysOffers()">
            <div class="offer-view-more-content">
                <i class="fas fa-minus" style="font-size: 0.9rem; margin-bottom: 2px; color: rgba(255,255,255,0.8);"></i>
                <h3 style="margin: 2px 0 0 0; font-size: 0.75rem; color: rgba(255,255,255,0.9); font-weight: 600;">Show Less</h3>
            </div>
        </div>
    `;

    todaysOfferGrid.innerHTML = offerHTML;

    todaysOfferGrid.innerHTML = offerHTML;
}

// Make filterProducts available globally for banner redirects
window.filterProducts = filterProducts;

// Debug function to test category filtering
window.debugCategoryFilter = function(categoryId) {
    console.log('🐛 DEBUG: Testing category filter for:', categoryId);
    console.log('🐛 Total products loaded:', allProducts.length);
    
    if (allProducts.length === 0) {
        console.log('❌ No products loaded yet');
        return;
    }
    
    // Show what categories exist in products
    const allCategories = new Set();
    allProducts.forEach(p => {
        if (p.categories && Array.isArray(p.categories)) {
            p.categories.forEach(cat => allCategories.add(cat));
        }
    });
    console.log('🏷️ Available categories in products:', Array.from(allCategories).sort());
    
    // Test the filter
    filterProducts([categoryId]);
};

// Force refresh products from Firebase
window.refreshProducts = function() {
    console.log('🔄 Force refreshing products from Firebase...');
    loadProducts();
};

// Check products in specific category
window.checkCategoryProducts = function(categoryName) {
    console.log('🔍 Checking products in category:', categoryName);
    
    if (allProducts.length === 0) {
        console.log('❌ No products loaded. Try window.refreshProducts() first');
        return;
    }
    
    const matchingProducts = allProducts.filter(product => {
        return product.categories && product.categories.some(cat => 
            cat.toLowerCase().includes(categoryName.toLowerCase()) ||
            categoryName.toLowerCase().includes(cat.toLowerCase())
        );
    });
    
    console.log(`📦 Found ${matchingProducts.length} products matching "${categoryName}":`);
    matchingProducts.forEach(p => {
        console.log(`  - ${p.name} [${p.categories.join(', ')}]`);
    });
    
    return matchingProducts;
};

// Debug function to check smartwatch filtering specifically
window.debugSmartwatchFilter = function() {
    console.log('🔍 SMARTWATCH DEBUG: Checking all products for smartwatch categorization');
    
    if (allProducts.length === 0) {
        console.log('❌ No products loaded. Try window.refreshProducts() first');
        return;
    }
    
    console.log('📱 Checking each product for smartwatch eligibility:');
    
    allProducts.forEach(product => {
        if (!product.categories || !Array.isArray(product.categories)) {
            console.log(`❌ ${product.name}: No categories`);
            return;
        }
        
        let shouldBeInSmartwatch = false;
        let reasons = [];
        
        product.categories.forEach(cat => {
            const productCategory = cat.toLowerCase().trim();
            
            // Check if it matches smartwatch patterns
            const smartwatchPatterns = ['smart watch', 'smartwatch', 'smartwatches', 'apple watch', 'fitness watch', 'wearable'];
            const matchesSmartwatch = smartwatchPatterns.some(pattern => productCategory.includes(pattern));
            
            if (matchesSmartwatch) {
                shouldBeInSmartwatch = true;
                reasons.push(`category "${cat}" matches smartwatch pattern`);
            }
            
            // Check exclusions (analog watch indicators)
            const analogWatchKeywords = ['analog', 'mechanical', 'quartz', 'fossil', 'casio', 'traditional', 'classic', 'vintage'];
            const isAnalogWatch = analogWatchKeywords.some(keyword => 
                productCategory.includes(keyword) || 
                (product.name && product.name.toLowerCase().includes(keyword))
            );
            
            if (isAnalogWatch) {
                const isSmartWatch = productCategory.includes('smart') || 
                                   productCategory.includes('apple') ||
                                   productCategory.includes('fitness') ||
                                   productCategory.includes('wearable') ||
                                   (product.name && (
                                       product.name.toLowerCase().includes('smart') ||
                                       product.name.toLowerCase().includes('apple watch') ||
                                       product.name.toLowerCase().includes('fitness') ||
                                       product.name.toLowerCase().includes('digital')
                                   ));
                
                if (!isSmartWatch) {
                    shouldBeInSmartwatch = false;
                    reasons.push(`excluded because it's analog/traditional watch`);
                }
            }
        });
        
        // Check product name for additional clues
        if (product.name) {
            const nameMatches = product.name.toLowerCase().includes('smart') ||
                               product.name.toLowerCase().includes('apple watch') ||
                               product.name.toLowerCase().includes('fitness');
            if (nameMatches) {
                shouldBeInSmartwatch = true;
                reasons.push(`product name "${product.name}" indicates smartwatch`);
            }
        }
        
        const status = shouldBeInSmartwatch ? '✅ SHOULD BE' : '❌ SHOULD NOT BE';
        console.log(`${status} in smartwatch: ${product.name}`);
        console.log(`   Categories: [${product.categories.join(', ')}]`);
        if (reasons.length > 0) {
            console.log(`   Reasons: ${reasons.join(', ')}`);
        }
        console.log('');
    });
};

// ✅ Initialize Today's Offers when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load today's offers if we're on the homepage
    if (document.getElementById('todaysOfferGrid')) {
        loadTodaysOffers();
    }
});

// ✅ Export functions to global scope for HTML onclick handlers
window.copyToWhatsApp = copyToWhatsApp;
window.closeUserInfoModal = closeUserInfoModal;
window.submitUserInfo = submitUserInfo;
window.showUserInfoModal = showUserInfoModal;
window.simpleRedirectToWhatsApp = simpleRedirectToWhatsApp;
