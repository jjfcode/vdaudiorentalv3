const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
    const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    };

    // Handle SSL/TLS based on port
    if (config.port === 465) {
        config.secure = true; // Use SSL
    } else {
        config.secure = false; // Use STARTTLS
        config.tls = {
            rejectUnauthorized: false
        };
    }

    return nodemailer.createTransport(config);
};

// Equipment inquiry submission controller
const submitInquiry = async (req, res) => {
    try {
        const { 
            name, 
            company, 
            email, 
            phone, 
            message, 
            equipment_id, 
            equipment_name, 
            equipment_price,
            inquiry_type 
        } = req.body;
        
        // Log the inquiry submission attempt
        console.log(`[${new Date().toISOString()}] Equipment inquiry from ${email} (${name}) for ${equipment_name}`);
        
        // Check if we're in test mode (skip email for testing)
        const isTestMode = process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true';
        
        // Check if optional fields have content (company and message)
        const hasCompanyContent = company && company.trim().length >= 2;
        const hasMessageContent = message && message.trim().length >= 10;
        
        console.log(`[DEBUG] Email conditions: TestMode=${isTestMode}, CompanyContent=${hasCompanyContent}, MessageContent=${hasMessageContent}`);
        
        // Always send email if not in test mode (regardless of optional field content)
        if (!isTestMode) {
            // Create email transporter
            const transporter = createTransporter();
            
            // Verify transporter configuration
            await transporter.verify();
            
            // Prepare email content for VD Audio Rental - EQUIPMENT INQUIRY
            const adminMailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: process.env.EMAIL_TO || 'contact@vdaudiorentals.com',
                subject: `🚨 NEW EQUIPMENT INQUIRY: ${equipment_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
                        <div style="background: #d32f2f; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">🚨 EQUIPMENT INQUIRY ALERT</h1>
                            <p style="margin: 10px 0 0 0; font-size: 18px;">VD Audio Rental - Used Equipment For Sale</p>
                        </div>
                        
                        <div style="padding: 20px; background: #f9f9f9;">
                            <!-- Equipment Details Section -->
                            <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                <h2 style="color: #e65100; margin: 0 0 15px 0; text-align: center; font-size: 20px;">
                                    🎯 EQUIPMENT OF INTEREST
                                </h2>
                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                    <tr style="background: #ff9800; color: white;">
                                        <th colspan="2" style="padding: 15px; text-align: center; font-size: 16px;">
                                            Equipment Information
                                        </th>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Equipment Name:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #d32f2f;">${equipment_name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Equipment ID:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${equipment_id || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; font-weight: bold;">Price:</td>
                                        <td style="padding: 12px 15px; font-weight: bold; color: #2e7d32; font-size: 18px;">${equipment_price || 'Price on request'}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Customer Information Section -->
                            <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <div style="background: #225d56; color: white; padding: 15px; text-align: center;">
                                    <h3 style="margin: 0; font-size: 18px;">Customer Information</h3>
                                </div>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Name:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${company || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                                            <a href="mailto:${email}" style="color: #225d56; font-weight: bold;">${email}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                                            <a href="tel:${phone}" style="color: #225d56; font-weight: bold;">${phone}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 15px; font-weight: bold; vertical-align: top;">Message:</td>
                                        <td style="padding: 12px 15px; line-height: 1.6;">${message || 'No additional message provided'}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Inquiry Details Section -->
                            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-left: 4px solid #4caf50; border-radius: 4px;">
                                <p style="margin: 0; color: #2e7d32;">
                                    <strong>Inquiry Details:</strong><br>
                                    Type: ${inquiry_type || 'Equipment Inquiry'}<br>
                                    Time: ${new Date().toLocaleString()}<br>
                                    IP Address: ${req.ip}<br>
                                    User Agent: ${req.get('User-Agent')?.substring(0, 100) || 'Unknown'}
                                </p>
                            </div>
                            
                            <!-- Action Required Section -->
                            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border: 2px solid #ff9800; border-radius: 4px;">
                                <p style="margin: 0; color: #e65100; text-align: center; font-weight: bold;">
                                    ⚠️ ACTION REQUIRED: Customer is interested in purchasing ${equipment_name}
                                </p>
                            </div>
                        </div>
                        
                        <div style="background: #225d56; color: white; padding: 15px; text-align: center; font-size: 12px;">
                            <p style="margin: 0;">This inquiry was submitted through the VD Audio Rental website</p>
                        </div>
                    </div>
                `
            };
            
            // Send email to admin
            await transporter.sendMail(adminMailOptions);
            console.log(`Equipment inquiry email sent successfully to admin for ${equipment_name}`);
            
            // Send confirmation email to customer
            const customerMailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: `Equipment Inquiry Received - ${equipment_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #225d56; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">VD Audio Rental</h1>
                            <p style="margin: 10px 0 0 0;">Equipment Inquiry Received</p>
                        </div>
                        
                        <div style="padding: 20px; background: #f9f9f9;">
                            <p>Dear ${name},</p>
                            
                            <p>Thank you for your inquiry about <strong>${equipment_name}</strong>.</p>
                            
                            <p>We have received your inquiry and will review the details. Our team will contact you within 24 hours to discuss this equipment and answer any questions you may have.</p>
                            
                            <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #225d56;">
                                <h3 style="margin: 0 0 10px 0; color: #225d56;">Your Inquiry Details:</h3>
                                <p><strong>Equipment:</strong> ${equipment_name}</p>
                                <p><strong>Price:</strong> ${equipment_price || 'Price on request'}</p>
                                <p><strong>Inquiry Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>
                            
                            <p>If you have any urgent questions, please don't hesitate to contact us directly:</p>
                            <ul>
                                <li>Phone: <a href="tel:+1234567890" style="color: #225d56;">+1 (234) 567-890</a></li>
                                <li>Email: <a href="mailto:contact@vdaudiorentals.com" style="color: #225d56;">contact@vdaudiorentals.com</a></li>
                            </ul>
                            
                            <p>Best regards,<br>
                            The VD Audio Rental Team</p>
                        </div>
                        
                        <div style="background: #225d56; color: white; padding: 15px; text-align: center; font-size: 12px;">
                            <p style="margin: 0;">VD Audio Rental - Professional Audio Equipment Solutions</p>
                        </div>
                    </div>
                `
            };
            
            // Send confirmation email to customer
            await transporter.sendMail(customerMailOptions);
            console.log(`Confirmation email sent successfully to customer ${email}`);
        }
        
        // Return success response
        const emailStatus = !isTestMode ? 'sent' : 'skipped (test mode)';
        
        res.status(200).json({
            success: true,
            message: `Equipment inquiry submitted successfully. Email: ${emailStatus}`,
            data: {
                inquiry_id: Date.now().toString(),
                equipment_name: equipment_name,
                customer_email: email,
                email_sent: !isTestMode,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Equipment inquiry submission error:', error);
        
        // Return error response
        res.status(500).json({
            success: false,
            message: 'Failed to submit equipment inquiry',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    submitInquiry
};
