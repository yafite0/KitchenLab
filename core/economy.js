// =============================================================================
// 经济系统 - 金币、价格等
// =============================================================================

// 食材基础价格（人民币元/个），游戏内自动×10
const INGREDIENT_BASE_PRICE = {
    tomato: 2,
    egg: 1.5,
    potato: 2,
    beef: 40,
    cucumber: 3,
    flour: 5,
    shrimp: 30,
    corn: 3,
    chicken: 25,
    onion: 2,
    cheese: 15,
    rice: 5,
    riceNoodle: 8
};

// 获取食材基础价格
function getIngredientBasePrice(ingId) {
    return INGREDIENT_BASE_PRICE[ingId] || 5;
}

// 暴露到全局
window.getIngredientBasePrice = getIngredientBasePrice;