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

// Pagination variables
let allProducts = [];
let currentPage = 1;
const productsPerPage = 4;

// Fetch all products once and paginate
function loadProducts() {
    const productList = document.getElementById('productList');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    db.collection("products").get().then(snapshot => {
        allProducts = [];
        snapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            const firstImage = Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl;
            allProducts.push({ ...product, id: productId, img: firstImage });
        });
        renderProducts();
    }).catch(error => {
        console.error("Error fetching products: ", error);
    });

    function renderProducts() {
        productList.innerHTML = '';
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        const pageProducts = allProducts.slice(start, end);

        pageProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // For product card (grid and related products)
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    ${product.tag ? `<span class="tag">${product.tag}</span>` : ''}
                    <img src="${product.img}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <div class="price">
                        ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
                        <span class="new-price">₹${product.newPrice || product.price}</span>
                    </div>
                </a>
            `;
            productList.appendChild(productCard);
        });

        // Update pagination
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    prevBtn.onclick = function() {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    };

    nextBtn.onclick = function() {
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    };
}

// ✅ Run the right loader depending on page
window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productDetails')) {
        loadProduct();
    } else if (document.getElementById('productList')) {
        loadProducts();
    }
});

