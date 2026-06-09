const $ = id => document.getElementById(id);

const foodData = [
  {id:'bread', name:'Bread', emoji:'🍞', value:10, rarity:'common'},
  {id:'apple', name:'Apple', emoji:'🍎', value:12, rarity:'common'},
  {id:'carrot', name:'Carrot', emoji:'🥕', value:15, rarity:'common'},
  {id:'banana', name:'Banana', emoji:'🍌', value:18, rarity:'common'},
  {id:'pizza', name:'Pizza Slice', emoji:'🍕', value:50, rarity:'uncommon'},
  {id:'burger', name:'Burger', emoji:'🍔', value:60, rarity:'uncommon'},
  {id:'sushi', name:'Sushi', emoji:'🍣', value:70, rarity:'uncommon'},
  {id:'taco', name:'Taco', emoji:'🌮', value:80, rarity:'uncommon'},
  {id:'ramen', name:'Ramen', emoji:'🍜', value:200, rarity:'rare'},
  {id:'steak', name:'Steak', emoji:'🥩', value:250, rarity:'rare'},
  {id:'lobster', name:'Lobster', emoji:'🦞', value:300, rarity:'rare'},
  {id:'donut', name:'Donut Tower', emoji:'🍩', value:350, rarity:'rare'},
  {id:'goldburger', name:'Golden Burger', emoji:'👑', value:800, rarity:'epic'},
  {id:'rainbowcake', name:'Rainbow Cake', emoji:'🎂', value:1000, rarity:'epic'},
  {id:'dragonfruit', name:'Dragon Fruit', emoji:'🐉', value:1200, rarity:'epic'},
  {id:'truffle', name:'Truffle Pasta', emoji:'🍝', value:1500, rarity:'epic'},
  {id:'phoenix', name:'Phoenix Egg', emoji:'🥚', value:4000, rarity:'legendary'},
  {id:'crystal', name:'Crystal Sushi', emoji:'💎', value:5000, rarity:'legendary'},
  {id:'galaxy', name:'Galaxy Donut', emoji:'🌌', value:6000, rarity:'legendary'},
  {id:'diamondsteak', name:'Diamond Steak', emoji:'✨', value:7500, rarity:'legendary'},
  {id:'cosmicpizza', name:'Cosmic Pizza', emoji:'🌠', value:20000, rarity:'mythic'},
  {id:'voidburger', name:'Void Burger', emoji:'🕳️', value:25000, rarity:'mythic'},
  {id:'infinityramen', name:'Infinity Ramen', emoji:'♾️', value:30000, rarity:'mythic'},
  {id:'starfruit', name:'Starfruit Supreme', emoji:'⭐', value:40000, rarity:'mythic'},
];

const byRarity = {
  common: foodData.filter(f=>f.rarity==='common'),
  uncommon: foodData.filter(f=>f.rarity==='uncommon'),
  rare: foodData.filter(f=>f.rarity==='rare'),
  epic: foodData.filter(f=>f.rarity==='epic'),
  legendary: foodData.filter(f=>f.rarity==='legendary'),
  mythic: foodData.filter(f=>f.rarity==='mythic'),
};

const rarityConfig = {
  common:{name:'Common', color:'#9ca3af', class:'rarity-common'},
  uncommon:{name:'Uncommon', color:'#22c55e', class:'rarity-uncommon'},
  rare:{name:'Rare', color:'#3b82f6', class:'rarity-rare'},
  epic:{name:'Epic', color:'#a855f7', class:'rarity-epic'},
  legendary:{name:'Legendary', color:'#f97316', class:'rarity-legendary'},
  mythic:{name:'Mythic', color:'#ec4899', class:'rarity-mythic'},
};

const boxes = {
  basic:{key:'basic', name:'Basic Box', price:50, emoji:'📦', color:'linear-gradient(90deg,#52525b,#27272a)', odds:{common:70, uncommon:25, rare:5}},
  lucky:{key:'lucky', name:'Lucky Box', price:250, emoji:'🎁', color:'linear-gradient(90deg,#059669,#0d9488)', odds:{common:40, uncommon:35, rare:20, epic:4, legendary:1}},
  golden:{key:'golden', name:'Golden Feast', price:1000, emoji:'👑', color:'linear-gradient(90deg,#f59e0b,#ea580c)', odds:{common:10, uncommon:25, rare:35, epic:20, legendary:8, mythic:2}},
};

let state = { money:0, clickLevel:0, autoLevel:0, luckLevel:0, totalClicks:0, totalEarned:0, boxesOpened:0, inventory:{}, rarest:'common' };
state.clickValue = 1;

let audioCtx;
function initAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume(); }
function beep(freq=800, dur=0.08, vol=0.07, type='sine'){ try{ initAudio(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(vol, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur); o.start(); o.stop(audioCtx.currentTime+dur);}catch(e){} }

function save(){ localStorage.setItem('foodClicker_v2', JSON.stringify(state)); }
function load(){ const s=localStorage.getItem('foodClicker_v2'); if(s){ const data=JSON.parse(s); state={...state,...data}; } state.clickValue=1+(state.clickLevel||0); state.clickLevel=state.clickLevel||0; state.autoLevel=state.autoLevel||0; state.luckLevel=state.luckLevel||0; }
load();

const fmt = n => '$'+Math.floor(n).toLocaleString();

$('coinBtn').addEventListener('pointerdown', (e)=>{
  e.preventDefault(); initAudio();
  const gain = state.clickValue;
  state.money += gain; state.totalEarned += gain; state.totalClicks++;
  beep(720+Math.random()*180, 0.06, 0.065, 'square');
  if(state.totalClicks % 10 === 0) beep(900,0.05,'sine');
  for(let i=0;i<5;i++){ const p=document.createElement('div'); p.className='particle'; p.textContent='+'+fmt(gain).slice(1); p.style.color='#fde68a'; p.style.transform=`translateX(-50%) translateY(0) translateX(${(Math.random()-0.5)*120}px)`; p.style.animationDelay=(i*0.04)+'s'; $('particleContainer').appendChild(p); setTimeout(()=>p.remove(),900); }
  $('coinBtn').style.transform='scale(0.93)'; setTimeout(()=>$('coinBtn').style.transform='',80);
  updateUI(); if(state.totalClicks%3===0) save();
},{passive:false});

function buyBox(key){
  const box=boxes[key];
  if(state.money<box.price){ $('moneyDisplay').animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:300}); beep(200,0.12,0.08,'sawtooth'); return; }
  state.money-=box.price; state.boxesOpened++; beep(180,0.18,0.09,'triangle');
  const food=rollFood(box); openAnimation(box,food); updateUI(); save();
}

function rollFood(box){
  const odds=box.odds; const total=Object.values(odds).reduce((a,b)=>a+b,0); let r=Math.random()*total; let chosen='common';
  for(const [rar,ch] of Object.entries(odds)){ if(r<ch){chosen=rar;break;} r-=ch; }
  const order=['common','uncommon','rare','epic','legendary','mythic']; let idx=order.indexOf(chosen);
  for(let i=0;i<state.luckLevel;i++){ if(Math.random()<0.05 && idx<order.length-1){ const next=order[idx+1]; if(box.odds[next]||next==='mythic'||next==='legendary'){ idx++; } } }
  chosen=order[idx]; if(!byRarity[chosen]||byRarity[chosen].length===0) chosen='common';
  const pool=byRarity[chosen]; const pick=pool[Math.floor(Math.random()*pool.length)]; return {...pick};
}

function openAnimation(box,food){
  $('openModal').classList.remove('hidden'); $('openModal').classList.add('flex');
  $('boxStage').classList.remove('hidden'); $('revealStage').classList.add('hidden'); $('revealStage').classList.remove('flex');
  $('openingBox').textContent=box.emoji; $('openingBox').classList.add('shake'); $('openingText').textContent=`Opening ${box.name}...`;
  $('openProgress').style.animation='none'; void $('openProgress').offsetWidth; $('openProgress').style.animation='load 2.2s ease-out forwards';
  $('sparkles').innerHTML = Array(7).fill(0).map((_,i)=>`<div class="sparkle" style="animation-delay:${i*0.12}s"></div>`).join('');
  beep(140,1.1,0.045,'sawtooth'); setTimeout(()=>beep(220,0.2,0.06,'triangle'),400); setTimeout(()=>beep(320,0.15,0.05,'sine'),900);
  setTimeout(()=>{ $('openingBox').classList.remove('shake'); $('boxStage').classList.add('hidden'); $('revealStage').classList.remove('hidden'); $('revealStage').classList.add('flex'); showReveal(food); },2200);
}

function showReveal(food){
  const rc=rarityConfig[food.rarity];
  $('revealEmoji').textContent=food.emoji; $('revealName').textContent=food.name; $('revealValue').textContent=`Sell for ${fmt(food.value)}`;
  $('revealRarity').textContent=rc.name; $('revealRarity').className=`reveal-badge ${rc.class}`;
  $('revealCard').className=`reveal-card glass ${rc.class}`; $('revealGlow').style.background=rc.color;
  setTimeout(()=>{ $('revealCard').style.transform='scale(1)'; $('revealCard').style.opacity='1'; },50);
  const pitches={common:420,uncommon:580,rare:760,epic:980,legendary:1180,mythic:1420};
  beep(pitches[food.rarity],0.22,0.11,'sine'); if(food.rarity==='epic') setTimeout(()=>beep(pitches[food.rarity]+200,0.15,0.08),120);
  if(['legendary','mythic'].includes(food.rarity)){ setTimeout(()=>beep(pitches[food.rarity]+300,0.18,0.09,'triangle'),140); setTimeout(()=>beep(pitches[food.rarity]+500,0.22,0.08,'sine'),300); launchConfetti(); navigator.vibrate&&navigator.vibrate([30,40,30]); }
  state.inventory[food.id]=(state.inventory[food.id]||0)+1;
  const order=['common','uncommon','rare','epic','legendary','mythic']; if(order.indexOf(food.rarity)>order.indexOf(state.rarest)){ state.rarest=food.rarity; }
  updateInventory(); save();
}

$('collectBtn').onclick=()=>{ $('openModal').classList.add('hidden'); $('openModal').classList.remove('flex'); $('revealCard').style.transform='scale(0.95)'; $('revealCard').style.opacity='0'; beep(650,0.08,0.06,'sine'); };

function updateInventory(){
  const grid=$('inventoryGrid'); grid.innerHTML=''; let totalVal=0;
  const items=Object.entries(state.inventory).map(([id,cnt])=>{ const f=foodData.find(x=>x.id===id); return {...f,count:cnt}; }).sort((a,b)=>{ const order=['mythic','legendary','epic','rare','uncommon','common']; return order.indexOf(a.rarity)-order.indexOf(b.rarity)||b.value-a.value; });
  items.forEach(item=>{
    totalVal+=item.value*item.count;
    const el=document.createElement('div'); el.className=`inventory-item glass ${rarityConfig[item.rarity].class}`;
    el.innerHTML=`<div style="font-size:26px;line-height:1">${item.emoji}</div><div style="font-size:10px;font-weight:700;opacity:.7">${item.count}×</div><div style="font-size:10px;font-weight:600">${fmt(item.value).slice(1)}</div>`;
    el.title=`${item.name} ×${item.count} — ${fmt(item.value)} each`;
    el.onclick=()=>{ if(state.inventory[item.id]>0){ state.inventory[item.id]--; if(state.inventory[item.id]===0) delete state.inventory[item.id]; state.money+=item.value; state.totalEarned+=item.value; beep(700,0.06,0.05); updateInventory(); updateUI(); save(); el.style.transform='scale(0.9)'; setTimeout(()=>el.style.transform='',150); } };
    grid.appendChild(el);
  });
  if(items.length===0){ grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;opacity:.5;font-size:13px;padding:40px 0;line-height:1.4">No foods yet.<br>Buy your first box!</div>`; }
  $('inventoryValue').textContent=fmt(totalVal);
}

$('sellAllBtn').onclick=()=>{ let total=0; for(const [id,cnt] of Object.entries(state.inventory)){ const f=foodData.find(x=>x.id===id); total+=f.value*cnt; } if(total===0){ beep(200,0.1,0.05); return;} state.inventory={}; state.money+=total; state.totalEarned+=total; beep(850,0.14,0.09,'triangle'); beep(1050,0.12,0.07,'sine'); updateInventory(); updateUI(); save(); };
$('sellDupBtn').onclick=()=>{ let total=0; for(const [id,cnt] of Object.entries(state.inventory)){ if(cnt>1){ const f=foodData.find(x=>x.id===id); const sell=cnt-1; total+=f.value*sell; state.inventory[id]=1; } } if(total===0){ beep(200,0.1,0.05); return;} state.money+=total; state.totalEarned+=total; beep(720,0.1,0.08); updateInventory(); updateUI(); save(); };

const upgrades=[
  {key:'click',name:'Better Click',desc:'+$1 per click',icon:'👆',base:50,mult:1.6,get:()=>state.clickLevel,apply:()=>{state.clickLevel++;state.clickValue=1+state.clickLevel}},
  {key:'auto',name:'Auto Clicker',desc:'+1 click/sec',icon:'⚙️',base:200,mult:1.85,get:()=>state.autoLevel,apply:()=>{state.autoLevel++}},
  {key:'luck',name:'Luck Boost',desc:'+5% upgrade chance',icon:'🍀',base:500,mult:2.25,get:()=>state.luckLevel,apply:()=>{state.luckLevel++}},
];

function renderUpgrades(){
  const c=$('upgradesContainer'); c.innerHTML='';
  upgrades.forEach(u=>{
    const lvl=u.get(); const cost=Math.floor(u.base*Math.pow(u.mult,lvl)); const can=state.money>=cost;
    const div=document.createElement('div'); div.className='up glass';
    div.innerHTML=`<div class="up-inner"><div class="up-left"><div class="up-icon">${u.icon}</div><div style="min-width:0"><div class="up-name">${u.name} <span class="up-lvl">Lv ${lvl}</span></div><div class="up-desc">${u.desc}</div></div></div><button class="up-btn ${can?'up-can':'up-cant'}">${fmt(cost)}</button></div>`;
    div.querySelector('button').onclick=()=>{ if(!can){ beep(180,0.1,0.06,'sawtooth'); return;} state.money-=cost; u.apply(); beep(600+Math.random()*150,0.09,0.08,'sine'); renderUpgrades(); updateUI(); save(); };
    c.appendChild(div);
  });
}

function renderShop(){
  const c=$('shopContainer'); c.innerHTML='';
  Object.values(boxes).forEach(box=>{
    const can=state.money>=box.price;
    const div=document.createElement('div'); div.className='shop-item glass'+(!can?' disabled':'');
    div.innerHTML=`<div class="shop-hover" style="background:${box.color}"></div><div class="shop-main"><div class="shop-emoji">${box.emoji}</div><div class="shop-info"><div class="shop-name">${box.name}</div><div class="shop-price">${fmt(box.price)}</div></div><div class="shop-buy">Buy</div></div><div class="shop-odds">${Object.entries(box.odds).map(([r,p])=>`<span class="odd ${rarityConfig[r].class}">${r[0]} ${p}%</span>`).join('')}</div><div class="tooltip-shop"><div style="font-weight:700;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;opacity:.8">Drop Rates</div>${Object.entries(box.odds).map(([r,p])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0"><span style="font-weight:500;color:${rarityConfig[r].color}">${rarityConfig[r].name}</span><span style="font-family:monospace">${p}%</span></div>`).join('')}${state.luckLevel>0?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;opacity:.7">Luck ${state.luckLevel} → +${state.luckLevel*5}% upgrade rolls</div>`:''}</div>`;
    div.onclick=()=>buyBox(box.key); c.appendChild(div);
  });
}

function launchConfetti(){
  const canvas=$('confettiCanvas'); const ctx=canvas.getContext('2d'); const rect=canvas.getBoundingClientRect(); canvas.width=rect.width*devicePixelRatio; canvas.height=rect.height*devicePixelRatio; ctx.scale(devicePixelRatio,devicePixelRatio); const W=rect.width,H=rect.height;
  const pieces=Array.from({length:140},()=>({x:W/2+(Math.random()-0.5)*100,y:H*0.3,vx:(Math.random()-0.5)*6,vy:-Math.random()*6-2,r:4+Math.random()*6,c:`hsl(${Math.random()*360},100%,65%)`,rot:Math.random()*360,vr:(Math.random()-0.5)*10}));
  let t=0; function anim(){ ctx.clearRect(0,0,W,H); pieces.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.18; p.vx*=0.99; p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.c; ctx.globalAlpha=0.9; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); }); t++; if(t<220) requestAnimationFrame(anim); else ctx.clearRect(0,0,W,H); } anim();
}

let displayMoney=state.money;
function loop(){ displayMoney+=(state.money-displayMoney)*0.18; if(Math.abs(displayMoney-state.money)<0.5) displayMoney=state.money; $('moneyDisplay').textContent=fmt(displayMoney); requestAnimationFrame(loop); }
loop();

setInterval(()=>{ if(state.autoLevel>0){ const gain=state.autoLevel*state.clickValue; state.money+=gain; state.totalEarned+=gain; if(Math.random()<0.4){ const p=document.createElement('div'); p.className='particle'; p.textContent='+'+gain; p.style.color='#7dd3fc'; p.style.fontSize='14px'; p.style.top='20%'; p.style.transform=`translateX(-50%) translateX(${(Math.random()-0.5)*60}px)`; $('particleContainer').appendChild(p); setTimeout(()=>p.remove(),800); } updateUI(); } },1000);

function updateUI(){
  $('perClickDisplay').textContent='+'+fmt(state.clickValue).slice(1);
  $('autoDisplay').textContent=state.autoLevel?`${state.autoLevel*state.clickValue}/sec`:'0/sec';
  $('clickCount').textContent=state.totalClicks.toLocaleString();
  $('statClicks').textContent=state.totalClicks.toLocaleString();
  $('statEarned').textContent=fmt(state.totalEarned);
  $('statBoxes').textContent=state.boxesOpened.toLocaleString();
  $('statRarest').textContent=state.boxesOpened===0?'-':rarityConfig[state.rarest]?.name||'-';
  renderUpgrades(); renderShop();
}

updateInventory(); updateUI(); displayMoney=state.money; setInterval(save,4000);

$('resetBtn').onclick=()=>{ if(confirm('Reset ALL progress? This cannot be undone.')){ localStorage.removeItem('foodClicker_v2'); location.reload(); } };

let lastTouch=0; document.addEventListener('touchend',e=>{ const now=Date.now(); if(now-lastTouch<300) e.preventDefault(); lastTouch=now; },{passive:false});
window.addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('coinBtn').dispatchEvent(new PointerEvent('pointerdown')); } if(e.key.toLowerCase()==='b') buyBox('basic'); if(e.key.toLowerCase()==='l') buyBox('lucky'); if(e.key.toLowerCase()==='g') buyBox('golden'); });