// =============================================================================
// 伙伴核心逻辑 - 优化版
// =============================================================================

// 伙伴数组
window.partners = window.partners || [];

// 初始化伙伴
function initPartners() {
    if (!window.partners || window.partners.length === 0) {
        window.partners = [
            { ...PARTNER_A, currentShift: PARTNER_A.preferredShift || 'morning' },
            { ...PARTNER_B, currentShift: PARTNER_B.preferredShift || 'evening' }
        ];
        // 确保A是组长
        const leader = window.partners.find(p => p.id === 'A');
        if (leader) leader.isLeader = true;
    }
}

// 自动排班
function applyAutoShift() {
    if (!window.partners || window.partners.length === 0) return;
    
    const sorted = [...window.partners].sort((a, b) => a.id.localeCompare(b.id));
    const leader = sorted.find(p => p.isLeader) || sorted[0];
    const others = sorted.filter(p => p.id !== leader.id);

    if (window.partners.length === 1) {
        leader.currentShift = leader.preferredShift || 'evening';
    } else if (window.partners.length === 2) {
        leader.currentShift = leader.preferredShift || 'morning';
        const otherShift = leader.currentShift === 'morning' ? 'evening' : 'morning';
        others[0].currentShift = otherShift;
    } else {
        leader.currentShift = leader.preferredShift || 'morning';
        const otherShift = leader.currentShift === 'morning' ? 'evening' : 'morning';
        others[0].currentShift = otherShift;
        for (let i = 1; i < others.length; i++) {
            others[i].currentShift = 'evening';
        }
    }
    
    if (typeof window.saveGame === 'function') {
        window.saveGame();
    }
}

// 判断伙伴是否在岗
function isPartnerOnDuty(partner) {
    if (!partner) return false;
    if (!isBusinessDay()) return false;
    const { hour } = getCurrentTime();
    const shift = partner.currentShift;
    if (shift === 'rest') return false;
    const shiftTime = GAME_CONFIG.shifts[shift];
    if (!shiftTime) return false;
    return hour >= shiftTime.start && hour < shiftTime.end;
}

// 获取在岗伙伴数量
function getOnDutyCount() {
    if (!window.partners) return 0;
    return window.partners.filter(p => isPartnerOnDuty(p)).length;
}

// 修改伙伴班次
function updatePartnerShift(id, newShift) {
    if (!window.partners) return false;
    const partner = window.partners.find(p => p.id === id);
    if (partner) {
        partner.currentShift = newShift;
        if (typeof window.saveGame === 'function') {
            window.saveGame();
        }
        return true;
    }
    return false;
}

// 自动工作 - 优化版，检查食材
function autoWork() {
    if (!isBusinessHours()) return;
    if (!window.customerQueue || window.customerQueue.length === 0) return;

    const guest = window.customerQueue[0];
    const recipe = findRecipe(guest.dishId);
    if (!recipe) return;

    // 检查食材
    const enough = checkRecipeIngredients(recipe);
    if (enough) {
        consumeRecipeIngredients(recipe);
        const earning = Math.round((recipe.basePriceCN || 30) * 10 * 0.8);
        window.gold += earning;
        window.customerQueue.shift();
    } else {
        // 食材不足，直接跳过这个客人（不消耗食材，也不赚钱）
        window.customerQueue.shift();
    }

    if (typeof window.updateQueueDisplay === 'function') {
        window.updateQueueDisplay();
    }
    if (typeof window.saveGame === 'function') {
        window.saveGame();
    }
}

// 暴露到全局
window.initPartners = initPartners;
window.applyAutoShift = applyAutoShift;
window.isPartnerOnDuty = isPartnerOnDuty;
window.getOnDutyCount = getOnDutyCount;
window.updatePartnerShift = updatePartnerShift;
window.autoWork = autoWork;