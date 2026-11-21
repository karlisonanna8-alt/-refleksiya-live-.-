const {chromium}=require('/workspace/missiya-2030/node_modules/playwright-core');
const U='http://localhost:3000';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const errs=[];const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
(async()=>{const br=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const bctx=await br.newContext({viewport:{width:1920,height:1080}});const board=await bctx.newPage();
 board.on('console',m=>{if(m.type()==='error')errs.push('board: '+m.text());});board.on('pageerror',e=>errs.push('board: '+e.message));
 await board.goto(U+'/');await board.waitForFunction(()=>window.__B&&window.__B.ST);
 const code=await board.evaluate(()=>window.__B.B.code);ok(/^[A-Z0-9]{4}$/.test(code),'room code '+code);
 const qrOk=await board.evaluate(()=>!!document.querySelector('#qrBig svg'));ok(qrOk,'QR rendered');
 const phones=[];for(let i=0;i<5;i++){const c=await br.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await c.newPage();
   p.on('console',m=>{if(m.type()==='error')errs.push('phone'+i+': '+m.text());});p.on('pageerror',e=>errs.push('phone'+i+': '+e.message));await p.goto(U+'/'+code);phones.push(p);}
 await sleep(2500);await board.screenshot({path:'shots/01-board-lobby.png'});await phones[0].screenshot({path:'shots/02-phone-lobby.png'});
 ok(await board.textContent('#lobOnline')==='5','board sees 5 connected: '+await board.textContent('#lobOnline'));
 await board.click('#startBtn');await sleep(2500);
 const ph0=await phones[0].textContent('h1');ok(ph0.includes('настроение'),'stage 1 propagated to phone: '+ph0);
 // votes: phones 0,1 -> opt0; 2 -> opt1; 3 -> opt2
 const picks=[0,0,1,2];for(let i=0;i<4;i++){await phones[i].click(`.opt[data-k="${picks[i]}"]`);await sleep(150);}
 await sleep(800);await phones[3].screenshot({path:'shots/03-phone-accepted.png'});
 await sleep(1800);
 let cnt=await board.$$eval('#lanes .board b',e=>e.map(x=>+x.textContent));ok(JSON.stringify(cnt)==='[2,1,1,0]','board live counts '+cnt);
 ok(await board.textContent('#voted')==='4','voted 4');
 // double vote: phone0 taps same option repeatedly + different option -> change
 await phones[0].click('.opt[data-k="0"]');await sleep(300);await phones[0].click('.opt[data-k="0"]');await sleep(300);
 // reload phone0 and vote again (same device id)
 await phones[0].reload();await sleep(1500);ok(await phones[0].$eval('.opt.sel',e=>e.dataset.k)==='0','phone remembers vote after reload');
 await phones[0].click('.opt[data-k="0"]');await sleep(2200);
 cnt=await board.$$eval('#lanes .board b',e=>e.map(x=>+x.textContent));ok(JSON.stringify(cnt)==='[2,1,1,0]','double vote blocked '+cnt);
 // direct API spam
 const r=await phones[1].evaluate(async(c)=>{const d=window.__P.DEV;for(let i=0;i<5;i++)await fetch('/api/room/'+c+'/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:d,stage:0,choices:[0]})});return (await (await fetch('/api/room/'+c+'/state')).json()).votes[0];},code);
 ok(JSON.stringify(r)==='[2,1,1,0]','API spam blocked '+r);
 // change vote
 await phones[2].click('.opt[data-k="3"]');await sleep(2200);
 cnt=await board.$$eval('#lanes .board b',e=>e.map(x=>+x.textContent));ok(JSON.stringify(cnt)==='[2,0,1,1]','vote change '+cnt);
 await phones[4].screenshot({path:'shots/04-phone-voting.png'});
 await board.screenshot({path:'shots/05-board-stage1.png'});
 // next stage
 await board.click('#nextBtn');await sleep(2500);ok((await phones[1].textContent('h1')).includes('понял'),'stage 2 propagated');
 // stale vote to stage 0 -> 409
 const st=await phones[4].evaluate(async(c)=>(await fetch('/api/room/'+c+'/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:window.__P.DEV,stage:0,choices:[1]})})).status,code);ok(st===409,'closed stage vote rejected 409');
 // go to stage 4 (multi)
 await board.click('#tabs .tab[data-i="3"]');await sleep(2500);
 for(const p of phones.slice(0,3)){await p.click('.opt[data-k="0"]');await p.click('.opt[data-k="1"]');await p.click('#send');await sleep(200);}
 await phones[3].click('.opt[data-k="0"]');await phones[3].click('.opt[data-k="1"]');await phones[3].click('.opt[data-k="2"]');await phones[3].click('.opt[data-k="3"]');await sleep(300);
 await phones[3].screenshot({path:'shots/06-phone-multi.png'});await phones[3].click('#send');await sleep(2500);
 cnt=await board.$$eval('#lanes .board b',e=>e.map(x=>+x.textContent));ok(JSON.stringify(cnt)==='[4,4,1,1]','multi counts '+cnt);
 ok(await board.textContent('#voted')==='4','multi voters 4');
 await board.screenshot({path:'shots/07-board-stage4.png'});
 await board.click('#nextBtn');await sleep(500);await board.click('#nextBtn');await sleep(2600);
 ok(await board.$eval('#fin',e=>e.classList.contains('on')),'final screen');ok((await phones[0].textContent('h1')).includes('Спасибо'),'phones on final');
 await sleep(1500);await board.screenshot({path:'shots/08-board-final.png'});await phones[0].screenshot({path:'shots/09-phone-final.png'});
 // new session
 await board.click('#finNew');await sleep(300);await board.click('#mYes');await sleep(2500);
 const code2=await board.evaluate(()=>window.__B.B.code);ok(code2!==code,'new code '+code2);
 ok(await board.$eval('#lob',e=>e.classList.contains('on')),'lobby after new session');ok(await board.textContent('#lobOnline')==='0','online reset');
 const s2=await board.evaluate(()=>window.__B.ST.votes.flat().reduce((a,b)=>a+b,0));ok(s2===0,'votes reset');
 await sleep(2500);ok((await phones[0].textContent('h2')).includes('не найдена'),'old phones see room closed');
 // board reload resumes room
 await board.reload();await sleep(1500);ok(await board.evaluate(()=>window.__B.B.code)===code2,'board reload resumes room');
 // portrait phone screenshot of board 1280x800
 await board.setViewportSize({width:1280,height:800});await sleep(500);await board.screenshot({path:'shots/10-board-1280.png'});
 console.log('errors:',errs.length?errs:'none');await br.close();})().catch(e=>{console.error(e);process.exit(1);});
