const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

function scrollToProducts() {
    const productSection = document.getElementById('products');
    productSection.scrollIntoView({ behavior: 'smooth' });
}

// Set the current year automatically
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
});

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
        const name = product.querySelector("h3").textContent.toLowerCase();
        if (name.includes(query)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}
