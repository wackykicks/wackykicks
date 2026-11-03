# 🎄 Christmas Theme - vexior.in

## Overview
Your website now has an automatic Christmas theme that activates from **December 1st to January 5th** every year and automatically switches back to the normal design afterward.

## ✨ Features

### Automatic Activation
- Theme automatically detects the current date
- Activates between December 1 - January 5
- No manual intervention required
- Checks daily to ensure proper switching

### Visual Enhancements
- ❄️ Animated snowfall effect
- 🎄 Christmas lights decoration at the top
- 🎅 Holiday color scheme (red, green, gold)
- 🎁 Festive banner message
- ✨ Christmas-themed buttons and cards
- 🌟 Smooth animations and transitions

### Design Elements
- **Navbar**: Red gradient with gold accents
- **Buttons**: Christmas green and red colors
- **Product Cards**: Gold borders with festive hover effects
- **Footer**: Dark green with gold border
- **Promotional Banners**: Updated with Christmas messaging

## 📁 Files Added

1. **christmas-theme.css** - All Christmas styling
2. **christmas-theme.js** - Automatic theme controller
3. **christmas-setup-guide.html** - Setup instructions and preview

## 🎨 Banner Images (Optional)

To use custom Christmas banner images:

1. Create or use your Christmas banner images (like the one you uploaded)
2. Save them as:
   - `christmas-banner-1.png` (1920x400px recommended)
   - `christmas-banner-2.png` (1920x400px recommended)
3. Place in your website root folder
4. The theme will automatically use them!

**Fallback**: If images aren't found, styled CSS banners will display automatically.

## 🔧 How It Works

### Date Detection
```javascript
Start Date: December 1st
End Date: January 5th (11:59:59 PM)
Check Interval: Every 24 hours
```

### Theme Application
1. Script runs on page load
2. Checks current date
3. If within Christmas period:
   - Adds `christmas-theme` class to body
   - Injects Christmas decorations
   - Updates promotional banners
4. If outside period:
   - Removes Christmas elements
   - Returns to normal design

## 📄 Updated Files

The following files now include Christmas theme support:
- ✅ `index.html`
- ✅ `product.html`
- ✅ `cart.html`

## 🎯 Testing

### Test Christmas Theme Now
The theme is currently **ACTIVE** (December 13, 2025) and will remain until January 5, 2026.

### Test After Season
To test the automatic switch-off:
- Theme will automatically deactivate after January 5, 2026
- Normal design will restore automatically

## 🛠️ Customization

### Modify Date Range
Edit `christmas-theme.js`:
```javascript
this.startDate = new Date('2024-12-01');
this.endDate = new Date('2026-01-05T23:59:59');
```

### Customize Colors
Edit `christmas-theme.css` root variables:
```css
:root {
    --christmas-red: #c41e3a;
    --christmas-green: #165b33;
    --christmas-gold: #FFD700;
}
```

### Disable Theme
To temporarily disable:
1. Remove `<link rel="stylesheet" href="christmas-theme.css">` from HTML files
2. Remove `<script src="christmas-theme.js"></script>` from HTML files

## 🎨 Style Elements Affected

- Navbar and navigation links
- Product cards and buttons
- Shopping cart button
- Search bar
- Footer
- Promotional banners
- Modal dialogs
- Price tags
- Category cards
- Pagination buttons
- Fixed product bar

## 📱 Responsive Design

Christmas theme is fully responsive:
- ✅ Desktop (full effects)
- ✅ Tablet (optimized layout)
- ✅ Mobile (compact decorations)

## 🎁 Special Effects

1. **Snowfall Animation**: Continuous gentle snowfall
2. **Christmas Lights**: Twinkling lights at page top
3. **Banner Glow**: Pulsing golden glow effect
4. **Emoji Animation**: Bouncing Christmas emojis
5. **Hover Effects**: Enhanced festive interactions

## 🔄 Automatic Restoration

After January 5, 2026:
- Christmas theme automatically deactivates
- Original design returns
- No files are modified
- Ready for next Christmas season

## 🎉 Next Steps

1. Visit your website to see the Christmas theme in action
2. (Optional) Add custom banner images for personalized look
3. Share your festive website with customers
4. Theme will automatically manage itself!

## 💡 Tips

- Test on different devices to see responsive behavior
- Consider taking screenshots for next year's reference
- The uploaded Christmas banner image can be used for inspiration
- Theme works perfectly with existing functionality

---

**Theme Active Period**: December 1, 2025 - January 5, 2026
**Current Status**: ✅ ACTIVE
**Next Activation**: December 1, 2026

🎄 **Merry Christmas and Happy New Year!** 🎄
