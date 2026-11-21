/* ===== CHARACTERS (stylized illustrated SVG) ===== */
let CHID=0;
function face(p,id){
  return `<ellipse cx="53" cy="74" rx="5.5" ry="9" fill="${p.skin}"/><ellipse cx="107" cy="74" rx="5.5" ry="9" fill="${p.skin}"/>
  <ellipse cx="80" cy="70" rx="27" ry="33" fill="url(#${id}sk)"/>
  <path d="M55 78 Q58 100 80 104 Q102 100 105 78 Q100 96 80 99 Q60 96 55 78Z" fill="${p.skinD}" opacity=".35"/>
  <ellipse cx="66" cy="81" rx="6" ry="3.5" fill="#E0115F" opacity=".14"/><ellipse cx="94" cy="81" rx="6" ry="3.5" fill="#E0115F" opacity=".14"/>
  <ellipse cx="70" cy="69" rx="5.2" ry="3.4" fill="#fff"/><ellipse cx="90" cy="69" rx="5.2" ry="3.4" fill="#fff"/>
  <circle cx="70.6" cy="69" r="2.7" fill="${p.eye}"/><circle cx="90.6" cy="69" r="2.7" fill="${p.eye}"/><circle cx="71.4" cy="68" r=".9" fill="#fff"/><circle cx="91.4" cy="68" r=".9" fill="#fff"/>
  <path d="M64.5 67.2 Q70 64 75.5 67.2 M84.5 67.2 Q90 64 95.5 67.2" stroke="#2a1a12" stroke-width="${p.f?1.8:1.3}" fill="none" stroke-linecap="round"/>
  <path d="M63 ${p.by} Q70 ${p.by-4} 76 ${p.by-1} M84 ${p.by-1} Q90 ${p.by-4} 97 ${p.by}" stroke="${p.brow}" stroke-width="${p.f?2:2.8}" fill="none" stroke-linecap="round"/>
  <path d="M80 70 Q77 79 79.5 81.5 Q82.5 83 85 80.5" stroke="${p.skinD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M70 87.5 Q80 97.5 90 87.5 Q80 91 70 87.5Z" fill="#a8354a"/><path d="M71.5 88.2 Q80 92.2 88.5 88.2 Q80 90.2 71.5 88.2Z" fill="#fff"/>`;
}
function defs(p,id){
  return `<defs><radialGradient id="${id}sk" cx=".42" cy=".36" r=".78"><stop offset="0" stop-color="${p.skinL}"/><stop offset=".7" stop-color="${p.skin}"/><stop offset="1" stop-color="${p.skinD}"/></radialGradient>
  <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.c1L||'#fff'}"/><stop offset="1" stop-color="${p.c1}"/></linearGradient>
  <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.hairL}"/><stop offset="1" stop-color="${p.hair}"/></linearGradient>
  <radialGradient id="${id}sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#003a5c" stop-opacity=".25"/><stop offset="1" stop-color="#003a5c" stop-opacity="0"/></radialGradient></defs>`;
}
const CHARS={
 ayaru:{name:'Айару',role:'бегунья',p:{f:1,skin:'#e8b48f',skinL:'#f8d4b6',skinD:'#c48a64',hair:'#1d1410',hairL:'#4a3326',brow:'#2a1a12',eye:'#3a2414',by:60,c1:'#FF7A00',c1L:'#ffb15c'}},
 nurlan:{name:'Нурлан',role:'велосипедист',p:{skin:'#d9a27c',skinL:'#efc29f',skinD:'#b07a54',hair:'#18110c',hairL:'#3b2a1e',brow:'#1d140e',eye:'#2a1a10',by:59,c1:'#00AFCA',c1L:'#6fe3f5'}},
 dana:{name:'Дана',role:'пловчиха',p:{f:1,skin:'#f0c4a0',skinL:'#fde0c8',skinD:'#cf9a74',hair:'#3a2418',hairL:'#6a4430',brow:'#4a2e1e',eye:'#2f4f2a',by:60,c1:'#1DC94E',c1L:'#7ff0a0'}},
 erasyl:{name:'Ерасыл',role:'борец казакша курес',p:{skin:'#c98f64',skinL:'#e6b088',skinD:'#a06a44',hair:'#120d0a',hairL:'#2e221a',brow:'#140e0a',eye:'#24160c',by:59,c1:'#ffffff',c1L:'#ffffff'}},
 serik:{name:'Серик Болатович',role:'тренер',p:{skin:'#d8a079',skinL:'#eec09c',skinD:'#ad7550',hair:'#8d8d92',hairL:'#c9c9ce',brow:'#6d6d72',eye:'#2a1a10',by:59,c1:'#0096C7',c1L:'#4fd0f0'}}
};
function drawChar(key){
  const C=CHARS[key],p=C.p,id='ch'+(CHID++);
  let s=`<svg class="ch" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">${defs(p,id)}`;
  const neck=`<path d="M69 94 L69 122 Q80 130 91 122 L91 94Z" fill="${p.skinD}"/>`;
  if(key==='ayaru'){
    s+=`<path d="M100 44 Q132 36 136 64 Q136 92 118 104 Q126 80 104 60Z" fill="url(#${id}h)"/>`+neck+
    `<path d="M20 200 Q24 142 54 128 L80 124 L106 128 Q122 134 128 146 L132 200Z" fill="${p.skin}"/>
     <path d="M118 140 Q136 122 140 94 L144 56 L158 54 L156 96 Q152 132 134 152Z" fill="${p.skin}"/><path d="M142 70 L157 68 L157 78 L142 80Z" fill="#FEC50C"/>
     <circle cx="151" cy="48" r="10" fill="${p.skin}"/><path d="M144 44 Q151 38 158 44" stroke="${p.skinD}" stroke-width="1.5" fill="none"/>
     <path d="M48 200 L52 134 Q62 128 68 126 Q80 140 92 126 Q100 128 110 134 L114 200Z" fill="url(#${id}a)"/>
     <path d="M52 134 Q62 128 68 126 Q80 140 92 126 Q100 128 110 134" stroke="#00AFCA" stroke-width="4" fill="none"/>
     <rect x="58" y="152" width="44" height="34" rx="5" fill="#fff" stroke="#e6e6e6"/><text x="80" y="179" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="24" fill="#0096C7">11</text>
     <circle cx="62" cy="156" r="1.8" fill="#bbb"/><circle cx="98" cy="156" r="1.8" fill="#bbb"/>`+face(p,id)+
    `<path d="M53 72 Q50 34 82 34 Q110 36 107 72 Q102 50 84 46 Q66 52 53 72Z" fill="url(#${id}h)"/>
     <path d="M54 56 Q80 42 106 56 L106 63 Q80 49 54 63Z" fill="#E0115F"/>
     <circle cx="53" cy="86" r="2.2" fill="#FEC50C"/><circle cx="107" cy="86" r="2.2" fill="#FEC50C"/>`;
  }
  if(key==='nurlan'){
    s+=neck+`<path d="M16 200 Q18 142 54 127 L80 121 L106 127 Q142 142 144 200Z" fill="url(#${id}a)"/>
     <path d="M20 166 Q80 158 140 166 L142 182 Q80 174 18 182Z" fill="#FEC50C"/><path d="M26 150 Q30 136 44 130 L40 200 L22 200Z" fill="#1DC94E" opacity=".9"/><path d="M134 150 Q130 136 116 130 L120 200 L138 200Z" fill="#1DC94E" opacity=".9"/>
     <path d="M66 124 Q80 132 94 124 L94 130 Q80 138 66 130Z" fill="#fff"/><path d="M80 132 V200" stroke="#fff" stroke-width="2.5"/>
     <path d="M90 140 l6 0 l-3 -6z" fill="#FEC50C"/>`+face(p,id)+
    `<path d="M54 74 Q53 62 56 58 L58 76Z M106 74 Q107 62 104 58 L102 76Z" fill="url(#${id}h)"/>
     <path d="M47 62 Q44 24 82 22 Q118 24 113 60 Q100 52 80 52 Q60 52 47 62Z" fill="#00AFCA"/>
     <path d="M60 30 Q80 22 100 30 M54 42 Q80 30 106 42" stroke="#FEC50C" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M66 26 L64 44 M80 23 V40 M94 26 L96 44" stroke="#0a6b80" stroke-width="3" stroke-linecap="round"/>
     <path d="M47 62 Q80 50 113 60" stroke="#0a6b80" stroke-width="3" fill="none"/>
     <rect x="58" y="44" width="44" height="12" rx="6" fill="#123a66"/><path d="M62 47 L76 47" stroke="#8fe8ff" stroke-width="2" stroke-linecap="round"/>
`;
  }
  if(key==='dana'){
    s+=neck+`<path d="M22 200 Q26 142 54 128 L80 124 L106 128 Q134 142 138 200Z" fill="${p.skin}"/>
     <path d="M50 200 L56 140 Q60 132 64 129 L70 152 Q80 160 90 152 L96 129 Q100 132 104 140 L110 200Z" fill="url(#${id}a)"/>
     <path d="M53 172 L107 172 L108 180 L52 180Z" fill="#00AFCA"/>
     <path d="M36 132 Q58 116 72 122 Q60 150 60 200 L38 200 Q32 160 36 132Z" fill="#FEC50C"/><path d="M124 132 Q102 116 88 122 Q100 150 100 200 L122 200 Q128 160 124 132Z" fill="#FEC50C"/>
     <path d="M42 150 L58 148 M40 170 L58 168 M118 150 L102 148 M120 170 L102 168" stroke="#E0A800" stroke-width="3" stroke-linecap="round"/>`+face(p,id)+
    `<path d="M51 70 Q46 28 80 26 Q114 28 109 70 Q106 48 80 44 Q56 48 51 70Z" fill="#E0115F"/>
     <path d="M62 34 Q76 28 88 30" stroke="#ff7fb0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
     <path d="M50 52 Q80 40 110 52" stroke="#1a2a3a" stroke-width="4" fill="none"/>
     <ellipse cx="68" cy="47" rx="10" ry="7" fill="#00AFCA" stroke="#1a2a3a" stroke-width="2.5"/><ellipse cx="92" cy="47" rx="10" ry="7" fill="#00AFCA" stroke="#1a2a3a" stroke-width="2.5"/>
     <path d="M63 44 L68 42 M87 44 L92 42" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  }
  if(key==='erasyl'){
    s+=`<path d="M66 92 L64 124 Q80 134 96 124 L94 92Z" fill="${p.skinD}"/>
     <path d="M4 200 Q6 136 48 122 L80 118 L112 122 Q154 136 156 200Z" fill="#f7fbff"/>
     <path d="M4 200 Q6 136 48 122 L60 120 Q40 150 36 200Z" fill="#000" opacity=".05"/>
     <path d="M62 121 L94 196 M98 121 L66 196" stroke="#00AFCA" stroke-width="9"/>
     <path d="M62 121 L94 196 M98 121 L66 196" stroke="#FEC50C" stroke-width="2" stroke-dasharray="5 5"/>
     <path d="M8 186 L152 186 L154 200 L6 200Z" fill="#0096C7"/><path d="M72 186 h16 v14 h-16z" fill="#FEC50C"/>
     <path d="M24 160 q6 -8 12 0 q-6 8 -12 0 M124 160 q6 -8 12 0 q-6 8 -12 0" stroke="#FEC50C" stroke-width="2.5" fill="none"/>`+face(p,id)+
    `<path d="M53 66 Q50 34 80 32 Q110 34 107 66 Q104 46 80 44 Q56 46 53 66Z" fill="url(#${id}h)"/>`;
  }
  if(key==='serik'){
    s+=neck+`<path d="M14 200 Q18 142 54 127 L80 121 L106 127 Q142 142 146 200Z" fill="url(#${id}a)"/>
     <path d="M30 140 L22 200 M38 134 L32 200" stroke="#FEC50C" stroke-width="5"/><path d="M130 140 L138 200 M122 134 L128 200" stroke="#FEC50C" stroke-width="5"/>
     <path d="M62 124 Q80 136 98 124 L100 132 Q80 146 60 132Z" fill="#fff"/><path d="M80 138 V200" stroke="#e8f6ff" stroke-width="3"/>
     <path d="M66 126 L78 166 M94 126 L82 166" stroke="#E0115F" stroke-width="3"/>
     <path d="M70 164 h20 a6 6 0 0 1 0 12 h-20 a6 6 0 0 1 0 -12z" fill="#FF7A00"/><circle cx="74" cy="170" r="2.5" fill="#fff"/>
     <path d="M118 200 Q124 160 136 148 L148 140 L156 152 L146 166 Q138 180 136 200Z" fill="url(#${id}a)"/>
     <circle cx="148" cy="126" r="15" fill="#FEC50C" stroke="#E0A800" stroke-width="3"/><circle cx="148" cy="126" r="10" fill="#fff"/><path d="M148 126 L148 119 M148 126 L153 128" stroke="#0B2A4A" stroke-width="2" stroke-linecap="round"/><rect x="145" y="107" width="6" height="5" fill="#E0A800"/>
     <path d="M136 142 Q140 132 150 138 L154 146 Q146 150 138 150Z" fill="${p.skin}"/>`+face(p,id)+
    `<path d="M54 76 Q52 60 56 54 L60 78Z M106 76 Q108 60 104 54 L100 78Z" fill="url(#${id}h)"/>
     <path d="M68 85.5 Q74 82 80 84.5 Q86 82 92 85.5 Q86 88 80 86.5 Q74 88 68 85.5Z" fill="#7d7d82"/>
     <path d="M51 58 Q50 28 80 27 Q110 28 109 58Z" fill="#FEC50C"/><path d="M80 27 V58" stroke="#E0A800" stroke-width="2"/>
     <path d="M48 58 Q80 50 120 58 Q126 64 114 66 Q80 58 50 64Z" fill="#E0A800"/><circle cx="80" cy="28" r="3" fill="#E0A800"/>`;
  }
  return s+`</svg>`;
}
function medalSvg(kind){
  const col={g:['#FEC50C','#ffe98a','#c98a00'],s:['#c3ccd6','#f2f5f8','#8a96a3'],b:['#d98c4a','#f5c08f','#9a5a26']}[kind];
  const id='m'+(CHID++);
  return `<svg class="medal show" viewBox="0 0 44 44"><defs><radialGradient id="${id}" cx=".35" cy=".35"><stop offset="0" stop-color="${col[1]}"/><stop offset="1" stop-color="${col[0]}"/></radialGradient></defs>
  <path d="M12 2 L20 18 L24 18 L16 2Z" fill="#00AFCA"/><path d="M32 2 L24 18 L20 18 L28 2Z" fill="#E0115F"/>
  <circle cx="22" cy="28" r="13" fill="url(#${id})" stroke="${col[2]}" stroke-width="2"/><path d="M22 21 l2.2 4.6 5 .6 -3.7 3.4 1 5 -4.5 -2.5 -4.5 2.5 1 -5 -3.7 -3.4 5 -.6z" fill="${col[2]}" opacity=".8"/></svg>`;
}
