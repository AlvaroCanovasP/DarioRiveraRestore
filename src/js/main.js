import { projects } from '../data/projects.js';

// Configuration
const itemCount = projects.length;
const virtualItemCount = itemCount * 3;
const visibleItems = 9;
const animationDuration = 0.5; // Animation duration in seconds

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
  centerImage.style.display = 'none'; // Hide initially
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
    }

    // Set initial horizontal line position for mobile
    if (window.innerWidth <= 480) {
      const initialCenteredItem = findCenteredItem();
      if (initialCenteredItem) {
        const itemRect = initialCenteredItem.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const horizontalLine = document.querySelector('.horizontal-line');
        if (horizontalLine) {
          horizontalLine.style.top = `${itemCenter}px`;
        }
      }
    }
  }

  // Add event listeners
  window.addEventListener('resize', updateItemHeights);

  container.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) >= 100) {
      e.preventDefault();
      const scrollAmount = e.deltaY * 0.8;
      const targetScroll = container.scrollTop + scrollAmount;

      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, { passive: false });

  container.addEventListener("scroll", () => {
    const scrollTop = container.scrollTop;
    const totalRealHeight = Math.floor(container.clientHeight / visibleItems) * itemCount;

    if (scrollTop < totalRealHeight / 2) {
      container.scrollTop = scrollTop + totalRealHeight;
    } else if (scrollTop > totalRealHeight * 2) {
      container.scrollTop = scrollTop - totalRealHeight;
    }

    updateCenteredItem();
  });

  // Wait for a small delay to ensure proper layout calculation
  setTimeout(() => {
    initializeContent();
    updateCenteredItem();
  }, window.innerWidth <= 480 ? 500 : 0); // Add delay for mobile devices
});