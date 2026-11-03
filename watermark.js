/**
 * WackyKicks - Preview Mode Watermark Controller
 * Injects a full-viewport repeating diagonal watermark and preview badge across any page.
 * Maintains full click/touch interactivity via pointer-events: none.
 * Features auto-recovery if the DOM node is removed.
 */
(function () {
    'use strict';

    // Prevent double initialization
    if (window.__WATERMARK_INITIALIZED__) return;
    window.__WATERMARK_INITIALIZED__ = true;

    var config = window.WATERMARK_CONFIG || {
        primaryText: 'PREVIEW ONLY',
        secondaryText: 'WACKYKICKS.IN • CONFIDENTIAL',
        badgeText: 'PREVIEW MODE • NOT FOR DISTRIBUTION',
        enableBadge: true
    };

    // Ensure CSS is present in document
    function ensureStyles() {
        if (document.getElementById('wackykicks-watermark-styles')) return;

        var style = document.createElement('style');
        style.id = 'wackykicks-watermark-styles';
        style.textContent = `
            #preview-watermark-overlay,
            .preview-watermark-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                z-index: 2147483647 !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                background-repeat: repeat !important;
                background-position: 0 0 !important;
                background-size: 380px 240px !important;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='380' height='240' viewBox='0 0 380 240'%3E%3Cstyle%3E.t%7Bfont-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:900;text-anchor:middle;text-transform:uppercase;%7D.m%7Bfont-size:18px;letter-spacing:4px;fill:rgba(100,100,100,0.18);%7D.s%7Bfont-size:10px;font-weight:700;letter-spacing:2.5px;fill:rgba(100,100,100,0.14);%7D%3C/style%3E%3Cg transform='rotate(-28 190 120)'%3E%3Ctext x='190' y='112' class='t m'%3E${encodeURIComponent(config.primaryText)}%3C/text%3E%3Ctext x='190' y='132' class='t s'%3E${encodeURIComponent(config.secondaryText)}%3C/text%3E%3C/g%3E%3Cg transform='rotate(-28 0 0)'%3E%3Ctext x='0' y='-8' class='t m'%3E${encodeURIComponent(config.primaryText)}%3C/text%3E%3Ctext x='0' y='12' class='t s'%3E${encodeURIComponent(config.secondaryText)}%3C/text%3E%3C/g%3E%3Cg transform='rotate(-28 380 0)'%3E%3Ctext x='380' y='-8' class='t m'%3E${encodeURIComponent(config.primaryText)}%3C/text%3E%3Ctext x='380' y='12' class='t s'%3E${encodeURIComponent(config.secondaryText)}%3C/text%3E%3C/g%3E%3Cg transform='rotate(-28 0 240)'%3E%3Ctext x='0' y='232' class='t m'%3E${encodeURIComponent(config.primaryText)}%3C/text%3E%3Ctext x='0' y='252' class='t s'%3E${encodeURIComponent(config.secondaryText)}%3C/text%3E%3C/g%3E%3Cg transform='rotate(-28 380 240)'%3E%3Ctext x='380' y='232' class='t m'%3E${encodeURIComponent(config.primaryText)}%3C/text%3E%3Ctext x='380' y='252' class='t s'%3E${encodeURIComponent(config.secondaryText)}%3C/text%3E%3C/g%3E%3C/svg%3E") !important;
            }

            #preview-badge,
            .preview-watermark-badge {
                position: fixed !important;
                top: 12px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 6px 16px !important;
                border-radius: 9999px !important;
                background: rgba(20, 20, 20, 0.82) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
                color: #ffffff !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                letter-spacing: 1.5px !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
                animation: previewBadgePulse 3s ease-in-out infinite alternate !important;
            }

            .preview-watermark-badge .preview-pulse-dot {
                width: 8px !important;
                height: 8px !important;
                border-radius: 50% !important;
                background-color: #ffaa00 !important;
                box-shadow: 0 0 10px #ffaa00 !important;
                display: inline-block !important;
                animation: previewDotBlink 1.5s infinite !important;
            }

            @keyframes previewBadgePulse {
                0% { opacity: 0.88; transform: translateX(-50%) scale(1); }
                100% { opacity: 0.98; transform: translateX(-50%) scale(1.02); }
            }

            @keyframes previewDotBlink {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.35; transform: scale(0.85); }
            }

            @media print {
                #preview-watermark-overlay,
                .preview-watermark-overlay {
                    position: fixed !important;
                    display: block !important;
                    opacity: 0.35 !important;
                    background-size: 300px 200px !important;
                }
                #preview-badge,
                .preview-watermark-badge {
                    position: fixed !important;
                    top: 10px !important;
                    background: #000000 !important;
                    color: #ffffff !important;
                    border: 2px solid #000000 !important;
                }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function createOverlay() {
        var existingOverlay = document.getElementById('preview-watermark-overlay');
        if (!existingOverlay) {
            var overlay = document.createElement('div');
            overlay.id = 'preview-watermark-overlay';
            overlay.className = 'preview-watermark-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            var container = document.body || document.documentElement;
            container.appendChild(overlay);
        }

        if (config.enableBadge) {
            var existingBadge = document.getElementById('preview-badge');
            if (!existingBadge) {
                var badge = document.createElement('div');
                badge.id = 'preview-badge';
                badge.className = 'preview-watermark-badge';
                badge.setAttribute('aria-hidden', 'true');
                badge.innerHTML = '<span class="preview-pulse-dot"></span> ' + config.badgeText;
                var container = document.body || document.documentElement;
                container.appendChild(badge);
            }
        }
    }

    function setupObserver() {
        if (!window.MutationObserver) return;
        var observer = new MutationObserver(function () {
            var overlay = document.getElementById('preview-watermark-overlay');
            var badge = document.getElementById('preview-badge');
            if (!overlay || (config.enableBadge && !badge)) {
                createOverlay();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        ensureStyles();
        createOverlay();
        setupObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
