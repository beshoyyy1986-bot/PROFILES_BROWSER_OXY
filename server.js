// براوزري تولز — Cloud Edition: 3 بروفايلات موبايل على متصفح سحابي (CloudBrowser.ai) عبر CDP
const express=require('express'),http=require('http'),fs=require('fs'),path=require('path'),WebSocket=require('ws');
const E=process.env,API=E.CLOUDBROWSER_API_URL||'https://production.cloudbrowser.ai/api/v1',KEY=E.CLOUDBROWSER_API_KEY,PASS=E.APP_PASSWORD;
const DIR=E.DATA_DIR||path.join(__dirname,'data');fs.mkdirSync(DIR,{recursive:true});
const FILE=path.join(DIR,'store.json');
const DEF={slots:[{},{},{}],scripts:[],links:[['Facebook','https://www.facebook.com'],['Meta Business','https://business.facebook.com'],['Ads Manager','https://adsmanager.facebook.com'],['Instagram','https://www.instagram.com'],['WhatsApp Web','https://web.whatsapp.com'],['فحص الـ IP','https://ipinfo.io']]};
let store={...DEF,...(()=>{try{return JSON.parse(fs.readFileSync(FILE,'utf8'))}catch{return{}}})()};
const save=()=>{try{fs.writeFileSync(FILE,JSON.stringify(store,null,1))}catch(e){console.error('save',e.message)}};
const CC={};'EG|مصر|Africa/Cairo|ar-EG,ar,en-US,en;SA|السعودية|Asia/Riyadh|ar-SA,ar,en-US,en;AE|الإمارات|Asia/Dubai|ar-AE,ar,en-US,en;KW|الكويت|Asia/Kuwait|ar-KW,ar,en-US,en;QA|قطر|Asia/Qatar|ar-QA,ar,en-US,en;BH|البحرين|Asia/Bahrain|ar-BH,ar,en-US,en;OM|عمان|Asia/Muscat|ar-OM,ar,en-US,en;JO|الأردن|Asia/Amman|ar-JO,ar,en-US,en;LB|لبنان|Asia/Beirut|ar-LB,ar,en-US,en;IQ|العراق|Asia/Baghdad|ar-IQ,ar,en-US,en;MA|المغرب|Africa/Casablanca|ar-MA,ar,fr-FR,fr,en-US,en;DZ|الجزائر|Africa/Algiers|ar-DZ,ar,fr-FR,fr,en-US,en;TN|تونس|Africa/Tunis|ar-TN,ar,fr-FR,fr,en-US,en;LY|ليبيا|Africa/Tripoli|ar-LY,ar,en-US,en;SD|السودان|Africa/Khartoum|ar-SD,ar,en-US,en;TR|تركيا|Europe/Istanbul|tr-TR,tr,en-US,en;GB|بريطانيا|Europe/London|en-GB,en;DE|ألمانيا|Europe/Berlin|de-DE,de,en-US,en;FR|فرنسا|Europe/Paris|fr-FR,fr,en-US,en;ES|إسبانيا|Europe/Madrid|es-ES,es,en-US,en;IT|إيطاليا|Europe/Rome|it-IT,it,en-US,en;NL|هولندا|Europe/Amsterdam|nl-NL,nl,en-US,en;US|أمريكا|America/New_York|en-US,en;CA|كندا|America/Toronto|en-CA,en,fr-CA,fr;BR|البرازيل|America/Sao_Paulo|pt-BR,pt,en-US,en;MX|المكسيك|America/Mexico_City|es-MX,es,en-US,en;IN|الهند|Asia/Kolkata|en-IN,en,hi;PK|باكستان|Asia/Karachi|en-PK,en,ur;ID|إندونيسيا|Asia/Jakarta|id-ID,id,en-US,en;JP|اليابان|Asia/Tokyo|ja-JP,ja,en-US,en;AU|أستراليا|Australia/Sydney|en-AU,en;NG|نيجيريا|Africa/Lagos|en-NG,en;ZA|جنوب أفريقيا|Africa/Johannesburg|en-ZA,en'.split(';').forEach(s=>{const[a,n,t,l]=s.split('|');CC[a]={n,t,l}});
const A=(m,av,w,h,d)=>({m,av,w,h,d,p:'Linux armv81'});
const DEV={'Pixel 8':A('Pixel 8',14,412,915,2.625),'Galaxy S23':A('SM-S911B',14,360,780,3),'Galaxy A54':A('SM-A546E',14,360,800,3),'Redmi Note 12':A('23021RAAEG',13,393,873,2.75),'OnePlus 11':A('CPH2449',14,412,919,3.5)};
const WEST='US CA GB DE FR ES IT NL AU JP'.split(' '),P_W=['Pixel 8','Galaxy S23','OnePlus 11'],P_O=['Galaxy A54','Redmi Note 12','Galaxy S23','Pixel 8'];
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const pickDev=(sid,cc)=>{const p=WEST.includes(cc)?P_W:P_O;return p[hash(sid)%p.length]};
// ── تحويل الكود إلى سكربت (نفس منطق bookmarklet/wrapped في الأداة القديمة)
const TPL=`(()=>{const __id=__RID__;__GUARD__
const __log=window.console.log.bind(window.console);const __send=(t,v)=>{try{__log("__MP__"+JSON.stringify({id:__id,t,v}))}catch(e){}};
const __fmt=a=>{try{if(typeof a==='string')return a;if(a instanceof Error)return String(a.stack||a);if(typeof a==='function')return '[function]';return JSON.stringify(a,null,2)}catch(e){return String(a)}};
const __mk=t=>(...a)=>__send(t,a.map(__fmt).join(' '));
const console={log:__mk('log'),info:__mk('info'),warn:__mk('warn'),error:__mk('error'),debug:__mk('log')};
__send('start','');
(async()=>{try{const __r=await (async()=>{
__BODY__
})();if(__r!==undefined)__send('ret',__fmt(__r));__send('done','')}catch(e){__send('err',(e&&e.message)?(e.name+': '+e.message):__fmt(e))}})();})();`;
function cleanCode(c){c=(c||'').trim();const had=/^javascript:/i.test(c);if(had)c=c.replace(/^javascript:/i,'');if(/%[0-9a-f]{2}/i.test(c)&&(had||(!c.includes('{')&&/%(7B|20|22|27|28|29|3B|3D)/i.test(c))))try{c=decodeURIComponent(c)}catch{}return[c,had]}
function autoReturn(code){const c=code.trim();if(c.includes('\n'))return code;const c1=c.replace(/;$/,'').trim();if(!c1||c1.includes(';')||'{}'.includes(c1[0])||/^(const|let|var|if|for|while|do|function|class|return|try|switch|throw|import|export)\b/.test(c1))return code;return`return (${c1});`}
function buildJs(code,rid,match,mode){const[body,had]=cleanCode(code),pats=(match||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(mode==='global'||had)return pats.length?`if(${JSON.stringify(pats)}.some(p=>location.href.includes(p))){\n${body}\n}`:body;
 const g=pats.length?`if(!${JSON.stringify(pats)}.some(p=>location.href.includes(p)))return;`:'';
 return TPL.replace('__RID__',()=>JSON.stringify(rid)).replace('__GUARD__',()=>g).replace('__BODY__',()=>autoReturn(body))}
// ── قارئ الكوكيز: JSON بكل أشكاله / Netscape / Cookie header
const cexp=v=>{if(v==null||v===''||/^(session|-1|0)$/i.test(String(v)))return;let x=+v;if(isNaN(x)){x=Date.parse(v)/1000;return isNaN(x)?undefined:Math.floor(x)}if(x<=0)return;if(x>1e16)x=x/1e6-11644473600;else if(x>1e11)x/=1000;return Math.floor(x)};
const css=v=>({no_restriction:'None',none:'None',lax:'Lax',strict:'Strict'})[String(v||'').toLowerCase().replace('-','_')];
const mkc=o=>({name:String(o.name).trim(),value:String(o.value??''),domain:o.domain||'',path:o.path||'/',secure:!!o.secure,httpOnly:!!o.httpOnly,expires:o.expires,sameSite:o.sameSite});
function parseCookies(t){t=(t||'').trim().replace(/^\uFEFF/,'');if(!t)return[];
 if('[{'.includes(t[0]))try{let j=JSON.parse(t);if(j.cookies)j=j.cookies;if(!Array.isArray(j))j=Object.entries(j).map(([name,v])=>typeof v==='object'?{name,...v}:{name,value:v});
  return j.filter(c=>c&&c.name).map(c=>mkc({name:c.name,value:c.value,domain:c.domain||c.host,path:c.path,secure:c.secure,httpOnly:c.httpOnly,expires:cexp(c.expirationDate??c.expires??c.expiry),sameSite:css(c.sameSite)}))}catch{}
 if(/\t/.test(t)||/^#\s*Netscape/mi.test(t)){const out=[];for(let l of t.split(/\r?\n/)){let h=false;if(l.startsWith('#HttpOnly_')){h=true;l=l.slice(10)}else if(l.trim().startsWith('#')||!l.trim())continue;const p=l.split('\t');if(p.length>=7)out.push(mkc({domain:p[0],path:p[2],secure:p[3].toUpperCase()==='TRUE',expires:cexp(p[4]),name:p[5],value:p[6],httpOnly:h}))}if(out.length)return out}
 return t.replace(/^cookie\s*:\s*/i,'').split(/[;\n\r]+/).filter(p=>p.includes('=')).map(p=>{const k=p.indexOf('=');return mkc({name:p.slice(0,k),value:p.slice(k+1).trim()})}).filter(c=>c.name)}
const cb=async(p,body,m='POST')=>{if(!KEY)throw new Error('CLOUDBROWSER_API_KEY مش متضبط على السيرفر');
 const r=await fetch(API+p,{method:m,headers:{Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:m==='GET'?undefined:JSON.stringify(body)});
 const j=await r.json().catch(()=>({}));const s=r.ok?(j.status||200):r.status;
 if(s!==200)throw new Error(({401:'التوكن غلط',402:'مفيش اشتراك فعّال',403:'الوحدات خلصت',404:'وصلت أقصى عدد متصفحات متوازية'})[s]||`خطأ من الخدمة (${s})`);return j};
const norm=u=>{u=(u||'').trim()||'https://ipinfo.io';return/^[a-z][\w+.-]*:\/\//i.test(u)?u:'https://'+u};
const KC={Backspace:8,Tab:9,Enter:13,Escape:27,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Delete:46};
class Slot{
 constructor(i){this.i=i;this.clients=new Set();this.st='idle';this.n=0;this.pend=new Map()}
 meta(){const s=store.slots[this.i]||{};return{i:this.i,st:this.st,err:this.err,url:this.url,name:s.name,country:s.country,device:this.devName||s.device,w:this.dev&&this.dev.w,h:this.dev&&this.dev.h}}
 push(o){const m=JSON.stringify(o);this.clients.forEach(c=>c.readyState===1&&c.send(m))}
 set(st,err){this.st=st;this.err=err;this.push({t:'state',s:this.meta()})}
 send(method,params={},sid=this.sid){return new Promise((ok,no)=>{if(!this.ws||this.ws.readyState!==1)return no(new Error('المتصفح مش متصل'));const id=++this.n;this.pend.set(id,{ok,no});this.ws.send(JSON.stringify({id,method,params,sessionId:sid}));setTimeout(()=>this.pend.delete(id)&&no(new Error('انتهت المهلة: '+method)),20000)})}
 async start(c){
  await this.stop(true);const sid=c.sid||Math.random().toString(36).slice(2,12);
  const cc=CC[c.country]?c.country:'EG',info=CC[cc],dn=DEV[c.device]?c.device:pickDev(sid,cc),dev=DEV[dn];
  store.slots[this.i]={name:c.name||'Profile '+(this.i+1),country:cc,device:c.device||'auto',url:c.url,sid};save();
  this.dev=dev;this.devName=dn;this.url=c.url;this.last=null;this.set('starting');
  try{
   const body={Stealth:true,Browser:0,KeepOpen:900,Headless:false,Label:'bt-'+this.i+'-'+sid};
   if(E.PROXY_USER)body.Proxy={Host:E.PROXY_HOST||'pr.oxylabs.io',Port:String(E.PROXY_PORT||7777),Username:`${E.PROXY_USER}-cc-${cc}-sessid-${sid}-sesstime-30`,Password:E.PROXY_PASS||''};
   const r=await cb('/Browser/Open',body);this.addr=r.address;
   this.ws=new WebSocket(/^wss?:/.test(r.address)?r.address:'wss://'+r.address);
   await new Promise((ok,no)=>{this.ws.once('open',ok);this.ws.once('error',no)});
   this.ws.on('message',d=>this.onMsg(d));this.ws.on('error',()=>{});
   this.ws.on('close',()=>{if(this.st==='live'||this.st==='starting'){this.ws=null;this.set('idle','المتصفح اتقفل (انتهت المدة أو اتقفل من الخدمة)')}});
   const v=await this.send('Browser.getVersion'),full=(v.product.split('/')[1]||'140.0.0.0'),major=full.split('.')[0];
   const{targetInfos}=await this.send('Target.getTargets');const pg=targetInfos.find(t=>t.type==='page');
   const tid=pg?pg.targetId:(await this.send('Target.createTarget',{url:'about:blank'})).targetId;
   this.sid=(await this.send('Target.attachToTarget',{targetId:tid,flatten:true})).sessionId;
   const S=(m,p)=>this.send(m,p),soft=(m,p)=>this.send(m,p).catch(()=>{});
   await S('Page.enable');await S('Runtime.enable');
   const ua=`Mozilla/5.0 (Linux; Android ${dev.av}; ${dev.m}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`;
   await S('Emulation.setDeviceMetricsOverride',{width:dev.w,height:dev.h,deviceScaleFactor:dev.d,mobile:true});
   await S('Emulation.setUserAgentOverride',{userAgent:ua,acceptLanguage:info.l,platform:dev.p,userAgentMetadata:{brands:[{brand:'Chromium',version:major},{brand:'Not_A Brand',version:'24'}],fullVersion:full,platform:'Android',platformVersion:dev.av+'.0.0',architecture:'',model:dev.m,mobile:true}});
   await soft('Emulation.setTimezoneOverride',{timezoneId:info.t});await soft('Emulation.setLocaleOverride',{locale:info.l.split(',')[0]});
   await S('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
   await soft('Emulation.setEmitTouchEventsForMouse',{enabled:true,configuration:'mobile'});
   await S('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const d=(o,k,v)=>{try{Object.defineProperty(o,k,{get:()=>v,configurable:true})}catch(e){}};d(navigator,'platform',${JSON.stringify(dev.p)});d(navigator,'languages',${JSON.stringify(info.l.split(','))});d(navigator,'maxTouchPoints',5);window.open=u=>{if(u)location.href=u;return window};document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[target]');if(a)a.target='_self'},true)})();`});
   await S('Page.startScreencast',{format:'jpeg',quality:72,maxWidth:Math.round(dev.w*1.5),maxHeight:Math.round(dev.h*1.5),everyNthFrame:1});
   await S('Page.navigate',{url:norm(c.url)});this.set('live');
  }catch(e){const m=e.message;await this.stop(true);this.set('error',m)}
 }
 async stop(quiet){const a=this.addr;this.addr=null;if(this.ws){const w=this.ws;this.ws=null;try{w.close()}catch{}}
  if(a)await cb('/Browser/Close',{address:a}).catch(()=>{});this.pend.clear();if(!quiet)this.set('idle')}
 onMsg(d){let m;try{m=JSON.parse(d)}catch{return}
  if(m.id){const p=this.pend.get(m.id);if(p){this.pend.delete(m.id);m.error?p.no(new Error(m.error.message)):p.ok(m.result)}return}
  const q=m.params||{};
  if(m.method==='Page.screencastFrame'){const b=Buffer.from(q.data,'base64');this.last=b;this.clients.forEach(c=>c.readyState===1&&c.bufferedAmount<3e6&&c.send(b));this.send('Page.screencastFrameAck',{sessionId:q.sessionId}).catch(()=>{})}
  else if(m.method==='Runtime.consoleAPICalled'){const a=q.args&&q.args[0];if(a&&typeof a.value==='string'&&a.value.startsWith('__MP__'))try{const p=JSON.parse(a.value.slice(6));this.push({t:'msg',k:p.t,id:p.id,v:p.v})}catch{}}
  else if(m.method==='Page.frameNavigated'&&!q.frame.parentId){this.url=q.frame.url;this.push({t:'url',u:this.url})}
  else if(m.method==='Page.javascriptDialogOpening')this.send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{})}
 async hist(d){const h=await this.send('Page.getNavigationHistory'),e=h.entries[h.currentIndex+d];if(e)await this.send('Page.navigateToHistoryEntry',{entryId:e.id})}
 async cookies(text){const list=parseCookies(text);if(!list.length)throw new Error('مفيش كوكيز اتعرفت من النص ده');
  const now=Date.now()/1000,cs=[];let skipped=0;
  for(const c of list){if(c.expires&&c.expires<now){skipped++;continue}const o={name:c.name,value:c.value,path:c.path,httpOnly:c.httpOnly,secure:c.secure||/^__(Secure|Host)-/.test(c.name)||c.sameSite==='None'};
   if(c.domain)o.domain=c.domain;else o.url=this.url&&/^https?:/.test(this.url)?this.url:'https://www.facebook.com';
   if(c.expires)o.expires=c.expires;if(c.sameSite)o.sameSite=c.sameSite;cs.push(o)}
  await this.send('Network.setCookies',{cookies:cs});return{ok:cs.length,skipped}}
 async cmd(m){try{switch(m.t){
  case'mouse':return await this.send('Input.dispatchMouseEvent',{type:m.type,x:m.x,y:m.y,button:'left',buttons:m.type==='mouseReleased'?0:1,clickCount:1});
  case'wheel':return await this.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:m.x,y:m.y,deltaX:m.dx,deltaY:m.dy});
  case'key':{const k=m.key||'';const vk=KC[k]||(k.length===1?k.toUpperCase().charCodeAt(0):0);return await this.send('Input.dispatchKeyEvent',{type:m.type,key:k,code:m.code,text:m.type==='keyDown'?m.text:undefined,windowsVirtualKeyCode:vk,modifiers:m.mod||0})}
  case'text':return await this.send('Input.insertText',{text:String(m.text||'')});
  case'go':return await this.send('Page.navigate',{url:norm(m.u)});
  case'back':return await this.hist(-1);case'fwd':return await this.hist(1);case'reload':return await this.send('Page.reload');
  case'run':{const r=await this.send('Runtime.evaluate',{expression:buildJs(m.code,m.rid||'x',m.match,m.mode),userGesture:true});
   if(r.exceptionDetails)this.push({t:'msg',k:'sys',id:m.rid,v:(r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text});return}
  }}catch(e){this.push({t:'toast',v:e.message})}}
}
const slots=[0,1,2].map(i=>new Slot(i));
const app=express();app.use(express.json({limit:'5mb'}));
const authed=req=>{if(!PASS)return true;const b=(req.headers.authorization||'').split(' ')[1]||'';return Buffer.from(b,'base64').toString().split(':').slice(1).join(':')===PASS};
app.use((req,res,next)=>authed(req)?next():res.set('WWW-Authenticate','Basic realm="Browsery Tools"').sendStatus(401));
app.use(express.static(path.join(__dirname,'public')));
const slotOf=(req,res)=>{const s=slots[+req.params.i];if(!s)res.status(404).json({error:'خانة غير موجودة'});return s};
const wrap=f=>async(req,res)=>{try{res.json(await f(req,res)||{ok:1})}catch(e){res.status(400).json({error:e.message})}};
app.get('/api/state',(q,r)=>r.json({slots:slots.map(s=>s.meta()),scripts:store.scripts,links:store.links,saved:store.slots,countries:Object.entries(CC).map(([k,v])=>[k,v.n]),devices:Object.keys(DEV),hasKey:!!KEY}));
app.post('/api/slot/:i/start',wrap(async(q,r)=>{const s=slotOf(q,r);if(!s)return;if(s.st==='starting')throw new Error('لسه بيفتح...');s.start(q.body||{});return{ok:1}}));
app.post('/api/slot/:i/stop',wrap(async(q,r)=>{const s=slotOf(q,r);if(s)await s.stop()}));
app.post('/api/slot/:i/cookies',wrap(async(q,r)=>{const s=slotOf(q,r);if(s)return s.cookies(q.body.text)}));
app.get('/api/slot/:i/cookies',wrap(async(q,r)=>{const s=slotOf(q,r);if(s)return{cookies:(await s.send('Network.getAllCookies')).cookies}}));
app.put('/api/scripts',wrap(async q=>{if(!Array.isArray(q.body))throw new Error('صيغة غلط');store.scripts=q.body.filter(x=>x&&x.id&&x.name);save()}));
app.put('/api/links',wrap(async q=>{if(!Array.isArray(q.body))throw new Error('صيغة غلط');store.links=q.body.filter(x=>x&&x[1]);save()}));
const srv=http.createServer(app),wss=new WebSocket.Server({noServer:true});
srv.on('upgrade',(req,sock,head)=>{const u=new URL(req.url,'http://x'),s=slots[+u.searchParams.get('slot')];if(u.pathname!=='/ws'||!s||!authed(req))return sock.destroy();wss.handleUpgrade(req,sock,head,ws=>{s.clients.add(ws);ws.send(JSON.stringify({t:'state',s:s.meta()}));if(s.last)ws.send(s.last);ws.on('message',d=>{try{s.cmd(JSON.parse(d))}catch{}});ws.on('close',()=>s.clients.delete(ws))})});
setInterval(()=>wss.clients.forEach(c=>c.readyState===1&&c.ping()),25000);
const bye=async()=>{await Promise.all(slots.map(s=>s.stop(true)));process.exit(0)};process.on('SIGTERM',bye);process.on('SIGINT',bye);
srv.listen(E.PORT||3000,()=>console.log('Browsery Tools Cloud on :'+(E.PORT||3000)+(KEY?'':' (⚠ CLOUDBROWSER_API_KEY missing)')));
