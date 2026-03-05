// =============================================================================
// 主界面渲染 - 完整版
// =============================================================================

// 渲染菜品菜单
function renderMenu() {
    const menuList = document.getElementById('menuList');
    const menuListMobile = document.getElementById('menuListMobile');
    if (!menuList && !menuListMobile) return;

    let html = '';
    RECIPES.forEach(r => {
        const selectedClass = (window.selectedDishId === r.id) ? 'selected' : '';
        html += `<div class="menu-item ${selectedClass}" data-id="${r.id}">${r.emoji} ${getDishName(r)}</div>`;
    });

    if (menuList) menuList.innerHTML = html;
    if (menuListMobile) menuListMobile.innerHTML = html;

    document.querySelectorAll('.menu-item').forEach(el => {
        el.removeEventListener('click', handleMenuClick);
        el.addEventListener('click', handleMenuClick);
    });
}

// 菜单点击处理
function handleMenuClick(e) {
    const id = e.currentTarget.dataset.id;
    window.selectedDishId = id;
    const recipe = findRecipe(window.selectedDishId);
    setMainAmountsRandom(recipe);
    resetSaltToMid();
    renderMenu();
    renderIngredientSliders();
    renderRecipeList();
    checkShortage();
}

// 渲染配方列表
function renderRecipeList() {
    const recipe = findRecipe(window.selectedDishId);
    if (!recipe) return;

    const unlocked = window.unlockedRecipes[recipe.id];
    let lockClass = 'locked';
    let detail = '???';
    let unlockHint = '';

    if (unlocked === 'precise') {
        lockClass = 'unlocked precise';
        unlockHint = '【精确配方】';
        const mains = recipe.main.map(m => `${INGREDIENTS[m.ingId].emoji} ${m.target}g`).join(' · ');
        const total = recipe.main.reduce((a, i) => a + i.target, 0);
        const salt = (total * (recipe.saltRange[0] + recipe.saltRange[1]) / 2).toFixed(1);
        detail = `${mains} · 🧂 ${salt}g`;
    } else if (unlocked === 'standard' || unlocked === true) {
        lockClass = 'unlocked standard';
        unlockHint = '【标准配方】';
        const mains = recipe.main.map(m => `${INGREDIENTS[m.ingId].emoji} ${m.target}g`).join(' · ');
        const total = recipe.main.reduce((a, i) => a + i.target, 0);
        const salt = (total * (recipe.saltRange[0] + recipe.saltRange[1]) / 2).toFixed(1);
        detail = `${mains} · 🧂 ${salt}g`;
    } else {
        lockClass = 'locked';
        unlockHint = '【需80分解锁】';
    }

    const html = `<div class="recipe-item ${lockClass}" data-id="${recipe.id}">
        <span class="recipe-emoji">${recipe.emoji}</span>
        <span class="recipe-detail">${unlockHint} ${detail}</span>
    </div>`;

    const recipeList = document.getElementById('recipeList');
    const recipeListMobile = document.getElementById('recipeListMobile');
    if (recipeList) recipeList.innerHTML = html;
    if (recipeListMobile) recipeListMobile.innerHTML = html;

    document.querySelectorAll('.recipe-item.unlocked').forEach(el => {
        el.removeEventListener('click', handleRecipeClick);
        el.addEventListener('click', handleRecipeClick);
    });
}

// 配方点击处理
function handleRecipeClick(e) {
    const recipeId = e.currentTarget.dataset.id;
    const recipe = findRecipe(recipeId);
    if (!recipe) return;
    
    const unlocked = window.unlockedRecipes[recipe.id];
    
    if (unlocked === 'precise') {
        // 精确配方
        setPreciseRecipe(recipe);
    } else if (unlocked === 'standard' || unlocked === true) {
        // 标准配方
        setStandardRecipe(recipe);
    } else {
        // 未解锁 - 设置为目标值（便于查看）
        recipe.main.forEach(item => {
            window.currentMainAmounts[item.ingId] = item.target;
        });
    }
    
    // 重置盐到中间值
    resetSaltToMid();
    
    renderIngredientSliders();
    updateSaltSlider();
}

// 渲染调料滑块
function renderIngredientSliders() {
    const recipe = findRecipe(window.selectedDishId);
    if (!recipe) return;

    const container = document.getElementById('ingredientSliders');
    if (!container) return;

    let html = '';
    recipe.main.forEach(item => {
        const ing = INGREDIENTS[item.ingId];
        const amount = window.currentMainAmounts[item.ingId] || 0;
        const min = item.target * 0.5;
        const max = item.target * 2.0;
        html += `
            <div class="ingredient-row">
                <div class="ingr-emoji">${ing.emoji}</div>
                <div class="slider-box">
                    <div class="slider-label">
                        <span>${getIngredientName(item.ingId)} <span class="range-hint">(${Math.round(min)}-${Math.round(max)}g)</span></span>
                        <span><span class="current-hint">当前</span> <span id="val_${item.ingId}">${amount.toFixed(1)}</span></span>
                    </div>
                    <input type="range" id="slider_${item.ingId}" min="${min}" max="${max}" value="${amount}" step="1">
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    recipe.main.forEach(item => {
        const slider = document.getElementById(`slider_${item.ingId}`);
        if (slider) {
            slider.removeEventListener('input', handleSliderInput);
            slider.addEventListener('input', handleSliderInput);
        }
    });

    const saltNameEl = document.getElementById('saltName');
    if (saltNameEl) saltNameEl.innerText = getIngredientName('salt');
}

// 滑块输入处理
function handleSliderInput(e) {
    const ingId = e.target.id.replace('slider_', '');
    window.currentMainAmounts[ingId] = parseFloat(e.target.value);
    const valEl = document.getElementById(`val_${ingId}`);
    if (valEl) valEl.innerText = window.currentMainAmounts[ingId].toFixed(1);
    updateSaltSlider();
    checkShortage();
}

// 更新盐滑块 - 修复跳动问题
function updateSaltSlider() {
    const recipe = findRecipe(window.selectedDishId);
    if (!recipe) return;
    
    const saltSlider = document.getElementById('saltSlider');
    if (!saltSlider) return;
    
    // 保存当前盐值相对于范围的比例
    const oldMin = parseFloat(saltSlider.min) || 0;
    const oldMax = parseFloat(saltSlider.max) || 20;
    let percentage = 0.5; // 默认中间值
    
    if (oldMax > oldMin) {
        percentage = (window.currentSalt - oldMin) / (oldMax - oldMin);
        percentage = Math.max(0, Math.min(1, percentage)); // 限制在0-1之间
    }
    
    // 计算新范围
    const total = window.calcTotalMainWeight(recipe);
    const { min, max } = getSaltMinMax(recipe, total);
    const buffer = 0.5;
    const newMin = Math.max(0, min - buffer);
    const newMax = max + buffer;
    
    // 设置新范围
    saltSlider.min = newMin;
    saltSlider.max = newMax;
    
    // 按之前保存的比例计算新值
    window.currentSalt = newMin + percentage * (newMax - newMin);
    
    // 确保在范围内
    if (window.currentSalt < newMin) window.currentSalt = newMin;
    if (window.currentSalt > newMax) window.currentSalt = newMax;
    
    saltSlider.value = window.currentSalt;
    
    const saltValueEl = document.getElementById('saltValueDisplay');
    if (saltValueEl) saltValueEl.innerText = window.currentSalt.toFixed(1);
    
    const saltRangeEl = document.getElementById('saltRangeHint');
    if (saltRangeEl) saltRangeEl.innerText = `(${min.toFixed(1)}-${max.toFixed(1)})`;
    
    const totalWeightEl = document.getElementById('totalMainWeight');
    if (totalWeightEl) totalWeightEl.innerText = `食材总重: ${total}g`;
}

// 检查当前菜品是否缺货
function checkShortage() {
    const recipe = findRecipe(window.selectedDishId);
    if (!recipe) return { ok: true, msg: '' };

    let shortages = [];
    for (let item of recipe.main) {
        const required = item.target;
        const stdWeight = ITEM_WEIGHT[item.ingId] || 100;
        const requiredUnits = Math.ceil(required / stdWeight);
        const available = (window.inventory && window.inventory[item.ingId]) || 0;
        if (available < requiredUnits) {
            shortages.push(`${getIngredientName(item.ingId)} 缺 ${requiredUnits - available}个`);
        }
    }

    const warningDiv = document.getElementById('shortageWarning');
    if (shortages.length > 0) {
        if (warningDiv) warningDiv.innerText = '⚠️ 食材不足：' + shortages.join('，');
        return { ok: false, msg: shortages.join('，') };
    } else {
        if (warningDiv) warningDiv.innerText = '';
        return { ok: true, msg: '' };
    }
}

// 更新顶部状态栏
function updateStatusBar() {
    const { hour, minute } = getCurrentTime();
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const timeDisplay = document.getElementById('timeDisplay');
    const timeDisplayMobile = document.getElementById('timeDisplayMobile');
    if (timeDisplay) timeDisplay.innerText = timeStr;
    if (timeDisplayMobile) timeDisplayMobile.innerText = timeStr;

    const open = isBusinessHours();
    const statusText = open ? getText(LOCALE_KEYS.BUSINESS_OPEN) : getText(LOCALE_KEYS.BUSINESS_CLOSED);
    const statusClass = open ? 'open' : '';

    const businessStatus = document.getElementById('businessStatus');
    const businessStatusMobile = document.getElementById('businessStatusMobile');
    
    if (businessStatus) {
        businessStatus.innerText = statusText;
        businessStatus.className = 'business-status ' + statusClass;
    }
    if (businessStatusMobile) {
        businessStatusMobile.innerText = statusText;
        businessStatusMobile.className = 'business-status ' + statusClass;
    }

    const currencyText = `💰 ${window.gold || 0} ${getCurrencyName()}`;
    const currencyDisplay = document.getElementById('currencyDisplay');
    const currencyDisplayMobile = document.getElementById('currencyDisplayMobile');
    if (currencyDisplay) currencyDisplay.innerText = currencyText;
    if (currencyDisplayMobile) currencyDisplayMobile.innerText = currencyText;
}

// 更新客人队列显示
function updateQueueDisplay() {
    const count = window.customerQueue ? window.customerQueue.length : 0;
    const queueCount = document.getElementById('queueCount');
    const queueCountMobile = document.getElementById('queueCountMobile');
    if (queueCount) queueCount.innerText = count;
    if (queueCountMobile) queueCountMobile.innerText = count;
}

// 清空当前客人显示
function clearGuestDisplay() {
    window.currentGuest = null;
    
    const elements = {
        emoji: ['guestEmoji', 'guestEmojiMobile'],
        want: ['guestWant', 'guestWantMobile'],
        dish: ['guestOrderDish', 'guestOrderDishMobile']
    };
    
    elements.emoji.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '😶';
    });
    
    elements.want.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = getText(LOCALE_KEYS.WAITING_GUEST);
    });
    
    elements.dish.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '—';
    });
}

// 显示自动消失提示 - 顶部显示
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.style.display = 'block';
    toast.innerText = message;
    toast.style.animation = 'none';
    toast.offsetHeight; // 强制重绘
    toast.style.animation = 'slideDown 0.3s ease';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, GAME_CONFIG.toastDuration || 1000);
}

// 暴露函数到全局
window.renderMenu = renderMenu;
window.renderIngredientSliders = renderIngredientSliders;
window.renderRecipeList = renderRecipeList;
window.updateStatusBar = updateStatusBar;
window.updateQueueDisplay = updateQueueDisplay;
window.clearGuestDisplay = clearGuestDisplay;
window.showToast = showToast;
window.updateSaltSlider = updateSaltSlider;
window.checkShortage = checkShortage;