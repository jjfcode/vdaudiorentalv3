# Google Maps Integration Setup Guide

## Overview
The VD Audio Rental website now includes an interactive Google Maps integration that provides:
- Interactive map showing business location
- Directions functionality
- Service area visualization (50-mile radius)
- Distance calculator
- Location-based features

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure the API Key

Replace `YOUR_API_KEY` in `index.html` with your actual API key:

```html
<script async defer 
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry&callback=initVDMaps">
</script>
```

### 3. API Key Restrictions (Recommended)

For security, restrict your API key:

**Application restrictions:**
- HTTP referrers (web sites)
- Add your domain: `yourdomain.com/*`

**API restrictions:**
- Restrict key to specific APIs
- Select: Maps JavaScript API, Directions API, Distance Matrix API, Geocoding API

### 4. Billing Setup

Google Maps requires a billing account, but includes:
- $200 monthly credit (covers most small business usage)
- Pay-as-you-go pricing beyond the credit

### 5. Testing

After setup, test the following features:
- Map loads and shows VD Audio Rental location
- Service area circle is visible
- Directions functionality works
- Distance calculator works
- "Use My Location" button works (requires HTTPS)

## Features Included

### Interactive Map
- Custom business marker with VD Audio Rental branding
- Info window with contact information
- Service area visualization (50-mile radius)
- Responsive design for mobile devices

### Directions
- Get directions from any address
- Use current location (requires user permission)
- Display route information (distance, duration)
- Clear directions functionality

### Distance Calculator
- Calculate distance from any address
- Check if location is within service area
- Visual indicators for service area status
- Support for current location

### Location Services
- Geolocation support for "Use My Location" features
- Fallback for browsers without geolocation
- Error handling for location services

## Customization Options

### Business Location
Update the business coordinates in `js/maps.js`:

```javascript
this.businessLocation = {
    lat: 25.9267,  // Your latitude
    lng: -80.2707, // Your longitude
    address: '1592 NW 159th St, Miami, FL 33169'
};
```

### Service Area
Change the service radius in `js/maps.js`:

```javascript
// Service area radius in miles
this.serviceRadius = 50; // Change to your preferred radius
```

### Map Styling
Customize map appearance in the `getMapStyles()` method in `js/maps.js`.

## Troubleshooting

### Map Not Loading
- Check API key is correct and not restricted
- Verify billing is set up in Google Cloud Console
- Check browser console for error messages
- Ensure HTTPS for location services

### API Quota Exceeded
- Monitor usage in Google Cloud Console
- Implement usage limits if needed
- Consider caching for high-traffic sites

### Location Services Not Working
- Requires HTTPS for geolocation
- User must grant permission
- Fallback to manual address entry

## Performance Optimization

The implementation includes several performance optimizations:
- Lazy loading of map components
- Error handling and fallbacks
- Responsive design
- Minimal API calls
- Efficient event handling

## Accessibility Features

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Reduced motion support
- Focus indicators

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers
- Fallback to Google Maps link if JavaScript fails

## Security Considerations

- API key restrictions by domain
- Input validation for addresses
- HTTPS requirement for location services
- No sensitive data in client-side code

## Cost Estimation

For a typical small business website:
- Map loads: ~1,000/month = ~$2
- Directions: ~500/month = ~$2.50
- Distance calculations: ~300/month = ~$1.50
- Total: ~$6/month (well within $200 credit)

## Support

For issues with the Google Maps integration:
1. Check the browser console for errors
2. Verify API key setup and restrictions
3. Test with a simple address first
4. Contact Google Cloud Support for API issues