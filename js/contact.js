// Initialize EmailJS with your public key
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
})();

// Contact Form Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements - Removemos los console.log innecesarios
    const modal = document.getElementById('messageModal');
    const showMessageBtn = document.getElementById('showMessageForm');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    const modalContent = document.querySelector('.modal-content');

    // Show modal
    if (showMessageBtn && modal) {
        showMessageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Position the modal near the button location
            positionModalNearButton();
            
            modal.style.display = 'block';
            
            // Smooth scroll to the modal if it's not fully visible
            scrollToModal();
        });
    }

    // Close modal
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            
            // Reset modal positioning
            resetModalPosition();
            
            // Restore button text position when modal closes
            restoreButtonTextPosition();
        });
    }

    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                
                // Reset modal positioning
                resetModalPosition();
                
                // Restore button text position when modal closes
                restoreButtonTextPosition();
            }
        });
    }

    // Handle form submission
    if (contactForm && modal && modalContent) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate all fields before submission
            if (!validateAllFields()) {
                return; // Stop submission if validation fails
            }

            const submitBtn = this.querySelector('.submit-btn');
            const btnContent = submitBtn.querySelector('.btn-content');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Show loading state
            setLoadingState(submitBtn, btnContent, btnLoading, true);

            // Get selected contact preference
            const selectedPreference = document.querySelector('input[name="contactPreference"]:checked');
            const contactPreference = selectedPreference ? selectedPreference.value : 'email';

            const formData = {
                name: this.name.value,
                company: this.company.value,
                email: this.email.value,
                phone: this.phone.value,
                message: this.message.value,
                contactPreference: contactPreference
            };

            // Reset retry count for new submission
            retryCount = 0;
            
            // Attempt submission with comprehensive error handling
            await attemptSubmission(formData);
        });
    }

    // Function to manage loading state with enhanced animations
    function setLoadingState(submitBtn, btnContent, btnLoading, isLoading) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            btnContent.style.display = 'none';
            btnLoading.removeAttribute('hidden');
            btnLoading.style.display = 'flex';
            
            // Add loading animation to the entire form
            contactForm.classList.add('loading-pulse');
            
            // Disable all form inputs during submission
            const formInputs = contactForm.querySelectorAll('input, textarea');
            formInputs.forEach(input => {
                input.disabled = true;
                input.style.opacity = '0.7';
            });
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            btnContent.style.display = 'flex';
            btnLoading.setAttribute('hidden', '');
            btnLoading.style.display = 'none';
            
            // Remove loading animation from form
            contactForm.classList.remove('loading-pulse');
            
            // Re-enable all form inputs
            const formInputs = contactForm.querySelectorAll('input, textarea');
            formInputs.forEach(input => {
                input.disabled = false;
                input.style.opacity = '1';
            });
        }
    }

    // Form validation functions
    const validators = {
        name: {
            validate: (value) => {
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                if (value.trim().length > 50) return 'Name must be less than 50 characters';
                if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
                return null;
            }
        },
        company: {
            validate: (value) => {
                if (!value.trim()) return 'Company name is required';
                if (value.trim().length > 100) return 'Company name must be less than 100 characters';
                return null;
            }
        },
        email: {
            validate: (value) => {
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
                return null;
            }
        },
        phone: {
            validate: (value) => {
                if (!value.trim()) return 'Phone number is required';
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
                if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number';
                return null;
            }
        },
        message: {
            validate: (value) => {
                if (!value.trim()) return 'Message is required';
                if (value.trim().length < 10) return 'Message must be at least 10 characters';
                if (value.trim().length > 1000) return 'Message must be less than 1000 characters';
                return null;
            }
        }
    };

    // Function to validate a single field
    function validateField(fieldName, value) {
        const validator = validators[fieldName];
        if (!validator) return null;
        return validator.validate(value);
    }

    // Function to show/hide error message
    function showFieldError(fieldName, errorMessage) {
        const formGroup = document.querySelector(`#contact-${fieldName}`).closest('.form-group');
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`contact-${fieldName}`);

        if (errorMessage) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
            inputElement.setAttribute('aria-invalid', 'true');
        } else {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            inputElement.setAttribute('aria-invalid', 'false');
        }
    }

    // Function to validate all fields
    function validateAllFields() {
        let isValid = true;
        const formData = {
            name: document.getElementById('contact-name').value,
            company: document.getElementById('contact-company').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            message: document.getElementById('contact-message').value
        };

        Object.keys(formData).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName]);
            showFieldError(fieldName, error);
            if (error) isValid = false;
        });

        return isValid;
    }

    // Add real-time validation to form fields
    if (contactForm) {
        const formFields = ['name', 'company', 'email', 'phone', 'message'];
        
        formFields.forEach(fieldName => {
            const inputElement = document.getElementById(`contact-${fieldName}`);
            if (inputElement) {
                // Validate on blur (when user leaves the field)
                inputElement.addEventListener('blur', function() {
                    const error = validateField(fieldName, this.value);
                    showFieldError(fieldName, error);
                });

                // Clear error on input (when user starts typing)
                inputElement.addEventListener('input', function() {
                    const formGroup = this.closest('.form-group');
                    if (formGroup.classList.contains('error')) {
                        const error = validateField(fieldName, this.value);
                        if (!error) {
                            showFieldError(fieldName, null);
                        }
                    }
                });
            }
        });
    }

    // Error handling and network detection
    let retryCount = 0;
    const maxRetries = 3;
    let lastFormData = null;

    // Function to detect if user is online
    function isOnline() {
        return navigator.onLine;
    }

    // Function to show error notification
    function showErrorNotification(title, message, showRetry = true) {
        const errorNotification = document.getElementById('error-notification');
        const errorTitle = errorNotification.querySelector('.error-title');
        const errorMessage = errorNotification.querySelector('.error-message');
        const retryButton = errorNotification.querySelector('.retry-button');

        errorTitle.textContent = title;
        errorMessage.textContent = message;
        retryButton.style.display = showRetry ? 'inline-block' : 'none';
        errorNotification.classList.add('show');
    }

    // Function to hide error notification
    function hideErrorNotification() {
        const errorNotification = document.getElementById('error-notification');
        errorNotification.classList.remove('show');
    }

    // Function to show offline notification
    function showOfflineNotification() {
        const offlineNotification = document.getElementById('offline-notification');
        offlineNotification.classList.add('show');
    }

    // Function to hide offline notification
    function hideOfflineNotification() {
        const offlineNotification = document.getElementById('offline-notification');
        offlineNotification.classList.remove('show');
    }

    // Function to handle different types of errors
    function handleSubmissionError(error, response = null) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnContent = submitBtn.querySelector('.btn-content');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Hide loading state
        setLoadingState(submitBtn, btnContent, btnLoading, false);

        if (!isOnline()) {
            showOfflineNotification();
            showErrorNotification(
                'No Internet Connection',
                'Please check your internet connection and try again.',
                true
            );
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // Network error
            showErrorNotification(
                'Connection Error',
                'Unable to connect to the server. Please check your connection and try again.',
                true
            );
        } else if (response && response.status === 429) {
            // Rate limiting
            showErrorNotification(
                'Too Many Requests',
                'You have sent too many messages recently. Please wait a few minutes before trying again.',
                false
            );
        } else if (response && response.status >= 500) {
            // Server error
            showErrorNotification(
                'Server Error',
                'Our server is experiencing issues. Please try again in a few moments.',
                true
            );
        } else if (response && response.status === 400) {
            // Bad request
            showErrorNotification(
                'Invalid Information',
                'Please check your information and try again.',
                false
            );
        } else {
            // Generic error
            showErrorNotification(
                'Unexpected Error',
                'Something went wrong. Please try again.',
                true
            );
        }
    }

    // Function to attempt form submission with retry logic
    async function attemptSubmission(formData, isRetry = false) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnContent = submitBtn.querySelector('.btn-content');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        try {
            // Check if online before attempting
            if (!isOnline()) {
                throw new Error('User is offline');
            }

            // Hide any existing error notifications
            hideErrorNotification();
            hideOfflineNotification();

            // Show loading state
            setLoadingState(submitBtn, btnContent, btnLoading, true);

            // Replace with your EmailJS service ID and template ID
            const response = await emailjs.send(
                'YOUR_SERVICE_ID',     // Replace with your EmailJS service ID
                'YOUR_TEMPLATE_ID',    // Replace with your EmailJS template ID
                {
                    from_name: formData.name,
                    from_company: formData.company,
                    from_email: formData.email,
                    from_phone: formData.phone,
                    message: formData.message,
                    contact_preference: formData.contactPreference,
                    to_name: 'VD Audio Rental'
                }
            );

            if (response.status === 200) {
                // Success - reset retry count
                retryCount = 0;
                lastFormData = null;
            } else {
                throw new Error(`EmailJS Error: ${response.status}`);
            }

            modalContent.innerHTML = `
                <div class="thank-you-message" style="text-align: center; padding: 40px;">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: var(--vd-primary); margin-bottom: 20px;"></i>
                    <h2 style="color: var(--vd-primary); margin-bottom: 15px;">Thank You!</h2>
                    <p style="font-size: 1.1rem;">Your message has been received successfully.</p>

                </div>
            `;

            setTimeout(() => {
                modal.style.display = 'none';
                // Reset modal positioning
                resetModalPosition();
                // Reset form
                contactForm.reset();
                // Reset form states
                const formGroups = contactForm.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.classList.remove('error', 'success');
                });
                const errorMessages = contactForm.querySelectorAll('.error-message');
                errorMessages.forEach(msg => {
                    msg.textContent = '';
                    msg.classList.remove('show');
                });
            }, 3000);

        } catch (error) {
            console.error('Form submission error:', error);
            handleSubmissionError(error);
            // Store form data for retry
            lastFormData = formData;
        }
    }

    // Event listeners for error handling
    if (document.getElementById('error-notification')) {
        // Close error notification
        document.querySelector('.close-error').addEventListener('click', function() {
            hideErrorNotification();
        });

        // Retry button
        document.getElementById('retry-submit').addEventListener('click', function() {
            if (lastFormData && retryCount < maxRetries) {
                retryCount++;
                attemptSubmission(lastFormData, true);
            } else if (retryCount >= maxRetries) {
                showErrorNotification(
                    'Maximum Retries Exceeded',
                    'Please try again later or contact us directly.',
                    false
                );
            }
        });
    }

    // Online/offline event listeners
    window.addEventListener('online', function() {
        hideOfflineNotification();
        console.log('Connection restored');
    });

    window.addEventListener('offline', function() {
        showOfflineNotification();
        console.log('Connection lost');
    });

    // Function to restore button text position when modal closes
    function restoreButtonTextPosition() {
        if (showMessageBtn) {
            showMessageBtn.style.transform = 'translateY(0)';
            showMessageBtn.style.boxShadow = '';
            
            // Also restore the form note text position
            const formNote = showMessageBtn.nextElementSibling;
            if (formNote && formNote.classList.contains('form-note')) {
                formNote.style.transform = 'translateY(0)';
                formNote.style.opacity = '1'; // Restore opacity
            }
        }
    }

    // Function to position modal near the button
    function positionModalNearButton() {
        if (showMessageBtn && modal) {
            const buttonRect = showMessageBtn.getBoundingClientRect();
            const modalContent = modal.querySelector('.modal-content');
            
            // Add dynamic positioning class
            modalContent.classList.add('dynamic-position');
            
            // Calculate position to center modal near the button
            const modalHeight = 600; // Approximate modal height
            const windowHeight = window.innerHeight;
            const buttonTop = buttonRect.top + window.scrollY;
            
            // Position modal so it's centered near the button
            // If button is in lower half of screen, show modal above it
            // If button is in upper half, show modal below it
            let modalTop;
            
            if (buttonTop > windowHeight / 2) {
                // Button is in lower half - show modal above it
                modalTop = Math.max(20, buttonTop - modalHeight - 50);
            } else {
                // Button is in upper half - show modal below it
                modalTop = buttonTop + 100;
            }
            
            // Apply the positioning
            modalContent.style.top = modalTop + 'px';
            modalContent.style.left = '50%';
            modalContent.style.transform = 'translateX(-50%)';
        }
    }

    // Function to scroll to modal if needed
    function scrollToModal() {
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            const modalRect = modalContent.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Check if modal is not fully visible
            if (modalRect.top < 20 || modalRect.bottom > windowHeight - 20) {
                // Modal is not fully visible, scroll to it
                const scrollTarget = modalRect.top + window.scrollY - 50;
                window.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                });
            }
        }
    }

    // Function to reset modal positioning
    function resetModalPosition() {
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('dynamic-position');
            modalContent.style.top = '';
            modalContent.style.left = '';
            modalContent.style.transform = '';
        }
    }
}); 