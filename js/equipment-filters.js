/**
 * Equipment Filters and Search System
 * Implements category-based filtering, brand filtering, search functionality,
 * sort options, and localStorage persistence
 * Requirements: Improved equipment discovery
 */

class EquipmentFilters {
  constructor() {
    this.equipmentData = [];
    this.filteredData = [];
    this.currentFilters = {
      category: 'all',
      brand: 'all',
      search: '',
      sort: 'alphabetical'
    };
    
    this.filterContainer = null;
    this.equipmentContainer = null;
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    // Check if we're on a page that needs filtering
    if (this.shouldInitialize()) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Initializing equipment filters...');
      }
      
      this.loadFiltersFromStorage();
      this.extractEquipmentData();
      this.createFilterInterface();
      this.bindEvents();
      
      // Don't automatically show all items - wait for brand selection
      // Set up a listener for when brand sections become visible
      this.setupBrandVisibilityListener();
      
      // Don't apply saved filters on initial load - wait for brand selection
      // Clear any saved filters that might interfere with blank start
      if (this.hasActiveFilters()) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('Clearing saved filters to start blank:', this.currentFilters);
        }
        this.clearAllFilters();
      }
      
      // Ensure page starts completely blank - no equipment visible
      this.showAllItems();
      
      this.isInitialized = true;
      
      // Add a flag to indicate filter system is active
      document.body.classList.add('equipment-filters-active');
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Equipment filters initialized successfully');
      }
    }
  }
  
  shouldInitialize() {
    // Initialize on equipment category pages
    const equipmentPages = [
      'mixers.html', 'speakers.html', 'wireless.html', 
      'wired.html', 'intercom.html', 'outboard.html',
      'players.html', 'snakes.html', 'iem.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    const hasEquipmentPage = equipmentPages.includes(currentPage);
    const hasEquipmentSection = document.querySelector('.equipment-detail-page');
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Current page:', currentPage);
      console.log('Has equipment page:', hasEquipmentPage);
      console.log('Has equipment section:', !!hasEquipmentSection);
    }
    
    return hasEquipmentPage || hasEquipmentSection;
  }
  
  extractEquipmentData() {
    const equipmentItems = document.querySelectorAll('.mixer-item, .equipment-item');
    this.equipmentData = [];
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`Found ${equipmentItems.length} equipment items`);
    }
    
    equipmentItems.forEach((item, index) => {
      const titleElement = item.querySelector('h3');
      const specsElement = item.querySelector('.mixer-specs');
      const brandSection = item.closest('.brand-section');
      const categorySection = item.closest('.mixer-category');
      
      if (titleElement) {
        const equipmentInfo = {
          id: index,
          element: item,
          title: titleElement.textContent.trim(),
          brand: this.extractBrand(brandSection, item),
          category: this.extractCategory(categorySection, item),
          specs: this.extractSpecs(specsElement),
          searchText: this.buildSearchText(item),
          price: this.extractPrice(item)
        };
        
        this.equipmentData.push(equipmentInfo);
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log(`Added equipment: ${equipmentInfo.title} (${equipmentInfo.brand})`);
        }
      }
    });
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`Total equipment data: ${this.equipmentData.length} items`);
    }
    this.filteredData = [...this.equipmentData];
  }
  
  extractBrand(brandSection, item) {
    if (brandSection) {
      const brandImg = brandSection.querySelector('.brand-title-logo');
      if (brandImg) {
        const alt = brandImg.getAttribute('alt') || '';
        // Extract brand name from alt text or class
        const brandMatch = alt.match(/^([A-Za-z&\s]+)/);
        return brandMatch ? brandMatch[1].trim() : 'Unknown';
      }
      
      // Fallback to section class name
      const classList = brandSection.classList;
      for (let className of classList) {
        if (className.includes('-section')) {
          return className.replace('-section', '').replace('-', ' ').toUpperCase();
        }
      }
    }
    return 'Unknown';
  }
  
  extractCategory(categorySection, item) {
    if (categorySection) {
      const categoryTitle = categorySection.querySelector('.category-title');
      if (categoryTitle) {
        return categoryTitle.textContent.trim();
      }
    }
    
    // Fallback to page-based category
    const currentPage = window.location.pathname.split('/').pop();
    const pageCategories = {
      'mixers.html': 'Mixing Consoles',
      'speakers.html': 'Speaker Systems',
      'wireless.html': 'Wireless Microphones',
      'wired.html': 'Wired Microphones',
      'intercom.html': 'Intercom Systems',
      'outboard.html': 'Outboard Gear',
      'players.html': 'Players & Recorders',
      'snakes.html': 'Snakes & Splitters',
      'iem.html': 'In-Ear Monitors'
    };
    
    return pageCategories[currentPage] || 'Equipment';
  }
  
  extractSpecs(specsElement) {
    if (!specsElement) return [];
    
    const specs = [];
    const specItems = specsElement.querySelectorAll('li');
    specItems.forEach(item => {
      specs.push(item.textContent.trim());
    });
    return specs;
  }
  
  buildSearchText(item) {
    const title = item.querySelector('h3')?.textContent || '';
    const specs = item.querySelector('.mixer-specs')?.textContent || '';
    const features = item.querySelector('.additional-features')?.textContent || '';
    
    return `${title} ${specs} ${features}`.toLowerCase();
  }
  
  extractPrice(item) {
    // For future implementation when price data is available
    const priceElement = item.querySelector('.price, .equipment-price');
    if (priceElement) {
      const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
      return parseFloat(priceText) || 0;
    }
    return 0;
  }
  
  createFilterInterface() {
    // Find the equipment detail page container to append filters at the bottom
    const equipmentSection = document.querySelector('.equipment-detail-page');
    
    if (!equipmentSection) return;
    
    // Create filter container with proper sizing
    this.filterContainer = document.createElement('div');
    this.filterContainer.className = 'equipment-filters';
    this.filterContainer.style.cssText = `
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      margin: 20px 0;
    `;
    this.filterContainer.innerHTML = this.getFilterHTML();
    
    // Insert at the bottom of the equipment section inside a container
    const container = equipmentSection.querySelector('.container') || equipmentSection;
    container.appendChild(this.filterContainer);
    
    // Store reference to equipment container
    this.equipmentContainer = document.querySelector('.mixer-grid, .equipment-grid');
  }
  
  getFilterHTML() {
    const categories = this.getUniqueCategories();
    const brands = this.getUniqueBrands();
    
    return `
      <div class="filters-wrapper" style="width: 100%; max-width: 100%; box-sizing: border-box;">
        <div class="filters-header" style="padding: 12px 16px; background: var(--vd-primary); color: white; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 1rem;"><i class="fas fa-filter"></i> Filter & Search Equipment</h3>
          <button class="filters-toggle" aria-label="Toggle filters" aria-expanded="true" style="background: none; border: none; color: white; cursor: pointer;">
            <i class="fas fa-chevron-up"></i>
          </button>
        </div>
        
        <div class="filters-content" style="padding: 16px; background: var(--vd-background); width: 100%; box-sizing: border-box;">
          <div class="filters-row" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; width: 100%;">
            <div class="filter-group" style="flex: 1; min-width: 200px; max-width: 100%;">
              <label for="search-input" style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 0.9rem;">
                <i class="fas fa-search"></i> Search Equipment
              </label>
              <div class="search-wrapper" style="position: relative; width: 100%;">
                <input 
                  type="text" 
                  id="search-input" 
                  class="search-input" 
                  placeholder="Search equipment..."
                  value="${this.currentFilters.search}"
                  style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                >
                <button class="search-clear" aria-label="Clear search" style="display: ${this.currentFilters.search ? 'block' : 'none'}; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer;">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="filters-row" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; width: 100%;">
            <div class="filter-group" style="flex: 1; min-width: 150px; max-width: 100%;">
              <label for="brand-filter" style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 0.9rem;">
                <i class="fas fa-tag"></i> Brand
              </label>
              <select id="brand-filter" class="filter-select" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                <option value="all">All Brands</option>
                ${brands.map(brand => 
                  `<option value="${brand}" ${this.currentFilters.brand === brand ? 'selected' : ''}>${brand}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="filter-group" style="flex: 1; min-width: 150px; max-width: 100%;">
              <label for="sort-filter" style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 0.9rem;">
                <i class="fas fa-sort"></i> Sort By
              </label>
              <select id="sort-filter" class="filter-select" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                <option value="alphabetical" ${this.currentFilters.sort === 'alphabetical' ? 'selected' : ''}>Alphabetical</option>
                <option value="brand" ${this.currentFilters.sort === 'brand' ? 'selected' : ''}>Brand</option>
                <option value="category" ${this.currentFilters.sort === 'category' ? 'selected' : ''}>Category</option>
              </select>
            </div>
          </div>
          
          <div class="filters-actions" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; width: 100%;">
            <button class="btn btn-secondary clear-filters" style="padding: 8px 16px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-undo"></i> Clear Filters
            </button>
            <div class="results-count" style="font-size: 0.9rem; color: #666;">
              <span class="count-text">Showing <strong id="results-count">${this.filteredData.length}</strong> of <strong>${this.equipmentData.length}</strong> items</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  getUniqueCategories() {
    const categories = [...new Set(this.equipmentData.map(item => item.category))];
    return categories.filter(cat => cat && cat !== 'Unknown').sort();
  }
  
  getUniqueBrands() {
    const brands = [...new Set(this.equipmentData.map(item => item.brand))];
    return brands.filter(brand => brand && brand !== 'Unknown').sort();
  }
  
  bindEvents() {
    if (!this.filterContainer) return;
    
    // Override existing brand logo functionality
    this.overrideBrandSelection();
    
    // Search input
    const searchInput = this.filterContainer.querySelector('#search-input');
    const searchClear = this.filterContainer.querySelector('.search-clear');
    
    if (searchInput) {
      // Debounced search
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentFilters.search = e.target.value.toLowerCase();
          this.updateSearchClearButton();
          this.applyFilters();
          this.saveFiltersToStorage();
        }, 300);
      });
      
      // Clear search
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          this.currentFilters.search = '';
          this.updateSearchClearButton();
          this.applyFilters();
          this.saveFiltersToStorage();
          searchInput.focus();
        });
      }
    }
    
    // Filter selects
    const categoryFilter = this.filterContainer.querySelector('#category-filter');
    const brandFilter = this.filterContainer.querySelector('#brand-filter');
    const sortFilter = this.filterContainer.querySelector('#sort-filter');
    
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value;
        this.applyFilters();
        this.saveFiltersToStorage();
      });
    }
    
    if (brandFilter) {
      brandFilter.addEventListener('change', (e) => {
        this.currentFilters.brand = e.target.value;
        this.applyFilters();
        this.saveFiltersToStorage();
      });
    }
    
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.currentFilters.sort = e.target.value;
        this.applyFilters();
        this.saveFiltersToStorage();
      });
    }
    
    // Clear filters button
    const clearButton = this.filterContainer.querySelector('.clear-filters');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
    
    // Toggle filters visibility
    const filtersToggle = this.filterContainer.querySelector('.filters-toggle');
    const filtersContent = this.filterContainer.querySelector('.filters-content');
    
    if (filtersToggle && filtersContent) {
      filtersToggle.addEventListener('click', () => {
        const isExpanded = filtersToggle.getAttribute('aria-expanded') === 'true';
        filtersToggle.setAttribute('aria-expanded', !isExpanded);
        filtersContent.style.display = isExpanded ? 'none' : 'block';
        
        const icon = filtersToggle.querySelector('i');
        if (icon) {
          icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        }
      });
    }
    
    // Scroll to top button
    const scrollToTopBtn = this.filterContainer.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
  
  overrideBrandSelection() {
    // Don't interfere with brand selection - let it work normally
    console.log('Equipment filters initialized, working alongside brand selection');
  }
  
  updateSearchClearButton() {
    const searchClear = this.filterContainer?.querySelector('.search-clear');
    if (searchClear) {
      searchClear.style.display = this.currentFilters.search ? 'block' : 'none';
    }
  }
  
  applyFilters() {
    // Filter the data
    this.filteredData = this.equipmentData.filter(item => {
      // Search filter
      if (this.currentFilters.search && 
          !item.searchText.includes(this.currentFilters.search)) {
        return false;
      }
      
      // Category filter
      if (this.currentFilters.category !== 'all' && 
          item.category !== this.currentFilters.category) {
        return false;
      }
      
      // Brand filter
      if (this.currentFilters.brand !== 'all' && 
          item.brand !== this.currentFilters.brand) {
        return false;
      }
      
      return true;
    });
    
    // Sort the data
    this.sortData();
    
    // Update the display
    this.updateDisplay();
    this.updateResultsCount();
  }
  
  sortData() {
    this.filteredData.sort((a, b) => {
      switch (this.currentFilters.sort) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'brand':
          return a.brand.localeCompare(b.brand) || a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }
  
  updateDisplay() {
    // Hide all brand sections and equipment items first
    const brandSections = document.querySelectorAll('.brand-section');
    brandSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Hide all category sections within brand sections
    const categorySections = document.querySelectorAll('.mixer-category');
    categorySections.forEach(section => {
      section.style.display = 'none';
    });
    
    this.equipmentData.forEach(item => {
      item.element.style.display = 'none';
      item.element.classList.remove('filter-match');
    });
    
    // Track which sections need to be shown
    const visibleBrandSections = new Set();
    const visibleCategorySections = new Set();
    
    // Show filtered items with animation
    this.filteredData.forEach((item, index) => {
      item.element.style.display = 'block';
      item.element.classList.add('filter-match');
      
      // Find and show the parent brand section
      const brandSection = item.element.closest('.brand-section');
      if (brandSection) {
        visibleBrandSections.add(brandSection);
      }
      
      // Find and show the parent category section
      const categorySection = item.element.closest('.mixer-category');
      if (categorySection) {
        visibleCategorySections.add(categorySection);
      }
      
      // Staggered animation
      setTimeout(() => {
        item.element.classList.add('filter-animate');
      }, index * 50);
    });
    
    // Show all brand sections that contain visible items
    visibleBrandSections.forEach(section => {
      section.style.display = 'block';
    });
    
    // Show all category sections that contain visible items
    visibleCategorySections.forEach(section => {
      section.style.display = 'block';
    });
    
    // Handle empty state
    this.handleEmptyState();
  }
  
  handleEmptyState() {
    const existingEmptyState = document.querySelector('.equipment-empty-state');
    if (existingEmptyState) {
      existingEmptyState.remove();
    }
    
    if (this.filteredData.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'equipment-empty-state';
      emptyState.innerHTML = `
        <div class="empty-state-content">
          <i class="fas fa-search empty-state-icon"></i>
          <h3>No Equipment Found</h3>
          <p>No equipment matches your current filters. Try adjusting your search criteria.</p>
          <button class="btn btn-primary clear-filters-empty">Clear All Filters</button>
        </div>
      `;
      
      // Insert after filters
      if (this.filterContainer && this.filterContainer.parentNode) {
        this.filterContainer.parentNode.insertBefore(emptyState, this.filterContainer.nextSibling);
      }
      
      // Bind clear filters event
      const clearButton = emptyState.querySelector('.clear-filters-empty');
      if (clearButton) {
        clearButton.addEventListener('click', () => {
          this.clearAllFilters();
        });
      }
    }
  }
  
  updateResultsCount() {
    const countElement = this.filterContainer?.querySelector('#results-count');
    if (countElement) {
      countElement.textContent = this.filteredData.length;
    }
  }
  
  clearAllFilters() {
    this.currentFilters = {
      category: 'all',
      brand: 'all',
      search: '',
      sort: 'alphabetical'
    };
    
    // Update UI elements
    if (this.filterContainer) {
      const searchInput = this.filterContainer.querySelector('#search-input');
      const categoryFilter = this.filterContainer.querySelector('#category-filter');
      const brandFilter = this.filterContainer.querySelector('#brand-filter');
      const sortFilter = this.filterContainer.querySelector('#sort-filter');
      
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = 'all';
      if (brandFilter) brandFilter.value = 'all';
      if (sortFilter) sortFilter.value = 'alphabetical';
    }
    
    this.updateSearchClearButton();
    this.applyFilters();
    this.saveFiltersToStorage();
  }
  
  saveFiltersToStorage() {
    try {
      const currentPage = window.location.pathname.split('/').pop();
      const storageKey = `equipmentFilters_${currentPage}`;
      localStorage.setItem(storageKey, JSON.stringify(this.currentFilters));
    } catch (error) {
      console.warn('Could not save filters to localStorage:', error);
    }
  }
  
  loadFiltersFromStorage() {
    try {
      const currentPage = window.location.pathname.split('/').pop();
      const storageKey = `equipmentFilters_${currentPage}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const savedFilters = JSON.parse(saved);
        this.currentFilters = { ...this.currentFilters, ...savedFilters };
      }
    } catch (error) {
      console.warn('Could not load filters from localStorage:', error);
    }
  }
  
  // Public API methods
  getFilteredData() {
    return this.filteredData;
  }
  
  getCurrentFilters() {
    return { ...this.currentFilters };
  }
  
  setFilters(filters) {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.applyFilters();
    this.saveFiltersToStorage();
  }
  
  hasActiveFilters() {
    return this.currentFilters.search !== '' ||
           this.currentFilters.category !== 'all' ||
           this.currentFilters.brand !== 'all' ||
           this.currentFilters.sort !== 'alphabetical';
  }
  
  setupBrandVisibilityListener() {
    // Watch for changes in brand section visibility
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target;
          if (target.classList.contains('brand-section')) {
            // A brand section's style changed, update the filters
            setTimeout(() => {
              this.showAllItems();
            }, 100);
          }
        }
      });
    });
    
    // Observe all brand sections for style changes
    const brandSections = document.querySelectorAll('.brand-section');
    brandSections.forEach(section => {
      observer.observe(section, { attributes: true, attributeFilter: ['style'] });
    });
  }

  showAllItems() {
    // Only show equipment items within visible brand sections
    const visibleBrandSections = document.querySelectorAll('.brand-section');
    const actuallyVisibleSections = Array.from(visibleBrandSections).filter(section => {
      // Be very strict about visibility - only show if explicitly set to block
      return section.style.display === 'block';
    });
    
    if (actuallyVisibleSections.length === 0) {
      // No brand sections are visible, hide all equipment and show 0 count
      console.log('No brand sections visible, hiding all equipment');
      this.equipmentData.forEach(item => {
        item.element.style.display = 'none';
        item.element.classList.remove('filter-match');
      });
      this.filteredData = [];
      this.updateResultsCount();
      return;
    }
    
    console.log('Visible brand sections:', actuallyVisibleSections.length);
    
    // Show all category sections within visible brand sections
    actuallyVisibleSections.forEach(brandSection => {
      const categorySections = brandSection.querySelectorAll('.mixer-category');
      categorySections.forEach(section => {
        section.style.display = 'block';
      });
    });
    
    // Show all equipment items within visible brand sections
    this.equipmentData.forEach(item => {
      const parentBrandSection = item.element.closest('.brand-section');
      if (parentBrandSection && actuallyVisibleSections.includes(parentBrandSection)) {
        item.element.style.display = 'block';
        item.element.classList.add('filter-match');
      } else {
        item.element.style.display = 'none';
        item.element.classList.remove('filter-match');
      }
    });
    
    // Update filtered data to only include items from visible sections
    this.filteredData = this.equipmentData.filter(item => {
      const parentBrandSection = item.element.closest('.brand-section');
      return parentBrandSection && actuallyVisibleSections.includes(parentBrandSection);
    });
    
    this.updateResultsCount();
    console.log('Equipment items updated for visible sections');
  }
}

// Ensure all brand sections start hidden
function ensureBlankStart() {
  const brandSections = document.querySelectorAll('.brand-section');
  brandSections.forEach(section => {
    section.style.display = 'none';
    section.style.visibility = 'hidden';
  });
  
  const equipmentItems = document.querySelectorAll('.mixer-item, .equipment-item');
  equipmentItems.forEach(item => {
    item.style.display = 'none';
  });
  
  console.log('Forced blank start - all brand sections and equipment hidden');
}

// Run immediately
ensureBlankStart();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Ensure blank start again after DOM is loaded
  setTimeout(() => {
    ensureBlankStart();
  }, 100);
  
  // Initialize the filter system
  window.equipmentFilters = new EquipmentFilters();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EquipmentFilters;
}