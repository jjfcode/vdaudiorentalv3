// Initialize EmailJS with your public key
(function() {
    emailjs.init("4e4Z_pgISz5k917Nc");
})();

// Contact Form Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('messageModal');
    const showMessageBtn = document.getElementById('showMessageForm');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    const modalContent = modal.querySelector('.modal-content');

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

            const formData = {
                name: this.name.value,
                company: this.company.value,
                email: this.email.value,
                phone: this.phone.value,
                message: this.message.value
            };

            try {
                const response = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Reemplazar contenido del modal con mensaje de éxito
                    modalContent.innerHTML = `
                        <div class="thank-you-message" style="text-align: center; padding: 40px;">
                            <i class="fas fa-check-circle" style="font-size: 48px; color: var(--vd-primary); margin-bottom: 20px;"></i>
                            <h2 style="color: var(--vd-primary); margin-bottom: 15px;">Thank You!</h2>
                            <p style="font-size: 1.1rem;">Your message has been sent successfully.</p>
                        </div>
                    `;

                    // Esperar 3 segundos y redirigir
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                } else {
                    alert('Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
}); 