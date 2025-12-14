// Network Status Monitor
// Add this script to your pages to detect offline status

(function() {
    'use strict';
    
    // Don't run on the no-network page itself
    if (window.location.pathname.includes('no-network.html')) {
        return;
    }
    
    let wasOffline = false;
    
    function handleOffline() {
        if (!wasOffline) {
            wasOffline = true;
            console.log('🔴 Network connection lost');
            
            // Save current page to return after reconnection
            sessionStorage.setItem('pageBeforeOffline', window.location.href);
            
            // Redirect to no-network page
            window.location.href = 'no-network.html';
        }
    }
    
    function handleOnline() {
        if (wasOffline) {
            wasOffline = false;
            console.log('🟢 Network connection restored');
            
            // Show success notification if floating alerts available
            if (window.FloatingAlertManager) {
                window.alerts.success('Internet connection restored!', 'Connected');
            }
        }
    }
    
    // Listen for network status changes
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    // Check initial status
    if (!navigator.onLine) {
        handleOffline();
    }
    
    // Also check periodically by trying to fetch a small resource
    setInterval(() => {
        if (navigator.onLine) {
            // Try a lightweight fetch to verify actual connectivity
            fetch('https://www.google.com/favicon.ico', { 
                mode: 'no-cors',
                cache: 'no-cache'
            }).catch(() => {
                // If fetch fails but navigator.onLine is true, trigger offline
                handleOffline();
            });
        }
    }, 30000); // Check every 30 seconds
    
})();
