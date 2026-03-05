// =============================================================================
// 客人系统 - 优化版
// =============================================================================

window.customerQueue = window.customerQueue || [];
let guestTimeout = null;
let spawnInterval = null;

// 生成一个随机客人
function generateRandomGuest() {
    const idx = Math.floor(Math.random() * RECIPES.length);
    const dish = RECIPES[idx];
    return {
        dishId: dish.id
    };
}

// 生成一批客人
function generateCustomerBatch(count) {
    const batch = [];
    for (let i = 0; i < count; i++) {
        batch.push(generateRandomGuest());
    }
    return batch;
}

// 初始化客人队列
function initCustomerQueue() {
    const lastLogin = localStorage.getItem(SAVE_KEYS.lastLoginTime);
    const now = Date.now();
    
    const { hour, minute } = getCurrentTime();
    const openHour = GAME_CONFIG.businessHours.start;
    let accumulated = 0;
    
    if (hour >= openHour) {
        accumulated = (hour - openHour) * 60 + minute;
    } else {
        accumulated = 0;
    }
    
    const baseCount = Math.min(
        Math.floor(accumulated / GAME_CONFIG.customerSpawn.intervalMinutes), 
        GAME_CONFIG.customerSpawn.maxQueueSize
    );
    
    if (lastLogin) {
        const minutesOffline = (now - parseInt(lastLogin)) / (1000 * 60);
        const offlineCount = Math.min(
            Math.floor(minutesOffline / GAME_CONFIG.customerSpawn.intervalMinutes), 
            GAME_CONFIG.customerSpawn.maxQueueSize - baseCount
        );
        const total = Math.min(baseCount + offlineCount, GAME_CONFIG.customerSpawn.maxQueueSize);
        window.customerQueue = generateCustomerBatch(total);
    } else {
        window.customerQueue = generateCustomerBatch(Math.max(baseCount, 3));
    }
    
    localStorage.setItem(SAVE_KEYS.lastLoginTime, now.toString());
    
    // 确保updateQueueDisplay存在
    if (typeof window.updateQueueDisplay === 'function') {
        window.updateQueueDisplay();
    }
}

// 取下一个客人
function takeNextCustomer() {
    if (!window.customerQueue || window.customerQueue.length === 0) return null;
    const next = window.customerQueue.shift();
    if (typeof window.updateQueueDisplay === 'function') {
        window.updateQueueDisplay();
    }
    return next;
}

// 添加一个客人
function addCustomer(guest) {
    if (!window.customerQueue) window.customerQueue = [];
    if (window.customerQueue.length < GAME_CONFIG.customerSpawn.maxQueueSize) {
        window.customerQueue.push(guest);
        if (typeof window.updateQueueDisplay === 'function') {
            window.updateQueueDisplay();
        }
    }
}

// 启动自动生成客人定时器
function startSpawnTimer() {
    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = setInterval(() => {
        if (!window.customerQueue) window.customerQueue = [];
        if (window.customerQueue.length < GAME_CONFIG.customerSpawn.maxQueueSize) {
            window.customerQueue.push(generateRandomGuest());
            if (typeof window.updateQueueDisplay === 'function') {
                window.updateQueueDisplay();
            }
            if (typeof window.saveGame === 'function') {
                window.saveGame();
            }
        }
    }, GAME_CONFIG.customerSpawn.intervalMinutes * 60 * 1000);
}

// 停止定时器
function stopSpawnTimer() {
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }
}

// 获取队列
function getCustomerQueue() {
    return window.customerQueue || [];
}

// 暴露到全局
window.generateRandomGuest = generateRandomGuest;
window.initCustomerQueue = initCustomerQueue;
window.takeNextCustomer = takeNextCustomer;
window.addCustomer = addCustomer;
window.startSpawnTimer = startSpawnTimer;
window.stopSpawnTimer = stopSpawnTimer;
window.getCustomerQueue = getCustomerQueue;