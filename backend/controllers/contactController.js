const nodemailer = require('nodemailer');
const path = require('path');

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

// Contact form submission controller
const submitContactForm = async (req, res) => {
    try {
        const { name, company, email, phone, message, contactPreference } = req.body;
        
        // Log the submission attempt
        console.log(`[${new Date().toISOString()}] Contact form submission from ${email} (${name})`);
        
        // Check if we're in test mode (skip email for testing)
        const isTestMode = process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true';
        
        if (!isTestMode) {
            // Create email transporter
            const transporter = createTransporter();
            
            // Verify transporter configuration
            await transporter.verify();
            
            // Prepare email content for VD Audio Rental
            const adminMailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: process.env.EMAIL_TO || 'contact@vdaudiorentals.com',
                subject: `New Contact Form Submission - ${name} from ${company}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #225d56; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">VD Audio Rental</h1>
                            <p style="margin: 10px 0 0 0;">New Contact Form Submission</p>
                        </div>
                        
                        <div style="padding: 20px; background: #f9f9f9;">
                            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <tr style="background: #225d56; color: white;">
                                    <th colspan="2" style="padding: 15px; text-align: center; font-size: 18px;">
                                        Contact Information
                                    </th>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Name:</td>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${company}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                                        <a href="mailto:${email}" style="color: #225d56;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                                        <a href="tel:${phone}" style="color: #225d56;">${phone}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Contact:</td>
                                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${contactPreference || 'Not specified'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 15px; font-weight: bold; vertical-align: top;">Message:</td>
                                    <td style="padding: 12px 15px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
                                </tr>
                            </table>
                            
                            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-left: 4px solid #4caf50; border-radius: 4px;">
                                <p style="margin: 0; color: #2e7d32;">
                                    <strong>Submission Details:</strong><br>
                                    Time: ${new Date().toLocaleString()}<br>
                                    IP Address: ${req.ip}<br>
                                    User Agent: ${req.get('User-Agent')?.substring(0, 100) || 'Unknown'}
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; color: #666;">
                            <p>This message was sent from the VD Audio Rental contact form.</p>
                        </div>
                    </div>
                `
            };
            
            // Send email to admin
            await transporter.sendMail(adminMailOptions);
            console.log(`[${new Date().toISOString()}] Admin notification sent for ${email}`);
            
            // Prepare auto-response email for the user
            const userMailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: 'Thank you for contacting VD Audio Rental',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #225d56; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">VD Audio Rental</h1>
                            <p style="margin: 10px 0 0 0;">Professional Audio Solutions</p>
                        </div>
                        
                        <div style="padding: 20px;">
                            <h2 style="color: #225d56;">Thank you for contacting us!</h2>
                            
                            <p>Dear ${name},</p>
                            
                            <p>We have received your message and appreciate you taking the time to reach out to VD Audio Rental.</p>
                            
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Your message:</strong></p>
                                <p style="margin: 10px 0 0 0; font-style: italic;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
                            </div>
                            
                            <p>Our team will review your inquiry and get back to you as soon as possible, typically within 24 hours during business days.</p>
                            
                            <p>If you have an urgent request, please don't hesitate to call us directly at <strong>+1 (786) 257-2705</strong>.</p>
                            
                            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #2e7d32;">What happens next?</h3>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li>We'll review your requirements</li>
                                    <li>Our team will prepare a customized quote</li>
                                    <li>We'll contact you via your preferred method: <strong>${contactPreference || 'Email'}</strong></li>
                                </ul>
                            </div>
                            
                            <p>Thank you for choosing VD Audio Rental for your professional audio needs.</p>
                            
                            <p>Best regards,<br>
                            <strong>The VD Audio Rental Team</strong></p>
                        </div>
                        
                        <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666;">
                            <p style="margin: 0;">
                                <strong>VD Audio Rental</strong><br>
                                1592 NW 159th St, Miami, FL 33169<br>
                                Phone: +1 (786) 257-2705<br>
                                <a href="https://vdaudiorental.com" style="color: #225d56;">vdaudiorental.com</a>
                            </p>
                        </div>
                    </div>
                `
            };
            
            // Send auto-response to user
            await transporter.sendMail(userMailOptions);
            console.log(`[${new Date().toISOString()}] Auto-response sent to ${email}`);
        } else {
            console.log(`[${new Date().toISOString()}] Test mode - skipping email sending for ${email}`);
        }
        
        // Success response
        res.status(200).json({
            success: true,
            message: isTestMode ? 'Contact form submitted successfully (test mode - no emails sent)' : 'Contact form submitted successfully',
            data: {
                name,
                company,
                email,
                submittedAt: new Date().toISOString(),
                testMode: isTestMode
            }
        });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in contact form submission:`, error);
        
        // Determine appropriate error response
        let statusCode = 500;
        let errorMessage = 'Internal server error';
        
        if (error.code === 'EAUTH') {
            statusCode = 500;
            errorMessage = 'Email authentication failed';
        } else if (error.code === 'ECONNECTION') {
            statusCode = 500;
            errorMessage = 'Email service connection failed - please try again later';
        } else if (error.code === 'ETIMEDOUT') {
            statusCode = 500;
            errorMessage = 'Email service timeout - please try again later';
        } else if (error.message.includes('nodemailer')) {
            statusCode = 500;
            errorMessage = 'Email service configuration error';
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Contact form submission failed'
        });
    }
};

module.exports = {
    submitContactForm
};
