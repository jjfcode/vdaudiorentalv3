// Contact Form Modal Functionality with Secure Backend API
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('messageModal');
    const showMessageBtn = document.getElementById('showMessageForm');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    const modalContent = document.querySelector('.modal-content');

    // API Configuration
    const API_BASE_URL = (() => {
        // If we're on localhost, use the backend port 3000
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // For production, use relative path
        return '/api';
    })();

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

    // Handle form submission with enhanced security
    if (contactForm && modal && modalContent) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Check rate limiting
            if (isRateLimited()) {
                showErrorNotification(
                    'Too Many Submissions',
                    'Please wait a few minutes before submitting another message.',
                    false
                );
                return;
            }

            // Validate all fields before submission
            if (!validateAllFields()) {
                return; // Stop submission if validation fails
            }

            // Sanitize all form data before submission
            const sanitizedFormData = sanitizeFormData(this);

            const submitBtn = this.querySelector('.submit-btn');
            const btnContent = submitBtn.querySelector('.btn-content');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Show loading state
            setLoadingState(submitBtn, btnContent, btnLoading, true);

            // Get selected contact preference
            const selectedPreference = document.querySelector('input[name="contactPreference"]:checked');
            const contactPreference = selectedPreference ? selectedPreference.value : 'email';

            const formData = {
                name: sanitizedFormData.name,
                company: sanitizedFormData.company,
                email: sanitizedFormData.email,
                phone: sanitizedFormData.phone,
                message: sanitizedFormData.message,
                contactPreference: contactPreference,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 100), // Limit user agent length
                ipHash: await generateIPHash() // Generate hash for rate limiting
            };

            // Reset retry count for new submission
            retryCount = 0;
            
            // Log the API URL for debugging
            console.log('Submitting to API:', API_BASE_URL);
            console.log('Form data:', formData);
            
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

    // Enhanced form validation with comprehensive sanitization
    const validators = {
        name: {
            validate: (value) => {
                const sanitized = sanitizeInput(value);
                if (!sanitized.trim()) return 'Name is required';
                if (sanitized.trim().length < 2) return 'Name must be at least 2 characters';
                if (sanitized.trim().length > 50) return 'Name must be less than 50 characters';
                if (!/^[a-zA-Z\s\-'\.]+$/.test(sanitized.trim())) return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
                if (/[<>\"'&]/.test(sanitized)) return 'Name contains invalid characters';
                if (/^\s*$/.test(sanitized)) return 'Name cannot be only whitespace';
                return null;
            },
            sanitize: (value) => sanitizeInput(value)
        },
        company: {
            validate: (value) => {
                const sanitized = sanitizeInput(value);
                if (!sanitized.trim()) return 'Company name is required';
                if (sanitized.trim().length > 100) return 'Company name must be less than 100 characters';
                if (/[<>\"'&]/.test(sanitized)) return 'Company name contains invalid characters';
                if (sanitized.trim().length < 2) return 'Company name must be at least 2 characters';
                if (/^\s*$/.test(sanitized)) return 'Company name cannot be only whitespace';
                return null;
            },
            sanitize: (value) => sanitizeInput(value)
        },
        email: {
            validate: (value) => {
                const sanitized = sanitizeInput(value);
                if (!sanitized.trim()) return 'Email is required';
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(sanitized.trim())) return 'Please enter a valid email address';
                if (sanitized.length > 254) return 'Email address is too long';
                if (/[<>\"'&]/.test(sanitized)) return 'Email contains invalid characters';
                if (sanitized.includes('..') || sanitized.includes('--')) return 'Email contains invalid patterns';
                return null;
            },
            sanitize: (value) => sanitizeInput(value).toLowerCase().trim()
        },
        phone: {
            validate: (value) => {
                const sanitized = sanitizeInput(value);
                if (!sanitized.trim()) return 'Phone number is required';
                const cleanPhone = sanitized.replace(/[\s\-\(\)\.]/g, '');
                const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
                if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number (8-16 digits)';
                if (cleanPhone.length < 8) return 'Phone number must be at least 8 digits';
                if (cleanPhone.length > 16) return 'Phone number must be less than 16 digits';
                if (cleanPhone.match(/(\d)\1{6,}/)) return 'Phone number contains too many repeated digits';
                return null;
            },
            sanitize: (value) => sanitizeInput(value).replace(/[^\d\+\-\(\)\s\.]/g, '')
        },
        message: {
            validate: (value) => {
                const sanitized = sanitizeInput(value);
                if (!sanitized.trim()) return 'Message is required';
                if (sanitized.trim().length < 10) return 'Message must be at least 10 characters';
                if (sanitized.trim().length > 1000) return 'Message must be less than 1000 characters';
                if (/[<>\"'&]/.test(sanitized)) return 'Message contains invalid characters';
                if (sanitized.includes('http://') || sanitized.includes('https://')) return 'Message cannot contain URLs';
                if (/^\s*$/.test(sanitized)) return 'Message cannot be only whitespace';
                if (sanitized.match(/(.)\1{10,}/)) return 'Message contains too many repeated characters';
                return null;
            },
            sanitize: (value) => sanitizeInput(value)
        }
    };

    // Enhanced input sanitization function
    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remove null bytes and control characters
        let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Remove HTML tags and entities
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        sanitized = sanitized.replace(/&[a-zA-Z0-9#]+;/g, '');
        
        // Remove script tags and javascript: protocol
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
        
        // Remove SQL injection patterns
        const sqlPatterns = [
            /(\b)(union|select|insert|update|delete|drop|create|alter|exec|execute|script)(\b)/gi,
            /(\b)(or|and)(\s+)(\d+)(\s*)(=)(\s*)(\d+)/gi,
            /(\b)(or|and)(\s+)(\d+)(\s*)(=)(\s*)(\d+)(\s*)(--)/gi
        ];
        
        sqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // Remove XSS patterns
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
            /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi
        ];
        
        xssPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        return sanitized;
    }

    // Function to sanitize all form data
    function sanitizeFormData(form) {
        const formData = new FormData(form);
        const sanitized = {};
        
        // Sanitize each field
        for (let [key, value] of formData.entries()) {
            if (key === 'contactPreference') {
                sanitized[key] = value;
            } else {
                sanitized[key] = sanitizeInput(value);
            }
        }
        
        return sanitized;
    }

    // Enhanced field validation with sanitization
    function validateField(fieldName, value) {
        const validator = validators[fieldName];
        if (!validator) return null;
        
        // First sanitize the input
        const sanitizedValue = validator.sanitize ? validator.sanitize(value) : sanitizeInput(value);
        
        // Then validate the sanitized input
        return validator.validate(sanitizedValue);
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

    // Add real-time validation to form fields with enhanced security
    if (contactForm) {
        const formFields = ['name', 'company', 'email', 'phone', 'message'];
        
        formFields.forEach(fieldName => {
            const inputElement = document.getElementById(`contact-${fieldName}`);
            if (inputElement) {
                // Add input event listener for real-time validation
                inputElement.addEventListener('input', function() {
                    // Debounce validation to avoid excessive calls
                    clearTimeout(this.validationTimeout);
                    this.validationTimeout = setTimeout(() => {
                        const error = validateField(fieldName, this.value);
                        showFieldError(fieldName, error);
                        
                        // Show success state if no errors
                        if (!error) {
                            showFieldSuccess(fieldName);
                        }
                    }, 300);
                });

                // Validate on blur (when user leaves the field)
                inputElement.addEventListener('blur', function() {
                    const error = validateField(fieldName, this.value);
                    showFieldError(fieldName, error);
                    
                    // Show success state if no errors
                    if (!error) {
                        showFieldSuccess(fieldName);
                    }
                });

                // Clear error on focus (when user starts typing)
                inputElement.addEventListener('focus', function() {
                    const formGroup = this.closest('.form-group');
                    if (formGroup.classList.contains('error')) {
                        formGroup.classList.remove('error');
                        const errorElement = document.getElementById(`${fieldName}-error`);
                        if (errorElement) {
                            errorElement.textContent = '';
                            errorElement.classList.remove('show');
                        }
                    }
                });

                // Prevent paste of potentially dangerous content
                inputElement.addEventListener('paste', function(e) {
                    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                    if (containsDangerousContent(pastedText)) {
                        e.preventDefault();
                        showFieldError(fieldName, 'Pasted content contains invalid characters');
                    }
                });

                // Prevent drag and drop of potentially dangerous content
                inputElement.addEventListener('drop', function(e) {
                    e.preventDefault();
                    showFieldError(fieldName, 'Drag and drop is not allowed for security reasons');
                });

                // Special handling for message field character counter
                if (fieldName === 'message') {
                    inputElement.addEventListener('input', function() {
                        updateCharacterCounter(this.value);
                    });
                }
            }
        });
    }

    // Function to check for dangerous content
    function containsDangerousContent(text) {
        if (typeof text !== 'string') return false;
        
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
            /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
            /union\s+select/gi,
            /<[^>]*>/g
        ];
        
        return dangerousPatterns.some(pattern => pattern.test(text));
    }

    // Function to show field success state
    function showFieldSuccess(fieldName) {
        const formGroup = document.querySelector(`#contact-${fieldName}`).closest('.form-group');
        const inputElement = document.getElementById(`contact-${fieldName}`);
        
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        inputElement.setAttribute('aria-invalid', 'false');
        
        // Add success icon or visual feedback
        const successIcon = formGroup.querySelector('.success-icon');
        if (!successIcon) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-check-circle success-icon';
            icon.style.cssText = `
                position: absolute;
                right: var(--spacing-md);
                top: 50%;
                transform: translateY(-50%);
                color: var(--vd-success);
                font-size: 1.2rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            formGroup.appendChild(icon);
            
            // Animate success icon
            setTimeout(() => {
                icon.style.opacity = '1';
            }, 100);
        }
    }

    // Function to update character counter for message field
    function updateCharacterCounter(value) {
        const counter = document.getElementById('message-counter');
        const currentCount = counter.querySelector('.current-count');
        const maxCount = 1000;
        const currentLength = value.length;
        
        currentCount.textContent = currentLength;
        
        // Update counter styling based on character count
        counter.classList.remove('warning', 'danger');
        
        if (currentLength > maxCount * 0.9) { // 90% of max
            counter.classList.add('danger');
        } else if (currentLength > maxCount * 0.75) { // 75% of max
            counter.classList.add('warning');
        }
        
        // Update aria-label for accessibility
        counter.setAttribute('aria-label', `${currentLength} characters used out of ${maxCount} maximum`);
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

            // Send data to the secure backend API
            console.log('Making fetch request to:', `${API_BASE_URL}/contact/submit`);
            const response = await fetch(`${API_BASE_URL}/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Hash': formData.ipHash,
                    // Removed test mode - emails will now be sent
                },
                body: JSON.stringify({
                    name: formData.name,
                    company: formData.company,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    contactPreference: formData.contactPreference
                })
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            const data = await response.json();

            if (response.ok && data.success) {
                // Success - reset retry count
                retryCount = 0;
                lastFormData = null;
            } else {
                // Handle backend validation errors
                if (response.status === 400 && data.errors) {
                    // Show field-specific errors
                    data.errors.forEach(error => {
                        showFieldError(error.field, error.message);
                    });
                    throw new Error('Validation failed');
                } else if (response.status === 429) {
                    // Rate limit exceeded
                    throw new Error('Too many submissions. Please wait before trying again.');
                } else {
                    throw new Error(data.message || `Backend Error: ${response.status}`);
                }
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

    // Rate limiting implementation
    let submissionAttempts = [];
    const MAX_ATTEMPTS = 3;
    const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes

    function isRateLimited() {
        const now = Date.now();
        
        // Remove old attempts outside the time window
        submissionAttempts = submissionAttempts.filter(timestamp => 
            now - timestamp < TIME_WINDOW
        );
        
        // Check if user has exceeded the limit
        if (submissionAttempts.length >= MAX_ATTEMPTS) {
            return true;
        }
        
        // Add current attempt
        submissionAttempts.push(now);
        return false;
    }

    // Generate IP hash for rate limiting (client-side approximation)
    async function generateIPHash() {
        try {
            // Use a combination of user agent and screen resolution as a simple fingerprint
            const fingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}_${navigator.language}`;
            const encoder = new TextEncoder();
            const data = encoder.encode(fingerprint);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            // Fallback to simple hash
            return btoa(navigator.userAgent + screen.width + screen.height).substring(0, 16);
        }
    }
}); 