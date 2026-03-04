// =============================================================================
// 游戏主入口 - 完整版
// =============================================================================

// 定义全局变量
window.selectedDishId = RECIPES[0].id;
window.currentMainAmounts = {};
window.currentSalt = 0.0;
window.unlockedRecipes = {};
window.gold = GAME_CONFIG.initialGold;
window.currentGuest = null;
window.immersiveMode = false;
window.dailyStatus = { date: '', specialId: '', completed: false, streak: 0 };
let cancelCounter = 0;
let timers = []; // 存储所有定时器ID

// 初始化解锁状态
RECIPES.forEach(r => window.unlockedRecipes[r.id] = false);

// 清理所有定时器
function clearAllTimers() {
    timers.forEach(timer => clearInterval(timer));
    timers = [];
}

// 更新今日特卖显示
function updateDailySpecialDisplay() {
    const specialRecipe = findRecipe(window.dailyStatus.specialId);
    if (specialRecipe) {
        const name = getDishName(specialRecipe);
        const specialEl = document.getElementById('dailySpecialName');
        const specialMobileEl = document.getElementById('dailySpecialNameMobile');
        if (specialEl) specialEl.innerText = name;
        if (specialMobileEl) specialMobileEl.innerText = name;
    }
}

// 渲染所有UI
function renderAllUI() {
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof renderIngredientSliders === 'function') renderIngredientSliders();
    if (typeof renderRecipeList === 'function') renderRecipeList();
    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (typeof updateQueueDisplay === 'function') updateQueueDisplay();
    if (typeof clearGuestDisplay === 'function') clearGuestDisplay();
    if (typeof checkShortage === 'function') checkShortage();
}

// 启动定时器
function startTimers() {
    // 每分钟执行
    timers.push(setInterval(() => {
        if (typeof autoWork === 'function') autoWork();
        if (typeof updateStatusBar === 'function') updateStatusBar();
    }, 60000));
    
    // 启动客人定时器
    if (typeof startSpawnTimer === 'function') {
        startSpawnTimer();
    }
}

// 初始化函数
function initGame() {
    console.log('游戏初始化...');
    
    // 清理旧定时器
    clearAllTimers();
    
    // 加载存档
    if (typeof loadGame === 'function') loadGame();
    
    // 初始化各模块
    if (typeof initInventory === 'function') initInventory();
    if (typeof initPartners === 'function') initPartners();
    if (typeof initCustomerQueue === 'function') initCustomerQueue();
    if (typeof refreshMerchantPrices === 'function') refreshMerchantPrices();

    // 今日特卖
    const today = getCurrentTime().dateStr;
    if (!window.dailyStatus.date || window.dailyStatus.date !== today) {
        window.dailyStatus = {
            date: today,
            specialId: RECIPES[Math.floor(Math.random() * RECIPES.length)].id,
            completed: false
        };
    }
    updateDailySpecialDisplay();

    // 渲染UI
    renderAllUI();
    
    // 初始化弹窗
    if (typeof initModals === 'function') initModals();
    
    // 启动定时器
    startTimers();
    
    // 绑定事件
    bindEvents();

    // 强制刷新库存显示
    console.log('当前库存:', window.inventory);
    if (typeof window.renderInventoryModalContent === 'function') {
        window.renderInventoryModalContent();
    }

    console.log('游戏初始化完成');
}

// 事件处理 - 接客
function newGuestHandler() {
    if (!isBusinessHours()) {
        showToast('现在不是营业时间');
        return;
    }
    if (!window.customerQueue || window.customerQueue.length === 0) {
        showToast('暂时没有客人排队');
        return;
    }
    const next = takeNextCustomer();
    if (next) {
        window.currentGuest = next;
        const displayName = getDishName(findRecipe(next.dishId));
        updateGuestDisplay('😀', '我想吃...', displayName);
    }
}

// 更新客人显示
function updateGuestDisplay(emoji, wantText, dishName) {
    const elements = {
        emoji: ['guestEmoji', 'guestEmojiMobile'],
        want: ['guestWant', 'guestWantMobile'],
        dish: ['guestOrderDish', 'guestOrderDishMobile']
    };
    
    elements.emoji.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = emoji;
    });
    
    elements.want.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = wantText;
    });
    
    elements.dish.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = dishName;
    });
}

// 中断客人
function cancelGuestHandler() {
    cancelCounter++;
    if (cancelCounter >= 5) {
        showCheatModal();
        cancelCounter = 0;
    } else {
        showToast('中断客人');
    }
    clearGuestDisplay();
}

// 烹饪处理
function cookHandler() {
    const recipe = findRecipe(window.selectedDishId);
    if (!recipe) return;
    
    const shortage = checkShortage();
    if (!shortage.ok) {
        showToast('食材不足，无法烹饪');
        return;
    }
    
    const amounts = window.currentMainAmounts;
    const salt = window.currentSalt;
    const scoreResult = calculateScore(recipe, amounts, salt);
    const score = scoreResult.total;
    
    // 根据分数生成反馈
    let feedback = '';
    if (score >= 98) feedback = '✨ 完美！';
    else if (score >= 95) feedback = '🌟 极品！';
    else if (score >= 90) feedback = '💫 非常完美';
    else if (score >= 80) feedback = '📖 合格';
    else if (score >= 60) feedback = '👌 还可以';
    else feedback = '😕 继续努力';
    
    // 消耗食材
    consumeRecipeIngredients(recipe);
    const earning = calculateEarning(recipe, score);
    window.gold += earning;
    
    // 更新烹饪显示
    updateCookingDisplay(recipe, feedback, score);
    
    // 生成建议
    const advice = generateAdvice(scoreResult, recipe, amounts, salt);
    const adviceEl = document.getElementById('adviceText');
    if (adviceEl) adviceEl.innerText = advice;
    
    // 解锁配方逻辑
    const currentUnlock = window.unlockedRecipes[recipe.id];
    
    if (score >= 95 && currentUnlock !== 'precise') {
        // 95分解锁精确配方
        window.unlockedRecipes[recipe.id] = 'precise';
        showToast('🎉 解锁精确配方！');
        if (typeof renderRecipeList === 'function') renderRecipeList();
        if (recipe.storyCN) {
            const storyEl = document.getElementById('storyFragment');
            if (storyEl) storyEl.innerText = '📖 ' + recipe.storyCN;
        }
    } else if (score >= 80 && (!currentUnlock || currentUnlock === false)) {
        // 80分解锁标准配方
        window.unlockedRecipes[recipe.id] = 'standard';
        showToast('📖 解锁标准配方！');
        if (typeof renderRecipeList === 'function') renderRecipeList();
        if (recipe.storyCN) {
            const storyEl = document.getElementById('storyFragment');
            if (storyEl) storyEl.innerText = '📖 ' + recipe.storyCN;
        }
    }
    
    // 处理客人反馈
    handleGuestFeedback(recipe, score, earning, feedback);
    
    if (typeof saveGame === 'function') saveGame();
    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (typeof renderIngredientSliders === 'function') renderIngredientSliders();
    if (typeof updateSaltSlider === 'function') updateSaltSlider();
    if (typeof checkShortage === 'function') checkShortage();
}

// 更新烹饪显示
function updateCookingDisplay(recipe, feedback, score) {
    const name = getDishName(recipe);
    const emoji = recipe.emoji;
    
    const elements = {
        emoji: ['dishEmoji', 'dishEmojiPC'],
        name: ['cookedDishName', 'cookedDishNamePC'],
        feedback: ['cookedFeedback', 'cookedFeedbackPC'],
        score: ['scoreDisplay', 'scoreDisplayPC']
    };
    
    elements.emoji.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = emoji;
    });
    
    elements.name.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = name;
    });
    
    elements.feedback.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = feedback;
    });
    
    elements.score.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = score;
    });
}

// 处理客人反馈
function handleGuestFeedback(recipe, score, earning, feedback) {
    if (!window.currentGuest) {
        updateGuestDisplay('😶', `练习模式 +${earning}💰`, '无客人');
        return;
    }
    
    if (recipe.id === window.currentGuest.dishId) {
        const message = `评价: ${feedback} +${earning}💰`;
        const emoji = score >= 60 ? '😁' : '😐';
        updateGuestDisplay(emoji, message, `得分 ${score}`);
    } else {
        const needMsg = `我要 ${getDishName(findRecipe(window.currentGuest.dishId))}`;
        updateGuestDisplay('😤', '我点的不是这个...', needMsg);
    }
}

// 切换沉浸模式
function toggleImmersive() {
    window.immersiveMode = !window.immersiveMode;
    if (typeof saveGame === 'function') saveGame();
    
    const text = window.immersiveMode ? '🌌 沉浸文本' : '🌍 普通文本';
    ['toggleImmersiveBtn', 'toggleImmersiveBtnMobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.innerText = text;
            btn.classList.toggle('immersive', window.immersiveMode);
        }
    });
    
    // 刷新所有显示
    if (typeof renderMenu === 'function') renderMenu();
    if (window.currentGuest) {
        const gr = findRecipe(window.currentGuest.dishId);
        const displayName = getDishName(gr);
        ['guestOrderDish', 'guestOrderDishMobile'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = displayName;
        });
    }
    
    updateDailySpecialDisplay();
    
    const cr = findRecipe(window.selectedDishId);
    if (cr) {
        const name = getDishName(cr);
        ['cookedDishName', 'cookedDishNamePC'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = name;
        });
    }
    
    if (typeof renderIngredientSliders === 'function') renderIngredientSliders();
    if (typeof updateStatusBar === 'function') updateStatusBar();
}

// 作弊弹窗
function showCheatModal() {
    const modal = document.getElementById('inventoryModal');
    const modalContent = modal.querySelector('.modal-content');
    const originalHeader = modalContent.querySelector('.modal-header').innerHTML;
    const originalGrid = modalContent.querySelector('.inventory-grid').innerHTML;
    
    modalContent.querySelector('.modal-header').innerHTML = '<span>⚙️ 调试菜单</span><div class="modal-close" id="closeCheatModal">关闭</div>';
    modalContent.querySelector('.inventory-grid').innerHTML = `
        <div style="grid-column: span 2; text-align: center; padding: 20px;">
            <div class="btn" id="forceBusiness" style="background:#2d6a4f; color:white; margin-bottom:10px;">强制营业 (客人+10)</div>
            <div class="btn" id="clearAllData" style="background:#9d4e4e; color:white; margin-bottom:10px;">清除所有存档</div>
            <div class="btn" id="unlockAllRecipes" style="background:#ffbc6e; color:black; margin-bottom:10px;">解锁所有配方</div>
            <div class="btn" id="addGold" style="background:#ffbc6e; color:black; margin-bottom:10px;">+10000金币</div>
            <div class="btn" id="closeCheatBtn" style="background:#947b58;">返回</div>
        </div>
    `;
    modal.style.display = 'flex';
    
    document.getElementById('closeCheatModal').addEventListener('click', () => {
        modal.style.display = 'none';
        modalContent.querySelector('.modal-header').innerHTML = originalHeader;
        modalContent.querySelector('.inventory-grid').innerHTML = originalGrid;
        document.getElementById('closeInventoryModal').addEventListener('click', closeInventoryModal);
    });
    
    document.getElementById('closeCheatBtn').addEventListener('click', () => {
        modal.style.display = 'none';
        modalContent.querySelector('.modal-header').innerHTML = originalHeader;
        modalContent.querySelector('.inventory-grid').innerHTML = originalGrid;
    });
    
    document.getElementById('forceBusiness').addEventListener('click', () => {
        window.customerQueue = [];
        for (let i = 0; i < 10; i++) {
            window.customerQueue.push(generateRandomGuest());
        }
        if (typeof updateQueueDisplay === 'function') updateQueueDisplay();
        showToast('已强制设置10位客人');
        modal.style.display = 'none';
        modalContent.querySelector('.modal-header').innerHTML = originalHeader;
        modalContent.querySelector('.inventory-grid').innerHTML = originalGrid;
    });
    
    document.getElementById('clearAllData').addEventListener('click', () => {
        if (confirm('确定清除所有存档吗？这将重置游戏进度。')) {
            localStorage.clear();
            showToast('存档已清除，请刷新页面');
            setTimeout(() => location.reload(), 1500);
        }
    });
    
    document.getElementById('unlockAllRecipes').addEventListener('click', () => {
        RECIPES.forEach(r => {
            window.unlockedRecipes[r.id] = 'precise';
        });
        if (typeof renderRecipeList === 'function') renderRecipeList();
        showToast('所有配方已解锁');
        modal.style.display = 'none';
        modalContent.querySelector('.modal-header').innerHTML = originalHeader;
        modalContent.querySelector('.inventory-grid').innerHTML = originalGrid;
    });
    
    document.getElementById('addGold').addEventListener('click', () => {
        window.gold += 10000;
        if (typeof updateStatusBar === 'function') updateStatusBar();
        if (typeof window.renderMerchantModalContent === 'function') {
            window.renderMerchantModalContent();
        }
        showToast('+10000金币');
        modal.style.display = 'none';
        modalContent.querySelector('.modal-header').innerHTML = originalHeader;
        modalContent.querySelector('.inventory-grid').innerHTML = originalGrid;
    });
}

// 事件绑定
function bindEvents() {
    // 接客
    document.getElementById('newGuestBtn')?.addEventListener('click', newGuestHandler);
    document.getElementById('newGuestBtnMobile')?.addEventListener('click', newGuestHandler);
    
    // 中断
    document.getElementById('cancelGuestBtn')?.addEventListener('click', cancelGuestHandler);
    document.getElementById('cancelGuestBtnMobile')?.addEventListener('click', cancelGuestHandler);
    
    // 烹饪
    document.getElementById('cookAndServeBtn')?.addEventListener('click', cookHandler);
    document.getElementById('cookAndServeBtnPC')?.addEventListener('click', cookHandler);
    
    // 沉浸模式切换
    document.getElementById('toggleImmersiveBtn')?.addEventListener('click', toggleImmersive);
    document.getElementById('toggleImmersiveBtnMobile')?.addEventListener('click', toggleImmersive);
    
    // 盐滑块
    document.getElementById('saltSlider')?.addEventListener('input', (e) => {
        window.currentSalt = parseFloat(e.target.value);
        const saltValueEl = document.getElementById('saltValueDisplay');
        if (saltValueEl) saltValueEl.innerText = window.currentSalt.toFixed(1);
    });
    
    // 按钮弹窗
    document.getElementById('pcInventoryBtn')?.addEventListener('click', showInventoryModal);
    document.getElementById('mobileInventoryBtn')?.addEventListener('click', showInventoryModal);
    document.getElementById('pcMerchantBtn')?.addEventListener('click', showMerchantModal);
    document.getElementById('mobileMerchantBtn')?.addEventListener('click', showMerchantModal);
    document.getElementById('pcPartnerBtn')?.addEventListener('click', showPartnerModal);
    document.getElementById('mobilePartnerBtn')?.addEventListener('click', showPartnerModal);
    
    // 排班
    document.getElementById('applyAutoShift')?.addEventListener('click', () => {
        if (typeof applyAutoShift === 'function') applyAutoShift();
        if (typeof renderPartnerModalContent === 'function') renderPartnerModalContent();
        showToast('自动排班已应用');
    });
    
    // 查看排班表
    document.getElementById('businessStatus')?.addEventListener('click', showScheduleModal);
    document.getElementById('businessStatusMobile')?.addEventListener('click', showScheduleModal);
}

// 页面加载
window.addEventListener('load', initGame);

// 页面卸载时清理定时器
window.addEventListener('beforeunload', clearAllTimers);

// 暴露函数
window.newGuestHandler = newGuestHandler;
window.cancelGuestHandler = cancelGuestHandler;
window.cookHandler = cookHandler;
window.toggleImmersive = toggleImmersive;
window.updateDailySpecialDisplay = updateDailySpecialDisplay;
window.renderAllUI = renderAllUI;