// =============================================================================
// 供货商系统
// =============================================================================

let merchantPrices = {};
let currentPricePeriod = 'morning';

// 刷新价格（每日上午/下午波动）
function refreshMerchantPrices() {
    const period = getCurrentPeriod();
    for (let ingId in INGREDIENTS) {
        const basePrice = getIngredientBasePrice(ingId);
        const fluctuation = 0.9 + Math.random() * 0.2; // 0.9~1.1
        // 价格 = 基础价×10×波动×购买数量
        merchantPrices[ingId] = Math.round(basePrice * 10 * fluctuation * GAME_CONFIG.purchaseQuantity);
    }
    currentPricePeriod = period;
}

// 购买食材
function purchaseIngredient(ingId) {
    const price = merchantPrices[ingId];
    if (!price) return false;

    if (window.gold < price) return false;

    window.gold -= price;
    addIngredient(ingId, GAME_CONFIG.purchaseQuantity);
    saveGame();
    return true;
}

// 获取当前价格
function getMerchantPrices() {
    return merchantPrices;
}

// 获取当前时段
function getCurrentPricePeriod() {
    return currentPricePeriod;
}

// 暴露到全局
window.merchantPrices = merchantPrices;
window.currentPricePeriod = currentPricePeriod;
window.refreshMerchantPrices = refreshMerchantPrices;
window.purchaseIngredient = purchaseIngredient;
window.getMerchantPrices = getMerchantPrices;
window.getCurrentPricePeriod = getCurrentPricePeriod;