/**
 * AEM Asset Insights Tracking for Edge Delivery Services
 * Tracks asset views and interactions for analytics
 */

// Asset Insights tracking function
function trackAssetView(assetPath, assetId, assetType = 'image') {
  if (window.AdobeAnalytics && window.AdobeAnalytics.trackAsset) {
    window.AdobeAnalytics.trackAsset({
      assetPath: assetPath,
      assetId: assetId,
      assetType: assetType,
      source: 'edge-delivery',
      timestamp: Date.now()
    });
    
    console.log(`Asset tracked: ${assetId} (${assetPath})`);
  } else {
    // Fallback: store for later when Analytics loads
    window.pendingAssetTracks = window.pendingAssetTracks || [];
    window.pendingAssetTracks.push({
      assetPath,
      assetId,
      assetType,
      timestamp: Date.now()
    });
  }
}

// Extract asset ID from asset path
function extractAssetId(assetPath) {
  if (!assetPath) return null;
  
  try {
    // Handle different URL patterns
    const url = new URL(assetPath, window.location.origin);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Remove query parameters and file extension
    const assetId = filename.split('?')[0].split('.')[0];
    return assetId || null;
  } catch (error) {
    console.warn('Failed to extract asset ID from:', assetPath, error);
    return null;
  }
}

// Track individual image asset
function trackImageAsset(img) {
  if (!img || !img.src) return;
  
  const assetPath = img.src;
  const assetId = extractAssetId(assetPath);
  
  if (assetId) {
    trackAssetView(assetPath, assetId, 'image');
    
    // Mark as tracked to avoid duplicate tracking
    img.setAttribute('data-insights-tracked', 'true');
  }
}

// Track video assets
function trackVideoAsset(video) {
  if (!video || !video.src) return;
  
  const assetPath = video.src;
  const assetId = extractAssetId(assetPath);
  
  if (assetId) {
    trackAssetView(assetPath, assetId, 'video');
    video.setAttribute('data-insights-tracked', 'true');
  }
}

// Initialize asset tracking for existing content
function initAssetTracking() {
  // Track all existing images
  document.querySelectorAll('img:not([data-insights-tracked])').forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      trackImageAsset(img);
    } else {
      img.addEventListener('load', () => trackImageAsset(img), { once: true });
      img.addEventListener('error', () => {
        console.warn('Failed to load image for tracking:', img.src);
      }, { once: true });
    }
  });
  
  // Track all existing videos
  document.querySelectorAll('video:not([data-insights-tracked])').forEach(video => {
    if (video.readyState >= 2) { // HAVE_CURRENT_DATA
      trackVideoAsset(video);
    } else {
      video.addEventListener('loadeddata', () => trackVideoAsset(video), { once: true });
    }
  });
}

// Observer for dynamically loaded content
function setupAssetObserver() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          // Track new images
          if (node.tagName === 'IMG') {
            trackImageAsset(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img:not([data-insights-tracked])').forEach(trackImageAsset);
            node.querySelectorAll('video:not([data-insights-tracked])').forEach(trackVideoAsset);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// Adobe Analytics integration
window.AdobeAnalytics = window.AdobeAnalytics || {
  trackAsset: function(assetData) {
    // Check if Adobe Analytics is loaded
    if (window.s) {
      try {
        // Configure Analytics variables for asset tracking
        window.s.linkTrackVars = 'eVar10,eVar11,eVar12,events';
        window.s.linkTrackEvents = 'event10';
        window.s.eVar10 = assetData.assetPath;
        window.s.eVar11 = assetData.assetId;
        window.s.eVar12 = assetData.assetType;
        window.s.events = 'event10'; // Asset view event
        
        // Send tracking call
        window.s.tl(true, 'o', 'Asset View');
        
        console.log('Asset tracked via Adobe Analytics:', assetData);
      } catch (error) {
        console.error('Error tracking asset in Adobe Analytics:', error);
      }
    } else {
      console.warn('Adobe Analytics not loaded, queuing asset tracking:', assetData);
    }
  }
};

// Process pending asset tracks when Analytics loads
function processPendingTracks() {
  if (window.pendingAssetTracks && window.pendingAssetTracks.length > 0) {
    console.log(`Processing ${window.pendingAssetTracks.length} pending asset tracks`);
    
    window.pendingAssetTracks.forEach(track => {
      window.AdobeAnalytics.trackAsset(track);
    });
    
    window.pendingAssetTracks = [];
  }
}

// Enhanced tracking for block-specific assets
window.trackBlockAsset = function(assetElement, blockType, blockIndex = 0) {
  const assetPath = assetElement.src;
  const assetId = extractAssetId(assetPath);
  
  if (assetId) {
    // Enhanced tracking with block context
    if (window.AdobeAnalytics && window.AdobeAnalytics.trackAsset) {
      window.AdobeAnalytics.trackAsset({
        assetPath: assetPath,
        assetId: assetId,
        assetType: assetElement.tagName.toLowerCase(),
        source: 'edge-delivery',
        blockType: blockType,
        blockIndex: blockIndex,
        timestamp: Date.now()
      });
    }
  }
};

// Debug function for testing
window.debugAssetInsights = function() {
  console.log('=== AEM Asset Insights Debug ===');
  console.log('Analytics object:', window.AdobeAnalytics);
  console.log('Images on page:', document.querySelectorAll('img').length);
  console.log('Tracked images:', document.querySelectorAll('img[data-insights-tracked]').length);
  console.log('Pending tracks:', window.pendingAssetTracks?.length || 0);
  
  // Test tracking
  const testImg = document.querySelector('img');
  if (testImg) {
    console.log('Testing with first image:', testImg.src);
    trackImageAsset(testImg);
  }
};

// Initialize when DOM is ready
function initializeAssetInsights() {
  console.log('Initializing AEM Asset Insights for Edge Delivery');
  
  // Set up tracking
  initAssetTracking();
  setupAssetObserver();
  
  // Process any pending tracks
  processPendingTracks();
  
  // Set up periodic check for Analytics loading
  const analyticsCheck = setInterval(() => {
    if (window.s) {
      processPendingTracks();
      clearInterval(analyticsCheck);
    }
  }, 1000);
  
  // Clear check after 30 seconds
  setTimeout(() => clearInterval(analyticsCheck), 30000);
}

// Initialize based on document state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAssetInsights);
} else {
  initializeAssetInsights();
}

// Export for use in other scripts
export { trackAssetView, trackImageAsset, trackVideoAsset, extractAssetId }; 