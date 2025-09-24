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

// ✅ Make scrollPhotoSlider global
function scrollPhotoSlider(direction) {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    slider.scrollBy({
        left: slider.offsetWidth * direction,
        behavior: 'smooth'
    });
}

// ✅ Load Product
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

        const sizes = product.sizes || [];

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

        let sizesHTML = '';
        if (sizes.length) {
            sizesHTML = `
                <div class="sizes">
                    <h4>Available Sizes:</h4>
                    <select id="sizeDropdown" class="size-dropdown" onchange="selectSize(this.value)">
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

        // Calculate discount percentage
        const discountPercentage = calculateDiscountPercentage(product.oldPrice, product.newPrice || product.price);
        
        // Check if product is out of stock via category assignment or stock field
        const isOutOfStockByCategory = product.categories && product.categories.includes('out-of-stock');
        const isOutOfStockByStock = typeof product.stock !== 'undefined' && parseInt(product.stock) === 0;
        const isOutOfStock = isOutOfStockByCategory || isOutOfStockByStock;

        // ✅ Inject product HTML
        productDetails.innerHTML = `
            <div class="product-container">
                <div class="product-gallery">
                    ${galleryHTML}
                    ${discountPercentage && !isOutOfStock ? `<div class="discount-badge">${discountPercentage}% OFF</div>` : ''}
                    ${isOutOfStock ? `<div class="discount-badge" style="background:linear-gradient(135deg,#ef4444,#dc2626);top:55px;">Out of Stock</div>` : ''}
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <div class="price">
                        ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
                        <span class="new-price">₹${product.newPrice || product.price}</span>
                    </div>
                    <p class="description">${product.description || 'No description available.'}</p>
                    ${sizesHTML}
                    <div class="quantity-container">
                        <span>Quantity:</span>
                        <input type="number" id="quantity" value="1" min="1" max="100" ${isOutOfStock ? 'disabled' : ''}>
                    </div>
                    <div class="product-buttons">
                        <button class="add-to-cart-btn" onclick="addProductToCart('${product.name}', '${product.newPrice || product.price}', '${product.oldPrice || ''}', '${images[0] || ''}')" ${isOutOfStock ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="buy-now" onclick="copyToWhatsApp('${product.name}', '${product.newPrice || product.price}')" ${isOutOfStock ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>Buy Now</button>
                    </div>
                    <button class="share-btn" onclick="shareProduct('${product.name}', '${product.newPrice || product.price}', window.location.href)">Share</button>
                </div>
            </div>
        `;

        // ✅ Setup slider & pagination (AFTER rendering HTML)
        const slider = document.querySelector('.slider');
        const pagination = document.getElementById('pagination');

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

        // ✅ Auto-adjust layout based on image size
        adjustLayoutToImageSize();

    }).catch(error => {
        console.error("Error loading product: ", error);
        productDetails.innerHTML = `<p>Error loading product details.</p>`;
    });
}

// ✅ Custom Size Alert
function showSizeAlert() {
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

// ✅ WhatsApp Buy Now
function copyToWhatsApp(productName, productPrice) {
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    // Size selection is now optional, so no alert
    let sizeMsg = (typeof selectedSize !== 'undefined' && selectedSize) ? `\nSize: ${selectedSize}` : '';
    const qtyMsg = `\nQuantity: ${quantity}`;
    
    const message = `Hey WackyKicks! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}${sizeMsg}${qtyMsg}`;
    
    window.open(`https://wa.me/918138999550?text=${encodeURIComponent(message)}`, '_blank');
}

// ✅ Add Product to Cart
function addProductToCart(productName, productPrice, productOldPrice, productImage) {
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    // Get selected size if available
    const selectedSize = window.selectedSize || null;
    
    // Create product object
    const product = {
        id: productId, // Use the global productId from URL
        name: productName,
        price: productPrice,
        oldPrice: productOldPrice || null,
        img: productImage
    };
    
    // Add to cart using the global cart object
    if (typeof window.cart !== 'undefined') {
        window.cart.addToCart(product, quantity, selectedSize);
    } else {
        // Fallback: use the addToCart function from cart.js
        addToCart(product, quantity, selectedSize);
    }
}

// ✅ Run on page load
window.addEventListener('DOMContentLoaded', () => {
    loadProduct();
    loadRelatedProducts(); // ✅ Add this
    loadReviews(); // Load reviews for this product
    setupReviewForm(); // Setup review form functionality

    // Wire up fixed bar buttons
    setTimeout(() => {
        const addBtn = document.getElementById('fixedAddToCart');
        const buyBtn = document.getElementById('fixedBuyNow');
        
        // Check if product is out of stock by looking at disabled buttons in product info
        const productAddBtn = document.querySelector('.product-buttons .add-to-cart-btn');
        const isOutOfStock = productAddBtn && productAddBtn.hasAttribute('disabled');
        
        if (isOutOfStock) {
            // Disable and style the fixed buttons
            if (addBtn) {
                addBtn.disabled = true;
                addBtn.style.opacity = '0.5';
                addBtn.style.cursor = 'not-allowed';
                addBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Out of Stock';
            }
            if (buyBtn) {
                buyBtn.disabled = true;
                buyBtn.style.opacity = '0.5';
                buyBtn.style.cursor = 'not-allowed';
                buyBtn.textContent = 'Out of Stock';
            }
        } else {
            // Enable buttons with click handlers
            addBtn && addBtn.addEventListener('click', () => {
                // Use same logic as product info button
                // Get product details from loaded DOM
                const name = document.querySelector('.product-info h2')?.textContent || '';
                const price = document.querySelector('.product-info .new-price')?.textContent.replace(/[^\d.]/g, '') || '';
                const oldPrice = document.querySelector('.product-info .old-price')?.textContent.replace(/[^\d.]/g, '') || '';
                const img = document.querySelector('.product-gallery img')?.src || '';
                addProductToCart(name, price, oldPrice, img);
            });
            buyBtn && buyBtn.addEventListener('click', () => {
                const name = document.querySelector('.product-info h2')?.textContent || '';
                const price = document.querySelector('.product-info .new-price')?.textContent.replace(/[^\d.]/g, '') || '';
                copyToWhatsApp(name, price);
            });
        }
    }, 500);
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
function loadRelatedProducts() {
    const relatedContainer = document.getElementById('relatedCarousel');

    db.collection("products")
        .limit(6) // Load max 6 products; adjust as needed
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const product = doc.data();
                const productId = doc.id;
                const relatedDiscountPercentage = calculateDiscountPercentage(product.oldPrice, product.newPrice || product.price);

                const relatedCard = document.createElement('div');
                relatedCard.className = 'related-card';
                relatedCard.innerHTML = `
                    <a href="product.html?id=${productId}">
                        ${relatedDiscountPercentage ? `<span class="discount-tag">${relatedDiscountPercentage}% OFF</span>` : ''}
                        <img src="${(Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl) || ''}" alt="${product.name}">
                        <h4>${product.name}</h4>
                        <div class="price">
                            ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
                            <span class="new-price">₹${product.newPrice || product.price}</span>
                        </div>
                    </a>
                `;

                relatedContainer.appendChild(relatedCard);
            });
        })
        .catch(error => {
            console.error("Error loading related products:", error);
            relatedContainer.innerHTML = `<p>Unable to load related products.</p>`;
        });
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
    
    firstImage.onload = function() {
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

window.selectSize = function(size) {
    selectedSize = size;
    const dropdown = document.getElementById('sizeDropdown');
    if (dropdown) {
        dropdown.value = size;
    }
};

function shareProduct(name, price, url) {
    const message = `Check out this product on WackyKicks!\n${name}\nPrice: ₹${price}\n${url}`;

    if (navigator.share) {
        navigator.share({
            title: name,
            text: message,
            url: url,
        }).then(() => {
            // Optionally show a toast or message
        }).catch(error => {
            alert("Sharing failed or was cancelled.");
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copied! You can share it anywhere.");
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

// Make function globally available
window.toggleMoreReviews = toggleMoreReviews;

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
        alert('Product ID not found.');
        return;
    }
    
    if (selectedRating === 0) {
        alert('Please select a rating.');
        return;
    }
    
    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewText = document.getElementById('reviewText').value.trim();
    
    if (!reviewerName || !reviewText) {
        alert('Please fill in all fields.');
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
        
        alert('Review submitted successfully!');
        
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
        alert('Error submitting review. Please try again.');
    }
}