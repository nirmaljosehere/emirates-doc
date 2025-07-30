import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Enhanced Teaser Block - 2-Column Layout
 * Structure: [Layout Row] then [Image] | [Content] or [Content] | [Image]
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  
  // Default layout configuration
  let layoutConfig = 'image-left'; // default
  
  const allRows = [...block.children];
  
  // Find layout configuration in first rows
  const configRows = [];
  const contentRows = [];
  
  allRows.forEach((row, index) => {
    const cells = [...row.children];
    
    // Check for layout configuration
    if (cells.length === 1) {
      const cellText = cells[0].textContent.trim().toLowerCase();
      if (cellText.includes('content-left') || cellText.includes('text-left')) {
        layoutConfig = 'content-left';
        configRows.push(index);
        return;
      } else if (cellText.includes('image-left') || cellText.includes('photo-left')) {
        layoutConfig = 'image-left';
        configRows.push(index);
        return;
      } else if (cellText === 'teaser') {
        configRows.push(index);
        return;
      }
    }
    
    // Check for 2-column configuration  
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim().toLowerCase();
      
      if (key === 'teaser' && (value.includes('content-left') || value.includes('image-left'))) {
        layoutConfig = value.includes('content-left') ? 'content-left' : 'image-left';
        configRows.push(index);
        return;
      }
      
      if (key.includes('layout') || key.includes('direction')) {
        if (value.includes('content-left') || value.includes('text-left')) {
          layoutConfig = 'content-left';
        } else if (value.includes('image-left') || value.includes('photo-left')) {
          layoutConfig = 'image-left';
        }
        configRows.push(index);
        return;
      }
    }
    
    // This is a content row
    contentRows.push(row);
  });

  // Extract image and content from content rows (2-column approach)
  let imageElement = null;
  let contentElements = [];

  if (contentRows.length > 0) {
    // Handle 2-column layout like cards block
    contentRows.forEach(row => {
      const cells = [...row.children];
      
      if (cells.length >= 2) {
        // 2-column layout: determine which column has image vs content
        const leftCell = cells[0];
        const rightCell = cells[1];
        
        const leftHasImage = leftCell.querySelector('picture, img');
        const rightHasImage = rightCell.querySelector('picture, img');
        
        if (leftHasImage && !imageElement) {
          imageElement = leftHasImage;
          // Right cell is content
          contentElements.push(rightCell);
        } else if (rightHasImage && !imageElement) {
          imageElement = rightHasImage;
          // Left cell is content
          contentElements.push(leftCell);
        } else {
          // No images, treat as content
          contentElements.push(leftCell, rightCell);
        }
      } else if (cells.length === 1) {
        // Single column - determine if image or content
        const cell = cells[0];
        const img = cell.querySelector('picture, img');
        if (img && !imageElement) {
          imageElement = img;
        } else {
          contentElements.push(cell);
        }
      }
    });
  }

  // Clear block and create new structure
  block.innerHTML = '';

  // Create image container with enhanced handling
  const imageContainer = document.createElement('div');
  imageContainer.className = 'teaser-image';
  
  if (imageElement) {
    // Optimize image like cards block
    const img = imageElement.tagName === 'IMG' ? imageElement : imageElement.querySelector('img');
    if (img) {
      const originalSrc = img.src;
      const optimizedPicture = createOptimizedPicture(img.src, img.alt || 'Teaser image', false, [{ width: '750' }]);
      
      // Track the asset for insights
      if (window.trackBlockAsset) {
        window.trackBlockAsset(img, 'teaser', 0);
      } else {
        // Fallback: track when asset-insights.js loads
        setTimeout(() => {
          if (window.trackBlockAsset) {
            const newImg = optimizedPicture.querySelector('img');
            if (newImg) {
              window.trackBlockAsset(newImg, 'teaser', 0);
            }
          }
        }, 1000);
      }
      
      imageContainer.appendChild(optimizedPicture);
    }
  } else {
    // Placeholder for missing image
    imageContainer.innerHTML = `
      <div class="teaser-image-placeholder">
        <span>📷 Add image here</span>
      </div>
    `;
    imageContainer.classList.add('placeholder');
  }

  // Create content container with enhanced structure
  const contentContainer = document.createElement('div');
  contentContainer.className = 'teaser-content';
  
  // Process all content elements
  contentElements.forEach(element => {
    // Move all child elements to content container
    while (element.firstElementChild) {
      contentContainer.appendChild(element.firstElementChild);
    }
    
    // If there's remaining text content, wrap it in a paragraph
    const textContent = element.textContent.trim();
    if (textContent && !element.firstElementChild) {
      const p = document.createElement('p');
      p.textContent = textContent;
      contentContainer.appendChild(p);
    }
  });
  
  // Add fallback content if empty
  if (contentContainer.children.length === 0) {
    contentContainer.innerHTML = '<h2>Add your teaser heading here</h2><p>Add your teaser description here</p>';
  }

  // Apply layout configuration
  block.classList.add('teaser-enhanced');
  
  if (layoutConfig === 'content-left') {
    block.classList.add('content-left');
    block.appendChild(contentContainer);
    block.appendChild(imageContainer);
  } else {
    block.classList.add('image-left');
    block.appendChild(imageContainer);
    block.appendChild(contentContainer);
  }
  
  // Add data attributes for debugging
  block.setAttribute('data-layout', layoutConfig);
  block.setAttribute('data-has-image', imageElement ? 'true' : 'false');
  
  // Set up intersection observer for view tracking
  if (imageElement && window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && window.trackBlockAsset) {
          const img = entry.target.querySelector('img');
          if (img && !img.hasAttribute('data-insights-viewed')) {
            window.trackBlockAsset(img, 'teaser-view', 0);
            img.setAttribute('data-insights-viewed', 'true');
            observer.unobserve(entry.target); // Stop observing once tracked
          }
        }
      });
    }, { threshold: 0.5 }); // Track when 50% visible
    
    observer.observe(imageContainer);
  }
}
