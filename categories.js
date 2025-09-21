// Categories Management System
class CategoryManager {
    constructor() {
        this.categories = [];
        this.selectedCategories = [];
        this.init();
    }

    // Initialize category manager
    init() {
        this.loadCategories();
        this.setupEventListeners();
    }

    // Load categories from Firebase
    async loadCategories() {
        try {
            if (typeof db !== 'undefined') {
                const categoriesSnapshot = await db.collection('categories').get();
                this.categories = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Fallback data if Firebase is not available
                this.categories = this.getDefaultCategories();
            }
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = this.getDefaultCategories();
            this.renderCategories();
        }
    }

    // Default categories for fallback
    getDefaultCategories() {
        return [
            { id: 'all', name: 'All Products', icon: '🏠', color: '#667eea' },
            { id: 'nike', name: 'Nike', icon: '✓', color: '#000000' },
            { id: 'adidas', name: 'Adidas', icon: '⚡', color: '#0066cc' },
            { id: 'shoes', name: 'Shoes', icon: '👟', color: '#ff6b35' },
            { id: 'watches', name: 'Watches', icon: '⌚', color: '#28a745' },
            { id: 'accessories', name: 'Accessories', icon: '🎒', color: '#6f42c1' },
            { id: 'clothing', name: 'Clothing', icon: '👕', color: '#fd7e14' },
            { id: 'electronics', name: 'Electronics', icon: '📱', color: '#20c997' },
            { id: 'sports', name: 'Sports', icon: '⚽', color: '#dc3545' },
            { id: 'lifestyle', name: 'Lifestyle', icon: '✨', color: '#ffc107' }
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
                 style="--category-color: ${category.color}">
                <div class="category-icon">
                    ${category.icon}
                </div>
                <div class="category-name">${category.name}</div>
            </div>
        `;
    }

    // Select/deselect category
    selectCategory(categoryId) {
        if (categoryId === 'all') {
            this.selectedCategories = [];
        } else {
            const index = this.selectedCategories.indexOf(categoryId);
            if (index > -1) {
                this.selectedCategories.splice(index, 1);
            } else {
                this.selectedCategories.push(categoryId);
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
                const docRef = await db.collection('categories').add(categoryData);
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
                await db.collection('categories').doc(categoryId).update(updateData);
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
                await db.collection('categories').doc(categoryId).delete();
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