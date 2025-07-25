import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero Block - Document-Based Authoring
 * Structure: [hero] + [background image] + [content rows]
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const allRows = [...block.children];
  
  // Filter out the "hero" identifier row
  const contentRows = allRows.filter(row => {
    const firstCell = row.children[0];
    return firstCell && firstCell.textContent.trim().toLowerCase() !== 'hero';
  });

  if (contentRows.length === 0) {
    return; // No content to process
  }

  // Extract background image and text content
  let backgroundImage = null;
  const textContent = [];

  contentRows.forEach(row => {
    const cells = [...row.children];
    
    if (cells.length >= 2) {
      // 2-column layout: check both columns for image and content
      const leftCell = cells[0];
      const rightCell = cells[1];
      
      const leftImage = leftCell.querySelector('img');
      const rightImage = rightCell.querySelector('img');
      
      if (leftImage && !backgroundImage) {
        backgroundImage = leftImage;
        // Right cell has text content
        if (rightCell.textContent.trim()) {
          textContent.push(rightCell);
        }
      } else if (rightImage && !backgroundImage) {
        backgroundImage = rightImage;
        // Left cell has text content
        if (leftCell.textContent.trim()) {
          textContent.push(leftCell);
        }
      } else {
        // No images, both cells are text content
        textContent.push(leftCell, rightCell);
      }
    } else {
      // Single column
      const cell = cells[0];
      const img = cell.querySelector('img');
      
      if (img && !backgroundImage) {
        backgroundImage = img;
      } else if (cell.textContent.trim()) {
        textContent.push(cell);
      }
    }
  });

  // Clear the block
  block.innerHTML = '';

  // Create background image
  if (backgroundImage) {
    const picture = createOptimizedPicture(
      backgroundImage.src, 
      backgroundImage.alt || 'Hero background', 
      false, 
      [{ width: '1920' }]
    );
    block.appendChild(picture);
  }

  // Create content container
  if (textContent.length > 0) {
    const contentDiv = document.createElement('div');
    
    textContent.forEach(element => {
      while (element.firstElementChild) {
        contentDiv.appendChild(element.firstElementChild);
      }
      
      // Handle remaining text content
      const text = element.textContent.trim();
      if (text && !element.firstElementChild) {
        const p = document.createElement('p');
        p.textContent = text;
        contentDiv.appendChild(p);
      }
    });
    
    // Ensure there's at least a heading if content exists
    if (contentDiv.children.length > 0 && !contentDiv.querySelector('h1, h2, h3, h4, h5, h6')) {
      const firstElement = contentDiv.firstElementChild;
      if (firstElement && firstElement.tagName === 'P') {
        const h1 = document.createElement('h1');
        h1.textContent = firstElement.textContent;
        contentDiv.replaceChild(h1, firstElement);
      }
    }
    
    block.appendChild(contentDiv);
  }

  // Add fallback content if no text content found
  if (textContent.length === 0) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.innerHTML = '<h1>Add your hero headline here</h1><p>Add your hero description here</p>';
    block.appendChild(fallbackDiv);
  }
}
