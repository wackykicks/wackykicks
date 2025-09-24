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
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Promotional Banner Category Redirection
function redirectToCategory(categoryName) {
    console.log('🎯 Redirecting to category:', categoryName);
    
    // Check if categoryManager is available
    if (typeof categoryManager !== 'undefined' && categoryManager.selectCategory) {
        // Use the category manager to filter products
        const categoryId = getCategoryId(categoryName);
        console.log('📋 Mapped category ID:', categoryId);
        
        if (categoryId) {
            // Wait a moment for categories to load if needed
            setTimeout(() => {
                console.log('🔄 Calling categoryManager.selectCategory with:', categoryId);
                categoryManager.selectCategory(categoryId);
                
                // Scroll to products section
                const productSection = document.getElementById('product-grid');
                if (productSection) {
                    productSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);
        }
    } else {
        console.warn('⚠️ CategoryManager not available, using direct product filtering');
        
        // Direct fallback - call filterProducts directly
        const categoryId = getCategoryId(categoryName);
        if (typeof window.filterProducts === 'function') {
            console.log('🔄 Using direct filterProducts with category:', categoryId);
            window.filterProducts([categoryId]);
        }
        
        // Scroll to products section
        const productSection = document.getElementById('product-grid');
        if (productSection) {
            productSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Map banner category names to actual category IDs
function getCategoryId(categoryName) {
    const categoryMapping = {
        'smartwatch': 'Smartwatch',   // Map to Smartwatch category (exact match)
        'gadgets': 'Gadgets',         // Map to Gadgets category (exact match)
        'smart gadgets': 'Gadgets',   // Alternative mapping
        'watches': 'Smartwatch'       // Alternative mapping
    };
    
    return categoryMapping[categoryName.toLowerCase()] || categoryName;
}

// Enhanced redirection with category creation fallback
async function redirectToCategoryEnhanced(categoryName) {
    console.log('Enhanced redirect to category:', categoryName);
    
    try {
        // Wait for categories to load if not already loaded
        await waitForCategories();
        
        const categoryId = getCategoryId(categoryName);
        
        // Try to find the category
        if (typeof categoryManager !== 'undefined' && categoryManager.categories) {
            const categoryExists = categoryManager.categories.some(cat => 
                cat.id === categoryId || 
                cat.name === categoryId ||
                cat.name.toLowerCase() === categoryId.toLowerCase() ||
                cat.name.toLowerCase().includes(categoryName.toLowerCase())
            );
            
            if (categoryExists) {
                // Use the exact category name/id for selection
                const exactCategory = categoryManager.categories.find(cat => 
                    cat.id === categoryId || 
                    cat.name === categoryId ||
                    cat.name.toLowerCase() === categoryId.toLowerCase()
                );
                
                if (exactCategory) {
                    categoryManager.selectCategory(exactCategory.id);
                } else {
                    categoryManager.selectCategory(categoryId);
                }
            } else {
                console.warn(`Category ${categoryName} not found, showing all products`);
                categoryManager.selectCategory('all');
            }
            
            // Scroll to products
            const productSection = document.getElementById('product-grid');
            if (productSection) {
                productSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    } catch (error) {
        console.error('Error in enhanced redirection:', error);
        // Fallback to simple redirection
        redirectToCategory(categoryName);
    }
}

// Wait for categories to be loaded
function waitForCategories(maxWait = 5000) {
    return new Promise((resolve) => {
        const checkCategories = () => {
            if (typeof categoryManager !== 'undefined' && categoryManager.categories && categoryManager.categories.length > 0) {
                resolve();
            } else {
                setTimeout(checkCategories, 100);
            }
        };
        
        checkCategories();
        
        // Timeout fallback
        setTimeout(() => {
            resolve();
        }, maxWait);
    });
}