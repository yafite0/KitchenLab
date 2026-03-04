// =============================================================================
// 伙伴弹窗渲染
// =============================================================================

function renderPartnerModalContent() {
    const listDiv = document.getElementById('partnerList');
    if (!listDiv) return;
    
    let html = '';

    if (!window.partners || window.partners.length === 0) {
        listDiv.innerHTML = '<div style="color:#aaa;padding:8px;">暂无伙伴</div>';
        return;
    }

    window.partners.forEach(p => {
        const status = window.isPartnerOnDuty ? (window.isPartnerOnDuty(p) ? '✅ 在岗' : '⏸️ 休息') : '未知';
        html += `<div class="partner-item">
            <div class="partner-row">
                <span>👤 伙伴 ${p.name} ${p.isLeader ? '(组长)' : ''}</span>
                <span>${status}</span>
            </div>
            <div class="partner-row">
                <span>偏好: ${p.preferredShift === 'morning' ? '早班' : '晚班'}</span>
                <select class="shift-select" data-id="${p.id}">
                    <option value="morning" ${p.currentShift === 'morning' ? 'selected' : ''}>早班</option>
                    <option value="evening" ${p.currentShift === 'evening' ? 'selected' : ''}>晚班</option>
                    <option value="rest" ${p.currentShift === 'rest' ? 'selected' : ''}>休息</option>
                </select>
            </div>
        </div>`;
    });

    listDiv.innerHTML = html;

    document.querySelectorAll('.shift-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            if (window.updatePartnerShift) {
                window.updatePartnerShift(id, e.target.value);
                renderPartnerModalContent();
                showToast('班次已更新');
            }
        });
    });
}

// 暴露函数到全局
window.renderPartnerModalContent = renderPartnerModalContent;