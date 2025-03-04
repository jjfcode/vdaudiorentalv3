# VD Audio Rental Website

A professional website for VD Audio Rental, showcasing audio equipment rental services, sales, and technical support.

## Description

This website serves as a digital storefront for VD Audio Rental, featuring:
- Professional audio equipment rental services
- Sub-rental services for production companies
- Tour support solutions
- Used equipment sales
- Comprehensive product catalog
- Contact information and quote requests

## Features

- Responsive design for all devices
- Modern UI with smooth animations
- Equipment catalog with detailed specifications
- Brand showcase including Yamaha, DiGiCo, Avid, Allen & Heath, and Mackie
- Interactive contact form with email notifications
- Service descriptions and company information
- Image galleries for equipment visualization
- Modal-based forms for better user experience

## Tech Stack

### Frontend
- HTML5
- CSS3 with CSS Variables
- JavaScript (ES6+)
- Font Awesome for icons
- Google Fonts (Roboto Slab, Roboto)

### Backend
- Node.js
- Express.js
- Nodemailer for email handling
- Custom SMTP server integration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vdaudiorentalv3.git
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory with:
```env
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password
SMTP_HOST=your_smtp_host
SMTP_PORT=587
PORT=3000
```

4. Start the backend server:
```bash
npm start
```

5. Open index.html in your browser or use a local server:
```bash
npx http-server
```

## File Structure

```
vdaudiorentalv3/
├── backend/
│   ├── server.js         # Node.js server
│   ├── package.json      # Backend dependencies
│   └── .env             # Environment variables
├── css/
│   ├── style.css        # Main stylesheet
│   └── variables.css    # CSS variables
├── js/
│   └── contact.js       # Contact form functionality
├── images/
│   ├── equipment/       # Product images
│   ├── logos/          # Brand and company logos
│   └── services/       # Service images
├── pages/
│   ├── speakers.html   # Speakers catalog
│   ├── mixers.html    # Mixers catalog
│   ├── wireless.html  # Wireless systems
│   └── thank-you.html # Form submission confirmation
└── index.html         # Homepage
```

## Features in Detail

### Contact Form
- Modal-based contact form
- Form validation
- Email notifications using custom SMTP server
- Auto-response to users
- Success confirmation page

### Equipment Catalog
- Categorized equipment listings
- Detailed specifications
- High-quality product images
- Easy navigation structure

### Responsive Design
- Mobile-first approach
- Breakpoints for all devices
- Optimized images
- Touch-friendly interface

## Email Configuration

The contact form uses a custom SMTP server with the following setup:
- Sender email: esend@vdaudiorentals.com
- Recipient email: info@vdaudiorentals.com
- Custom SMTP server configuration
- HTML email templates
- Auto-response functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

### Company Information
VD Audio Rental
- Website: [www.vdaudiorentals.com](https://jjfcode.github.io/vdaudiorentalv3/)
- Email: info@vdaudiorentals.com
- Phone: +1 786 257 2705
- Location: 1592 NW 159th St, Miami, FL 33169

### Developer Contact
John Joseph Ferlito
- Email: jjfcode@gmail.com
- GitHub: [github.com/jjfcode](https://github.com/jjfcode/vdaudiorentalv3)

## Version History

- 2.0.0
    - Added Node.js backend
    - Implemented custom SMTP email server
    - Updated contact form with modal interface
    - Added auto-response functionality
- 1.0.0
    - Initial Release
    - Basic catalog functionality
    - Contact form implementation

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Node.js community for excellent documentation
- All our clients and partners who trust in our services

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.