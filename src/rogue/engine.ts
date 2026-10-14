/** Turn-based roguelike run engine. Deterministic for a given seed; mutates the RunState it is given. */
import {MEMBERS,SKILLS,FOES,BOSSES,PLACE_POOLS,CHAPTER,ITEMS,PERKS,EVENTS,RECRUITS,type FoeT,type Outcome} from './data.ts';

/** Global foe damage tuning. */
export const ATK_SCALE=.7;
export const DAYS=7,CHAPTERS=3,PARTY_MAX=4,ITEM_MAX=9;
export type Phase='map'|'battle'|'event'|'shop'|'rest'|'reward'|'over'|'clear';
export type Kind='battle'|'elite'|'event'|'rest'|'shop';
export type Member={id:string;name:string;art:string;level:number;xp:number;hp:number;maxHp:number;mp:number;maxMp:number;atk:number;def:number;spd:number;skills:string[];guard:boolean;shield:{mul:number;turns:number}|null;flat:number};
export type Foe={uid:number;id:string;name:string;art:string;h:number;hp:number;maxHp:number;atk:number;def:number;spd:number;moves:FoeT['moves'];boss:boolean;pattern?:string;turn:number;atkUp:number;guard:number;phase2:boolean;charging:boolean};
export type Node={kind:Kind;visited:boolean;foes:string[];eventId?:string;offers?:string[]};
export type Battle={foes:Foe[];round:number;boss:boolean;elite:boolean;over:''|'win'|'lose'|'fled';rewards:{gold:number;xp:number;items:string[];levelUps:string[]}|null};
export type RewardOpt={kind:'perk'|'recruit';id:string};
export type RunState={v:1;seed:number;rng:number;chapter:number;day:number;gold:number;party:Member[];items:Record<string,number>;perks:string[];nodes:Node[];phase:Phase;battle:Battle|null;event:{id:string;done:boolean;text:string}|null;shop:{offers:string[]}|null;reward:RewardOpt[]|null;nextUid:number;lastPlace:number;stats:{battles:number;days:number;turns:number}};
export type Cmd={t:'attack';target:number}|{t:'skill';skill:string;target:number}|{t:'item';item:string;target:number}|{t:'guard'}|{t:'flee'};
export type Ref={side:'p'|'f';id:number};
export type Ev=
 |{t:'msg';text:string}
 |{t:'hit';from:Ref;to:Ref;dmg:number;hp:number;crit:boolean;name:string}
 |{t:'heal';to:Ref;amount:number;hp:number;name:string}
 |{t:'mp';to:Ref;mp:number}
 |{t:'ko';who:Ref}
 |{t:'charge';who:Ref}
 |{t:'summon';foes:Foe[]}
 |{t:'revive';to:Ref;hp:number}
 |{t:'level';who:number}
 |{t:'end';result:'win'|'lose'|'fled'};

export function rand(run:RunState){run.rng=(run.rng+0x6D2B79F5)>>>0;let t=run.rng;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}
export const randInt=(run:RunState,n:number)=>Math.min(n-1,Math.floor(rand(run)*n));
const pickOne=<T>(run:RunState,list:readonly T[])=>list[randInt(run,list.length)];
function shuffle<T>(run:RunState,list:T[]){const a=[...list];for(let i=a.length-1;i>0;i--){const j=randInt(run,i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}

const has=(run:RunState,perk:string)=>run.perks.includes(perk);
export function recalc(run:RunState,m:Member){const t=MEMBERS[m.id],lv=1+.1*(m.level-1),oldHp=m.maxHp,oldMp=m.maxMp;
 m.maxHp=Math.round(t.hp*lv*(has(run,'hp')?1.15:1))+m.flat;m.maxMp=Math.round(t.mp+(m.level-1)*1.2)+(has(run,'mp')?6:0);
 m.atk=Math.round(t.atk*lv*(has(run,'atk')?1.12:1));m.def=Math.round(t.def*lv*(has(run,'def')?1.15:1));m.spd=t.spd;
 if(m.hp>0){m.hp+=Math.max(0,m.maxHp-oldHp);}m.hp=Math.min(m.hp,m.maxHp);m.mp=Math.min(m.maxMp,m.mp+Math.max(0,m.maxMp-oldMp));}
export function makeMember(run:RunState,id:string,level=1):Member{const t=MEMBERS[id];const m:Member={id,name:t.name,art:t.art,level,xp:0,hp:1,maxHp:1,mp:0,maxMp:0,atk:0,def:0,spd:0,skills:[...t.skills],guard:false,shield:null,flat:0};recalc(run,m);m.hp=m.maxHp;m.mp=m.maxMp;return m;}
export const xpNeed=(level:number)=>20+level*8;
export const LEVEL_MAX=12;

export function newRun(seed=(Date.now()%2147483647)||1):RunState{
 const run:RunState={v:1,seed,rng:seed>>>0,chapter:1,day:1,gold:20,party:[],items:{onigiri:2,kankan:1},perks:[],nodes:[],phase:'map',battle:null,event:null,shop:null,reward:null,nextUid:1,lastPlace:-1,stats:{battles:0,days:0,turns:0}};
 run.party=[makeMember(run,'kiki'),makeMember(run,'nene')];startChapter(run);return run;}

function makeFoe(run:RunState,t:FoeT,ch:number,elite=false,boss=false,pattern?:string):Foe{const c=CHAPTER[ch-1],e=elite?{hp:1.35,atk:1.15}:{hp:1,atk:1};
 const hp=Math.round(t.hp*(boss?1:c.hp)*e.hp);return {uid:run.nextUid++,id:t.id,name:(elite?'強い ':'')+t.name,art:t.art,h:t.h,hp,maxHp:hp,atk:Math.round(t.atk*ATK_SCALE*(boss?1:c.atk)*e.atk),def:Math.round(t.def*(boss?1:c.def)),spd:t.spd,moves:t.moves,boss,pattern,turn:0,atkUp:0,guard:0,phase2:false,charging:false};}

export function startChapter(run:RunState){
 const kinds:Kind[]=shuffle(run,['battle','battle','elite','event','rest','shop',randInt(run,2)?'battle':'event'] as Kind[]);
 run.nodes=kinds.map((kind,place)=>{const n:Node={kind,visited:false,foes:[]};const pool=PLACE_POOLS[place];
  if(kind==='battle'||kind==='elite'){const count=kind==='elite'?3:2+(rand(run)<(run.chapter===1?.35:.7)?1:0);for(let i=0;i<count;i++)n.foes.push(pickOne(run,pool));}
  if(kind==='event')n.eventId=pickOne(run,EVENTS).id;
  if(kind==='shop')n.offers=shuffle(run,Object.keys(ITEMS)).slice(0,3);
  return n;});
 run.day=1;run.phase='map';run.battle=null;run.event=null;run.shop=null;run.reward=null;}

export function visit(run:RunState,place:number){
 const n=run.nodes[place];if(run.phase!=='map'||run.day>DAYS-1||!n||n.visited)return false;
 n.visited=true;run.day++;run.stats.days++;run.lastPlace=place;
 if(n.kind==='battle'||n.kind==='elite')beginBattle(run,n.foes.map(id=>makeFoe(run,FOES[id],run.chapter,n.kind==='elite')),false,n.kind==='elite');
 else if(n.kind==='event'){run.event={id:n.eventId!,done:false,text:''};run.phase='event';}
 else if(n.kind==='shop'){run.shop={offers:[...(n.offers??[])]};run.phase='shop';}
 else run.phase='rest';
 return true;}
export function startBoss(run:RunState){if(run.phase!=='map'||run.day<DAYS)return false;const b=BOSSES[run.chapter-1];
 const foes=[makeFoe(run,b,run.chapter,false,true,b.pattern)];beginBattle(run,foes,true,false);return true;}
function beginBattle(run:RunState,foes:Foe[],boss:boolean,elite:boolean){run.battle={foes,round:1,boss,elite,over:'',rewards:null};run.phase='battle';run.stats.battles++;
 for(const m of run.party){m.guard=has(run,'first');m.shield=null;}}

// ---- events / rest / shop / items ----
export function chooseEvent(run:RunState,choice:number){const ev=run.event;if(run.phase!=='event'||!ev||ev.done)return false;const def=EVENTS.find(e=>e.id===ev.id)!,c=def.choices[choice];if(!c)return false;
 const total=c.outs.reduce((a,o)=>a+o.w,0);let r=rand(run)*total,out=c.outs[0];for(const o of c.outs){if(r<o.w){out=o;break;}r-=o.w;}
 ev.text=applyOutcome(run,out);ev.done=true;return true;}
function applyOutcome(run:RunState,o:Outcome){let text=o.text;
 if(o.gold)run.gold+=o.gold;
 if(o.heal)for(const m of run.party)if(m.hp>0)m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*o.heal));
 if(o.hurt)for(const m of run.party)if(m.hp>0)m.hp=Math.max(1,m.hp-Math.round(m.maxHp*o.hurt));
 if(o.mp)for(const m of run.party)if(m.hp>0)m.mp=Math.min(m.maxMp,m.mp+o.mp);
 if(o.item)run.items[o.item]=Math.min(ITEM_MAX,(run.items[o.item]??0)+1);
 if(o.xp)gainXp(run,o.xp);
 if(o.maxHp)for(const m of run.party){m.flat+=o.maxHp;recalc(run,m);}
 if(o.recruit){const id=recruitable(run);if(id&&run.party.length<PARTY_MAX){run.party.push(makeMember(run,id,Math.max(1,Math.round(avgLevel(run)))));text=`${MEMBERS[id].name}が仲間になった！`;}else{run.gold+=20;text='仲間は満員だった。かわりにかつおぶし20をもらった。';}}
 return text;}
const avgLevel=(run:RunState)=>run.party.reduce((a,m)=>a+m.level,0)/run.party.length;
const recruitable=(run:RunState)=>{const left=RECRUITS.filter(id=>!run.party.some(m=>m.id===id));return left.length?left[randInt(run,left.length)]:undefined;};
export function finishEvent(run:RunState){if(run.phase==='event'&&run.event?.done){run.event=null;run.phase='map';return true;}return false;}
export function rest(run:RunState){if(run.phase!=='rest')return false;for(const m of run.party){if(m.hp<=0)m.hp=Math.max(1,Math.round(m.maxHp*.2));else m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*.4));m.mp=Math.min(m.maxMp,m.mp+6);}run.phase='map';return true;}
export function buy(run:RunState,item:string){const it=ITEMS[item];if(run.phase!=='shop'||!it||!run.shop?.offers.includes(item)||run.gold<it.price||(run.items[item]??0)>=ITEM_MAX)return false;run.gold-=it.price;run.items[item]=(run.items[item]??0)+1;return true;}
export function leaveShop(run:RunState){if(run.phase==='shop'){run.shop=null;run.phase='map';return true;}return false;}
export function useItem(run:RunState,item:string,idx:number,evs?:Ev[]){const m=run.party[idx];if(!m||(run.items[item]??0)<1)return false;
 const heal=(t:Member,pct:number)=>{const a=Math.min(t.maxHp-t.hp,Math.round(t.maxHp*pct));t.hp+=a;return a;};
 if(item==='onigiri'){if(m.hp<=0||m.hp>=m.maxHp)return false;const a=heal(m,.45);evs?.push({t:'heal',to:{side:'p',id:idx},amount:a,hp:m.hp,name:'おにぎり'});}
 else if(item==='kankan'){if(m.hp<=0||m.mp>=m.maxMp)return false;m.mp=Math.min(m.maxMp,m.mp+8);evs?.push({t:'mp',to:{side:'p',id:idx},mp:m.mp});}
 else if(item==='matatabi'){if(m.hp>0)return false;m.hp=Math.max(1,Math.round(m.maxHp*.35));evs?.push({t:'revive',to:{side:'p',id:idx},hp:m.hp});}
 else if(item==='feast'){if(!run.party.some(p=>p.hp>0&&p.hp<p.maxHp))return false;run.party.forEach((p,i)=>{if(p.hp>0){const a=heal(p,.4);evs?.push({t:'heal',to:{side:'p',id:i},amount:a,hp:p.hp,name:'ごちそう'});}});}
 else return false;
 run.items[item]--;return true;}

// ---- experience / rewards ----
function gainXp(run:RunState,xp:number,evs?:Ev[]){const lv:string[]=[];run.party.forEach((m,i)=>{m.xp+=m.hp>0?xp:Math.floor(xp/2);while(m.level<LEVEL_MAX&&m.xp>=xpNeed(m.level)){m.xp-=xpNeed(m.level);m.level++;recalc(run,m);lv.push(`${m.name} Lv${m.level}`);evs?.push({t:'level',who:i});}});return lv;}
export function rewardOptions(run:RunState):RewardOpt[]{const owned=run.perks,left=shuffle(run,PERKS.filter(p=>!owned.includes(p.id)));const opts:RewardOpt[]=left.slice(0,2).map(p=>({kind:'perk' as const,id:p.id}));
 const rec=run.party.length<PARTY_MAX?recruitable(run):undefined;if(rec)opts.push({kind:'recruit',id:rec});else if(left[2])opts.push({kind:'perk',id:left[2].id});return opts;}
export function takeReward(run:RunState,i:number){const o=run.reward?.[i];if(run.phase!=='reward'||!o)return false;
 if(o.kind==='perk'){run.perks.push(o.id);for(const m of run.party)recalc(run,m);}else run.party.push(makeMember(run,o.id,Math.max(1,Math.round(avgLevel(run)))));
 for(const m of run.party){if(m.hp<=0)m.hp=Math.round(m.maxHp*.25);else m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*.4));m.mp=Math.min(m.maxMp,m.mp+8);}
 run.reward=null;run.chapter++;startChapter(run);return true;}

// ---- battle ----
export const living=(run:RunState)=>run.party.map((m,i)=>({m,i})).filter(x=>x.m.hp>0);
const livingFoes=(b:Battle)=>b.foes.filter(f=>f.hp>0);
const refP=(i:number):Ref=>({side:'p',id:i}),refF=(f:Foe):Ref=>({side:'f',id:f.uid});
function strike(run:RunState,atk:number,pow:number,def:number,mult:number){const r=.9+rand(run)*.2;return Math.max(1,Math.round((atk*pow*r-def*.5)*mult));}

function movePattern(f:Foe,roll:number){const t=f.turn;
 if(f.pattern==='sardine')return [{n:'しっぽビンタ',p:1},{n:'ためている…',p:0,charge:true},{n:'どすどす押しつぶし',p:2.3}][t%3];
 if(f.pattern==='crab')return [{n:'タイコ連打',p:.6,all:true},{n:'ためている…',p:0,charge:true},{n:'ドーン！',p:2.2},{n:'おやかたの気合',p:0,buff:'healSelf' as const}][t%4];
 if(f.pattern==='boss')return [{n:'指ぱっちん',p:.75,all:true},{n:'ためている…',p:0,charge:true},{n:'大立ち回り',p:2.4}][t%3];
 const total=f.moves.reduce((a,m)=>a+m.w,0);let r=roll*total;for(const m of f.moves){if(r<m.w)return m;r-=m.w;}return f.moves[0];}

export function resolveRound(run:RunState,cmds:(Cmd|undefined)[]):Ev[]{
 const b=run.battle;const evs:Ev[]=[];if(run.phase!=='battle'||!b||b.over)return evs;
 type Act={pri:number;side:'p'|'f';idx:number};const acts:Act[]=[];
 run.party.forEach((m,i)=>{if(m.hp<=0)return;const c=cmds[i]??{t:'attack' as const,target:livingFoes(b)[0]?.uid??0};cmds[i]=c;const first=c.t==='guard'||c.t==='item';acts.push({pri:(first?1000:0)+(c.t==='flee'?500:0)+m.spd+rand(run)*3,side:'p',idx:i});});
 for(const f of livingFoes(b))acts.push({pri:f.spd+rand(run)*3,side:'f',idx:f.uid});
 acts.sort((a,c)=>c.pri-a.pri);
 for(const a of acts){if(b.over)break;
  if(a.side==='p'){const m=run.party[a.idx];if(m.hp<=0)continue;partyAct(run,b,a.idx,cmds[a.idx]!,evs);}
  else{const f=b.foes.find(x=>x.uid===a.idx);if(!f||f.hp<=0)continue;foeAct(run,b,f,evs);}
  if(!b.over){if(!livingFoes(b).length)winBattle(run,b,evs);else if(!living(run).length){b.over='lose';run.phase='over';evs.push({t:'end',result:'lose'});}}}
 if(!b.over){endRound(run,b);}return evs;}

function endRound(run:RunState,b:Battle){b.round++;run.stats.turns++;
 for(const m of run.party){m.guard=false;if(m.shield&&--m.shield.turns<=0)m.shield=null;}
 for(const f of b.foes){if(f.atkUp>0)f.atkUp--;if(f.guard>0)f.guard--;}}

function partyAct(run:RunState,b:Battle,i:number,c:Cmd,evs:Ev[]){const m=run.party[i],me=refP(i);
 const foeTarget=(uid:number)=>{const t=livingFoes(b).find(f=>f.uid===uid)??livingFoes(b)[0];return t;};
 const hitFoe=(f:Foe,pow:number,name:string,hits=1)=>{for(let k=0;k<hits&&f.hp>0;k++){const crit=rand(run)<.08;let d=strike(run,m.atk,pow,f.def,crit?1.5:1);if(f.guard>0)d=Math.max(1,Math.round(d*.5));f.hp=Math.max(0,f.hp-d);evs.push({t:'hit',from:me,to:refF(f),dmg:d,hp:f.hp,crit,name});if(f.hp<=0){evs.push({t:'ko',who:refF(f)});}}};
 if(c.t==='guard'){m.guard=true;evs.push({t:'msg',text:`${m.name}は身をまもっている`});return;}
 if(c.t==='flee'){if(b.boss){evs.push({t:'msg',text:'ボスからは にげられない！'});return;}if(rand(run)<.55){b.over='fled';run.gold=Math.floor(run.gold*.9);run.phase='map';run.battle=b;evs.push({t:'msg',text:'うまく にげきれた！(かつおぶしを少し落とした)'},{t:'end',result:'fled'});}else evs.push({t:'msg',text:'にげられなかった！'});return;}
 if(c.t==='item'){const ok=useItem(run,c.item,c.target,evs);if(!ok)evs.push({t:'msg',text:'しかし 何も起きなかった'});return;}
 if(c.t==='skill'){const s=SKILLS[c.skill];if(s&&m.skills.includes(s.id)&&m.mp>=s.cost){m.mp-=s.cost;evs.push({t:'mp',to:me,mp:m.mp});
   if(s.kind==='dmg'){if(s.target==='foes'){evs.push({t:'msg',text:`${m.name}の${s.name}！`});for(const f of [...livingFoes(b)])hitFoe(f,s.power,s.name);}else{const f=foeTarget(c.target);if(f){evs.push({t:'msg',text:`${m.name}の${s.name}！`});hitFoe(f,s.power,s.name,s.hits??1);}}}
   else if(s.kind==='heal'){evs.push({t:'msg',text:`${m.name}の${s.name}！`});
     const weakest=()=>living(run).sort((x,y)=>x.m.hp/x.m.maxHp-y.m.hp/y.m.maxHp)[0];
     const targets=s.target==='allies'?living(run):[run.party[c.target]?.hp>0?{m:run.party[c.target],i:c.target}:weakest()];
     for(const t of targets){const a=Math.min(t.m.maxHp-t.m.hp,Math.round(t.m.maxHp*s.power+(s.target==='ally'?m.atk*.4:0)));t.m.hp+=a;evs.push({t:'heal',to:refP(t.i),amount:a,hp:t.m.hp,name:s.name});}}
   else{evs.push({t:'msg',text:`${m.name}の${s.name}！ みんなの守りが固くなった`});for(const t of living(run))t.m.shield={mul:s.mul!,turns:s.turns!+1};}
   return;}}
 const f=foeTarget((c as {target:number}).target);if(f){evs.push({t:'msg',text:`${m.name}のこうげき！`});hitFoe(f,1,'こうげき');}}

function foeAct(run:RunState,b:Battle,f:Foe,evs:Ev[]){
 if(f.boss&&!f.phase2&&f.hp<=f.maxHp/2){f.phase2=true;if(f.pattern==='sardine'){const add=[makeFoe(run,FOES.buzz_bee,run.chapter),makeFoe(run,FOES.buzz_bee,run.chapter)];b.foes.push(...add);evs.push({t:'msg',text:`${f.name}が 怒った！ ハチたちが 助けにきた！`},{t:'summon',foes:add});}
  else if(f.pattern==='crab'){f.atk=Math.round(f.atk*1.2);evs.push({t:'msg',text:`${f.name}の リズムが 加速した！`});}
  else{f.atk=Math.round(f.atk*1.25);const add=[makeFoe(run,FOES.gang,3)];b.foes.push(...add);evs.push({t:'msg',text:`${f.name}が 本気を出した！ 子分が かけつけた！`},{t:'summon',foes:add});}}
 const mv=movePattern(f,rand(run)) as {n:string;p:number;all?:boolean;buff?:string;charge?:boolean};f.turn++;
 const me=refF(f);
 if((mv as {charge?:boolean}).charge){f.charging=true;evs.push({t:'charge',who:me},{t:'msg',text:`${f.name}は 力をためている…！ (ぼうぎょで備えよう)`});return;}
 f.charging=false;
 if(mv.buff==='atkUp'){for(const o of livingFoes(b))o.atkUp=3;evs.push({t:'msg',text:`${f.name}の${mv.n}！ 敵のこうげきが上がった`});return;}
 if(mv.buff==='guard'){f.guard=2;evs.push({t:'msg',text:`${f.name}の${mv.n}！ 受けるダメージが減る`});return;}
 if(mv.buff==='healSelf'){const a=Math.min(f.maxHp-f.hp,Math.round(f.maxHp*.12));f.hp+=a;evs.push({t:'msg',text:`${f.name}の${mv.n}！`},{t:'heal',to:me,amount:a,hp:f.hp,name:mv.n});return;}
 const targets=mv.all?living(run):[pickOne(run,living(run))];
 evs.push({t:'msg',text:`${f.name}の${mv.n}！`});
 for(const t of targets){const m=t.m;let d=strike(run,f.atk*(f.atkUp>0?1.3:1),mv.p,m.def,(m.guard?.5:1)*(m.shield?m.shield.mul:1));m.hp=Math.max(0,m.hp-d);evs.push({t:'hit',from:me,to:refP(t.i),dmg:d,hp:m.hp,crit:false,name:mv.n});if(m.hp<=0)evs.push({t:'ko',who:refP(t.i)});}}

function winBattle(run:RunState,b:Battle,evs:Ev[]){b.over='win';const ch=run.chapter;
 let gold=0,xp=0;for(const f of b.foes){xp+=f.boss?70+ch*20:Math.round((6+ch*3)*(b.elite?1.6:1));gold+=f.boss?30*ch:Math.round((4+ch*3)*(b.elite?1.8:1));}
 if(has(run,'lucky'))gold=Math.round(gold*1.5);run.gold+=gold;const items:string[]=[];
 if(b.elite||(!b.boss&&rand(run)<.3)){const it=b.elite?pickOne(run,['onigiri','matatabi','kankan']):'onigiri';if((run.items[it]??0)<ITEM_MAX){run.items[it]=(run.items[it]??0)+1;items.push(it);}}
 const levelUps=gainXp(run,xp,evs);
 if(has(run,'purr'))for(const m of run.party)if(m.hp>0)m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*.06));
 b.rewards={gold,xp,items,levelUps};
 if(b.boss){if(ch>=CHAPTERS)run.phase='clear';else{run.reward=rewardOptions(run);run.phase='reward';}}else run.phase='map';
 evs.push({t:'end',result:'win'});}

/** Leave the battle result screen; the phase (map / reward / clear / over) was already decided by the battle. */
export function dismissBattle(run:RunState){if(run.battle?.over){run.battle=null;return true;}return false;}
