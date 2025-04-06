document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel
    const carousel = document.querySelector('.carousel');
    const cards = Array.from(document.querySelectorAll('.card'));
    const serviceLines = document.querySelectorAll('.service-line');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    
    // Variables
    let currentIndex = 5; // Start with "Presentation Design" card
    const totalCards = cards.length;
    let startX, moveX;
    let isDragging = false;
    let autoSlideInterval;
    
    // Set up initial positions for all cards
    function initCarousel() {
        // Generate 6 indicators instead of one for each card
        for (let i = 0; i < 6; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.dataset.index = i * Math.floor(totalCards / 6);
            indicatorsContainer.appendChild(indicator);
        }
        
        // Set initial active indicator
        updateIndicators();
        
        // Position all cards
        updateCarousel();
        
        // Start auto-slide
        startAutoSlide();
    }
    
    // Start automatic sliding
    function startAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
        
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        }, 2500); // Auto-slide every 2.5 seconds
    }
    
    // Reset auto-slide timer (for when user interacts)
    function resetAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
        startAutoSlide();
    }
    
    // Calculate card positions for 3D carousel effect
    function updateCarousel() {
        // Remove all active and visible classes from cards
        cards.forEach(card => {
            card.classList.remove('active');
            card.classList.remove('visible');
        });
        
        // Calculate which cards should be visible (the current card and one on each side)
        const visibleIndices = [
            (currentIndex - 1 + totalCards) % totalCards,
            currentIndex,
            (currentIndex + 1) % totalCards
        ];
        
        // Position each card with 3D effect
        cards.forEach((card, index) => {
            const isVisible = visibleIndices.includes(index);
            if (isVisible) {
                card.classList.add('visible');
            }
            
            if (index === currentIndex) {
                card.classList.add('active');
            }
            
            const offset = (index - currentIndex + totalCards) % totalCards;
            // Adjust offset to ensure cards loop around (show closest path)
            let adjustedOffset = offset;
            if (offset > totalCards / 2) adjustedOffset = offset - totalCards;
            
            // Z-positioning based on distance from active card
            let zIndex = 10 - Math.abs(adjustedOffset);
            if (adjustedOffset === 0) zIndex = 20;
            
            // Calculate rotation and position
            const rotateY = adjustedOffset * -15; // More pronounced rotation
            const translateZ = -Math.abs(adjustedOffset) * 50; // Cards further away move back in Z space
            let translateX = adjustedOffset * 220; // Horizontal spacing based on card width
            
            // Apply transformations
            card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
            card.style.zIndex = zIndex;
        });
        
        // Update active service line
        updateServiceLine();
        
        // Update indicators
        updateIndicators();
    }
    
    // Update active service line based on current card
    function updateServiceLine() {
        serviceLines.forEach(line => line.classList.remove('active'));
        
        // Determine which service line is active based on current card index
        if (currentIndex < 5) {
            serviceLines[0].classList.add('active');
        } else if (currentIndex < 10) {
            serviceLines[1].classList.add('active');
        } else {
            serviceLines[2].classList.add('active');
        }
    }
    
    // Update indicators
    function updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator) => {
            indicator.classList.remove('active');
            const indicatorIndex = parseInt(indicator.dataset.index);
            const nextIndicatorIndex = parseInt(indicators[indicators.length - 1].dataset.index);
            
            // Check if current card index falls within this indicator's range
            const isActive = currentIndex >= indicatorIndex && 
                (currentIndex < parseInt(indicator.nextElementSibling?.dataset.index) || 
                 (currentIndex >= indicatorIndex && indicatorIndex === nextIndicatorIndex));
            
            if (isActive) {
                indicator.classList.add('active');
            }
        });
    }
    
    // Service line click event
    serviceLines.forEach(line => {
        line.addEventListener('click', () => {
            currentIndex = parseInt(line.dataset.startIndex);
            updateCarousel();
            resetAutoSlide();
        });
    });
    
    // Indicator click events
    indicatorsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('indicator')) {
            currentIndex = parseInt(e.target.dataset.index);
            updateCarousel();
            resetAutoSlide();
        }
    });
    
    // Touch and drag functionality
    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('touchstart', dragStart, { passive: false });
    
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: false });
    
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
    
    function dragStart(e) {
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        carousel.style.transition = 'none';
        
        if (e.type === 'touchstart') {
            e.preventDefault(); // Prevent page scrolling
        }
        
        // Stop auto-slide while dragging
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    function dragMove(e) {
        if (!isDragging) return;
        
        moveX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const diff = moveX - startX;
        
        if (e.type === 'touchmove') {
            e.preventDefault(); // Prevent page scrolling
        }
        
        // Move cards slightly based on drag
        cards.forEach((card, index) => {
            const offset = (index - currentIndex + totalCards) % totalCards;
            // Adjust offset to ensure cards loop around
            let adjustedOffset = offset;
            if (offset > totalCards / 2) adjustedOffset = offset - totalCards;
            
            const translateX = adjustedOffset * 220 + diff * 0.5;
            const translateZ = -Math.abs(adjustedOffset) * 50;
            const rotateY = adjustedOffset * -15;
            
            card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
        });
    }
    
    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        carousel.style.transition = 'transform 0.8s ease';
        
        if (moveX) {
            const diff = moveX - startX;
            if (diff > 50) {
                // Swipe right
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            } else if (diff < -50) {
                // Swipe left
                currentIndex = (currentIndex + 1) % totalCards;
            }
        }
        
        updateCarousel();
        moveX = null;
        
        // Restart auto slide
        startAutoSlide();
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
            resetAutoSlide();
        }
    });
    
    // Card click events
    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            // Only handle click if it's not part of a drag
            if (!moveX) {
                if (index !== currentIndex) {
                    currentIndex = index;
                    updateCarousel();
                    resetAutoSlide();
                }
            }
        });
    });
    
    // Handle touch events on mobile browsers that might interfere with swiping
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle window resize to keep carousel properly positioned
    window.addEventListener('resize', () => {
        updateCarousel();
    });
    
    // Initialize carousel
    initCarousel();
    
    // Update on window load to ensure all elements are properly sized
    window.addEventListener('load', updateCarousel);
});