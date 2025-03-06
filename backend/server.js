const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: 'mail.vdaudiorentals.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, company, email, phone, message } = req.body;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@vdaudiorentals.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Company:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${company}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Message:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${message}</td>
                    </tr>
                </table>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send auto-response to user
        const autoResponseOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting VD Audio Rental',
            html: `
                <h2>Thank you for contacting VD Audio Rental</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Best regards,<br>VD Audio Rental Team</p>
            `
        };

        await transporter.sendMail(autoResponseOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 