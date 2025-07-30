# 📊 AEM Asset Insights Setup for Edge Delivery Services

Complete guide for configuring AEM Asset Insights on your Emirates document-based authoring website.

---

## ✅ **Implementation Status**

Asset Insights tracking has been implemented across all blocks:

- ✅ **Asset Insights Script**: `/scripts/asset-insights.js` 
- ✅ **Head Integration**: Added to `head.html`
- ✅ **AEM Page Tracker**: Official page tracker code added
- ✅ **Carousel Block**: Enhanced with asset tracking
- ✅ **Teaser Block**: Enhanced with asset tracking  
- ✅ **Hero Block**: Enhanced with asset tracking
- ✅ **Cards Block**: Enhanced with asset tracking

---

## 🔧 **Configuration Completed** ✅

### **1. AEM Page Tracker Code** ✅

The official AEM Asset Insights page tracker code has been added to `head.html` with the following configuration:

- **RSID**: `demopotemea.astrazeneca`
- **Tracking Server**: `demopotemea.data.adobedc.net`
- **Visitor Namespace**: `demopotemea`
- **External Libraries**: AppMeasurement.js and pagetracker.js loaded from AEM Cloud

The script includes comprehensive configuration options (commented out by default) and loads the necessary Adobe Analytics libraries automatically.

### **2. Verify Adobe Analytics Integration**

Ensure your Adobe Analytics configuration supports the variables we're using:

```javascript
// In your Analytics setup, map these variables:
// eVar10 = Asset Path
// eVar11 = Asset ID  
// eVar12 = Asset Type
// event10 = Asset View Event
```

---

## 📊 **Tracking Features Implemented**

### **Automatic Asset Tracking**
- ✅ **Image optimization tracking**: When `createOptimizedPicture` is called
- ✅ **View tracking**: When assets become visible (Intersection Observer)
- ✅ **Block context**: Tracks which block type contains the asset
- ✅ **Carousel interactions**: Tracks slide views and navigation
- ✅ **Duplicate prevention**: Assets only tracked once per session

### **Tracked Asset Data**
```javascript
{
  assetPath: '/path/to/image.jpg',
  assetId: 'image-filename',
  assetType: 'image',
  source: 'edge-delivery',
  blockType: 'carousel|teaser|hero|cards',
  blockIndex: 0,
  timestamp: 1234567890
}
```

### **Block-Specific Tracking**

**Carousel:**
- Initial asset load tracking
- Slide view tracking when slides become visible
- Navigation interaction tracking

**Teaser:**
- Asset load tracking  
- View tracking when 50% visible
- Layout context (image-left vs content-left)

**Hero:**
- Background image tracking
- View tracking when 30% visible
- Large format image optimization tracking

**Cards:**
- Individual card asset tracking
- View tracking per card when 50% visible
- Grid position context

---

## 🔍 **Testing Your Setup**

### **1. Browser Developer Tools**

Open browser console and run:
```javascript
// Debug asset insights
debugAssetInsights();

// Check tracking status
console.log('Analytics loaded:', !!window.s);
console.log('Asset insights loaded:', !!window.trackBlockAsset);
console.log('Tracked images:', document.querySelectorAll('img[data-insights-tracked]').length);
```

### **2. Network Tab Verification**

Look for Analytics calls in Network tab:
- Search for your tracking server domain
- Verify `eVar10`, `eVar11`, `eVar12` values
- Check `event10` is being sent

### **3. Adobe Analytics Reports**

Verify data in Adobe Analytics:
- **Custom Variables**: Check eVar10-12 reports
- **Events**: Check event10 (Asset Views)
- **Real-time**: Monitor live asset tracking

---

## 📱 **Document-Based Authoring Integration**

### **Supported Content Patterns**

**Images from Google Docs:**
- ✅ Automatically tracked when imported
- ✅ Optimized image variants tracked
- ✅ Original source URL preserved

**Dynamic Block Content:**
- ✅ Carousel slides track individually
- ✅ Card grids track per card
- ✅ Hero backgrounds track as single unit
- ✅ Teaser images track with layout context

### **Asset URL Handling**

The system handles various asset URL formats:
```javascript
// Local assets
/content/dam/assets/image.jpg → 'image'

// External assets  
https://author-p123.aem.com/.../image.jpg → 'image'

// Optimized variants
/image.jpg?width=750&format=webp → 'image'
```

---

## ⚠️ **Troubleshooting**

### **Common Issues**

**Assets Not Tracking:**
```javascript
// Check if script loaded
console.log('Asset insights:', !!window.trackBlockAsset);

// Check Analytics
console.log('Adobe Analytics:', !!window.s);

// Check pending tracks
console.log('Pending:', window.pendingAssetTracks?.length);
```

**Analytics Variables Not Set:**
- Verify eVar10-12 are enabled in your report suite
- Check event10 is configured
- Ensure your page tracker code is correct

**Duplicate Tracking:**
- System prevents duplicates with `data-insights-tracked` attribute
- Each asset only tracked once per page view

### **Debug Commands**

```javascript
// Test tracking manually
if (window.trackBlockAsset) {
  const img = document.querySelector('img');
  window.trackBlockAsset(img, 'test', 0);
}

// Check all tracked assets
document.querySelectorAll('img[data-insights-tracked]').forEach((img, i) => {
  console.log(`Asset ${i}:`, img.src);
});

// Force process pending tracks
if (window.pendingAssetTracks) {
  console.log('Processing pending tracks:', window.pendingAssetTracks.length);
}
```

---

## 📈 **Analytics Configuration**

### **Required Adobe Analytics Setup**

1. **Custom Variables (eVars)**:
   - `eVar10`: Asset Path (URL)
   - `eVar11`: Asset ID (filename)
   - `eVar12`: Asset Type (image/video)

2. **Custom Events**:
   - `event10`: Asset View Event

3. **Processing Rules** (optional):
   - Clean asset paths for reporting
   - Categorize asset types
   - Extract file extensions

### **Recommended Reports**

- **Asset Performance**: Top viewed assets
- **Block Performance**: Asset views by block type
- **Page Performance**: Assets per page view
- **User Engagement**: Asset view patterns

---

## 🚀 **Go Live Checklist**

- [x] Page tracker code added to `head.html` ✅
- [ ] Adobe Analytics variables configured (eVar10-12, event10)
- [ ] Test asset tracking in browser console
- [ ] Verify Analytics calls in Network tab
- [ ] Check real-time reports in Adobe Analytics
- [ ] Test all block types (carousel, teaser, hero, cards)
- [ ] Verify mobile tracking works
- [ ] Document any custom tracking requirements

---

## 📞 **Support**

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify Analytics setup** in Adobe Analytics admin
3. **Test with simple static images** first
4. **Use debug functions** provided in the asset-insights.js script

The asset insights system is now fully integrated and ready to track asset performance across your Emirates Edge Delivery website! 📊✨

---

*Asset tracking will help you understand which images perform best and optimize your content strategy.* 