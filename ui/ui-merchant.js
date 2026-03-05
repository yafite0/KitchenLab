// =============================================================================
// 供货商弹窗渲染 - 修复版
// =============================================================================

function renderMerchantModalContent() {
    const grid = document.getElementById('modalMerchantGrid');
    const shoppingList = document.getElementById('shoppingList');
    const goldDisplay = document.getElementById('modalGoldDisplay');
    const timeBadge = document.getElementById('modalMerchantTimeBadge');

    if (!grid) return;

    let html = '';
    let shoppingHtml = '';

    for (let ingId in INGREDIENTS) {
        const ing = INGREDIENTS[ingId];
        const price = (window.merchantPrices && window.merchantPrices[ingId]) || 0;
        // 确保从window.inventory读取最新库存
        const qty = (window.inventory && window.inventory[ingId]) || 0;
        const canAfford = window.gold >= price;
        const isLowStock = qty <= GAME_CONFIG.lowStockThreshold;
        const name = getIngredientName(ingId);

        html += `<div class="merchant-item ${canAfford ? '' : 'disabled'} ${isLowStock ? 'highlight' : ''}" 
                     data-ing-id="${ingId}" data-price="${price}">
            <span>${ing.emoji}</span>
            <span>${name} x5</span>
            <span class="price">${price}💰</span>
            <span style="font-size:11px;">库存:${qty}</span>
        </div>`;

        if (isLowStock) {
            shoppingHtml += `<div class="shopping-item">
                <span>${ing.emoji}</span>
                <span>${name}</span>
                <span class="count">库存:${qty}</span>
            </div>`;
        }
    }

    grid.innerHTML = html;
    if (shoppingList) {
        shoppingList.innerHTML = shoppingHtml || '<div style="color:#aaa;padding:8px;">所有食材充足</div>';
    }
    if (goldDisplay) {
        goldDisplay.innerText = `💰 ${window.gold || 0} ${getCurrencyName()}`;
    }
    if (timeBadge) {
        timeBadge.innerText = (window.currentPricePeriod === 'morning') ? '(上午价格)' : '(下午价格)';
    }

    // 绑定购买事件 - 使用事件委托
    grid.removeEventListener('click', handleMerchantClick);
    grid.addEventListener('click', handleMerchantClick);
}

// 购买处理 - 修复版
function handleMerchantClick(e) {
    const item = e.target.closest('.merchant-item');
    if (!item) return;
    if (item.classList.contains('disabled')) return;
    
    const ingId = item.dataset.ingId;
    const price = parseInt(item.dataset.price);
    
    if (window.gold < price) return;

    // 扣钱
    window.gold -= price;
    
    // 加食材 - 确保使用window.inventory
    if (!window.inventory) window.inventory = {};
    if (!window.inventory[ingId]) window.inventory[ingId] = 0;
    window.inventory[ingId] += GAME_CONFIG.purchaseQuantity;
    
    const name = getIngredientName(ingId);
    console.log(`购买成功: ${name} +${GAME_CONFIG.purchaseQuantity}, 新库存: ${window.inventory[ingId]}`);
    
    showToast(`✅ 购买 ${GAME_CONFIG.purchaseQuantity}个 ${name} 花费 ${price} ${getCurrencyName()}`);
    
    // 保存游戏
    if (typeof window.saveGame === 'function') {
        window.saveGame();
    }
    
    // 重新渲染两个弹窗内容
    renderMerchantModalContent();
    if (typeof window.renderInventoryModalContent === 'function') {
        window.renderInventoryModalContent();
    }
    
    // 更新主界面状态
    if (typeof window.updateStatusBar === 'function') {
        window.updateStatusBar();
    }
    if (typeof window.checkShortage === 'function') {
        window.checkShortage();
    }
}

// 暴露函数
window.renderMerchantModalContent = renderMerchantModalContent;