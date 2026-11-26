// براوزري تولز — Cloud Edition: 3 بروفايلات موبايل على متصفح سحابي (CloudBrowser.ai) عبر CDP
const express=require('express'),http=require('http'),fs=require('fs'),path=require('path'),WebSocket=require('ws'),net=require('net'),tls=require('tls');
const E=process.env,API=E.CLOUDBROWSER_API_URL||'https://production.cloudbrowser.ai/api/v1',KEY=E.CLOUDBROWSER_API_KEY,PASS=E.APP_PASSWORD;
const DIR=E.DATA_DIR||path.join(__dirname,'data');fs.mkdirSync(DIR,{recursive:true});
const FILE=path.join(DIR,'store.json'),INST=Math.random().toString(36).slice(2,6),BOOT=Date.now();
process.on('uncaughtException',e=>console.error('[uncaught]',e&&e.stack||e));process.on('unhandledRejection',e=>console.error('[unhandled]',e&&e.stack||e));
const DEF={slots:[{},{},{}],scripts:[],links:[['Facebook','https://www.facebook.com'],['Meta Business','https://business.facebook.com'],['Ads Manager','https://adsmanager.facebook.com'],['Instagram','https://www.instagram.com'],['WhatsApp Web','https://web.whatsapp.com'],['فحص الـ IP','https://ipinfo.io']]};
let store={...DEF,...(()=>{try{return JSON.parse(fs.readFileSync(FILE,'utf8'))}catch{return{}}})()};
const save=()=>{try{fs.writeFileSync(FILE,JSON.stringify(store,null,1))}catch(e){console.error('save',e.message)}};
// ── الدول: نفس COUNTRY_DB في mo.py (الكود | الاسم | التوقيت | اللغات) + اختيار مخصص
const CC={};'EG|مصر|Africa/Cairo|ar-EG,ar,en-US,en;SA|السعودية|Asia/Riyadh|ar-SA,ar,en-US,en;AE|الإمارات|Asia/Dubai|ar-AE,ar,en-US,en;KW|الكويت|Asia/Kuwait|ar-KW,ar,en-US,en;QA|قطر|Asia/Qatar|ar-QA,ar,en-US,en;BH|البحرين|Asia/Bahrain|ar-BH,ar,en-US,en;OM|عمان|Asia/Muscat|ar-OM,ar,en-US,en;JO|الأردن|Asia/Amman|ar-JO,ar,en-US,en;LB|لبنان|Asia/Beirut|ar-LB,ar,en-US,en;PH|الفلبين|Asia/Manila|en-PH,en,fil;KZ|كازاخستان|Asia/Almaty|ru-KZ,ru,kk,en-US,en;UZ|أوزبكستان|Asia/Tashkent|uz-UZ,uz,ru,en-US,en;AZ|أذربيجان|Asia/Baku|az-AZ,az,en-US,en;AM|أرمينيا|Asia/Yerevan|hy-AM,hy,en-US,en;GE|جورجيا|Asia/Tbilisi|ka-GE,ka,en-US,en;AU|أستراليا|Australia/Sydney|en-AU,en;NZ|نيوزيلندا|Pacific/Auckland|en-NZ,en;MM|ميانمار|Asia/Yangon|my-MM,my,en-US,en;KH|كمبوديا|Asia/Phnom_Penh|km-KH,km,en-US,en;AF|أفغانستان|Asia/Kabul|fa-AF,fa,en-US,en'.split(';').forEach(s=>{const[a,n,t,l]=s.split('|');CC[a]={n,t,l}});
// دولة مخصصة (مش في القائمة): لغة/توقيت احتياطي — والتوقيت الفعلي بيتحدد من موقع الـ IP وقت التشغيل
const XL={};'US|America/New_York|en-US,en;GB|Europe/London|en-GB,en;CA|America/Toronto|en-CA,en,fr-CA,fr;DE|Europe/Berlin|de-DE,de,en-US,en;FR|Europe/Paris|fr-FR,fr,en-US,en;ES|Europe/Madrid|es-ES,es,en-US,en;IT|Europe/Rome|it-IT,it,en-US,en;NL|Europe/Amsterdam|nl-NL,nl,en-US,en;PT|Europe/Lisbon|pt-PT,pt,en-US,en;BR|America/Sao_Paulo|pt-BR,pt,en-US,en;MX|America/Mexico_City|es-MX,es,en-US,en;BO|America/La_Paz|es-BO,es,en-US,en;CO|America/Bogota|es-CO,es,en-US,en;AR|America/Argentina/Buenos_Aires|es-AR,es,en-US,en;CL|America/Santiago|es-CL,es,en-US,en;PE|America/Lima|es-PE,es,en-US,en;EC|America/Guayaquil|es-EC,es,en-US,en;VE|America/Caracas|es-VE,es,en-US,en;TR|Europe/Istanbul|tr-TR,tr,en-US,en;IN|Asia/Kolkata|en-IN,en,hi;PK|Asia/Karachi|en-PK,en,ur;BD|Asia/Dhaka|bn-BD,bn,en-US,en;ID|Asia/Jakarta|id-ID,id,en-US,en;MY|Asia/Kuala_Lumpur|ms-MY,ms,en-US,en;TH|Asia/Bangkok|th-TH,th,en-US,en;VN|Asia/Ho_Chi_Minh|vi-VN,vi,en-US,en;JP|Asia/Tokyo|ja-JP,ja,en-US,en;KR|Asia/Seoul|ko-KR,ko,en-US,en;RU|Europe/Moscow|ru-RU,ru,en-US,en;UA|Europe/Kyiv|uk-UA,uk,ru,en-US,en;PL|Europe/Warsaw|pl-PL,pl,en-US,en;MA|Africa/Casablanca|ar-MA,ar,fr-FR,fr,en-US,en;DZ|Africa/Algiers|ar-DZ,ar,fr-FR,fr,en-US,en;TN|Africa/Tunis|ar-TN,ar,fr-FR,fr,en-US,en;LY|Africa/Tripoli|ar-LY,ar,en-US,en;SD|Africa/Khartoum|ar-SD,ar,en-US,en;IQ|Asia/Baghdad|ar-IQ,ar,en-US,en;NG|Africa/Lagos|en-NG,en;ZA|Africa/Johannesburg|en-ZA,en;KE|Africa/Nairobi|en-KE,en,sw'.split(';').forEach(s=>{const[a,t,l]=s.split('|');XL[a]={t,l}});
// دول إضافية في القايمة الأساسية (الأصلية فوق + دي) — الباقي بالكود المخصص
'US|الولايات المتحدة|America/New_York|en-US,en;GB|بريطانيا|Europe/London|en-GB,en;CA|كندا|America/Toronto|en-CA,en,fr-CA,fr;DE|ألمانيا|Europe/Berlin|de-DE,de,en-US,en;FR|فرنسا|Europe/Paris|fr-FR,fr,en-US,en;ES|إسبانيا|Europe/Madrid|es-ES,es,en-US,en;IT|إيطاليا|Europe/Rome|it-IT,it,en-US,en;NL|هولندا|Europe/Amsterdam|nl-NL,nl,en-US,en;BE|بلجيكا|Europe/Brussels|nl-BE,nl,fr-BE,fr,en-US,en;CH|سويسرا|Europe/Zurich|de-CH,de,fr-CH,fr,en-US,en;AT|النمسا|Europe/Vienna|de-AT,de,en-US,en;SE|السويد|Europe/Stockholm|sv-SE,sv,en-US,en;NO|النرويج|Europe/Oslo|nb-NO,nb,en-US,en;DK|الدنمارك|Europe/Copenhagen|da-DK,da,en-US,en;FI|فنلندا|Europe/Helsinki|fi-FI,fi,en-US,en;IE|أيرلندا|Europe/Dublin|en-IE,en;PT|البرتغال|Europe/Lisbon|pt-PT,pt,en-US,en;GR|اليونان|Europe/Athens|el-GR,el,en-US,en;PL|بولندا|Europe/Warsaw|pl-PL,pl,en-US,en;RO|رومانيا|Europe/Bucharest|ro-RO,ro,en-US,en;CZ|التشيك|Europe/Prague|cs-CZ,cs,en-US,en;HU|المجر|Europe/Budapest|hu-HU,hu,en-US,en;UA|أوكرانيا|Europe/Kyiv|uk-UA,uk,ru,en-US,en;RU|روسيا|Europe/Moscow|ru-RU,ru,en-US,en;TR|تركيا|Europe/Istanbul|tr-TR,tr,en-US,en;IQ|العراق|Asia/Baghdad|ar-IQ,ar,en-US,en;SY|سوريا|Asia/Damascus|ar-SY,ar,en-US,en;YE|اليمن|Asia/Aden|ar-YE,ar,en-US,en;PS|فلسطين|Asia/Gaza|ar-PS,ar,en-US,en;LY|ليبيا|Africa/Tripoli|ar-LY,ar,en-US,en;SD|السودان|Africa/Khartoum|ar-SD,ar,en-US,en;MA|المغرب|Africa/Casablanca|ar-MA,ar,fr-FR,fr,en-US,en;DZ|الجزائر|Africa/Algiers|ar-DZ,ar,fr-FR,fr,en-US,en;TN|تونس|Africa/Tunis|ar-TN,ar,fr-FR,fr,en-US,en;NG|نيجيريا|Africa/Lagos|en-NG,en;ZA|جنوب أفريقيا|Africa/Johannesburg|en-ZA,en;KE|كينيا|Africa/Nairobi|en-KE,en,sw;GH|غانا|Africa/Accra|en-GH,en;ET|إثيوبيا|Africa/Addis_Ababa|am-ET,am,en-US,en;TZ|تنزانيا|Africa/Dar_es_Salaam|sw-TZ,sw,en-US,en;IN|الهند|Asia/Kolkata|en-IN,en,hi;PK|باكستان|Asia/Karachi|en-PK,en,ur;BD|بنغلاديش|Asia/Dhaka|bn-BD,bn,en-US,en;LK|سريلانكا|Asia/Colombo|si-LK,si,ta,en-US,en;NP|نيبال|Asia/Kathmandu|ne-NP,ne,en-US,en;ID|إندونيسيا|Asia/Jakarta|id-ID,id,en-US,en;MY|ماليزيا|Asia/Kuala_Lumpur|ms-MY,ms,en-US,en;TH|تايلاند|Asia/Bangkok|th-TH,th,en-US,en;VN|فيتنام|Asia/Ho_Chi_Minh|vi-VN,vi,en-US,en;SG|سنغافورة|Asia/Singapore|en-SG,en,zh-SG,zh;HK|هونغ كونغ|Asia/Hong_Kong|zh-HK,zh,en-US,en;TW|تايوان|Asia/Taipei|zh-TW,zh,en-US,en;CN|الصين|Asia/Shanghai|zh-CN,zh,en-US,en;JP|اليابان|Asia/Tokyo|ja-JP,ja,en-US,en;KR|كوريا الجنوبية|Asia/Seoul|ko-KR,ko,en-US,en;BR|البرازيل|America/Sao_Paulo|pt-BR,pt,en-US,en;MX|المكسيك|America/Mexico_City|es-MX,es,en-US,en;AR|الأرجنتين|America/Argentina/Buenos_Aires|es-AR,es,en-US,en;CL|تشيلي|America/Santiago|es-CL,es,en-US,en;CO|كولومبيا|America/Bogota|es-CO,es,en-US,en;PE|بيرو|America/Lima|es-PE,es,en-US,en;EC|الإكوادور|America/Guayaquil|es-EC,es,en-US,en;VE|فنزويلا|America/Caracas|es-VE,es,en-US,en;BO|بوليفيا|America/La_Paz|es-BO,es,en-US,en;UY|أوروغواي|America/Montevideo|es-UY,es,en-US,en;PY|باراغواي|America/Asuncion|es-PY,es,en-US,en;DO|الدومينيكان|America/Santo_Domingo|es-DO,es,en-US,en;CR|كوستاريكا|America/Costa_Rica|es-CR,es,en-US,en;PA|بنما|America/Panama|es-PA,es,en-US,en'.split(';').forEach(s=>{const[a,n,t,l]=s.split('|');if(!CC[a])CC[a]={n,t,l}});
// باقي دول mo.py (COUNTRY_DB) عشان القايمة تبقى مطابقة
'BG|بلغاريا|Europe/Sofia|bg-BG,bg,en-US,en;CI|ساحل العاج|Africa/Abidjan|fr-CI,fr,en-US,en;CY|قبرص|Asia/Nicosia|el-CY,el,en-US,en;EE|إستونيا|Europe/Tallinn|et-EE,et,en-US,en;GT|غواتيمالا|America/Guatemala|es-GT,es,en-US,en;HR|كرواتيا|Europe/Zagreb|hr-HR,hr,en-US,en;IL|إسرائيل|Asia/Jerusalem|he-IL,he,en-US,en;IR|إيران|Asia/Tehran|fa-IR,fa,en-US,en;IS|أيسلندا|Atlantic/Reykjavik|is-IS,is,en-US,en;JM|جامايكا|America/Jamaica|en-JM,en;LT|ليتوانيا|Europe/Vilnius|lt-LT,lt,en-US,en;LV|لاتفيا|Europe/Riga|lv-LV,lv,en-US,en;PR|بورتوريكو|America/Puerto_Rico|es-PR,es,en-US,en;RS|صربيا|Europe/Belgrade|sr-RS,sr,en-US,en;SK|سلوفاكيا|Europe/Bratislava|sk-SK,sk,en-US,en;SN|السنغال|Africa/Dakar|fr-SN,fr,en-US,en;UG|أوغندا|Africa/Kampala|en-UG,en'.split(';').forEach(s=>{const[a,n,t,l]=s.split('|');if(!CC[a])CC[a]={n,t,l}});
const US_STATE_TZ={california:'America/Los_Angeles',washington:'America/Los_Angeles',oregon:'America/Los_Angeles',nevada:'America/Los_Angeles',arizona:'America/Phoenix',utah:'America/Denver',colorado:'America/Denver',newmexico:'America/Denver',montana:'America/Denver',idaho:'America/Boise',texas:'America/Chicago',illinois:'America/Chicago',minnesota:'America/Chicago',wisconsin:'America/Chicago',missouri:'America/Chicago',oklahoma:'America/Chicago',louisiana:'America/Chicago',alabama:'America/Chicago',tennessee:'America/Chicago',iowa:'America/Chicago',kansas:'America/Chicago',newyork:'America/New_York',florida:'America/New_York',georgia:'America/New_York',virginia:'America/New_York',ohio:'America/New_York',michigan:'America/Detroit',pennsylvania:'America/New_York',massachusetts:'America/New_York',newjersey:'America/New_York',alaska:'America/Anchorage',hawaii:'Pacific/Honolulu'};
const CC_RE=/^[A-Za-z]{2}(_[A-Za-z_]{2,28})?$/;
function cinfo(raw){const code=String(raw||'').toUpperCase().slice(0,2),k=CC[code];
 if(k){const d={...k,known:true};if(code==='US'&&raw.includes('_'))d.t=US_STATE_TZ[raw.split('_').slice(1).join('').toLowerCase()]||d.t;return d}
 const x=XL[code]||{};const d={n:code,t:x.t||'',l:x.l||'en-US,en',known:false};
 if(code==='US'&&raw.includes('_'))d.t=US_STATE_TZ[raw.split('_').slice(1).join('').toLowerCase()]||d.t;return d}
// ── الأجهزة: نفس PRESETS في mo.py
const A=(m,av,w,h,d)=>({m,av,w,h,d,p:'Linux armv81',and:true});
const DEV={'Pixel 8':A('Pixel 8',14,412,915,2.625),'Pixel 7':A('Pixel 7',14,412,915,2.625),'Galaxy S23':A('SM-S911B',14,360,780,3),'Galaxy S24':A('SM-S921B',14,360,780,3),'Galaxy A54':A('SM-A546E',14,360,800,3),'Galaxy A34':A('SM-A346E',14,360,800,3),'Redmi Note 12':A('23021RAAEG',13,393,873,2.75),'Xiaomi 13':A('2211133G',14,393,873,2.75),'OnePlus 11':A('CPH2449',14,412,919,3.5),'Realme 11':A('RMX3636',14,360,800,3),
 'iPhone 15':{m:'',av:'',w:393,h:852,d:3,p:'iPhone',and:false,ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'}};
const WEST=new Set('US CA GB IE DE FR ES IT PT NL BE CH AT SE NO DK FI AU NZ JP KR SG IL IS HK TW'.split(' ')),P_W=['Pixel 8','Pixel 7','Galaxy S23','Galaxy S24','OnePlus 11'],P_O=['Galaxy A54','Galaxy A34','Redmi Note 12','Xiaomi 13','Realme 11','Galaxy S23','Pixel 7'];
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const pickDev=(sid,cc)=>{const p=WEST.has(cc)?P_W:P_O;return p[hash(sid)%p.length]};
const validTz=t=>{try{new Intl.DateTimeFormat('en',{timeZone:t});return true}catch{return false}};
// ── يوزر البروكسي: نفس proxy_username في mo.py ({user}-cc-{cc} + sessid ثابت)
const proxyUser=(cc,sid)=>{if(E.PROXY_MODE==='plain')return E.PROXY_USER;const t=E.PROXY_TEMPLATE||'{user}-cc-{cc}';
 let u=t.split('{user}').join(E.PROXY_USER).split('{cc}').join(cc).split('{sid}').join(sid);
 if(E.PROXY_STICKY!=='0'&&!u.includes('sessid'))u+=`-sessid-${sid}-sesstime-${+E.PROXY_SESSTIME||30}`;return u};
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
 let r;try{r=await fetch(API+p,{method:m,headers:{Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:m==='GET'?undefined:JSON.stringify(body),signal:AbortSignal.timeout(60000)})}
 catch(e){throw new Error(e.name==='TimeoutError'?'خدمة CloudBrowser مردتش خلال 60 ثانية':'مقدرتش أوصل لـ CloudBrowser: '+(e.cause&&e.cause.code||e.message))}
 const raw=await r.text(),j=(()=>{try{return JSON.parse(raw)}catch{return{}}})();const s=r.ok?(j.status||200):r.status;
 if(s!==200)throw new Error(({401:'التوكن غلط',402:'مفيش اشتراك فعّال',403:'الوحدات خلصت',404:'وصلت أقصى عدد متصفحات متوازية'})[s]||`خطأ من الخدمة (${s}) ${(j.message||j.title||j.error||raw||'').toString().slice(0,160)}`);return j};
const bUid=a=>String(a||'').split('/').filter(Boolean).pop();
// قفل المتصفح فعلياً + تحقق من قايمة الخدمة (/Browser/Get) + إعادة محاولة
async function closeBrowser(addr,L=console.log){const id=bUid(addr),tries=[addr,String(addr).replace(/^wss?:\/\//i,'')];
 for(let k=0;k<3;k++){
  try{await cb('/Browser/Close',{address:tries[k%2]})}catch(e){L('Close فشل:',e.message)}
  try{const g=await cb('/Browser/Get',undefined,'GET'),list=g.browsers||g.Browsers||[];
   if(!list.some(b=>bUid(b.address||b.Address)===id)){L('✔ المتصفح اتقفل فعلاً');return true}
   L('لسه ظاهر في قايمة الخدمة — بحاول تاني ('+(k+1)+')')}catch(e){L('تعذّر التحقق من القفل:',e.message);return null}
  await new Promise(r=>setTimeout(r,1000))}
 L('⚠ المتصفح لسه مفتوح — هيتقفل تلقائياً بعد مهلة KeepOpen');return false}
// ── اختبار البروكسي: CONNECT يدوي (من غير مكتبات) ثم TLS لخدمة الـ IP
function viaProxy(user,pass,target={host:'ipinfo.io',port:443,path:'/json'},tlsOpts={},ph=E.PROXY_HOST||'pr.oxylabs.io',pp=+E.PROXY_PORT||7777,ms=15000){
 return new Promise((ok,no)=>{const t0=Date.now();let done=false,sock,tm;
  const fin=(e,v)=>{if(done)return;done=true;clearTimeout(tm);try{sock.destroy()}catch{}e?no(e):ok(v)};
  sock=net.connect(pp,ph);tm=setTimeout(()=>fin(new Error('البروكسي مردش خلال '+ms/1000+' ثانية')),ms);
  sock.on('error',e=>fin(new Error('مقدرتش أوصل للبروكسي: '+e.message)));
  sock.once('connect',()=>sock.write(`CONNECT ${target.host}:${target.port} HTTP/1.1\r\nHost: ${target.host}:${target.port}\r\nProxy-Authorization: Basic ${Buffer.from(user+':'+pass).toString('base64')}\r\n\r\n`));
  let buf='';const onD=d=>{buf+=d.toString('latin1');if(buf.indexOf('\r\n\r\n')<0)return;sock.off('data',onD);
   const code=+((buf.match(/^HTTP\/1\.\d (\d+)/)||[])[1]||0);
   if(code!==200)return fin(new Error(code===407?'البروكسي رفض اليوزر/الباسورد (407)':'البروكسي رد بـ '+(code||'رد غير مفهوم')));
   const ts=tls.connect({socket:sock,servername:target.host,...tlsOpts});let out='';
   ts.on('error',e=>fin(new Error('فشل TLS: '+e.message)));ts.on('data',d=>out+=d.toString('utf8'));
   ts.on('close',()=>{const a=out.indexOf('{'),z=out.lastIndexOf('}');try{fin(null,{...JSON.parse(out.slice(a,z+1)),ms:Date.now()-t0})}catch{fin(new Error('رد غير مفهوم من خدمة الـ IP'))}});
   ts.write(`GET ${target.path} HTTP/1.1\r\nHost: ${target.host}\r\nUser-Agent: curl/8\r\nAccept: application/json\r\nConnection: close\r\n\r\n`)};
  sock.on('data',onD)})}
// حماية WebRTC: منع STUN/TURN (مصدر تسريب الـ IP الحقيقي) بإجبار iceServers فاضية
const RTC_JS=`(()=>{try{const O=window.RTCPeerConnection;if(!O)return;const fix=c=>{c=Object.assign({},c||{});c.iceServers=[];return c};
const W=function(c,...r){return new O(fix(c),...r)};W.prototype=O.prototype;W.generateCertificate=O.generateCertificate;
window.RTCPeerConnection=W;if(window.webkitRTCPeerConnection)window.webkitRTCPeerConnection=W;
const sc=O.prototype.setConfiguration;O.prototype.setConfiguration=function(c){return sc.call(this,fix(c))}}catch(e){}})();`;
const norm=u=>{u=(u||'').trim()||'https://ipinfo.io';return/^[a-z][\w+.-]*:\/\//i.test(u)?u:'https://'+u};
const KC={Backspace:8,Tab:9,Enter:13,Escape:27,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Delete:46};
class Slot{
 constructor(i){this.i=i;this.clients=new Set();this.st='idle';this.n=0;this.pend=new Map();this.gen=0}
 meta(){const s=store.slots[this.i]||{};return{i:this.i,st:this.st,err:this.err,stp:this.stp,url:this.url,name:s.name,country:s.country,device:this.devName||s.device,w:this.vw||(this.dev&&this.dev.w),h:this.vh||(this.dev&&this.dev.h),big:!!this.vw,reused:this.reused,geo:this.geo}}
 push(o){const m=JSON.stringify(o);this.clients.forEach(c=>c.readyState===1&&c.send(m))}
 set(st,err){this.st=st;this.err=err;this.push({t:'state',s:this.meta()})}
 send(method,params={},sid=this.sid){return new Promise((ok,no)=>{if(!this.ws||this.ws.readyState!==1)return no(new Error('المتصفح مش متصل'));const id=++this.n;this.pend.set(id,{ok,no});this.ws.send(JSON.stringify({id,method,params,sessionId:sid}));setTimeout(()=>this.pend.delete(id)&&no(new Error('انتهت المهلة: '+method)),20000)})}
 step(t){this.stp=t;this.push({t:'state',s:this.meta()})}
 async ipGeo(L){for(const u of ['https://ipinfo.io/json','https://ipapi.co/json/']){
   try{const r=await this.send('Runtime.evaluate',{expression:`fetch(${JSON.stringify(u)},{cache:'no-store'}).then(r=>r.json()).then(j=>({ip:j.ip,cc:j.country||j.country_code,tz:j.timezone}))`,awaitPromise:true,returnByValue:true,timeout:12000});
    const v=r.result&&r.result.value;if(v&&v.tz&&validTz(v.tz))return v;L('ip lookup فاضي من',u)}catch(e){L('ip lookup فشل',u,e.message)}}return null}
 async start(c){
  const t0=Date.now(),L=(...a)=>console.log(`[slot ${this.i}] +${((Date.now()-t0)/1000).toFixed(1)}s`,...a);
  await this.stop(true);const gen=this.gen;
  // هوية ثابتة: نفس الـ sid (IP + جهاز + جلسة محفوظة) طول ما الدولة هي هي — جلسة جديدة لو newip أو الدولة اتغيرت
  const raw0=String(c.country||'EG').trim(),sv0=store.slots[this.i]||{},same=String(sv0.country||'').toUpperCase()===raw0.toUpperCase();
  let sid=c.newip?'':(c.sid||(same&&sv0.sid)||'');const reused=!!sid;if(!sid)sid=Math.random().toString(36).slice(2,12);this.reused=reused;
  const raw=String(c.country||'EG').trim(),cc2=raw.toUpperCase().slice(0,2),pcc=raw.length>2?raw:raw.toUpperCase(),info=cinfo(raw),
   dn=DEV[c.device]?c.device:pickDev(sid,cc2),dev=DEV[dn];
  store.slots[this.i]={name:c.name||'Profile '+(this.i+1),country:raw,device:c.device||'auto',url:c.url,sid};save();
  this.dev=dev;this.devName=dn;this.url=c.url;this.last=null;this.geo=null;this.vw=this.vh=null;this.stp='';this.set('starting');
  L('start',{country:raw,proxyCC:pcc,device:dn,proxy:!!E.PROXY_USER});
  try{
   this.step('بيطلب متصفح من CloudBrowser...');
   const body={Stealth:true,Browser:0,KeepOpen:120,Headless:false,Label:'bt-'+this.i+'-'+sid};
   if(E.PROXY_USER)body.Proxy={Host:E.PROXY_HOST||'pr.oxylabs.io',Port:String(E.PROXY_PORT||7777),Username:proxyUser(pcc,sid),Password:E.PROXY_PASS||''};
   const extra={};if(E.WEBRTC_ARGS==='1')extra.Args=['--force-webrtc-ip-handling-policy=disable_non_proxied_udp'];
   if(E.PERSIST_SESSION!=='0'){extra.SaveSession=true;extra.RecoverSession=reused}
   Object.assign(body,extra);L(reused?'♻ جلسة محفوظة (نفس الـ IP والجهاز)':'✨ جلسة جديدة',{sid,persist:E.PERSIST_SESSION!=='0'});
   let r;try{r=await cb('/Browser/Open',body)}catch(e){if(Object.keys(extra).length&&/^خطأ من الخدمة/.test(e.message)){L('الخدمة رفضت الخيارات الإضافية — بحاول من غيرها:',e.message);for(const k in extra)delete body[k];r=await cb('/Browser/Open',body)}else throw e}if(!r.address)throw new Error('CloudBrowser رجّع رد من غير address: '+JSON.stringify(r).slice(0,120));
   if(gen!==this.gen){L('اتوقف أثناء التشغيل — بقفل المتصفح');await closeBrowser(r.address,L);return}
   this.addr=r.address;L('opened',r.address);
   this.step('بيوصل بالمتصفح (CDP)...');
   const url=/^wss?:/i.test(r.address)?r.address.replace(/^ws:\/\/(?!127\.0\.0\.1|localhost)/i,'wss://'):'wss://'+r.address;
   this.ws=new WebSocket(url,{followRedirects:true,maxRedirects:5});
   await new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('الاتصال بالمتصفح (CDP) اتأخر أكتر من 25 ثانية')),25000);
    this.ws.once('open',()=>{clearTimeout(t);ok()});
    this.ws.once('unexpected-response',(q,res)=>{clearTimeout(t);no(new Error('المتصفح رفض الاتصال (HTTP '+res.statusCode+')'))});
    this.ws.once('error',e=>{clearTimeout(t);no(new Error('فشل الاتصال بالمتصفح: '+e.message))})});
   this.ws.on('message',d=>this.onMsg(d));this.ws.on('error',e=>L('ws error',e.message));
   this.ws.on('close',()=>{L('ws closed');clearInterval(this.pollT);if(this.st==='live'||this.st==='starting'){this.ws=null;this.set('idle','المتصفح اتقفل (انتهت المدة أو اتقفل من الخدمة)')}});
   L('cdp connected');this.step('بيجهّز وضع الموبايل...');
   const v=await this.send('Browser.getVersion'),full=(v.product.split('/')[1]||'140.0.0.0'),major=full.split('.')[0];
   const{targetInfos}=await this.send('Target.getTargets');const pg=targetInfos.find(t=>t.type==='page');
   const tid=pg?pg.targetId:(await this.send('Target.createTarget',{url:'about:blank'})).targetId;
   this.sid=(await this.send('Target.attachToTarget',{targetId:tid,flatten:true})).sessionId;
   const S=(m,p)=>this.send(m,p),soft=(m,p)=>this.send(m,p).catch(e=>L('تحذير',m,e.message));
   await S('Page.enable');await S('Runtime.enable');
   const ua=dev.and?`Mozilla/5.0 (Linux; Android ${dev.av}; ${dev.m}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`:dev.ua;
   const ucmd={userAgent:ua,acceptLanguage:info.l,platform:dev.p};
   if(dev.and)ucmd.userAgentMetadata={brands:[{brand:'Chromium',version:major},{brand:'Google Chrome',version:major},{brand:'Not=A?Brand',version:'24'}],fullVersionList:[{brand:'Chromium',version:full},{brand:'Google Chrome',version:full},{brand:'Not=A?Brand',version:'24.0.0.0'}],platform:'Android',platformVersion:dev.av+'.0.0',architecture:'',model:dev.m,mobile:true,bitness:'',wow64:false};
   await soft('Emulation.setDeviceMetricsOverride',{width:dev.w,height:dev.h,deviceScaleFactor:dev.d,mobile:true});
   await soft('Emulation.setUserAgentOverride',ucmd);
   await soft('Emulation.setLocaleOverride',{locale:info.l.split(',')[0]});
   await soft('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
   await soft('Page.setBypassCSP',{enabled:true});
   // التوقيت: من موقع الـ IP الفعلي (أدق من الدولة) — لو فشل نرجع لتوقيت الدولة
   this.step('بيحدد توقيت الـ IP...');let tz=info.t;const g=await this.ipGeo(L);
   if(g){tz=g.tz;this.geo={ip:g.ip,cc:g.cc,tz:g.tz};L('IP',g.ip,g.cc,g.tz);
    if(g.cc&&g.cc.toUpperCase()!==cc2)this.push({t:'toast',v:`⚠ الـ IP طالع من ${g.cc} مش ${cc2} — راجع كود الدولة أو البروكسي`})}
   else L('مقدرتش أحدد توقيت الـ IP — هستخدم توقيت الدولة:',tz||'(مفيش)');
   if(tz)await soft('Emulation.setTimezoneOverride',{timezoneId:tz});
   await S('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const d=(o,k,v)=>{try{Object.defineProperty(o,k,{get:()=>v,configurable:true})}catch(e){}};d(navigator,'platform',${JSON.stringify(dev.p)});d(navigator,'languages',${JSON.stringify(info.l.split(','))});d(navigator,'maxTouchPoints',5);window.open=u=>{if(u)location.href=u;return window};document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[target]');if(a)a.target='_self'},true)})();`});
   if(E.WEBRTC_PROTECT!=='0')await soft('Page.addScriptToEvaluateOnNewDocument',{source:RTC_JS});
   await soft('Page.bringToFront');
   await S('Page.startScreencast',{format:'jpeg',quality:72,maxWidth:Math.round(dev.w*1.5),maxHeight:Math.round(dev.h*1.5),everyNthFrame:1});
   this.step('بيفتح الصفحة...');const nv=await S('Page.navigate',{url:norm(c.url)});this.set('live');L('live');
   if(nv&&nv.errorText){L('⚠ فشل تحميل الصفحة:',nv.errorText);this.push({t:'toast',v:'⚠ فشل تحميل الصفحة: '+nv.errorText+(/PROXY|TUNNEL|CONNECTION/.test(nv.errorText)?' — غالباً البروكسي (جرّب 🧪)':'')})}
   clearInterval(this.pollT);this.lastFrameAt=Date.now();this.pollT=setInterval(()=>this.snap(),1000);
   setTimeout(()=>{if(this.st==='live'&&!this.last)L('⚠ لسه مجاش أي فريم شاشة بعد 10 ثواني')},10000);
  }catch(e){if(gen!==this.gen){L('اتوقف بواسطة المستخدم');return}const m=e.message;L('FAILED:',m);await this.stop(true);this.set('error',m)}
 }
 async stop(quiet){this.gen++;clearInterval(this.pollT);const a=this.addr;this.addr=null;if(this.ws){const w=this.ws;this.ws=null;try{w.close()}catch{}}
  if(a)await closeBrowser(a,(...x)=>console.log(`[slot ${this.i}]`,...x));this.pend.clear();if(!quiet)this.set('idle')}
 onMsg(d){let m;try{m=JSON.parse(d)}catch{return}
  if(m.id){const p=this.pend.get(m.id);if(p){this.pend.delete(m.id);m.error?p.no(new Error(m.error.message)):p.ok(m.result)}return}
  const q=m.params||{};
  if(m.method==='Page.screencastFrame'){this.frame(Buffer.from(q.data,'base64'));this.send('Page.screencastFrameAck',{sessionId:q.sessionId}).catch(()=>{})}
  else if(m.method==='Runtime.consoleAPICalled'){const a=q.args&&q.args[0];if(a&&typeof a.value==='string'&&a.value.startsWith('__MP__'))try{const p=JSON.parse(a.value.slice(6));this.push({t:'msg',k:p.t,id:p.id,v:p.v})}catch{}}
  else if(m.method==='Page.frameNavigated'&&!q.frame.parentId){this.url=q.frame.url;this.push({t:'url',u:this.url});if(/^chrome-error:/.test(this.url))setTimeout(()=>this.pageErr(),500)}
  else if(m.method==='Page.javascriptDialogOpening')this.send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{})}
 frame(b){this.last=b;this.lastFrameAt=Date.now();this.clients.forEach(c=>c.readyState===1&&c.bufferedAmount<3e6&&c.send(b))}
 // احتياطي: لو الـ screencast سكت أكتر من ثانيتين نجيب لقطة شاشة (الصفحة الثابتة مبتبعتش فريمات)
 async snap(){if(this.st!=='live'||!this.ws||this.snapping||Date.now()-(this.lastFrameAt||0)<2000)return;this.snapping=true;
  try{const r=await this.send('Page.captureScreenshot',{format:'jpeg',quality:70});this.frame(Buffer.from(r.data,'base64'))}catch{}this.snapping=false}
 async pageErr(){try{const r=await this.send('Runtime.evaluate',{expression:"(document.querySelector('.error-code')||{}).textContent||document.title",returnByValue:true}),c=String(r.result&&r.result.value||'');
  console.log(`[slot ${this.i}] ⚠ صفحة خطأ:`,c);this.push({t:'toast',v:'⚠ الصفحة فشلت: '+c+(/PROXY|TUNNEL/.test(c)?' — البروكسي مش شغال بالدولة دي (جرّب 🧪)':'')})}catch{}}
 async shot(mw,mh){await this.send('Page.stopScreencast').catch(()=>{});await this.send('Page.startScreencast',{format:'jpeg',quality:72,maxWidth:Math.round(mw),maxHeight:Math.round(mh),everyNthFrame:1})}
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
  case'view':{if(this.st!=='live')return;const d=this.dev;
   if(m.reset||!m.w){this.vw=this.vh=null;await this.send('Emulation.setDeviceMetricsOverride',{width:d.w,height:d.h,deviceScaleFactor:d.d,mobile:true});await this.shot(d.w*1.5,d.h*1.5)}
   else{const w=Math.max(320,Math.min(2560,m.w|0)),h=Math.max(320,Math.min(1600,m.h|0));this.vw=w;this.vh=h;await this.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});await this.shot(w,h)}
   this.push({t:'state',s:this.meta()});return}
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
app.get('/api/state',(q,r)=>r.json({slots:slots.map(s=>s.meta()),scripts:store.scripts,links:store.links,saved:store.slots,countries:Object.entries(CC).map(([k,v])=>[k,v.n]),devices:Object.keys(DEV),hasKey:!!KEY,inst:INST,up:Math.round((Date.now()-BOOT)/1000)}));
app.post('/api/slot/:i/start',wrap(async(q,r)=>{const s=slotOf(q,r);if(!s)return;if(s.st==='starting')return{ok:1,busy:1};
 const b=q.body||{};if(b.country&&!CC_RE.test(String(b.country).trim()))throw new Error('كود الدولة غير صالح (حرفين مثل BO، أو us_california)');
 s.start(b).catch(e=>{console.error('[slot '+s.i+'] start crash',e);s.set('error',e.message)});return{ok:1}}));
app.post('/api/slot/:i/proxytest',wrap(async(q,r)=>{const s=slotOf(q,r);if(!s)return;if(!E.PROXY_USER)throw new Error('مفيش بروكسي متضبط (PROXY_USER)');
 const b=q.body||{},raw=String(b.country||'EG').trim();if(!CC_RE.test(raw))throw new Error('كود الدولة غير صالح');
 const pcc=raw.length>2?raw:raw.toUpperCase(),sv=store.slots[s.i]||{},saved=!b.newip&&sv.sid&&String(sv.country||'').toUpperCase()===raw.toUpperCase(),
  sid=saved?sv.sid:Math.random().toString(36).slice(2,12),j=await viaProxy(proxyUser(pcc,sid),E.PROXY_PASS||'');
 return{ip:j.ip,cc:j.country||j.country_code||'',tz:j.timezone||'',city:j.city||'',ms:j.ms,saved:!!saved,match:String(j.country||j.country_code||'').toUpperCase()===raw.toUpperCase().slice(0,2)}}));
app.post('/api/slot/:i/stop',wrap(async(q,r)=>{const s=slotOf(q,r);if(s)await s.stop()}));
app.post('/api/slot/:i/cookies',wrap(async(q,r)=>{const s=slotOf(q,r);if(s)return s.cookies(q.body.text)}));
app.get('/api/slot/:i/cookies',wrap(async(q,r)=>{const s=slotOf(q,r);if(s)return{cookies:(await s.send('Network.getAllCookies')).cookies}}));
app.put('/api/scripts',wrap(async q=>{if(!Array.isArray(q.body))throw new Error('صيغة غلط');store.scripts=q.body.filter(x=>x&&x.id&&x.name);save()}));
app.put('/api/links',wrap(async q=>{if(!Array.isArray(q.body))throw new Error('صيغة غلط');store.links=q.body.filter(x=>x&&x[1]);save()}));
const srv=http.createServer(app),wss=new WebSocket.Server({noServer:true});
srv.on('upgrade',(req,sock,head)=>{const u=new URL(req.url,'http://x'),s=slots[+u.searchParams.get('slot')];if(u.pathname!=='/ws'||!s||!authed(req))return sock.destroy();wss.handleUpgrade(req,sock,head,ws=>{ws.on('error',()=>{});s.clients.add(ws);ws.send(JSON.stringify({t:'state',s:s.meta()}));if(s.last)ws.send(s.last);ws.on('message',d=>{try{s.cmd(JSON.parse(d))}catch{}});ws.on('close',()=>s.clients.delete(ws))})});
setInterval(()=>wss.clients.forEach(c=>c.readyState===1&&c.ping()),25000);
// تنضيف أي متصفحات فاضلة من تشغيل سابق (بنعرفها من الـ label اللي بيبدأ بـ bt-)
(async()=>{if(!KEY)return;try{const g=await cb('/Browser/Get',undefined,'GET');for(const b of g.browsers||g.Browsers||[]){if(String(b.label||b.Label||'').startsWith('bt-'))await closeBrowser(b.address||b.Address,(...x)=>console.log('[cleanup]',...x))}}catch(e){console.log('[cleanup] skip:',e.message)}})();
const bye=async()=>{await Promise.all(slots.map(s=>s.stop(true)));process.exit(0)};process.on('SIGTERM',bye);process.on('SIGINT',bye);
srv.listen(E.PORT||3000,()=>console.log('Browsery Tools Cloud on :'+(E.PORT||3000)+(KEY?'':' (⚠ CLOUDBROWSER_API_KEY missing)')));
