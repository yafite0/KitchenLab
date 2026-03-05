// =============================================================================
// 库存弹窗渲染 - 修复版
// =============================================================================

function renderInventoryModalContent() {
    const grid = document.getElementById('modalInventoryGrid');
    const estimateSpan = document.getElementById('modalEstimate');
    
    if (!grid) return;
    
    let html = '';
    let totalItems = 0;

    for (let ingId in INGREDIENTS) {
        const ing = INGREDIENTS[ingId];
        // 确保从window.inventory读取
        const qty = (window.inventory && window.inventory[ingId]) || 0;
        
        if (qty === 0) {
            // 显示为0的食材用灰色
            const stdWeight = ITEM_WEIGHT[ingId] || 100;
            const totalWeight = qty * stdWeight;
            const name = getIngredientName(ingId);
            
            html += `<div class="inventory-item" style="opacity:0.5;">
                <span>${ing.emoji}</span>
                <span>${name}</span>
                <span class="count" style="color:#ff9999;">${qty}个</span>
                <span style="font-size:12px;">≈${totalWeight}g</span>
            </div>`;
        } else {
            totalItems += qty;
            const stdWeight = ITEM_WEIGHT[ingId] || 100;
            const totalWeight = qty * stdWeight;
            const name = getIngredientName(ingId);
            
            html += `<div class="inventory-item">
                <span>${ing.emoji}</span>
                <span>${name}</span>
                <span class="count">${qty}个</span>
                <span style="font-size:12px;">≈${totalWeight}g</span>
            </div>`;
        }
    }

    grid.innerHTML = html || '<div style="color:#aaa;padding:20px;text-align:center;">仓库空空如也</div>';
    
    if (estimateSpan) {
        const estimate = window.calculateEstimateCustomers ? window.calculateEstimateCustomers() : 0;
        estimateSpan.innerText = `预估接客: ${estimate}人 | 总库存: ${totalItems}个`;
    }
    
    console.log('渲染库存:', window.inventory);
}

// 暴露函数到全局
window.renderInventoryModalContent = renderInventoryModalContent;