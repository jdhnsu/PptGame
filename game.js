// 定义门的数组，每个门对象包含位置、尺寸和图片信息
let doors = [
    {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        image: null,
        src: 'images/door.png',
        id: 1
    },
    {
        x: 300,
        y: 400,
        width: 100,
        height: 100,
        image: null,
        src: 'images/door.png',
        id: 2
    },
    {
        x: 800,
        y: 100,
        width: 100,
        height: 100,
        image: null,
        src: 'images/door.png',
        id: 3
    }
];

// 动画配置
const animationConfig = {
    idle: {
        prefix: 'images/01_run_00ready/skeleton-01_run_00ready_',
        count: 11,
        pad: 2,
        speed: 0, // 极速播放（每帧更新）
        step: 2   // 每次跳过1帧（即播放帧 0, 2, 4...），总耗时约 0.1秒
    },
    run: {
        prefix: 'images/01_run_01start/skeleton-01_run_01start_',
        count: 19,
        pad: 2,
        speed: 3, // 跑步动画速度保持较快
        step: 1
    }
};

// 定义玩家人物
let players = [
    {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        state: 'static', // 'static', 'buffering', or 'run'
        frameIndex: 0,
        tickCount: 0,
        // ticksPerFrame 属性移除，改为从 animationConfig 获取
        animations: {
            idle: [],
            run: []
        }
    }
];

// 键盘状态对象，用于跟踪按键状态
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    f: false,
};

// 移动速度（像素/帧）
const moveSpeed = 5;

// 游戏循环相关变量
let gameLoopId = null;
let lastTime = 0;

// 加载所有门图片
function loadDoorImages() {
    let loadedCount = 0;
    const totalDoors = doors.length;
    
    doors.forEach(door => {
        door.image = new Image();
        door.image.src = door.src;
        door.image.onload = function() {
            loadedCount++;
            // 当所有门都加载完成时，开始绘制游戏
            if (loadedCount === totalDoors) {
                checkAllLoaded();
            }
        };
    });
}

// 辅助函数：生成带前导零的数字字符串
function padNumber(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// 加载玩家动画图片
function loadPlayerImages() {
    let loadedCount = 0;
    let totalImages = 0;
    
    // 计算总共需要加载的图片数量
    players.forEach(player => {
        totalImages += animationConfig.idle.count + animationConfig.run.count;
    });

    players.forEach(player => {
        // 加载待机动画
        for (let i = 0; i < animationConfig.idle.count; i++) {
            const img = new Image();
            img.src = `${animationConfig.idle.prefix}${padNumber(i, animationConfig.idle.pad)}.png`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) checkAllLoaded();
            };
            player.animations.idle.push(img);
        }
        
        // 加载奔跑动画
        for (let i = 0; i < animationConfig.run.count; i++) {
            const img = new Image();
            img.src = `${animationConfig.run.prefix}${padNumber(i, animationConfig.run.pad)}.png`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) checkAllLoaded();
            };
            player.animations.run.push(img);
        }
    });
}

// 检查所有资源是否加载完成
let resourcesLoaded = {
    doors: false,
    players: false
};

function checkAllLoaded() {
    // 简单起见，我们假设只要有回调触发就是加载中，
    // 实际项目中可能需要更严谨的计数器
    // 这里我们简单地直接调用绘制，因为绘制函数会检查 image.complete
    drawGame();
}

// 更新玩家位置和动画状态
function updatePlayerPosition() {
    players.forEach(player => {
        let isMoving = false;
        
        // 根据按键状态更新玩家位置
        if (keys.ArrowUp) {
            player.y -= moveSpeed;
            isMoving = true;
        }
        if (keys.ArrowDown) {
            player.y += moveSpeed;
            isMoving = true;
        }
        if (keys.ArrowLeft) {
            player.x -= moveSpeed;
            isMoving = true;
        }
        if (keys.ArrowRight) {
            player.x += moveSpeed;
            isMoving = true;
        }
        if (keys.f) {
            alert('你点击了F键！');
            keys.f = false;
            drawGame();
        }
        
        // 更新动画状态
        if (isMoving) {
            if (player.state === 'static') {
                // 从静止开始移动，进入缓冲状态
                player.state = 'buffering';
                player.frameIndex = 0;
                player.tickCount = 0;
            } else if (player.state === 'buffering') {
                // 缓冲动画播放
                player.tickCount++;
                const config = animationConfig['idle'];
                if (player.tickCount > config.speed) {
                    player.tickCount = 0;
                    player.frameIndex += config.step;
                    // 如果缓冲动画播放完毕，切换到跑步状态
                    if (player.frameIndex >= config.count) {
                        player.state = 'run';
                        player.frameIndex = 0;
                    }
                }
            } else if (player.state === 'run') {
                // 跑步状态循环播放
                player.tickCount++;
                const config = animationConfig['run'];
                if (player.tickCount > config.speed) {
                    player.tickCount = 0;
                    const maxFrames = config.count;
                    player.frameIndex = (player.frameIndex + config.step) % maxFrames;
                }
            }
        } else {
            // 停止移动，立即切换回静止状态
            player.state = 'static';
            player.frameIndex = 0;
            player.tickCount = 0;
        }
        
        // 边界检测，确保玩家不会移出画布
        const canvas = document.getElementById('viewport');
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.width / dpr;
        const cssHeight = canvas.height / dpr;
        
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.width > cssWidth) player.x = cssWidth - player.width;
        if (player.y + player.height > cssHeight) player.y = cssHeight - player.height;
    });
}

// 绘制游戏场景
function drawGame() {
    const canvas = document.getElementById('viewport');
    const ctx = canvas.getContext('2d');
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制所有门
    doors.forEach(door => {
        if (door.image && door.image.complete) {
            ctx.drawImage(door.image, door.x, door.y, door.width, door.height);
        }
    });
    
    // 绘制所有玩家
    players.forEach(player => {
        let currentAnim = null;
        let currentIndex = player.frameIndex;
        
        if (player.state === 'static') {
            // 静止状态使用 idle 动画的第一帧
            currentAnim = player.animations['idle'];
            currentIndex = 0;
        } else if (player.state === 'buffering') {
            // 缓冲状态使用 idle 动画
            currentAnim = player.animations['idle'];
        } else if (player.state === 'run') {
            // 跑步状态使用 run 动画
            currentAnim = player.animations['run'];
        }

        if (currentAnim && currentAnim.length > 0) {
            const img = currentAnim[currentIndex];
            if (img && img.complete) {
                ctx.drawImage(img, player.x, player.y, player.width, player.height);
            }
        }
    });
}

// 游戏主循环
function gameLoop(timestamp) {
    // 计算时间差（可选，用于平滑动画）
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // 更新游戏状态
    updatePlayerPosition();
    
    // 重绘游戏画面
    drawGame();
    
    // 继续游戏循环
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 开始游戏循环
function startGameLoop() {
    if (!gameLoopId) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// 停止游戏循环
function stopGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
}

// 键盘按下事件处理
function handleKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            if (!keys[event.key]) {
                keys[event.key] = true;
                startGameLoop();
            }
        } else if (event.key === 'f' || event.key === 'F') {
            keys.f = true;
            startGameLoop();
        }
        event.preventDefault();
    }

// 键盘释放事件处理
function handleKeyUp(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
        event.preventDefault();
    }
}

// 初始化游戏
function initGame() {
    loadDoorImages();
    loadPlayerImages();
    
    // 添加点击事件监听器，用户可以点击门
    const canvas = document.getElementById('viewport');
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 检查点击是否在任何一个门的区域内
        doors.forEach(door => {
            if (x >= door.x && x <= door.x + door.width && 
                y >= door.y && y <= door.y + door.height) {
                alert(`你点击了第${door.id}个门！`);
                // 这里可以添加针对不同门的特定逻辑
            }
        });
    });
    
    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // 启动游戏循环
    startGameLoop();
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', function() {
    // 确保Canvas已经调整好尺寸
    resizeCanvas();
    // 初始化游戏
    initGame();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    stopGameLoop();
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
});