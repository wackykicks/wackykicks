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

        // ✅ Build gallery HTML
        let galleryHTML = '<div class="slider">';
        images.forEach(url => {
            galleryHTML += `
                <div class="image-slide">
                    <img src="${url}" alt="${product.name}">
                </div>
            `;
        });
        galleryHTML += '</div><div class="pagination" id="pagination"></div>';

        // ✅ Inject product HTML
        productDetails.innerHTML = `
            <div class="product-container">
                <div class="product-gallery">
                    ${galleryHTML}
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="price">₹${product.price}</p>
                    <p class="description">${product.description || 'No description available.'}</p>
                    <button class="buy-now" onclick="copyToWhatsApp('${product.name}', '${product.price}')">Buy Now</button>
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

    }).catch(error => {
        console.error("Error loading product: ", error);
        productDetails.innerHTML = `<p>Error loading product details.</p>`;
    });
}

// ✅ WhatsApp Buy Now
function copyToWhatsApp(productName, productPrice) {
    const message = `Hey WackyKicks! I'm interested in buying:\n${productName}\nPrice: ₹${productPrice}`;
    window.open(`https://wa.me/918138999550?text=${encodeURIComponent(message)}`, '_blank');
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
                        <p class="price">₹${product.price}</p>
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
