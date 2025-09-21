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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// Filter products by categories
function filterProducts(categories = []) {
    selectedCategories = categories;
    
    if (categories.length === 0) {
        // Show all products if no categories selected
        if (isSearching) {
            renderProducts(filteredProducts);
        } else {
            renderProducts(allProducts);
        }
        return;
    }
    
    // Filter products that have at least one matching category
    const categoryFilteredProducts = allProducts.filter(product => {
        if (!product.categories || product.categories.length === 0) return false;
        return categories.some(categoryId => product.categories.includes(categoryId));
    });
    
    if (isSearching) {
        // Apply search filter to category-filtered products
        const searchTerm = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
        const searchAndCategoryFiltered = categoryFilteredProducts.filter(product =>
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.tag && product.tag.toLowerCase().includes(searchTerm)) ||
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
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-link">
                ${product.tag ? `<span class=\"tag\">${product.tag}</span>` : ''}
                <div class="img-wrapper">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <h3>${product.name}</h3>
                <div class="price">
                    ${product.oldPrice ? `<span class=\"old-price\">₹${product.oldPrice}</span>` : ''}
                    <span class="new-price">₹${product.newPrice || product.price}</span>
                </div>
            </a>
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

// Search function (no pagination)
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm) {
        let productsToFilter = allProducts;
        
        // If categories are selected, first filter by categories
        if (selectedCategories.length > 0) {
            productsToFilter = allProducts.filter(product => {
                if (!product.categories || product.categories.length === 0) return false;
                return selectedCategories.some(categoryId => product.categories.includes(categoryId));
            });
        }
        
        filteredProducts = productsToFilter.filter(product =>
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.tag && product.tag.toLowerCase().includes(searchTerm)) ||
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
                categories: ['nike', 'shoes'],
                tag: 'Popular'
            },
            {
                id: '2',
                name: 'Fossil Watch Classic',
                price: 1200,
                newPrice: 950,
                oldPrice: 1200,
                img: 'https://via.placeholder.com/200x200?text=Fossil+Watch',
                categories: ['fossil', 'watches'],
                tag: 'New'
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
});

// Add resize listener to re-equalize heights
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(equalizeCardHeights, 250);
});

