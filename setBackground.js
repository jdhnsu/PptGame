function resizeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const canvas  = document.getElementById('viewport');
    if (!wrapper || !canvas) return;

    const rect = wrapper.getBoundingClientRect(); // 容器 CSS 像素
    const dpr  = window.devicePixelRatio || 1;

    /* 1. 先拿到我们想要的“视觉”宽高 */
    const cssW = rect.width;
    const cssH = rect.height;

    /* 2. 设置绘图缓冲区（真正像素的画布） */
    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    /* 3. 再把元素视觉尺寸锁回去，防止浏览器自己拉伸 */
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';

    /* 4. 缩放绘图坐标系，让 1 个 CSS 像素 = 1 个单位 */
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* 调试用：看数字 */
    console.table({
        cssW,
        cssH,
        realW: canvas.width,
        realH: canvas.height,
        dpr
    });
}

/* 监听 窗口变化事件 */
window.addEventListener('resize', () => {
    // 防抖：避免连续触发太频繁
    clearTimeout(window._resizeTimer);
});

/* 首次执行 */window.addEventListener('resize', () => {
    // 防抖：避免连续触发太频繁
});
resizeCanvas();