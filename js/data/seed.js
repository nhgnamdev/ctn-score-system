const CLASS_NAMES=['Toán','Lý','Hoá','Sinh','Tin','Văn','Sử','Địa','Anh 1','Anh 2','Nga','Pháp','Trung'];
const GRADES=[{grade:10,k:'K37'},{grade:11,k:'K36'},{grade:12,k:'K35'}];
const LAST=['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng','Bùi','Đỗ','Ngô','Dương'];
const MID=['Minh','Quang','Hải','Đức','Gia','Anh','Hoàng','Khánh','Thành','Tuấn','Thùy','Ngọc','Phương','Hương','Linh','Trang','Nam','Vy','Mai','Nhật'];
const FIRST=['An','Bình','Châu','Chi','Duy','Giang','Hà','Hạnh','Hiếu','Khang','Lan','Long','Linh','Mai','Nam','Nhi','Phúc','Quân','Thảo','Trang','Tú','Vy'];
const rand=a=>a[Math.floor(Math.random()*a.length)]; const chance=p=>Math.random()<p; const pick=(a,n)=>a.slice().sort(()=>Math.random()-.5).slice(0,n);
function fullName(){return `${rand(LAST)} ${rand(MID)} ${rand(FIRST)}`;}
function seedDemoData(){
 const d=window.DB.empty(); let memberIndex=0;
 for(const g of GRADES) for(const subject of CLASS_NAMES){
   const id=`C${g.grade}_${subject.replace(/\s/g,'')}`; const size=20+Math.floor(Math.random()*16);
   d.classes.push({id,name:`${g.grade} ${subject}`,grade:g.grade,cohort:g.k,size});
   for(let i=0;i<size;i++) d.members.push({id:`M_${++memberIndex}`,code:`CTN_${g.k}_${String(memberIndex).padStart(4,'0')}`,name:fullName(),dob:`${2008+((g.grade-10)%3)}-${String(1+Math.floor(Math.random()*12)).padStart(2,'0')}-${String(1+Math.floor(Math.random()*27)).padStart(2,'0')}`,gender:chance(.5)?'Nam':'Nữ',classId:id,role:i===0?'Bí thư Chi đoàn':i===1?'Phó Bí thư':i<4?'Ủy viên':'Đoàn viên',joinDate:`2024-09-${String(1+Math.floor(Math.random()*25)).padStart(2,'0')}`,dues:{hki:chance(.85),hkii:chance(.65)},status:'ACTIVE'});
 }
 const rule=d.rules; const classes=d.classes, members=d.members;
 for(let week=1;week<=35;week++){
   d.weeklyStatus.push({id:`W${week}`,yearId:'Y2526',week,status:week<34?'ĐÃ KHÓA':week===34?'ĐÃ CHỐT':'ĐANG NHẬP'});
   for(const c of classes){
     const membersOf=members.filter(m=>m.classId===c.id); const performance=(c.name.includes('Tin')||c.name.includes('Toán'))?'strong':chance(.2)?'weak':chance(.45)?'good':'average';
     let discipline=performance==='strong'?97+Math.floor(Math.random()*4):performance==='good'?92+Math.floor(Math.random()*7):performance==='average'?85+Math.floor(Math.random()*8):75+Math.floor(Math.random()*10);
     let study=performance==='strong'?37+Math.floor(Math.random()*4):performance==='good'?33+Math.floor(Math.random()*5):performance==='average'?28+Math.floor(Math.random()*7):23+Math.floor(Math.random()*7);
     d.classBooks.push({id:`SDB_${week}_${c.id}`,yearId:'Y2526',week,classId:c.id,attendance:8+Math.floor(Math.random()*3),attitude:8+Math.floor(Math.random()*3),lessonQuality:7+Math.floor(Math.random()*4),organization:7+Math.floor(Math.random()*4),score:Math.min(40,study),status:'SUBMITTED'});
     const negCount=discipline>=94?Math.floor(Math.random()*2):discipline>=85?1+Math.floor(Math.random()*3):2+Math.floor(Math.random()*4);
     for(const _ of Array(negCount)){
       const pool=rule.filter(r=>r.points<0);const r=rand(pool);const m=r.scope==='INDIVIDUAL'?rand(membersOf):null; const v={id:`V_${week}_${c.id}_${Math.random()}`,yearId:'Y2526',week,classId:c.id,memberId:m?m.id:null,ruleId:r.id,category:r.category,description:r.name,severity:r.points<=-10?'HIGH':r.points<=-5?'MEDIUM':'LOW',status:week<34?'APPROVED':'PENDING',date:`2026-${String(1+Math.floor((week-1)/4)).padStart(2,'0')}-${String(1+Math.floor(Math.random()*26)).padStart(2,'0')}`,reporter:'Demo Data'};d.violations.push(v); d.transactions.push({id:`TXN_V_${week}_${c.id}_${Math.random()}`,yearId:'Y2526',week,classId:c.id,memberId:v.memberId,ruleId:r.id,note:r.name,status:v.status,sourceType:'VIOLATION',sourceId:v.id,reporter:'Demo Data',timestamp:Date.now()-(35-week)*604800000});
     }
     if(chance(.18)) addAchievement(d,week,c,membersOf,rand(['Academic','STEM','Culture','Sports','Union']));
     if(chance(.12)) addAchievement(d,week,c,membersOf,'STEM');
     if(chance(.15)){const r=rand(rule.filter(x=>x.type==='BONUS')); const tx={id:`TXN_B_${week}_${c.id}_${Math.random()}`,yearId:'Y2526',week,classId:c.id,memberId:null,ruleId:r.id,note:r.name,status:'APPROVED',sourceType:'ACTIVITY',sourceId:null,reporter:'Demo Data',timestamp:Date.now()-(35-week)*604800000};d.transactions.push(tx);}
     if(chance(.07)) d.transactions.push({id:`TXN_ADJ_${week}_${c.id}`,yearId:'Y2526',week,classId:c.id,memberId:null,ruleId:'BN05',note:'Tích cực hoạt động Đoàn',status:'APPROVED',sourceType:'MANUAL',sourceId:null,reporter:'Demo Data',timestamp:Date.now()-(35-week)*604800000});
   }
   const dutyClass=rand(classes),sec=members.find(m=>m.classId===dutyClass.id&&m.role==='Bí thư Chi đoàn'); d.duties.push({id:`D_${week}`,yearId:'Y2526',week,classId:dutyClass.id,memberId:sec.id,role:'BÍ THƯ',status:week<34?'ĐÃ CHỐT':'CHỜ DUYỆT'});
 }
 d.events=[
  ['EV01','STEM DAY 2026','STEM','2026-09-12','Sân trường'],['EV02','Cuộc thi Lập trình trẻ','Academic','2026-04-18','Phòng Tin học'],['EV03','Ngày hội Robotics','STEM','2026-03-26','Nhà đa năng'],['EV04','Giải bóng đá Đoàn trường','Sports','2026-03-20','Sân bóng'],['EV05','Chủ nhật xanh','Union','2026-02-28','Khuôn viên trường'],['EV06','Hội diễn văn nghệ 20/11','Culture','2025-11-20','Hội trường'],['EV07','Cuộc thi KHKT','Academic','2026-01-15','Phòng Lab'],['EV08','Chiến dịch tình nguyện','Union','2026-05-16','Thái Nguyên']
 ].map((e,i)=>({id:e[0],name:e[1],type:e[2],date:e[3],location:e[4],status:'COMPLETED',description:'Dữ liệu demo mô phỏng hoạt động của Đoàn trường',week:Math.min(35,Math.max(1,6+i*4)),participants:80+Math.floor(Math.random()*400)}));
 d.audit_logs.push({id:'LOG_SEED',timestamp:Date.now(),user:'SYSTEM',role:'SYSTEM',action:'SEED_DEMO',details:'Khởi tạo 39 lớp, dữ liệu đoàn viên, 35 tuần, vi phạm, thành tích, hoạt động và giao dịch điểm.'});
 return d;
}
function addAchievement(d,week,c,membersOf,type){const names={Academic:['Học sinh giỏi cấp trường','Cuộc thi học thuật','Olympic môn chuyên'],STEM:['STEM DAY 2026','Robotics','Lập trình','KHKT'],Culture:['Hội diễn văn nghệ','Trang trí lớp','Viết bài truyền thông'],Sports:['Bóng đá','Cầu lông','Điền kinh'],Union:['Chủ nhật xanh','Tình nguyện','Trồng cây']}; const result=rand(['FIRST','SECOND','THIRD','CONSOLATION']); const pts={FIRST:15,SECOND:10,THIRD:5,CONSOLATION:2}[result]; const title=rand(names[type]); const ach={id:`ACH_${week}_${c.id}_${Math.random()}`,yearId:'Y2526',week,classId:c.id,memberId:chance(.55)?rand(membersOf).id:null,eventId:null,type,title,rank:result,points:pts,date:`2026-${String(2+Math.floor(week/8)).padStart(2,'0')}-${String(1+Math.floor(Math.random()*25)).padStart(2,'0')}`,status:'APPROVED',evidence:'demo-evidence'}; d.achievements.push(ach); const ruleId={15:'BN01',10:'BN02',5:'BN03',2:'BN04'}[pts];d.transactions.push({id:`TXN_A_${ach.id}`,yearId:'Y2526',week,classId:c.id,memberId:ach.memberId,ruleId,note:`${title} - ${result}`,status:'APPROVED',sourceType:'ACHIEVEMENT',sourceId:ach.id,reporter:'Demo Data',timestamp:Date.now()-(35-week)*604800000});}
window.seedDemoData=seedDemoData;
