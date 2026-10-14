/** DOM screens for the turn-based roguelike run: map, battle (FF-style command windows), events, shop, rewards. */
import {newRun,visit,startBoss,chooseEvent,finishEvent,rest,buy,leaveShop,useItem,takeReward,resolveRound,dismissBattle,living,DAYS,CHAPTERS,xpNeed,type RunState,type Cmd,type Ev,type Foe,type Ref} from './engine.ts';
import {SKILLS,ITEMS,PERKS,EVENTS,MEMBERS,BOSSES,BOSS_BG,BOSS_PLACE,PLACE_BG} from './data.ts';
import {saveRun,clearRun,loadRun,recordResult,loadBest} from './save.ts';
import {LANDMARKS} from '../local-walk.ts';
import {PLACE_LOCATIONS,MISSION_LOCATIONS} from '../mission-locations.ts';
import {APPROVED_ART,artURL} from '../defense-assets.ts';
import {faceHTML} from '../dialogue.ts';

export type RogueHooks={sfx:(k:'attack'|'win'|'lose'|'spawn'|'base')=>void;exit:()=>void};
type Menu='main'|'skill'|'item'|'foe'|'ally';
type Vis={foeHp:Map<number,number>;foeShown:Set<number>;hp:number[];mp:number[];down:Set<string>};
const KIND={battle:{l:'戦',n:'戦闘',d:'敵と戦う'},elite:{l:'強',n:'強敵',d:'強い敵。勝つと良いアイテムが手に入る'},event:{l:'？',n:'イベント',d:'何かが起きる'},rest:{l:'休',n:'休息',d:'全員のHPをかいふく'},shop:{l:'店',n:'おみせ',d:'かつおぶしで買い物'}} as const;
const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct=(a:number,b:number)=>Math.max(0,Math.min(100,Math.round(100*a/Math.max(1,b))));
const img=(key:string,cls='')=>`<img class="${cls}" alt="" decoding="async" src="${artURL(key)}">`;

let root:HTMLElement,run:RunState,hooks:RogueHooks;
const ui={sel:-1,sheet:'' as ''|'items'|'quit'|'itemTarget',sheetItem:'',menu:'main' as Menu,cur:0,cmds:[] as (Cmd|undefined)[],pending:null as null|{t:'attack'}|{t:'skill';skill:string}|{t:'item';item:string},busy:false,fast:false,log:[] as string[],toast:'',vis:null as Vis|null,result:false};
const save=()=>{if(run.phase==='over'||run.phase==='clear')clearRun();else saveRun(run);};

export function openRogue(h:RogueHooks,resume:boolean){hooks=h;
 let el=document.getElementById('rogue');if(!el){el=document.createElement('div');el.id='rogue';el.className='rg';document.body.append(el);el.addEventListener('click',onClick);}
 root=el;root.hidden=false;document.documentElement.classList.add('rogue-open');
 const saved=resume?loadRun():null;run=saved??newRun();Object.assign(ui,{sel:-1,sheet:'',menu:'main',cur:0,cmds:[],pending:null,busy:false,log:[],toast:'',vis:null,result:false});
 if(!saved){clearRun();ui.toast='遠征のはじまり！ 7日ごとにボスが待っている。';}
 save();render();}
export function closeRogue(){if(root)root.hidden=true;document.documentElement.classList.remove('rogue-open');}

// ---------- shared pieces ----------
const bar=(a:number,b:number,cls='')=>`<i class="rg-bar ${cls}"><b style="width:${pct(a,b)}%"></b></i>`;
function partyCards(compact=false){return `<div class="rg-cards ${compact?'compact':''}">${run.party.map((m,i)=>`<button class="rg-card ${m.hp<=0?'ko':''}" data-rg="member" data-i="${i}" aria-label="${m.name} レベル${m.level} HP${m.hp}/${m.maxHp}">${img(m.art,'rg-face')}<span class="rg-nm">${m.name}<small>Lv${m.level}</small></span>${bar(m.hp,m.maxHp)}<span class="rg-num">HP ${m.hp}/${m.maxHp}</span><span class="rg-num mp">気力 ${m.mp}/${m.maxMp}</span></button>`).join('')}</div>`;}
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
 root.innerHTML=html+sheetHTML();
 const f=root.querySelector<HTMLElement>('[data-autofocus]');if(f&&!ui.busy)f.focus({preventScroll:true});}

function mapHTML(){const bossDay=run.day>=DAYS,b=BOSSES[run.chapter-1],sel=run.nodes[ui.sel];
 const nodes=run.nodes.map((n,i)=>{const p=PLACE_LOCATIONS[i],k=KIND[n.kind];return `<button class="rg-node k-${n.kind} ${n.visited?'done':''} ${ui.sel===i?'sel':''}" style="left:${p.x}%;top:${p.y}%" data-rg="node" data-i="${i}" ${n.visited||bossDay?'disabled':''} aria-label="${LANDMARKS[i].name} ${k.n}${n.visited?' 訪問済み':''}" aria-pressed="${ui.sel===i}"><b>${n.visited?'✓':k.l}</b><span>${LANDMARKS[i].name}</span></button>`;}).join('');
 const bp=MISSION_LOCATIONS[run.chapter-1];
 const boss=`<button class="rg-node k-boss ${bossDay?'ready':''}" style="left:${bp.x}%;top:${bp.y}%" data-rg="${bossDay?'boss':'bossHint'}" aria-label="${BOSS_PLACE[run.chapter-1]} ボス ${b.name}"><b>${b.title==='ラスボス'?'王':'ボス'}</b><span>${BOSS_PLACE[run.chapter-1]}</span></button>`;
 let info:string;
 if(bossDay)info=`<div class="rg-info">${toastEl()}<strong>${DAYS}日目 — ${b.title}「${b.name}」が待っている！</strong><span>準備ができたら向かおう。どうぐはここで使える。</span></div><button class="rg-go" data-rg="boss" data-autofocus>ボスにいどむ</button>`;
 else if(sel){const k=KIND[sel.kind],foes=sel.foes.length?`<span>敵：${sel.foes.map(id=>nameOf(id)).join('・')}</span>`:`<span>${k.d}</span>`;info=`<div class="rg-info">${toastEl()}<strong>${LANDMARKS[ui.sel].name}：${k.n}</strong>${foes}</div><button class="rg-go" data-rg="go" data-autofocus>ここへ行く <small>(1日すすむ)</small></button>`;}
 else info=`<div class="rg-info">${toastEl()}<strong>行き先を選ぼう</strong><span>行動すると1日すすむ。${DAYS}日目にボスと戦う。丸の印で中身が分かる。</span></div>`;
 return `<div class="rg rg-mapscreen">${topbar(`<button class="rg-small" data-rg="items">どうぐ</button><button class="rg-small" data-rg="quit">やめる</button>`)}<div class="rg-body"><div class="rg-mapwrap"><div class="rg-mapart"><img src="${APPROVED_ART.map}" alt="神栖の地図">${nodes}${boss}</div></div><aside class="rg-side">${partyCards(true)}</aside></div><footer class="rg-foot">${info}</footer></div>`;}
const toastEl=()=>ui.toast?`<em class="rg-toast" role="status">${ui.toast}</em>`:'';
const nameOf=(id:string)=>FOE_NAMES[id]??id;
import {FOES} from './data.ts';
const FOE_NAMES:Record<string,string>=Object.fromEntries(Object.entries(FOES).map(([k,v])=>[k,v.name]));

function eventHTML(){const ev=run.event!,def=EVENTS.find(e=>e.id===ev.id)!,place=LANDMARKS[run.lastPlace]?.name??'';
 const body=ev.done?`<p class="rg-line" role="status">${ev.text}</p><button class="rg-go" data-rg="evDone" data-autofocus>つづける</button>`:`<p class="rg-line">${def.text}</p><div class="rg-choices">${def.choices.map((c,i)=>`<button data-rg="evPick" data-i="${i}" ${i===0?'data-autofocus':''}>${c.label}</button>`).join('')}</div>`;
 return `<div class="rg">${topbar()}${scene(PLACE_BG[run.lastPlace]??'town',`<section class="rg-panel"><small>${place}</small><h2>${def.title}</h2><div class="rg-talk">${faceHTML({speaker:'kiki',emotion:ev.done?'smile':'surprised'},import.meta.env.BASE_URL)}${faceHTML({speaker:'nene',emotion:ev.done?'smile':'normal'},import.meta.env.BASE_URL)}</div>${body}<small class="rg-note">創作のお話です。実在の出来事ではありません。</small></section>`)}<footer class="rg-foot">${partyCards(true)}</footer></div>`;}

function shopHTML(){const place=LANDMARKS[run.lastPlace]?.name??'';
 return `<div class="rg">${topbar()}${scene(PLACE_BG[run.lastPlace]??'town',`<section class="rg-panel"><small>${place}</small><h2>ねこの よろず屋</h2><ul class="rg-shop">${run.shop!.offers.map(id=>{const it=ITEMS[id],have=run.items[id]??0,can=run.gold>=it.price&&have<9;return `<li><span><b>${it.name}</b><small>${it.note}　持っている：${have}</small></span><button data-rg="buy" data-id="${id}" ${can?'':'disabled'}>${it.price}</button></li>`;}).join('')}</ul><button class="rg-go" data-rg="leave" data-autofocus>でていく</button></section>`)}<footer class="rg-foot">${partyCards(true)}</footer></div>`;}

function rewardHTML(){const opts=run.reward!;
 return `<div class="rg">${topbar()}${scene(BOSS_BG[run.chapter-1],`<section class="rg-panel wide"><small>${BOSSES[run.chapter-1].title}をたおした！</small><h2>ごほうびを1つ えらぼう</h2><div class="rg-rewards">${opts.map((o,i)=>o.kind==='perk'?(()=>{const p=PERKS.find(x=>x.id===o.id)!;return `<button data-rg="reward" data-i="${i}" ${i===0?'data-autofocus':''}><b>${p.name}</b><span>${p.note}</span></button>`;})():(()=>{const m=MEMBERS[o.id];return `<button data-rg="reward" data-i="${i}">${img(m.art,'rg-face')}<b>${m.name}が仲間になる</b><span>${m.blurb}</span></button>`;})()).join('')}</div><small class="rg-note">選ぶと全員のHPが少し回復して、次の週がはじまる。</small></section>`)}<footer class="rg-foot">${partyCards(true)}</footer></div>`;}

function endHTML(){const win=run.phase==='clear',best=loadBest();
 return `<div class="rg">${scene(win?'town':'port',`<section class="rg-panel wide end ${win?'win':'lose'}"><h2>${win?'神栖は守られた！':'遠征は ここまで…'}</h2><p class="rg-line">${win?'ラスボスをたおして、3週間の遠征をやりとげた。':`第${run.chapter}週 ${Math.min(run.day,DAYS)}日目で、みんなたおれてしまった。`}</p><ul class="rg-stats"><li>すすんだ日数 <b>${run.stats.days}</b></li><li>戦闘 <b>${run.stats.battles}</b>回</li><li>ターン <b>${run.stats.turns}</b></li><li>クリア <b>${best.clears}</b>回 / 挑戦 <b>${best.runs}</b>回</li></ul><div class="rg-choices"><button data-rg="again" data-autofocus>もういちど遠征へ</button><button data-rg="title">タイトルへ</button></div></section>`)}</div>`;}

function sheetHTML(){if(ui.sheet==='quit')return `<div class="rg-sheet" role="dialog" aria-label="確認"><div><h3>遠征をやめる？</h3><p>ここまでの進行は保存されます。タイトルの「つづきから」で再開できます。</p><div class="rg-choices"><button data-rg="sheetClose">続ける</button><button data-rg="title" data-autofocus>タイトルへ</button></div></div></div>`;
 if(ui.sheet==='items'){const list=Object.keys(ITEMS).filter(id=>(run.items[id]??0)>0);return `<div class="rg-sheet" role="dialog" aria-label="どうぐ"><div><h3>どうぐ</h3>${list.length?`<ul class="rg-shop">${list.map(id=>`<li><span><b>${ITEMS[id].name} ×${run.items[id]}</b><small>${ITEMS[id].note}</small></span><button data-rg="pickItem" data-id="${id}">つかう</button></li>`).join('')}</ul>`:'<p>もっているどうぐはない。</p>'}<button data-rg="sheetClose" data-autofocus>とじる</button></div></div>`;}
 if(ui.sheet==='itemTarget')return `<div class="rg-sheet" role="dialog" aria-label="だれに使う？"><div><h3>${ITEMS[ui.sheetItem].name}をだれに？</h3><div class="rg-choices">${run.party.map((m,i)=>`<button data-rg="useOn" data-i="${i}">${m.name} <small>HP ${m.hp}/${m.maxHp}</small></button>`).join('')}</div><button data-rg="sheetClose" data-autofocus>もどる</button></div></div>`;
 return '';}

// ---------- battle ----------
function snapshot():Vis{const b=run.battle!;return {foeHp:new Map(b.foes.map(f=>[f.uid,f.hp])),foeShown:new Set(b.foes.filter(f=>f.hp>0).map(f=>f.uid)),hp:run.party.map(m=>m.hp),mp:run.party.map(m=>m.mp),down:new Set(run.party.flatMap((m,i)=>m.hp<=0?['p'+i]:[]))};}
function foeHTML(f:Foe){const v=ui.vis!,hp=v.foeHp.get(f.uid)??f.hp,dead=hp<=0;return `<button class="rg-foe ${dead?'dead':''} ${f.charging?'charging':''} ${ui.menu==='foe'&&!dead?'targetable':''}" data-rg="foe" data-uid="${f.uid}" style="--k:${(f.h/110).toFixed(2)}" aria-label="${f.name} HP${hp}/${f.maxHp}" ${dead?'tabindex="-1"':''}>${img(f.art,'rg-sprite')}<span class="rg-fname">${f.name}</span>${bar(hp,f.maxHp,'foe')}</button>`;}
function stageHTML(){const b=run.battle!,v=ui.vis!;
 return `<div class="rg-foes">${b.foes.filter(f=>v.foeShown.has(f.uid)).map(foeHTML).join('')}</div><div class="rg-party">${run.party.map((m,i)=>`<button class="rg-mem ${v.down.has('p'+i)?'down':''} ${ui.menu==='ally'&&!v.down.has('p'+i)?'targetable':''}" data-rg="ally" data-i="${i}" aria-label="${m.name}">${img(m.art,'rg-sprite')}</button>`).join('')}</div>`;}
function battleHTML(){const b=run.battle!;if(!ui.vis)ui.vis=snapshot();
 const bg=b.boss?BOSS_BG[run.chapter-1]:PLACE_BG[run.lastPlace]??'town';
 return `<div class="rg rg-battle" style="--bg:url('${artURL(bg)}')"><div class="rg-stage" id="rg-stage">${stageHTML()}<div class="rg-banner">${b.boss?`ボス戦 — ${b.foes.find(f=>f.boss)?.name??''}`:`第${run.chapter}週 ${Math.min(run.day,DAYS+0)-1}日目`}<small>ターン ${b.round}</small></div></div><div class="rg-ui"><div class="rg-win rg-cmd" id="rg-cmd">${cmdHTML()}</div><div class="rg-win rg-msg" id="rg-msg" aria-live="polite">${ui.log.slice(-3).map(l=>`<p>${l}</p>`).join('')}</div><div class="rg-win rg-stat" id="rg-stat">${statHTML()}</div></div></div>`;}
function statHTML(){const v=ui.vis!;return run.party.map((m,i)=>{const hp=v.hp[i]??m.hp,mp=v.mp[i]??m.mp,cur=!ui.busy&&!run.battle?.over&&ui.cur===i;return `<button class="rg-row ${cur?'cur':''} ${hp<=0?'ko':''}" data-rg="ally" data-i="${i}"><span>${m.name}<small>Lv${m.level}</small></span><span class="n">${hp}<small>/${m.maxHp}</small></span>${bar(hp,m.maxHp)}<span class="n mp">${mp}<small>気力</small></span></button>`;}).join('');}
function cmdHTML():string{const b=run.battle!;
 if(b.over){const r=b.rewards;return b.over==='win'&&r?`<h3>勝利！</h3><p>かつおぶし +${r.gold}　経験値 +${r.xp}${r.items.length?`　${r.items.map(i=>ITEMS[i].name).join('・')}を手に入れた`:''}</p>${r.levelUps.length?`<p class="lv">${r.levelUps.join('　')} にレベルアップ！</p>`:''}<button class="rg-go" data-rg="after" data-autofocus>つづける</button>`:b.over==='fled'?`<h3>にげのびた</h3><button class="rg-go" data-rg="after" data-autofocus>つづける</button>`:`<h3>ぜんめつ…</h3><button class="rg-go" data-rg="after" data-autofocus>つづける</button>`;}
 if(ui.busy)return `<h3>…</h3><button data-rg="fast">${ui.fast?'ふつうの速さ':'はやおくり'}</button>`;
 const m=run.party[ui.cur];if(!m)return '';
 const head=`<h3>${m.name}<small>のターン</small></h3>`;
 if(ui.menu==='main')return `${head}<div class="rg-list"><button data-rg="cmdAttack" data-autofocus>たたかう</button><button data-rg="cmdSkill" ${m.skills.length?'':'disabled'}>わざ</button><button data-rg="cmdItem">どうぐ</button><button data-rg="cmdGuard">ぼうぎょ</button><button data-rg="cmdFlee" ${b.boss?'disabled':''}>にげる</button>${ui.cur>firstLiving()?'<button class="back" data-rg="cmdBack">もどる</button>':''}</div>`;
 if(ui.menu==='skill')return `${head}<div class="rg-list">${m.skills.map(id=>SKILLS[id]).map(s=>`<button data-rg="cmdPick" data-id="${s.id}" ${m.mp>=s.cost?'':'disabled'}>${s.name}<small>気力${s.cost}　${s.note}</small></button>`).join('')}<button class="back" data-rg="menuMain">もどる</button></div>`;
 if(ui.menu==='item'){const list=Object.keys(ITEMS).filter(id=>(run.items[id]??0)>0);return `${head}<div class="rg-list">${list.map(id=>`<button data-rg="cmdItemPick" data-id="${id}">${ITEMS[id].name} ×${run.items[id]}<small>${ITEMS[id].note}</small></button>`).join('')||'<p>どうぐがない</p>'}<button class="back" data-rg="menuMain">もどる</button></div>`;}
 return `${head}<p>${ui.menu==='foe'?'ねらう敵をえらぼう':'だれに つかう？ 仲間をえらぼう'}</p><button class="back" data-rg="menuMain">もどる</button>`;}
const firstLiving=()=>run.party.findIndex(m=>m.hp>0);
function refresh(){const c=root.querySelector('#rg-cmd'),s=root.querySelector('#rg-stat'),st=root.querySelector('#rg-stage');if(!c||!run.battle)return render();
 c.innerHTML=cmdHTML();s!.innerHTML=statHTML();st!.querySelectorAll('.rg-foes,.rg-party').forEach(e=>e.remove());st!.insertAdjacentHTML('afterbegin',stageHTML());const f=c.querySelector<HTMLElement>('[data-autofocus]');f?.focus({preventScroll:true});}
function say(text:string){ui.log.push(text);if(ui.log.length>30)ui.log.shift();const m=root.querySelector('#rg-msg');if(m)m.innerHTML=ui.log.slice(-3).map(l=>`<p>${l}</p>`).join('');}

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
function onClick(ev:Event){const el=(ev.target as HTMLElement).closest<HTMLElement>('[data-rg]');if(!el||el.hasAttribute('disabled'))return;const a=el.dataset.rg!,i=Number(el.dataset.i),id=el.dataset.id??'';
 if(ui.busy&&a!=='fast')return;
 const b=run.battle;
 switch(a){
  case 'node':ui.sel=ui.sel===i?-1:i;ui.toast='';return render();
  case 'go':if(ui.sel>=0&&visit(run,ui.sel)){const k=run.nodes[ui.sel].kind;ui.sel=-1;ui.toast='';ui.vis=null;ui.log=[];ui.cur=0;ui.cmds=[];ui.menu='main';if(k==='rest'){rest(run);ui.toast='ゆっくり休んで、HPと気力がかいふくした。';}save();render();}return;
  case 'boss':if(startBoss(run)){ui.vis=null;ui.log=[];ui.cur=0;ui.cmds=[];ui.menu='main';ui.sel=-1;save();render();}return;
  case 'bossHint':ui.toast=`${DAYS}日目になるとボスに挑める。それまでに仲間とどうぐを整えよう。`;return render();
  case 'items':ui.sheet='items';return render();
  case 'quit':ui.sheet='quit';return render();
  case 'sheetClose':ui.sheet='';return render();
  case 'pickItem':ui.sheetItem=id;ui.sheet='itemTarget';if(id==='feast'){if(useItem(run,id,0))ui.toast='ごちそうで みんな元気になった。';else ui.toast='いまは使う必要がない。';ui.sheet='';save();}return render();
  case 'useOn':if(useItem(run,ui.sheetItem,i))ui.toast=`${ITEMS[ui.sheetItem].name}を つかった。`;else ui.toast='いまは使えない。';ui.sheet='';save();return render();
  case 'member':return;
  case 'evPick':chooseEvent(run,i);save();return render();
  case 'evDone':finishEvent(run);ui.toast='';save();return render();
  case 'buy':if(buy(run,id)){hooks.sfx('spawn');save();render();}return;
  case 'leave':leaveShop(run);save();return render();
  case 'reward':if(takeReward(run,i)){ui.toast=`第${run.chapter}週のはじまり！ 敵がより強くなる。`;save();render();}return;
  case 'again':clearRun();run=newRun();ui.sel=-1;ui.vis=null;ui.toast='新しい遠征のはじまり！';save();return render();
  case 'title':if(run.phase==='over'||run.phase==='clear')clearRun();else save();closeRogue();hooks.exit();return;
  case 'fast':ui.fast=!ui.fast;return refresh();
  case 'after':{if(b?.over){const end=run.phase==='over'||run.phase==='clear';if(end)recordResult(run,run.phase==='clear');dismissBattle(run);ui.vis=null;ui.log=[];ui.toast='';save();render();}return;}
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
