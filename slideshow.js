
/* Particle System Class Removed */

const slideData = {
    1: { count: 7, path: 'images/door-one/slide-', ext: '.PNG' },
    2: { count: 9, path: 'images/door-two/slide-', ext: '.PNG' },
    3: { count: 13, path: 'images/door-three/slide-', ext: '.PNG' }
};

let currentDoorId = null;
let currentSlideIndex = 0;
let isPlaying = true;
let slideInterval;
let slides = []; // Array of image elements

const overlay = document.getElementById('slideshow-overlay');
const container = document.getElementById('slides-container');
const loader = document.getElementById('loader');
const playBtn = document.getElementById('play-pause-btn');

// Initialize controls
const closeBtn = document.getElementById('close-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

closeBtn.addEventListener('click', closeSlideshow);
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);
playBtn.addEventListener('click', togglePlay);

// Add Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.isSlideshowActive) return;

    switch(e.key) {
        case 'ArrowRight':
            nextSlide();
            break;
        case 'ArrowLeft':
            prevSlide();
            break;
        case 'Escape':
            closeSlideshow();
            break;
        case ' ': // Spacebar for play/pause
            e.preventDefault(); // Prevent scrolling
            togglePlay();
            break;
    }
});

function openSlideshow(doorId) {
    if (!slideData[doorId]) return;
    
    window.isSlideshowActive = true;

    // Trigger Flash Effect
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('active');
    // Force reflow
    void flash.offsetWidth; 
    requestAnimationFrame(() => {
        flash.classList.remove('active');
    });

    currentDoorId = doorId;
    currentSlideIndex = 0;
    slides = [];
    container.innerHTML = ''; // Clear previous slides
    overlay.classList.add('active');
    loader.style.display = 'block';
    
    // Start Particles
    // particleSystem.init();

    // Optional: Play audio
    const audio = document.getElementById('bg-music');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play failed (user interaction needed first?)", e));
    }

    loadSlides(doorId);
}

function closeSlideshow() {
    window.isSlideshowActive = false;
    overlay.classList.remove('active');
    stopSlideShow();
    // particleSystem.stop();
    
    const audio = document.getElementById('bg-music');
    if (audio) audio.pause();
    
    // Resume game loop if needed (exposed from game.js)
    if (window.startGameLoop) window.startGameLoop();
}

function loadSlides(doorId) {
    const data = slideData[doorId];
    let loadedCount = 0;
    const total = data.count;

    // Create image elements for all slides
    for (let i = 1; i <= total; i++) {
        const img = new Image();
        img.className = 'slide';
        // Handle potential file naming differences if needed. 
        // Assuming standard format from LS: slide-1.PNG, slide-2.PNG...
        img.src = `${data.path}${i}${data.ext}`;
        
        img.onload = () => {
            loadedCount++;
            if (loadedCount === total) {
                startSlideShow();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load slide ${i}`);
            img.dataset.error = "true"; // Mark for removal
            img.style.display = "none";
            loadedCount++; // Continue anyway
            if (loadedCount === total) startSlideShow();
        };
        
        container.appendChild(img);
        slides.push(img);
    }
}

function startSlideShow() {
    // Filter out failed slides
    slides = slides.filter(slide => {
        if (slide.dataset.error === "true") {
            if (slide.parentNode) slide.parentNode.removeChild(slide);
            return false;
        }
        return true;
    });

    if (slides.length === 0) {
        alert("No slides found for this door.");
        closeSlideshow();
        return;
    }

    loader.style.display = 'none';
    isPlaying = true;
    updatePlayButton();
    showSlide(0);
    startInterval();
}

function startInterval() {
    stopSlideShow(); // Clear existing
    if (isPlaying) {
        slideInterval = setInterval(nextSlide, 3000); // 3 seconds per slide (includes transition time)
    }
}

function stopSlideShow() {
    if (slideInterval) clearInterval(slideInterval);
}

function togglePlay() {
    isPlaying = !isPlaying;
    updatePlayButton();
    if (isPlaying) {
        startInterval();
    } else {
        stopSlideShow();
    }
}

function updatePlayButton() {
    playBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

function showSlide(index) {
    // Wrap around
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    currentSlideIndex = index;

    // Remove active class from all
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        // Reset transform for inactive slides to prevent stacking context issues or performance drain
        slide.style.transform = 'scale(1.0) translateZ(0)';
    });
    
    // Add active class to current
    if (slides[currentSlideIndex]) {
        const slide = slides[currentSlideIndex];
        slide.classList.add('active');
        // Let CSS handle the active state transform (scale 1.05 + translateZ)
        slide.style.transform = ''; 
    }
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
    // Reset interval to avoid immediate skip if manually clicked
    if (isPlaying) startInterval(); 
}

function prevSlide() {
    showSlide(currentSlideIndex - 1);
    if (isPlaying) startInterval();
}

// Expose openSlideshow globally so game.js can call it
window.openSlideshow = openSlideshow;

// Mouse Parallax Effect for Active Slide
document.addEventListener('mousemove', (e) => {
    if (!window.isSlideshowActive) return;
    
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;

    // Calculate mouse position relative to center ( -1 to 1 )
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    // Subtle tilt effect
    const rotateX = y * -2; // max 2 degrees
    const rotateY = x * 2;
    
    // Apply transform (maintaining the active scale/translateZ)
    // Note: This overrides the CSS transition slightly for interaction, so we need to be careful.
    // However, CSS has `transition: transform` which might fight with JS.
    // Ideally, we apply this to the CONTAINER or a wrapper to avoid conflict with the zoom animation.
    
    const container = document.getElementById('slides-container');
    container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
