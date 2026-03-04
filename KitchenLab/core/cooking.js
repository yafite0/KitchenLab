// =============================================================================
// 烹饪核心算法 - 完整版
// =============================================================================

// 计算一道菜的评分
function calculateScore(recipe, amounts, salt) {
    const totalActual = Object.values(amounts).reduce((a, b) => a + b, 0);
    if (totalActual === 0) return { total: 0, deviations: [] };

    const totalTarget = recipe.main.reduce((acc, item) => acc + item.target, 0);
    let mainScore = 0;
    let deviations = [];

    recipe.main.forEach(item => {
        const targetRatio = item.target / totalTarget;
        const actualRatio = (amounts[item.ingId] || 0) / totalActual;
        
        const deviation = Math.abs(actualRatio - targetRatio);
        const itemScore = Math.max(0, 1 - deviation);
        mainScore += itemScore;
        
        deviations.push({
            ingId: item.ingId,
            deviation,
            isOver: actualRatio > targetRatio,
            diff: actualRatio - targetRatio // 正数过多，负数过少
        });
    });

    mainScore = (mainScore / recipe.main.length) * 100;
    mainScore = Math.min(100, Math.max(0, mainScore));

    // 盐分评分
    const { min, max } = getSaltMinMax(recipe, totalActual);
    let saltScore = 0;
    
    if (salt >= min && salt <= max) {
        const ideal = (min + max) / 2;
        const range = (max - min) || 0.1;
        const distance = Math.abs(salt - ideal);
        saltScore = 100 - (distance / range) * 100;
    } else {
        saltScore = 30;
    }

    const total = Math.round(mainScore * 0.7 + saltScore * 0.3);
    
    return {
        total: Math.min(100, Math.max(0, total)),
        deviations,
        mainScore: Math.round(mainScore),
        saltScore: Math.round(saltScore)
    };
}

// 获取盐的推荐范围
function getSaltMinMax(recipe, totalWeight) {
    return {
        min: totalWeight * recipe.saltRange[0],
        max: totalWeight * recipe.saltRange[1]
    };
}

// 生成改进建议 - 包含过多过少提示
function generateAdvice(scoreResult, recipe, amounts, salt) {
    if (scoreResult.total >= 98) return '✨ 完美！精确配方已解锁 ✨';
    if (scoreResult.total >= 95) return '🌟 极品！配方已臻化境';
    if (scoreResult.total >= 90) return '💫 非常完美！';
    if (scoreResult.total >= 80) return '📖 合格！标准配方已解锁';

    let advice = [];
    const totalActual = Object.values(amounts).reduce((a, b) => a + b, 0);
    const totalTarget = recipe.main.reduce((acc, item) => acc + item.target, 0);

    // 检查总重量
    if (totalActual < totalTarget * 0.7) {
        advice.push('总食材量太少');
    } else if (totalActual > totalTarget * 1.3) {
        advice.push('总食材量太多');
    }

    // 检查每个食材的比例（过多过少都提示）
    scoreResult.deviations.forEach(dev => {
        const ingName = getIngredientName(dev.ingId);
        const diffPercent = Math.round(Math.abs(dev.diff) * 100);
        
        if (Math.abs(dev.diff) > 0.15) {
            advice.push(`${ingName} ${dev.isOver ? '过多' : '过少'} ${dev.isOver ? '+' : '-'}${diffPercent}%`);
        } else if (Math.abs(dev.diff) > 0.08) {
            advice.push(`${ingName} ${dev.isOver ? '偏多' : '偏少'} ${dev.isOver ? '+' : '-'}${diffPercent}%`);
        } else if (Math.abs(dev.diff) > 0.03) {
            advice.push(`${ingName} 微调${dev.isOver ? '↓' : '↑'}`);
        }
    });

    // 盐分建议
    const { min, max } = getSaltMinMax(recipe, totalActual);
    if (salt < min - 0.5) {
        advice.push(`盐太少 (+${(min - salt).toFixed(1)}g)`);
    } else if (salt > max + 0.5) {
        advice.push(`盐太多 (-${(salt - max).toFixed(1)}g)`);
    } else if (salt < min) {
        advice.push(`盐稍少 (+${(min - salt).toFixed(1)}g)`);
    } else if (salt > max) {
        advice.push(`盐稍多 (-${(salt - max).toFixed(1)}g)`);
    }

    if (advice.length === 0) {
        return '👍 继续努力，再微调一下';
    }
    
    return '⚠️ ' + advice.join('，');
}

// 计算收入
function calculateEarning(recipe, score) {
    const basePrice = (recipe.basePriceCN || 30) * 10;
    return Math.round(basePrice * (score / 100));
}

// 随机设置主料用量
function setMainAmountsRandom(recipe) {
    if (!window.currentMainAmounts) window.currentMainAmounts = {};
    recipe.main.forEach(item => {
        const min = item.target * 0.5;
        const max = item.target * 2.0;
        window.currentMainAmounts[item.ingId] = Math.round((Math.random() * (max - min) + min) * 10) / 10;
    });
}

// 设置标准配方（80分解锁）
function setStandardRecipe(recipe) {
    if (!window.currentMainAmounts) window.currentMainAmounts = {};
    recipe.main.forEach(item => {
        window.currentMainAmounts[item.ingId] = item.target;
    });
}

// 设置精确配方（95分解锁）
function setPreciseRecipe(recipe) {
    if (!window.currentMainAmounts) window.currentMainAmounts = {};
    recipe.main.forEach(item => {
        window.currentMainAmounts[item.ingId] = item.target;
    });
}

// 计算当前主料总重
function calcTotalMainWeight(recipe) {
    if (!recipe) return 0;
    let total = 0;
    recipe.main.forEach(item => {
        total += (window.currentMainAmounts && window.currentMainAmounts[item.ingId]) || 0;
    });
    return Math.round(total * 10) / 10;
}

// 重置盐到中间值 - 修复滑块跳动问题
function resetSaltToMid() {
    const recipe = findRecipe(window.selectedDishId);
    if (!recipe) return;
    const total = calcTotalMainWeight(recipe);
    const { min, max } = getSaltMinMax(recipe, total);
    window.currentSalt = (min + max) / 2;
    if (window.updateSaltSlider) window.updateSaltSlider();
}

// 暴露函数到全局
window.calculateScore = calculateScore;
window.getSaltMinMax = getSaltMinMax;
window.generateAdvice = generateAdvice;
window.calculateEarning = calculateEarning;
window.setMainAmountsRandom = setMainAmountsRandom;
window.setStandardRecipe = setStandardRecipe;
window.setPreciseRecipe = setPreciseRecipe;
window.calcTotalMainWeight = calcTotalMainWeight;
window.resetSaltToMid = resetSaltToMid;