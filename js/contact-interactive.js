// Simplified Contact Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initWhatsAppIntegration();
});

// WhatsApp Integration - Simple and Direct
function initWhatsAppIntegration() {
    const whatsappButton = document.getElementById('whatsappButton');
    if (!whatsappButton) return;

    const phoneNumber = '17862572705';
    
    whatsappButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Create simple WhatsApp message
        const message = encodeURIComponent(
            `Hi VD Audio Rental! I'm interested in your professional audio equipment rental services. ` +
            `I found your website and would like to discuss my audio needs. Thank you!`
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
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
}