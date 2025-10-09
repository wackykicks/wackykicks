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

