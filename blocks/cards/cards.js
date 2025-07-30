import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row, rowIndex) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  
  // Optimize images and add asset tracking
  ul.querySelectorAll('picture > img').forEach((img, imgIndex) => {
    const originalSrc = img.src;
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    
    // Track the asset for insights
    if (window.trackBlockAsset) {
      window.trackBlockAsset(img, 'cards', imgIndex);
    } else {
      // Fallback: track when asset-insights.js loads
      setTimeout(() => {
        if (window.trackBlockAsset) {
          const newImg = optimizedPicture.querySelector('img');
          if (newImg) {
            window.trackBlockAsset(newImg, 'cards', imgIndex);
          }
        }
      }, 1000);
    }
    
    img.closest('picture').replaceWith(optimizedPicture);
  });
  
  block.textContent = '';
  block.append(ul);
  
  // Set up intersection observer for view tracking
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('img');
          if (img && !img.hasAttribute('data-insights-viewed') && window.trackBlockAsset) {
            const cardIndex = [...entry.target.parentElement.children].indexOf(entry.target);
            window.trackBlockAsset(img, 'cards-view', cardIndex);
            img.setAttribute('data-insights-viewed', 'true');
            observer.unobserve(entry.target); // Stop observing once tracked
          }
        }
      });
    }, { threshold: 0.5 }); // Track when 50% visible
    
    // Observe each card
    ul.querySelectorAll('li').forEach(li => {
      const hasImage = li.querySelector('img');
      if (hasImage) {
        observer.observe(li);
      }
    });
  }
}
