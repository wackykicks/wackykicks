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