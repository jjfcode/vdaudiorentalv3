/**
 * Brand Selection System for Equipment Pages
 * Works reliably on both local and Render deployments
 */

class BrandSelection {
    constructor() {
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.init();
    }

    init() {
        // Disable equipment filters to prevent interference
        this.disableEquipmentFilters();
        
        // Setup brand selection when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupBrandSelection());
        } else {
            this.setupBrandSelection();
        }

        // Also setup after window load for extra safety
        window.addEventListener('load', () => {
            setTimeout(() => this.setupBrandSelection(), 500);
        });
    }

    disableEquipmentFilters() {
        // Disable on window load
        window.addEventListener('load', () => {
            if (window.equipmentFilters) {
                console.log('Disabling equipment filters for brand selection');
                window.equipmentFilters = null;
            }
        });

        // Also disable immediately if already loaded
        if (window.equipmentFilters) {
            console.log('Disabling equipment filters for brand selection (immediate)');
            window.equipmentFilters = null;
        }
    }

    setupBrandSelection() {
        const brandLogos = document.querySelectorAll('.brand-logo-item');
        
        if (brandLogos.length === 0 && this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Brand logos not found, retrying (${this.retryCount}/${this.maxRetries})`);
            setTimeout(() => this.setupBrandSelection(), 1000);
            return;
        }

        if (brandLogos.length === 0) {
            console.warn('No brand logos found after maximum retries');
            return;
        }

        console.log(`Setting up brand selection for ${brandLogos.length} brands`);

        brandLogos.forEach(logo => {
            // Remove existing listeners to prevent duplicates
            const newLogo = logo.cloneNode(true);
            logo.parentNode.replaceChild(newLogo, logo);
            
            newLogo.addEventListener('click', (e) => this.handleBrandClick(e));
            newLogo.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleBrandClick(e);
                }
            });
        });

        this.isInitialized = true;
        console.log('Brand selection system initialized successfully');
    }

    handleBrandClick(event) {
        const logo = event.currentTarget;
        const brandName = logo.getAttribute('data-brand');
        
        if (!brandName) {
            console.error('Brand name not found in data-brand attribute');
            return;
        }

        console.log('Brand clicked:', brandName);

        // Hide all brand sections
        this.hideAllBrandSections();

        // Show selected brand section
        this.showBrandSection(brandName);
    }

    hideAllBrandSections() {
        const brandSections = document.querySelectorAll('.brand-section');
        brandSections.forEach(section => {
            section.style.display = 'none';
            section.style.visibility = 'hidden';
            section.style.opacity = '0';
        });
    }

    showBrandSection(brandName) {
        // Determine the section ID pattern based on current page
        const currentPage = window.location.pathname.split('/').pop();
        let sectionId;

        switch (currentPage) {
            case 'speakers.html':
                sectionId = `${brandName}-speakers`;
                break;
            case 'mixers.html':
                sectionId = `${brandName}-mixers`;
                break;
            case 'wireless.html':
                sectionId = `${brandName}-wireless`;
                break;
            case 'wired.html':
                sectionId = `${brandName}-wired`;
                break;
            case 'outboard.html':
                sectionId = `${brandName}-outboard`;
                break;
            case 'players.html':
                sectionId = `${brandName}-players`;
                break;
            case 'snakes.html':
                sectionId = `${brandName}-snakes`;
                break;
            case 'intercom.html':
                sectionId = `${brandName}-intercom`;
                break;
            case 'iem.html':
                sectionId = `${brandName}-iem`;
                break;
            default:
                sectionId = `${brandName}-section`;
        }

        const targetSection = document.getElementById(sectionId);
        
        if (targetSection) {
            console.log('Showing section:', sectionId);
            
            // Remove inline styles that hide the section
            targetSection.removeAttribute('style');
            targetSection.style.display = 'block';
            targetSection.style.visibility = 'visible';
            
            // Force show ALL elements within this section by removing any hiding styles
            const allElements = targetSection.querySelectorAll('*');
            console.log(`Processing ${allElements.length} elements in section`);
            
            allElements.forEach(element => {
                // Remove any inline styles that might be hiding elements
                const style = element.getAttribute('style');
                if (style && (style.includes('display: none') || style.includes('visibility: hidden'))) {
                    element.removeAttribute('style');
                }
                
                // Remove filter-related classes that might hide elements
                element.classList.remove('filter-hidden', 'hidden');
            });
            
            // Specifically ensure equipment items are visible
            const equipmentItems = targetSection.querySelectorAll('.mixer-item, .equipment-item');
            console.log(`Found ${equipmentItems.length} equipment items in section`);
            
            equipmentItems.forEach(item => {
                item.removeAttribute('style');
                item.style.display = 'block';
                item.style.visibility = 'visible';
                item.classList.remove('filter-hidden', 'hidden');
                // CRITICAL: Add the filter-match class that CSS requires for visibility
                item.classList.add('filter-match');
            });
            
            // Ensure categories and grids are visible
            const categories = targetSection.querySelectorAll('.mixer-category, .equipment-category');
            categories.forEach(category => {
                category.removeAttribute('style');
                category.style.display = 'block';
                category.style.visibility = 'visible';
            });
            
            const grids = targetSection.querySelectorAll('.mixer-grid, .equipment-grid');
            grids.forEach(grid => {
                grid.removeAttribute('style');
                grid.style.display = 'grid';
                grid.style.visibility = 'visible';
            });
            
            console.log('All elements in section should now be visible');
            
            // Scroll to section after a short delay
            setTimeout(() => {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 150);
            
        } else {
            console.error('Section not found:', sectionId);
            console.log('Available sections:', Array.from(document.querySelectorAll('.brand-section')).map(s => s.id));
        }
    }
}

// Initialize brand selection system
new BrandSelection();
