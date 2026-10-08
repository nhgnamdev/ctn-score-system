// js/db.js

const DEFAULT_STRUCTURE = {
    years: [{ id: 'Y2526', name: '2025-2026', status: 'ACTIVE', totalWeeks: 35 }],
    classes: [], members: [], 
    rules: [
        { id: 'R1', code: 'NN_LATE', type: 'DISCIPLINE', category: 'Nề nếp', name: 'Đi học muộn', points: -5, calcType: 'FIXED', scope: 'INDIVIDUAL', version: 1, active: true },
        { id: 'R2', code: 'NN_PHONE', type: 'DISCIPLINE', category: 'Nề nếp', name: 'Sử dụng điện thoại sai QĐ', points: -20, calcType: 'FIXED', scope: 'INDIVIDUAL', version: 1, active: true },
        { id: 'R3', code: 'NN_CLEAN', type: 'DISCIPLINE', category: 'Vệ sinh', name: 'Lớp bẩn, hành lang bẩn', points: -2, calcType: 'FIXED', scope: 'CLASS', version: 2, active: true },
        { id: 'S1', code: 'ST_BAD', type: 'STUDY', category: 'SĐB', name: 'SĐB: Tiết học chưa tốt', points: -2, calcType: 'PER_OCCURRENCE', scope: 'CLASS', version: 1, active: true },
        { id: 'S2', code: 'ST_NO_HW', type: 'STUDY', category: 'Học tập', name: 'Không làm bài tập', points: -3, calcType: 'FIXED', scope: 'INDIVIDUAL', version: 1, active: true },
        { id: 'B1', code: 'BN_STEM_1', type: 'BONUS', category: 'Thành tích', name: 'Giải Nhất thi KHKT/STEM', points: 15, calcType: 'FIXED', scope: 'INDIVIDUAL', version: 1, active: true },
        { id: 'B2', code: 'BN_ACT', type: 'BONUS', category: 'Hoạt động', name: 'Tích cực HĐ Đoàn', points: 3, calcType: 'FIXED', scope: 'CLASS', version: 1, active: true }
    ],
    transactions: [], appeals: [], duties: [], notifications: [], audit_logs: []
};

const SEEDER = {
    classNames: ['Toán', 'Lý', 'Hoá', 'Sinh', 'Tin', 'Văn', 'Sử', 'Địa', 'Anh 1', 'Anh 2', 'Nga', 'Pháp', 'Trung'],
    grades: [ { level: 10, k: 'K37' }, { level: 11, k: 'K36' }, { level: 12, k: 'K35' } ],
    lastNames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Đặng', 'Bùi'],
    firstNames: ['Anh', 'Tuấn', 'Linh', 'Trang', 'Hùng', 'Nam', 'Hương', 'Hà', 'Phúc', 'Lâm', 'Vy', 'Nhi'],
    
    randomName: () => `${SEEDER.lastNames[Math.floor(Math.random()*SEEDER.lastNames.length)]} ${SEEDER.firstNames[Math.floor(Math.random()*SEEDER.firstNames.length)]}`,

    generate: function() {
        let data = JSON.parse(JSON.stringify(DEFAULT_STRUCTURE));
        
        // Sinh đúng 39 lớp, 30 HS / Lớp = 1170 ĐV
        this.grades.forEach(g => {
            this.classNames.forEach(c => {
                const cId = `C${g.level}${c.replace(' ', '')}`;
                data.classes.push({ id: cId, name: `${g.level} ${c}`, grade: g.level, k: g.k });
                for(let i=0; i<30; i++) {
                    data.members.push({
                        id: `M_${cId}_${i}`,
                        code: `CTN_${g.k}_${Math.floor(Math.random()*10000)}`,
                        name: this.randomName(),
                        classId: cId,
                        role: i===0 ? 'Bí thư Chi đoàn' : (i===1?'Phó Bí thư':'Đoàn viên'),
                        dues: { hki: Math.random() > 0.1, hkii: Math.random() > 0.5 }
                    });
                }
            });
        });

        for(let week=1; week<=35; week++) {
            const dutyClass = data.classes[Math.floor(Math.random() * data.classes.length)];
            const sec = data.members.find(m => m.classId === dutyClass.id && m.role === 'Bí thư Chi đoàn');
            data.duties.push({ week, classId: dutyClass.id, secretaryId: sec.id, status: week === 35 ? 'CHỜ DUYỆT' : 'ĐÃ CHỐT' });

            data.classes.forEach(cls => {
                if(Math.random() > 0.2) { 
                    let mems = data.members.filter(m => m.classId === cls.id);
                    let numTrans = Math.floor(Math.random() * 3) + 1;
                    
                    for(let t=0; t<numTrans; t++) {
                        let r = data.rules[Math.floor(Math.random() * data.rules.length)];
                        let isCollective = r.scope === 'CLASS' || Math.random() > 0.5;
                        let tid = `TXN_${week}_${cls.id}_${Math.floor(Math.random()*10000)}`;
                        
                        data.transactions.push({
                            id: tid, yearId: 'Y2526', week: week, classId: cls.id,
                            memberId: isCollective ? null : mems[Math.floor(Math.random()*mems.length)].id,
                            ruleId: r.id, note: isCollective ? `Lỗi/Thành tích tập thể tuần ${week}` : `Vi phạm/Sự kiện cá nhân tuần ${week}`,
                            status: week === 35 && Math.random() > 0.4 ? 'PENDING' : 'APPROVED', 
                            reporter: 'System', timestamp: Date.now() - (36 - week) * 7 * 86400000
                        });

                        if(week === 35 && Math.random() > 0.9 && r.points < 0) {
                            data.appeals.push({
                                id: `APP_${tid}`, transId: tid, classId: cls.id,
                                reason: 'Đề nghị xem xét lại.', status: 'PENDING', timestamp: Date.now()
                            });
                            data.notifications.push({ id: Date.now(), msg: `Khiếu nại từ lớp ${cls.name}`, read: false });
                        }
                    }
                }
            });
        }
        
        data.audit_logs.push({ id: 'LOG_1', timestamp: Date.now(), user: 'SYSTEM', role: 'SYS', action: 'SEED_V7', details: 'Khởi tạo 39 Lớp, 1170 ĐV, 35 Tuần Dữ Liệu.'});
        return data;
    }
};

class LocalDB {
    constructor() {
        if (!localStorage.getItem('ctn_v7_data')) localStorage.setItem('ctn_v7_data', JSON.stringify(DEFAULT_STRUCTURE));
    }
    getData() { return JSON.parse(localStorage.getItem('ctn_v7_data')); }
    saveData(data) { localStorage.setItem('ctn_v7_data', JSON.stringify(data)); }
    
    reset() { 
        Swal.fire({title:'Xóa toàn bộ?', text: "Hệ thống sẽ trở về trạng thái trống.", icon:'warning', showCancelButton:true}).then((r) => {
            if(r.isConfirmed) { localStorage.removeItem('ctn_v7_data'); window.location.reload(); }
        });
    }
    
    seedDemoData() {
        Swal.fire({title:'Khởi tạo Dữ liệu?', text:'Quá trình này sẽ sinh ra hàng ngàn record cho 35 tuần.', icon:'info', showCancelButton:true}).then((r)=>{
            if(r.isConfirmed) {
                Swal.fire({title: 'Đang khởi tạo...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                setTimeout(() => { this.saveData(SEEDER.generate()); window.location.reload(); }, 1500);
            }
        });
    }

    addTransaction(trans, currentUser) {
        const data = this.getData();
        data.transactions.push({ ...trans, id: 'TXN_' + Date.now(), reporter: currentUser.name, timestamp: Date.now() });
        this.logAudit(data, currentUser, 'ADD_TRANS', `Thêm giao dịch Rule ${trans.ruleId} cho Lớp ${trans.classId}`);
        this.saveData(data);
    }
    
    updateTransStatus(tid, status, user) {
        const data = this.getData();
        const t = data.transactions.find(x => x.id === tid);
        if(t) { t.status = status; this.logAudit(data, user, 'UPDATE_TRANS', `Duyệt Trans ${tid} -> ${status}`); this.saveData(data); }
    }

    updateDues(memberId, term, user) {
        const data = this.getData();
        const m = data.members.find(x => x.id === memberId);
        if(m) {
            m.dues[term] = !m.dues[term];
            this.logAudit(data, user, 'UPDATE_DUES', `Cập nhật đoàn phí ${term.toUpperCase()} của ĐV ${m.name} -> ${m.dues[term]}`);
            this.saveData(data);
        }
    }

    logAudit(dataRef, user, action, details) {
        dataRef.audit_logs.push({ id: 'LOG_' + Date.now(), timestamp: Date.now(), user: user.name, role: user.role, action, details });
    }
    
    integrityCheck() {
        const data = this.getData();
        let errors = [];
        data.transactions.forEach(t => {
            if(!data.classes.find(c => c.id === t.classId)) errors.push(`TXN ${t.id} mồ côi Class`);
            if(!data.rules.find(r => r.id === t.ruleId)) errors.push(`TXN ${t.id} mồ côi Rule`);
            if(t.memberId && !data.members.find(m => m.id === t.memberId)) errors.push(`TXN ${t.id} chứa Member không tồn tại`);
        });
        return { total: data.transactions.length, errors };
    }
}
window.DB = new LocalDB();
