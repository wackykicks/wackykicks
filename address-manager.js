// Address Manager - Save and Load addresses with Google Maps integration
class AddressManager {
    constructor() {
        this.savedAddresses = this.loadAddresses();
    }

    loadAddresses() {
        const saved = localStorage.getItem('savedAddresses');
        return saved ? JSON.parse(saved) : [];
    }

    saveAddress(address) {
        // Check if address already exists
        const exists = this.savedAddresses.some(addr => 
            addr.address === address.address && 
            addr.pincode === address.pincode
        );
        
        if (!exists) {
            address.id = Date.now();
            address.savedAt = new Date().toISOString();
            this.savedAddresses.unshift(address);
            
            // Keep only last 5 addresses
            if (this.savedAddresses.length > 5) {
                this.savedAddresses = this.savedAddresses.slice(0, 5);
            }
            
            localStorage.setItem('savedAddresses', JSON.stringify(this.savedAddresses));
        }
    }

    getAddresses() {
        return this.savedAddresses;
    }

    deleteAddress(id) {
        this.savedAddresses = this.savedAddresses.filter(addr => addr.id !== id);
        localStorage.setItem('savedAddresses', JSON.stringify(this.savedAddresses));
    }

    getLastAddress() {
        return this.savedAddresses.length > 0 ? this.savedAddresses[0] : null;
    }
}

// Initialize Google Maps Autocomplete
function initializeAddressAutocomplete(inputId) {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.log('Google Maps API not loaded yet');
        return null;
    }

    const input = document.getElementById(inputId);
    if (!input) return null;

    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'in' }
    });

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        // Extract address components
        let address = '';
        let pincode = '';
        let city = '';
        let state = '';

        place.address_components.forEach(component => {
            const types = component.types;
            
            if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                address = component.long_name;
            }
            if (types.includes('locality')) {
                city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
            }
            if (types.includes('postal_code')) {
                pincode = component.long_name;
            }
            if (types.includes('street_number') || types.includes('route')) {
                address = (address ? address + ', ' : '') + component.long_name;
            }
        });

        // Auto-fill the form fields
        if (city) {
            const cityInput = document.getElementById('city');
            if (cityInput) cityInput.value = city;
        }
        if (state) {
            const stateSelect = document.getElementById('state');
            if (stateSelect) stateSelect.value = state;
        }
        if (pincode) {
            const pincodeInput = document.getElementById('pincode');
            if (pincodeInput) pincodeInput.value = pincode;
        }
    });

    return autocomplete;
}

// Global address manager instance
window.addressManager = new AddressManager();

// Initialize autocomplete when Google Maps is ready
window.initAddressAutocomplete = initializeAddressAutocomplete;
