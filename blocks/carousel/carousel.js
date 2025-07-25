/**
 * Enhanced Carousel Block for Document-Based Authoring
 * Optimized for Google Docs content structure
 * Features: Touch/swipe support, auto-play, keyboard navigation, accessibility
 */

import { moveInstrumentation } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  // Read carousel configuration from Universal Editor
  const config = readBlockConfig(block);
  
  // Enhanced configuration settings with document-friendly defaults  
  const settings = {
    autoplay: config.autoplay === 'true' || config.autoplay === true || false, // default false for accessibility
    interval: parseInt(config.interval) || parseInt(config.delay) || 5,
    showDots: config.showdots !== 'false' && config.showdots !== false, // default true
    showArrows: config.showarrows !== 'false' && config.showarrows !== false, // default true
    loop: config.loop !== 'false' && config.loop !== false, // default true
    variant: config.variant || config.style || '',
    title: config.title || config.heading || '',
    slidesPerView: parseInt(config.slidesperView) || parseInt(config.slides) || 1,
    autoHeight: config.autoheight === 'true' || config.autoheight === true || false
  };

  // Enhanced slide detection for document-based authoring
  const allRows = [...block.children];
  
  // First pass: look for configuration in various formats
  allRows.forEach(row => {
    const cells = [...row.children];
    
    // Single cell configuration (common in Google Docs)
    if (cells.length === 1) {
      const text = cells[0].textContent.trim().toLowerCase();
      
      // Parse configuration from single cells
      if (text.includes('autoplay:') || text.includes('auto-play:')) {
        const match = text.match(/auto-?play:\s*(true|false|on|off)/i);
        if (match) {
          settings.autoplay = match[1].toLowerCase() === 'true' || match[1].toLowerCase() === 'on';
        }
      }
      
      if (text.includes('interval:') || text.includes('delay:')) {
        const match = text.match(/(?:interval|delay):\s*(\d+)/i);
        if (match) {
          settings.interval = parseInt(match[1]);
        }
      }
      
      if (text.includes('style:') || text.includes('variant:')) {
        const match = text.match(/(?:style|variant):\s*(\w+)/i);
        if (match) {
          settings.variant = match[1];
        }
      }
    }
  });
  
  // Enhanced slide detection with better content recognition
  const slideRows = allRows.filter(row => {
    // Check if this is a carousel slide component (Universal Editor)
    const hasSlideResource = row.querySelector('[data-aue-resource*="carousel-slide"]') || 
                            (row.hasAttribute('data-aue-resource') && row.getAttribute('data-aue-resource').includes('carousel-slide'));
    
    if (hasSlideResource) {
      return true;
    }
    
    const cells = [...row.children];
    
    // Skip configuration rows
    if (cells.length === 1) {
      const text = cells[0].textContent.trim().toLowerCase();
      const configPatterns = [
        /auto-?play:\s*(true|false|on|off)/i,
        /(?:interval|delay):\s*\d+/i,
        /(?:style|variant):\s*\w+/i,
        /(?:title|heading):\s*.+/i,
        /(?:show-?dots|dots):\s*(true|false)/i,
        /(?:show-?arrows|arrows):\s*(true|false)/i,
        /loop:\s*(true|false)/i
      ];
      
      if (configPatterns.some(pattern => pattern.test(text))) {
        return false;
      }
      
      // Also exclude simple configuration keywords
      const configKeywords = ['autoplay', 'auto-play', 'interval', 'delay', 'style', 'variant', 'title', 'heading'];
      if (configKeywords.some(keyword => text === keyword || text.includes(`${keyword}:`))) {
        return false;
      }
    }
    
    // Skip traditional configuration rows (key-value pairs)
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim().toLowerCase();
      
      const configKeys = ['title', 'autoplay', 'auto-play', 'interval', 'delay', 'showdots', 'show-dots', 'dots', 'showarrows', 'show-arrows', 'arrows', 'loop', 'variant', 'style'];
      
      if (configKeys.some(configKey => key.includes(configKey)) || 
          value === 'true' || value === 'false' || 
          /^\d+$/.test(value) ||
          ['default', 'cards', 'hero', 'testimonials'].includes(value)) {
        return false;
      }
    }
    
    // Enhanced content detection for slides
    const hasImage = row.querySelector('img');
    const hasVideo = row.querySelector('video');
    const hasHeading = row.querySelector('h1, h2, h3, h4, h5, h6');
    const hasLink = row.querySelector('a');
    const hasFormattedText = row.querySelector('strong, em, b, i, p');
    const hasMultipleElements = row.querySelectorAll('*').length > 3;
    const hasSubstantialText = row.textContent.trim().length > 30;
    
    // Consider it a slide if it has rich content
    return hasImage || hasVideo || hasHeading || hasLink || hasFormattedText || hasMultipleElements || hasSubstantialText;
  });
  
  // Enhanced slide validation and creation
  if (slideRows.length === 0) {
    console.warn('Carousel: No slides found. Creating default placeholder slide.');
    
    // Create a more helpful default slide for document authoring
    const defaultSlide = document.createElement('div');
    defaultSlide.innerHTML = `
      <div>
        <h3>Slide 1 - Add your content here</h3>
        <p>Replace this text with your slide content. You can add images, headings, and links.</p>
        <p><em>Tip: Each row in your document becomes a slide. Add images and text in the same row for image slides.</em></p>
      </div>
    `;
    defaultSlide.setAttribute('data-aue-resource', 'urn:aemconnection:/content/slides/default');
    defaultSlide.setAttribute('data-aue-type', 'component');
    defaultSlide.setAttribute('data-aue-filter', 'carousel-slide');
    slideRows.push(defaultSlide);
  }
  
  // Clear the block and create carousel structure
  block.innerHTML = '';
  
  // Add Emirates theme styling with enhanced classes
  block.classList.add('emirates-carousel', 'enhanced-carousel');
  if (settings.variant) {
    block.classList.add(`carousel-${settings.variant}`);
  }
  
  // Add title if configured
  if (settings.title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'carousel-title';
    titleElement.textContent = settings.title;
    titleElement.setAttribute('id', 'carousel-title');
    block.appendChild(titleElement);
  }
  
  const container = document.createElement('div');
  container.className = 'carousel-container';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  
  // Enhanced slide creation with better content parsing
  slideRows.forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.className = 'carousel-slide emirates-slide enhanced-slide';
    slideElement.setAttribute('aria-label', `Slide ${index + 1} of ${slideRows.length}`);
    slideElement.setAttribute('id', `slide-${index}`);
    slideElement.setAttribute('data-slide-index', index);
    
    // Preserve Universal Editor attributes from original slide
    moveInstrumentation(slide, slideElement);
    
    // Enhanced content processing for document-based authoring
    const slideContent = slide.cloneNode(true);
    
    // Extract and categorize content elements
    const images = slideContent.querySelectorAll('img');
    const videos = slideContent.querySelectorAll('video');
    const headings = slideContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = slideContent.querySelectorAll('p');
    const links = slideContent.querySelectorAll('a');
    
    // Determine slide type and structure
    const hasMedia = images.length > 0 || videos.length > 0;
    const hasText = headings.length > 0 || paragraphs.length > 0 || slideContent.textContent.trim().length > 10;
    
    if (hasMedia && hasText) {
      // Media + text slide (most common)
      slideElement.classList.add('media-text-slide');
      
      // Add media first
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        if (!img.alt) {
          img.alt = `Slide ${index + 1} image`;
        }
        img.classList.add('slide-image');
      });
      
      videos.forEach(video => {
        video.classList.add('slide-video');
        video.setAttribute('controls', '');
      });
      
      // Create content overlay for text content
      if (hasText) {
        const textContent = document.createElement('div');
        textContent.className = 'slide-content overlay';
        
        // Move text elements to overlay
        headings.forEach(heading => {
          textContent.appendChild(heading.cloneNode(true));
        });
        
        paragraphs.forEach(p => {
          if (!p.querySelector('img, video')) { // Don't move paragraphs that contain media
            textContent.appendChild(p.cloneNode(true));
          }
        });
        
        // Handle CTAs
        links.forEach(link => {
          const linkText = link.textContent.trim().toLowerCase();
          const ctaKeywords = ['learn more', 'read more', 'discover', 'explore', 'book now', 'view', 'see more', 'shop now', 'get started'];
          
          if (ctaKeywords.some(keyword => linkText.includes(keyword))) {
            link.classList.add('slide-cta');
            textContent.appendChild(link.cloneNode(true));
          }
        });
        
        slideElement.appendChild(slideContent);
        slideElement.appendChild(textContent);
      } else {
        slideElement.appendChild(slideContent);
      }
      
    } else if (hasMedia) {
      // Media-only slide
      slideElement.classList.add('media-slide');
      slideElement.appendChild(slideContent);
      
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        if (!img.alt) {
          img.alt = `Slide ${index + 1} image`;
        }
        img.classList.add('slide-image');
      });
      
    } else {
      // Text-only slide
      slideElement.classList.add('text-slide');
      const textContainer = document.createElement('div');
      textContainer.className = 'slide-content text-only';
      textContainer.appendChild(slideContent);
      slideElement.appendChild(textContainer);
    }
    
    // Add accessibility improvements
    slideElement.setAttribute('role', 'tabpanel');
    slideElement.setAttribute('aria-roledescription', 'slide');
    
    if (settings.title) {
      slideElement.setAttribute('aria-labelledby', 'carousel-title');
    }
    
    wrapper.appendChild(slideElement);
  });
  
  // Create navigation arrows (only if enabled and multiple slides)
  let prevButton, nextButton;
  if (settings.showArrows && slideRows.length > 1) {
    prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav prev emirates-nav enhanced-nav';
    prevButton.innerHTML = '<span aria-hidden="true">❮</span>';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.type = 'button';
    
    nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav next emirates-nav enhanced-nav';
    nextButton.innerHTML = '<span aria-hidden="true">❯</span>';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.type = 'button';
  }
  
  // Create dots/indicators (only if enabled and multiple slides)
  let dotsContainer;
  if (settings.showDots && slideRows.length > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots emirates-dots enhanced-dots';
    dotsContainer.setAttribute('role', 'tablist');
    dotsContainer.setAttribute('aria-label', 'Carousel slide navigation');
    
    slideRows.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot emirates-dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-controls', `slide-${index}`);
      dot.setAttribute('data-slide-index', index);
      dot.type = 'button';
      
      if (index === 0) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
        dot.setAttribute('tabindex', '0');
      } else {
        dot.setAttribute('aria-selected', 'false');
        dot.setAttribute('tabindex', '-1');
      }
      
      dotsContainer.appendChild(dot);
    });
  }
  
  // Create auto-play controls (only if autoplay is enabled)
  let controlsContainer, playPauseButton;
  if (settings.autoplay && slideRows.length > 1) {
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-controls emirates-controls enhanced-controls';
    
    playPauseButton = document.createElement('button');
    playPauseButton.className = 'carousel-play-pause emirates-play-pause';
    playPauseButton.innerHTML = '<span aria-hidden="true">⏸️</span> Pause';
    playPauseButton.setAttribute('aria-label', 'Pause auto-play');
    playPauseButton.type = 'button';
    
    controlsContainer.appendChild(playPauseButton);
  }
  
  // Assemble carousel with enhanced structure
  container.appendChild(wrapper);
  if (prevButton && nextButton) {
    container.appendChild(prevButton);
    container.appendChild(nextButton);
  }
  
  block.appendChild(container);
  
  if (dotsContainer) {
    block.appendChild(dotsContainer);
  }
  
  if (controlsContainer) {
    block.appendChild(controlsContainer);
  }
  
  // Add data attributes for enhanced functionality and debugging
  block.setAttribute('data-slides-count', slideRows.length);
  block.setAttribute('data-autoplay', settings.autoplay);
  block.setAttribute('data-interval', settings.interval);
  block.setAttribute('data-variant', settings.variant || 'default');
  
  // Only set up carousel functionality if there are multiple slides
  if (slideRows.length <= 1) {
    block.classList.add('single-slide');
    return; // Exit early for single slide
  }
  
  // Carousel state
  let currentSlide = 0;
  let isAutoPlaying = settings.autoplay;
  let autoPlayInterval;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  
  // Auto-play functionality
  const startAutoPlay = () => {
    if (!isAutoPlaying || slideRows.length <= 1) return;
    
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, (settings.interval * 1000)); // Use configured interval
  };
  
  const stopAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  };
  
  // Navigation functions
  const goToSlide = (index) => {
    currentSlide = index;
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });
    
    // Update slide IDs for accessibility
    wrapper.querySelectorAll('.carousel-slide').forEach((slide, i) => {
      slide.id = `slide-${i}`;
      slide.setAttribute('aria-hidden', i !== currentSlide ? 'true' : 'false');
    });
    
    // Announce slide change to screen readers
    if (window.lastAnnouncedSlide !== currentSlide) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Slide ${currentSlide + 1} of ${slideRows.length}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
      
      window.lastAnnouncedSlide = currentSlide;
    }
  };
  
  const nextSlide = () => {
    if (currentSlide < slideRows.length - 1) {
      currentSlide++;
    } else if (settings.loop) {
      currentSlide = 0;
    }
    updateCarousel();
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      currentSlide--;
    } else if (settings.loop) {
      currentSlide = slideRows.length - 1;
    }
    updateCarousel();
  };
  
  // Update carousel display
  const updateCarousel = () => {
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;
    
    // Update dots (only if they exist)
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
        dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
      });
    }
  };

  // Event listeners (only if elements exist)
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      stopAutoPlay();
      nextSlide();
      if (isAutoPlaying) startAutoPlay();
    });
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      stopAutoPlay();
      prevSlide();
      if (isAutoPlaying) startAutoPlay();
    });
  }
  
  // Dot navigation (only if dots exist)
  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel-dot')) {
        const index = [...dotsContainer.children].indexOf(e.target);
        currentSlide = index;
        updateCarousel();
        stopAutoPlay();
        if (isAutoPlaying) startAutoPlay();
      }
    });
  }
  
  // Play/pause toggle (only if button exists)
  if (playPauseButton) {
    playPauseButton.addEventListener('click', () => {
      if (isAutoPlaying) {
        isAutoPlaying = false;
        stopAutoPlay();
        playPauseButton.textContent = 'Play';
        playPauseButton.setAttribute('aria-label', 'Start auto-play');
      } else {
        isAutoPlaying = true;
        startAutoPlay();
        playPauseButton.textContent = 'Pause';
        playPauseButton.setAttribute('aria-label', 'Pause auto-play');
      }
    });
  }
  
  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        stopAutoPlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        stopAutoPlay();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        stopAutoPlay();
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slideRows.length - 1);
        stopAutoPlay();
        break;
    }
  });
  
  // Touch/swipe support
  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
    wrapper.style.cursor = 'grabbing';
    stopAutoPlay();
  }, { passive: true });
  
  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Add visual feedback during drag
    if (Math.abs(diff) > 10) {
      wrapper.classList.add('no-transition');
      const currentOffset = -currentSlide * 100;
      const dragOffset = (diff / wrapper.offsetWidth) * 100;
      wrapper.style.transform = `translateX(${currentOffset - dragOffset}%)`;
    }
  }, { passive: true });
  
  wrapper.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    const diff = touchStartX - touchEndX;
    const threshold = 50; // Minimum swipe distance
    
    wrapper.classList.remove('no-transition');
    wrapper.style.cursor = '';
    isDragging = false;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide(); // Swipe left - next slide
      } else {
        prevSlide(); // Swipe right - previous slide
      }
    } else {
      // Snap back to current slide
      goToSlide(currentSlide);
    }
  }, { passive: true });
  
  // Mouse drag support for desktop
  let mouseDown = false;
  let startX = 0;
  
  wrapper.addEventListener('mousedown', (e) => {
    mouseDown = true;
    startX = e.clientX;
    wrapper.style.cursor = 'grabbing';
    wrapper.classList.add('grabbing');
    e.preventDefault();
  });
  
  wrapper.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 10) {
      wrapper.classList.add('no-transition');
      const currentOffset = -currentSlide * 100;
      const dragOffset = (diff / wrapper.offsetWidth) * 100;
      wrapper.style.transform = `translateX(${currentOffset - dragOffset}%)`;
    }
  });
  
  wrapper.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    
    const diff = startX - e.clientX;
    const threshold = 50;
    
    mouseDown = false;
    wrapper.style.cursor = '';
    wrapper.classList.remove('grabbing', 'no-transition');
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      stopAutoPlay();
    } else {
      goToSlide(currentSlide);
    }
  });
  
  // Pause auto-play on hover
  block.addEventListener('mouseenter', stopAutoPlay);
  block.addEventListener('mouseleave', () => {
    if (isAutoPlaying) {
      startAutoPlay();
    }
  });
  
  // Pause auto-play when tab loses focus
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else if (isAutoPlaying) {
      startAutoPlay();
    }
  });
  
  // Respect user's motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isAutoPlaying = false;
    playPauseButton.textContent = 'Play';
    playPauseButton.setAttribute('aria-label', 'Start auto-play');
  }
  
  // Initialize
  goToSlide(0);
  
  // Start auto-play if enabled and more than one slide

  if (isAutoPlaying && slideRows.length > 1) {
    startAutoPlay();
  }
  
  // Hide controls if only one slide
  if (slideRows.length <= 1) {
    if (prevButton) prevButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none';
  }
  
  // Add ARIA attributes for accessibility
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Image carousel');
  wrapper.setAttribute('aria-live', 'polite');
  
  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (isAutoPlaying && slideRows.length > 1) {
          startAutoPlay();
        }
      } else {
        stopAutoPlay();
      }
    });
  });
  
  observer.observe(block);
}
