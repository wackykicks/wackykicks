// Categories Management System
class CategoryManager {
    constructor() {
        this.categories = [];
        this.selectedCategories = [];
        this.init();
    }

    // Initialize category manager
    init() {
        // Wait for Firebase to be ready before loading categories
        if (typeof db !== 'undefined') {
            this.loadCategories();
        } else {
            // Wait for Firebase to initialize
            const checkFirebase = setInterval(() => {
                if (typeof db !== 'undefined') {
                    clearInterval(checkFirebase);
                    this.loadCategories();
                }
            }, 100);
            
            // Fallback after 5 seconds if Firebase doesn't load
            setTimeout(() => {
                clearInterval(checkFirebase);
                if (typeof db === 'undefined') {
                    console.warn('Firebase not available, using default categories');
                    this.categories = this.getDefaultCategories();
                    this.renderCategories();
                }
            }, 5000);
        }
        this.setupEventListeners();
    }

    // Load categories from Firebase
    async loadCategories() {
        console.log('🏷️ Loading categories...');
        console.log('🔥 Firebase db available:', typeof db !== 'undefined');
        
        try {
            if (typeof db !== 'undefined') {
                console.log('📡 Fetching categories from Firebase...');
                const categoriesSnapshot = await db.collection('category').get();
                console.log('📦 Categories found:', categoriesSnapshot.size);
                
                this.categories = categoriesSnapshot.docs.map(doc => {
                    const data = { 
                        id: doc.id, 
                        ...doc.data(),
                        name: doc.data().name || 'Unnamed Category',
                        image: doc.data().image || doc.data().icon || '',
                        color: doc.data().color || '#667eea'
                    };
                    console.log('🏷️ Loaded category:', data.name);
                    return data;
                });
                
                console.log('✅ Categories loaded successfully:', this.categories.length);
            } else {
                console.log('⚠️ Firebase not available, using fallback categories');
                this.categories = this.getDefaultCategories();
            }
            
            // If no categories found, use defaults
            if (this.categories.length === 0) {
                console.log('📭 No categories found, using defaults');
                this.categories = this.getDefaultCategories();
            }
            
            this.renderCategories();
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            console.log('🔄 Using default categories due to error');
            this.categories = this.getDefaultCategories();
            this.renderCategories();
        }
    }

    // Default categories for fallback
    getDefaultCategories() {
        return [
            { id: 'all', name: 'All Products', image: 'https://via.placeholder.com/60x60?text=ALL', color: '#667eea' },
            { id: 'today offer', name: 'Today\'s Offers', image: 'https://via.placeholder.com/60x60?text=OFFER', color: '#6c757d', special: true },
            { id: 'nike', name: 'Nike', image: 'https://via.placeholder.com/60x60?text=NIKE', color: '#000000' },
            { id: 'adidas', name: 'Adidas', image: 'https://via.placeholder.com/60x60?text=ADIDAS', color: '#0066cc' },
            { id: 'shoes', name: 'Shoes', image: 'https://via.placeholder.com/60x60?text=SHOES', color: '#ff6b35' },
            { id: 'watches', name: 'Watches', image: 'https://via.placeholder.com/60x60?text=WATCH', color: '#28a745' },
            { id: 'accessories', name: 'Accessories', image: 'https://via.placeholder.com/60x60?text=ACC', color: '#6f42c1' }
        ];
    }

    // Render categories section
    renderCategories() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;
        // Preserve current horizontal scroll position to avoid jump-to-start on re-render
        let prevScrollLeft = 0;
        const existingScrollEl = categoriesContainer.querySelector('.categories-scroll');
        if (existingScrollEl) {
            prevScrollLeft = existingScrollEl.scrollLeft;
        }

        categoriesContainer.innerHTML = `
            <div class="categories-section">
                <h2>Browse Categories</h2>
                <div class="categories-scroll">
                    <div class="categories-grid">
                        ${this.categories.map(category => this.renderCategoryCard(category)).join('')}
                    </div>
                </div>
            </div>
        `;

        // Restore previous scroll position after re-render
        const newScrollEl = categoriesContainer.querySelector('.categories-scroll');
        if (newScrollEl && Number.isFinite(prevScrollLeft)) {
            newScrollEl.scrollLeft = prevScrollLeft;
        }
    }

    // Render individual category card
    renderCategoryCard(category) {
        const isSelected = this.selectedCategories.includes(category.id);
        const isSpecialOffer = category.id === 'today offer';
        
        return `
            <div class="category-card ${isSelected ? 'selected' : ''} ${isSpecialOffer ? 'special-offer-card' : ''}" 
                 data-category-id="${category.id}"
                 onclick="categoryManager.selectCategory('${category.id}')"
                 style="--category-color: ${category.color || '#667eea'}">
                <div class="category-image">
                    <img src="${category.image || category.icon || 'https://via.placeholder.com/60x60?text=' + (category.name ? category.name.charAt(0) : 'C')}" 
                         alt="${category.name || 'Category'}" 
                         onerror="this.src='https://via.placeholder.com/60x60?text=' + '${category.name ? category.name.charAt(0) : 'C'}'">
                </div>
                <div class="category-name">${category.name || 'Unnamed Category'}</div>
            </div>
        `;
    }

    // Select/deselect category (single selection only)
    selectCategory(categoryId) {
        console.log('🎯 Category selected:', categoryId);
        
        if (categoryId === 'all') {
            // Clear all selections when "All" is clicked
            this.selectedCategories = [];
        } else {
            // Single category selection - replace current selection
            if (this.selectedCategories.includes(categoryId)) {
                // If already selected, deselect it (clear selection)
                this.selectedCategories = [];
            } else {
                // Select only this category (replace any previous selection)
                this.selectedCategories = [categoryId];
            }
        }

        this.renderCategories();
        this.filterProductsByCategory();
        
        // Auto-scroll to products section after category selection
        this.scrollToProducts();
    }

    // Filter products by selected categories
    filterProductsByCategory() {
        console.log('🏷️ CategoryManager filtering by categories:', this.selectedCategories);
        
        if (typeof window.filterProducts === 'function') {
            // Get the actual category data to pass more information
            const selectedCategoryData = this.selectedCategories.map(categoryId => {
                const category = this.categories.find(cat => cat.id === categoryId);
                return {
                    id: categoryId,
                    name: category ? category.name : categoryId,
                    // Also pass the original category name from the data
                    originalName: category ? (category.originalName || category.name) : categoryId
                };
            });
            
            console.log('🏷️ Sending category data to filterProducts:', selectedCategoryData);
            
            // Pass both the simple IDs and the full category data
            window.filterProducts(this.selectedCategories, selectedCategoryData);
        } else {
            console.error('❌ window.filterProducts function not available');
        }
    }

    // Auto-scroll to products section
    scrollToProducts() {
        console.log('🔽 Auto-scrolling to products section...');
        
        // Wait a short moment for the products to be filtered and rendered
        setTimeout(() => {
            const productSection = document.getElementById('product-grid');
            if (productSection) {
                console.log('✅ Product section found, scrolling...');
                productSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            } else {
                // Fallback: try other common product section IDs
                const alternateSelectors = ['#productList', '.product-grid-section', '.products-section'];
                for (const selector of alternateSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        console.log('✅ Found product section with selector:', selector);
                        element.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                        break;
                    }
                }
                
                if (!document.querySelector('#product-grid, #productList, .product-grid-section, .products-section')) {
                    console.warn('⚠️ Product section not found for auto-scroll');
                }
            }
        }, 300); // Give time for products to render
    }

    // Add new category (for admin)
    async addCategory(categoryData) {
        try {
            if (typeof db !== 'undefined') {
                const docRef = await db.collection('category').add(categoryData);
                categoryData.id = docRef.id;
            } else {
                categoryData.id = Date.now().toString();
            }
            
            this.categories.push(categoryData);
            this.renderCategories();
            return true;
        } catch (error) {
            console.error('Error adding category:', error);
            return false;
        }
    }

    // Update category (for admin)
    async updateCategory(categoryId, updateData) {
        try {
            if (typeof db !== 'undefined') {
                await db.collection('category').doc(categoryId).update(updateData);
            }
            
            const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
            if (categoryIndex > -1) {
                this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updateData };
                this.renderCategories();
            }
            return true;
        } catch (error) {
            console.error('Error updating category:', error);
            return false;
        }
    }

    // Delete category (for admin)
    async deleteCategory(categoryId) {
        try {
            if (typeof db !== 'undefined') {
                await db.collection('category').doc(categoryId).delete();
            }
            
            this.categories = this.categories.filter(cat => cat.id !== categoryId);
            this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
            this.renderCategories();
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            return false;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Add any global event listeners here
        document.addEventListener('DOMContentLoaded', () => {
            this.renderCategories();
        });
    }

    // Get categories for admin panel
    getCategories() {
        return this.categories;
    }

    // Get selected categories
    getSelectedCategories() {
        return this.selectedCategories;
    }
}

// Initialize category manager
const categoryManager = new CategoryManager();

// Export for global use
window.categoryManager = categoryManager;