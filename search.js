import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDogBkY_Xgx8Fw_3P0iOlVgciVArJHjy5Q",
    authDomain: "wackykicks-65cbe.firebaseapp.com",
    projectId: "wackykicks-65cbe",
    storageBucket: "wackykicks-65cbe.appspot.com",
    messagingSenderId: "911540684237",
    appId: "1:911540684237:web:faa772c146ff4acfadb084",
    measurementId: "G-7HWH0SEJN2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

const params = new URLSearchParams(window.location.search);
const query = params.get('q')?.toLowerCase() || "";

const resultCount = document.getElementById("resultCount");
const searchGrid = document.getElementById("searchGrid");
const searchInput = document.querySelector('input[type="text"]');

let allProducts = [];

// Load all products once on page load
async function loadAllProducts() {
    const snapshot = await getDocs(collection(db, "products"));
    allProducts = [];
    
    snapshot.forEach(doc => {
        const product = doc.data();
        allProducts.push({ id: doc.id, ...product });
    });
    
    // Perform initial search if query exists
    if (query) {
        performSearch(query);
    } else {
        // Show all products initially
        renderResults(allProducts);
    }
}

// Real-time search function
function performRealTimeSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === "") {
        // Show all products when search is empty
        renderResults(allProducts);
        return;
    }
    
    performSearch(searchTerm);
}

async function performSearch(searchTerm = query) {
    const matches = allProducts.filter(product => {
        const name = product.name?.toLowerCase() || "";
        const desc = product.description?.toLowerCase() || "";

        return name.includes(searchTerm) || desc.includes(searchTerm);
    });

    renderResults(matches, searchTerm);
}

function renderResults(products, searchTerm = query) {
    searchGrid.innerHTML = "";
    
    const displayTerm = searchTerm || "all products";
    const resultText = searchTerm ? 
        `${products.length} result${products.length !== 1 ? 's' : ''} found for "${searchTerm}"` :
        `Showing ${products.length} products`;
    
    resultCount.textContent = resultText;

    products.forEach(product => {
        const img = Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl;
        const price = product.newPrice || product.price;
        
        // Calculate discount percentage
        const discountPercentage = calculateDiscountPercentage(product.oldPrice, product.newPrice || product.price);

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            ${discountPercentage ? `<span class=\"tag discount-tag\">${discountPercentage}% OFF</span>` : ''}
            <a href="product.html?id=${product.id}">
                <div class="img-wrapper">
                    <img src="${img}" alt="${product.name}">
                </div>
                <h3>${product.name}</h3>
                <div class="price">
                    ${product.oldPrice ? `<span class=\"old-price\">₹${product.oldPrice}</span>` : ""}
                    <span class="new-price">₹${price}</span>
                </div>
            </a>
        `;
        searchGrid.appendChild(card);
    });
}

// Initialize page
loadAllProducts();

// Add real-time search listener
if (searchInput) {
    searchInput.addEventListener('input', performRealTimeSearch);
    
    // Update the search input with current query if it exists
    if (query) {
        searchInput.value = query;
    }
}
