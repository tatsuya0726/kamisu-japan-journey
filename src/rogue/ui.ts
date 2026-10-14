/** DOM screens for the turn-based roguelike run: map, battle (FF-style command windows), events, shop, rewards. */
import {newRun,visit,startBoss,chooseEvent,finishEvent,rest,buy,leaveShop,useItem,takeReward,resolveRound,dismissBattle,living,DAYS,CHAPTERS,xpNeed,type RunState,type Member,type Cmd,type Ev,type Foe,type Ref} from './engine.ts';
import {SKILLS,ITEMS,PERKS,EVENTS,MEMBERS,BOSSES,BOSS_BG,BOSS_PLACE,PLACE_BG,SPOTS,FOES} from './data.ts';
import {saveRun,clearRun,loadRun,recordResult,loadBest} from './save.ts';
import {MISSION_LOCATIONS} from '../mission-locations.ts';
import {APPROVED_ART,artURL} from '../defense-assets.ts';
import {faceHTML} from '../dialogue.ts';
import {evoOf,PATH,TRACKS,T1,T2,formName,hasLook,type Track,type EvoEvent} from './evolve.ts';

export type RogueHooks={sfx:(k:'attack'|'win'|'lose'|'spawn'|'base')=>void;exit:()=>void};
type Menu='main'|'skill'|'item'|'foe'|'ally';
type Vis={foeHp:Map<number,number>;foeShown:Set<number>;hp:number[];mp:number[];down:Set<string>};
const KIND={battle:{l:'戦',n:'戦闘',d:'敵と戦う'},elite:{l:'強',n:'強敵',d:'強い敵。勝つと良いアイテムが手に入る'},event:{l:'？',n:'イベント',d:'何かが起きる'},rest:{l:'休',n:'休息',d:'全員のHPをかいふく'},shop:{l:'店',n:'おみせ',d:'かつおぶしで買い物'}} as const;
const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct=(a:number,b:number)=>Math.max(0,Math.min(100,Math.round(100*a/Math.max(1,b))));
const img=(key:string,cls='')=>`<img class="${cls}" alt="" decoding="async" src="${artURL(key)}">`;

let root:HTMLElement,run:RunState,hooks:RogueHooks;
const ui={sel:-1,sheet:'' as ''|'items'|'quit'|'itemTarget'|'member',sheetI:0,evo:null as null|{list:EvoEvent[];idx:number},evoSeen:false,mapV:{k:1,cx:null as number|null,cy:null as number|null},noClick:0,msgOff:false,msgT:0 as number,sheetItem:'',menu:'main' as Menu,cur:0,cmds:[] as (Cmd|undefined)[],pending:null as null|{t:'attack'}|{t:'skill';skill:string}|{t:'item';item:string},busy:false,fast:false,log:[] as string[],toast:'',vis:null as Vis|null,result:false};
const save=()=>{if(run.phase==='over'||run.phase==='clear')clearRun();else saveRun(run);};

export function openRogue(h:RogueHooks,resume:boolean){hooks=h;
 let el=document.getElementById('rogue');if(!el){el=document.createElement('div');el.id='rogue';el.className='rg';document.body.append(el);el.addEventListener('click',onClick);el.addEventListener('wheel',mapWheel,{passive:false});for(const t of ['pointerdown','pointermove','pointerup','pointercancel'])el.addEventListener(t,mapPointer as EventListener);new ResizeObserver(()=>layoutMap()).observe(el);}
 root=el;root.hidden=false;document.documentElement.classList.add('rogue-open');
 const saved=resume?loadRun():null;run=saved??newRun();Object.assign(ui,{mapV:{k:1,cx:null,cy:null},msgOff:false,evo:null,evoSeen:false,sel:-1,sheet:'',menu:'main',cur:0,cmds:[],pending:null,busy:false,log:[],toast:'',vis:null,result:false});
 if(!saved){clearRun();ui.toast='遠征のはじまり！ 7日ごとにボスが待っている。';}
 save();render();}
export function closeRogue(){if(root)root.hidden=true;document.documentElement.classList.remove('rogue-open');}

// ---------- shared pieces ----------
const bar=(a:number,b:number,cls='')=>`<i class="rg-bar ${cls}"><b style="width:${pct(a,b)}%"></b></i>`;
const evoCls=(m:Member)=>{const e=m.evo;return e&&e.tier&&!e.plain?`evo evo-${e.path} t${e.tier}`:'';};
const evMini=(m:Member)=>{const e=evoOf(m);return e.tier?`<span class="rg-ev" style="color:${PATH[e.path as Track].color}">${'★'.repeat(e.tier)}${PATH[e.path as Track].mark}</span>`:`<span class="rg-ev">${TRACKS.map(t=>`${PATH[t].mark}${e[t]}`).join(' ')}</span>`;};
function partyCards(compact=false){return `<div class="rg-cards ${compact?'compact':''}">${run.party.map((m,i)=>`<button class="rg-card ${m.hp<=0?'ko':''}" data-rg="member" data-i="${i}" aria-label="${m.name} レベル${m.level} HP${m.hp}/${m.maxHp} 詳細">${img(m.art,'rg-face '+evoCls(m))}<span class="rg-nm">${m.name}<small>Lv${m.level}</small></span>${bar(m.hp,m.maxHp)}<span class="rg-num">HP ${m.hp}/${m.maxHp}　気力 ${m.mp}/${m.maxMp}</span>${evMini(m)}</button>`).join('')}</div>`;}
const chips=()=>`<div class="rg-chips">${run.party.map((m,i)=>`<button class="rg-chip ${m.hp<=0?'ko':''}" data-rg="member" data-i="${i}" aria-label="${m.name} 詳細">${img(m.art,'rg-face '+evoCls(m))}<span><b>${m.name}</b>${bar(m.hp,m.maxHp)}<small>${m.hp}/${m.maxHp}</small></span></button>`).join('')}</div>`;
const topbar=(extra='')=>`<header class="rg-top"><div class="rg-week"><span>第${run.chapter}週</span><b>${Math.min(run.day,DAYS)}日目</b><small>/ ${DAYS}日</small></div><ol class="rg-pips" aria-label="${DAYS}日のうち${Math.min(run.day,DAYS)}日目">${Array.from({length:DAYS},(_,i)=>`<li class="${i+1<run.day?'past':i+1===run.day?'now':''} ${i===DAYS-1?'boss':''}"></li>`).join('')}</ol><div class="rg-gold">かつおぶし <b>${run.gold}</b></div>${extra}</header>`;
const scene=(bg:string,inner:string,cls='')=>`<div class="rg-scene ${cls}" style="background-image:linear-gradient(#0c223099,#0c2230d9),url('${artURL(bg)}')">${inner}</div>`;

// ---------- render by phase ----------
function render(){if(!root||root.hidden)return;
 let html='';
 if(run.battle)html=battleHTML();
 else if(run.phase==='map')html=mapHTML();
 else if(run.phase==='event')html=eventHTML();
 else if(run.phase==='shop')html=shopHTML();
 else if(run.phase==='reward')html=rewardHTML();
 else html=endHTML();
 root.innerHTML=html+sheetHTML()+evoHTML();layoutMap();
 const f=root.querySelector<HTMLElement>('[data-autofocus]');if(f&&!ui.busy)f.focus({preventScroll:true});}

function mapHTML(){const bossDay=run.day>=DAYS,b=BOSSES[run.chapter-1],sel=run.nodes[ui.sel];
 const nodes=run.nodes.map((n,i)=>{const p=SPOTS[i],k=KIND[n.kind];return `<button class="rg-node k-${n.kind} ${n.visited?'done':''} ${ui.sel===i?'sel':''}" data-x="${p.x}" data-y="${p.y}" data-rg="node" data-i="${i}" ${n.visited||bossDay?'disabled':''} aria-label="${SPOTS[i].name} ${k.n}${n.visited?' 訪問済み':''}" aria-pressed="${ui.sel===i}"><b>${n.visited?'✓':k.l}</b><span class="lab">${SPOTS[i].name}</span></button>`;}).join('');
 const bp=MISSION_LOCATIONS[run.chapter-1];
 const boss=`<button class="rg-node k-boss ${bossDay?'ready':''}" data-x="${bp.x}" data-y="${bp.y}" data-rg="${bossDay?'boss':'bossHint'}" aria-label="${BOSS_PLACE[run.chapter-1]} ボス ${b.name}"><b>${b.title==='ラスボス'?'王':'ボス'}</b><span class="lab">${BOSS_PLACE[run.chapter-1]}</span></button>`;
 let info:string;
 if(bossDay)info=`<div class="rg-info">${toastEl()}<strong>${DAYS}日目 — ${b.title}「${b.name}」が待っている！</strong><span>準備ができたら向かおう。</span></div><button class="rg-go" data-rg="boss" data-autofocus>ボスにいどむ</button>`;
 else if(sel){const k=KIND[sel.kind],foes=sel.foes.length?`<span>敵：${sel.foes.map(id=>nameOf(id)).join('・')}</span>`:`<span>${k.d}</span>`;info=`<div class="rg-info">${toastEl()}<strong>${SPOTS[ui.sel].name}：${k.n}</strong>${foes}</div><button class="rg-go" data-rg="go" data-autofocus>ここへ行く <small>(1日すすむ)</small></button>`;}
 else info=`<div class="rg-info">${toastEl()}<strong>行き先を選ぼう</strong><span>行動すると1日すすむ。${DAYS}日目にボス。行動のくせで仲間が進化する！</span></div>`;
 return `<div class="rg rg-mapscreen">${topbar(`<button class="rg-small" data-rg="items">どうぐ</button><button class="rg-small" data-rg="quit">やめる</button>`)}<div class="rg-mapview" id="rg-mapview"><img class="rg-mapbg" alt="" src="${APPROVED_ART.map}"><img class="rg-mapimg" alt="神栖の地図" src="${APPROVED_ART.map}">${nodes}${boss}<div class="rg-zoom" role="group" aria-label="地図のひょうじ"><button data-rg="zoomIn" aria-label="拡大">＋</button><button data-rg="zoomOut" aria-label="縮小">－</button><button data-rg="zoomReset">全体</button></div><p class="rg-zoomhint">ドラッグでいどう・ピンチで拡大縮小</p></div><footer class="rg-foot rg-mapfoot">${chips()}${info}</footer></div>`;}
type R={x:number;y:number;w:number;h:number};
const hit=(a:R,b:R)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
const IW=1024,IH=683,KMAX=4;
function mapBase(W:number,H:number,P:{x:number;y:number}[]){
 const x0=Math.min(...P.map(p=>p.x)),x1=Math.max(...P.map(p=>p.x)),y0=Math.min(...P.map(p=>p.y)),y1=Math.max(...P.map(p=>p.y));
 const fit=Math.min((W-116)/Math.max(40,x1-x0),(H-68)/Math.max(40,y1-y0)),sCover=Math.max(W/IW,H/IH),sMin=Math.min(W/IW,H/IH);
 return {s:Math.max(sMin,Math.min(fit,sCover*1.3)),cx:(x0+x1)/2,cy:(y0+y1)/2,sMin};}
function mapState(v:HTMLElement){const W=v.clientWidth,H=v.clientHeight,P=Array.from(v.querySelectorAll<HTMLElement>('.rg-node')).map(n=>({x:+n.dataset.x!/100*IW,y:+n.dataset.y!/100*IH}));
 const b=mapBase(W,H,P),kMin=Math.min(1,b.sMin*.95/b.s),k=Math.max(kMin,Math.min(KMAX,ui.mapV.k)),cx=Math.max(0,Math.min(IW,ui.mapV.cx??b.cx)),cy=Math.max(0,Math.min(IH,ui.mapV.cy??b.cy));
 return {W,H,P,S:b.s*k,k,cx,cy,kMin,s0:b.s};}
/** Draw the map at the current zoom/pan, then put every label where it covers no mark or other label. */
function layoutMap(){const v=root?.querySelector<HTMLElement>('#rg-mapview');if(!v||!v.clientWidth||!v.clientHeight)return;
 const m=mapState(v),{W,H,P,S,cx,cy}=m,ns=Array.from(v.querySelectorAll<HTMLElement>('.rg-node'));
 const ox=W/2-cx*S,oy=H/2-cy*S;
 Object.assign(v.querySelector<HTMLElement>('.rg-mapimg')!.style,{left:ox+'px',top:oy+'px',width:IW*S+'px',height:IH*S+'px'});
 const C=ns.map((n,i)=>{const px=ox+P[i].x*S,py=oy+P[i].y*S;n.style.left=px+'px';n.style.top=py+'px';n.hidden=px<-30||py<-30||px>W+30||py>H+30;return {n,px,py,r:n.offsetWidth/2};});
 const circles:R[]=C.map(c=>({x:c.px-c.r-2,y:c.py-c.r-2,w:c.r*2+4,h:c.r*2+4})),placed:R[]=[];
 C.forEach((c,i)=>{if(c.n.hidden)return;const lab=c.n.querySelector<HTMLElement>('.lab')!,w=lab.offsetWidth,h=lab.offsetHeight,g=3;
  const cand:R[]=[{x:c.px-w/2,y:c.py+c.r+g,w,h},{x:c.px-w/2,y:c.py-c.r-g-h,w,h},{x:c.px+c.r+g,y:c.py-h/2,w,h},{x:c.px-c.r-g-w,y:c.py-h/2,w,h}];
  const inside=(r:R)=>r.x>=2&&r.y>=2&&r.x+r.w<=W-2&&r.y+r.h<=H-2,clear=(r:R)=>!circles.some((q,j)=>j!==i&&hit(r,q)),free=(r:R)=>!placed.some(q=>hit(r,q));
  const pick=cand.find(r=>inside(r)&&clear(r)&&free(r))??cand.find(r=>inside(r)&&clear(r))??cand[0];
  placed.push(pick);lab.style.left=(pick.x-(c.px-c.r))+'px';lab.style.top=(pick.y-(c.py-c.r))+'px';});}
/** Zoom keeping the image point under (mx,my) fixed. */
function zoomAt(k:number,mx:number,my:number){const v=root.querySelector<HTMLElement>('#rg-mapview');if(!v)return;const m=mapState(v);
 const nk=Math.max(m.kMin,Math.min(KMAX,k)),wx=m.cx+(mx-m.W/2)/m.S,wy=m.cy+(my-m.H/2)/m.S,S2=m.s0*nk;
 ui.mapV={k:nk,cx:wx-(mx-m.W/2)/S2,cy:wy-(my-m.H/2)/S2};layoutMap();}
const ptrs=new Map<number,{x:number;y:number}>();let g0:null|{d:number;k:number;wx:number;wy:number;sx:number;sy:number;cx:number;cy:number;moved:boolean}=null;
function gestureStart(){const v=root.querySelector<HTMLElement>('#rg-mapview');if(!v||!ptrs.size){g0=null;return;}const m=mapState(v),r=v.getBoundingClientRect(),a=[...ptrs.values()];
 const mx=a.reduce((t,q)=>t+q.x,0)/a.length-r.left,my=a.reduce((t,q)=>t+q.y,0)/a.length-r.top;
 g0={d:a.length>1?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0,k:m.k,wx:m.cx+(mx-m.W/2)/m.S,wy:m.cy+(my-m.H/2)/m.S,sx:mx,sy:my,cx:m.cx,cy:m.cy,moved:g0?.moved??false};}
function gestureMove(){const v=root.querySelector<HTMLElement>('#rg-mapview');if(!v||!g0||!ptrs.size)return;const m=mapState(v),r=v.getBoundingClientRect(),a=[...ptrs.values()];
 const mx=a.reduce((t,q)=>t+q.x,0)/a.length-r.left,my=a.reduce((t,q)=>t+q.y,0)/a.length-r.top;
 if(a.length>1&&g0.d){const k=Math.max(m.kMin,Math.min(KMAX,g0.k*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/g0.d)),S2=m.s0*k;g0.moved=true;ui.mapV={k,cx:g0.wx-(mx-m.W/2)/S2,cy:g0.wy-(my-m.H/2)/S2};layoutMap();return;}
 if(!g0.moved&&Math.hypot(mx-g0.sx,my-g0.sy)<6)return;g0.moved=true;ui.mapV={k:m.k,cx:g0.wx-(mx-m.W/2)/m.S,cy:g0.wy-(my-m.H/2)/m.S};layoutMap();}
function mapPointer(e:PointerEvent){const t=e.target as HTMLElement;
 if(e.type==='pointerdown'){if(!t.closest('#rg-mapview')||t.closest('.rg-zoom'))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});gestureStart();return;}
 if(!ptrs.has(e.pointerId))return;
 if(e.type==='pointermove'){ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});gestureMove();return;}
 if(g0?.moved)ui.noClick=Date.now()+350;ptrs.delete(e.pointerId);if(ptrs.size)gestureStart();else g0=null;}
function mapWheel(e:WheelEvent){const v=root.querySelector<HTMLElement>('#rg-mapview');if(!v||!(e.target as HTMLElement).closest('#rg-mapview'))return;e.preventDefault();const r=v.getBoundingClientRect(),m=mapState(v);zoomAt(m.k*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)),e.clientX-r.left,e.clientY-r.top);}

const toastEl=()=>ui.toast?`<em class="rg-toast" role="status">${ui.toast}</em>`:'';
const nameOf=(id:string)=>FOE_NAMES[id]??id;
const FOE_NAMES:Record<string,string>=Object.fromEntries(Object.entries(FOES).map(([k,v])=>[k,v.name]));

function eventHTML(){const ev=run.event!,def=EVENTS.find(e=>e.id===ev.id)!,place=SPOTS[run.lastPlace]?.name??'';
 const body=ev.done?`<p class="rg-line" role="status">${ev.text}</p><button class="rg-go" data-rg="evDone" data-autofocus>つづける</button>`:`<p class="rg-line">${def.text}</p><div class="rg-choices">${def.choices.map((c,i)=>`<button data-rg="evPick" data-i="${i}" ${i===0?'data-autofocus':''}>${c.label}</button>`).join('')}</div>`;
 return `<div class="rg">${topbar()}${scene(PLACE_BG[run.lastPlace]??'town',`<section class="rg-panel"><small>${place}</small><h2>${def.title}</h2><div class="rg-talk">${faceHTML({speaker:'kiki',emotion:ev.done?'smile':'surprised'},import.meta.env.BASE_URL)}${faceHTML({speaker:'nene',emotion:ev.done?'smile':'normal'},import.meta.env.BASE_URL)}</div>${body}<small class="rg-note">創作のお話です。実在の出来事ではありません。</small></section>`)}<footer class="rg-foot">${chips()}</footer></div>`;}

function shopHTML(){const place=SPOTS[run.lastPlace]?.name??'';
 return `<div class="rg">${topbar()}${scene(PLACE_BG[run.lastPlace]??'town',`<section class="rg-panel"><small>${place}</small><h2>ねこの よろず屋</h2><ul class="rg-shop">${run.shop!.offers.map(id=>{const it=ITEMS[id],have=run.items[id]??0,can=run.gold>=it.price&&have<9;return `<li><span><b>${it.name}</b><small>${it.note}　持っている：${have}</small></span><button data-rg="buy" data-id="${id}" ${can?'':'disabled'}>${it.price}</button></li>`;}).join('')}</ul><button class="rg-go" data-rg="leave" data-autofocus>でていく</button></section>`)}<footer class="rg-foot">${chips()}</footer></div>`;}

function rewardHTML(){const opts=run.reward!;
 return `<div class="rg">${topbar()}${scene(BOSS_BG[run.chapter-1],`<section class="rg-panel wide"><small>${BOSSES[run.chapter-1].title}をたおした！</small><h2>ごほうびを1つ えらぼう</h2><div class="rg-rewards">${opts.map((o,i)=>o.kind==='perk'?(()=>{const p=PERKS.find(x=>x.id===o.id)!;return `<button data-rg="reward" data-i="${i}" ${i===0?'data-autofocus':''}><b>${p.name}</b><span>${p.note}</span></button>`;})():(()=>{const m=MEMBERS[o.id];return `<button data-rg="reward" data-i="${i}">${img(m.art,'rg-face')}<b>${m.name}が仲間になる</b><span>${m.blurb}</span></button>`;})()).join('')}</div><small class="rg-note">選ぶと全員のHPが少し回復して、次の週がはじまる。</small></section>`)}<footer class="rg-foot">${chips()}</footer></div>`;}

function endHTML(){const win=run.phase==='clear',best=loadBest();
 return `<div class="rg">${scene(win?'town':'port',`<section class="rg-panel wide end ${win?'win':'lose'}"><h2>${win?'神栖は守られた！':'遠征は ここまで…'}</h2><p class="rg-line">${win?'ラスボスをたおして、3週間の遠征をやりとげた。':`第${run.chapter}週 ${Math.min(run.day,DAYS)}日目で、みんなたおれてしまった。`}</p><ul class="rg-stats"><li>すすんだ日数 <b>${run.stats.days}</b></li><li>戦闘 <b>${run.stats.battles}</b>回</li><li>ターン <b>${run.stats.turns}</b></li><li>クリア <b>${best.clears}</b>回 / 挑戦 <b>${best.runs}</b>回</li></ul><div class="rg-choices"><button data-rg="again" data-autofocus>もういちど遠征へ</button><button data-rg="title">タイトルへ</button></div></section>`)}</div>`;}

function memberSheet(){const m=run.party[ui.sheetI];if(!m)return '';const e=evoOf(m),base=MEMBERS[m.id];
 const rows=TRACKS.map(t=>{const P=PATH[t],n=e[t],target=e.tier===0?T1:e.tier===1&&e.path===t?T2:0,tier=(e.tier===0?1:2) as 1|2,mine=e.path===t,dim=e.tier>0&&!mine;
  const pips=target?Array.from({length:target},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join(''):'';
  const next=target?(hasLook(m.id,t)?`→ <b>${formName(m.id,base.name,t,tier)}</b>（わざ：${SKILLS[P.skills[tier-1]].name}）`:'→ レベルが1上がる'):(mine&&e.tier===2?'最終しんか！':'');
  return `<li class="${dim?'dim':''}" style="--c:${P.color}"><span class="mk">${P.mark}</span><div><b>${P.label}</b><small>${P.hint}</small><span class="pips">${pips}<em>${n}回</em></span><small>${next}</small></div></li>`;}).join('');
 return `<div class="rg-sheet" role="dialog" aria-label="${m.name}"><div class="rg-msheet"><div class="rg-mhead">${img(m.art,'rg-face '+evoCls(m))}<div><h3>${m.name} <small>Lv${m.level}${e.tier?' '+'★'.repeat(e.tier):''}</small></h3><p>HP ${m.hp}/${m.maxHp}　気力 ${m.mp}/${m.maxMp}<br>こうげき ${m.atk}　ぼうぎょ ${m.def}　すばやさ ${m.spd}</p></div></div><h4>おぼえているわざ</h4><ul class="rg-sk">${m.skills.map(id=>SKILLS[id]).map(k=>`<li><b>${k.name}</b><small>気力${k.cost}・${k.note}</small></li>`).join('')}</ul><h4>しんかの道（3回くり返すと進化）</h4><ul class="rg-path">${rows}</ul><button data-rg="sheetClose" data-autofocus>とじる</button></div></div>`;}
function sheetHTML(){if(ui.sheet==='member')return memberSheet();
 if(ui.sheet==='quit')return `<div class="rg-sheet" role="dialog" aria-label="確認"><div><h3>遠征をやめる？</h3><p>ここまでの進行は保存されます。タイトルの「つづきから」で再開できます。</p><div class="rg-choices"><button data-rg="sheetClose">続ける</button><button data-rg="title" data-autofocus>タイトルへ</button></div></div></div>`;
 if(ui.sheet==='items'){const list=Object.keys(ITEMS).filter(id=>(run.items[id]??0)>0);return `<div class="rg-sheet" role="dialog" aria-label="どうぐ"><div><h3>どうぐ</h3>${list.length?`<ul class="rg-shop">${list.map(id=>`<li><span><b>${ITEMS[id].name} ×${run.items[id]}</b><small>${ITEMS[id].note}</small></span><button data-rg="pickItem" data-id="${id}">つかう</button></li>`).join('')}</ul>`:'<p>もっているどうぐはない。</p>'}<button data-rg="sheetClose" data-autofocus>とじる</button></div></div>`;}
 if(ui.sheet==='itemTarget')return `<div class="rg-sheet" role="dialog" aria-label="だれに使う？"><div><h3>${ITEMS[ui.sheetItem].name}をだれに？</h3><div class="rg-choices">${run.party.map((m,i)=>`<button data-rg="useOn" data-i="${i}">${m.name} <small>HP ${m.hp}/${m.maxHp}</small></button>`).join('')}</div><button data-rg="sheetClose" data-autofocus>もどる</button></div></div>`;
 return '';}

function evoHTML(){if(!ui.evo)return '';const e=ui.evo.list[ui.evo.idx],P=PATH[e.after.path],last=ui.evo.idx>=ui.evo.list.length-1,sk=SKILLS[e.skill];
 const row=(l:string,a:number,b:number)=>`<li><span>${l}</span><b>${a}</b><i>→</i><b class="up">${b}</b></li>`;
 return `<div class="rg-evo" role="dialog" aria-label="進化" style="--c:${P.color}"><div class="rg-evo-box"><div class="rg-evo-stage"><i class="rays"></i><img class="old" alt="" src="${artURL(e.before.art)}"><img class="new evo evo-${e.after.path} t${e.after.tier}" alt="" src="${artURL(e.after.art)}"></div><div class="rg-evo-info"><small>${P.mark} ${P.label}へ — 「${P.hint}」を重ねた！</small><h2>${e.before.name}は<br><span>${e.after.name}</span>に進化した！</h2><ul>${row('HP',e.before.hp,e.after.hp)}${row('こうげき',e.before.atk,e.after.atk)}${row('ぼうぎょ',e.before.def,e.after.def)}${row('すばやさ',e.before.spd,e.after.spd)}${row('気力',e.before.mp,e.after.mp)}</ul><p>おぼえたわざ：<b>${sk.name}</b><small>　気力${sk.cost}・${sk.note}</small></p><button class="rg-go" data-rg="evoNext" data-autofocus>${last?'つづける':'つぎへ'}</button></div></div></div>`;}

// ---------- battle ----------
function snapshot():Vis{const b=run.battle!;return {foeHp:new Map(b.foes.map(f=>[f.uid,f.hp])),foeShown:new Set(b.foes.filter(f=>f.hp>0).map(f=>f.uid)),hp:run.party.map(m=>m.hp),mp:run.party.map(m=>m.mp),down:new Set(run.party.flatMap((m,i)=>m.hp<=0?['p'+i]:[]))};}
function foeHTML(f:Foe){const v=ui.vis!,hp=v.foeHp.get(f.uid)??f.hp,dead=hp<=0;return `<button class="rg-foe ${dead?'dead':''} ${f.charging?'charging':''} ${ui.menu==='foe'&&!dead?'targetable':''}" data-rg="foe" data-uid="${f.uid}" style="--k:${(f.h/110).toFixed(2)}" aria-label="${f.name} HP${hp}/${f.maxHp}" ${dead?'tabindex="-1"':''}>${img(f.art,'rg-sprite')}<span class="rg-fname">${f.name}</span>${bar(hp,f.maxHp,'foe')}</button>`;}
function stageHTML(){const b=run.battle!,v=ui.vis!;
 return `<div class="rg-party">${run.party.map((m,i)=>`<button class="rg-mem ${v.down.has('p'+i)?'down':''} ${ui.menu==='ally'&&!v.down.has('p'+i)?'targetable':''}" data-rg="ally" data-i="${i}" aria-label="${m.name}">${img(m.art,'rg-sprite '+evoCls(m))}</button>`).join('')}</div><div class="rg-foes">${b.foes.filter(f=>v.foeShown.has(f.uid)).map(foeHTML).join('')}</div>`;}
const msgHTML=()=>ui.log.slice(-2).map(l=>`<p>${l}</p>`).join('');
function battleHTML(){const b=run.battle!;if(!ui.vis)ui.vis=snapshot();
 const bg=b.boss?BOSS_BG[run.chapter-1]:PLACE_BG[run.lastPlace]??'town';
 return `<div class="rg rg-battle" style="--bg:url('${artURL(bg)}')"><div class="rg-stage" id="rg-stage">${stageHTML()}<div class="rg-banner">${b.boss?`ボス戦 — ${b.foes.find(f=>f.boss)?.name??''}`:`第${run.chapter}週 ${Math.max(1,Math.min(run.day,DAYS+1)-1)}日目`}<small>ターン ${b.round}</small></div><div class="rg-msg ${ui.msgOff?'off':''}" id="rg-msg" aria-live="polite">${msgHTML()}</div></div><div class="rg-ui"><div class="rg-win"><div class="rg-cmd" id="rg-cmd">${cmdHTML()}</div><div class="rg-stat" id="rg-stat">${statHTML()}</div></div></div></div>`;}
function statHTML(){const v=ui.vis!;return run.party.map((m,i)=>{const hp=v.hp[i]??m.hp,mp=v.mp[i]??m.mp,cur=!ui.busy&&!run.battle?.over&&ui.cur===i,e=m.evo;return `<div class="rg-row ${cur?'cur':''} ${hp<=0?'ko':''}"><span class="nm">${m.name}<small>Lv${m.level}${e&&e.tier?' '+'★'.repeat(e.tier):''}</small></span><span class="n">${hp}<small>/${m.maxHp}</small></span><span class="n mp">${mp}<small>気力</small></span>${bar(hp,m.maxHp)}</div>`;}).join('');}
function cmdHTML():string{const b=run.battle!;
 if(b.over){const r=b.rewards;const evo=r?.evos?.length?`<p class="lv">✨ ${r.evos.map(x=>x.before.name).join('・')} が進化できる！</p>`:'';return b.over==='win'&&r?`<h3>勝利！</h3><p>かつおぶし +${r.gold}　経験値 +${r.xp}${r.items.length?`　${r.items.map(i=>ITEMS[i].name).join('・')}を入手`:''}</p>${r.levelUps.length?`<p class="lv">${r.levelUps.join('　')} にレベルアップ！</p>`:''}${evo}<button class="rg-go" data-rg="after" data-autofocus>つづける</button>`:b.over==='fled'?`<h3>にげのびた</h3><button class="rg-go" data-rg="after" data-autofocus>つづける</button>`:`<h3>ぜんめつ…</h3><button class="rg-go" data-rg="after" data-autofocus>つづける</button>`;}
 if(ui.busy)return `<div class="rg-head"><h3>たたかい中…</h3><button data-rg="fast">${ui.fast?'ふつうの速さ':'はやおくり'}</button></div>`;
 const m=run.party[ui.cur];if(!m)return '';
 const head=(back:string)=>`<div class="rg-head"><h3>${m.name}<small> のターン</small></h3>${back}</div>`,sub='<button class="back" data-rg="menuMain">もどる</button>';
 if(ui.menu==='main')return `${head(ui.cur>firstLiving()?'<button class="back" data-rg="cmdBack">ひとつ前</button>':'')}<div class="rg-list main"><button data-rg="cmdAttack" data-autofocus>たたかう</button><button data-rg="cmdSkill" ${m.skills.length?'':'disabled'}>わざ</button><button data-rg="cmdItem">どうぐ</button><button data-rg="cmdGuard">ぼうぎょ</button><button data-rg="cmdFlee" ${b.boss?'disabled':''}>にげる</button></div>`;
 if(ui.menu==='skill')return `${head(sub)}<div class="rg-list">${m.skills.map(id=>SKILLS[id]).map(s=>`<button data-rg="cmdPick" data-id="${s.id}" ${m.mp>=s.cost?'':'disabled'}><span>${s.name}<em>気力${s.cost}</em></span><small>${s.note}</small></button>`).join('')}</div>`;
 if(ui.menu==='item'){const list=Object.keys(ITEMS).filter(id=>(run.items[id]??0)>0);return `${head(sub)}<div class="rg-list">${list.map(id=>`<button data-rg="cmdItemPick" data-id="${id}"><span>${ITEMS[id].name}<em>×${run.items[id]}</em></span><small>${ITEMS[id].note}</small></button>`).join('')||'<p>どうぐがない</p>'}</div>`;}
 return `${head(sub)}<p class="rg-ask">${ui.menu==='foe'?'ねらう敵をタップしよう':'だれに つかう？ 仲間をタップしよう'}</p>`;}
const firstLiving=()=>run.party.findIndex(m=>m.hp>0);
function refresh(){const c=root.querySelector('#rg-cmd'),s=root.querySelector('#rg-stat'),st=root.querySelector('#rg-stage');if(!c||!run.battle)return render();
 c.innerHTML=cmdHTML();s!.innerHTML=statHTML();st!.querySelectorAll('.rg-foes,.rg-party').forEach(e=>e.remove());st!.insertAdjacentHTML('afterbegin',stageHTML());const f=c.querySelector<HTMLElement>('[data-autofocus]');f?.focus({preventScroll:true});}
function say(text:string){ui.log.push(text);if(ui.log.length>30)ui.log.shift();ui.msgOff=false;const m=root.querySelector('#rg-msg');if(m){m.innerHTML=msgHTML();m.classList.remove('off');}clearTimeout(ui.msgT);ui.msgT=window.setTimeout(()=>{ui.msgOff=true;root.querySelector('#rg-msg')?.classList.add('off');},reduced()?1500:2400);}

function submit(cmd:Cmd){ui.cmds[ui.cur]=cmd;ui.menu='main';ui.pending=null;
 let next=ui.cur+1;while(next<run.party.length&&run.party[next].hp<=0)next++;
 if(next<run.party.length){ui.cur=next;refresh();return;}
 void execute();}
async function execute(){const b=run.battle!;ui.busy=true;ui.vis=snapshot();refresh();
 const evs=resolveRound(run,ui.cmds);ui.cmds=[];
 for(const e of evs){await play(e);}
 ui.busy=false;ui.cur=Math.max(0,firstLiving());ui.menu='main';ui.vis=snapshot();
 if(b.over){ui.vis=snapshot();hooks.sfx(b.over==='win'?'win':b.over==='lose'?'lose':'spawn');}
 save();refresh();}
const wait=(ms:number)=>sleep(reduced()?Math.min(ms,120):ui.fast?ms*.35:ms);
function elOf(r:Ref){return root.querySelector<HTMLElement>(r.side==='f'?`.rg-foe[data-uid="${r.id}"]`:`.rg-mem[data-i="${r.id}"]`);}
function float(r:Ref,text:string,cls:string){const el=elOf(r),st=root.querySelector<HTMLElement>('#rg-stage');if(!el||!st)return;const a=el.getBoundingClientRect(),s=st.getBoundingClientRect();const f=document.createElement('span');f.className='rg-float '+cls;f.textContent=text;f.style.left=(a.left-s.left+a.width/2)+'px';f.style.top=(a.top-s.top+a.height*.25)+'px';st.append(f);setTimeout(()=>f.remove(),900);}
function setBars(){const v=ui.vis!;for(const [uid,hp] of v.foeHp){const el=root.querySelector(`.rg-foe[data-uid="${uid}"]`);if(!el)continue;const f=run.battle!.foes.find(x=>x.uid===uid)!;el.querySelector('.rg-bar b')?.setAttribute('style',`width:${pct(hp,f.maxHp)}%`);el.classList.toggle('dead',hp<=0);}
 const s=root.querySelector('#rg-stat');if(s)s.innerHTML=statHTML();root.querySelectorAll<HTMLElement>('.rg-mem').forEach((el,i)=>el.classList.toggle('down',v.down.has('p'+i)));}
async function play(e:Ev){const v=ui.vis!;
 if(e.t==='msg'){say(e.text);await wait(520);return;}
 if(e.t==='charge'){elOf(e.who)?.classList.add('charging');await wait(300);return;}
 if(e.t==='hit'){const from=elOf(e.from);from?.classList.add(e.from.side==='f'?'act-f':'act-p');hooks.sfx(e.to.side==='p'?'base':'attack');await wait(160);
  if(e.to.side==='f')v.foeHp.set(e.to.id,e.hp);else v.hp[e.to.id]=e.hp;
  const t=elOf(e.to);t?.classList.add('hit');float(e.to,String(e.dmg),e.crit?'crit':e.to.side==='p'?'hurt':'dmg');setBars();await wait(380);from?.classList.remove('act-f','act-p');t?.classList.remove('hit');return;}
 if(e.t==='heal'){v.hp[e.to.id]=e.hp;float(e.to,`+${e.amount}`,'heal');hooks.sfx('spawn');setBars();await wait(420);return;}
 if(e.t==='mp'){v.mp[e.to.id]=e.mp;setBars();return;}
 if(e.t==='revive'){v.hp[e.to.id]=e.hp;v.down.delete('p'+e.to.id);float(e.to,'復活！','heal');setBars();await wait(420);return;}
 if(e.t==='ko'){if(e.who.side==='p')v.down.add('p'+e.who.id);else v.foeHp.set(e.who.id,0);setBars();await wait(260);return;}
 if(e.t==='summon'){for(const f of e.foes){v.foeShown.add(f.uid);v.foeHp.set(f.uid,f.hp);}const st=root.querySelector('#rg-stage');st?.querySelectorAll('.rg-foes,.rg-party').forEach(x=>x.remove());st?.insertAdjacentHTML('afterbegin',stageHTML());await wait(500);return;}
 if(e.t==='level'){hooks.sfx('win');await wait(200);return;}
}

// ---------- input ----------
function finishAfter(){const b=run.battle;if(b?.over){const end=run.phase==='over'||run.phase==='clear';if(end)recordResult(run,run.phase==='clear');dismissBattle(run);ui.vis=null;ui.log=[];ui.toast='';ui.evoSeen=false;save();render();}}
function onClick(ev:Event){const el=(ev.target as HTMLElement).closest<HTMLElement>('[data-rg]');if(!el||el.hasAttribute('disabled'))return;const a=el.dataset.rg!,i=Number(el.dataset.i),id=el.dataset.id??'';
 if(ui.busy&&a!=='fast')return;
 const b=run.battle;
 switch(a){
  case 'zoomIn':case 'zoomOut':case 'zoomReset':{const v=root.querySelector<HTMLElement>('#rg-mapview');if(!v)return;if(a==='zoomReset'){ui.mapV={k:1,cx:null,cy:null};return layoutMap();}const m=mapState(v);return zoomAt(m.k*(a==='zoomIn'?1.5:1/1.5),m.W/2,m.H/2);}
  case 'node':if(Date.now()<ui.noClick)return;ui.sel=ui.sel===i?-1:i;ui.toast='';return render();
  case 'go':if(ui.sel>=0&&visit(run,ui.sel)){const k=run.nodes[ui.sel].kind;ui.sel=-1;ui.toast='';ui.vis=null;ui.evoSeen=false;ui.log=[];ui.cur=0;ui.cmds=[];ui.menu='main';if(k==='rest'){rest(run);ui.toast='ゆっくり休んで、HPと気力がかいふくした。';}save();render();}return;
  case 'boss':if(Date.now()<ui.noClick)return;if(startBoss(run)){ui.vis=null;ui.log=[];ui.cur=0;ui.cmds=[];ui.menu='main';ui.sel=-1;save();render();}return;
  case 'bossHint':ui.toast=`${DAYS}日目になるとボスに挑める。それまでに仲間とどうぐを整えよう。`;return render();
  case 'items':ui.sheet='items';return render();
  case 'quit':ui.sheet='quit';return render();
  case 'sheetClose':ui.sheet='';return render();
  case 'pickItem':ui.sheetItem=id;ui.sheet='itemTarget';if(id==='feast'){if(useItem(run,id,0))ui.toast='ごちそうで みんな元気になった。';else ui.toast='いまは使う必要がない。';ui.sheet='';save();}return render();
  case 'useOn':if(useItem(run,ui.sheetItem,i))ui.toast=`${ITEMS[ui.sheetItem].name}を つかった。`;else ui.toast='いまは使えない。';ui.sheet='';save();return render();
  case 'evPick':chooseEvent(run,i);save();return render();
  case 'evDone':finishEvent(run);ui.toast='';save();return render();
  case 'buy':if(buy(run,id)){hooks.sfx('spawn');save();render();}return;
  case 'leave':leaveShop(run);save();return render();
  case 'reward':if(takeReward(run,i)){ui.toast=`第${run.chapter}週のはじまり！ 敵がより強くなる。`;save();render();}return;
  case 'again':clearRun();run=newRun();ui.sel=-1;ui.vis=null;ui.toast='新しい遠征のはじまり！';save();return render();
  case 'title':if(run.phase==='over'||run.phase==='clear')clearRun();else save();closeRogue();hooks.exit();return;
  case 'fast':ui.fast=!ui.fast;return refresh();
  case 'after':{if(b?.over==='win'&&b.rewards?.evos?.length&&!ui.evoSeen){ui.evoSeen=true;ui.evo={list:b.rewards.evos,idx:0};hooks.sfx('win');setTimeout(()=>hooks.sfx('spawn'),1500);return render();}return finishAfter();}
  case 'evoNext':{if(!ui.evo)return;ui.evo.idx++;if(ui.evo.idx>=ui.evo.list.length){ui.evo=null;return finishAfter();}hooks.sfx('win');setTimeout(()=>hooks.sfx('spawn'),1500);return render();}
  case 'member':ui.sheetI=i;ui.sheet='member';return render();
  // battle commands
  case 'cmdAttack':{const foes=b!.foes.filter(f=>f.hp>0);if(foes.length===1)submit({t:'attack',target:foes[0].uid});else{ui.pending={t:'attack'};ui.menu='foe';refresh();}return;}
  case 'cmdSkill':ui.menu='skill';return refresh();
  case 'cmdItem':ui.menu='item';return refresh();
  case 'cmdGuard':return submit({t:'guard'});
  case 'cmdFlee':return submit({t:'flee'});
  case 'cmdBack':{let p=ui.cur-1;while(p>0&&run.party[p].hp<=0)p--;ui.cur=Math.max(p,firstLiving());ui.menu='main';refresh();return;}
  case 'menuMain':ui.menu='main';ui.pending=null;return refresh();
  case 'cmdPick':{const s=SKILLS[id],m=run.party[ui.cur];if(!s||m.mp<s.cost)return;
   if(s.target==='foes'||s.target==='allies')return submit({t:'skill',skill:id,target:0});
   if(s.target==='foe'){const foes=b!.foes.filter(f=>f.hp>0);if(foes.length===1)return submit({t:'skill',skill:id,target:foes[0].uid});ui.pending={t:'skill',skill:id};ui.menu='foe';return refresh();}
   ui.pending={t:'skill',skill:id};ui.menu='ally';return refresh();}
  case 'cmdItemPick':if(id==='feast')return submit({t:'item',item:id,target:0});ui.pending={t:'item',item:id};ui.menu='ally';return refresh();
  case 'foe':{if(ui.menu!=='foe'||!ui.pending)return;const uid=Number(el.dataset.uid);const p=ui.pending;return submit(p.t==='skill'?{t:'skill',skill:p.skill,target:uid}:{t:'attack',target:uid});}
  case 'ally':{if(ui.menu!=='ally'||!ui.pending)return;const p=ui.pending;if(p.t==='item')return submit({t:'item',item:p.item,target:i});if(p.t==='skill')return submit({t:'skill',skill:p.skill,target:i});return;}
 }}
