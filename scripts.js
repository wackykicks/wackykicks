const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active')) {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        }
    });

    // Close menu when clicking on a link
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            navLinks.classList.remove('active');
        }
    });
}

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
async function redirectToCategory(categoryName) {
    console.log('🎯 Redirecting to category:', categoryName);
    
    try {
        // Wait for both categoryManager and filterProducts to be available
        await waitForCategorySystem();
        
        const categoryId = getCategoryId(categoryName);
        console.log('📋 Mapped category ID:', categoryId);
        
        // Try categoryManager first
        if (typeof categoryManager !== 'undefined' && categoryManager.selectCategory) {
            console.log('🔄 Using categoryManager.selectCategory with:', categoryId);
            
            // Wait a bit more for categories to be fully loaded
            await waitForCategories(3000);
            
            // Check if the category exists
            if (categoryManager.categories && categoryManager.categories.length > 0) {
                const categoryExists = categoryManager.categories.some(cat => 
                    cat.id === categoryId || 
                    cat.name === categoryId ||
                    cat.name.toLowerCase() === categoryId.toLowerCase() ||
                    cat.name.toLowerCase().includes(categoryName.toLowerCase())
                );
                
                if (categoryExists) {
                    categoryManager.selectCategory(categoryId);
                } else {
                    console.warn(`⚠️ Category "${categoryId}" not found, trying alternative approaches`);
                    // Try with original name
                    categoryManager.selectCategory(categoryName);
                }
            } else {
                console.warn('⚠️ Categories not loaded yet, using direct filtering');
                if (typeof window.filterProducts === 'function') {
                    window.filterProducts([categoryId]);
                }
            }
        } else if (typeof window.filterProducts === 'function') {
            console.log('🔄 Using direct filterProducts with category:', categoryId);
            window.filterProducts([categoryId]);
        } else {
            console.error('❌ Neither categoryManager nor filterProducts available');
            return;
        }
        
        // Scroll to products section after a short delay (use categoryManager's scroll method if available)
        setTimeout(() => {
            if (typeof categoryManager !== 'undefined' && categoryManager.scrollToProducts) {
                categoryManager.scrollToProducts();
            } else {
                // Fallback scrolling
                const productSection = document.getElementById('product-grid');
                if (productSection) {
                    productSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error in redirectToCategory:', error);
        // Fallback to direct filtering
        if (typeof window.filterProducts === 'function') {
            const categoryId = getCategoryId(categoryName);
            window.filterProducts([categoryId]);
        }
    }
}

// Map banner category names to actual category IDs
function getCategoryId(categoryName) {
    const categoryMapping = {
        // Smartwatch variations
        'smartwatch': 'Smartwatch',
        'smart watch': 'Smartwatch',
        'watches': 'Smartwatch',
        'watch': 'Smartwatch',
        
        // Gadgets variations
        'gadgets': 'Gadgets',
        'gadget': 'Gadgets',
        'smart gadgets': 'Gadgets',
        'smart gadget': 'Gadgets',
        'electronics': 'Gadgets',
        'electronic': 'Gadgets',
        
        // Other possible mappings
        'accessories': 'Accessories',
        'shoes': 'Shoes',
        'sneakers': 'Shoes',
        'footwear': 'Shoes'
    };
    
    const normalizedName = categoryName.toLowerCase().trim();
    const mappedCategory = categoryMapping[normalizedName];
    
    console.log(`🗺️ Mapping "${categoryName}" -> "${mappedCategory || categoryName}"`);
    
    return mappedCategory || categoryName;
}

// Enhanced redirection with category creation fallback
async function redirectToCategoryEnhanced(categoryName) {
    console.log('🚀 Enhanced redirect to category:', categoryName);
    
    try {
        // Wait for the entire category system to be ready
        await waitForCategorySystem();
        await waitForCategories(3000);
        
        const categoryId = getCategoryId(categoryName);
        
        // Try to find the category with multiple matching strategies
        if (typeof categoryManager !== 'undefined' && categoryManager.categories && categoryManager.categories.length > 0) {
            console.log('🔍 Searching in categories:', categoryManager.categories.map(c => c.name));
            
            // Strategy 1: Exact ID match
            let exactCategory = categoryManager.categories.find(cat => cat.id === categoryId);
            
            // Strategy 2: Exact name match
            if (!exactCategory) {
                exactCategory = categoryManager.categories.find(cat => cat.name === categoryId);
            }
            
            // Strategy 3: Case-insensitive name match
            if (!exactCategory) {
                exactCategory = categoryManager.categories.find(cat => 
                    cat.name.toLowerCase() === categoryId.toLowerCase()
                );
            }
            
            // Strategy 4: Partial name match
            if (!exactCategory) {
                exactCategory = categoryManager.categories.find(cat => 
                    cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
                    categoryName.toLowerCase().includes(cat.name.toLowerCase())
                );
            }
            
            if (exactCategory) {
                console.log('✅ Found category:', exactCategory.name, 'ID:', exactCategory.id);
                categoryManager.selectCategory(exactCategory.id);
            } else {
                console.warn(`⚠️ Category ${categoryName} not found in:`, categoryManager.categories.map(c => c.name));
                console.log('🔄 Trying direct filter instead');
                
                // Fallback to direct filtering
                if (typeof window.filterProducts === 'function') {
                    window.filterProducts([categoryId]);
                } else {
                    console.error('❌ No filtering method available');
                }
            }
        } else {
            console.warn('⚠️ CategoryManager or categories not ready, using direct filtering');
            if (typeof window.filterProducts === 'function') {
                window.filterProducts([categoryId]);
            }
        }
        
        // Scroll to products section (use categoryManager's scroll method if available)
        setTimeout(() => {
            if (typeof categoryManager !== 'undefined' && categoryManager.scrollToProducts) {
                categoryManager.scrollToProducts();
            } else {
                // Fallback scrolling
                const productSection = document.getElementById('product-grid');
                if (productSection) {
                    productSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error in enhanced redirection:', error);
        // Final fallback to simple redirection
        await redirectToCategory(categoryName);
    }
}

// Wait for categories to be loaded
function waitForCategories(maxWait = 5000) {
    return new Promise((resolve) => {
        const checkCategories = () => {
            if (typeof categoryManager !== 'undefined' && categoryManager.categories && categoryManager.categories.length > 0) {
                console.log('✅ Categories loaded:', categoryManager.categories.length);
                resolve();
            } else {
                setTimeout(checkCategories, 100);
            }
        };
        
        checkCategories();
        
        // Timeout fallback
        setTimeout(() => {
            console.log('⏰ Categories wait timeout');
            resolve();
        }, maxWait);
    });
}

// Wait for the entire category system to be ready
function waitForCategorySystem(maxWait = 8000) {
    return new Promise((resolve) => {
        const checkSystem = () => {
            const categoryManagerReady = typeof categoryManager !== 'undefined';
            const filterProductsReady = typeof window.filterProducts === 'function';
            
            if (categoryManagerReady || filterProductsReady) {
                console.log('✅ Category system ready - CategoryManager:', categoryManagerReady, 'FilterProducts:', filterProductsReady);
                resolve();
            } else {
                setTimeout(checkSystem, 100);
            }
        };
        
        checkSystem();
        
        // Timeout fallback
        setTimeout(() => {
            console.log('⏰ Category system wait timeout');
            resolve();
        }, maxWait);
    });
}