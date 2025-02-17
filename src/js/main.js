import { projects } from '../data/projects.js';
import { initHorizontalLine } from './horizontalLine.js';

// Configuration
const itemCount = projects.length;
const virtualItemCount = itemCount * 3;
const visibleItems = 9;

// Initialize all DOM-dependent functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const scrollContent = document.getElementById("scrollContent");
  const container = document.querySelector(".scroll-container");
  const centerImage = document.createElement('video');

  // Setup center image
  centerImage.id = 'centerImage';
  centerImage.autoplay = true;
  centerImage.loop = true;
  centerImage.muted = true;
  centerImage.playsInline = true;
  centerImage.controls = false;
  centerImage.style.cursor = 'pointer';
  centerImage.style.display = 'none';
  centerImage.setAttribute('playsinline', ''); // Add explicit playsinline attribute
  centerImage.setAttribute('webkit-playsinline', ''); // Add Safari-specific attribute

  // Add event listeners for Safari
  centerImage.addEventListener('loadedmetadata', () => {
    centerImage.play().catch(e => console.log('Playback failed:', e));
  });

  centerImage.addEventListener('timeupdate', () => {
    if (centerImage.currentTime >= centerImage.duration - 0.1) {
      centerImage.currentTime = 0;
    }
  });

  document.querySelector('.image-container').appendChild(centerImage);

  // Add click event listener to centerImage
  centerImage.addEventListener('click', () => {
    const centeredItem = findCenteredItem();
    if (centeredItem) {
      const index = Array.from(document.querySelectorAll('.list-item')).indexOf(centeredItem) % itemCount;
      window.location.href = `src/project.html?id=${index}`;
    }
  });

  // Create and append all virtual items
  function createVirtualItems() {
    scrollContent.innerHTML = "";
    for (let i = 0; i < virtualItemCount; i++) {
      const index = i % itemCount;
      const div = document.createElement("div");
      div.className = "list-item";
      div.style.animationDelay = `${i * 0.1}s`;
      div.dataset.videoSrc = `/${projects[index].thumbnail}`;

      const text = document.createElement("div");
      text.className = "list-item-text";
      text.textContent = projects[index].title;

      div.appendChild(text);
      scrollContent.appendChild(div);

      // Add hover and click events for project navigation and preloading
      let preloadTimeout;
      div.addEventListener('mouseenter', () => {
        preloadTimeout = setTimeout(() => {
          const projectData = projects[index];
          if (projectData && projectData.videoId) {
            const preloadScript = document.createElement('script');
            preloadScript.src = `https://player.vimeo.com/video/${projectData.videoId}/config`;
            preloadScript.async = true;
            document.body.appendChild(preloadScript);
            preloadScript.onload = () => document.body.removeChild(preloadScript);
          }
        }, 150);
      });

      div.addEventListener('mouseleave', () => {
        if (preloadTimeout) {
          clearTimeout(preloadTimeout);
        }
      });

      // Add click event to navigate to project page
      div.addEventListener('click', () => {
        window.location.href = `src/project.html?id=${index}`;
      });
    }
  }

  // Function to find the centered item
  function findCenteredItem() {
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    const items = container.querySelectorAll(".list-item");
    let closestItem = null;
    let minDistance = Infinity;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(containerCenter - itemCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestItem = item;
      }
    });

    return closestItem;
  }

  // Function to update item heights
  function updateItemHeights() {
    const newContainerHeight = container.clientHeight;
    const newItemHeight = Math.floor(newContainerHeight / visibleItems);

    const items = container.querySelectorAll('.list-item');
    items.forEach(item => {
      item.style.height = `${newItemHeight}px`;
      item.style.minHeight = `${newItemHeight}px`;
    });
  }

  // Function to update centered item
  function updateCenteredItem() {
    const centeredItem = findCenteredItem();
    if (centeredItem && !centeredItem.classList.contains('centered')) {
      document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('centered');
      });
      centeredItem.classList.add('centered');
      centerImage.src = centeredItem.dataset.videoSrc;
      centerImage.style.display = "block";
    }
  }

  // Initialize content and calculate dimensions
  function initializeContent() {
    createVirtualItems();

    // Calculate item height based on container height and visible items
    const containerHeight = container.clientHeight;
    const itemHeight = Math.floor(containerHeight / visibleItems);
    const totalRealHeight = itemHeight * itemCount;

    // Apply calculated height to items
    const items = container.querySelectorAll('.list-item');
    items.forEach(item => {
      item.style.height = `${itemHeight}px`;
      item.style.minHeight = `${itemHeight}px`;
    });

    // Find the first project's element and center it
    const firstProjectIndex = itemCount; // Use middle set of items
    const firstProjectElement = container.querySelectorAll('.list-item')[firstProjectIndex];

    if (firstProjectElement) {
      // Add centered class to the first project
      document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('centered');
      });
      firstProjectElement.classList.add('centered');

      // Set the scroll position to center this element
      const elementOffset = firstProjectElement.offsetTop;
      const scrollPosition = elementOffset - (containerHeight - itemHeight) / 2;
      container.scrollTop = scrollPosition;

      // Update the center image
      centerImage.src = firstProjectElement.dataset.videoSrc;
      centerImage.style.display = "block";
    }

    // Initialize horizontal line
    initHorizontalLine();

    // Updated mobile optimization settings
    if (window.innerWidth <= 480) {
      container.style.scrollSnapType = 'y proximity';
      document.querySelectorAll('.list-item').forEach(item => {
        item.style.scrollSnapAlign = 'center';
      });
    }
    
    // Enhanced mobile scroll settings
    container.style.scrollBehavior = 'smooth';
    container.style.overscrollBehavior = 'none';
    container.style.webkitOverflowScrolling = 'touch';
    container.style.willChange = 'scroll-position';
    container.style.backfaceVisibility = 'hidden';
    
    // Additional mobile optimizations
    container.style.touchAction = 'pan-y';  // Changed from 'pan-y pinch-zoom'
    container.style.position = 'relative';  // Ensure proper stacking context
    container.style.zIndex = '1';          // Prevent z-index issues
    
    // Disable pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
  }

  // Add event listeners
  window.addEventListener('resize', () => {
    updateItemHeights();
    initHorizontalLine();
  });

  // Add these variables at the top of the DOMContentLoaded callback
  let lastScrollTop = 0;
  let scrollTimeout = null;

  // Modified scroll event handler with improved mobile handling
  container.addEventListener("scroll", () => {
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemHeight = Math.floor(containerHeight / visibleItems);
    const totalRealHeight = itemHeight * itemCount;
    
    // Clear any pending scroll timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Shorter debounce time for mobile
    const debounceTime = window.innerWidth <= 480 ? 20 : 50;

    scrollTimeout = setTimeout(() => {
      const currentSet = Math.floor(scrollTop / totalRealHeight);
      
      if (!container.isAdjusting && (currentSet === 0 || currentSet >= 2)) {
        container.isAdjusting = true;
        
        const scrollingDown = scrollTop > lastScrollTop;
        const targetPosition = totalRealHeight + (scrollTop % totalRealHeight);

        // Use RAF for smoother transitions
        requestAnimationFrame(() => {
          // Temporarily disable smooth scrolling during adjustment
          container.style.scrollBehavior = 'auto';
          container.scrollTop = targetPosition;
          
          // Re-enable smooth scrolling after a very short delay
          setTimeout(() => {
            container.isAdjusting = false;
            container.style.scrollBehavior = 'smooth';
          }, 10);
        });
      }
      
      lastScrollTop = scrollTop;
    }, debounceTime);

    updateCenteredItem();
  });

  // Improved touch handling
  let touchStartY = 0;
  let touchStartScroll = 0;
  let isMomentumScrolling = false;
  
  container.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartScroll = container.scrollTop;
    isMomentumScrolling = false;
    container.isAdjusting = false;
    
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (isMomentumScrolling) return;
    const touchDelta = touchStartY - e.touches[0].clientY;
    if (Math.abs(touchDelta) > 5) {
      container.isAdjusting = false;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isMomentumScrolling = true;
    setTimeout(() => {
      isMomentumScrolling = false;
    }, 100);
  }, { passive: true });

  // Modify the wheel event handler for better mobile support
  container.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) >= 100 && !container.isScrolling) {
      e.preventDefault();
      container.isScrolling = true;
      
      const scrollAmount = e.deltaY * 0.8;
      const targetScroll = container.scrollTop + scrollAmount;

      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });

      // Reset the scrolling flag after animation
      setTimeout(() => {
        container.isScrolling = false;
      }, 200);
    }
  }, { passive: false });

  // Wait for a small delay to ensure proper layout calculation
  setTimeout(() => {
    initializeContent();
    updateCenteredItem();
  }, window.innerWidth <= 480 ? 500 : 0); // Add delay for mobile devices
});