/**
 * Loading States Manager
 * Handles loading animations and skeleton screens for dynamic content
 */

class LoadingStatesManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupImageLoadingStates();
    this.setupContentLoadingStates();
    this.setupSkeletonScreens();
  }

  /**
   * Setup loading states for images
   */
  setupImageLoadingStates() {
    const images = document.querySelectorAll('img[loading="lazy"], .equipment-item img, .used-equipment-item img');
    
    images.forEach(img => {
      // Add loading placeholder
      this.addImageLoadingState(img);
      
      // Handle load event
      img.addEventListener('load', () => {
        this.removeImageLoadingState(img);
      });
      
      // Handle error event
      img.addEventListener('error', () => {
        this.handleImageError(img);
      });
    });
  }

  /**
   * Add loading state to image
   */
  addImageLoadingState(img) {
    const container = img.closest('.equipment-item, .used-equipment-item, .brand-logo-item') || img.parentElement;
    
    if (!img.complete) {
      container.classList.add('loading-image');
      
      // Create loading overlay
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'image-loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="image-loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      `;
      
      container.style.position = 'relative';
      container.appendChild(loadingOverlay);
    }
  }

  /**
   * Remove loading state from image
   */
  removeImageLoadingState(img) {
    const container = img.closest('.equipment-item, .used-equipment-item, .brand-logo-item') || img.parentElement;
    const overlay = container.querySelector('.image-loading-overlay');
    
    container.classList.remove('loading-image');
    
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
    
    // Add fade-in animation to loaded image
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      img.style.opacity = '1';
    }, 50);
  }

  /**
   * Handle image loading errors
   */
  handleImageError(img) {
    const container = img.closest('.equipment-item, .used-equipment-item, .brand-logo-item') || img.parentElement;
    const overlay = container.querySelector('.image-loading-overlay');
    
    if (overlay) {
      overlay.innerHTML = `
        <div class="image-error-state">
          <i class="fas fa-image"></i>
          <span>Image unavailable</span>
        </div>
      `;
      overlay.classList.add('error');
    }
    
    container.classList.add('image-error');
  }

  /**
   * Setup loading states for dynamic content
   */
  setupContentLoadingStates() {
    // Monitor for dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.handleNewContent(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Handle newly added content
   */
  handleNewContent(element) {
    // Add loading animation to new content
    if (element.classList && (
      element.classList.contains('equipment-item') ||
      element.classList.contains('used-equipment-item') ||
      element.classList.contains('card')
    )) {
      this.addContentLoadingState(element);
    }

    // Check for images in new content
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      this.addImageLoadingState(img);
    });
  }

  /**
   * Add loading state to content
   */
  addContentLoadingState(element) {
    element.classList.add('loading-content');
    
    // Remove loading state after a short delay
    setTimeout(() => {
      element.classList.remove('loading-content');
      element.classList.add('content-loaded');
    }, 500);
  }

  /**
   * Setup skeleton screens for different content types
   */
  setupSkeletonScreens() {
    // Add skeleton screens for equipment grids during initial load
    this.addEquipmentSkeletons();
    
    // Remove skeletons when content is ready
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.removeAllSkeletons();
      }, 1000);
    });
  }

  /**
   * Add skeleton screens for equipment grid
   */
  addEquipmentSkeletons() {
    const equipmentGrid = document.querySelector('.equipment-grid');
    if (equipmentGrid && equipmentGrid.children.length === 0) {
      for (let i = 0; i < 6; i++) {
        const skeleton = this.createEquipmentSkeleton();
        equipmentGrid.appendChild(skeleton);
      }
    }
  }

  /**
   * Create equipment item skeleton
   */
  createEquipmentSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'equipment-item skeleton-item';
    skeleton.innerHTML = `
      <div class="skeleton-image loading-skeleton"></div>
      <div class="skeleton-content">
        <div class="skeleton-title loading-skeleton"></div>
        <div class="skeleton-text loading-skeleton"></div>
      </div>
    `;
    return skeleton;
  }

  /**
   * Create card skeleton
   */
  createCardSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'card skeleton-item';
    skeleton.innerHTML = `
      <div class="skeleton-icon loading-skeleton"></div>
      <div class="skeleton-title loading-skeleton"></div>
      <div class="skeleton-text loading-skeleton"></div>
      <div class="skeleton-text loading-skeleton"></div>
      <div class="skeleton-list">
        <div class="skeleton-list-item loading-skeleton"></div>
        <div class="skeleton-list-item loading-skeleton"></div>
        <div class="skeleton-list-item loading-skeleton"></div>
      </div>
    `;
    return skeleton;
  }

  /**
   * Remove all skeleton screens
   */
  removeAllSkeletons() {
    const skeletons = document.querySelectorAll('.skeleton-item');
    skeletons.forEach(skeleton => {
      skeleton.style.opacity = '0';
      skeleton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        skeleton.remove();
      }, 300);
    });
  }

  /**
   * Show loading state for specific section
   */
  static showSectionLoading(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    if (section) {
      section.classList.add('section-loading');
      
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'section-loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="section-loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading...</span>
        </div>
      `;
      
      section.style.position = 'relative';
      section.appendChild(loadingOverlay);
    }
  }

  /**
   * Hide loading state for specific section
   */
  static hideSectionLoading(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    if (section) {
      section.classList.remove('section-loading');
      
      const overlay = section.querySelector('.section-loading-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
        }, 300);
      }
    }
  }

  /**
   * Create and show a loading toast notification
   */
  static showLoadingToast(message = 'Loading...') {
    const toast = document.createElement('div');
    toast.className = 'loading-toast';
    toast.innerHTML = `
      <i class="fas fa-spinner fa-spin"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    return toast;
  }

  /**
   * Hide loading toast
   */
  static hideLoadingToast(toast) {
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }
}

// Initialize loading states manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoadingStatesManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingStatesManager;
}