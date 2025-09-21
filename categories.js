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
    }

    // Render individual category card
    renderCategoryCard(category) {
        const isSelected = this.selectedCategories.includes(category.id);
        return `
            <div class="category-card ${isSelected ? 'selected' : ''}" 
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
    }

    // Filter products by selected categories
    filterProductsByCategory() {
        if (typeof window.filterProducts === 'function') {
            window.filterProducts(this.selectedCategories);
        }
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