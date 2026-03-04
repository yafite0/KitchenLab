// =============================================================================
// 游戏全局配置
// =============================================================================

const GAME_CONFIG = {
    // 营业时间 (10:00 - 21:00)
    businessHours: { start: 10, end: 21 },

    // 班次时间
    shifts: {
        morning: { start: 10, end: 16 },   // 早班 10-16点
        evening: { start: 15, end: 21 }    // 晚班 15-21点
    },

    // 货币名称（普通/沉浸模式）
    currencyName: {
        normal: '金币',
        immersive: '哈塞盾'
    },

    // 客人刷新配置
    customerSpawn: {
        intervalMinutes: 3,        // 每3分钟刷新一个客人
        maxQueueSize: 10,          // 最大排队人数
        offlineMax: 10,            // 离线最大累积人数
        offlineThresholdMinutes: 30 // 离线超过30分钟直接给满
    },

    // 初始金币
    initialGold: 100000,

    // 每次购买数量
    purchaseQuantity: 5,

    // 低库存阈值（小于等于此值视为低库存）
    lowStockThreshold: 5,

    // 提示显示时间（毫秒）
    toastDuration: 1000,

    // 伙伴自动工作固定评分
    autoWorkScore: 80
};

// 物品标准重量（克/个）
const ITEM_WEIGHT = {
    tomato: 150,
    egg: 50,
    potato: 200,
    beef: 1000,
    cucumber: 150,
    flour: 1000,
    shrimp: 500,
    corn: 200,
    chicken: 1000,
    onion: 150,
    cheese: 200,
    rice: 1000,
    riceNoodle: 500
};

// 存档键名（localStorage用）
const SAVE_KEYS = {
    inventory: 'kitchen_inventory',
    gold: 'kitchen_gold',
    unlockedRecipes: 'kitchen_unlocked',
    dailyStatus: 'kitchen_daily',
    immersiveMode: 'kitchen_immersive',
    customerQueue: 'kitchen_customers',
    lastLoginTime: 'kitchen_last_login',
    partners: 'kitchen_partners'
};