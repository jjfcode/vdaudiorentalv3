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
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                console.log('Modal opened'); // Debug log
            }
        });
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                console.log('Modal closed'); // Debug log
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            console.log('Modal closed by clicking outside'); // Debug log
        }
    });

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Get form data
            const formData = {
                name: contactForm.name.value,
                company: contactForm.company.value,
                email: contactForm.email.value,
                phone: contactForm.phone.value,
                message: contactForm.message.value
            };

            // Send email using EmailJS
            emailjs.send('service_t5qc6ns', 'template_0sn9gbc', formData)
                .then(function() {
                    // Success
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                    modal.style.display = 'none';
                    modal.style.opacity = '0';
                    modal.style.visibility = 'hidden';
                }, function(error) {
                    // Error
                    console.error('EmailJS Error:', error);
                    alert('Error sending message: ' + error.text);
                })
                .finally(function() {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                });
        });
    }
}); 