// =============================================================================
// 库存系统 - 修复版
// =============================================================================

// 库存数据 - 直接挂载到window
window.inventory = window.inventory || {};

// 初始化库存（如果为空则给默认值）
function initInventory() {
    // 确保window.inventory存在
    if (!window.inventory) window.inventory = {};
    
    // 如果从存档加载后 inventory 为空对象，则设置默认值
    if (Object.keys(window.inventory).length === 0) {
        window.inventory = {
            tomato: 20, 
            egg: 50, 
            potato: 15, 
            beef: 5, 
            cucumber: 10,
            flour: 10, 
            shrimp: 5, 
            corn: 10, 
            chicken: 5, 
            onion: 15,
            cheese: 8, 
            rice: 8, 
            riceNoodle: 6
        };
    }
    
    // 确保所有食材都有值（防止存档部分缺失）
    const defaultStock = {
        tomato: 20, 
        egg: 50, 
        potato: 15, 
        beef: 5, 
        cucumber: 10,
        flour: 10, 
        shrimp: 5, 
        corn: 10, 
        chicken: 5, 
        onion: 15,
        cheese: 8, 
        rice: 8, 
        riceNoodle: 6
    };
    
    for (let ingId in defaultStock) {
        if (window.inventory[ingId] === undefined || window.inventory[ingId] === null) {
            window.inventory[ingId] = defaultStock[ingId];
        }
    }
    
    console.log('库存初始化完成:', window.inventory);
}

// 检查某种食材是否足够
function hasEnough(ingId, requiredUnits) {
    return (window.inventory[ingId] || 0) >= requiredUnits;
}

// 消耗食材
function consumeIngredient(ingId, amount) {
    if (!window.inventory[ingId]) window.inventory[ingId] = 0;
    window.inventory[ingId] -= amount;
    if (window.inventory[ingId] < 0) window.inventory[ingId] = 0;
}

// 添加食材
function addIngredient(ingId, amount) {
    if (!window.inventory[ingId]) window.inventory[ingId] = 0;
    window.inventory[ingId] += amount;
    console.log(`添加食材: ${ingId} +${amount}, 现在: ${window.inventory[ingId]}`);
}

// 计算预估接客量（根据实际库存）
function calculateEstimateCustomers() {
    let totalMeals = 0;
    for (let ingId in INGREDIENTS) {
        totalMeals += window.inventory[ingId] || 0;
    }
    // 修复：更合理的计算方式（平均每道菜用3个食材）
    return Math.floor(totalMeals / 5);
}

// 检查某个菜品的食材是否足够
function checkRecipeIngredients(recipe) {
    if (!recipe || !recipe.main) return false;
    
    for (let item of recipe.main) {
        const required = item.target;
        const stdWeight = ITEM_WEIGHT[item.ingId] || 100;
        const requiredUnits = Math.ceil(required / stdWeight);
        if ((window.inventory[item.ingId] || 0) < requiredUnits) {
            return false;
        }
    }
    return true;
}

// 消耗某个菜品的食材
function consumeRecipeIngredients(recipe) {
    if (!recipe || !recipe.main) return;
    
    for (let item of recipe.main) {
        const required = item.target;
        const stdWeight = ITEM_WEIGHT[item.ingId] || 100;
        const requiredUnits = Math.ceil(required / stdWeight);
        window.inventory[item.ingId] = (window.inventory[item.ingId] || 0) - requiredUnits;
        if (window.inventory[item.ingId] < 0) window.inventory[item.ingId] = 0;
    }
    
    console.log('消耗食材后库存:', window.inventory);
}

// 暴露到全局
window.initInventory = initInventory;
window.hasEnough = hasEnough;
window.consumeIngredient = consumeIngredient;
window.addIngredient = addIngredient;
window.calculateEstimateCustomers = calculateEstimateCustomers;
window.checkRecipeIngredients = checkRecipeIngredients;
window.consumeRecipeIngredients = consumeRecipeIngredients;