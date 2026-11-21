"use strict";
const $=id=>document.getElementById(id);
const CODE=(location.pathname.replace(/\//g,'')||'').toUpperCase();
let DEV;try{DEV=localStorage.getItem('rf-dev');if(!DEV){DEV='d'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('rf-dev',DEV);}}catch(e){DEV='d'+Math.random().toString(36).slice(2)+Date.now().toString(36);}
let ST=null,view='',draft=null,draftKey='',busy=false;
$('rc').textContent=CODE;
async function api(p,body){const r=await fetch(p,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||r.status);e.status=r.status;e.data=j;throw e;}return j;}
const app=()=>$('app');
const same=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
let timer=null;
function notFound(){if(view==='nf')return;clearInterval(timer);view='nf';app().innerHTML=`<div class="card center"><h2>Комната не найдена</h2><p>Проверь код на общем экране и введи его ещё раз.</p><input class="code" id="cin" maxlength="4" value="" placeholder="КОД" autocomplete="off"><button class="btn" id="cgo">Войти</button></div>`;
  $('cgo').onclick=()=>{const v=$('cin').value.trim().toUpperCase();if(/^[A-Z0-9]{4}$/.test(v))location.href='/'+v;};}
function lobby(){if(view==='lobby')return;view='lobby';app().innerHTML=`<div class="card center"><span class="kick">ТЫ НА СТАРТЕ!</span><h1>Чемпионат рефлексии</h1><div class="cast">${['ayaru','nurlan','dana','erasyl'].map(drawChar).join('')}</div><p>Ты подключён к комнате <b>${CODE}</b>.</p><div class="status wait"><div class="spin" style="flex:none;width:34px;height:34px;border-width:5px;margin:0"></div><span class="dots">Ждём, когда тренер откроет первый этап</span></div></div>`;}
function final(){if(view==='final')return;view='final';app().innerHTML=`<div class="card center"><span class="kick">ЦЕРЕМОНИЯ НАГРАЖДЕНИЯ</span><h1>Спасибо за участие!</h1><div>${medalSvg('g').replace('class="medal show"','width="110" height="110"')}</div><p>Победитель — весь класс! Смотри итоги на общем экране.</p><div class="cast">${['erasyl','nurlan','ayaru','dana','serik'].map(drawChar).join('')}</div></div>`;confetti(140);}
function stage(){const i=ST.stage,st=STAGES[i],key=ST.code+':'+i+':'+ST.rev;
  const mine=ST.mine||[];
  if(draftKey!==ST.code+':'+i||!st.multi){draftKey=ST.code+':'+i;draft=mine.slice();}
  const sig='stage'+i+'|'+mine.join(',')+'|'+draft.join(',');if(view===sig)return;view=sig;
  const voted=mine.length>0,changed=st.multi&&!same(draft,mine);
  app().innerHTML=`<div class="card"><div class="ph" style="background-image:url(${PHOTO(st.photo)})"><span class="stn">ЭТАП ${i+1} из 5</span></div>
   <span class="kick">${st.kick}</span><h1>${st.q}</h1><p>${st.multi?'Можно выбрать несколько вариантов, затем нажми «Отправить».':'Нажми на один вариант — голос засчитается сразу.'}</p>
   <div class="opts">${st.o.map((o,k)=>{const l=L[k];return `<button class="opt ${draft.includes(k)?'sel':''}" data-k="${k}" style="--c:${l.c};--c2:${l.c2};--cl:${l.cl}"><span class="n">${k+1}</span><span class="av">${drawChar(o.ch)}</span><span class="tx">${o.t}</span><span class="ck"></span></button>`;}).join('')}</div>
   ${st.multi?`<button class="btn green" id="send" ${draft.length&&(changed||!voted)?'':'disabled'}>${voted?(changed?'Отправить изменения':'Ответ отправлен ✓'):'Отправить'}</button>`:''}
   ${voted?`<div class="status">${medalSvg('g').replace('class="medal show"','')}<span>Голос принят! ${st.multi?'Можно изменить выбор и отправить снова':'Можно изменить выбор'}, пока тренер не открыл следующий этап.</span></div>`:`<div class="status wait"><span>Твой голос ещё не отправлен.</span></div>`}</div>`;
  app().querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(st.multi){draft=draft.includes(k)?draft.filter(x=>x!==k):[...draft,k].sort();view='';stage();}else{draft=[k];vote([k]);}});
  if(st.multi)$('send').onclick=()=>vote(draft.slice());}
async function vote(choices){if(busy)return;busy=true;const i=ST.stage;
  try{ST=await api(`/api/room/${CODE}/vote`,{device:DEV,stage:i,choices});view='';render();okShow(i);}
  catch(e){if(e.status===409&&e.data&&e.data.state){ST=e.data.state;view='';render();alertMsg('Этот этап уже закрыт — тренер открыл следующий.');}else if(e.status===404)notFound();else alertMsg('Не удалось отправить. Проверь интернет и нажми ещё раз.');}
  busy=false;}
function okShow(i){const m=['g','s','b'][i%3];$('okMedal').innerHTML=medalSvg(m).replace('class="medal show"','');$('okS').textContent='Смотри итоги на общем экране';$('ok').classList.add('on');try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}confetti(90);clearTimeout(okShow.t);okShow.t=setTimeout(()=>$('ok').classList.remove('on'),1600);}
$('ok').onclick=()=>$('ok').classList.remove('on');
function alertMsg(t){const n=$('net');n.textContent=t;n.classList.add('on');clearTimeout(alertMsg.t);alertMsg.t=setTimeout(()=>{n.classList.remove('on');n.textContent='Нет связи. Пробуем снова…';},3000);}
function render(){if(!ST)return;if(ST.screen==='lobby')lobby();else if(ST.screen==='final')final();else stage();}
async function poll(){if(busy||view==='nf')return;try{ST=await api(`/api/room/${CODE}/state?d=${DEV}`);$('net').classList.remove('on');render();}
  catch(e){if(e.status===404)notFound();else $('net').classList.add('on');}}
/* confetti */
const P=[];let on=false;const CC=['#00AFCA','#FEC50C','#FF7A00','#1DC94E','#E0115F'];
function confetti(n){const cv=$('confetti');cv.width=innerWidth;cv.height=innerHeight;for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=7+Math.random()*9;P.push({x:cv.width/2,y:cv.height*.45,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:6+Math.random()*7,c:CC[i%5],r:Math.random()*6,l:120});}
  if(on)return;on=true;const cx=cv.getContext('2d');const step=()=>{cx.clearRect(0,0,cv.width,cv.height);for(let i=P.length-1;i>=0;i--){const q=P[i];q.vy+=.25;q.x+=q.vx;q.y+=q.vy;q.vx*=.98;q.r+=.2;if(--q.l<=0||q.y>cv.height+20){P.splice(i,1);continue;}cx.save();cx.translate(q.x,q.y);cx.rotate(q.r);cx.fillStyle=q.c;cx.fillRect(-q.s/2,-q.s/3,q.s,q.s*.6);cx.restore();}if(P.length)requestAnimationFrame(step);else{on=false;cx.clearRect(0,0,cv.width,cv.height);}};requestAnimationFrame(step);}
window.__P={get ST(){return ST;},DEV};
if(!/^[A-Z0-9]{4}$/.test(CODE))notFound();else{poll();timer=setInterval(poll,2000);}
