"use strict";
const $=id=>document.getElementById(id);
const LS='rf-live-board';
let B={code:null,key:null,muted:false,sw:{acc:0,run:false,t0:0}};
try{Object.assign(B,JSON.parse(localStorage.getItem(LS)||'{}'));}catch(e){}
const saveB=()=>{try{localStorage.setItem(LS,JSON.stringify(B));}catch(e){}};
let ST=null,prevTot=-1,lastScreen=null,lastStage=-1,_k=1;
const joinUrl=()=>location.origin+'/'+B.code;
const shortUrl=()=>location.host+'/'+B.code;
async function api(p,body){const r=await fetch(p,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||r.status);e.status=r.status;throw e;}return j;}
async function newRoom(){const j=await api('/api/room',{});B.code=j.code;B.key=j.key;B.sw={acc:0,run:false,t0:0};saveB();ST=null;prevTot=-1;lastScreen=null;drawQR();await poll();}
function qrSvg(text){const q=qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:8,margin:2,scalable:true});}
function drawQR(){const s=qrSvg(joinUrl());$('qrBig').innerHTML=s;$('qrSmall').innerHTML=s;$('codeBig').textContent=B.code;$('codeSmall').textContent=B.code;$('urlBig').textContent=shortUrl();$('urlSmall').textContent=shortUrl();}
/* audio */
const AU={ctx:null,init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;try{this.ctx=new C();this.out=this.ctx.createGain();this.out.gain.value=.8;this.out.connect(this.ctx.destination);const n=this.ctx.sampleRate,b=this.ctx.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;this.nb=b;}catch(e){this.ctx=null;}},
 t(f,a,d,ty,v,sl){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(f,a);if(sl)o.frequency.exponentialRampToValueAtTime(sl,a+d);g.gain.setValueAtTime(0,a);g.gain.linearRampToValueAtTime(v,a+.01);g.gain.exponentialRampToValueAtTime(.0001,a+d);o.connect(g);g.connect(this.out);o.start(a);o.stop(a+d+.05);},
 n(a,d,v,f){const c=this.ctx,s=c.createBufferSource();s.buffer=this.nb;const fl=c.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f;const g=c.createGain();g.gain.setValueAtTime(0,a);g.gain.linearRampToValueAtTime(v,a+d*.3);g.gain.exponentialRampToValueAtTime(.0001,a+d);s.connect(fl);fl.connect(g);g.connect(this.out);s.start(a);s.stop(a+d);},
 play(k){if(B.muted||!this.ctx)return;if(this.ctx.state==='suspended')this.ctx.resume();const a=this.ctx.currentTime+.01,f=m=>440*Math.pow(2,(m-69)/12);
  if(k==='vote'){this.t(880,a,.1,'triangle',.22,1500);}
  if(k==='nav'){this.n(a,.25,.16,1800);this.t(f(76),a+.05,.15,'sine',.12);}
  if(k==='fanfare'){[[67,71,74],[67,71,74],[72,76,79],[74,78,81],[79,83,86]].forEach((ch,i)=>ch.forEach(m=>this.t(f(m),a+i*.22,i===4?1.4:.2,'sawtooth',.06)));this.n(a,2.6,.12,900);}}};
addEventListener('pointerdown',()=>AU.init(),{once:true});
/* layout */
function fit(){const w=innerWidth,h=innerHeight,st=$('stage');_k=Math.min(w/1600,h/900);st.style.transform=`translate(-50%,-50%) scale(${_k})`;$('confetti').width=1600;$('confetti').height=900;}
const sum=a=>a.reduce((x,y)=>x+y,0);
function ranks(arr){const d=[...new Set(arr.filter(v=>v>0))].sort((a,b)=>b-a);return arr.map(v=>v>0?d.indexOf(v):-1);}
function renderTabs(){const s=ST||{screen:'lobby',stage:0,votes:STAGES.map(()=>[0,0,0,0])};
  $('tabs').innerHTML=STAGES.map((x,i)=>`<button class="tab ${s.screen==='stage'&&s.stage===i?'on':''} ${sum(s.votes[i])>0?'done':''}" data-i="${i}" title="${x.q}">${i+1}<small>${x.tab}</small></button>`).join('')+
  `<button class="tab ${s.screen==='final'?'on':''}" data-i="f" title="Награждение">${medalSvg('g').replace('class="medal show"','width="34" height="34"')}<small>Награды</small></button>`;}
function show(id){['lob','stg','fin'].forEach(x=>$(x).classList.toggle('on',x===id));}
function buildStage(i){const st=STAGES[i];
  $('banner').style.backgroundImage=`url(${PHOTO(st.photo)})`;$('stn').textContent=`ЭТАП ${i+1} из 5`;$('bLab').textContent=st.ph;
  $('kick').textContent=st.kick;$('qTitle').textContent=st.q;$('qNote').textContent=st.multi?'На телефоне можно отметить несколько вариантов':'Голосуй на телефоне — один голос';
  $('lanes').innerHTML=st.o.map((o,k)=>{const l=L[k];return `<div class="lane" style="--c:${l.c};--c2:${l.c2};--cl:${l.cl}">
    <div class="num">${k+1}</div><div class="av">${drawChar(o.ch)}</div>
    <div class="mid"><div class="ttl">${st.medals&&k<3?medalSvg(['g','s','b'][k]).replace('class="medal show"','class="medal show" style="display:block;width:40px;height:40px"'):''}<span class="opt">${o.t}</span><span class="medal" data-m></span></div>
      <div class="say"><b>${CHARS[o.ch].name}:</b> «${o.say}»</div>
      <div class="track"><div class="fill"></div><div class="runner">${k+1}</div><span class="pct">0%</span></div></div>
    <div class="board big"><small>ГОЛОСА</small><b>0</b></div></div>`;}).join('');
  $('prevBtn').lastChild.textContent=i===0?' К QR-коду':' Назад';$('nextBtn').firstChild.textContent=i===4?'Награждение ':'Следующий этап ';
  $('votedLab').textContent=st.multi?'Ответили:':'Проголосовали:';
  const t=$('qTitle');let f=46;t.style.fontSize=f+'px';const box=t.parentElement;let g=0;while(box.scrollHeight>box.clientHeight+1&&f>28&&g++<20){f-=2;t.style.fontSize=f+'px';}}
function updLanes(){const i=ST.stage,v=ST.votes[i],tot=sum(v),mx=Math.max(1,...v),rk=ranks(v);
  document.querySelectorAll('#lanes .lane').forEach((ln,k)=>{const w=tot?v[k]/mx*100:0;ln.querySelector('.fill').style.width=w+'%';ln.querySelector('.runner').style.left=`calc(${w}% - ${tot&&v[k]?32:0}px)`;
    ln.querySelector('.pct').textContent=(tot?Math.round(v[k]/tot*100):0)+'%';const b=ln.querySelector('.board b');if(b.textContent!==String(v[k])){const up=+b.textContent<v[k];b.textContent=v[k];b.classList.remove('flip');void b.offsetWidth;b.classList.add('flip');
      if(up){const av=ln.querySelector('.av');av.classList.remove('jump');void av.offsetWidth;av.classList.add('jump');burstAt(ln.querySelector('.board'),18);}}
    const m=ln.querySelector('[data-m]');const r=STAGES[i].medals?-1:rk[k];m.innerHTML=r>=0&&r<3?medalSvg(['g','s','b'][r]).replace('class="medal show"','width="44" height="44"'):'';m.classList.toggle('show',r>=0&&r<3);});
  $('online').textContent=ST.online;$('voted').textContent=ST.voters[i];}
function renderFinal(fx){const s=ST;$('finTtl').style.backgroundImage=`url(${PHOTO('steppe')})`;
  const all=s.votes.reduce((a,v)=>a+sum(v),0);$('finSum').textContent=`Всего отметок: ${all}. Участников: ${Math.max(0,...s.voters)}.`;
  $('medalTable').innerHTML=STAGES.map((st,i)=>{const v=s.votes[i],tot=sum(v),rk=ranks(v),ord=[0,1,2,3].sort((a,b)=>v[b]-v[a]);
    return `<div class="mt card"><h4><small>ЭТАП ${i+1}</small>${st.q}</h4>${ord.map(k=>`<div class="mrow ${rk[k]===0?'first':''}"><span>${rk[k]>=0&&rk[k]<3?medalSvg(['g','s','b'][rk[k]]).replace('class="medal show"',''):`<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="9" fill="${L[k].cl}" stroke="${L[k].c}" stroke-width="3"/></svg>`}</span><span>${st.o[k].s}</span><b>${v[k]}</b><div class="bar"><i style="width:${tot?v[k]/tot*100:0}%;background:${L[k].c}"></i></div></div>`).join('')}</div>`;}).join('');
  if(fx){AU.play('fanfare');confettiRain();}}
function render(){const s=ST;renderTabs();
  if(s.screen==='lobby'){show('lob');$('lobOnline').textContent=s.online;}
  else if(s.screen==='stage'){if(lastScreen!=='stage'||lastStage!==s.stage)buildStage(s.stage);show('stg');updLanes();
    const tot=sum(s.votes[s.stage]);if(prevTot>=0&&tot>prevTot&&lastScreen==='stage'&&lastStage===s.stage)AU.play('vote');prevTot=tot;}
  else if(s.screen==='final'){show('fin');renderFinal(lastScreen!=='final'&&lastScreen!==null);}
  if(s.screen!=='stage')prevTot=-1;lastScreen=s.screen;lastStage=s.stage;}
let polling=false;
async function poll(){if(polling)return;polling=true;try{ST=await api(`/api/room/${B.code}/state`);$('err').classList.remove('on');render();}
  catch(e){if(e.status===404){polling=false;await newRoom();return;}$('err').classList.add('on');}polling=false;}
async function control(body){try{ST=await api(`/api/room/${B.code}/control`,Object.assign({key:B.key},body));render();AU.play('nav');}catch(e){toast('Не удалось: '+e.message);}}
/* stopwatch */
const swNow=()=>B.sw.acc+(B.sw.run?Date.now()-B.sw.t0:0);
function swDraw(){const t=Math.floor(swNow()/1000);$('swT').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');$('swPlay').innerHTML=B.sw.run?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>';}
function swToggle(){if(B.sw.run){B.sw.acc+=Date.now()-B.sw.t0;B.sw.run=false;}else{B.sw.t0=Date.now();B.sw.run=true;}saveB();swDraw();}
/* confetti */
const P=[];let confOn=false;const CC=['#00AFCA','#FEC50C','#FF7A00','#1DC94E','#E0115F','#ffffff'];
function stagePt(el){const r=el.getBoundingClientRect(),sr=$('stage').getBoundingClientRect();return {x:(r.left+r.width/2-sr.left)/_k,y:(r.top+r.height/2-sr.top)/_k};}
function burstAt(el,n){const p=stagePt(el);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=4+Math.random()*7;P.push({x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,s:5+Math.random()*7,c:CC[i%6],life:70+Math.random()*30,rot:Math.random()*6});}runConf();}
function confettiRain(){for(let i=0;i<260;i++)P.push({x:Math.random()*1600,y:-20-Math.random()*700,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,s:8+Math.random()*9,c:CC[i%6],life:400,rot:Math.random()*6});runConf();}
function runConf(){if(confOn)return;confOn=true;const cv=$('confetti'),cx=cv.getContext('2d');const step=()=>{cx.clearRect(0,0,cv.width,cv.height);for(let i=P.length-1;i>=0;i--){const q=P[i];q.vy+=.18;q.vx*=.99;q.x+=q.vx;q.y+=q.vy;q.rot+=.15;q.life--;if(q.life<=0||q.y>cv.height+30){P.splice(i,1);continue;}cx.save();cx.translate(q.x,q.y);cx.rotate(q.rot);cx.scale(1,Math.abs(Math.cos(q.rot*1.3)));cx.fillStyle=q.c;cx.fillRect(-q.s/2,-q.s/3,q.s,q.s*.6);cx.restore();}if(P.length)requestAnimationFrame(step);else{confOn=false;cx.clearRect(0,0,cv.width,cv.height);}};requestAnimationFrame(step);}
/* modal */
function modal(h){$('mBox').innerHTML=h;$('modal').classList.add('on');}
const closeModal=()=>$('modal').classList.remove('on');
let tt;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2000);}
function askNew(){modal(`<h3>Начать новую сессию?</h3><p>Для другого класса будет создана новая комната с новым кодом и QR-кодом. Голоса текущей комнаты будут удалены, телефоны старого класса отключатся.</p><div class="row"><button class="btn crim" id="mYes">Да, новая сессия</button><button class="btn white" id="mNo">Отмена</button></div>`);
  $('mYes').onclick=async()=>{closeModal();const old=B;try{await api(`/api/room/${old.code}/control`,{key:old.key,action:'close'});}catch(e){}await newRoom();toast('Новая комната: '+B.code);};$('mNo').onclick=closeModal;}
function credits(){modal(`<h3 style="color:var(--sky2)">Источники фотографий</h3><div class="credits"><p>Все фотографии — с Викисклада, распространяются по свободным лицензиям.</p><ul style="margin:10px 0 0 20px">${CREDITS.map(c=>`<li>${c}</li>`).join('')}</ul></div><div class="row"><button class="btn blue" id="mNo">Закрыть</button></div>`);$('mNo').onclick=closeModal;}
function setMute(m){B.muted=m;saveB();$('muteBtn').innerHTML=m?'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.4"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';$('muteBtn').classList.toggle('off',m);}
async function init(){fit();addEventListener('resize',fit);setMute(B.muted);swDraw();setInterval(()=>{if(B.sw.run)swDraw();},250);
  $('castRow').innerHTML=['ayaru','nurlan','serik','dana','erasyl'].map(k=>drawChar(k)).join('');
  $('podium').innerHTML=[['erasyl',60,'#1DC94E'],['nurlan',110,'#b8c3cf'],['ayaru',150,'#FEC50C'],['dana',85,'#d98c4a'],['serik',60,'#E0115F']].map(([k,h,c])=>`<div class="pod">${drawChar(k)}<div class="nm">${CHARS[k].name.split(' ')[0]}</div><div class="step" style="height:${h}px;background:${c}">★</div></div>`).join('');
  renderTabs();
  $('tabs').onclick=e=>{const b=e.target.closest('.tab');if(!b)return;control(b.dataset.i==='f'?{action:'final'}:{action:'goto',stage:+b.dataset.i});};
  $('startBtn').onclick=()=>{AU.init();if(!B.sw.run&&swNow()===0)swToggle();control({action:'goto',stage:0});};
  $('prevBtn').onclick=()=>control(ST.stage===0?{action:'lobby'}:{action:'goto',stage:ST.stage-1});
  $('nextBtn').onclick=()=>control(ST.stage===4?{action:'final'}:{action:'goto',stage:ST.stage+1});
  $('againBtn').onclick=()=>control({action:'goto',stage:0});
  $('newBtn').onclick=askNew;$('finNew').onclick=askNew;$('credBtn').onclick=credits;
  $('swPlay').onclick=swToggle;$('swReset').onclick=()=>{B.sw={acc:0,run:false,t0:0};saveB();swDraw();};
  $('muteBtn').onclick=()=>{AU.init();setMute(!B.muted);};
  $('fsBtn').onclick=()=>{try{if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen();}catch(e){}};
  $('modal').onclick=e=>{if(e.target.id==='modal')closeModal();};
  addEventListener('keydown',e=>{if(!ST||$('modal').classList.contains('on'))return;if(e.key==='ArrowRight'){if(ST.screen==='lobby')$('startBtn').click();else if(ST.screen==='stage')$('nextBtn').click();}if(e.key==='ArrowLeft'&&ST.screen==='stage')$('prevBtn').click();});
  if(!B.code)await newRoom();else{drawQR();await poll();}
  setInterval(poll,1500);}
window.__B={get ST(){return ST;},get B(){return B;}};
init();
