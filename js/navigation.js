/**
 * Mobile Navigation System
 * Handles hamburger menu toggle, keyboard navigation, and accessibility
 * Implements requirements 1.1, 1.2, 1.3, 1.4
 */

class MobileNavigation {
  constructor() {
    this.mobileToggle = document.querySelector('.mobile-menu-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    this.navItems = document.querySelectorAll('.nav-menu li');
    this.isMenuOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.mobileToggle || !this.navMenu) {
      console.warn('Mobile navigation elements not found');
      return;
    }
    
    // Set item index for staggered animation
    this.navItems.forEach((item, index) => {
      item.style.setProperty('--item-index', index);
    });
    
    this.bindEvents();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    this.setupTouchInteractions();
  }
  
  bindEvents() {
    // Toggle menu on button click
    this.mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });
    
    // Close menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.closeMenu();
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && 
          !this.navMenu.contains(e.target) && 
          !this.mobileToggle.contains(e.target)) {
        this.closeMenu();
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMenu();
      }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
        this.mobileToggle.focus();
      }
    });
  }
  
  setupKeyboardNavigation() {
    // Add tab index to ensure proper focus order
    this.navLinks.forEach(link => {
      link.setAttribute('tabindex', this.isMenuOpen ? '0' : '-1');
    });
    
    // Handle keyboard navigation within menu
    this.navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        if (!this.isMenuOpen && e.key !== 'Enter' && e.key !== ' ') return;
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.focusNextLink(index);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.focusPreviousLink(index);
            break;
          case 'Home':
            e.preventDefault();
            this.navLinks[0].focus();
            break;
          case 'End':
            e.preventDefault();
            this.navLinks[this.navLinks.length - 1].focus();
            break;
          case 'Tab':
            // If it's the last item and tabbing forward, close menu and move focus
            if (!e.shiftKey && index === this.navLinks.length - 1) {
              e.preventDefault();
              this.closeMenu();
              // Find the next focusable element after the navigation
              const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
              const focusableContent = document.querySelectorAll(focusableElements);
              const navMenuIndex = Array.from(focusableContent).indexOf(this.navLinks[index]);
              if (navMenuIndex !== -1 && navMenuIndex < focusableContent.length - 1) {
                focusableContent[navMenuIndex + 1].focus();
              }
            }
            break;
        }
      });
    });
    
    // Ensure toggle button handles keyboard events properly
    this.mobileToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMenu();
      }
    });
  }
  
  setupAccessibility() {
    // Set initial ARIA attributes
    this.mobileToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.setAttribute('aria-hidden', 'true');
    
    // Add role for better screen reader support
    this.navMenu.setAttribute('role', 'navigation');
    this.navMenu.setAttribute('aria-label', 'Main navigation');
    
    // Add skip to content link for accessibility
    this.addSkipToContentLink();
    
    // Announce menu state changes to screen readers
    this.createScreenReaderAnnouncement();
  }
  
  setupTouchInteractions() {
    // Ensure touch targets are at least 44px
    this.navLinks.forEach(link => {
      link.addEventListener('touchstart', () => {
        // Add touch feedback
        link.classList.add('touch-active');
      });
      
      link.addEventListener('touchend', () => {
        // Remove touch feedback after a short delay to provide visual feedback
        setTimeout(() => {
          link.classList.remove('touch-active');
        }, 150);
      });
    });
    
    // Add touch feedback for mobile toggle
    this.mobileToggle.addEventListener('touchstart', () => {
      this.mobileToggle.classList.add('touch-active');
    });
    
    this.mobileToggle.addEventListener('touchend', () => {
      this.mobileToggle.classList.remove('touch-active');
    });
  }
  
  addSkipToContentLink() {
    // Check if skip link already exists
    if (document.querySelector('.skip-to-content')) {
      return;
    }
    
    // Create skip to content link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-to-content';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to content';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    
    // Add to DOM as first element
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add event listener to focus on main content
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Find main content area
      const mainContent = document.querySelector('#home') || 
                          document.querySelector('main') || 
                          document.querySelector('.section');
      
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        // Remove tabindex after focus to prevent keyboard trap
        setTimeout(() => {
          mainContent.removeAttribute('tabindex');
        }, 1000);
      }
    });
  }
  
  createScreenReaderAnnouncement() {
    // Create element for screen reader announcements
    const srAnnouncement = document.createElement('div');
    srAnnouncement.className = 'sr-announcement';
    srAnnouncement.setAttribute('aria-live', 'polite');
    srAnnouncement.setAttribute('aria-atomic', 'true');
    srAnnouncement.style.position = 'absolute';
    srAnnouncement.style.width = '1px';
    srAnnouncement.style.height = '1px';
    srAnnouncement.style.overflow = 'hidden';
    srAnnouncement.style.clip = 'rect(0, 0, 0, 0)';
    document.body.appendChild(srAnnouncement);
    
    this.srAnnouncement = srAnnouncement;
  }
  
  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  openMenu() {
    this.isMenuOpen = true;
    this.navMenu.classList.add('active');
    this.mobileToggle.classList.add('active');
    
    // Update ARIA attributes
    this.mobileToggle.setAttribute('aria-expanded', 'true');
    this.navMenu.setAttribute('aria-hidden', 'false');
    
    // Update tab indexes for keyboard navigation
    this.navLinks.forEach(link => {
      link.setAttribute('tabindex', '0');
    });
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    // Focus first menu item for keyboard users
    setTimeout(() => {
      this.navLinks[0]?.focus();
    }, 300); // Match with animation duration
    
    // Announce to screen readers
    if (this.srAnnouncement) {
      this.srAnnouncement.textContent = 'Navigation menu opened';
    }
  }
  
  closeMenu() {
    this.isMenuOpen = false;
    this.navMenu.classList.remove('active');
    this.mobileToggle.classList.remove('active');
    
    // Update ARIA attributes
    this.mobileToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.setAttribute('aria-hidden', 'true');
    
    // Update tab indexes for keyboard navigation
    this.navLinks.forEach(link => {
      link.setAttribute('tabindex', '-1');
    });
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Announce to screen readers
    if (this.srAnnouncement) {
      this.srAnnouncement.textContent = 'Navigation menu closed';
    }
  }
  
  focusNextLink(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.navLinks.length;
    this.navLinks[nextIndex].focus();
  }
  
  focusPreviousLink(currentIndex) {
    const prevIndex = currentIndex === 0 ? this.navLinks.length - 1 : currentIndex - 1;
    this.navLinks[prevIndex].focus();
  }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileNavigation();
});

// Handle smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip if it's just "#" or empty
      if (!href || href === '#') return;
      
      const targetElement = document.querySelector(href);
      
      if (targetElement) {
        e.preventDefault();
        
        // Calculate offset for fixed navbar
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});