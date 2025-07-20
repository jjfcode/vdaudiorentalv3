// Interactive Contact Options JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive contact features
    initBusinessHours();
    initContactPreferences();
    initWhatsAppIntegration();
    initCallTracking();
    initSocialTracking();
});

// Business Hours Management
function initBusinessHours() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const callStatus = document.getElementById('callStatus');
    
    if (!statusIndicator || !statusText) return;

    // Business hours configuration (EST/EDT)
    const businessHours = {
        monday: { open: 9, close: 18 },
        tuesday: { open: 9, close: 18 },
        wednesday: { open: 9, close: 18 },
        thursday: { open: 9, close: 18 },
        friday: { open: 9, close: 18 },
        saturday: { open: 10, close: 16 },
        sunday: { open: null, close: null } // Closed
    };

    function updateBusinessStatus() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHour + (currentMinutes / 60);

        const todayHours = businessHours[currentDay];
        
        let status, statusClass, callStatusText;

        if (!todayHours.open) {
            // Closed today (Sunday)
            status = 'Closed Today';
            statusClass = 'closed';
            callStatusText = 'We\'re closed today - Leave a message';
        } else if (currentTime >= todayHours.open && currentTime < todayHours.close) {
            // Currently open
            const closingTime = formatTime(todayHours.close);
            const timeUntilClose = todayHours.close - currentTime;
            
            if (timeUntilClose <= 1) {
                status = `Closing Soon (${closingTime})`;
                statusClass = 'closing-soon';
                callStatusText = 'Call now - closing soon!';
            } else {
                status = `Open until ${closingTime}`;
                statusClass = 'open';
                callStatusText = 'We\'re available now!';
            }
        } else if (currentTime < todayHours.open) {
            // Before opening hours
            const openingTime = formatTime(todayHours.open);
            status = `Opens at ${openingTime}`;
            statusClass = 'closed';
            callStatusText = `We open at ${openingTime}`;
        } else {
            // After closing hours
            const nextDay = getNextBusinessDay(currentDay);
            const nextOpenTime = formatTime(businessHours[nextDay].open);
            status = `Closed - Opens ${nextDay} at ${nextOpenTime}`;
            statusClass = 'closed';
            callStatusText = 'We\'re closed - Leave a voicemail';
        }

        // Update status indicator
        statusIndicator.className = `status-indicator ${statusClass}`;
        statusText.textContent = status;
        
        // Update call button status
        if (callStatus) {
            callStatus.textContent = callStatusText;
        }
    }

    function formatTime(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:00 ${period}`;
    }

    function getNextBusinessDay(currentDay) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentIndex = days.indexOf(currentDay);
        
        for (let i = 1; i <= 7; i++) {
            const nextIndex = (currentIndex + i) % 7;
            const nextDay = days[nextIndex];
            if (businessHours[nextDay].open) {
                return nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
            }
        }
        return 'Monday'; // Fallback
    }

    // Update status immediately and then every minute
    updateBusinessStatus();
    setInterval(updateBusinessStatus, 60000);
}

// Contact Preferences Management
function initContactPreferences() {
    const preferenceOptions = document.querySelectorAll('input[name="contactPreference"]');
    const contactMethods = document.querySelectorAll('.contact-method');
    
    if (!preferenceOptions.length) return;

    // Store user preference in localStorage
    function savePreference(preference) {
        try {
            localStorage.setItem('vd-contact-preference', preference);
        } catch (e) {
            console.warn('Could not save contact preference:', e);
        }
    }

    // Load saved preference
    function loadPreference() {
        try {
            const saved = localStorage.getItem('vd-contact-preference');
            if (saved) {
                const option = document.querySelector(`input[name="contactPreference"][value="${saved}"]`);
                if (option) {
                    option.checked = true;
                    highlightPreferredMethod(saved);
                }
            }
        } catch (e) {
            console.warn('Could not load contact preference:', e);
        }
    }

    // Highlight preferred contact method
    function highlightPreferredMethod(preference) {
        contactMethods.forEach(method => {
            method.classList.remove('preferred-method');
        });

        const preferredMethod = document.querySelector(`.${preference}-method`);
        if (preferredMethod) {
            preferredMethod.classList.add('preferred-method');
            preferredMethod.style.order = '-1'; // Move to top
        }
    }

    // Handle preference changes
    preferenceOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                savePreference(this.value);
                highlightPreferredMethod(this.value);
                
                // Analytics tracking
                trackContactPreference(this.value);
            }
        });
    });

    // Load saved preference on page load
    loadPreference();
}

// WhatsApp Integration
function initWhatsAppIntegration() {
    const whatsappButton = document.getElementById('whatsappButton');
    if (!whatsappButton) return;

    const phoneNumber = '17862572705'; // VD Audio Rental phone number
    
    whatsappButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get user's preferred contact method for personalized message
        const selectedPreference = document.querySelector('input[name="contactPreference"]:checked');
        const preferenceText = selectedPreference ? selectedPreference.value : 'WhatsApp';
        
        // Get current time to add context
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Create personalized WhatsApp message
        const message = encodeURIComponent(
            `Hi VD Audio Rental! I'm interested in your professional audio equipment rental services. ` +
            `I found your website and would like to discuss my audio needs. ` +
            `My preferred contact method is ${preferenceText}. ` +
            `I'm contacting you at ${timeString}. Thank you!`
        );
        
        // Detect if user is on mobile or desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let whatsappUrl;
        if (isMobile) {
            // Mobile: Use WhatsApp app URL
            whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
        } else {
            // Desktop: Use WhatsApp Web
            whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
        }
        
        // Track WhatsApp click
        trackWhatsAppClick();
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        // Fallback for desktop users who don't have WhatsApp Web
        if (!isMobile) {
            setTimeout(() => {
                const fallbackConfirm = confirm(
                    'If WhatsApp Web didn\'t open, would you like to copy our phone number to contact us directly?'
                );
                if (fallbackConfirm) {
                    copyToClipboard('+1 (786) 257-2705');
                    showNotification('Phone number copied to clipboard!');
                }
            }, 3000);
        }
    });
}

// Call Tracking and Enhancement
function initCallTracking() {
    const callButton = document.getElementById('callButton');
    if (!callButton) return;

    callButton.addEventListener('click', function(e) {
        // Track call attempt
        trackCallClick();
        
        // Add visual feedback
        this.classList.add('calling');
        setTimeout(() => {
            this.classList.remove('calling');
        }, 2000);
        
        // Show helpful message for desktop users
        if (!isMobileDevice()) {
            e.preventDefault();
            showCallOptions();
        }
    });
}

// Social Media Tracking
function initSocialTracking() {
    const socialMethods = document.querySelectorAll('.social-method');
    
    socialMethods.forEach(method => {
        method.addEventListener('click', function() {
            const platform = this.classList.contains('facebook-method') ? 'facebook' :
                           this.classList.contains('instagram-method') ? 'instagram' :
                           this.classList.contains('linkedin-method') ? 'linkedin' : 'unknown';
            
            trackSocialClick(platform);
        });
    });
}

// Utility Functions
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            textArea.remove();
            return Promise.resolve();
        } catch (error) {
            textArea.remove();
            return Promise.reject(error);
        }
    }
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `contact-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--vd-success)' : 'var(--vd-warning)'};
        color: white;
        padding: var(--spacing-md);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showCallOptions() {
    const modal = document.createElement('div');
    modal.className = 'call-options-modal';
    modal.innerHTML = `
        <div class="call-options-content">
            <h3><i class="fas fa-phone"></i> Contact VD Audio Rental</h3>
            <p>Choose how you'd like to contact us:</p>
            <div class="call-options">
                <button class="call-option" onclick="copyToClipboard('+1 (786) 257-2705').then(() => showNotification('Phone number copied!'))">
                    <i class="fas fa-copy"></i> Copy Phone Number
                </button>
                <a href="tel:+17862572705" class="call-option">
                    <i class="fas fa-phone"></i> Try to Call
                </a>
                <button class="call-option" onclick="document.getElementById('showMessageForm').click(); this.closest('.call-options-modal').remove();">
                    <i class="fas fa-envelope"></i> Send Message Instead
                </button>
            </div>
            <button class="close-call-options" onclick="this.closest('.call-options-modal').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Analytics and Tracking Functions
function trackContactPreference(preference) {
    // Track contact preference selection
    console.log('Contact preference selected:', preference);
    
    // You can integrate with Google Analytics, Facebook Pixel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_preference_selected', {
            'preference_type': preference,
            'event_category': 'contact',
            'event_label': preference
        });
    }
}

function trackWhatsAppClick() {
    console.log('WhatsApp button clicked');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            'event_category': 'contact',
            'event_label': 'whatsapp_message'
        });
    }
}

function trackCallClick() {
    console.log('Call button clicked');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call_attempt', {
            'event_category': 'contact',
            'event_label': 'phone_call'
        });
    }
}

function trackSocialClick(platform) {
    console.log('Social media clicked:', platform);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'social_media_click', {
            'event_category': 'social',
            'event_label': platform
        });
    }
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .call-options-content {
        background: white;
        padding: var(--spacing-xl);
        border-radius: var(--border-radius);
        max-width: 400px;
        width: 90%;
        position: relative;
    }
    
    .call-options-content h3 {
        color: var(--vd-primary);
        margin-bottom: var(--spacing-md);
        text-align: center;
    }
    
    .call-options {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin: var(--spacing-lg) 0;
    }
    
    .call-option {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        background: var(--vd-surface);
        border: 2px solid transparent;
        border-radius: var(--border-radius);
        text-decoration: none;
        color: var(--vd-text);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .call-option:hover {
        border-color: var(--vd-primary);
        background: #f0f8f4;
    }
    
    .close-call-options {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        background: none;
        border: none;
        font-size: 1.2rem;
        color: var(--vd-text-light);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .close-call-options:hover {
        background: var(--vd-surface);
        color: var(--vd-text);
    }
    
    .preferred-method {
        border-color: var(--vd-primary) !important;
        background: #f0f8f4 !important;
        position: relative;
    }
    
    .preferred-method::before {
        content: "Preferred";
        position: absolute;
        top: -8px;
        right: var(--spacing-sm);
        background: var(--vd-primary);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 500;
    }
    
    .calling {
        animation: pulse 1s ease-in-out infinite;
    }
`;

document.head.appendChild(notificationStyles);