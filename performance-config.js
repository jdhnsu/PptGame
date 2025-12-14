// 性能优化配置
const PerformanceConfig = {
    // 图片懒加载配置
    lazyLoading: {
        enabled: true,
        threshold: 0.1, // 10% 可见时开始加载
        rootMargin: '50px' // 提前50px开始加载
    },
    
    // 资源预加载配置
    preloading: {
        enabled: true,
        criticalImages: [
            'images/door.png',
            'images/01_run_00ready/skeleton-01_run_00ready_00.png',
            'images/01_run_01start/skeleton-01_run_01start_00.png'
        ]
    },
    
    // 缓存配置
    caching: {
        enabled: true,
        maxAge: 24 * 60 * 60 * 1000, // 24小时
        version: '1.0.0'
    },
    
    // 动画优化
    animation: {
        useRAF: true, // 使用RequestAnimationFrame
        frameRate: 60, // 目标帧率
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },
    
    // 内存管理
    memory: {
        maxImageCache: 50, // 最大缓存图片数
        cleanupInterval: 30000 // 30秒清理一次
    }
};

// 懒加载实现
class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }
    
    init() {
        if (!PerformanceConfig.lazyLoading.enabled) return;
        
        this.imageObserver = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: PerformanceConfig.lazyLoading.threshold,
                rootMargin: PerformanceConfig.lazyLoading.rootMargin
            }
        );
        
        // 观察所有需要懒加载的图片
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.imageObserver.observe(img));
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.imageObserver.unobserve(img);
            }
        });
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        img.src = src;
        img.onload = () => {
            img.classList.add('loaded');
        };
        img.onerror = () => {
            img.classList.add('error');
        };
    }
}

// 资源预加载器
class ResourcePreloader {
    constructor() {
        this.cache = new Map();
        this.init();
    }
    
    init() {
        if (!PerformanceConfig.preloading.enabled) return;
        
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 监听页面加载完成事件
        window.addEventListener('load', () => {
            this.preloadSecondaryResources();
        });
    }
    
    preloadCriticalResources() {
        const criticalResources = PerformanceConfig.preloading.criticalImages;
        criticalResources.forEach(url => this.preloadImage(url));
    }
    
    preloadSecondaryResources() {
        // 预加载游戏相关资源
        const gameResources = [
            // 门的图片
            'images/door-one/slide-1.PNG',
            'images/door-two/slide-1.PNG',
            'images/door-three/slide-1.PNG',
            // 动画帧
            'images/01_run_00ready/skeleton-01_run_00ready_00.png',
            'images/01_run_01start/skeleton-01_run_01start_00.png'
        ];
        
        gameResources.forEach(url => this.preloadImage(url));
    }
    
    preloadImage(url) {
        if (this.cache.has(url)) return this.cache.get(url);
        
        const img = new Image();
        img.src = url;
        
        const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        });
        
        this.cache.set(url, loadPromise);
        return loadPromise;
    }
    
    getCachedImage(url) {
        return this.cache.get(url);
    }
}

// 内存管理器
class MemoryManager {
    constructor() {
        this.imageCache = new Map();
        this.cleanupTimer = null;
        this.init();
    }
    
    init() {
        this.startCleanupTimer();
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseCleanup();
            } else {
                this.resumeCleanup();
            }
        });
    }
    
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupImageCache();
        }, PerformanceConfig.memory.cleanupInterval);
    }
    
    pauseCleanup() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
    
    resumeCleanup() {
        if (!this.cleanupTimer) {
            this.startCleanupTimer();
        }
    }
    
    cleanupImageCache() {
        if (this.imageCache.size <= PerformanceConfig.memory.maxImageCache) return;
        
        // 清理最久未使用的图片
        const entriesToRemove = this.imageCache.size - PerformanceConfig.memory.maxImageCache;
        const iterator = this.imageCache.entries();
        
        for (let i = 0; i < entriesToRemove; i++) {
            const [key, value] = iterator.next().value;
            if (value && value.cleanup) {
                value.cleanup();
            }
            this.imageCache.delete(key);
        }
    }
    
    cacheImage(key, imageData, cleanup) {
        this.imageCache.set(key, { imageData, cleanup, timestamp: Date.now() });
    }
    
    getCachedImage(key) {
        const cached = this.imageCache.get(key);
        if (cached) {
            cached.timestamp = Date.now();
            return cached.imageData;
        }
        return null;
    }
}

// 动画优化器
class AnimationOptimizer {
    constructor() {
        this.rafId = null;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / PerformanceConfig.animation.frameRate;
        this.isRunning = false;
    }
    
    start(callback) {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = 0;
        
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            if (PerformanceConfig.animation.reduceMotion) {
                // 减少动画模式下降低帧率
                if (currentTime - this.lastFrameTime >= this.frameInterval * 2) {
                    callback(currentTime);
                    this.lastFrameTime = currentTime;
                }
            } else {
                if (currentTime - this.lastFrameTime >= this.frameInterval) {
                    callback(currentTime);
                    this.lastFrameTime = currentTime;
                }
            }
            
            this.rafId = requestAnimationFrame(animate);
        };
        
        this.rafId = requestAnimationFrame(animate);
    }
    
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

// 性能监控器
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            loadTime: 0,
            memoryUsage: 0
        };
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.init();
    }
    
    init() {
        this.measureLoadTime();
        this.startFpsMonitoring();
        this.startMemoryMonitoring();
    }
    
    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`页面加载时间: ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    }
    
    startFpsMonitoring() {
        let lastTime = performance.now();
        
        const measureFrame = (currentTime) => {
            this.frameCount++;
            
            if (currentTime - this.lastFpsUpdate >= 1000) {
                this.metrics.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsUpdate = currentTime;
                
                // 输出FPS到控制台（调试用）
                if (this.metrics.fps < 30) {
                    console.warn(`低帧率警告: ${this.metrics.fps} FPS`);
                }
            }
            
            requestAnimationFrame(measureFrame);
        };
        
        requestAnimationFrame(measureFrame);
    }
    
    startMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
                
                // 内存使用警告
                if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
                    console.warn(`高内存使用警告: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
                }
            }, 5000);
        }
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
}

// 初始化性能优化
const initPerformanceOptimization = () => {
    // 初始化各个优化器
    const lazyLoader = new LazyLoader();
    const resourcePreloader = new ResourcePreloader();
    const memoryManager = new MemoryManager();
    const animationOptimizer = new AnimationOptimizer();
    const performanceMonitor = new PerformanceMonitor();
    
    // 暴露到全局作用域供其他模块使用
    window.PerformanceOptimizers = {
        lazyLoader,
        resourcePreloader,
        memoryManager,
        animationOptimizer,
        performanceMonitor
    };
    
    console.log('性能优化系统已初始化');
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceOptimization);
} else {
    initPerformanceOptimization();
}