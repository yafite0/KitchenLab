// =============================================================================
// 调试日志（可开关）
// =============================================================================

const DEBUG = false; // 生产环境设为 false

function log(...args) {
    if (DEBUG) console.log(...args);
}

function warn(...args) {
    if (DEBUG) console.warn(...args);
}

function error(...args) {
    console.error(...args);
}

// 暴露到全局
window.log = log;
window.warn = warn;
window.error = error;