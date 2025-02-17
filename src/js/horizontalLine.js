export function initHorizontalLine() {
    const horizontalLine = document.querySelector('.horizontal-line');
    if (horizontalLine) {
        // Reset the line's position and visibility first
        horizontalLine.style.display = 'none';
        horizontalLine.style.opacity = '0';
        horizontalLine.classList.remove('animate');

        if (window.innerWidth <= 480) {
            // Mobile initialization
            const centeredItem = document.querySelector('.centered') || document.querySelector('.list-item');
            const mainInfo = document.querySelector('.main-info');

            let targetElement = centeredItem || mainInfo;
            if (targetElement) {
                // Force a reflow to ensure accurate positioning
                void targetElement.offsetHeight;
                
                const itemRect = targetElement.getBoundingClientRect();
                const itemCenter = itemRect.top + itemRect.height / 2;
                horizontalLine.style.top = `${itemCenter}px`;
                
                // Show the line with animation
                setTimeout(() => {
                    horizontalLine.style.display = 'block';
                    horizontalLine.style.transition = 'opacity 0.3s ease';
                    horizontalLine.style.opacity = '1';
                    horizontalLine.classList.add('animate');
                }, 100);
            }
        } else {
            // Desktop initialization
            horizontalLine.style.display = 'block';
            horizontalLine.style.opacity = '1';
            horizontalLine.classList.add('animate');
        }
    }
}