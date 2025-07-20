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

let allProducts = [];
let filteredProducts = [];
let isSearching = false;
let currentPage = 1;
const productsPerPage = 4;

// Render products function
function renderProducts(productsToShow = allProducts, paginated = true) {
    const productList = document.getElementById('productList');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const paginationDiv = document.querySelector('.product-pagination');
    let pageProducts, totalPages;

    if (paginated) {
        totalPages = Math.ceil(productsToShow.length / productsPerPage);
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        pageProducts = productsToShow.slice(start, end);
    } else {
        totalPages = 1;
        pageProducts = productsToShow;
    }

    productList.innerHTML = '';
    pageProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
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

    // Show/hide pagination controls
    if (paginated) {
        paginationDiv.style.display = '';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = (currentPage === 1);
        nextBtn.disabled = (currentPage === totalPages || totalPages === 0);
    } else {
        paginationDiv.style.display = 'none';
    }
}

// Search function
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm) {
        filteredProducts = allProducts.filter(product =>
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.tag && product.tag.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
        isSearching = true;
        currentPage = 1;
        renderProducts(filteredProducts, false); // Show all matches in one page, no pagination
    } else {
        isSearching = false;
        currentPage = 1;
        renderProducts(allProducts, true); // Back to paginated
    }
}

// Pagination button handlers
document.getElementById('prevPage').onclick = () => {
    if (!isSearching && currentPage > 1) {
        currentPage--;
        renderProducts(allProducts, true);
    }
};
document.getElementById('nextPage').onclick = () => {
    if (!isSearching && currentPage < Math.ceil(allProducts.length / productsPerPage)) {
        currentPage++;
        renderProducts(allProducts, true);
    }
};

// Initial load
function loadProducts() {
    db.collection("products").get().then(snapshot => {
        allProducts = [];
        snapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            const firstImage = Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl;
            allProducts.push({ ...product, id: productId, img: firstImage });
        });
        currentPage = 1;
        renderProducts(allProducts, true);
    }).catch(error => {
        console.error("Error fetching products: ", error);
    });
}

window.addEventListener('DOMContentLoaded', loadProducts);

