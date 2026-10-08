// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    initContextControls();
    updateAppByRole(); 
});

window.toggleDropdown = function(id) { document.getElementById(id).classList.toggle('active'); }
window.closeModal = function(id) { document.getElementById(id).classList.add('hidden'); }

function initContextControls() {
    const data = window.DB.getData();

    const yrSel = document.getElementById('headerYear');
    data.years.forEach(y => yrSel.innerHTML += `<option value="${y.id}" ${y.status==='ACTIVE'?'selected':''}>${y.name}</option>`);
    
    const wkSel = document.getElementById('headerWeek');
    for(let i=1; i<=35; i++) wkSel.innerHTML += `<option value="${i}">Tuần ${i}</option>`;
    wkSel.value = 35;

    ['headerYear', 'headerWeek', 'roleSwitcher'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateAppByRole);
    });
    
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const res = document.getElementById('searchResults');
        if(val.length < 2) { res.classList.add('hidden'); return; }
        
        let html = '';
        const d = window.DB.getData();
        const mems = d.members.filter(m => m.name.toLowerCase().includes(val) || m.code.toLowerCase().includes(val)).slice(0,3);
        if(mems.length) {
            html += `<div class="p-2 font-bold text-xs bg-slate-50 text-slate-500">Đoàn viên</div>`;
            mems.forEach(m => html += `<div class="p-2 text-sm hover:bg-blue-50 cursor-pointer" onclick="openMemberProfile('${m.id}')">${m.name} (${d.classes.find(c=>c.id===m.classId).name})</div>`);
        }
        const cls = d.classes.filter(c => c.name.toLowerCase().includes(val)).slice(0,2);
        if(cls.length) {
            html += `<div class="p-2 font-bold text-xs bg-slate-50 text-slate-500">Lớp</div>`;
            cls.forEach(c => html += `<div class="p-2 text-sm hover:bg-blue-50 cursor-pointer" onclick="openClassDetail('${c.id}')">${c.name}</div>`);
        }
        
        res.innerHTML = html || '<div class="p-4 text-sm text-slate-500 text-center">Không tìm thấy kết quả.</div>';
        res.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => { if(!e.target.closest('#globalSearch') && !e.target.closest('#searchResults')) document.getElementById('searchResults').classList.add('hidden'); });

    renderNotifications();
    setupInputForms();
}

function updateAppByRole() {
    window.Engine.setContext(document.getElementById('headerYear').value, document.getElementById('headerWeek').value, document.getElementById('roleSwitcher').value);
    document.querySelectorAll('.sys-week').forEach(el => el.innerText = window.Engine.currentWeek);
    
    document.getElementById('current-user-name').innerText = window.Engine.currentUser.name;
    document.getElementById('current-role-badge').innerText = window.Engine.currentUser.role;

    renderNavigation();
    renderDashboard();
    
    if(window.Engine.currentUser.scope === 'CLASS') {
        openClassDetail(window.Engine.currentUser.classId);
    } else {
        switchView('dashboard');
    }
}

function renderNavigation() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = `
        <p class="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Tổng quan</p>
        <button onclick="switchView('dashboard')" class="w-full text-left sidebar-item active flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-chart-pie-slice text-lg"></i> Dashboard</button>
        <button onclick="switchView('ranking')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-trophy text-lg"></i> Bảng Xếp Hạng</button>
        
        <p class="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Nghiệp vụ</p>
    `;
    
    if(window.Engine.can('ADD_VIOLATION')) {
        nav.innerHTML += `
            <button onclick="switchView('input-sdb')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-book-open text-lg"></i> Sổ đầu bài (40đ)</button>
            <button onclick="switchView('input-violation')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-warning-circle text-lg"></i> Ghi nhận Vi phạm</button>
        `;
    }

    nav.innerHTML += `
        <button onclick="switchView('transactions')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-clock-counter-clockwise text-lg"></i> Lịch sử điểm</button>
        <button onclick="switchView('members')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-users text-lg"></i> Hồ sơ Đoàn viên</button>
        <button onclick="switchView('duty')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-calendar-check text-lg"></i> Quản lý Trực tuần</button>
    `;

    if(window.Engine.can('APPROVE_SCORE') || window.Engine.can('MANAGE_RULES')) {
        nav.innerHTML += `<p class="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Cấu hình Hệ thống</p>`;
        if(window.Engine.can('APPROVE_SCORE')) nav.innerHTML += `<button onclick="switchView('workflow')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-check-square text-lg"></i> Workflow Duyệt Điểm</button>`;
        if(window.Engine.can('MANAGE_RULES')) nav.innerHTML += `<button onclick="switchView('rules')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-tree-structure text-lg"></i> Rule Engine</button>`;
    }

    if(window.Engine.can('VIEW_ADMIN_DATA')) {
        nav.innerHTML += `
            <button onclick="switchView('admin-data')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-database text-lg"></i> Quản trị Dữ liệu</button>
            <button onclick="switchView('audit')" class="w-full text-left sidebar-item flex items-center gap-3 px-6 py-3 text-sm text-slate-600"><i class="ph ph-shield-check text-lg"></i> Audit Log</button>
        `;
    }
}

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active', 'border-r-[3px]', 'border-blue-600', 'bg-blue-50'));
    if(event && event.currentTarget && event.currentTarget.classList.contains('sidebar-item')) {
        event.currentTarget.classList.add('active', 'border-r-[3px]', 'border-blue-600', 'bg-blue-50');
    }

    if(viewId === 'dashboard') { renderDashboard(); initChart(); }
    if(viewId === 'ranking') renderFullRanking();
    if(viewId === 'transactions') renderTransactions();
    if(viewId === 'workflow') renderWorkflow();
    if(viewId === 'rules') renderRules();
    if(viewId === 'members') renderMembersFilters();
    if(viewId === 'duty') renderDuty();
    if(viewId === 'audit') renderAudit();
}

function renderNotifications() {
    const data = window.DB.getData();
    const ul = document.getElementById('notif-list');
    document.getElementById('notif-count').innerText = data.notifications.length;
    ul.innerHTML = data.notifications.map(n => `<li class="px-4 py-3 border-b border-slate-50 hover:bg-slate-50"><p class="text-sm text-slate-700">${n.msg}</p></li>`).join('');
}

function renderDashboard() {
    const data = window.DB.getData();
    if(data.classes.length === 0) return;
    
    const filter = document.getElementById('dashGradeFilter') ? document.getElementById('dashGradeFilter').value : 'ALL';
    const rankings = window.Engine.getLeaderboard(filter);
    
    document.getElementById('dash-stat-members').innerText = data.members.length;
    const cwTrans = data.transactions.filter(t => t.week === window.Engine.currentWeek).length;
    document.getElementById('dash-total-violations').innerText = cwTrans;
    if(rankings.length > 0) document.getElementById('dash-top-class').innerText = rankings[0].classInfo.name;

    const tbody = document.getElementById('dash-ranking-table');
    if(tbody) {
        tbody.innerHTML = rankings.map((r, idx) => `
            <tr class="hover:bg-blue-50 cursor-pointer transition-colors" onclick="openClassDetail('${r.classInfo.id}')">
                <td class="px-4 py-4 font-bold text-slate-600">#${idx + 1}</td>
                <td class="px-4 py-4 font-bold text-blue-600 hover:underline">${r.classInfo.name}</td>
                <td class="px-4 py-4 text-center font-medium ${r.breakdown.discipline < 100 ? 'text-red-500' : 'text-blue-600'}">${r.breakdown.discipline}</td>
                <td class="px-4 py-4 text-center font-medium ${r.breakdown.study < 40 ? 'text-amber-600' : 'text-emerald-600'}">${r.breakdown.study}</td>
                <td class="px-4 py-4 text-center font-bold text-amber-500">+${r.breakdown.bonus}</td>
                <td class="px-4 py-4 text-right font-bold text-lg text-slate-900">${r.total}</td>
            </tr>`).join('');
    }
}

function renderFullRanking() {
    const rankings = window.Engine.getLeaderboard('ALL');
    const tbody = document.getElementById('full-ranking-table');
    tbody.innerHTML = rankings.map((r, idx) => {
        return `
            <tr class="hover:bg-blue-50 cursor-pointer transition-colors" onclick="openClassDetail('${r.classInfo.id}')">
                <td class="px-6 py-4 font-bold text-slate-600">#${idx + 1}</td>
                <td class="px-6 py-4 font-bold text-blue-600 hover:underline">${r.classInfo.name}</td>
                <td class="px-6 py-4 text-center font-medium">${r.breakdown.discipline}</td>
                <td class="px-6 py-4 text-center font-medium">${r.breakdown.study}</td>
                <td class="px-6 py-4 text-center font-bold text-amber-500">+${r.breakdown.bonus}</td>
                <td class="px-6 py-4 text-right font-bold text-xl text-slate-900">${r.total}</td>
            </tr>`;
    }).join('');
}

let chartInstance = null;
function initChart() {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return;
    if(chartInstance) chartInstance.destroy();
    
    const filter = document.getElementById('dashGradeFilter') ? document.getElementById('dashGradeFilter').value : 'ALL';
    const top5 = window.Engine.getLeaderboard(filter).slice(0, 5);
    
    let weeks = [];
    let cw = window.Engine.currentWeek;
    for(let i = Math.max(1, cw - 4); i <= cw; i++) weeks.push(i);
    
    const colors = ['#2563eb', '#059669', '#d97706', '#9333ea', '#db2777'];
    
    const datasets = top5.map((r, idx) => {
        let pts = weeks.map(w => window.Engine.calculateClassScore(r.classInfo.id, w).total);
        return {
            label: r.classInfo.name,
            data: pts,
            borderColor: colors[idx % colors.length],
            tension: 0.3,
            borderWidth: 2
        };
    });
    
    chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: { labels: weeks.map(w => 'Tuần ' + w), datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }
    });
}

window.openClassDetail = function(classId) {
    const data = window.DB.getData();
    const score = window.Engine.calculateClassScore(classId, window.Engine.currentWeek);
    const mems = data.members.filter(m => m.classId === classId);
    const sec = mems.find(m => m.role === 'Bí thư Chi đoàn');
    
    document.getElementById('cd-name').innerText = score.classInfo.name;
    document.getElementById('cd-grade').innerText = `Khối ${score.classInfo.grade} (${score.classInfo.k})`;
    document.getElementById('cd-secretary').innerText = sec ? sec.name : 'Unknown';
    document.getElementById('cd-members-count').innerText = mems.length;
    document.getElementById('cd-total-score').innerText = score.total;
    
    window.currentClassView = classId;

    const b = score.breakdown;
    document.getElementById('cd-score-discipline').innerText = b.discipline;
    document.getElementById('cd-breakdown-discipline').innerHTML = b.transDiscipline.map(t => `<li class="flex justify-between border-b border-slate-50 pb-1"><span class="text-slate-600">${t.ruleName}</span><span class="text-red-500 font-bold">${t.points}</span></li>`).join('');
    
    document.getElementById('cd-score-study').innerText = b.study;
    document.getElementById('cd-breakdown-study').innerHTML = b.transStudy.map(t => `<li class="flex justify-between border-b border-slate-50 pb-1"><span class="text-slate-600">${t.ruleName}</span><span class="text-amber-600 font-bold">${t.points}</span></li>`).join('');
    
    document.getElementById('cd-score-bonus').innerText = b.bonus;
    document.getElementById('cd-breakdown-bonus').innerHTML = b.transBonus.map(t => `<li class="flex justify-between border-b border-slate-50 pb-1"><span class="text-slate-600">${t.ruleName}</span><span class="text-emerald-500 font-bold">+${t.points}</span></li>`).join('');

    const tl = document.getElementById('cd-timeline');
    const allT = [...b.transDiscipline, ...b.transStudy, ...b.transBonus];
    tl.innerHTML = allT.length ? allT.map(t => `
        <div class="relative">
            <div class="absolute -left-[31px] w-3 h-3 ${t.points>0?'bg-emerald-500':'bg-red-500'} rounded-full mt-1.5 border-2 border-white"></div>
            <p class="text-xs text-slate-400">${new Date(t.timestamp).toLocaleDateString('vi-VN')} - Status: <span class="font-bold text-emerald-600">${t.status}</span></p>
            <p class="font-bold text-slate-800">${t.ruleName} <span class="${t.points>0?'text-emerald-500':'text-red-500'}">(${t.points>0?'+':''}${t.points})</span></p>
            <p class="text-sm text-slate-600">Đối tượng: <strong>${t.memberId ? mems.find(m=>m.id===t.memberId).name : 'Tập thể Lớp'}</strong></p>
            <p class="text-sm text-slate-500 italic">Note: ${t.note}</p>
        </div>
    `).join('') : '<p class="text-sm text-slate-400 italic">Tuần này không có hoạt động.</p>';

    switchView('class-detail');
}

window.explainScore = function() {
    Swal.fire({
        title: 'Giải Thích Điểm',
        html: `<div class="text-left text-sm space-y-2 mt-4"><p><strong>Nề nếp:</strong> 100đ gốc + Tổng điểm trừ các lỗi nề nếp đã duyệt.</p><p><strong>Học tập:</strong> 40đ gốc + Tổng điểm trừ các lỗi học tập/SĐB đã duyệt.</p><p><strong>Điểm cộng:</strong> 0đ + Tổng các thành tích, sự kiện tham gia.</p><hr><p class="text-xs italic text-slate-500">Lưu ý: Chỉ những giao dịch có trạng thái APPROVED mới được cộng/trừ vào tổng.</p></div>`,
        icon: 'info'
    });
}

window.openSimulationModal = function() {
    const data = window.DB.getData();
    document.getElementById('simClassId').value = window.currentClassView;
    const rSel = document.getElementById('simRule');
    rSel.innerHTML = '<option value="">-- Chọn luật --</option>';
    data.rules.forEach(r => rSel.innerHTML += `<option value="${r.id}" data-pts="${r.points}">[${r.type}] ${r.name} (${r.points})</option>`);
    
    const currScore = window.Engine.calculateClassScore(window.currentClassView, window.Engine.currentWeek).total;
    document.getElementById('simOldScore').innerText = currScore;
    document.getElementById('simNewScore').innerText = '--';
    
    rSel.onchange = (e) => {
        const opt = e.target.options[e.target.selectedIndex];
        if(!opt.value) { document.getElementById('simNewScore').innerText = '--'; return; }
        const pts = parseInt(opt.getAttribute('data-pts'));
        document.getElementById('simNewScore').innerText = currScore + pts;
    };
    document.getElementById('modal-simulation').classList.remove('hidden');
}

window.applySimulation = function() {
    const cId = document.getElementById('simClassId').value;
    const rId = document.getElementById('simRule').value;
    if(!rId) return;
    
    window.DB.addTransaction({
        yearId: window.Engine.currentYearId, week: window.Engine.currentWeek,
        classId: cId, memberId: null, ruleId: rId, note: "Áp dụng từ Simulation", status: 'APPROVED', evidence: ''
    }, window.Engine.currentUser);
    
    closeModal('modal-simulation');
    Swal.fire('Thành công', 'Đã ghi nhận giao dịch thật.', 'success');
    openClassDetail(cId); 
}

function renderTransactions() {
    const data = window.DB.getData();
    const tbody = document.getElementById('transaction-table');
    tbody.innerHTML = [...data.transactions].reverse().map(t => {
        const cls = data.classes.find(c => c.id === t.classId);
        const rule = data.rules.find(r => r.id === t.ruleId);
        if(!rule) return '';
        let badge = t.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50';
        return `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 font-bold text-slate-800">Tuần ${t.week}</td>
                <td class="px-6 py-4 font-bold text-blue-600">${cls.name}</td>
                <td class="px-6 py-4">${rule.category}</td>
                <td class="px-6 py-4 text-sm">${rule.name}<br><span class="text-xs text-slate-400">${t.note}</span></td>
                <td class="px-6 py-4 text-center"><span class="px-2 py-1 text-xs rounded font-bold ${badge}">${t.status}</span></td>
                <td class="px-6 py-4 text-right font-bold ${rule.points>0?'text-emerald-600':'text-red-600'}">${rule.points}</td>
            </tr>`;
    }).join('');
}

function renderMembersFilters() {
    const data = window.DB.getData();
    const gSel = document.getElementById('filterGrade');
    const cSel = document.getElementById('filterClass');
    
    if(window.Engine.currentUser.scope === 'CLASS') {
        const myClass = data.classes.find(c => c.id === window.Engine.currentUser.classId);
        gSel.value = myClass.grade; gSel.disabled = true;
        cSel.innerHTML = `<option value="${myClass.id}">${myClass.name}</option>`; cSel.disabled = true;
        loadMemberList(myClass.id); return;
    }
    
    gSel.disabled = false;
    cSel.disabled = gSel.value === "";
    gSel.onchange = (e) => {
        cSel.innerHTML = '<option value="">-- Chọn lớp --</option>';
        if(e.target.value) {
            cSel.disabled = false;
            data.classes.filter(c => c.grade == e.target.value).forEach(c => cSel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
        } else cSel.disabled = true;
        document.getElementById('member-table-container').classList.add('hidden');
    };
    cSel.onchange = (e) => { if(e.target.value) loadMemberList(e.target.value); };
    document.getElementById('filterSearch').onkeyup = (e) => { if(cSel.value) loadMemberList(cSel.value, e.target.value.toLowerCase()); };
}

window.toggleDues = function(event, memberId, term) {
    event.stopPropagation();
    window.DB.updateDues(memberId, term, window.Engine.currentUser);
    const data = window.DB.getData();
    const m = data.members.find(x => x.id === memberId);
    if(m) loadMemberList(m.classId, document.getElementById('filterSearch').value);
}

function loadMemberList(classId, searchStr = "") {
    const data = window.DB.getData();
    const tbody = document.getElementById('member-table-body');
    document.getElementById('member-table-container').classList.remove('hidden');
    tbody.innerHTML = '';
    
    let members = data.members.filter(m => m.classId === classId);
    if(searchStr) members = members.filter(m => m.name.toLowerCase().includes(searchStr));

    const canEditDues = window.Engine.can('EDIT_DUES', classId);

    members.forEach(m => {
        const mTrans = data.transactions.filter(t => t.memberId === m.id);
        const damage = mTrans.reduce((acc, t) => {
            const r = data.rules.find(ru => ru.id === t.ruleId);
            return acc + (r && r.points < 0 ? 1 : 0);
        }, 0);

        let duesHtml = canEditDues 
            ? `<button onclick="toggleDues(event, '${m.id}', 'hki')" class="px-2 py-1 mr-1 text-xs rounded font-bold ${m.dues.hki?'bg-emerald-100 text-emerald-700 hover:bg-emerald-200':'bg-slate-100 text-slate-500 hover:bg-slate-200'}">HK1: ${m.dues.hki?'Đã nộp':'Chưa'}</button>
               <button onclick="toggleDues(event, '${m.id}', 'hkii')" class="px-2 py-1 text-xs rounded font-bold ${m.dues.hkii?'bg-emerald-100 text-emerald-700 hover:bg-emerald-200':'bg-slate-100 text-slate-500 hover:bg-slate-200'}">HK2: ${m.dues.hkii?'Đã nộp':'Chưa'}</button>`
            : `<span class="text-xs">HK1: ${m.dues.hki?'✅':'❌'} | HK2: ${m.dues.hkii?'✅':'❌'}</span>`;

        tbody.innerHTML += `
            <tr class="hover:bg-blue-50 cursor-pointer transition-colors" onclick="openMemberProfile('${m.id}')">
                <td class="px-6 py-4 font-mono text-xs text-slate-500">${m.code}</td>
                <td class="px-6 py-4 font-bold text-blue-600 hover:underline">${m.name}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded font-bold bg-slate-100 text-slate-700">${m.role}</span></td>
                <td class="px-6 py-4 text-center">${duesHtml}</td>
                <td class="px-6 py-4 text-center font-bold text-red-500">${damage > 0 ? damage + ' lỗi' : '-'}</td>
            </tr>`;
    });
}

window.openMemberProfile = function(memberId) {
    const data = window.DB.getData();
    const m = data.members.find(x => x.id === memberId);
    const cls = data.classes.find(c => c.id === m.classId);
    
    document.getElementById('mp-name').innerText = m.name;
    document.getElementById('mp-class').innerText = cls.name;
    document.getElementById('mp-role').innerText = m.role;

    const mTrans = data.transactions.filter(t => t.memberId === memberId);
    let totalDamage = 0;
    
    const vUl = document.getElementById('mp-violations');
    const aUl = document.getElementById('mp-achievements');
    vUl.innerHTML = ''; aUl.innerHTML = '';

    mTrans.forEach(t => {
        const rule = data.rules.find(r => r.id === t.ruleId);
        if(!rule) return;
        
        let html = `
            <li class="border-b border-slate-100 pb-2">
                <p class="text-xs text-slate-400">Tuần ${t.week} - Trạng thái: ${t.status}</p>
                <p class="font-medium text-slate-800">${rule.name}</p>
                <p class="text-sm font-bold ${rule.points > 0 ? 'text-emerald-500':'text-red-500'}">Ảnh hưởng tới lớp: ${rule.points > 0 ? '+':''}${rule.points}đ</p>
            </li>`;

        if(rule.points < 0) { totalDamage += rule.points; vUl.innerHTML += html; }
        else { aUl.innerHTML += html; }
    });

    if(vUl.innerHTML === '') vUl.innerHTML = '<p class="text-sm text-slate-400 italic">Đoàn viên không có vi phạm nào.</p>';
    if(aUl.innerHTML === '') aUl.innerHTML = '<p class="text-sm text-slate-400 italic">Chưa ghi nhận thành tích.</p>';
    
    document.getElementById('mp-total-damage').innerText = totalDamage + " điểm";
    switchView('member-profile');
}

function setupInputForms() {
    const data = window.DB.getData();
    
    // SDB Form
    const sdbC = document.getElementById('sdbClass');
    const sdbM = document.getElementById('sdbMember');
    const sdbR = document.getElementById('sdbRule');
    if(sdbC) {
        sdbC.innerHTML = '<option value="">-- Chọn lớp --</option>' + data.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        sdbR.innerHTML = '<option value="">-- Chọn luật học tập --</option>' + data.rules.filter(r=>r.type==='STUDY').map(r => `<option value="${r.id}">${r.name} (${r.points})</option>`).join('');
        sdbC.onchange = (e) => {
            sdbM.innerHTML = '<option value="">-- Lỗi chung của cả lớp --</option>' + data.members.filter(m=>m.classId===e.target.value).map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
        };
        document.getElementById('sdbForm').addEventListener('submit', (e) => submitFormHelper(e, 'sdbClass', 'sdbMember', 'sdbRule', 'sdbNote'));
    }

    // Violation Form
    const vioC = document.getElementById('vioClass');
    const vioM = document.getElementById('vioMember');
    const vioR = document.getElementById('vioRule');
    if(vioC) {
        vioC.innerHTML = '<option value="">-- Chọn lớp --</option>' + data.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        vioR.innerHTML = '<option value="">-- Chọn luật nề nếp --</option>' + data.rules.filter(r=>r.type==='DISCIPLINE').map(r => `<option value="${r.id}">${r.name} (${r.points})</option>`).join('');
        vioC.onchange = (e) => {
            vioM.innerHTML = '<option value="">-- Lỗi tập thể --</option>' + data.members.filter(m=>m.classId===e.target.value).map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
        };
        document.getElementById('violationForm').addEventListener('submit', (e) => submitFormHelper(e, 'vioClass', 'vioMember', 'vioRule', 'vioNote'));
    }
}

function submitFormHelper(e, cId, mId, rId, nId) {
    e.preventDefault();
    window.DB.addTransaction({
        yearId: window.Engine.currentYearId, week: window.Engine.currentWeek,
        classId: document.getElementById(cId).value,
        memberId: document.getElementById(mId).value || null,
        ruleId: document.getElementById(rId).value,
        note: document.getElementById(nId).value,
        status: window.Engine.can('APPROVE_SCORE') ? 'APPROVED' : 'PENDING'
    }, window.Engine.currentUser);
    
    Swal.fire('Thành công', 'Dữ liệu đã được ghi nhận. ' + (window.Engine.can('APPROVE_SCORE') ? 'Đã cộng/trừ điểm trực tiếp.' : 'Đang chờ Admin duyệt.'), 'success');
    e.target.reset();
}

function renderDuty() {
    const data = window.DB.getData();
    const tbody = document.getElementById('duty-table');
    const weekDuties = data.duties.filter(d => d.week === window.Engine.currentWeek);
    
    if(weekDuties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-400 italic">Không có dữ liệu phân công tuần này.</td></tr>';
        return;
    }
    tbody.innerHTML = weekDuties.map(d => {
        const cls = data.classes.find(c => c.id === d.classId);
        const sec = data.members.find(m => m.id === d.secretaryId);
        return `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 font-bold text-slate-800">Tuần ${d.week}</td>
                <td class="px-6 py-4 font-bold text-blue-600">${cls.name}</td>
                <td class="px-6 py-4">${sec ? sec.name : 'Unknown'}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded font-bold ${d.status==='ĐÃ CHỐT'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}">${d.status}</span></td>
            </tr>`;
    }).join('');
}

function renderWorkflow() {
    const data = window.DB.getData();
    const tbody = document.getElementById('wf-pending-table');
    const pendingTrans = data.transactions.filter(t => t.status === 'PENDING' && t.yearId === window.Engine.currentYearId);
    
    tbody.innerHTML = pendingTrans.length === 0 ? '<tr><td colspan="4" class="p-4 text-center text-slate-400">Không có dữ liệu chờ duyệt.</td></tr>' : '';
    
    pendingTrans.forEach(t => {
        const cls = data.classes.find(c => c.id === t.classId);
        const rule = data.rules.find(r => r.id === t.ruleId);
        if(!rule) return;
        
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-50">
                <td class="px-4 py-3 font-bold text-blue-600">${cls.name}</td>
                <td class="px-4 py-3"><p class="font-medium text-slate-800">${rule.name}</p><p class="text-xs text-slate-500">${t.note}</p></td>
                <td class="px-4 py-3 text-center font-bold ${rule.points > 0 ? 'text-emerald-600' : 'text-red-600'}">${rule.points}</td>
                <td class="px-4 py-3 text-right"><button onclick="approveTrans('${t.id}')" class="text-emerald-600 bg-emerald-50 px-2 py-1 text-xs rounded font-bold hover:bg-emerald-100">Duyệt</button></td>
            </tr>
        `;
    });

    const list = document.getElementById('wf-appeal-list');
    const appeals = data.appeals.filter(a => a.status === 'PENDING');
    list.innerHTML = appeals.length === 0 ? '<p class="text-center text-slate-400">Không có khiếu nại.</p>' : '';
    
    appeals.forEach(a => {
        const t = data.transactions.find(x => x.id === a.transId);
        const cls = data.classes.find(c => c.id === a.classId);
        const rule = data.rules.find(r => r.id === t.ruleId);
        list.innerHTML += `
            <div class="border border-purple-200 bg-purple-50/30 rounded-lg p-4">
                <div class="flex justify-between mb-2"><span class="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">Yêu cầu từ: ${cls.name}</span></div>
                <p class="text-sm font-medium text-slate-800">Lý do: "${a.reason}"</p>
                <div class="bg-white p-3 rounded border border-slate-100 mt-3 mb-3 text-xs text-slate-600"><p><strong>Giao dịch gốc:</strong> [${rule.type}] ${rule.name} (${rule.points}đ)</p></div>
                <div class="flex gap-2 justify-end">
                    <button class="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200">Từ chối</button>
                    <button class="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-200">Chấp nhận (Hủy lỗi)</button>
                </div>
            </div>`;
    });
}

window.approveTrans = function(id) {
    window.DB.updateTransStatus(id, 'APPROVED', window.Engine.currentUser);
    Swal.fire({toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, icon: 'success', title: 'Đã duyệt!'});
    renderWorkflow();
}

window.runIntegrityCheck = function() {
    const res = window.DB.integrityCheck();
    const div = document.getElementById('integrity-result');
    div.classList.remove('hidden');
    if(res.errors.length === 0) {
        div.innerHTML = `<span class="text-emerald-600 font-bold">✓ Kiểm tra ${res.total} giao dịch: Hoàn toàn hợp lệ.</span>`;
    } else {
        div.innerHTML = `<span class="text-red-600 font-bold">⚠ Phát hiện ${res.errors.length} lỗi:</span><ul class="list-disc ml-4 text-xs mt-2">${res.errors.map(e=>`<li>${e}</li>`).join('')}</ul>`;
    }
}

function renderRules() {
    const data = window.DB.getData();
    const tbody = document.getElementById('rule-table');
    tbody.innerHTML = data.rules.map(r => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4"><p class="font-mono text-xs text-slate-500 font-bold">${r.code}</p><p class="text-[10px] text-slate-400 uppercase mt-1">v${r.version}.0</p></td>
            <td class="px-6 py-4"><p class="font-bold text-slate-800">${r.name}</p><p class="text-xs text-slate-500 mt-1"><span class="px-1.5 py-0.5 rounded bg-slate-100">${r.category}</span></p></td>
            <td class="px-6 py-4 text-xs font-mono bg-slate-50">${r.calcType}</td>
            <td class="px-6 py-4 text-center font-bold ${r.points > 0 ? 'text-emerald-600':'text-red-600'}">${r.points > 0 ? '+':''}${r.points}</td>
            <td class="px-6 py-4 text-right font-mono text-xs">${r.scope}</td>
        </tr>
    `).join('');
}

function renderAudit() {
    const data = window.DB.getData();
    const tbody = document.getElementById('audit-table');
    tbody.innerHTML = [...data.audit_logs].reverse().slice(0, 50).map(log => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-3 text-xs text-slate-500">${new Date(log.timestamp).toLocaleString('vi-VN')}</td>
            <td class="px-6 py-3"><p class="font-bold text-slate-800">${log.user}</p><p class="text-xs text-blue-600">${log.role}</p></td>
            <td class="px-6 py-3"><span class="px-2 py-1 text-xs bg-slate-200 rounded font-bold">${log.action}</span></td>
            <td class="px-6 py-3 text-sm text-slate-600">${log.details}</td>
        </tr>
    `).join('');
}
