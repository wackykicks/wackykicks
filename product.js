// ✅ Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDogBkY_Xgx8Fw_3P0iOlVgciVArJHjy5Q",
    authDomain: "wackykicks-65cbe.firebaseapp.com",
    projectId: "wackykicks-65cbe",
    storageBucket: "wackykicks-65cbe.appspot.com",
    messagingSenderId: "911540684237",
    appId: "1:911540684237:web:faa772c146ff4acfadb084",
    measurementId: "G-7HWH0SEJN2"
};

// ✅ Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ✅ Calculate discount percentage (robust for string inputs)
function calculateDiscountPercentage(oldPrice, newPrice) {
    const o = parseFloat(oldPrice);
    const n = parseFloat(newPrice);
    if (!isFinite(o) || !isFinite(n) || o <= n) return null;
    return Math.round(((o - n) / o) * 100);
}

// ✅ Get Product ID
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// ✅ Global variables for selected options
let selectedSize = null;
let selectedColor = null;

function escapeHtmlAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function normalizeProductColor(colorData) {
    if (typeof colorData === 'string') {
        const raw = colorData.trim();
        const parts = raw.split(':');
        const lastPart = parts[parts.length - 1]?.trim().toLowerCase();
        const isOos = lastPart === 'oos' || lastPart === 'out-of-stock';
        const cleanParts = isOos ? parts.slice(0, -1) : parts;
        const name = (cleanParts[0] || 'Unknown').trim();
        const hex = (cleanParts[1] && cleanParts[1].trim())
            ? cleanParts[1].trim()
            : getColorHex(name);
        return { name, hex, inStock: !isOos };
    }
    if (colorData && typeof colorData === 'object') {
        const name = String(colorData.name || 'Unknown').trim();
        const hex = String(colorData.hex || getColorHex(name)).trim();
        const isOos = colorData.outOfStock === true ||
            colorData.inStock === false ||
            colorData.available === false ||
            (colorData.stock !== undefined && colorData.stock !== null && Number(colorData.stock) <= 0);
        return { name, hex, inStock: !isOos };
    }
    return { name: 'Unknown', hex: '#6b7280', inStock: true };
}

function isWholeProductOutOfStock(product) {
    if (!product) return false;
    const isOutOfStockByCategory = Boolean(
        product.categories && (
            product.categories.includes('out-of-stock') ||
            product.categories.includes('Out of Stock') ||
            (Array.isArray(product.categories) && product.categories.some(c => typeof c === 'string' && c.toLowerCase().trim() === 'out of stock'))
        )
    );
    const hasExplicitStock = product.stock !== undefined && product.stock !== null && String(product.stock).trim() !== '';
    const isOutOfStockByStock = hasExplicitStock && Number(product.stock) <= 0;
    const colors = Array.isArray(product.normalizedColors)
        ? product.normalizedColors
        : (Array.isArray(product.colors) ? product.colors.map(normalizeProductColor) : []);
    const allColorsOos = colors.length > 0 && colors.every(c => !c.inStock);
    return Boolean(product.isOutOfStock || isOutOfStockByCategory || isOutOfStockByStock || allColorsOos);
}

function isSelectedVariantOutOfStock(product = window.currentProductData, colorName = window.selectedColor) {
    if (isWholeProductOutOfStock(product) || document.querySelector('.out-of-stock-wrapper, .out-of-stock-main-btn')) {
        return { unavailable: true, reason: 'product', colorName: colorName || '' };
    }
    if (product && colorName) {
        const colors = Array.isArray(product.normalizedColors)
            ? product.normalizedColors
            : (Array.isArray(product.colors) ? product.colors.map(normalizeProductColor) : []);
        const target = String(colorName).trim().toLowerCase();
        const matched = colors.find(c => c.name.trim().toLowerCase() === target);
        if (matched && !matched.inStock) {
            return { unavailable: true, reason: 'color', colorName: matched.name };
        }
    }
    return { unavailable: false, reason: null, colorName: colorName || '' };
}

function getUnavailableVariantMessage(status) {
    if (status && status.reason === 'color' && status.colorName) {
        return `Sorry, "${status.colorName}" color is currently out of stock. Please choose another available color.`;
    }
    return 'Sorry, this product is currently out of stock.';
}

function updatePurchaseControlsForSelectedColor() {
    const product = window.currentProductData;
    const status = isSelectedVariantOutOfStock(product, window.selectedColor);
    const wholeOos = isWholeProductOutOfStock(product);
    const colorOosOnly = !wholeOos && status.unavailable && status.reason === 'color';

    const colorDisplay = document.getElementById('selectedColorDisplay');
    if (colorDisplay && window.selectedColor) {
        colorDisplay.textContent = (wholeOos || colorOosOnly)
            ? `${window.selectedColor} (Out of Stock)`
            : window.selectedColor;
        colorDisplay.classList.add('active');
        colorDisplay.classList.toggle('out-of-stock', wholeOos || colorOosOnly);
    }

    const oosNotice = document.getElementById('colorOosNotice');
    if (oosNotice) {
        oosNotice.style.display = colorOosOnly ? 'flex' : 'none';
    }

    const mainAddBtn = document.querySelector('.product-buttons .add-to-cart-btn');
    const mainBuyBtn = document.querySelector('.product-buttons .buy-now');
    const fixedBar = document.querySelector('.fixed-product-bar');
    const fixedAddBtn = document.getElementById('fixedAddToCart');
    const fixedBuyBtn = document.getElementById('fixedBuyNow');
    const qtyInput = document.getElementById('quantity');

    if (wholeOos) {
        if (fixedBar) {
            fixedBar.classList.add('out-of-stock');
            fixedBar.style.display = 'none';
        }
        [fixedAddBtn, fixedBuyBtn].forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.setAttribute('disabled', 'disabled');
                btn.style.display = 'none';
                btn.style.pointerEvents = 'none';
            }
        });
        return;
    }

    if (fixedBar) {
        fixedBar.classList.remove('out-of-stock');
        fixedBar.style.display = 'flex';
    }

    [mainAddBtn, fixedAddBtn].forEach(btn => {
        if (!btn) return;
        btn.disabled = colorOosOnly;
        btn.classList.toggle('variant-oos', colorOosOnly);
        btn.style.display = '';
        btn.style.pointerEvents = '';
        if (colorOosOnly) {
            btn.setAttribute('disabled', 'disabled');
        } else {
            btn.removeAttribute('disabled');
        }
    });

    [mainBuyBtn, fixedBuyBtn].forEach(btn => {
        if (!btn) return;
        btn.disabled = colorOosOnly;
        btn.classList.toggle('variant-oos', colorOosOnly);
        btn.style.display = '';
        btn.style.pointerEvents = '';
        if (colorOosOnly) {
            btn.setAttribute('disabled', 'disabled');
            btn.textContent = 'Color Out of Stock';
        } else {
            btn.removeAttribute('disabled');
            btn.textContent = 'Buy Now';
        }
    });

    if (qtyInput) {
        qtyInput.disabled = colorOosOnly;
    }
}

// ✅ Make scrollPhotoSlider global
function scrollPhotoSlider(direction) {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    slider.scrollBy({
        left: slider.offsetWidth * direction,
        behavior: 'smooth'
    });
}

// ✅ Render Product Details HTML & Setup Interactions (Reusable for 0ms cache & live data)
function renderProductDetails(product) {
    const productDetails = document.getElementById('productDetails');
    if (!productDetails || !product) return;

    // Store product data globally for checkout
    window.currentProductData = {
        ...product,
        photos: Array.isArray(product.imgUrl) ? product.imgUrl : (product.img ? [product.img] : (product.photos || []))
    };

    const images = Array.isArray(product.imgUrl) ? product.imgUrl : (product.img ? [product.img] : (product.photos || []));
    const sizes = product.sizes || [];
    const rawColors = Array.isArray(product.colors) ? product.colors : [];

    // Parse colors with per-color stock status
    const colors = rawColors.map(normalizeProductColor);
    if (window.currentProductData) {
        window.currentProductData.normalizedColors = colors;
    }

    // ✅ Build gallery HTML
    let galleryHTML = `
        <div class="slider">
    `;
    images.forEach(url => {
        galleryHTML += `
            <div class="image-slide">
                <img src="${url}" alt="${product.name}">
            </div>
        `;
    });
    galleryHTML += `</div>
        <div class="photo-slider-arrows">
            <button type="button" onclick="scrollPhotoSlider(-1)">&larr;</button>
            <div class="pagination" id="pagination"></div>
            <button type="button" onclick="scrollPhotoSlider(1)">&rarr;</button>
        </div>
    `;

    // Calculate discount percentage
    const discountPercentage = calculateDiscountPercentage(product.oldPrice, product.newPrice || product.price);

    // Check if product is out of stock via category assignment or stock field
    const isOutOfStockByCategory = Boolean(
        product.categories && (
            product.categories.includes('out-of-stock') ||
            product.categories.includes('Out of Stock') ||
            (Array.isArray(product.categories) && product.categories.some(c => typeof c === 'string' && c.toLowerCase().trim() === 'out of stock'))
        )
    );
    const hasExplicitStock = product.stock !== undefined && product.stock !== null && String(product.stock).trim() !== '';
    const isOutOfStockByStock = hasExplicitStock && Number(product.stock) <= 0;
    const allColorsOutOfStock = colors.length > 0 && colors.every(c => !c.inStock);
    const isOutOfStock = isOutOfStockByCategory || isOutOfStockByStock || allColorsOutOfStock;

    if (window.currentProductData) {
        window.currentProductData.isOutOfStock = isOutOfStock;
    }

    const firstInStockIndex = colors.findIndex(c => c.inStock);
    const defaultColorIndex = colors.length > 0 ? (firstInStockIndex !== -1 ? firstInStockIndex : 0) : -1;

    let sizesHTML = '';
    if (sizes.length) {
        sizesHTML = `
            <div class="sizes">
                <h4>Available Sizes:</h4>
                <select id="sizeDropdown" class="size-dropdown" onchange="selectSize(this.value)" ${isOutOfStock ? 'disabled style="background:#f3f4f6;cursor:not-allowed;"' : ''}>
                    <option value="">Select Size</option>
        `;
        sizes.forEach(size => {
            sizesHTML += `<option value="${size}">${size}</option>`;
        });
        sizesHTML += `
                </select>
            </div>
        `;
    }

    let colorsHTML = '';
    if (colors.length) {
        colorsHTML = `
            <div class="colors">
                <div class="modern-color-selection">
                    <div class="color-section-header">
                        <h4 class="color-section-title">Colors</h4>
                    </div>
                    <div class="color-circles-container">
        `;

        colors.forEach((colorObj, index) => {
            const colorName = colorObj.name;
            const hexColor = colorObj.hex;
            const isSelectedColor = index === defaultColorIndex;
            const isColorOos = isOutOfStock || !colorObj.inStock;
            colorsHTML += `
                <div class="product-color-circle${isSelectedColor ? ' selected' : ''}${isColorOos ? ' out-of-stock' : ''}" 
                     data-color-index="${index}"
                     data-color="${escapeHtmlAttr(colorName)}" 
                     data-hex="${escapeHtmlAttr(hexColor)}"
                     data-in-stock="${colorObj.inStock ? 'true' : 'false'}"
                     title="${escapeHtmlAttr(colorName + (isColorOos ? ' (Out of Stock)' : ''))}"
                     style="background: ${escapeHtmlAttr(hexColor)};${isOutOfStock ? ' opacity: 0.45; cursor: not-allowed; pointer-events: none;' : ''}"
                     onclick="${isOutOfStock ? 'return false;' : `selectProductColorByIndex(${index}, this)`}">
                </div>
            `;
        });

        const defaultColorObj = defaultColorIndex >= 0 ? colors[defaultColorIndex] : null;
        const defaultColorLabel = defaultColorObj
            ? `${defaultColorObj.name}${isOutOfStock || !defaultColorObj.inStock ? ' (Out of Stock)' : ''}`
            : 'Select Color';

        colorsHTML += `
                        <div class="selected-color-name${colors.length > 0 ? ' active' : ''}${defaultColorObj && (isOutOfStock || !defaultColorObj.inStock) ? ' out-of-stock' : ''}" id="selectedColorDisplay">
                            ${escapeHtmlAttr(defaultColorLabel)}
                        </div>
                    </div>
                    <div class="color-oos-notice" id="colorOosNotice" style="display: none;">
                        <i class="fas fa-ban"></i>
                        <span>Selected color is out of stock. Choose an available color.</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate product buttons HTML
    let productButtonsHTML = '';
    if (isOutOfStock) {
        const oosReasonText = (allColorsOutOfStock && !isOutOfStockByCategory && !isOutOfStockByStock)
            ? 'All color options are currently out of stock'
            : 'This product is currently unavailable';
        productButtonsHTML = `
            <div class="product-buttons out-of-stock-wrapper">
                <button class="out-of-stock-main-btn" disabled style="width: 100%; background: #9ca3af !important; color: #ffffff !important; border: none !important; border-radius: 8px !important; padding: 16px !important; font-size: 1.15rem !important; font-weight: 700 !important; cursor: not-allowed !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 10px !important; box-shadow: none !important; pointer-events: none !important;">
                    <i class="fas fa-ban"></i> Out of Stock
                </button>
                <p class="out-of-stock-subtext" style="width: 100%; text-align: center; margin-top: 10px; color: #dc2626; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="fas fa-exclamation-circle"></i> ${oosReasonText}
                </p>
            </div>
        `;
    } else {
        productButtonsHTML = `
            <div class="product-buttons">
                <button class="add-to-cart-btn" onclick="addProductToCart('${product.name.replace(/'/g, "\\'")}', '${product.newPrice || product.price}', '${product.oldPrice || ''}', '${images[0] ? images[0].replace(/'/g, "\\'") : ''}')">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
                <button class="buy-now" onclick="handleBuyNowClick()">Buy Now</button>
            </div>
        `;
    }

    // ✅ Inject product HTML
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
                    ${discountPercentage && !isOutOfStock ? `<span class="discount-tag-price">${discountPercentage}% OFF</span>` : ''}
                    ${isOutOfStock ? `<span class="out-stock-tag-price">Out of Stock</span>` : ''}
                </div>
                ${colorsHTML}
                <div class="quantity-container">
                    <span>Quantity:</span>
                    <input type="number" id="quantity" value="1" min="1" max="100" ${isOutOfStock ? 'disabled style="background:#f3f4f6;cursor:not-allowed;"' : ''}>
                </div>
                <button class="share-btn" onclick="shareProduct('${product.name}', '${product.newPrice || product.price}', window.location.href)">Share</button>
                ${sizesHTML}
                <p class="description">${product.description || 'No description available.'}</p>
                ${productButtonsHTML}
            </div>
        </div>
    `;

    // ✅ Setup slider & pagination (AFTER rendering HTML)
    const slider = document.querySelector('.slider');
    const pagination = document.getElementById('pagination');

    if (slider && pagination) {
        pagination.innerHTML = '';
        images.forEach((url, index) => {
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

    // ✅ Auto-adjust layout based on image size
    adjustLayoutToImageSize();

    // ✅ Initialize color selection (default to first available in-stock color)
    if (colors.length > 0 && defaultColorIndex >= 0) {
        selectedColor = colors[defaultColorIndex].name;
        window.selectedColor = selectedColor;
    } else {
        selectedColor = null;
        window.selectedColor = null;
    }

    // ✅ Immediately update fixed bottom product bar and variant controls
    updatePurchaseControlsForSelectedColor();
}

// ✅ Helper: Read cached product from high-capacity IndexedDB
function getProductFromIndexedDB(pid) {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
        try {
            const req = window.indexedDB.open('VexiorCatalogDB', 1);
            req.onsuccess = (e) => {
                try {
                    const idb = e.target.result;
                    if (!idb.objectStoreNames.contains('products_store')) return resolve(null);
                    const tx = idb.transaction('products_store', 'readonly');
                    const store = tx.objectStore('products_store');
                    const getReq = store.get('all_products');
                    getReq.onsuccess = () => {
                        const res = getReq.result;
                        if (res && Array.isArray(res.data)) {
                            const found = res.data.find(p => p.id === pid);
                            resolve(found || null);
                        } else {
                            resolve(null);
                        }
                    };
                    getReq.onerror = () => resolve(null);
                } catch (err) {
                    resolve(null);
                }
            };
            req.onerror = () => resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
}

// ✅ Helper: Fetch product directly via high-speed Google Cloud REST API (~100ms)
async function fetchProductViaRest(pid) {
    try {
        console.log('🌐 Fetching product via direct Google Cloud REST API...');
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/wackykicks-65cbe/databases/(default)/documents/products/${pid}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.fields) return null;
        const parseVal = (v) => {
            if (!v || 'nullValue' in v) return null;
            if ('stringValue' in v) return v.stringValue;
            if ('integerValue' in v) return parseInt(v.integerValue, 10);
            if ('doubleValue' in v) return parseFloat(v.doubleValue);
            if ('booleanValue' in v) return v.booleanValue;
            if ('timestampValue' in v) return v.timestampValue;
            if ('mapValue' in v) {
                const obj = {};
                const fields = v.mapValue.fields || {};
                for (const fk of Object.keys(fields)) {
                    obj[fk] = parseVal(fields[fk]);
                }
                return obj;
            }
            if ('arrayValue' in v) return (v.arrayValue.values || []).map(parseVal);
            return null;
        };
        const product = { id: pid };
        for (const k of Object.keys(data.fields)) {
            product[k] = parseVal(data.fields[k]);
        }
        product.img = Array.isArray(product.imgUrl) ? product.imgUrl[0] : (product.imgUrl || product.img || '');
        return product;
    } catch (e) {
        console.warn('REST product fetch failed:', e);
        return null;
    }
}

// ✅ Load Product with 0ms Instant Cache + High-Speed REST Revalidate (~100ms)
async function loadProduct() {
    const productDetails = document.getElementById('productDetails');

    if (!productId) {
        if (productDetails) productDetails.innerHTML = '<p>Product ID is missing in URL.</p>';
        return;
    }

    // ⚡ 1. Fire high-speed Google Cloud REST API fetch immediately in background (~100ms)
    const restPromise = fetchProductViaRest(productId);

    let renderedFromCache = false;

    // ⚡ 2. 0ms INSTANT RENDER: Check sessionStorage (from click) then localStorage products cache
    try {
        let cachedProduct = null;
        const sessionData = sessionStorage.getItem('vexior_active_product_' + productId);
        if (sessionData) {
            cachedProduct = JSON.parse(sessionData);
        } else {
            const allCached = localStorage.getItem('vexior_products_cache');
            if (allCached) {
                const parsed = JSON.parse(allCached);
                const list = Array.isArray(parsed) ? parsed : (parsed.data || []);
                cachedProduct = list.find(p => p.id === productId);
            }
        }

        if (cachedProduct) {
            console.log('⚡ Product rendered INSTANTLY from local cache in 0ms');
            renderProductDetails(cachedProduct);
            renderedFromCache = true;
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }

    // ⚡ 2b. Check IndexedDB if not found in sessionStorage or localStorage
    if (!renderedFromCache) {
        try {
            const idbProduct = await getProductFromIndexedDB(productId);
            if (idbProduct) {
                console.log('⚡ Product rendered INSTANTLY from IndexedDB cache in 0ms');
                renderProductDetails(idbProduct);
                renderedFromCache = true;
            }
        } catch (e) {
            console.warn('IndexedDB read error in loadProduct:', e);
        }
    }

    if (!renderedFromCache && productDetails) {
        productDetails.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #00a83e; margin-bottom: 15px;"></i>
                <p style="font-size: 1.1rem; font-weight: 500;">Loading product details...</p>
            </div>
        `;
    }

    // ⚡ 3. FAST LIVE SYNC: Google Cloud REST API returns live doc in ~100ms (bypassing slow Firestore SDK handshake)
    try {
        const freshProduct = await restPromise;
        if (freshProduct) {
            try { sessionStorage.setItem('vexior_active_product_' + productId, JSON.stringify(freshProduct)); } catch (e) {}
            // Sync into localStorage products cache so all tabs/pages are updated immediately
            try {
                const allCached = localStorage.getItem('vexior_products_cache');
                if (allCached) {
                    const parsed = JSON.parse(allCached);
                    const list = Array.isArray(parsed) ? parsed : (parsed.data || []);
                    const idx = list.findIndex(p => p.id === productId);
                    if (idx !== -1) {
                        list[idx] = { ...list[idx], ...freshProduct };
                        localStorage.setItem('vexior_products_cache', JSON.stringify(list));
                    }
                }
            } catch (e) {}

            renderProductDetails(freshProduct);
            return;
        }
    } catch (e) {
        console.warn('REST live sync failed, falling back to Firestore SDK:', e);
    }

    // ⚡ 4. Fallback to Firestore SDK if REST API was unavailable
    const dbInstance = (typeof db !== 'undefined' && db) ? db : (window.db || null);
    if (dbInstance) {
        dbInstance.collection("products").doc(productId).get().then(doc => {
            if (!doc.exists) {
                if (!renderedFromCache && productDetails) {
                    productDetails.innerHTML = `<p>Product not found.</p>`;
                }
                return;
            }
            const freshProduct = { id: doc.id, ...doc.data() };
            try { sessionStorage.setItem('vexior_active_product_' + productId, JSON.stringify(freshProduct)); } catch (e) {}
            renderProductDetails(freshProduct);
        }).catch(err => {
            console.error("Firestore SDK product fetch error:", err);
            if (!renderedFromCache && productDetails) {
                productDetails.innerHTML = `<p>Error loading product details.</p>`;
            }
        });
    } else if (!renderedFromCache && productDetails) {
        productDetails.innerHTML = `<p>Product not found.</p>`;
    }
}

// ✅ Custom Size Alert
function showSizeAlert() {
    if (window.FloatingAlertManager) {
        window.FloatingAlertManager.pleaseSelectSize();
    } else {
        // Fallback to original alert system
        // Remove any existing alert
        const oldAlert = document.getElementById('sizeAlert');
        if (oldAlert) oldAlert.remove();

        // Create alert container
        const alertDiv = document.createElement('div');
        alertDiv.id = 'sizeAlert';
        alertDiv.className = 'custom-size-alert';
        alertDiv.innerHTML = `
            <span class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
            <span class="alert-text">Please select a size before buying.</span>
            <button class="alert-close" onclick="document.getElementById('sizeAlert').remove()">&times;</button>
        `;

        // Insert alert above Buy Now button
        const productInfo = document.querySelector('.product-info');
        const buyBtn = productInfo ? productInfo.querySelector('.buy-now') : null;
        if (buyBtn && productInfo) {
            productInfo.insertBefore(alertDiv, buyBtn);
        } else {
            // fallback: top of productDetails
            document.getElementById('productDetails').prepend(alertDiv);
        }

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.remove();
        }, 3000);
    }
}

// ✅ Handle Buy Now Click
function handleBuyNowClick() {
    console.log('🛍️ Buy Now clicked');
    
    // Get product data from currentProductData
    if (!window.currentProductData) {
        console.error('No product data available');
        return;
    }

    // Comprehensive out-of-stock guard (whole product + selected color)
    const variantStatus = isSelectedVariantOutOfStock(window.currentProductData, window.selectedColor);
    if (variantStatus.unavailable) {
        const msg = getUnavailableVariantMessage(variantStatus);
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Unavailable', msg);
        } else {
            alert(msg);
        }
        return;
    }
    
    const productName = window.currentProductData.name;
    const productPrice = window.currentProductData.newPrice || window.currentProductData.price;
    
    // Get quantity and options
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    const size = window.selectedSize || '';
    const color = window.selectedColor || '';

    // Show user information modal
    showUserInfoModal(productName, productPrice, quantity, size, color);
}

// ✅ WhatsApp Buy Now with User Information Modal
function copyToWhatsApp(productName, productPrice) {
    console.log('🛍️ Buy Now clicked for:', productName);

    const variantStatus = isSelectedVariantOutOfStock(window.currentProductData, window.selectedColor);
    if (variantStatus.unavailable) {
        const msg = getUnavailableVariantMessage(variantStatus);
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Unavailable', msg);
        } else {
            alert(msg);
        }
        return;
    }

    // Get quantity and options
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    const size = window.selectedSize || '';
    const color = window.selectedColor || '';

    // Show user information modal
    showUserInfoModal(productName, productPrice, quantity, size, color);
}

// ✅ Show User Information Modal
function showUserInfoModal(productName, productPrice, quantity = 1, size = '', color = '') {
    // Get product image from current product data
    const productImage = window.currentProductData ? (window.currentProductData.photos && window.currentProductData.photos[0] ? window.currentProductData.photos[0] : '') : '';
    
    // Store product data in sessionStorage to avoid URL length limits
    const orderData = {
        id: (window.currentProductData && window.currentProductData.id) || productId || '',
        product: productName,
        price: productPrice,
        quantity: quantity,
        size: size || '',
        color: color || '',
        image: productImage
    };
    sessionStorage.setItem('buyNowProduct', JSON.stringify(orderData));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html?source=buynow';
    return; // Exit after redirect
    
    // Old modal code (won't execute)
    const existingModal = document.getElementById('userInfoModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="userInfoModal" class="user-info-modal">
            <div class="user-info-modal-content">
                <div class="modal-header">
                    <h2>Complete Your Purchase</h2>
                    <button class="close-modal" onclick="closeUserInfoModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-subtitle">Please provide your delivery information</p>
                    
                    <form id="userInfoForm" onsubmit="event.preventDefault(); submitUserInfo('${productName.replace(/'/g, "\\'")}', '${productPrice}', ${quantity}, '${size}', '${color}');">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="fullName">Name <span class="required">*</span></label>
                                <input type="text" id="fullName" name="fullName" placeholder="Full Name" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Mobile No. <span class="required">*</span></label>
                                <input type="tel" id="phone" name="phone" placeholder="10-digit number" required pattern="[0-9]{10}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="address">Address <span class="required">*</span></label>
                            <input type="text" id="address" name="address" placeholder="House No., Street, Area" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="pincode">Pincode <span class="required">*</span></label>
                                <input type="text" id="pincode" name="pincode" placeholder="6-digit pincode" required pattern="[0-9]{6}">
                            </div>
                            <div class="form-group">
                                <label for="city">City <span class="required">*</span></label>
                                <input type="text" id="city" name="city" placeholder="City" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="state">State <span class="required">*</span></label>
                            <select id="state" name="state" required>
                                <option value="">Select State</option>
                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                <option value="Assam">Assam</option>
                                <option value="Bihar">Bihar</option>
                                <option value="Chhattisgarh">Chhattisgarh</option>
                                <option value="Goa">Goa</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Haryana">Haryana</option>
                                <option value="Himachal Pradesh">Himachal Pradesh</option>
                                <option value="Jharkhand">Jharkhand</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Manipur">Manipur</option>
                                <option value="Meghalaya">Meghalaya</option>
                                <option value="Mizoram">Mizoram</option>
                                <option value="Nagaland">Nagaland</option>
                                <option value="Odisha">Odisha</option>
                                <option value="Punjab">Punjab</option>
                                <option value="Rajasthan">Rajasthan</option>
                                <option value="Sikkim">Sikkim</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Telangana">Telangana</option>
                                <option value="Tripura">Tripura</option>
                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                <option value="Uttarakhand">Uttarakhand</option>
                                <option value="West Bengal">West Bengal</option>
                                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                <option value="Chandigarh">Chandigarh</option>
                                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                <option value="Ladakh">Ladakh</option>
                                <option value="Lakshadweep">Lakshadweep</option>
                                <option value="Puducherry">Puducherry</option>
                            </select>
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

    // Add modal styles if not already added
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
}

// ✅ Close User Info Modal
function closeUserInfoModal() {
    const modal = document.getElementById('userInfoModal');
    if (modal) {
        modal.style.animation = 'modalSlideOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

// ✅ Submit User Info and Redirect to WhatsApp
function submitUserInfo(productName, productPrice, quantity, size, color) {
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

    // Create WhatsApp message
    let message = `Hey vexior! I'm interested in buying:\n\n`;
    message += `🛍️ *Product Details*\n`;
    message += `Product: ${productName}\n`;
    message += `Price: ₹${productPrice}\n`;
    if (quantity > 1) message += `Quantity: ${quantity}\n`;
    if (size) message += `Size: ${size}\n`;
    if (color) message += `Color: ${color}\n`;
    message += `\n`;

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
if (!document.getElementById('modalSlideOutAnimation')) {
    const slideOutAnimation = document.createElement('style');
    slideOutAnimation.id = 'modalSlideOutAnimation';
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

// ✅ Address Modal Functions
let currentPurchaseData = null;





// ✅ Enhanced WhatsApp Redirect Function with Multiple Fallbacks
function simpleRedirectToWhatsApp(message, phoneNumber = '917012131615') {
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
    if (!currentPurchaseData) return;

    console.log('🚀 Product: Proceeding without address');
    console.log('📦 Current purchase data:', currentPurchaseData);

    // Close modal first
    closeAddressModal();

    // Proceed with WhatsApp message without address
    const { productName, productPrice, quantity, selectedSize, selectedColor } = currentPurchaseData;

    let sizeMsg = selectedSize ? `\nSize: ${selectedSize}` : '';
    let colorMsg = selectedColor ? `\nColor: ${selectedColor}` : '';
    const qtyMsg = `\nQuantity: ${quantity}`;

    const message = `Hey vexior! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}${sizeMsg}${colorMsg}${qtyMsg}`;

    console.log('📱 Product: Sending message to WhatsApp');

    // Use simple redirect directly
    simpleRedirectToWhatsApp(message);
}

function proceedWithAddress() {
    if (!currentPurchaseData) return;

    console.log('🚀 Product: Proceeding with address');
    console.log('📦 Current purchase data:', currentPurchaseData);

    // Get address data
    const addressData = getAddressFormData();
    console.log('📍 Product: Address data:', addressData);

    // Save address to localStorage for future use
    if (addressData.hasData) {
        saveAddressToStorage(addressData);
    }

    // Close modal first
    closeAddressModal();

    // Proceed with WhatsApp message including address
    const { productName, productPrice, quantity, selectedSize, selectedColor } = currentPurchaseData;

    let sizeMsg = selectedSize ? `\nSize: ${selectedSize}` : '';
    let colorMsg = selectedColor ? `\nColor: ${selectedColor}` : '';
    const qtyMsg = `\nQuantity: ${quantity}`;

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

    const message = `Hey vexior! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}${sizeMsg}${colorMsg}${qtyMsg}${addressMsg}`;

    console.log('📱 Product: Sending message to WhatsApp with address');

    // Use simple redirect directly
    simpleRedirectToWhatsApp(message);
}

// ✅ Enhanced WhatsApp Redirect/Forward Function
function redirectToWhatsApp(message, phoneNumber = '917012131615') {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Validate message and phone number
    if (!message || !phoneNumber) {
        console.error('Missing message or phone number for WhatsApp redirect');
        return;
    }

    try {
        // Show loading/forwarding indicator
        showForwardingIndicator();

        // Safety timeout to always hide indicator
        const safetyTimeout = setTimeout(() => {
            hideForwardingIndicator();
        }, 3000);

        // Simplified and more reliable approach
        if (isMobileDevice()) {
            // On mobile devices - try app first, then web
            const whatsappAppUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

            // Create a more reliable redirect mechanism
            setTimeout(() => {
                let redirected = false;

                // Try to detect if app opens by checking page visibility
                const visibilityHandler = () => {
                    if (document.hidden) {
                        redirected = true;
                        clearTimeout(safetyTimeout);
                        hideForwardingIndicator();
                        document.removeEventListener('visibilitychange', visibilityHandler);
                    }
                };

                document.addEventListener('visibilitychange', visibilityHandler);

                // Try to open WhatsApp app
                try {
                    window.location.href = whatsappAppUrl;
                } catch (error) {
                    console.log('App redirect failed:', error);
                }

                // Fallback to web version after delay
                setTimeout(() => {
                    if (!redirected && !document.hidden) {
                        // App didn't open, use web version
                        document.removeEventListener('visibilitychange', visibilityHandler);
                        window.open(whatsappUrl, '_blank');
                    }
                    clearTimeout(safetyTimeout);
                    hideForwardingIndicator();
                }, 1200);

            }, 300);

        } else {
            // On desktop - directly open web WhatsApp
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                clearTimeout(safetyTimeout);
                hideForwardingIndicator();
            }, 500);
        }

    } catch (error) {
        console.error('Error in WhatsApp redirect:', error);
        hideForwardingIndicator();
        // Use simple fallback
        simpleWhatsAppRedirect(message, phoneNumber);
    }
}

// ✅ Simple WhatsApp Redirect Fallback Function
function simpleWhatsAppRedirect(message, phoneNumber = '917012131615') {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
        localStorage.setItem('vexior_saved_address', JSON.stringify(addressData));
        console.log('Address saved to localStorage');
    } catch (error) {
        console.error('Error saving address:', error);
    }
}

function loadSavedAddress() {
    try {
        const savedAddress = localStorage.getItem('vexior_saved_address');
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
        const savedAddress = localStorage.getItem('vexior_saved_address');
        return savedAddress !== null;
    } catch (error) {
        console.error('Error checking saved address:', error);
        return false;
    }
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('addressModal');
    if (event.target === modal) {
        closeAddressModal();
    }
});

// Close modal on Escape key
window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeAddressModal();
    }
});

// ✅ Add Product to Cart
function addProductToCart(productName, productPrice, productOldPrice, productImage) {
    const productSelectedSize = selectedSize || null;
    const productSelectedColor = selectedColor || null;

    const variantStatus = isSelectedVariantOutOfStock(window.currentProductData, productSelectedColor);
    if (variantStatus.unavailable) {
        const msg = getUnavailableVariantMessage(variantStatus);
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Unavailable', msg);
        } else {
            alert(msg);
        }
        return;
    }

    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    // Get address information if provided
    const customerName = document.getElementById('customerName')?.value.trim() || null;
    const customerPhone = document.getElementById('customerPhone')?.value.trim() || null;
    const customerAddress = document.getElementById('customerAddress')?.value.trim() || null;
    const customerPincode = document.getElementById('customerPincode')?.value.trim() || null;
    const saveAddress = document.getElementById('saveAddress')?.checked || false;

    // Create product object (carry live stock/colors metadata so cart.js validates accurately)
    const product = {
        id: productId,
        name: productName,
        price: productPrice,
        oldPrice: productOldPrice || null,
        img: productImage,
        categories: window.currentProductData?.categories || [],
        stock: window.currentProductData?.stock,
        colors: window.currentProductData?.colors || []
    };

    // Create address object if any address field is filled
    const addressInfo = (customerName || customerPhone || customerAddress || customerPincode) ? {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        pincode: customerPincode,
        saveForLater: saveAddress
    } : null;

    // Save address if requested
    if (addressInfo && saveAddress) {
        saveAddressToStorage(addressInfo);
    }

    // Add to cart using the global cart object
    if (typeof window.cart !== 'undefined') {
        window.cart.addToCart(product, quantity, productSelectedSize, productSelectedColor, addressInfo);
    } else {
        // Fallback: use the addToCart function from cart.js
        addToCart(product, quantity, productSelectedSize, productSelectedColor, addressInfo);
    }
}

// ✅ Address Storage Functions
function saveAddressToStorage(addressInfo) {
    try {
        localStorage.setItem('vexior_saved_address', JSON.stringify(addressInfo));
        console.log('Address saved to localStorage');
    } catch (error) {
        console.error('Error saving address:', error);
    }
}

function loadSavedAddressFromStorage() {
    try {
        const saved = localStorage.getItem('vexior_saved_address');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error loading saved address:', error);
        return null;
    }
}

function loadAddressIntoForm() {
    const savedAddress = loadSavedAddressFromStorage();
    if (savedAddress) {
        const nameInput = document.getElementById('customerName');
        const phoneInput = document.getElementById('customerPhone');
        const addressInput = document.getElementById('customerAddress');
        const pincodeInput = document.getElementById('customerPincode');
        const saveCheckbox = document.getElementById('saveAddress');

        if (nameInput) nameInput.value = savedAddress.name || '';
        if (phoneInput) phoneInput.value = savedAddress.phone || '';
        if (addressInput) addressInput.value = savedAddress.address || '';
        if (pincodeInput) pincodeInput.value = savedAddress.pincode || '';
        if (saveCheckbox) saveCheckbox.checked = true;

        console.log('Address loaded from storage');
    }
}

function clearSavedAddress() {
    try {
        localStorage.removeItem('vexior_saved_address');
        console.log('Saved address cleared');
    } catch (error) {
        console.error('Error clearing saved address:', error);
    }
}

// ✅ Run immediately on script execution to minimize load latency
if (document.getElementById('productDetails')) {
    loadProduct();
}

// ✅ Run on page load
window.addEventListener('DOMContentLoaded', () => {
    if (!window.currentProductData) {
        loadProduct();
    }
    loadRelatedProducts(); // ✅ Add this
    loadReviews(); // Load reviews for this product
    setupReviewForm(); // Setup review form functionality

    // Load saved address if available
    setTimeout(() => {
        loadAddressIntoForm();
    }, 1000); // Small delay to ensure form is rendered

    // Wire up fixed bar buttons safely
    const addBtn = document.getElementById('fixedAddToCart');
    const buyBtn = document.getElementById('fixedBuyNow');
    const fixedBar = document.querySelector('.fixed-product-bar');

    const checkFixedBarStock = () => {
        if (window.currentProductData) {
            updatePurchaseControlsForSelectedColor();
            return;
        }
        const isDomOos = Boolean(document.querySelector('.out-of-stock-wrapper, .out-of-stock-main-btn'));
        if (fixedBar && isDomOos) {
            fixedBar.classList.add('out-of-stock');
            fixedBar.style.display = 'none';
            if (addBtn) { addBtn.disabled = true; addBtn.style.display = 'none'; addBtn.style.pointerEvents = 'none'; }
            if (buyBtn) { buyBtn.disabled = true; buyBtn.style.display = 'none'; buyBtn.style.pointerEvents = 'none'; }
        }
    };

    checkFixedBarStock();
    setTimeout(checkFixedBarStock, 500);
    setTimeout(checkFixedBarStock, 1500);

    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const variantStatus = isSelectedVariantOutOfStock(window.currentProductData, window.selectedColor);
            if (variantStatus.unavailable) {
                alert(getUnavailableVariantMessage(variantStatus));
                return;
            }
            const name = window.currentProductData?.name || document.querySelector('.product-info h2')?.textContent || '';
            const price = window.currentProductData?.newPrice || window.currentProductData?.price || document.querySelector('.product-info .new-price')?.textContent.replace(/[^\d.]/g, '') || '';
            const oldPrice = window.currentProductData?.oldPrice || document.querySelector('.product-info .old-price')?.textContent.replace(/[^\d.]/g, '') || '';
            const img = (window.currentProductData?.photos && window.currentProductData.photos[0]) || document.querySelector('.product-gallery img')?.src || '';
            addProductToCart(name, price, oldPrice, img);
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const variantStatus = isSelectedVariantOutOfStock(window.currentProductData, window.selectedColor);
            if (variantStatus.unavailable) {
                alert(getUnavailableVariantMessage(variantStatus));
                return;
            }
            handleBuyNowClick();
        });
    }
});

window.addEventListener('scroll', () => {
    document.querySelectorAll('.feature').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add('visible');
        }
    });
});

// ✅ Load Related Products
async function loadRelatedProducts() {
    const relatedContainer = document.getElementById('relatedCarousel');

    if (!productId) {
        console.error('No product ID available for loading related products');
        return;
    }

    try {
        // First, check if current product is already available in memory/cache
        let currentProduct = window.currentProductData;
        if (!currentProduct) {
            const currentProductDoc = await db.collection("products").doc(productId).get();
            if (!currentProductDoc.exists) {
                console.error('Current product not found');
                return;
            }
            currentProduct = currentProductDoc.data();
        }

        const currentCategories = currentProduct.categories || [];
        const currentName = currentProduct.name || '';

        console.log('🔍 Finding related products for:', currentName);
        console.log('📂 Current product categories:', currentCategories);

        // Extract brand name from product name (common patterns)
        const brandKeywords = ['nike', 'adidas', 'puma', 'reebok', 'converse', 'vans', 'jordan', 'under armour', 'new balance', 'fossil', 'casio', 'apple', 'samsung', 'boat', 'noise', 'fire-boltt'];
        let detectedBrand = null;

        brandKeywords.forEach(brand => {
            if (currentName.toLowerCase().includes(brand)) {
                detectedBrand = brand;
            }
        });

        console.log('🏷️ Detected brand:', detectedBrand);

        // ⚡ Check local cache for all products first (0ms)
        let allProducts = [];
        try {
            const cached = localStorage.getItem('vexior_products_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                const list = Array.isArray(parsed) ? parsed : (parsed.data || []);
                allProducts = list.filter(p => p.id !== productId);
            }
        } catch (e) {}

        // Fallback to Firestore if no cache available
        if (!allProducts || allProducts.length === 0) {
            const allProductsSnapshot = await db.collection("products").get();
            allProducts = [];
            allProductsSnapshot.forEach(doc => {
                if (doc.id === productId) return;
                allProducts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }

        console.log('📦 Total related candidate products:', allProducts.length);

        // Score products based on similarity
        const scoredProducts = allProducts.map(product => {
            let score = 0;
            const productCategories = product.categories || [];
            const productName = product.name || '';

            // Brand matching (highest priority) - 50 points
            if (detectedBrand) {
                if (productName.toLowerCase().includes(detectedBrand)) {
                    score += 50;
                }
            }

            // Category matching - 20 points per matching category
            const matchingCategories = currentCategories.filter(cat =>
                productCategories.some(pCat =>
                    pCat.toLowerCase() === cat.toLowerCase() ||
                    pCat.toLowerCase().includes(cat.toLowerCase()) ||
                    cat.toLowerCase().includes(pCat.toLowerCase())
                )
            );

            score += matchingCategories.length * 20;

            // Similar product type keywords - 15 points each
            const typeKeywords = ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'watch', 'watches', 'glass', 'glasses', 'sunglass', 'sunglasses', 'headphone', 'headphones', 'earphone', 'earphones'];
            const currentTypeKeywords = typeKeywords.filter(keyword => currentName.toLowerCase().includes(keyword));
            const productTypeKeywords = typeKeywords.filter(keyword => productName.toLowerCase().includes(keyword));

            const matchingTypeKeywords = currentTypeKeywords.filter(keyword => productTypeKeywords.includes(keyword));
            score += matchingTypeKeywords.length * 15;

            // Price range similarity - 10 points
            const currentPrice = currentProduct.newPrice || currentProduct.price || 0;
            const productPrice = product.newPrice || product.price || 0;
            const priceDifference = Math.abs(currentPrice - productPrice);
            const priceRange = Math.max(currentPrice, productPrice) * 0.3; // 30% price range tolerance

            if (priceDifference <= priceRange) {
                score += 10;
            }

            // Color similarity - 5 points
            if (Array.isArray(currentProduct.colors) && Array.isArray(product.colors)) {
                const getColorName = (c) => (typeof c === 'string' ? c : (c && c.name ? c.name : '')).toLowerCase();
                const currentColors = currentProduct.colors.map(getColorName).filter(Boolean);
                const productColors = product.colors.map(getColorName).filter(Boolean);
                const matchingColors = currentColors.filter(color => productColors.includes(color));
                score += matchingColors.length * 5;
            }

            return { ...product, score };
        });

        // Sort by score (highest first) and take top 8
        let relatedProducts = scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

        console.log('🏆 Top related products:', relatedProducts.slice(0, 6).map(p => `${p.name} (Score: ${p.score})`));

        // If we don't have enough highly scored products (score > 0), fill with random ones
        if (relatedProducts.filter(p => p.score > 0).length < 6) {
            const randomProducts = scoredProducts
                .filter(p => p.score === 0)
                .sort(() => Math.random() - 0.5)
                .slice(0, 6 - relatedProducts.filter(p => p.score > 0).length);
            relatedProducts = [...relatedProducts.filter(p => p.score > 0), ...randomProducts];
        }

        // Take only first 6 for display
        relatedProducts = relatedProducts.slice(0, 6);

        // Clear container and render related products
        relatedContainer.innerHTML = '';
        relatedProducts.forEach(product => {
            const relatedDiscountPercentage = calculateDiscountPercentage(product.oldPrice, product.newPrice || product.price);

            // Check if product is out of stock (category, stock field, or all colors OOS)
            const isOutOfStock = isWholeProductOutOfStock(product);

            const relatedCard = document.createElement('div');
            relatedCard.className = 'related-card';
            relatedCard.innerHTML = `
                <a href="product.html?id=${product.id}">
                    ${relatedDiscountPercentage && !isOutOfStock ? `<span class="discount-tag">${relatedDiscountPercentage}% OFF</span>` : ''}
                    ${isOutOfStock ? `<span class="discount-tag" style="background: linear-gradient(135deg, #ef4444, #dc2626);">Out of Stock</span>` : ''}
                    <img src="${(Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl) || 'Logo/VEXIOR_logo.png'}" alt="${product.name}" onerror="this.src='Logo/VEXIOR_logo.png'">
                    <h4>${product.name}</h4>
                    <div class="price">
                        ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
                        <span class="new-price">₹${product.newPrice || product.price}</span>
                    </div>
                </a>
            `;

            relatedContainer.appendChild(relatedCard);
        });

        console.log('✅ Related products loaded successfully');

    } catch (error) {
        console.error("Error loading related products:", error);
        relatedContainer.innerHTML = `<p>Unable to load related products.</p>`;
    }
}

function scrollCarousel(direction) {
    const carousel = document.getElementById('relatedCarousel');
    const scrollAmount = 220; // Adjust based on card width
    carousel.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
    });
}

// ✅ Auto-adjust layout based on image dimensions
function adjustLayoutToImageSize() {
    const productContainer = document.querySelector('.product-container');
    const firstImage = document.querySelector('.image-slide img');

    if (!productContainer || !firstImage) return;

    firstImage.onload = function () {
        const imageAspectRatio = this.naturalWidth / this.naturalHeight;
        const imageWidth = this.offsetWidth;

        // If image is smaller or more square, reduce gap
        if (imageAspectRatio >= 0.8 && imageWidth < 400) {
            productContainer.style.gap = '15px';
            productContainer.classList.add('compact-layout');
        } else if (imageWidth < 300) {
            productContainer.style.gap = '10px';
            productContainer.classList.add('very-compact-layout');
        } else {
            // Default gap for larger images
            productContainer.style.gap = '30px';
            productContainer.classList.remove('compact-layout', 'very-compact-layout');
        }
    };

    // If image is already loaded
    if (firstImage.complete) {
        firstImage.onload();
    }
}

window.selectSize = function (size) {
    selectedSize = size;
    window.selectedSize = size; // Also set on window for backward compatibility
    const dropdown = document.getElementById('sizeDropdown');
    if (dropdown) {
        dropdown.value = size;
    }
    console.log('Selected size:', size);
};

window.selectColor = function (color) {
    selectedColor = color;
    window.selectedColor = color; // Also set on window for backward compatibility
    const dropdown = document.getElementById('colorDropdown');
    if (dropdown) {
        dropdown.value = color;
    }
    console.log('Selected color:', color);
};

// Enhanced Color mapping function with custom color support
function getColorHex(colorName) {
    // If colorName is already a hex value, return it
    if (colorName.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(colorName)) {
        return colorName;
    }

    // If colorName looks like a CSS color value, return it
    if (colorName.startsWith('rgb') || colorName.startsWith('hsl')) {
        return colorName;
    }

    const colorMap = {
        // Basic colors
        'Red': '#ef4444',
        'Pink': '#ec4899',
        'Rose': '#f43f5e',
        'Orange': '#f97316',
        'Yellow': '#eab308',
        'Green': '#22c55e',
        'Blue': '#3b82f6',
        'Purple': '#8b5cf6',
        'Violet': '#7c3aed',
        'Indigo': '#6366f1',
        'Black': '#000000',
        'White': '#ffffff',
        'Gray': '#6b7280',
        'Grey': '#6b7280',
        'Brown': '#a3744c',
        'Navy': '#1e3a8a',
        'Maroon': '#991b1b',
        'Teal': '#14b8a6',
        'Turquoise': '#06b6d4',
        'Gold': '#ffd700',
        'Silver': '#c0c0c0',
        'Lime': '#84cc16',
        'Coral': '#ff6b6b',
        'Tan': '#d2b48c',
        'Beige': '#f5f5dc',
        'Crimson': '#dc2626',
        'Burgundy': '#7f1d1d',

        // Additional common colors
        'Sky Blue': '#87ceeb',
        'Royal Blue': '#4169e1',
        'Light Blue': '#add8e6',
        'Dark Blue': '#00008b',
        'Forest Green': '#228b22',
        'Olive': '#808000',
        'Mint': '#98fb98',
        'Mint Green': '#98fb98',
        'Lavender': '#e6e6fa',
        'Salmon': '#fa8072',
        'Khaki': '#f0e68c',
        'Cyan': '#00ffff',
        'Magenta': '#ff00ff',
        'Ivory': '#fffff0',
        'Cream': '#fffdd0',
        'Rose Gold': '#e8b4b8',
        'Champagne': '#f7e7ce',
        'Emerald': '#50c878',
        'Sapphire': '#0f52ba',
        'Ruby': '#e0115f',
        'Amber': '#ffbf00',
        'Jade': '#00a86b',
        'Aqua': '#00ffff',
        'Fuchsia': '#ff00ff',
        'Peach': '#ffcba4',
        'Mint': '#3eb489',
        'Dusty Rose': '#dcae96',
        'Sage': '#9caf88',
        'Slate': '#708090',
        'Copper': '#b87333',
        'Bronze': '#cd7f32',

        // Common shoe/fashion colors
        'Off White': '#faf0e6',
        'Cream White': '#fffdd0',
        'Bone': '#f9f6ee',
        'Antique White': '#faebd7',
        'Pearl': '#eae0c8',
        'Platinum': '#e5e4e2',
        'Charcoal': '#36454f',
        'Jet Black': '#0a0a0a',
        'Midnight': '#191970',
        'Steel': '#71797e',
        'Gunmetal': '#2a3439',
        'Mahogany': '#c04000',
        'Chestnut': '#954535',
        'Caramel': '#af6f09',
        'Espresso': '#6f4e37',
        'Mocha': '#967117',
        'Taupe': '#483c32',
        'Mushroom': '#adaba8',
        'Stone': '#928e85',
        'Sand': '#c2b280',
        'Desert': '#c19a6b',
        'Clay': '#b66a50'
    };

    // Try exact match first
    if (colorMap[colorName]) {
        return colorMap[colorName];
    }

    // Try case-insensitive match
    const lowerColorName = colorName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
        if (key.toLowerCase() === lowerColorName) {
            return value;
        }
    }

    // Try partial matching for custom colors (more comprehensive)
    for (const [key, value] of Object.entries(colorMap)) {
        const keyLower = key.toLowerCase();
        // Check if the color name contains any of the mapped color names
        if (lowerColorName.includes(keyLower) || keyLower.includes(lowerColorName)) {
            return value;
        }
        // Also check for common variations like "light blue", "dark red", etc.
        if (lowerColorName.includes(keyLower.split(' ')[0]) || keyLower.includes(lowerColorName.split(' ')[0])) {
            return value;
        }
    }

    // Try to match common color prefixes/suffixes
    const colorVariations = {
        'light': (color) => lightenColor(color, 20),
        'dark': (color) => darkenColor(color, 20),
        'bright': (color) => saturateColor(color, 20),
        'pale': (color) => lightenColor(color, 30),
        'deep': (color) => darkenColor(color, 30)
    };

    for (const [variation, modifier] of Object.entries(colorVariations)) {
        if (lowerColorName.includes(variation)) {
            const baseColorName = lowerColorName.replace(variation, '').trim();
            for (const [key, value] of Object.entries(colorMap)) {
                if (key.toLowerCase().includes(baseColorName) || baseColorName.includes(key.toLowerCase())) {
                    return modifier(value);
                }
            }
        }
    }

    // Generate a color based on the color name hash for custom colors
    return generateColorFromName(colorName);
}

// Generate a consistent color from a color name for custom colors
function generateColorFromName(colorName) {
    // Simple hash function to generate consistent colors for custom names
    let hash = 0;
    for (let i = 0; i < colorName.length; i++) {
        const char = colorName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Make colors more appealing by using a better palette
    const colorPalette = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
        '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
        '#10b981', '#6366f1', '#8b5cf6', '#f43f5e', '#84cc16',
        '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899', '#f97316'
    ];

    // Use hash to pick from the predefined palette for more appealing colors
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
}

// Helper functions for color manipulation
function lightenColor(hex, percent) {
    if (hex.startsWith('hsl')) return hex; // Return as-is for HSL colors
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darkenColor(hex, percent) {
    if (hex.startsWith('hsl')) return hex; // Return as-is for HSL colors
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}

function saturateColor(hex, percent) {
    if (hex.startsWith('hsl')) return hex; // Return as-is for HSL colors
    // For simplicity, just return the original color with slight brightness adjustment
    return lightenColor(hex, percent / 2);
}

// Modern color selection function
window.selectProductColorByIndex = function (index, element) {
    const colors = window.currentProductData?.normalizedColors || [];
    const entry = colors[index];
    if (entry) {
        window.selectProductColor(entry.name, entry.hex, element);
    } else if (element) {
        window.selectProductColor(element.dataset.color || '', element.dataset.hex || '', element);
    }
};

window.selectProductColor = function (colorName, hexValue, element) {
    selectedColor = colorName;
    window.selectedColor = colorName; // Also set on window for backward compatibility

    // Update visual selection
    document.querySelectorAll('.product-color-circle').forEach(circle => {
        circle.classList.remove('selected');
    });

    if (element) {
        element.classList.add('selected');
    }

    // Update selected color label & purchase buttons for availability
    updatePurchaseControlsForSelectedColor();

    console.log('Selected color:', colorName, hexValue);
};

function shareProduct(name, price, url) {
    const message = `Check out this product on vexior!\n${name}\nPrice: ₹${price}\n${url}`;

    if (navigator.share) {
        navigator.share({
            title: name,
            text: message,
            url: url,
        }).then(() => {
            // Optionally show a toast or message
        }).catch(error => {
            if (window.FloatingAlertManager) {
                window.FloatingAlertManager.operationError('Sharing', 'was cancelled');
            } else {
                alert("Sharing failed or was cancelled.");
            }
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            if (window.FloatingAlertManager) {
                window.FloatingAlertManager.linkCopied();
            } else {
                alert("Link copied! You can share it anywhere.");
            }
        });
    } else {
        // Fallback for very old browsers
        prompt("Copy this link to share:", url);
    }
}

// ✅ Review System Functions
let selectedRating = 0;

function loadReviews() {
    console.log('🔍 === STARTING REVIEW LOADING PROCESS ===');
    console.log('Current productId from URL:', productId);
    console.log('Current URL:', window.location.href);

    if (!productId) {
        console.error('❌ No productId available for loading reviews');
        return;
    }

    const reviewsContainer = document.getElementById('reviewsContainer');
    const reviewsOverview = document.getElementById('reviewsOverview');
    if (!reviewsContainer) {
        console.error('❌ Reviews container not found in DOM');
        return;
    }

    console.log('✅ Reviews container found, starting Firebase query...');

    // Load reviews from Firestore (without orderBy to avoid index issues)
    db.collection("reviews")
        .where("productId", "==", productId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                reviewsContainer.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review this product!</div>';
                reviewsOverview.innerHTML = '<div class="no-reviews">No reviews available for this product yet.</div>';
                return;
            }

            const reviews = [];
            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            // Sort reviews by timestamp client-side (newest first)
            reviews.sort((a, b) => {
                if (!a.timestamp && !b.timestamp) return 0;
                if (!a.timestamp) return 1;
                if (!b.timestamp) return -1;
                return b.timestamp.seconds - a.timestamp.seconds;
            });

            displayReviews(reviews);
            displayAverageRating(reviews);
        })
        .catch(error => {
            console.error("❌ DETAILED ERROR loading reviews:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                name: error.name,
                stack: error.stack
            });
            console.error("ProductId that failed:", productId);
            console.error("Current URL:", window.location.href);

            const errorMsg = error.message || error.code || 'Unknown error';
            reviewsContainer.innerHTML = `
                <div class="no-reviews" style="color: #dc3545; padding: 20px; border: 1px solid #dc3545; border-radius: 8px; background: #f8f9fa;">
                    <h4>🔧 Debug Information:</h4>
                    <p><strong>Error:</strong> ${errorMsg}</p>
                    <p><strong>Product ID:</strong> ${productId}</p>
                    <p><strong>URL:</strong> ${window.location.href}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p style="font-size: 0.9em; color: #666;">Open browser console (F12) for detailed error information.</p>
                </div>
            `;
            reviewsOverview.innerHTML = `<div class="no-reviews" style="color: #dc3545;">Database Error: ${errorMsg}</div>`;
        });
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviewsContainer');

    // Separate reviews by rating
    const goodReviews = reviews.filter(review => review.rating >= 4);
    const badReviews = reviews.filter(review => review.rating <= 2);
    const averageReviews = reviews.filter(review => review.rating === 3);

    // Select initial reviews to show (2-3 good, 2-3 bad)
    const initialGoodReviews = goodReviews.slice(0, 3);
    const initialBadReviews = badReviews.slice(0, 2);
    const initialReviews = [...initialGoodReviews, ...initialBadReviews];

    // Remaining reviews for "View More"
    const remainingReviews = [
        ...goodReviews.slice(3),
        ...badReviews.slice(2),
        ...averageReviews
    ];

    function createReviewHTML(review) {
        const date = review.timestamp ? new Date(review.timestamp.seconds * 1000).toLocaleDateString() : 'Recently';
        const reviewerInitial = (review.reviewerName || 'A').charAt(0).toUpperCase();

        // Create star display
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHTML += '<span class="review-star">★</span>';
            } else {
                starsHTML += '<span class="review-star empty">★</span>';
            }
        }

        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-avatar">${reviewerInitial}</div>
                    <div class="review-info">
                        <div class="reviewer-name">${review.reviewerName || 'Anonymous'}</div>
                        <div class="review-meta">
                            <div class="review-rating">${starsHTML}</div>
                            <div class="review-date">${date}</div>
                        </div>
                    </div>
                </div>
                <div class="review-text">${review.reviewText}</div>
            </div>
        `;
    }

    // Create HTML for initial reviews
    let initialReviewsHTML = '';
    initialReviews.forEach(review => {
        initialReviewsHTML += createReviewHTML(review);
    });

    // Create HTML for remaining reviews (hidden initially)
    let remainingReviewsHTML = '';
    remainingReviews.forEach(review => {
        remainingReviewsHTML += createReviewHTML(review);
    });

    // Create the complete HTML structure
    let reviewsHTML = `
        <div id="initialReviews">
            ${initialReviewsHTML}
        </div>
    `;

    if (remainingReviews.length > 0) {
        reviewsHTML += `
            <div id="remainingReviews" style="display: none;">
                ${remainingReviewsHTML}
            </div>
            <div class="view-more-container" style="text-align: center; margin: 20px 0;">
                <button id="viewMoreBtn" class="view-more-btn" onclick="toggleMoreReviews()">
                    View More Reviews (${remainingReviews.length})
                </button>
            </div>
        `;
    }

    reviewsContainer.innerHTML = reviewsHTML;
}

// Function to toggle "View More" reviews
function toggleMoreReviews() {
    const remainingReviews = document.getElementById('remainingReviews');
    const viewMoreBtn = document.getElementById('viewMoreBtn');

    if (remainingReviews.style.display === 'none') {
        remainingReviews.style.display = 'block';
        viewMoreBtn.textContent = 'Show Less Reviews';
        viewMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        remainingReviews.style.display = 'none';
        viewMoreBtn.textContent = `View More Reviews (${remainingReviews.children.length})`;
        document.getElementById('initialReviews').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Make functions globally available
window.toggleMoreReviews = toggleMoreReviews;
window.copyToWhatsApp = copyToWhatsApp;
window.handleBuyNowClick = handleBuyNowClick;
window.closeUserInfoModal = closeUserInfoModal;
window.submitUserInfo = submitUserInfo;
window.showUserInfoModal = showUserInfoModal;

function displayAverageRating(reviews) {
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length; // Keep as number for calculations
    const averageRatingText = averageRating.toFixed(1); // String for display

    // Calculate rating breakdown
    const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
    reviews.forEach(review => {
        ratingCounts[review.rating - 1]++;
    });

    // Create star display for overall rating
    let starsHTML = '';
    const fullStars = Math.floor(averageRating);
    const hasHalf = (averageRating % 1) >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '<span class="star-large filled">★</span>';
        } else if (i === fullStars + 1 && hasHalf) {
            starsHTML += '<span class="star-large half">★</span>';
        } else {
            starsHTML += '<span class="star-large">★</span>';
        }
    }

    // Create rating bars
    let ratingBarsHTML = '';
    for (let i = 4; i >= 0; i--) {
        const count = ratingCounts[i];
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        ratingBarsHTML += `
            <div class="rating-bar-container">
                <span class="rating-number">${i + 1}</span>
                <div class="rating-bar">
                    <div class="rating-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-bar-count">${count} review${count !== 1 ? 's' : ''}</span>
            </div>
        `;
    }

    // Category ratings (mock data for demo - you can expand this)
    const categoryRatings = [
        { name: 'Quality', score: Math.max(1, Math.min(5, averageRating + 0.2)).toFixed(1) },
        { name: 'Comfort', score: Math.max(1, Math.min(5, averageRating - 0.1)).toFixed(1) },
        { name: 'Style', score: Math.max(1, Math.min(5, averageRating + 0.1)).toFixed(1) },
        { name: 'Value', score: Math.max(1, Math.min(5, averageRating - 0.3)).toFixed(1) }
    ];

    let categoryHTML = '';
    categoryRatings.forEach(category => {
        categoryHTML += `
            <div class="category-rating">
                <div class="category-score">${category.score}</div>
                <div class="category-name">${category.name}</div>
            </div>
        `;
    });

    const overviewHTML = `
        <div class="reviews-summary">
            <h3>Reviews</h3>
            <div class="rating-overview">
                <div class="overall-rating">${averageRatingText}</div>
                <div>
                    <div class="rating-stars-large">${starsHTML}</div>
                    <div class="rating-count">${reviews.length} rating${reviews.length !== 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="category-ratings">
                ${categoryHTML}
            </div>
        </div>
        <div class="rating-breakdown">
            ${ratingBarsHTML}
        </div>
    `;

    const reviewsOverview = document.getElementById('reviewsOverview');
    reviewsOverview.innerHTML = overviewHTML;
}

function setupReviewForm() {
    const stars = document.querySelectorAll('.star');
    const reviewForm = document.getElementById('reviewForm');

    if (!stars.length || !reviewForm) return;

    // Setup star rating
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStarDisplay();
        });

        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
        });
    });

    document.getElementById('starRating').addEventListener('mouseleave', () => {
        updateStarDisplay();
    });

    // Setup form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitReview();
    });
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffc107';
        } else {
            star.style.color = '#ddd';
        }
    });
}

async function submitReview() {
    if (!productId) {
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.operationError('Review submission', 'Product ID not found');
        } else {
            alert('Product ID not found.');
        }
        return;
    }

    if (selectedRating === 0) {
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.pleaseSelectRating();
        } else {
            alert('Please select a rating.');
        }
        return;
    }

    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewText = document.getElementById('reviewText').value.trim();

    if (!reviewerName || !reviewText) {
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.pleaseFillAllFields();
        } else {
            alert('Please fill in all fields.');
        }
        return;
    }

    try {
        await db.collection("reviews").add({
            productId: productId,
            reviewerName: reviewerName,
            reviewText: reviewText,
            rating: selectedRating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.reviewSubmitted();
        } else {
            alert('Review submitted successfully!');
        }

        // Reset form
        document.getElementById('reviewForm').reset();
        selectedRating = 0;
        updateStarDisplay();

        // Reload reviews
        setTimeout(() => {
            // Remove existing average rating display
            const existingAverage = document.querySelector('.average-rating');
            if (existingAverage) existingAverage.remove();
            loadReviews();
        }, 500);

    } catch (error) {
        console.error("Error submitting review:", error);
        if (window.FloatingAlertManager) {
            window.FloatingAlertManager.reviewError();
        } else {
            alert('Error submitting review. Please try again.');
        }
    }
}