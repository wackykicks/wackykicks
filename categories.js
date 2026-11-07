
// Categories Management System
class CategoryManager {
    constructor() {
        this.categories = [];
        this.selectedCategories = [];
        this.categoryDisplayOrder = []; // Will be loaded from Firebase
        // If already loaded and cached, keep all categories; otherwise start with 5 for instant speed
        const hasExistingCache = !!(localStorage.getItem('vexior_products_cache') || localStorage.getItem('vexior_categories_cache'));
        this.showAll = hasExistingCache;

        this.init();
    }

    // Sort categories based on the defined display order
    sortCategories() {
        if (!this.categoryDisplayOrder || this.categoryDisplayOrder.length === 0) {
            console.log('⚠️ No custom order found, using default alphabetical order');
            return;
        }

        this.categories.sort((a, b) => {
            const idA = a.id.toLowerCase();
            const idB = b.id.toLowerCase();

            let indexA = this.categoryDisplayOrder.indexOf(idA);
            let indexB = this.categoryDisplayOrder.indexOf(idB);

            // If category is not in the order list, put it at the end
            if (indexA === -1) indexA = 9999;
            if (indexB === -1) indexB = 9999;

            return indexA - indexB;
        });

        console.log('✅ Categories sorted by custom order');
    }

    // Helper to identify and exclude shoe related brand categories
    isShoeBrandCategory(cat) {
        if (!cat) return false;
        // Normalize Unicode bold/italic characters to standard ASCII
        const name = (cat.name || '').normalize('NFKD').replace(/[^\w\s]/g, '').toLowerCase().trim();
        const id = (cat.id || '').toLowerCase().trim();
        const shoeBrands = ['nike', 'adidas', 'puma', 'asics', 'converse', 'new balance', 'vans', 'vens', 'jordan', 'reebok'];
        return shoeBrands.some(brand => name.includes(brand) || id.includes(brand));
    }

    // Initialize category manager
    init() {
        // ⚡ INSTANT RENDER: Check local cache first (0ms)
        try {
            const cached = localStorage.getItem('vexior_categories_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
                    this.categories = parsed.categories.filter(cat => !this.isShoeBrandCategory(cat));
                    this.categoryDisplayOrder = parsed.order || [];
                    this.sortCategories();
                    this.renderCategories();
                    console.log('⚡ Categories loaded INSTANTLY from cache:', this.categories.length);
                }
            }
        } catch (e) {
            console.warn('Error reading category cache:', e);
        }

        // Wait for Firebase to be ready before loading/revalidating categories
        const dbInstance = (typeof db !== 'undefined' && db) ? db : (window.db || null);
        if (dbInstance) {
            this.loadCategories();
        } else if (typeof window.onFirebaseReady === 'function') {
            window.onFirebaseReady(() => this.loadCategories());
        } else {
            // Wait for Firebase to initialize
            const checkFirebase = setInterval(() => {
                const readyDb = (typeof db !== 'undefined' && db) ? db : (window.db || null);
                if (readyDb) {
                    clearInterval(checkFirebase);
                    this.loadCategories();
                }
            }, 100);

            // Fallback after 4 seconds if Firebase doesn't load and we haven't rendered
            setTimeout(() => {
                clearInterval(checkFirebase);
                if ((!this.categories || this.categories.length === 0)) {
                    console.warn('Firebase not available, using default categories');
                    this.categories = this.getDefaultCategories();
                    this.renderCategories();
                    this.setupEventListeners();
                }
            }, 4000);
        }
        this.setupEventListeners();
    }

    // Load categories from Firebase with direct REST API fallback
    async loadCategories() {
        console.log('🏷️ Loading/revalidating categories from Firebase...');

        try {
            let loadedCategories = [];
            let loadedOrder = [];
            let fetchedSuccessfully = false;

            const dbInstance = (typeof db !== 'undefined' && db) ? db : (window.db || null);

            // Attempt 1: Try Firebase SDK with a 1.8s timeout
            if (dbInstance) {
                try {
                    const sdkPromise = dbInstance.collection('category').get();
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Category SDK timeout')), 1800)
                    );
                    const categoriesSnapshot = await Promise.race([sdkPromise, timeoutPromise]);
                    
                    try {
                        const settingsDoc = await dbInstance.collection('category').doc('CONFIG_display_order').get();
                        if (settingsDoc.exists) {
                            loadedOrder = settingsDoc.data().order || [];
                        }
                    } catch (e) {}

                    loadedCategories = categoriesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        name: doc.data().name || 'Unnamed Category',
                        image: doc.data().image || doc.data().icon || '',
                        color: doc.data().color || '#667eea'
                    }));
                    fetchedSuccessfully = loadedCategories.length > 0;
                } catch (sdkErr) {
                    console.warn('⚠️ Category SDK fetch failed, switching to direct REST API fallback:', sdkErr.message || sdkErr);
                }
            }

            // Attempt 2: Direct Google Cloud REST API (100% reliable bypass for WebChannel drops)
            if (!fetchedSuccessfully) {
                try {
                    console.log('🌐 Fetching categories via direct Google Cloud REST API...');
                    const res = await fetch('https://firestore.googleapis.com/v1/projects/wackykicks-65cbe/databases/(default)/documents/category');
                    if (res.ok) {
                        const data = await res.json();
                        const docs = data.documents || [];
                        const parsedDocs = docs.map(d => {
                            const id = d.name ? d.name.split('/').pop() : '';
                            const fields = d.fields || {};
                            const getVal = (v) => {
                                if (!v) return null;
                                if ('stringValue' in v) return v.stringValue;
                                if ('arrayValue' in v) return (v.arrayValue.values || []).map(getVal);
                                return null;
                            };
                            return {
                                id,
                                name: getVal(fields.name) || 'Unnamed Category',
                                image: getVal(fields.image) || getVal(fields.icon) || '',
                                color: getVal(fields.color) || '#667eea',
                                order: getVal(fields.order) || []
                            };
                        });
                        const configDoc = parsedDocs.find(c => c.id === 'CONFIG_display_order');
                        if (configDoc && configDoc.order) {
                            loadedOrder = configDoc.order;
                        }
                        loadedCategories = parsedDocs;
                        fetchedSuccessfully = loadedCategories.length > 0;
                    }
                } catch (restErr) {
                    console.warn('⚠️ Category REST API fetch failed:', restErr);
                }
            }

            if (fetchedSuccessfully && loadedCategories.length > 0) {
                this.categoryDisplayOrder = loadedOrder;
                this.categories = loadedCategories
                    .filter(cat => cat.id !== 'CONFIG_display_order' && !this.isShoeBrandCategory(cat));

                // Cache fresh categories in localStorage
                try {
                    localStorage.setItem('vexior_categories_cache', JSON.stringify({
                        categories: this.categories,
                        order: this.categoryDisplayOrder,
                        timestamp: Date.now()
                    }));
                } catch (e) {}
            } else if (!this.categories || this.categories.length === 0) {
                this.categories = this.getDefaultCategories();
            }

            if (this.categories.length === 0) {
                this.categories = this.getDefaultCategories();
            }

            this.sortCategories();
            this.renderCategories();
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            if (!this.categories || this.categories.length === 0) {
                this.categories = this.getDefaultCategories();
                this.renderCategories();
            }
        }
    }

    // Default categories for fallback (without shoe brands)
    getDefaultCategories() {
        return [
            { id: 'all', name: 'All Products', image: 'https://via.placeholder.com/60x60?text=ALL', color: '#667eea' },
            { id: 'today offer', name: 'Today\'s Offers', image: 'https://via.placeholder.com/60x60?text=OFFER', color: '#6c757d', special: true },
            { id: 'watches', name: 'Watches', image: 'https://via.placeholder.com/60x60?text=WATCH', color: '#28a745' },
            { id: 'smart-watches', name: 'Smart Watches', image: 'https://via.placeholder.com/60x60?text=SMART', color: '#667eea' },
            { id: 'gadgets', name: 'Gadgets', image: 'https://via.placeholder.com/60x60?text=GADGET', color: '#667eea' },
            { id: 'sunglasses', name: 'Sunglasses', image: 'https://via.placeholder.com/60x60?text=SUN', color: '#667eea' },
            { id: 'airpods', name: 'Airpods', image: 'https://via.placeholder.com/60x60?text=AIRPODS', color: '#667eea' },
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

        const categoriesToDisplay = this.showAll ? this.categories : this.categories.slice(0, 5);

        categoriesContainer.innerHTML = `
            <div class="categories-section">
                <h2>Browse Categories</h2>
                <div class="categories-scroll">
                    <div class="categories-grid">
                        ${categoriesToDisplay.map(category => this.renderCategoryCard(category)).join('')}
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

    // Reveal all categories once background products load
    showAllCategoriesView() {
        if (this.showAll) return;
        this.showAll = true;
        this.renderCategories();
        console.log('⚡ All categories revealed smoothly');
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