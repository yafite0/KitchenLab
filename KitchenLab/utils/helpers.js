// =============================================================================
// 通用辅助函数
// =============================================================================

// 驼峰转下划线（例如 "scrambledEgg" → "scrambled_egg", "riceNoodle" → "rice_noodle"）
function camelToSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// 获取本地化文本（普通模式或沉浸模式）
function getText(key) {
    // 先从普通文本获取
    let text = ZH_COMMON[key] || ZH_INGREDIENTS[key] || ZH_RECIPES[key] || ZH_UI[key] || key;
    
    // 如果开启沉浸模式且有对应沉浸文本，则替换
    if (window.immersiveMode && ZH_IMMERSIVE[key]) {
        text = ZH_IMMERSIVE[key];
    }
    return text;
}

// 根据ID查找菜品
function findRecipe(id) {
    return RECIPES.find(r => r.id === id);
}

// 获取食材的显示名称（根据沉浸模式）
function getIngredientName(ingId) {
    // 盐特殊处理
    if (ingId === 'salt') {
        return getText('salt');
    }
    // 将食材ID转为下划线形式（例如 riceNoodle -> rice_noodle）
    const snakeId = camelToSnake(ingId);
    const key = `ingredient_${snakeId}`;
    return getText(key);
}

// 获取菜品的显示名称（根据沉浸模式）
function getDishName(recipe) {
    const snakeId = camelToSnake(recipe.id);
    const key = `dish_${snakeId}`;
    return getText(key);
}

// 获取货币名称
function getCurrencyName() {
    return window.immersiveMode ? GAME_CONFIG.currencyName.immersive : GAME_CONFIG.currencyName.normal;
}

// 暴露到全局
window.camelToSnake = camelToSnake;
window.getText = getText;
window.findRecipe = findRecipe;
window.getIngredientName = getIngredientName;
window.getDishName = getDishName;
window.getCurrencyName = getCurrencyName;