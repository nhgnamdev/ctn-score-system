const DB_KEY = 'ctn_score_v10';

const BASE_RULES = [
 {id:'NN01',code:'NN_LATE',type:'DISCIPLINE',category:'Nề nếp',name:'Đi học muộn',points:-5,calcType:'FIXED',scope:'INDIVIDUAL',version:1,active:true,source:'REFERENCE'},
 {id:'NN02',code:'NN_ID',type:'DISCIPLINE',category:'Trang phục',name:'Không đeo thẻ học sinh',points:-5,calcType:'FIXED',scope:'INDIVIDUAL',version:1,active:true,source:'REFERENCE'},
 {id:'NN03',code:'NN_UNIFORM',type:'DISCIPLINE',category:'Trang phục',name:'Sai đồng phục / tác phong',points:-5,calcType:'FIXED',scope:'INDIVIDUAL',version:1,active:true,source:'REFERENCE'},
 {id:'NN04',code:'NN_PHONE',type:'DISCIPLINE',category:'Nề nếp',name:'Sử dụng điện thoại sai quy định',points:-20,calcType:'FIXED',scope:'INDIVIDUAL',version:1,active:true,source:'REFERENCE'},
 {id:'NN05',code:'NN_NOISE',type:'DISCIPLINE',category:'Nề nếp',name:'Mất trật tự',points:-3,calcType:'PER_OCCURRENCE',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'VS01',code:'VS_DIRTY',type:'DISCIPLINE',category:'Vệ sinh',name:'Vệ sinh lớp / hành lang chưa đạt',points:-2,calcType:'PER_OCCURRENCE',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'VS02',code:'VS_FOOD',type:'DISCIPLINE',category:'Vệ sinh',name:'Ăn uống trong lớp',points:-5,calcType:'PER_OCCURRENCE',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'HD01',code:'HD_ABSENT',type:'DISCIPLINE',category:'Hoạt động',name:'Không tham gia hoạt động tập thể',points:-10,calcType:'FIXED',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'HD02',code:'HD_LATE',type:'DISCIPLINE',category:'Hoạt động',name:'Đi muộn chào cờ / tập thể',points:-5,calcType:'FIXED',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'SI01',code:'SI_ABSENT',type:'DISCIPLINE',category:'Sĩ số',name:'Nghỉ không phép',points:-8,calcType:'PER_OCCURRENCE',scope:'INDIVIDUAL',version:1,active:true,source:'REFERENCE'},
 {id:'ST01',code:'ST_SDB',type:'STUDY',category:'Sổ đầu bài',name:'Tiết học chưa tốt',points:-2,calcType:'PER_OCCURRENCE',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'ST02',code:'ST_HW',type:'STUDY',category:'Học tập',name:'Không làm bài tập',points:-3,calcType:'FIXED',scope:'INDIVIDUAL',version:1,active:true,source:'REFERENCE'},
 {id:'ST03',code:'ST_PREP',type:'STUDY',category:'Học tập',name:'Không chuẩn bị bài / dụng cụ',points:-2,calcType:'FIXED',scope:'INDIVIDUAL',version:1,active:true,source:'DEMO'},
 {id:'ST04',code:'ST_BOOK',type:'STUDY',category:'Sổ đầu bài',name:'Sổ đầu bài chưa đạt ngưỡng',points:-5,calcType:'THRESHOLD',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'BN01',code:'BN_FIRST',type:'BONUS',category:'Thành tích',name:'Giải Nhất cuộc thi / phong trào',points:15,calcType:'BONUS',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'BN02',code:'BN_SECOND',type:'BONUS',category:'Thành tích',name:'Giải Nhì cuộc thi / phong trào',points:10,calcType:'BONUS',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'BN03',code:'BN_THIRD',type:'BONUS',category:'Thành tích',name:'Giải Ba cuộc thi / phong trào',points:5,calcType:'BONUS',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'BN04',code:'BN_CONS',type:'BONUS',category:'Thành tích',name:'Giải Khuyến khích',points:2,calcType:'BONUS',scope:'CLASS',version:1,active:true,source:'REFERENCE'},
 {id:'BN05',code:'BN_ACTIVE',type:'BONUS',category:'Hoạt động',name:'Tích cực hoạt động Đoàn',points:3,calcType:'BONUS',scope:'CLASS',version:1,active:true,source:'DEMO'}
];

class LocalDB {
 constructor(){ if(!localStorage.getItem(DB_KEY)) this.save(this.empty()); }
 empty(){ return {meta:{version:10,demo:true},years:[{id:'Y2526',name:'2025-2026',status:'ACTIVE',totalWeeks:35}],classes:[],members:[],rules:JSON.parse(JSON.stringify(BASE_RULES)),transactions:[],violations:[],achievements:[],events:[],classBooks:[],duties:[],appeals:[],notifications:[],audit_logs:[],weeklyStatus:[],settings:{baseDiscipline:100,baseStudy:40}}; }
 get(){ return JSON.parse(localStorage.getItem(DB_KEY)); }
 save(data){ localStorage.setItem(DB_KEY,JSON.stringify(data)); if(window.Engine) window.Engine.invalidate(); }
 seed(){ const data=seedDemoData(); this.save(data); return data; }
 reset(){ localStorage.removeItem(DB_KEY); location.reload(); }
 addTransaction(input,user){ const d=this.get(); const id='TXN_'+Date.now()+'_'+Math.floor(Math.random()*999); d.transactions.push({...input,id,reporter:user.name,timestamp:Date.now()}); audit(d,user,'CREATE_TRANSACTION',id); this.save(d); return id; }
 setTransactionStatus(id,status,user){const d=this.get();const t=d.transactions.find(x=>x.id===id);if(!t)return false;t.status=status;audit(d,user,'UPDATE_TRANSACTION',`${id} -> ${status}`);this.save(d);return true;}
 toggleDues(memberId,term,user){const d=this.get();const m=d.members.find(x=>x.id===memberId);if(!m)return; m.dues[term]=!m.dues[term];audit(d,user,'UPDATE_DUES',`${m.name} ${term}`);this.save(d);}
 addRule(rule,user){
 const d=this.get();
 d.rules.push({...rule,id:'R_'+Date.now(),version:1,active:true});
 audit(d,user,'CREATE_RULE',rule.code);
 this.save(d);
}
 integrity(){const d=this.get(),errors=[];const classIds=new Set(d.classes.map(x=>x.id)),memberMap=new Map(d.members.map(x=>[x.id,x])),ruleIds=new Set(d.rules.map(x=>x.id)); if(d.classes.length!==39)errors.push(`Có ${d.classes.length}/39 lớp`); for(const t of d.transactions){if(!classIds.has(t.classId))errors.push(`${t.id}: class không tồn tại`);if(!ruleIds.has(t.ruleId))errors.push(`${t.id}: rule không tồn tại`);if(t.memberId&& !memberMap.has(t.memberId))errors.push(`${t.id}: member không tồn tại`);if(t.memberId&&memberMap.get(t.memberId).classId!==t.classId)errors.push(`${t.id}: member/class không khớp`);} return {errors,totalTransactions:d.transactions.length,totalMembers:d.members.length,totalClasses:d.classes.length,totalWeeks:d.weeklyStatus.length}; }
}

function audit(d,user,action,details){d.audit_logs.push({id:'LOG_'+Date.now()+'_'+Math.random(),timestamp:Date.now(),user:user.name,role:user.role,action,details});}
window.BASE_RULES=BASE_RULES; window.DB=new LocalDB(); window.audit=audit;
