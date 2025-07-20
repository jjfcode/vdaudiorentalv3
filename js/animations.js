/**
 * Animation and Transition Effects
 * Handles scroll-triggered animations, parallax effects, and page transitions
 */

class AnimationController {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupParallaxEffects();
    this.setupPageTransitions();
    this.setupNavbarScrollEffect();
    this.handleReducedMotion();
  }

  /**
   * Setup scroll-triggered animations using Intersection Observer
   */
  setupScrollAnimations() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Add animation classes based on element type
          if (element.classList.contains('equipment-item')) {
            element.classList.add('fade-in-up');
            // Add staggered delay based on position
            const index = Array.from(element.parentNode.children).indexOf(element);
            element.style.animationDelay = `${index * 0.1}s`;
          } else if (element.classList.contains('card')) {
            element.classList.add('slide-in-left');
          } else if (element.classList.contains('used-equipment-item')) {
            element.classList.add('scale-in');
          } else {
            element.classList.add('fade-in-up');
          }
          
          element.classList.add('animate');
          observer.unobserve(element);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(`
      .equipment-item,
      .services-grid .card,
      .used-equipment-item,
      .about-content,
      .contact-grid,
      .footer-content
    `);

    animateElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  /**
   * Setup parallax scrolling effects
   */
  setupParallaxEffects() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      // Hero parallax effect
      const hero = document.querySelector('.hero');
      if (hero) {
        const heroParallax = hero.querySelector('::before') || hero;
        const heroSpeed = 0.3;
        const heroYPos = scrolled * heroSpeed;
        if (hero.style) {
          hero.style.backgroundPosition = `center ${heroYPos}px`;
        }
      }

      ticking = false;
    };

    const requestParallaxUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Throttled scroll listener for performance
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  }

  /**
   * Setup page transition effects
   */
  setupPageTransitions() {
    // Add page transition class to main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.classList.add('page-transition');

    // Trigger transition when page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        mainContent.classList.add('loaded');
      }, 100);
    });

    // Handle page transitions for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"], a[href^="./"], a[href^="pages/"]');
    
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Don't interfere with hash links (smooth scrolling)
        if (link.getAttribute('href').startsWith('#')) {
          return;
        }

        e.preventDefault();
        const href = link.getAttribute('href');
        
        // Add exit animation
        mainContent.classList.remove('loaded');
        
        // Navigate after animation
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }

  /**
   * Setup navbar scroll effects
   */
  setupNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollTop = 0;
    let ticking = false;

    const updateNavbar = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class when scrolling down
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScrollTop = scrollTop;
      ticking = false;
    };

    const requestNavbarUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestNavbarUpdate, { passive: true });
  }

  /**
   * Handle reduced motion preferences
   */
  handleReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = (e) => {
      if (e.matches) {
        // User prefers reduced motion
        document.body.classList.add('reduced-motion');
        this.disableAnimations();
        
        // Show accessibility notice
        this.showReducedMotionNotice();
      } else {
        document.body.classList.remove('reduced-motion');
        this.enableAnimations();
      }
    };

    // Check initial state
    handleReducedMotionChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    // Add manual toggle for user preference
    this.addMotionToggle();
  }

  /**
   * Disable animations for reduced motion
   */
  disableAnimations() {
    // Make all scroll-triggered elements immediately visible
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('animate');
    });

    // Disable parallax effects
    const parallaxElements = document.querySelectorAll('.parallax-element');
    parallaxElements.forEach(el => {
      el.style.transform = 'none';
    });

    // Stop any running animations
    const loadingElements = document.querySelectorAll('.loading-pulse, .loading-skeleton');
    loadingElements.forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  }

  /**
   * Enable animations (when reduced motion is turned off)
   */
  enableAnimations() {
    // Reset scroll-triggered elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      if (!this.isElementInViewport(el)) {
        el.style.opacity = '';
        el.style.transform = '';
        el.classList.remove('animate');
      }
    });

    // Resume animations
    const loadingElements = document.querySelectorAll('.loading-pulse, .loading-skeleton');
    loadingElements.forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Show reduced motion accessibility notice
   */
  showReducedMotionNotice() {
    // Check if notice was already shown in this session
    if (sessionStorage.getItem('reducedMotionNoticeShown')) {
      return;
    }

    const notice = document.createElement('div');
    notice.className = 'accessibility-notice';
    notice.innerHTML = `
      <div class="notice-content">
        <i class="fas fa-universal-access"></i>
        <div class="notice-text">
          <strong>Reduced Motion Enabled</strong>
          <p>Animations have been minimized based on your system preferences.</p>
        </div>
        <button class="notice-close" aria-label="Close notice">&times;</button>
      </div>
    `;

    document.body.appendChild(notice);

    // Show notice
    setTimeout(() => {
      notice.classList.add('show');
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideAccessibilityNotice(notice);
    }, 5000);

    // Close button
    notice.querySelector('.notice-close').addEventListener('click', () => {
      this.hideAccessibilityNotice(notice);
    });

    // Mark as shown
    sessionStorage.setItem('reducedMotionNoticeShown', 'true');
  }

  /**
   * Hide accessibility notice
   */
  hideAccessibilityNotice(notice) {
    notice.classList.remove('show');
    setTimeout(() => {
      notice.remove();
    }, 300);
  }

  /**
   * Add manual motion toggle for user preference
   */
  addMotionToggle() {
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'motion-toggle';
    toggle.innerHTML = `
      <i class="fas fa-play"></i>
      <span>Enable Animations</span>
    `;
    toggle.setAttribute('aria-label', 'Toggle animations on/off');
    toggle.setAttribute('title', 'Toggle animations on/off');

    // Position toggle
    toggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--vd-primary);
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
    `;

    // Only show toggle if user has reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.appendChild(toggle);
      
      setTimeout(() => {
        toggle.style.opacity = '1';
        toggle.style.transform = 'translateY(0)';
      }, 1000);

      // Toggle functionality
      let animationsEnabled = false;
      toggle.addEventListener('click', () => {
        animationsEnabled = !animationsEnabled;
        
        if (animationsEnabled) {
          document.body.classList.remove('reduced-motion');
          toggle.innerHTML = `<i class="fas fa-pause"></i><span>Disable Animations</span>`;
          this.enableAnimations();
        } else {
          document.body.classList.add('reduced-motion');
          toggle.innerHTML = `<i class="fas fa-play"></i><span>Enable Animations</span>`;
          this.disableAnimations();
        }
      });
    }
  }

  /**
   * Add loading animation to dynamic content
   */
  static addLoadingAnimation(element) {
    element.classList.add('loading-pulse');
    
    // Remove loading animation after content loads
    const removeLoading = () => {
      element.classList.remove('loading-pulse');
      element.classList.add('fade-in');
    };

    // If element has images, wait for them to load
    const images = element.querySelectorAll('img');
    if (images.length > 0) {
      let loadedImages = 0;
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === images.length) {
              removeLoading();
            }
          });
        }
      });
      
      if (loadedImages === images.length) {
        removeLoading();
      }
    } else {
      // No images, remove loading immediately
      setTimeout(removeLoading, 500);
    }
  }

  /**
   * Create skeleton loading animation
   */
  static createSkeletonLoader(container, type = 'card') {
    const skeleton = document.createElement('div');
    skeleton.className = 'loading-skeleton';
    
    if (type === 'card') {
      skeleton.innerHTML = `
        <div style="height: 200px; margin-bottom: 1rem;"></div>
        <div style="height: 20px; width: 70%; margin-bottom: 0.5rem;"></div>
        <div style="height: 16px; width: 100%; margin-bottom: 0.5rem;"></div>
        <div style="height: 16px; width: 80%;"></div>
      `;
    } else if (type === 'text') {
      skeleton.innerHTML = `
        <div style="height: 16px; width: 100%; margin-bottom: 0.5rem;"></div>
        <div style="height: 16px; width: 90%; margin-bottom: 0.5rem;"></div>
        <div style="height: 16px; width: 75%;"></div>
      `;
    }
    
    container.appendChild(skeleton);
    return skeleton;
  }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AnimationController();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationController;
}