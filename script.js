const $ = id => document.getElementById(id);
const CRATES = {
  basic:{cost:10,luck:1,name:'Basic Crate',icon:'📦',class:'basic'},
  lucky:{cost:100,luck:3,name:'Lucky Crate',icon:'🧰',class:'lucky'},
  mega:{cost:500,luck:10,name:'Mega Crate',icon:'💎',class:'mega'}
};
const RARITIES = [
  {id:'common', name:'Common', weight:60, color:'#9ca3af', items:[{emoji:'🍞',name:'Bread'},{emoji:'🍎',name:'Apple'}]},
  {id:'uncommon', name:'Uncommon', weight:25, color:'#22c55e', items:[{emoji:'🍔',name:'Burger'},{emoji:'🍕',name:'Pizza'}]},
  {id:'rare', name:'Rare', weight:10, color:'#3b82f6', items:[{emoji:'🍣',name:'Sushi'},{emoji:'🌮',name:'Taco'}]},
  {id:'epic', name:'Epic', weight:4, color:'#a855f7', items:[{emoji:'🍜',name:'Ramen'},{emoji:'🥩',name:'Steak'}]},
  {id:'legendary', name:'Legendary', weight:0.9, color:'#f59e0b', items:[{emoji:'🍩',name:'Golden Donut'}]},
  {id:'mythic', name:'Mythic', weight:0.1, color:'#ec4899', items:[{emoji:'🍰',name:'Rainbow Cake'}]}
];

let state = {
  coins:0, totalEarned:0, clicks:0, perClick:1, boxesOpened:0, bestPull:null,
  upgrades:{click:0, auto:0},
  inventory:{}
};

let audioCtx;
function initAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
function beep(freq,dur=0.08,type='sine',vol=0.15){
  if(!audioCtx) return;
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type=type; o.frequency.value=freq; o.connect(g); g.connect(audioCtx.destination);
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
  o.start(); o.stop(audioCtx.currentTime+dur);
}
function popSound(){ beep(900,0.04,'square',0.12); setTimeout(()=>beep(500,0.06,'sine',0.1),40); }
function openSound(){ beep(600,0.08); setTimeout(()=>beep(800,0.1),80); }
function legendarySound(){ [523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>beep(f,0.14,'sawtooth',0.18),i*110)); }
function mythicSound(){ [659,784,988,1318,1567,1975].forEach((f,i)=>setTimeout(()=>beep(f,0.12,'triangle',0.2),i*90)); }

function save(){ localStorage.setItem('coinFoodBoxes', JSON.stringify(state)); }
function load(){
  try{
    const s = JSON.parse(localStorage.getItem('coinFoodBoxes'));
    if(s) state = Object.assign(state,s);
  }catch(e){}
}

function format(n){ return n>=1e6? (n/1e6).toFixed(1)+'M' : n>=1e3? (n/1e3).toFixed(1)+'k' : Math.floor(n).toLocaleString(); }

function updateUI(){
  $('coinCount').textContent = format(state.coins);
  $('perClick').textContent = state.perClick;
  $('statClicks').textContent = format(state.clicks);
  $('statEarned').textContent = format(state.totalEarned);
  $('statBoxes').textContent = state.boxesOpened;
  $('statBest').textContent = state.bestPull!==null? RARITIES[state.bestPull].name : '-';
  if(state.bestPull!==null) $('statBest').style.color = RARITIES[state.bestPull].color;

  document.querySelectorAll('.crate').forEach(el=>{
    const type = el.dataset.crate;
    const c = CRATES[type];
    const can = state.coins >= c.cost;
    el.classList.toggle('disabled',!can);
    el.querySelector('.price').textContent = c.cost;
  });

  const clickCost = Math.floor(50 * Math.pow(1.65, state.upgrades.click));
  const autoCost = Math.floor(200 * Math.pow(1.75, state.upgrades.auto));
  $('clickLvl').textContent = state.upgrades.click;
  $('autoLvl').textContent = state.upgrades.auto;
  $('autoRate').textContent = state.upgrades.auto;
  $('buyClick').textContent = clickCost+' 💰';
  $('buyClick').disabled = state.coins < clickCost;
  $('buyAuto').textContent = autoCost+' 💰';
  $('buyAuto').disabled = state.coins < autoCost;

  renderInventory();
}

function renderInventory(){
  const grid = $('inventoryGrid');
  grid.innerHTML='';
  const items = Object.values(state.inventory).sort((a,b)=>b.rarityIdx - a.rarityIdx);
  $('collectionCount').textContent = items.length? `(${items.length}/10)` : '';
  if(!items.length){ grid.innerHTML='<div class="empty-inv">Open crates to collect foods!</div>'; return; }
  items.forEach(it=>{
    const div=document.createElement('div');
    div.className='inv-item';
    div.style.borderColor = RARITIES[it.rarityIdx].color+'55';
    div.innerHTML = `<div class="inv-emoji">${it.emoji}</div><div class="inv-name">${it.name}</div><div class="inv-count">x${it.count}</div>${it.new?'<div class="new-badge">NEW</div>':''}`;
    grid.appendChild(div);
  });
}

function handleClick(e){
  initAudio();
  state.clicks++;
  state.coins += state.perClick;
  state.totalEarned += state.perClick;
  $('coinCount').classList.add('pulse'); setTimeout(()=>$('coinCount').classList.remove('pulse'),250);
  $('bigCoin').classList.add('clicked'); setTimeout(()=>$('bigCoin').classList.remove('clicked'),100);
  popSound();
  showFloat('+'+state.perClick);
  spawnSparks(e);
  updateUI(); save();
}

function showFloat(txt){
  const el = document.createElement('div');
  el.className='float-text'; el.textContent=txt;
  el.style.left = (45 + Math.random()*10)+'%';
  $('coinWrap').appendChild(el);
  setTimeout(()=>el.remove(),800);
}

function spawnSparks(e){
  const wrap = $('coinWrap').getBoundingClientRect();
  const cx = wrap.left + wrap.width/2;
  const cy = wrap.top + wrap.height/2;
  for(let i=0;i<10;i++){
    const s=document.createElement('div'); s.className='spark';
    const ang = Math.random()*Math.PI*2; const dist = 40+Math.random()*60;
    s.style.left = cx+'px'; s.style.top = cy+'px';
    s.style.setProperty('--x', Math.cos(ang)*dist+'px');
    s.style.setProperty('--y', Math.sin(ang)*dist+'px');
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),600);
  }
}

function buyCrate(type){
  const c = CRATES[type];
  if(state.coins < c.cost) return;
  initAudio();
  state.coins -= c.cost;
  state.boxesOpened++;
  updateUI(); save();
  openCrate(c);
}

function pickFood(luck){
  const weights = RARITIES.map((r,i)=> i>=2? r.weight*luck : r.weight);
  const total = weights.reduce((a,b)=>a+b,0);
  let rnd = Math.random()*total;
  let idx=0;
  for(let i=0;i<weights.length;i++){ rnd-=weights[i]; if(rnd<=0){ idx=i; break; } }
  const rarity = RARITIES[idx];
  const item = rarity.items[Math.floor(Math.random()*rarity.items.length)];
  return {item, rarity, idx};
}

/* Confetti */
const canvas = $('confetti'), ctx = canvas.getContext('2d');
let particles=[];
function resize(){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
window.addEventListener('resize',resize); resize();
function burstConfetti(colors, count=120){
  const cols = colors || ['#8b5cf6','#3b82f6','#22c55e','#f59e0b','#ec4899','#fff'];
  for(let i=0;i<count;i++){
    particles.push({x:canvas.width/2, y:canvas.height/2.2, vx:(Math.random()-0.5)*14, vy:Math.random()*-14-2, r:Math.random()*5+3, color:cols[Math.floor(Math.random()*cols.length)], life:90+Math.random()*30, rot:Math.random()*360});
  }
}
function confettiLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles = particles.filter(p=>p.life>0);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.35; p.vx*=0.99; p.life--; p.rot+=4;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
    ctx.globalAlpha = Math.max(0,p.life/120); ctx.fillStyle=p.color; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r); ctx.restore();
  });
  requestAnimationFrame(confettiLoop);
}
confettiLoop();

function openCrate(crate){
  const modal = $('modal');
  const crateAnim = $('crateAnim');
  const reveal = $('reveal');
  modal.classList.add('active');
  crateAnim.style.display='block';
  crateAnim.className='crate-large '+crate.class+' shaking';
  crateAnim.textContent = crate.icon;
  reveal.classList.add('hidden');
  particles=[];

  const result = pickFood(crate.luck);

  setTimeout(()=>{
    crateAnim.classList.remove('shaking');
    crateAnim.classList.add('burst');
    openSound();
    burstConfetti([result.rarity.color, '#fff', '#ffd700'], result.idx>=4?200:120);
    if(result.idx>=4){
      document.body.classList.add('flash-screen');
      setTimeout(()=>document.body.classList.remove('flash-screen'),500);
      if(result.idx===4) legendarySound(); else mythicSound();
      burstConfetti(['#ff00cc','#00ccff','#ffcc00','#fff'],180);
    }
  },750);

  setTimeout(()=>{
    crateAnim.style.display='none';
    $('revealEmoji').textContent = result.item.emoji;
    $('revealName').textContent = result.item.name;
    $('revealRarity').textContent = result.rarity.name;
    $('revealRarity').style.color = result.rarity.color;
    $('revealRarity').style.textShadow = `0 0 20px ${result.rarity.color}`;
    $('revealRarity').className = result.idx===5? 'mythic-text' : '';
    reveal.classList.remove('hidden');

    // add to inventory
    const key = result.item.name;
    if(!state.inventory[key]){
      state.inventory[key] = {count:0, emoji:result.item.emoji, name:result.item.name, rarity:result.rarity.id, rarityIdx:result.idx, new:true};
      setTimeout(()=>{ if(state.inventory[key]) state.inventory[key].new=false; renderInventory(); },3500);
    }
    state.inventory[key].count++;
    if(state.bestPull===null || result.idx>state.bestPull) state.bestPull=result.idx;
    updateUI(); save();
  },1150);
}

$('modal').addEventListener('click', e=>{
  if(e.target.classList.contains('modal-bg') ||!e.target.closest('.open-stage') ||!$('reveal').classList.contains('hidden')){
    $('modal').classList.remove('active');
  }
});

document.querySelectorAll('.crate').forEach(el=>{
  el.addEventListener('click',()=>{ if(!el.classList.contains('disabled')) buyCrate(el.dataset.crate); });
});

$('buyClick').addEventListener('click', ()=>{
  const cost = Math.floor(50 * Math.pow(1.65, state.upgrades.click));
  if(state.coins>=cost){ state.coins-=cost; state.upgrades.click++; state.perClick++; updateUI(); save(); popSound(); }
});
$('buyAuto').addEventListener('click', ()=>{
  const cost = Math.floor(200 * Math.pow(1.75, state.upgrades.auto));
  if(state.coins>=cost){ state.coins-=cost; state.upgrades.auto++; updateUI(); save(); popSound(); }
});

setInterval(()=>{
  if(state.upgrades.auto>0){
    state.coins += state.upgrades.auto;
    state.totalEarned += state.upgrades.auto;
    $('coinCount').classList.add('pulse'); setTimeout(()=>$('coinCount').classList.remove('pulse'),200);
    updateUI();
  }
},1000);

$('bigCoin').addEventListener('click', handleClick);
$('bigCoin').addEventListener('touchstart', e=>{ e.preventDefault(); handleClick(e); }, {passive:false});

$('resetBtn').addEventListener('click', ()=>{
  if(confirm('Reset all progress?')){ localStorage.removeItem('coinFoodBoxes'); location.reload(); }
});

// init
load();
updateUI();
setInterval(save,5000);

// prevent double-tap zoom on iOS
let lastTouch=0;
document.addEventListener('touchend',e=>{ const now=Date.now(); if(now-lastTouch<=300) e.preventDefault(); lastTouch=now; },{passive:false});