// Simple lazy loading enhancement - images work with or without this script
(function() {
    'use strict';

    function initLazyLoading() {
        // Check if native lazy loading is supported
        if ('loading' in HTMLImageElement.prototype) {
            console.log('✅ Native lazy loading supported - images will load automatically');
            // Native lazy loading works, no need for polyfill
            return;
        }

        console.log('⚠️ Adding lazy loading polyfill for older browsers');

        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported - all images will load normally');
            return;
        }

        // Only apply polyfill to images that are far down the page
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Image is already loaded, just remove observer
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px', // Load images 100px before they come into view
            threshold: 0.01
        });

        // Find images with loading="lazy" that are below the fold
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        console.log(`Monitoring ${lazyImages.length} lazy images`);
        
        lazyImages.forEach(img => {
            // Don't interfere with images, just observe them
            imageObserver.observe(img);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyLoading);
    } else {
        initLazyLoading();
    }
})();