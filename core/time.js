// =============================================================================
// 时间系统 - 处理所有与时间相关的逻辑
// =============================================================================

// 获取当前北京时间 (UTC+8)
function getCurrentTime() {
    const now = new Date();
    // 方法1：直接使用本地时间（假设用户系统时间已设为北京时间）
    // 但为了确保UTC+8，手动转换：
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const beijingTime = new Date(utc + (8 * 60 * 60 * 1000));
    return {
        hour: beijingTime.getHours(),
        minute: beijingTime.getMinutes(),
        dateStr: beijingTime.toISOString().split('T')[0],   // 格式 YYYY-MM-DD
        timestamp: beijingTime.getTime(),
        dayOfWeek: beijingTime.getDay()                     // 0=周日,1=周一,...,6=周六
    };
}

// 判断今天是否营业（考虑伙伴数量和星期）
function isBusinessDay() {
    const { dayOfWeek } = getCurrentTime();
    // 如果伙伴数量 <=2 且今天是周一(1)或周二(2)，则不营业
    if (window.partners && window.partners.length <= 2 && (dayOfWeek === 1 || dayOfWeek === 2)) {
        return false;
    }
    return true;
}

// 判断当前是否在营业时间内
function isBusinessHours() {
    if (!isBusinessDay()) return false;
    const { hour } = getCurrentTime();
    return hour >= GAME_CONFIG.businessHours.start && hour < GAME_CONFIG.businessHours.end;
}

// 判断当前是上午还是下午（用于价格波动）
function getCurrentPeriod() {
    const { hour } = getCurrentTime();
    return hour < 12 ? 'morning' : 'afternoon';
}

// 暴露到全局
window.getCurrentTime = getCurrentTime;
window.isBusinessDay = isBusinessDay;
window.isBusinessHours = isBusinessHours;
window.getCurrentPeriod = getCurrentPeriod;