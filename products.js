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

// ✅ WhatsApp Buy Now
function copyToWhatsApp(productName, productPrice) {
    const message = `Hey WackyKicks! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}`;
    window.open(`https://wa.me/918138999550?text=${encodeURIComponent(message)}`, '_blank');
}

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
        if (product.sizes && product.sizes.length > 0) {
            sizesHTML = `
                <div class="sizes">
                    <label>Size:</label>
                    <div class="size-options">
                        ${product.sizes.map(size => `<span class="size-option">${size}</span>`).join('')}
                    </div>
                </div>
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
                    <button class="buy-now" onclick="copyToWhatsApp('${product.name}', '${product.newPrice || product.price}')">Buy Now</button>
                    <button class="share-btn" onclick="shareProduct('${product.name}', '${product.newPrice || product.price}', window.location.href)">Share</button>
                </div>
            </div>
        `;

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
function filterProducts(categories = []) {
    console.log('🔍 filterProducts called with categories:', categories);
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
    
    const categoryFilteredProducts = allProducts.filter(product => {
        if (!product.categories || product.categories.length === 0) {
            console.log('❌ Product has no categories:', product.name);
            return false;
        }
        
        // Check for exact match, case-insensitive match, and partial match
        const hasCategory = product.categories.some(cat => {
            const exactMatch = cat === categoryId;
            const caseInsensitiveMatch = cat.toLowerCase() === categoryId.toLowerCase();
            const partialMatch = cat.toLowerCase().includes(categoryId.toLowerCase()) || 
                               categoryId.toLowerCase().includes(cat.toLowerCase());
            
            console.log(`🔍 Checking product "${product.name}" category "${cat}" against "${categoryId}":`, {
                exactMatch, caseInsensitiveMatch, partialMatch
            });
            
            return exactMatch || caseInsensitiveMatch || partialMatch;
        });
        
        return hasCategory;
    });
    
    console.log('✅ Filtered products found:', categoryFilteredProducts.length);
    categoryFilteredProducts.forEach(p => console.log('  - ', p.name, 'categories:', p.categories));
    
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
            <button class="buy-now" ${outOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''} onclick="event.stopPropagation(); copyToWhatsApp('${product.name.replace(/'/g, "\\'")}', '${product.newPrice || product.price}')">Buy Now</button>
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
                if (!product.categories || product.categories.length === 0) return false;
                
                // Check for exact match, case-insensitive match, and partial match
                return product.categories.some(cat => {
                    const exactMatch = cat === categoryId;
                    const caseInsensitiveMatch = cat.toLowerCase() === categoryId.toLowerCase();
                    const partialMatch = cat.toLowerCase().includes(categoryId.toLowerCase()) || 
                                       categoryId.toLowerCase().includes(cat.toLowerCase());
                    return exactMatch || caseInsensitiveMatch || partialMatch;
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

    db.collection("products").get().then(snapshot => {
        console.log('✅ Connected to Firebase successfully');
        console.log('📦 Number of products found:', snapshot.size);
        
        allProducts = [];
        snapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            const firstImage = Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl;
            allProducts.push({ 
                ...product, 
                id: productId, 
                img: firstImage,
                categories: product.categories || [] // Ensure categories array exists
            });
        });
        
        console.log('🎯 Products loaded:', allProducts.length);
        console.log('📋 First product:', allProducts[0]);
        renderProducts(allProducts);
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
                    <div>
                        <div class="title">${p.name || 'Product'}</div>
                        <div class="subtitle">${(p.description || '').slice(0, 60)}</div>
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
                    if (!Array.isArray(p.categories)) return false;
                    const categoryId = selectedCategories[0];
                    return p.categories.some(cat => {
                        const exactMatch = cat === categoryId;
                        const caseInsensitiveMatch = cat.toLowerCase() === categoryId.toLowerCase();
                        const partialMatch = cat.toLowerCase().includes(categoryId.toLowerCase()) || 
                                           categoryId.toLowerCase().includes(cat.toLowerCase());
                        return exactMatch || caseInsensitiveMatch || partialMatch;
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
                ? allProducts.filter(p => Array.isArray(p.categories) && p.categories.includes(selectedCategories[0]))
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
        .limit(6) // Show max 6 products in offer section
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

            let offerHTML = '';
            snapshot.forEach(doc => {
                const product = doc.data();
                const productId = doc.id;
                const firstImage = (product.imgUrl && product.imgUrl[0]) || 'https://via.placeholder.com/200x150?text=No+Image';
                
                // Calculate discount percentage
                const discount = calculateDiscountPercentage(product.oldPrice, product.newPrice);
                
                // Generate offer product card
                offerHTML += `
                    <div class="offer-product-card" onclick="window.location.href='product.html?id=${productId}'">
                        <img src="${firstImage}" alt="${product.name}" loading="lazy">
                        <h3 style="font-size: 1.1rem; margin: 10px 0; font-weight: 600; line-height: 1.3;">${product.name}</h3>
                        <div class="offer-price">
                            ${product.oldPrice ? `<span class="offer-old-price">₹${product.oldPrice}</span>` : ''}
                            <span class="offer-new-price">₹${product.newPrice}</span>
                            ${discount ? `<span class="offer-discount">${discount}% OFF</span>` : ''}
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button onclick="event.stopPropagation(); copyToWhatsApp('${product.name}', '${product.newPrice}')" 
                                    style="flex: 1; padding: 10px; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fab fa-whatsapp"></i> Buy Now
                            </button>
                        </div>
                    </div>
                `;
            });

            todaysOfferGrid.innerHTML = offerHTML;
            
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

// ✅ Initialize Today's Offers when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load today's offers if we're on the homepage
    if (document.getElementById('todaysOfferGrid')) {
        loadTodaysOffers();
    }
});

