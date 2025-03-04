// Initialize EmailJS with your public key
(function() {
    emailjs.init("4e4Z_pgISz5k917Nc"); // Replace with your actual public key
})();

// Contact Form Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('messageModal');
    const showMessageBtn = document.getElementById('showMessageForm');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    const submitBtn = contactForm.querySelector('.submit-btn');

    // Debug log to check if elements are found
    console.log('Modal:', modal);
    console.log('Show Message Button:', showMessageBtn);
    console.log('Close Button:', closeModalBtn);
    console.log('Contact Form:', contactForm);

    // Show modal
    if (showMessageBtn) {
        showMessageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) {
                modal.style.display = 'block';
                console.log('Modal opened');
            }
        });
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
                console.log('Modal closed');
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            console.log('Modal closed by clicking outside');
        }
    });

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Verify reCAPTCHA
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                alert('Please complete the reCAPTCHA verification');
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Get form data
            const formData = {
                name: contactForm.name.value,
                company: contactForm.company.value,
                email: contactForm.email.value,
                phone: contactForm.phone.value,
                message: contactForm.message.value,
                recaptchaResponse: recaptchaResponse
            };

            try {
                // Send to backend
                const response = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Success
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
                grecaptcha.reset(); // Reset reCAPTCHA
                modal.style.display = 'none';
            } catch (error) {
                console.error('Error:', error);
                alert('Error sending message. Please try again later.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        });
    }
}); 