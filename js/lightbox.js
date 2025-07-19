/**
 * Equipment Image Gallery Lightbox
 * Provides lightbox functionality for equipment images with zoom, pan, and keyboard navigation
 */

class EquipmentLightbox {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.isZoomed = false;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        
        this.init();
    }
    
    init() {
        this.createLightboxHTML();
        this.bindEvents();
        this.setupImageClickHandlers();
    }
    
    createLightboxHTML() {
        const lightboxHTML = `
            <div class="lightbox-overlay" id="lightbox-overlay" role="dialog" aria-modal="true" aria-labelledby="lightbox-title" aria-hidden="true">
                <div class="lightbox-container">
                    <div class="lightbox-loading" id="lightbox-loading" aria-hidden="true">
                        <span class="lightbox-spinner"></span>
                        Loading...
                    </div>
                    
                    <img class="lightbox-image" id="lightbox-image" alt="" />
                    
                    <button class="lightbox-close" id="lightbox-close" aria-label="Close gallery">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                    
                    <button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Previous image">
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    
                    <button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Next image">
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                    
                    <div class="lightbox-zoom-controls">
                        <button class="lightbox-zoom-btn" id="lightbox-zoom-in" aria-label="Zoom in">
                            <i class="fas fa-plus" aria-hidden="true"></i>
                        </button>
                        <button class="lightbox-zoom-btn" id="lightbox-zoom-out" aria-label="Zoom out">
                            <i class="fas fa-minus" aria-hidden="true"></i>
                        </button>
                        <button class="lightbox-zoom-btn" id="lightbox-reset" aria-label="Reset zoom">
                            <i class="fas fa-expand-arrows-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                    
                    <div class="lightbox-info" id="lightbox-info">
                        <div class="lightbox-title" id="lightbox-title"></div>
                        <div class="lightbox-counter" id="lightbox-counter"></div>
                    </div>
                    
                    <div class="lightbox-thumbnails" id="lightbox-thumbnails"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        
        // Get references to elements
        this.overlay = document.getElementById('lightbox-overlay');
        this.image = document.getElementById('lightbox-image');
        this.loading = document.getElementById('lightbox-loading');
        this.closeBtn = document.getElementById('lightbox-close');
        this.prevBtn = document.getElementById('lightbox-prev');
        this.nextBtn = document.getElementById('lightbox-next');
        this.zoomInBtn = document.getElementById('lightbox-zoom-in');
        this.zoomOutBtn = document.getElementById('lightbox-zoom-out');
        this.resetBtn = document.getElementById('lightbox-reset');
        this.titleEl = document.getElementById('lightbox-title');
        this.counterEl = document.getElementById('lightbox-counter');
        this.thumbnailsEl = document.getElementById('lightbox-thumbnails');
    }
    
    bindEvents() {
        // Close events
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        
        // Navigation events
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Zoom events
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.resetBtn.addEventListener('click', () => this.resetZoom());
        this.image.addEventListener('dblclick', () => this.toggleZoom());
        
        // Pan events (for zoomed images)
        this.image.addEventListener('mousedown', (e) => this.startPan(e));
        this.image.addEventListener('mousemove', (e) => this.pan(e));
        this.image.addEventListener('mouseup', () => this.endPan());
        this.image.addEventListener('mouseleave', () => this.endPan());
        
        // Touch events for mobile
        this.image.addEventListener('touchstart', (e) => this.startPan(e.touches[0]));
        this.image.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.pan(e.touches[0]);
        });
        this.image.addEventListener('touchend', () => this.endPan());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Image load events
        this.image.addEventListener('load', () => this.hideLoading());
        this.image.addEventListener('error', () => this.handleImageError());
    }
    
    setupImageClickHandlers() {
        // Find all equipment images and add lightbox overlay buttons
        const imageLinks = document.querySelectorAll('.mixer-image-link, .equipment-item a');
        
        imageLinks.forEach((link, index) => {
            const img = link.querySelector('img');
            if (!img) return;
            
            // Create lightbox button overlay
            const lightboxBtn = document.createElement('button');
            lightboxBtn.className = 'lightbox-trigger-btn';
            lightboxBtn.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
            lightboxBtn.setAttribute('aria-label', 'View image in gallery');
            lightboxBtn.setAttribute('title', 'View in gallery');
            
            // Position the button
            link.style.position = 'relative';
            link.appendChild(lightboxBtn);
            
            // Add click handler to the button
            lightboxBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openFromLink(link, index);
            });
            
            // Add keyboard support
            lightboxBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openFromLink(link, index);
                }
            });
        });
    }
    
    openFromLink(link, startIndex = 0) {
        // Collect all images from the current page/section
        this.collectImages();
        
        // Find the actual index of the clicked image
        const img = link.querySelector('img');
        if (img) {
            const actualIndex = this.images.findIndex(imageData => 
                imageData.src === img.src || imageData.src.includes(img.src.split('/').pop())
            );
            this.currentIndex = actualIndex >= 0 ? actualIndex : startIndex;
        } else {
            this.currentIndex = startIndex;
        }
        
        this.open();
    }
    
    collectImages() {
        this.images = [];
        
        // Collect images from equipment items and mixer items
        const imageElements = document.querySelectorAll('.mixer-item img, .equipment-item img, .used-equipment-item img');
        
        imageElements.forEach(img => {
            // Skip if it's a brand logo or navigation image
            if (img.closest('.brand-logo-item') || img.closest('.navbar-brand')) {
                return;
            }
            
            const title = this.getImageTitle(img);
            const description = this.getImageDescription(img);
            
            this.images.push({
                src: img.src,
                alt: img.alt || title,
                title: title,
                description: description
            });
        });
    }
    
    getImageTitle(img) {
        // Try to get title from various sources
        const mixerInfo = img.closest('.mixer-item')?.querySelector('h3');
        const equipmentTitle = img.closest('.equipment-item')?.querySelector('h3');
        const usedEquipmentTitle = img.closest('.used-equipment-item')?.querySelector('h3');
        
        if (mixerInfo) return mixerInfo.textContent.trim();
        if (equipmentTitle) return equipmentTitle.textContent.trim();
        if (usedEquipmentTitle) return usedEquipmentTitle.textContent.trim();
        
        // Fallback to alt text or filename
        const altText = img.alt || img.src.split('/').pop().split('.')[0];
        return altText.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    getImageDescription(img) {
        // Try to get description from equipment specs or description
        const mixerSpecs = img.closest('.mixer-item')?.querySelector('.mixer-specs');
        const equipmentDesc = img.closest('.equipment-item')?.querySelector('p');
        const usedEquipmentDesc = img.closest('.used-equipment-item')?.querySelector('.equipment-description');
        
        if (mixerSpecs) {
            const specs = Array.from(mixerSpecs.querySelectorAll('li')).slice(0, 2);
            return specs.map(spec => spec.textContent.trim()).join(' • ');
        }
        
        if (equipmentDesc) return equipmentDesc.textContent.trim();
        if (usedEquipmentDesc) return usedEquipmentDesc.textContent.trim();
        
        return '';
    }
    
    open() {
        if (this.images.length === 0) return;
        
        this.overlay.style.display = 'flex';
        this.overlay.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management
        this.previousFocus = document.activeElement;
        
        setTimeout(() => {
            this.overlay.classList.add('active');
            this.loadImage();
            this.closeBtn.focus();
        }, 10);
    }
    
    close() {
        this.overlay.classList.remove('active');
        this.overlay.setAttribute('aria-hidden', 'true');
        
        setTimeout(() => {
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
            
            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
            }
        }, 300);
        
        this.resetZoom();
    }
    
    loadImage() {
        if (!this.images[this.currentIndex]) return;
        
        this.showLoading();
        
        const imageData = this.images[this.currentIndex];
        this.image.src = imageData.src;
        this.image.alt = imageData.alt;
        
        this.updateInfo();
        this.updateNavigation();
        this.updateThumbnails();
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.loading.setAttribute('aria-hidden', 'false');
        this.image.style.opacity = '0';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
        this.loading.setAttribute('aria-hidden', 'true');
        this.image.style.opacity = '1';
    }
    
    handleImageError() {
        this.hideLoading();
        this.titleEl.textContent = 'Image failed to load';
        this.image.alt = 'Image failed to load';
    }
    
    updateInfo() {
        const imageData = this.images[this.currentIndex];
        this.titleEl.textContent = imageData.title;
        this.counterEl.textContent = `${this.currentIndex + 1} of ${this.images.length}`;
        
        // Update aria-label for screen readers
        this.overlay.setAttribute('aria-labelledby', 'lightbox-title');
    }
    
    updateNavigation() {
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.images.length - 1;
        
        // Hide navigation if only one image
        if (this.images.length <= 1) {
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
        } else {
            this.prevBtn.style.display = 'flex';
            this.nextBtn.style.display = 'flex';
        }
    }
    
    updateThumbnails() {
        if (this.images.length <= 1) {
            this.thumbnailsEl.style.display = 'none';
            return;
        }
        
        this.thumbnailsEl.style.display = 'flex';
        this.thumbnailsEl.innerHTML = '';
        
        this.images.forEach((imageData, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = imageData.src;
            thumbnail.alt = `Thumbnail ${index + 1}`;
            thumbnail.className = 'lightbox-thumbnail';
            thumbnail.tabIndex = 0;
            
            if (index === this.currentIndex) {
                thumbnail.classList.add('active');
            }
            
            thumbnail.addEventListener('click', () => {
                this.currentIndex = index;
                this.loadImage();
            });
            
            thumbnail.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.currentIndex = index;
                    this.loadImage();
                }
            });
            
            this.thumbnailsEl.appendChild(thumbnail);
        });
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.loadImage();
        }
    }
    
    next() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.loadImage();
        }
    }
    
    zoomIn() {
        if (!this.isZoomed) {
            this.toggleZoom();
        }
    }
    
    zoomOut() {
        if (this.isZoomed) {
            this.toggleZoom();
        }
    }
    
    toggleZoom() {
        this.isZoomed = !this.isZoomed;
        
        if (this.isZoomed) {
            this.image.classList.add('zoomed');
            this.image.style.cursor = 'grab';
        } else {
            this.resetZoom();
        }
    }
    
    resetZoom() {
        this.isZoomed = false;
        this.image.classList.remove('zoomed');
        this.image.style.transform = '';
        this.image.style.cursor = '';
        this.translateX = 0;
        this.translateY = 0;
    }
    
    startPan(e) {
        if (!this.isZoomed) return;
        
        this.isDragging = true;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        this.image.style.cursor = 'grabbing';
    }
    
    pan(e) {
        if (!this.isDragging || !this.isZoomed) return;
        
        e.preventDefault();
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        
        this.image.style.transform = `scale(1.5) translate(${this.translateX}px, ${this.translateY}px)`;
    }
    
    endPan() {
        this.isDragging = false;
        if (this.isZoomed) {
            this.image.style.cursor = 'grab';
        }
    }
    
    handleKeydown(e) {
        if (!this.overlay.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.prev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.zoomIn();
                break;
            case '-':
                e.preventDefault();
                this.zoomOut();
                break;
            case '0':
                e.preventDefault();
                this.resetZoom();
                break;
            case 'Home':
                e.preventDefault();
                this.currentIndex = 0;
                this.loadImage();
                break;
            case 'End':
                e.preventDefault();
                this.currentIndex = this.images.length - 1;
                this.loadImage();
                break;
        }
    }
}

// Initialize the lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EquipmentLightbox();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentLightbox;
}