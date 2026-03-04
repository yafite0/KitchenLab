// =============================================================================
// 弹窗管理器 - 优化版
// =============================================================================

// 显示库存弹窗
function showInventoryModal() {
    if (typeof window.renderInventoryModalContent === 'function') {
        window.renderInventoryModalContent();
    }
    document.getElementById('inventoryModal').style.display = 'flex';
}

// 关闭库存弹窗
function closeInventoryModal() {
    document.getElementById('inventoryModal').style.display = 'none';
}

// 显示供货商弹窗
function showMerchantModal() {
    if (typeof window.renderMerchantModalContent === 'function') {
        window.renderMerchantModalContent();
    }
    document.getElementById('merchantModal').style.display = 'flex';
}

// 关闭供货商弹窗
function closeMerchantModal() {
    document.getElementById('merchantModal').style.display = 'none';
}

// 显示伙伴弹窗
function showPartnerModal() {
    if (typeof window.renderPartnerModalContent === 'function') {
        window.renderPartnerModalContent();
    }
    document.getElementById('partnerModal').style.display = 'flex';
}

// 关闭伙伴弹窗
function closePartnerModal() {
    document.getElementById('partnerModal').style.display = 'none';
}

// 显示排班表 - 新弹窗，不破坏原库存弹窗
function showScheduleModal() {
    // 使用专门的排班弹窗，而不是复用库存弹窗
    const modal = document.getElementById('partnerModal'); // 复用伙伴弹窗
    const content = modal.querySelector('.modal-content');
    const originalHeader = content.querySelector('.modal-header').innerHTML;
    const originalList = document.getElementById('partnerList').innerHTML;
    
    // 临时替换内容
    content.querySelector('.modal-header').innerHTML = '<span>📋 排班表</span><div class="modal-close" id="closeScheduleModal">关闭</div>';
    
    let scheduleHtml = '<div style="padding:10px;">';
    if (!window.partners || window.partners.length === 0) {
        scheduleHtml += '<div style="color:#aaa; padding:10px;">暂无伙伴</div>';
    } else {
        scheduleHtml += '<div style="display:grid; gap:10px;">';
        window.partners.forEach(p => {
            const status = window.isPartnerOnDuty ? (window.isPartnerOnDuty(p) ? '✅ 在岗' : '⏸️ 休息') : '未知';
            scheduleHtml += `<div style="background:#7c6446; border-radius:30px; padding:15px; border:2px solid #ccaa73;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>👤 伙伴 ${p.name} ${p.isLeader ? '(组长)' : ''}</span>
                    <span>${status}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span>班次: ${p.currentShift === 'morning' ? '早班' : p.currentShift === 'evening' ? '晚班' : '休息'}</span>
                </div>
            </div>`;
        });
        scheduleHtml += '</div>';
    }
    scheduleHtml += '</div>';
    
    document.getElementById('partnerList').innerHTML = scheduleHtml;
    modal.style.display = 'flex';
    
    // 绑定关闭按钮
    document.getElementById('closeScheduleModal').addEventListener('click', function() {
        modal.style.display = 'none';
        // 恢复原内容
        content.querySelector('.modal-header').innerHTML = originalHeader;
        document.getElementById('partnerList').innerHTML = originalList;
        // 重新绑定伙伴弹窗的关闭按钮
        document.getElementById('closePartnerModal').addEventListener('click', closePartnerModal);
    }, { once: true });
}

// 初始化弹窗关闭按钮
function initModals() {
    const closeInventory = document.getElementById('closeInventoryModal');
    const closeMerchant = document.getElementById('closeMerchantModal');
    const closePartner = document.getElementById('closePartnerModal');

    if (closeInventory) {
        closeInventory.removeEventListener('click', closeInventoryModal);
        closeInventory.addEventListener('click', closeInventoryModal);
    }
    if (closeMerchant) {
        closeMerchant.removeEventListener('click', closeMerchantModal);
        closeMerchant.addEventListener('click', closeMerchantModal);
    }
    if (closePartner) {
        closePartner.removeEventListener('click', closePartnerModal);
        closePartner.addEventListener('click', closePartnerModal);
    }

    // 点击外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('inventoryModal')) closeInventoryModal();
        if (e.target === document.getElementById('merchantModal')) closeMerchantModal();
        if (e.target === document.getElementById('partnerModal')) closePartnerModal();
    });
}

// 暴露函数
window.showInventoryModal = showInventoryModal;
window.closeInventoryModal = closeInventoryModal;
window.showMerchantModal = showMerchantModal;
window.closeMerchantModal = closeMerchantModal;
window.showPartnerModal = showPartnerModal;
window.closePartnerModal = closePartnerModal;
window.initModals = initModals;
window.showScheduleModal = showScheduleModal;