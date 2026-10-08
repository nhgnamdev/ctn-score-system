class ScoreEngine {
 constructor(db){
  this.db=db;
  this.currentYearId='Y2526';
  this.currentWeek=35;
  this.currentUser={name:'Quản trị hệ thống',role:'ADMIN',scope:'ALL',classId:null};
  this._cache=null;
  this._cacheVersion=0;
 }
 invalidate(){this._cache=null;this._cacheVersion++;}
 setContext(year,week,role){
  this.currentYearId=year;this.currentWeek=Number(week);
  const map={
   ADMIN:['Quản trị hệ thống','ALL',null],
   BCH_BI_THU:['Bí thư BCH Đoàn trường','ALL',null],
   BCH_PHO:['Phó Bí thư BCH Đoàn trường','ALL',null],
   BCH_UYVIEN:['Ủy viên BCH Đoàn trường','ALL',null],
   BI_THU_CHI_DOAN:['Bí thư Chi đoàn 10 Tin','CLASS','C10_Tin']
  };
  const x=map[role]||map.ADMIN;
  this.currentUser={name:x[0],role,scope:x[1],classId:x[2]};
 }
 can(p,c=null){
  const r=this.currentUser.role;
  if(r==='ADMIN')return true;
  if(p==='VIEW_ALL')return r!=='BI_THU_CHI_DOAN';
  if(p==='MANAGE_RULES'||p==='MANAGE_YEAR'||p==='AUDIT')return r==='BCH_BI_THU';
  if(p==='APPROVE')return r==='BCH_BI_THU'||r==='BCH_PHO';
  if(p==='CREATE_VIOLATION'||p==='CREATE_SDB')return r!=='BI_THU_CHI_DOAN'||c===this.currentUser.classId;
  if(p==='EDIT_DUES')return r==='BCH_BI_THU'||r==='BCH_PHO'||(r==='BI_THU_CHI_DOAN'&&c===this.currentUser.classId);
  return false;
 }
 _buildCache(){
  const d=this.db.get(), rules=new Map(d.rules.map(r=>[r.id,r])), classes=new Map(d.classes.map(c=>[c.id,c]));
  const byWeek=new Map();
  for(const t of d.transactions){
   if(t.yearId!==this.currentYearId||t.status!=='APPROVED')continue;
   const key=`${t.week}|${t.classId}`;
   if(!byWeek.has(key))byWeek.set(key,[]);
   const r=rules.get(t.ruleId);
   if(r)byWeek.get(key).push({...t,ruleName:r.name,points:r.points,category:r.category,ruleType:r.type});
  }
  this._cache={data:d,rules,classes,byWeek,leaderboards:new Map(),calculations:new Map()};
 }
 _ensureCache(){if(!this._cache)this._buildCache();return this._cache;}
 transactions(classId,week=this.currentWeek){
  const c=this._ensureCache();return c.byWeek.get(`${week}|${classId}`)||[];
 }
 calculate(classId,week=this.currentWeek){
  const c=this._ensureCache(),key=`${week}|${classId}`;
  if(c.calculations.has(key))return c.calculations.get(key);
  const cls=c.classes.get(classId);if(!cls)return null;
  const trans=c.byWeek.get(key)||[];
  const b={discipline:c.data.settings.baseDiscipline,study:c.data.settings.baseStudy,bonus:0,transDiscipline:[],transStudy:[],transBonus:[]};
  for(const t of trans){
   const item=t;
   if(t.ruleType==='DISCIPLINE'){b.discipline+=t.points;b.transDiscipline.push(item);}
   else if(t.ruleType==='STUDY'){b.study+=t.points;b.transStudy.push(item);}
   else {b.bonus+=t.points;b.transBonus.push(item);}
  }
  b.discipline=Math.max(0,b.discipline);b.study=Math.max(0,b.study);
  const result={classInfo:cls,breakdown:b,total:b.discipline+b.study+b.bonus,transCount:trans.length};
  c.calculations.set(key,result);return result;
 }
 leaderboard(grade='ALL',week=this.currentWeek){
  const c=this._ensureCache(),key=`${week}|${grade}|${this.currentUser.scope}|${this.currentUser.classId||''}`;
  if(c.leaderboards.has(key))return c.leaderboards.get(key);
  let classes=[...c.classes.values()];
  if(this.currentUser.scope==='CLASS')classes=classes.filter(x=>x.id===this.currentUser.classId);
  if(grade!=='ALL')classes=classes.filter(x=>String(x.grade)===String(grade));
  const rows=classes.map(x=>this.calculate(x.id,week)).filter(Boolean).sort((a,b)=>b.total-a.total||b.breakdown.discipline-a.breakdown.discipline);
  const result=rows.map((x,i)=>({...x,rank:i+1}));
  c.leaderboards.set(key,result);return result;
 }
 rankHistory(classId){
  const out=[];
  for(let w=1;w<=35;w++){
   const all=this.leaderboard('ALL',w),r=all.find(x=>x.classInfo.id===classId);
   if(r)out.push({week:w,total:r.total,rank:r.rank});
  }
  return out;
 }
 explain(classId,week=this.currentWeek){const x=this.calculate(classId,week);return x?[...x.breakdown.transDiscipline,...x.breakdown.transStudy,...x.breakdown.transBonus]:[];}
}
window.Engine=new ScoreEngine(window.DB);
