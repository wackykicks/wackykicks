// Christmas Theme Controller
// Automatically activates Christmas theme from Dec 1 to Jan 5

class ChristmasThemeController {
    constructor() {
        this.startDate = new Date('2024-12-01');
        this.endDate = new Date('2026-01-05T23:59:59');
        this.init();
    }

    isChristmasSeason() {
        const now = new Date();
        return now >= this.startDate && now <= this.endDate;
    }

    applyTheme() {
        if (this.isChristmasSeason()) {
            document.body.classList.add('christmas-theme');
            this.addChristmasElements();
            console.log('🎄 Christmas theme activated!');
        } else {
            document.body.classList.remove('christmas-theme');
            this.removeChristmasElements();
            console.log('Regular theme active');
        }
    }

    addChristmasElements() {
        // Add Christmas lights decoration
        if (!document.querySelector('.christmas-lights')) {
            const lights = document.createElement('div');
            lights.className = 'christmas-lights';
            document.body.prepend(lights);
        }

        // Add Christmas banner message
        if (!document.querySelector('.christmas-banner-message')) {
            const banner = document.createElement('div');
            banner.className = 'christmas-banner-message';
            banner.innerHTML = `
                <span class="emoji">🎄</span>
                <span>CHRISTMAS SALE - Special Offers Till Jan 5th!</span>
                <span class="emoji">🎅</span>
            `;
            
            // Insert after navbar
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.insertAdjacentElement('afterend', banner);
            }
        }

        // Update promotional banners for Christmas
        this.updatePromotionalBanners();
    }

    removeChristmasElements() {
        // Remove Christmas-specific elements
        const lights = document.querySelector('.christmas-lights');
        if (lights) lights.remove();

        const banner = document.querySelector('.christmas-banner-message');
        if (banner) banner.remove();

        // Restore original promotional banners
        this.restorePromotionalBanners();
    }

    updatePromotionalBanners() {
        // Create Christmas slideshow banner
        this.createChristmasSlideshow();
    }

    createChristmasSlideshow() {
        // Find the first promotional banner section to replace with slideshow
        const bannerSection = document.querySelector('#promotional-banners-1');
        if (!bannerSection) return;

        // Store original content
        if (!bannerSection.dataset.originalContent) {
            bannerSection.dataset.originalContent = bannerSection.innerHTML;
        }

        // Create slideshow HTML
        bannerSection.innerHTML = `
            <div class="christmas-slideshow-container">
                <div class="christmas-slides fade">
                    <img src="./christmas-banner-1.jpg" alt="Christmas Sale" onerror="this.parentElement.innerHTML='<div class=\\'fallback-banner-1\\'><h2>🎄 CHRISTMAS SALE 🎄</h2><p>Special Offers Till Jan 5th!</p></div>'">
                </div>
                <div class="christmas-slides fade">
                    <img src="./christmas-banner-2.jpg" alt="Holiday Special" onerror="this.parentElement.innerHTML='<div class=\\'fallback-banner-2\\'><h2>🎅 HOLIDAY SPECIALS 🎁</h2><p>Shop Now & Save Big!</p></div>'">
                </div>
                <a class="prev" onclick="christmasSlideshow.changeSlide(-1)">❮</a>
                <a class="next" onclick="christmasSlideshow.changeSlide(1)">❯</a>
                <div class="dots-container">
                    <span class="dot" onclick="christmasSlideshow.currentSlide(1)"></span>
                    <span class="dot" onclick="christmasSlideshow.currentSlide(2)"></span>
                </div>
            </div>
        `;

        // Hide the second promotional banner during Christmas
        const banner2Section = document.querySelector('#promotional-banners-2');
        if (banner2Section) {
            banner2Section.style.display = 'none';
        }

        // Initialize slideshow
        if (!window.christmasSlideshow) {
            window.christmasSlideshow = new ChristmasSlideshow();
        }
    }

    restorePromotionalBanners() {
        // Restore first banner
        const bannerSection = document.querySelector('#promotional-banners-1');
        if (bannerSection && bannerSection.dataset.originalContent) {
            bannerSection.innerHTML = bannerSection.dataset.originalContent;
        }

        // Show second banner again
        const banner2Section = document.querySelector('#promotional-banners-2');
        if (banner2Section) {
            banner2Section.style.display = '';
        }

        // Stop slideshow
        if (window.christmasSlideshow) {
            window.christmasSlideshow.stop();
            window.christmasSlideshow = null;
        }
    }

    init() {
        // Apply theme on load
        this.applyTheme();

        // Check daily if we need to switch theme
        setInterval(() => {
            this.applyTheme();
        }, 86400000); // Check every 24 hours
    }
}

// Christmas Slideshow Class
class ChristmasSlideshow {
    constructor() {
        this.slideIndex = 1;
        this.autoPlayInterval = null;
        this.showSlides(this.slideIndex);
        this.startAutoPlay();
    }

    changeSlide(n) {
        this.showSlides(this.slideIndex += n);
        this.resetAutoPlay();
    }

    currentSlide(n) {
        this.showSlides(this.slideIndex = n);
        this.resetAutoPlay();
    }

    showSlides(n) {
        const slides = document.getElementsByClassName("christmas-slides");
        const dots = document.getElementsByClassName("dot");
        
        if (!slides.length) return;

        if (n > slides.length) { this.slideIndex = 1; }
        if (n < 1) { this.slideIndex = slides.length; }

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        slides[this.slideIndex - 1].style.display = "block";
        if (dots[this.slideIndex - 1]) {
            dots[this.slideIndex - 1].className += " active";
        }
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.slideIndex++;
            this.showSlides(this.slideIndex);
        }, 4000); // Change slide every 4 seconds
    }

    resetAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.startAutoPlay();
    }

    stop() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Initialize Christmas theme controller when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChristmasThemeController();
    });
} else {
    new ChristmasThemeController();
}
