// Equipment Inquiry System - Separate from general contact
document.addEventListener('DOMContentLoaded', function() {
    // Get inquiry modal elements
    const inquiryModal = document.getElementById('equipmentInquiryModal');
    const closeInquiryModal = document.getElementById('closeInquiryModal');
    const inquiryForm = document.getElementById('equipmentInquiryForm');
    const inquireButtons = document.querySelectorAll('.inquire-btn');
    
    // API Configuration for inquiries
    const INQUIRY_API_URL = (() => {
        // If we're on localhost, use the backend port 3000
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // For production, use relative path
        return '/api';
    })();
    
    console.log('Inquiry system initialized. API URL:', INQUIRY_API_URL);
    
    if (!inquiryModal) {
        console.error('Inquiry modal not found!');
        return;
    }
    
    if (!inquiryForm) {
        console.error('Inquiry form not found!');
        return;
    }
    
    // Close inquiry modal
    if (closeInquiryModal) {
        closeInquiryModal.addEventListener('click', function() {
            inquiryModal.style.display = 'none';
            resetInquiryModalPosition();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === inquiryModal) {
            inquiryModal.style.display = 'none';
            resetInquiryModalPosition();
        }
    });
    
    // Handle inquiry form submission
    inquiryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Equipment inquiry form submit event triggered');
        
        // Validate required fields
        const nameField = this.querySelector('#inquiry-name');
        const emailField = this.querySelector('#inquiry-email');
        const phoneField = this.querySelector('#inquiry-phone');
        
        if (!nameField || !emailField || !phoneField) {
            console.error('Required form fields not found!');
            alert('Form error: Required fields not found');
            return;
        }
        
        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const phone = phoneField.value.trim();
        
        if (!name || !email || !phone) {
            alert('Please fill in all required fields (Name, Email, and Phone)');
            return;
        }
        
        // Get reCAPTCHA token
        const recaptchaToken = grecaptcha.getResponse();
        if (!recaptchaToken) {
            document.getElementById('recaptchaError').style.display = 'block';
            return;
        }
        
        // Hide reCAPTCHA error if it was showing
        document.getElementById('recaptchaError').style.display = 'none';
        
        // Get form data
        const formData = new FormData(this);
        const equipmentId = formData.get('equipment_id');
        const equipmentName = formData.get('equipment_name');
        const equipmentPrice = formData.get('equipment_price');
        const company = formData.get('company');
        const message = formData.get('message');
        const urgency = formData.get('urgency');
        
        console.log('Inquiry data collected:', { 
            name, email, phone, company, message, urgency,
            equipmentId, equipmentName, equipmentPrice 
        });
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        if (!submitBtn) {
            console.error('Submit button not found!');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Prepare data for inquiry API
            const inquiryData = {
                name: name,
                company: company,
                email: email,
                phone: phone,
                message: message,
                urgency: urgency,
                equipment_id: equipmentId,
                equipment_name: equipmentName,
                equipment_price: equipmentPrice,
                inquiry_type: 'equipment_inquiry',
                recaptchaToken: recaptchaToken,
                timestamp: new Date().toISOString()
            };
            
            console.log('Sending equipment inquiry to:', `${INQUIRY_API_URL}/inquiry`);
            console.log('Inquiry data:', inquiryData);
            
            // Send to inquiry API (separate from contact API)
            const response = await fetch(`${INQUIRY_API_URL}/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inquiryData)
            });
            
            console.log('Inquiry response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Inquiry response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Inquiry success response:', result);
            
            // Show success message
            alert(`Thank you for your inquiry about ${equipmentName}! We'll get back to you soon.`);
            
            // Close modal
            inquiryModal.style.display = 'none';
            
            // Reset form and reCAPTCHA
            this.reset();
            grecaptcha.reset();
            
        } catch (error) {
            console.error('Equipment inquiry submission failed:', error);
            
            // Show error message
            alert('Sorry, there was an error sending your inquiry. Please try again or contact us directly.');
            
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Function to position inquiry modal near the button
    function positionInquiryModalNearButton(button) {
        const buttonRect = button.getBoundingClientRect();
        const modalContent = inquiryModal.querySelector('.modal-content');
        
        // Add dynamic positioning class
        modalContent.classList.add('dynamic-position');
        
        // Calculate position to center modal near the button
        const modalHeight = 600; // Approximate modal height
        const windowHeight = window.innerHeight;
        const buttonTop = buttonRect.top + window.scrollY;
        
        // Position modal so it's centered near the button
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
    
    // Function to reset inquiry modal positioning
    function resetInquiryModalPosition() {
        const modalContent = inquiryModal.querySelector('.modal-content');
        modalContent.classList.remove('dynamic-position');
        modalContent.style.top = '';
        modalContent.style.left = '';
        modalContent.style.transform = '';
    }
    
    // Set up inquire buttons
    inquireButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get equipment details from data attributes
            const equipmentId = this.getAttribute('data-equipment-id');
            const equipmentName = this.getAttribute('data-equipment-name');
            const equipmentPrice = this.getAttribute('data-equipment-price');
            
            console.log('Inquire button clicked:', { equipmentId, equipmentName, equipmentPrice });
            
            // Update hidden form fields in inquiry modal
            const idField = document.getElementById('inquiry-equipment-id');
            const nameField = document.getElementById('inquiry-equipment-name');
            const priceField = document.getElementById('inquiry-equipment-price');
            
            if (idField) idField.value = equipmentId;
            if (nameField) nameField.value = equipmentName;
            if (priceField) priceField.value = equipmentPrice;
            
            // Update form title
            const formTitle = document.getElementById('inquiryFormTitle');
            if (formTitle) {
                formTitle.textContent = `Equipment Inquiry: ${equipmentName}`;
            }
            
            // Position modal near the button and show it
            if (inquiryModal) {
                console.log('Opening equipment inquiry modal for:', equipmentName);
                positionInquiryModalNearButton(button);
                inquiryModal.style.display = 'block';
            } else {
                console.error('Inquiry modal not available!');
            }
        });
    });
    
    console.log('Equipment inquiry system setup complete. Found', inquireButtons.length, 'inquire buttons');
});
