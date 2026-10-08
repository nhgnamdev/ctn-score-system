// js/engine.js

class ScoreEngine {
    constructor(db) {
        this.db = db;
        this.BASE_DISCIPLINE = 100;
        this.BASE_STUDY = 40;
        this.currentYearId = 'Y2526';
        this.currentWeek = 35; 
        this.currentUser = { name: 'Admin ĐT', role: 'SUPER_ADMIN', scope: 'ALL', classId: null };
    }

    setContext(yearId, week, roleStr) {
        this.currentYearId = yearId;
        this.currentWeek = parseInt(week);
        if(roleStr === 'SUPER_ADMIN') this.currentUser = { name: 'Quản Trị Hệ Thống', role: 'SUPER_ADMIN', scope: 'ALL' };
        else if(roleStr === 'ADMIN') this.currentUser = { name: 'Bí thư Đoàn Trường', role: 'ADMIN', scope: 'ALL' };
        else if(roleStr === 'DUTY') this.currentUser = { name: 'Sao Đỏ', role: 'DUTY', scope: 'ALL' };
        else if(roleStr === 'SECRETARY') this.currentUser = { name: 'Bí thư 10 Tin', role: 'SECRETARY', scope: 'CLASS', classId: 'C10Tin' };
    }

    can(permission, targetClassId = null) {
        const r = this.currentUser.role;
        if(r === 'SUPER_ADMIN') return true;
        
        switch(permission) {
            case 'APPROVE_SCORE': return r === 'ADMIN';
            case 'MANAGE_RULES': return r === 'ADMIN';
            case 'VIEW_ADMIN_DATA': return false; 
            case 'VIEW_ALL_CLASSES': return r !== 'SECRETARY';
            case 'ADD_VIOLATION': return r !== 'SECRETARY';
            case 'EDIT_DUES': return r === 'ADMIN' || (r === 'SECRETARY' && this.currentUser.classId === targetClassId);
            default: return false;
        }
    }

    calculateClassScore(classId, week) {
        const data = this.db.getData();
        const cls = data.classes.find(c => c.id === classId);
        if (!cls) return null;

        const classTrans = data.transactions.filter(t => t.classId === classId && t.yearId === this.currentYearId && t.week === week && t.status === 'APPROVED');
        
        let bd = { discipline: this.BASE_DISCIPLINE, study: this.BASE_STUDY, bonus: 0, transDiscipline: [], transStudy: [], transBonus: [] };

        classTrans.forEach(t => {
            const rule = data.rules.find(r => r.id === t.ruleId);
            if(rule) {
                let finalPoints = rule.points;
                const tDetail = { ...t, ruleName: rule.name, points: finalPoints };
                
                if (rule.type === 'DISCIPLINE') { bd.discipline += finalPoints; bd.transDiscipline.push(tDetail); }
                if (rule.type === 'STUDY') { bd.study += finalPoints; bd.transStudy.push(tDetail); }
                if (rule.type === 'BONUS') { bd.bonus += finalPoints; bd.transBonus.push(tDetail); }
            }
        });

        if(bd.discipline < 0) bd.discipline = 0;
        if(bd.study < 0) bd.study = 0;

        return { classInfo: cls, breakdown: bd, total: bd.discipline + bd.study + bd.bonus, transCount: classTrans.length };
    }

    getLeaderboard(gradeFilter = 'ALL') {
        const data = this.db.getData();
        let classes = data.classes;
        if(this.currentUser.scope === 'CLASS') classes = classes.filter(c => c.id === this.currentUser.classId);
        if(gradeFilter !== 'ALL') classes = classes.filter(c => c.grade == gradeFilter);

        const rankings = classes.map(c => this.calculateClassScore(c.id, this.currentWeek));
        rankings.sort((a, b) => b.total !== a.total ? b.total - a.total : b.breakdown.discipline - a.breakdown.discipline);
        return rankings;
    }
}
window.Engine = new ScoreEngine(window.DB);
