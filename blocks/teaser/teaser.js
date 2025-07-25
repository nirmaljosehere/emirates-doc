import { readBlockConfig } from '../../scripts/aem.js';

/**
 * Enhanced Teaser Block for Document-Based Authoring
 * Optimized for Google Docs content structure
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Read teaser configuration
  const config = readBlockConfig(block);
  
  // Enhanced layout configuration detection
  let layoutConfig = 'image-left'; // default
  
  const allRows = [...block.children];
  
  // Look for layout configuration in various formats
  allRows.forEach((row, index) => {
    const cells = [...row.children];
    
    // Single cell configuration (most common in Google Docs)
    if (cells.length === 1) {
      const cellText = cells[0].textContent.trim().toLowerCase();
      if (cellText.includes('content-left') || cellText.includes('text-left')) {
        layoutConfig = 'content-left';
      } else if (cellText.includes('image-left') || cellText.includes('photo-left')) {
        layoutConfig = 'image-left';
      }
    }
    
    // Two cell configuration (traditional)
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim().toLowerCase();
      
      if (key.includes('layout') || key.includes('direction')) {
        if (value.includes('content-left') || value.includes('text-left')) {
          layoutConfig = 'content-left';
        } else if (value.includes('image-left') || value.includes('photo-left')) {
          layoutConfig = 'image-left';
        }
      }
    }
  });

  // Configuration settings with enhanced defaults
  const settings = {
    layout: config['layout-direction'] || config['layout'] || layoutConfig,
    imageAlt: config['image-alt'] || config['alt'] || 'Teaser image',
    ctaText: config['cta-text'] || config['button-text'] || null,
    ctaLink: config['cta-link'] || config['button-link'] || null
  };

  // Enhanced content row filtering for document-based authoring
  const contentRows = allRows.filter(row => {
    const cells = [...row.children];
    
    // Skip configuration rows
    if (cells.length === 1) {
      const cellText = cells[0].textContent.trim().toLowerCase();
      // Configuration keywords to exclude
      const configKeywords = ['layout', 'direction', 'image-left', 'content-left', 'text-left', 'photo-left'];
      if (configKeywords.some(keyword => cellText.includes(keyword))) {
        return false;
      }
    }
    
    // Skip traditional config rows
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const configKeys = ['layout', 'direction', 'image-alt', 'alt', 'cta-text', 'button-text', 'cta-link', 'button-link'];
      if (configKeys.some(configKey => key.includes(configKey))) {
        return false;
      }
    }
    
    // Include rows with substantial content
    const hasContent = cells.some(cell => {
      const text = cell.textContent.trim();
      const hasImage = cell.querySelector('img');
      const hasLink = cell.querySelector('a');
      const hasFormatting = cell.querySelector('strong, em, b, i, h1, h2, h3, h4, h5, h6');
      
      return text.length > 10 || hasImage || hasLink || hasFormatting;
    });
    
    return hasContent;
  });

  // Enhanced content extraction with better categorization
  let imageElement = null;
  let headingElement = null;
  let descriptionElements = [];
  let ctaElement = null;

  contentRows.forEach(row => {
    const cells = [...row.children];
    cells.forEach(cell => {
      // Extract image (prioritize first image found)
      const img = cell.querySelector('img');
      if (img && !imageElement) {
        imageElement = img;
        return;
      }
      
      // Extract heading (h1-h6 tags)
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading && !headingElement) {
        headingElement = heading;
        return;
      }
      
      // Extract CTA link (standalone links or button containers)
      const link = cell.querySelector('a');
      if (link && !ctaElement) {
        const linkText = link.textContent.trim().toLowerCase();
        const ctaKeywords = ['learn more', 'read more', 'discover', 'explore', 'book now', 'view', 'see more'];
        
        // Check if it's likely a CTA based on text or if it's in a button container
        if (ctaKeywords.some(keyword => linkText.includes(keyword)) || 
            cell.classList.contains('button-container') ||
            link.classList.contains('button')) {
          ctaElement = link;
          return;
        }
      }
      
      // Extract description content (everything else with text)
      const cellText = cell.textContent.trim();
      if (cellText && !cell.querySelector('img, h1, h2, h3, h4, h5, h6')) {
        // Skip if this cell only contains a CTA that we've already identified
        if (!(link && link === ctaElement)) {
          descriptionElements.push(cell);
        }
      }
    });
  });

  // Validation and fallbacks for better authoring experience
  if (!imageElement) {
    console.warn('Teaser: No image found. Consider adding an image for better visual impact.');
  }
  
  if (!headingElement && descriptionElements.length === 0) {
    console.warn('Teaser: No content found. Please add a heading or description text.');
    // Create fallback content
    const fallbackContent = document.createElement('div');
    fallbackContent.innerHTML = '<h2>Add your teaser heading here</h2><p>Add your teaser description here</p>';
    descriptionElements.push(fallbackContent);
  }

  // Clear block and create new structure
  block.innerHTML = '';

  // Create image container with enhanced handling
  const imageContainer = document.createElement('div');
  imageContainer.className = 'teaser-image';
  
  if (imageElement) {
    // Enhance image handling
    const pictureElement = imageElement.closest('picture') || imageElement;
    imageContainer.appendChild(pictureElement.cloneNode(true));
    
    // Enhanced image attributes
    const img = imageContainer.querySelector('img');
    if (img) {
      if (!img.alt || img.alt === '') {
        img.alt = settings.imageAlt;
      }
      img.loading = 'lazy';
      
      // Add Emirates-specific image styling hints
      if (!img.classList.contains('styled')) {
        img.classList.add('teaser-img');
      }
    }
  } else {
    // Placeholder for missing image to help with authoring
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
  
  // Add heading if found
  if (headingElement) {
    const heading = headingElement.cloneNode(true);
    // Ensure it's an h2 for consistency (or preserve original level)
    if (heading.tagName !== 'H2' && !heading.classList.contains('preserve-level')) {
      const h2 = document.createElement('h2');
      h2.innerHTML = heading.innerHTML;
      h2.className = heading.className;
      contentContainer.appendChild(h2);
    } else {
      contentContainer.appendChild(heading);
    }
  }
  
  // Add description content
  const descriptionContainer = document.createElement('div');
  descriptionContainer.className = 'teaser-description';
  
  descriptionElements.forEach(element => {
    const content = element.cloneNode(true);
    // Clean up any unwanted attributes from document conversion
    if (content.removeAttribute) {
      content.removeAttribute('data-aue-resource');
      content.removeAttribute('data-aue-type');
    }
    descriptionContainer.appendChild(content);
  });
  
  if (descriptionContainer.children.length > 0) {
    contentContainer.appendChild(descriptionContainer);
  }
  
  // Add CTA if found or configured
  if (ctaElement || (settings.ctaText && settings.ctaLink)) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    if (ctaElement) {
      const cta = ctaElement.cloneNode(true);
      cta.classList.add('teaser-cta');
      buttonContainer.appendChild(cta);
    } else if (settings.ctaText && settings.ctaLink) {
      const cta = document.createElement('a');
      cta.href = settings.ctaLink;
      cta.textContent = settings.ctaText;
      cta.classList.add('teaser-cta');
      buttonContainer.appendChild(cta);
    }
    
    contentContainer.appendChild(buttonContainer);
  }

  // Apply layout configuration with enhanced classes
  block.classList.add('teaser-enhanced'); // Add marker for enhanced version
  
  if (settings.layout === 'content-left') {
    block.classList.add('content-left');
    block.appendChild(contentContainer);
    block.appendChild(imageContainer);
  } else {
    block.classList.add('image-left');
    block.appendChild(imageContainer);
    block.appendChild(contentContainer);
  }
  
  // Add data attributes for easier styling and debugging
  block.setAttribute('data-layout', settings.layout);
  block.setAttribute('data-has-image', imageElement ? 'true' : 'false');
  block.setAttribute('data-has-cta', (ctaElement || (settings.ctaText && settings.ctaLink)) ? 'true' : 'false');
}
