/**
 * Google Maps Integration for VD Audio Rental
 * Provides interactive map, directions, service area visualization, and distance calculator
 */

class VDMapsManager {
    constructor() {
        this.map = null;
        this.businessLocation = {
            lat: 25.91980376445975,
            lng: -80.22625269212408,
            address: '1592 NW 159th St, Miami, FL 33169'
        };
        this.businessMarker = null;
        this.userMarker = null;
        this.directionsService = null;
        this.directionsRenderer = null;
        this.serviceAreaCircle = null;
        this.distanceService = null;
        
        // Service area radius in miles
        this.serviceRadius = 50;
        
        this.init();
    }

    /**
     * Initialize the maps functionality
     */
    init() {
        // Wait for Google Maps API to load
        if (typeof google !== 'undefined' && google.maps) {
            this.initializeMap();
        } else {
            // Retry with exponential backoff, max 10 seconds
            this.retryCount = (this.retryCount || 0) + 1;
            if (this.retryCount < 50) { // 50 * 200ms = 10 seconds max
                setTimeout(() => this.init(), 200 * this.retryCount);
            } else {
                console.error('Google Maps API failed to load');
                this.showMapError();
            }
        }
    }

    /**
     * Initialize the Google Map
     */
    initializeMap() {
        try {
            const mapElement = document.getElementById('vd-map');
            if (!mapElement) {
                console.warn('Map container not found');
                return;
            }

            // Map configuration
            const mapOptions = {
                zoom: 12,
                center: this.businessLocation,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: this.getMapStyles(),
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true
            };

            // Create the map
            this.map = new google.maps.Map(mapElement, mapOptions);

            // Initialize services
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: false,
                draggable: true
            });
            this.distanceService = new google.maps.DistanceMatrixService();

            // Set up map components
            this.createBusinessMarker();
            this.createServiceAreaCircle();
            this.setupEventListeners();
            this.initializeLocationServices();

            console.log('Google Maps initialized successfully');
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
            this.showMapError();
        }
    }

    /**
     * Create the business location marker
     */
    createBusinessMarker() {
        const markerIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#007bff" stroke="#ffffff" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">VD</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        };

        this.businessMarker = new google.maps.Marker({
            position: this.businessLocation,
            map: this.map,
            title: 'VD Audio Rental',
            icon: markerIcon,
            animation: google.maps.Animation.DROP
        });

        // Info window for business marker
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info-window">
                    <h3>VD Audio Rental</h3>
                    <p><strong>Address:</strong><br>${this.businessLocation.address}</p>
                    <p><strong>Phone:</strong> +1 786 257 2705</p>
                    <p><strong>Email:</strong> info@vdaudiorentals.com</p>
                    <div class="info-actions">
                        <button onclick="vdMaps.getDirections()" class="btn btn-primary btn-sm">Get Directions</button>
                        <button onclick="vdMaps.calculateDistance()" class="btn btn-secondary btn-sm">Calculate Distance</button>
                    </div>
                </div>
            `
        });

        this.businessMarker.addListener('click', () => {
            infoWindow.open(this.map, this.businessMarker);
        });
    }

    /**
     * Create service area visualization
     */
    createServiceAreaCircle() {
        this.serviceAreaCircle = new google.maps.Circle({
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#007bff',
            fillOpacity: 0.15,
            map: this.map,
            center: this.businessLocation,
            radius: this.serviceRadius * 1609.34 // Convert miles to meters
        });

        // Add service area info
        const serviceAreaInfo = new google.maps.InfoWindow({
            content: `
                <div class="service-area-info">
                    <h4>Service Area</h4>
                    <p>We provide audio equipment rental services within ${this.serviceRadius} miles of our location.</p>
                    <p>Contact us for services outside this area - we may still be able to help!</p>
                </div>
            `,
            position: {
                lat: this.businessLocation.lat + 0.1,
                lng: this.businessLocation.lng
            }
        });

        // Show service area info when circle is clicked
        this.serviceAreaCircle.addListener('click', () => {
            serviceAreaInfo.open(this.map);
        });
    }

    /**
     * Set up event listeners for map interactions
     */
    setupEventListeners() {
        // Directions button
        const directionsBtn = document.getElementById('get-directions-btn');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', () => this.getDirections());
        }

        // Distance calculator button
        const distanceBtn = document.getElementById('calculate-distance-btn');
        if (distanceBtn) {
            distanceBtn.addEventListener('click', () => this.calculateDistance());
        }

        // Clear directions button
        const clearBtn = document.getElementById('clear-directions-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearDirections());
        }

        // Toggle service area button
        const serviceAreaBtn = document.getElementById('toggle-service-area-btn');
        if (serviceAreaBtn) {
            serviceAreaBtn.addEventListener('click', () => this.toggleServiceArea());
        }
    }

    /**
     * Initialize location services (geolocation)
     */
    initializeLocationServices() {
        if (navigator.geolocation) {
            const locationBtn = document.getElementById('use-my-location-btn');
            if (locationBtn) {
                locationBtn.addEventListener('click', () => this.useCurrentLocation());
            }
        } else {
            // Hide location button if geolocation is not supported
            const locationBtn = document.getElementById('use-my-location-btn');
            if (locationBtn) {
                locationBtn.style.display = 'none';
            }
        }
    }

    /**
     * Get directions to the business location
     */
    getDirections() {
        const startInput = document.getElementById('directions-start');
        const startAddress = startInput ? startInput.value.trim() : '';

        if (!startAddress) {
            // Try to use current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.calculateRoute(userLocation, this.businessLocation);
                    },
                    () => {
                        alert('Please enter a starting address or enable location services.');
                    }
                );
            } else {
                alert('Please enter a starting address.');
            }
            return;
        }

        // Calculate route from entered address
        this.calculateRoute(startAddress, this.businessLocation);
    }

    /**
     * Calculate and display route
     */
    calculateRoute(start, end) {
        const request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false
        };

        this.directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                this.directionsRenderer.setDirections(result);
                this.directionsRenderer.setMap(this.map);
                this.displayRouteInfo(result);
            } else {
                console.error('Directions request failed:', status);
                alert('Could not calculate directions. Please check the address and try again.');
            }
        });
    }

    /**
     * Display route information
     */
    displayRouteInfo(result) {
        const route = result.routes[0];
        const leg = route.legs[0];
        
        const routeInfoElement = document.getElementById('route-info');
        if (routeInfoElement) {
            routeInfoElement.innerHTML = `
                <div class="route-details">
                    <h4>Directions to VD Audio Rental</h4>
                    <p><strong>Distance:</strong> ${leg.distance.text}</p>
                    <p><strong>Duration:</strong> ${leg.duration.text}</p>
                    <p><strong>From:</strong> ${leg.start_address}</p>
                    <p><strong>To:</strong> ${leg.end_address}</p>
                </div>
            `;
            routeInfoElement.style.display = 'block';
        }
    }

    /**
     * Calculate distance from user location
     */
    calculateDistance() {
        const addressInput = document.getElementById('distance-address');
        const address = addressInput ? addressInput.value.trim() : '';

        if (!address) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLocation = new google.maps.LatLng(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        this.calculateDistanceMatrix([userLocation], [this.businessLocation]);
                    },
                    () => {
                        alert('Please enter an address or enable location services.');
                    }
                );
            } else {
                alert('Please enter an address.');
            }
            return;
        }

        this.calculateDistanceMatrix([address], [this.businessLocation]);
    }

    /**
     * Calculate distance matrix
     */
    calculateDistanceMatrix(origins, destinations) {
        this.distanceService.getDistanceMatrix({
            origins: origins,
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false
        }, (response, status) => {
            if (status === 'OK') {
                this.displayDistanceResults(response);
            } else {
                console.error('Distance calculation failed:', status);
                alert('Could not calculate distance. Please check the address and try again.');
            }
        });
    }

    /**
     * Display distance calculation results
     */
    displayDistanceResults(response) {
        const results = response.rows[0].elements[0];
        
        if (results.status === 'OK') {
            const distanceResultElement = document.getElementById('distance-result');
            if (distanceResultElement) {
                const isInServiceArea = this.isWithinServiceArea(results.distance.value);
                
                distanceResultElement.innerHTML = `
                    <div class="distance-details ${isInServiceArea ? 'in-service-area' : 'outside-service-area'}">
                        <h4>Distance Calculation</h4>
                        <p><strong>Distance:</strong> ${results.distance.text}</p>
                        <p><strong>Travel Time:</strong> ${results.duration.text}</p>
                        <p class="service-area-status">
                            ${isInServiceArea 
                                ? '<i class="fas fa-check-circle"></i> Within our service area' 
                                : '<i class="fas fa-exclamation-triangle"></i> Outside our standard service area - contact us for availability'
                            }
                        </p>
                    </div>
                `;
                distanceResultElement.style.display = 'block';
            }
        } else {
            alert('Could not calculate distance to the specified location.');
        }
    }

    /**
     * Check if distance is within service area
     */
    isWithinServiceArea(distanceInMeters) {
        const distanceInMiles = distanceInMeters * 0.000621371;
        return distanceInMiles <= this.serviceRadius;
    }

    /**
     * Use current location
     */
    useCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Add user marker
                if (this.userMarker) {
                    this.userMarker.setMap(null);
                }

                this.userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: this.map,
                    title: 'Your Location',
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }
                });

                // Center map to show both locations
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(userLocation);
                bounds.extend(this.businessLocation);
                this.map.fitBounds(bounds);

                // Auto-calculate distance
                this.calculateDistanceMatrix([userLocation], [this.businessLocation]);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Could not get your current location. Please check your browser settings.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    /**
     * Clear directions from the map
     */
    clearDirections() {
        if (this.directionsRenderer) {
            this.directionsRenderer.setMap(null);
        }
        
        const routeInfoElement = document.getElementById('route-info');
        if (routeInfoElement) {
            routeInfoElement.style.display = 'none';
        }

        const distanceResultElement = document.getElementById('distance-result');
        if (distanceResultElement) {
            distanceResultElement.style.display = 'none';
        }

        // Clear input fields
        const startInput = document.getElementById('directions-start');
        const addressInput = document.getElementById('distance-address');
        if (startInput) startInput.value = '';
        if (addressInput) addressInput.value = '';

        // Remove user marker
        if (this.userMarker) {
            this.userMarker.setMap(null);
            this.userMarker = null;
        }
    }

    /**
     * Toggle service area visibility
     */
    toggleServiceArea() {
        if (this.serviceAreaCircle) {
            const isVisible = this.serviceAreaCircle.getVisible();
            this.serviceAreaCircle.setVisible(!isVisible);
            
            const btn = document.getElementById('toggle-service-area-btn');
            if (btn) {
                btn.textContent = isVisible ? 'Show Service Area' : 'Hide Service Area';
            }
        }
    }

    /**
     * Get custom map styles
     */
    getMapStyles() {
        return [
            {
                featureType: 'poi.business',
                stylers: [{ visibility: 'on' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }]
            }
        ];
    }

    /**
     * Show error message when map fails to load
     */
    showMapError() {
        const mapElement = document.getElementById('vd-map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="map-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Map Unavailable</h3>
                    <p>Unable to load the interactive map. Please check your internet connection or try again later.</p>
                    <p><strong>Our Location:</strong><br>${this.businessLocation.address}</p>
                    <a href="https://maps.google.com/maps?q=${encodeURIComponent(this.businessLocation.address)}" 
                       target="_blank" class="btn btn-primary">
                        Open in Google Maps
                    </a>
                </div>
            `;
        }
    }
}

// Initialize maps when DOM is loaded
let vdMaps;
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Google Maps API to load
    setTimeout(() => {
        vdMaps = new VDMapsManager();
    }, 500);
});

// Fallback initialization if Google Maps API loads after DOM
window.initVDMaps = function() {
    if (!vdMaps) {
        vdMaps = new VDMapsManager();
    }
};