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

const params = new URLSearchParams(window.location.search);
const query = params.get('q')?.toLowerCase() || "";

const resultCount = document.getElementById("resultCount");
const searchGrid = document.getElementById("searchGrid");

async function performSearch() {
    const snapshot = await getDocs(collection(db, "products"));
    const matches = [];

    snapshot.forEach(doc => {
        const product = doc.data();
        const name = product.name?.toLowerCase() || "";
        const desc = product.description?.toLowerCase() || "";
        const tag = product.tag?.toLowerCase() || "";

        if (name.includes(query) || desc.includes(query) || tag.includes(query)) {
            matches.push({ id: doc.id, ...product });
        }
    });

    renderResults(matches);
}

function renderResults(products) {
    searchGrid.innerHTML = "";
    resultCount.textContent = `${products.length} result${products.length !== 1 ? 's' : ''} found for "${query}"`;

    products.forEach(product => {
        const img = Array.isArray(product.imgUrl) ? product.imgUrl[0] : product.imgUrl;
        const price = product.newPrice || product.price;

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            ${product.tag ? `<span class="tag">${product.tag}</span>` : ''}
            <a href="product.html?id=${product.id}">
                <img src="${img}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">
                    ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ""}
                    <span class="new-price">₹${price}</span>
                </div>
            </a>
        `;
        searchGrid.appendChild(card);
    });
}

performSearch();
