// =============================================================================
// 存档系统 - 修复版
// =============================================================================

// 保存所有游戏状态到 localStorage
function saveGame() {
    try {
        // 确保window.inventory存在
        if (window.inventory) {
            localStorage.setItem(SAVE_KEYS.inventory, JSON.stringify(window.inventory));
        }
        
        if (window.gold !== undefined) {
            localStorage.setItem(SAVE_KEYS.gold, window.gold.toString());
        }
        
        if (window.unlockedRecipes) {
            localStorage.setItem(SAVE_KEYS.unlockedRecipes, JSON.stringify(window.unlockedRecipes));
        }
        
        if (window.dailyStatus) {
            localStorage.setItem(SAVE_KEYS.dailyStatus, JSON.stringify(window.dailyStatus));
        }
        
        if (window.immersiveMode !== undefined) {
            localStorage.setItem(SAVE_KEYS.immersiveMode, window.immersiveMode.toString());
        }
        
        if (window.customerQueue) {
            localStorage.setItem(SAVE_KEYS.customerQueue, JSON.stringify(window.customerQueue));
        }
        
        if (window.partners) {
            localStorage.setItem(SAVE_KEYS.partners, JSON.stringify(window.partners));
        }
        
        console.log('游戏保存成功', window.inventory);
    } catch (e) {
        console.warn('存档失败', e);
    }
}

// 加载游戏状态
function loadGame() {
    try {
        // 库存
        const savedInventory = localStorage.getItem(SAVE_KEYS.inventory);
        if (savedInventory) {
            window.inventory = JSON.parse(savedInventory);
            console.log('加载库存:', window.inventory);
        } else {
            window.inventory = {};
        }

        // 金币
        const savedGold = localStorage.getItem(SAVE_KEYS.gold);
        if (savedGold) {
            window.gold = parseInt(savedGold);
        } else {
            window.gold = GAME_CONFIG.initialGold;
        }

        // 解锁配方
        const savedUnlocked = localStorage.getItem(SAVE_KEYS.unlockedRecipes);
        if (savedUnlocked) {
            window.unlockedRecipes = JSON.parse(savedUnlocked);
        } else {
            window.unlockedRecipes = {};
            RECIPES.forEach(r => window.unlockedRecipes[r.id] = false);
        }

        // 每日特供状态
        const savedDaily = localStorage.getItem(SAVE_KEYS.dailyStatus);
        if (savedDaily) {
            window.dailyStatus = JSON.parse(savedDaily);
        } else {
            window.dailyStatus = { date: '', specialId: '', completed: false, streak: 0 };
        }

        // 沉浸模式
        const savedImmersive = localStorage.getItem(SAVE_KEYS.immersiveMode);
        if (savedImmersive) {
            window.immersiveMode = savedImmersive === 'true';
        } else {
            window.immersiveMode = false;
        }

        // 客人队列
        const savedQueue = localStorage.getItem(SAVE_KEYS.customerQueue);
        if (savedQueue) {
            window.customerQueue = JSON.parse(savedQueue);
        } else {
            window.customerQueue = [];
        }

        // 伙伴数据
        const savedPartners = localStorage.getItem(SAVE_KEYS.partners);
        if (savedPartners) {
            window.partners = JSON.parse(savedPartners);
        } else {
            window.partners = [];
        }
        
        console.log('游戏加载完成');
    } catch (e) {
        console.warn('读档失败，使用初始值', e);
        // 出错时设置默认值
        window.inventory = {};
        window.gold = GAME_CONFIG.initialGold;
        window.unlockedRecipes = {};
        RECIPES.forEach(r => window.unlockedRecipes[r.id] = false);
        window.dailyStatus = { date: '', specialId: '', completed: false, streak: 0 };
        window.immersiveMode = false;
        window.customerQueue = [];
        window.partners = [];
    }
}

// 暴露函数
window.saveGame = saveGame;
window.loadGame = loadGame;