
/* Particle System Class Removed */

const slideData = {
    1: { path: 'images/door-one/slide-', ext: '.PNG' },
    2: { path: 'images/door-two/slide-', ext: '.PNG' },
    3: { path: 'images/door-three/slide-', ext: '.PNG' }
};

let currentDoorId = null;
let currentSlideIndex = 0;
let isPlaying = true;
let slideInterval;
let slides = []; // Array of image elements
let touchStartX = 0; // 触摸起点
let touchEndX = 0;   // 触摸终点

const overlay = document.getElementById('slideshow-overlay');
const container = document.getElementById('slides-container');
const loader = document.getElementById('loader');
const playBtn = document.getElementById('play-pause-btn');

// 创建幻灯片指示器
let slideIndicator = null;
const createSlideIndicator = () => {
    if (!slideIndicator) {
        slideIndicator = document.createElement('div');
        slideIndicator.className = 'slide-indicator';
        slideIndicator.id = 'slide-indicator';
        document.body.appendChild(slideIndicator);
    }
};

const updateSlideIndicator = () => {
    if (!slideIndicator) return;
    slideIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
};

// Initialize controls
const closeBtn = document.getElementById('close-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

closeBtn.addEventListener('click', closeSlideshow);
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);
playBtn.addEventListener('click', togglePlay);

// 添加触摸滑动支持
let isSwiping = false;

overlay.addEventListener('touchstart', (e) => {
    isSwiping = true;
    touchStartX = e.touches[0].clientX;
}, false);

overlay.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
    isSwiping = false;
}, false);

const handleSwipe = () => {
    const swipeThreshold = 50; // 最小滑动距离
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 向左滑动 -> 下一张
            nextSlide();
        } else {
            // 向右滑动 -> 上一张
            prevSlide();
        }
    }
};

// 添加键盘快捷键
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

    // 触发闪白过渡效果
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
    container.innerHTML = ''; // 清空之前的幻灯片
    overlay.classList.add('active');
    loader.style.display = 'block';
    
    // 创建幻灯片指示器
    createSlideIndicator();
    
    // 显示加载动画
    loader.classList.add('loading');

    // 可选：播放背景音乐
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
    
    // Clear existing
    slides = [];
    container.innerHTML = '';
    
    let index = 1;
    
    const loadNext = () => {
        const img = new Image();
        img.className = 'slide';
        img.src = `${data.path}${index}${data.ext}`;
        
        img.onload = () => {
            container.appendChild(img);
            slides.push(img);
            index++;
            loadNext();
        };
        
        img.onerror = () => {
            // Assume end of sequence
            // Start slideshow if we have finished loading available slides
            startSlideShow();
        };
    };

    loadNext();
}

function startSlideShow() {
    // 过滤出失败的幻灯片
    slides = slides.filter(slide => {
        if (slide.dataset.error === "true") {
            if (slide.parentNode) slide.parentNode.removeChild(slide);
            return false;
        }
        return true;
    });

    if (slides.length === 0) {
        alert("未找到该门的照片。");
        closeSlideshow();
        return;
    }

    // 隐藏加载动画
    loader.style.display = 'none';
    loader.classList.remove('loading');
    
    isPlaying = true;
    updatePlayButton();
    updateSlideIndicator();
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
    playBtn.textContent = isPlaying ? '暂停' : '播放';
    // 添加视觉反馈
    playBtn.style.background = isPlaying ? 'rgba(59, 130, 246, 0.8)' : 'rgba(100, 116, 139, 0.8)';
}

function showSlide(index) {
    // 循环显示
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    currentSlideIndex = index;

    // 从所有幻灯片中移除 active 类
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        // 重置转换，防止叠层上下文问题
        slide.style.transform = 'scale(1.0) translateZ(0)';
    });
    
    // 为当前幻灯片添加 active 类
    if (slides[currentSlideIndex]) {
        const slide = slides[currentSlideIndex];
        slide.classList.add('active');
        // CSS 处理 active 状态的转换效果
        slide.style.transform = ''; 
    }
    
    // 更新指示器
    updateSlideIndicator();
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
    // 重置计时器避免手动点击时立即跳过
    if (isPlaying) {
        playBtn.textContent = '暂停'; // 更新按钮状态
        startInterval();
    }
}

function prevSlide() {
    showSlide(currentSlideIndex - 1);
    if (isPlaying) {
        playBtn.textContent = '暂停'; // 更新按钮状态
        startInterval();
    }
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
