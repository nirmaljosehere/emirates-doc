/**
 * Simple Carousel Block - Cards-Style 2-Column Implementation
 * Each row becomes a slide: [Image] | [Content]
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Simple slide creation - each row becomes a slide (like cards block)
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  
  const slides = [];
  
  // Convert each row to a slide (exactly like cards block)
  [...block.children].forEach((row, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('id', `slide-${index}`);
    slide.setAttribute('aria-label', `Slide ${index + 1}`);
    
    // Handle 2-column rows like cards block
    const cells = [...row.children];
    
    if (cells.length >= 2) {
      // 2-column layout: [Image] | [Content]
      const imageCell = cells[0];
      const contentCell = cells[1];
      
      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'carousel-slide-image';
      while (imageCell.firstElementChild) {
        imageContainer.append(imageCell.firstElementChild);
      }
      
      // Create content container  
      const contentContainer = document.createElement('div');
      contentContainer.className = 'carousel-slide-body';
      while (contentCell.firstElementChild) {
        contentContainer.append(contentCell.firstElementChild);
      }
      
      slide.append(imageContainer, contentContainer);
      
    } else if (cells.length === 1) {
      // Single column - determine if image or content
      const cell = cells[0];
      const hasImage = cell.querySelector('picture, img');
      
      if (hasImage) {
        // Image-only slide
        const imageContainer = document.createElement('div');
        imageContainer.className = 'carousel-slide-image full-width';
        while (cell.firstElementChild) {
          imageContainer.append(cell.firstElementChild);
        }
        slide.append(imageContainer);
      } else {
        // Text-only slide
        const contentContainer = document.createElement('div');
        contentContainer.className = 'carousel-slide-body full-width';
        while (cell.firstElementChild) {
          contentContainer.append(cell.firstElementChild);
        }
        slide.append(contentContainer);
      }
    }
    
    slides.push(slide);
    wrapper.append(slide);
  });
  
  // Optimize images like cards block
  wrapper.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  
  // Clear block and add carousel structure
  block.textContent = '';
  
  // Only add carousel functionality if there are multiple slides
  if (slides.length <= 1) {
    block.append(wrapper);
    return;
  }
  
  // Add carousel container
  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.append(wrapper);
  
  // Add navigation arrows
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav prev';
  prevButton.innerHTML = '<span aria-hidden="true">‹</span>';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.type = 'button';
  
  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav next';
  nextButton.innerHTML = '<span aria-hidden="true">›</span>';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.type = 'button';
  
  container.append(prevButton, nextButton);
  
  // Add dots
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.type = 'button';
    dot.setAttribute('data-slide', index);
    
    if (index === 0) {
      dot.classList.add('active');
    }
    
    dotsContainer.append(dot);
  });
  
  block.append(container, dotsContainer);
  
  // Simple carousel functionality
  let currentSlide = 0;
  
  const updateCarousel = () => {
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
    
    // Update slide visibility for accessibility
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== currentSlide);
    });
  };
  
  const nextSlide = () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
  };
  
  const prevSlide = () => {
    currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    updateCarousel();
  };
  
  const goToSlide = (index) => {
    currentSlide = index;
    updateCarousel();
  };
  
  // Event listeners
  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);
  
  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('carousel-dot')) {
      const slideIndex = parseInt(e.target.getAttribute('data-slide'));
      goToSlide(slideIndex);
    }
  });
  
  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });
  
  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  wrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });
  
  // Initialize
  updateCarousel();
  
  // Add ARIA attributes
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Image carousel');
}
