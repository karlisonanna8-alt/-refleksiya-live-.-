// Живая рефлексия «Чемпионат рефлексии» — сервер без внешних зависимостей (Node 18+)
'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000;
const PUB=path.join(__dirname,'public');
const DATA=process.env.DATA_FILE||path.join(__dirname,'data','rooms.json');
const STAGES=5,OPTS=4,ROOM_TTL=48*3600e3,ONLINE_MS=12e3;
const ALPH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let rooms={};
try{rooms=JSON.parse(fs.readFileSync(DATA,'utf8'));}catch(e){}
let dirty=false;
setInterval(()=>{const now=Date.now();for(const c in rooms)if(now-rooms[c].touched>ROOM_TTL){delete rooms[c];dirty=true;}
  if(dirty){dirty=false;try{fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.writeFileSync(DATA+'.tmp',JSON.stringify(rooms));fs.renameSync(DATA+'.tmp',DATA);}catch(e){console.error('save',e.message);}}},5000).unref();
function newCode(){let c;do{c='';for(let i=0;i<4;i++)c+=ALPH[crypto.randomInt(ALPH.length)];}while(rooms[c]);return c;}
function counts(r){const v=Array.from({length:STAGES},()=>Array(OPTS).fill(0)),voters=Array(STAGES).fill(0);
  for(const d in r.ballots){const b=r.ballots[d];for(const s in b){if(b[s].length)voters[s]++;b[s].forEach(k=>v[s][k]++);}}return {votes:v,voters};}
function pub(r,device){const now=Date.now();let online=0;for(const d in r.seen)if(now-r.seen[d]<ONLINE_MS)online++;
  const c=counts(r);const o={code:r.code,screen:r.screen,stage:r.stage,rev:r.rev,votes:c.votes,voters:c.voters,online,devices:Object.keys(r.seen).length};
  if(device){o.mine=(r.ballots[device]||{})[r.stage]||[];}return o;}
function send(res,code,obj,type){const body=typeof obj==='string'||Buffer.isBuffer(obj)?obj:JSON.stringify(obj);
  res.writeHead(code,{'Content-Type':type||'application/json; charset=utf-8','Cache-Control':type&&type.startsWith('image')?'public, max-age=604800':'no-store'});res.end(body);}
function readBody(req){return new Promise(ok=>{let b='';req.on('data',d=>{b+=d;if(b.length>1e4)req.destroy();});req.on('end',()=>{try{ok(JSON.parse(b||'{}'));}catch(e){ok({});}});});}
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
function file(res,p){const f=path.join(PUB,p);if(!f.startsWith(PUB))return send(res,404,'');fs.readFile(f,(e,d)=>e?send(res,404,{error:'нет'}):send(res,200,d,MIME[path.extname(f)]||'application/octet-stream'));}
const okDev=d=>typeof d==='string'&&/^[a-zA-Z0-9_-]{8,64}$/.test(d);
http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://x');const p=u.pathname;
  try{
  if(p==='/favicon.ico'){res.writeHead(204);return res.end();}
  if(req.method==='GET'&&(p==='/'||p==='/board'))return file(res,'board.html');
  if(req.method==='GET'&&/^\/[A-Za-z0-9]{4}$/.test(p))return file(res,'phone.html');
  if(req.method==='GET'&&p==='/healthz')return send(res,200,{ok:true,rooms:Object.keys(rooms).length});
  if(req.method==='POST'&&p==='/api/room'){const code=newCode(),key=crypto.randomBytes(12).toString('hex');
    rooms[code]={code,key,screen:'lobby',stage:0,rev:1,ballots:{},seen:{},created:Date.now(),touched:Date.now()};dirty=true;return send(res,200,{code,key});}
  let m=p.match(/^\/api\/room\/([A-Za-z0-9]{4})\/(state|vote|control)$/);
  if(m){const r=rooms[m[1].toUpperCase()];if(!r)return send(res,404,{error:'Комната не найдена'});r.touched=Date.now();
    if(m[2]==='state'){const d=u.searchParams.get('d');if(okDev(d))r.seen[d]=Date.now();return send(res,200,pub(r,okDev(d)?d:null));}
    const b=await readBody(req);
    if(m[2]==='vote'){if(!okDev(b.device))return send(res,400,{error:'Нет идентификатора устройства'});
      r.seen[b.device]=Date.now();
      if(r.screen!=='stage'||b.stage!==r.stage)return send(res,409,{error:'Этап уже закрыт',state:pub(r,b.device)});
      let ch=Array.isArray(b.choices)?[...new Set(b.choices.filter(k=>Number.isInteger(k)&&k>=0&&k<OPTS))]:[];
      if(r.stage!==3&&ch.length>1)ch=ch.slice(0,1);
      (r.ballots[b.device]=r.ballots[b.device]||{})[r.stage]=ch;r.rev++;dirty=true;return send(res,200,pub(r,b.device));}
    if(m[2]==='control'){if(b.key!==r.key)return send(res,403,{error:'Нет доступа'});
      if(b.action==='goto'&&Number.isInteger(b.stage)&&b.stage>=0&&b.stage<STAGES){r.screen='stage';r.stage=b.stage;}
      else if(b.action==='final')r.screen='final';else if(b.action==='lobby')r.screen='lobby';
      else if(b.action==='close'){delete rooms[r.code];dirty=true;return send(res,200,{ok:true});}
      r.rev++;dirty=true;return send(res,200,pub(r));}
  }
  if(req.method==='GET'&&/^\/[a-z0-9_.\/-]+\.(js|css|jpg|png|svg)$/i.test(p)&&!p.includes('..'))return file(res,p);
  send(res,404,{error:'Не найдено'});
  }catch(e){console.error(e);send(res,500,{error:'Ошибка сервера'});}
}).listen(PORT,()=>console.log('Рефлексия запущена на порту',PORT));
