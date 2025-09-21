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
                    </div>
                    <p class="description">${product.description || 'No description available.'}</p>
                    ${sizesHTML}
                    <div class="quantity-container">
                        <span>Quantity:</span>
                        <input type="number" id="quantity" value="1" min="1" max="100">
                    </div>
                    <div class="product-buttons">
                        <button class="add-to-cart-btn" onclick="addProductToCart('${product.name}', '${product.newPrice || product.price}', '${product.oldPrice || ''}', '${images[0] || ''}')">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="buy-now" onclick="copyToWhatsApp('${product.name}', '${product.newPrice || product.price}')">Buy Now</button>
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

                const relatedCard = document.createElement('div');
                relatedCard.className = 'related-card';
                relatedCard.innerHTML = `
                    <a href="product.html?id=${productId}">
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