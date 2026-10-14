/** A simple scripted player. Used by tests and balance checks only (not by the game UI). */
import {visit,startBoss,chooseEvent,finishEvent,rest,buy,leaveShop,useItem,takeReward,resolveRound,dismissBattle,living,DAYS,type RunState,type Cmd} from './engine.ts';
import {SKILLS,ITEMS} from './data.ts';
export type Skill='careless'|'decent';
export function playTurnCommands(run:RunState,skill:Skill):(Cmd|undefined)[]{const b=run.battle!;const foes=b.foes.filter(f=>f.hp>0);const cmds:(Cmd|undefined)[]=[];
 const charging=foes.some(f=>f.charging);const lowest=[...foes].sort((a,c)=>a.hp-c.hp)[0];
 run.party.forEach((m,i)=>{if(m.hp<=0)return;
  if(skill==='careless'){cmds[i]={t:'attack',target:lowest.uid};return;}
  const hurt=living(run).sort((x,y)=>x.m.hp/x.m.maxHp-y.m.hp/y.m.maxHp)[0];
  if(hurt.m.hp/hurt.m.maxHp<.35&&(run.items.onigiri??0)>0&&m.hp/m.maxHp>.3){cmds[i]={t:'item',item:'onigiri',target:hurt.i};return;}
  const dead=run.party.findIndex(p=>p.hp<=0);if(dead>=0&&(run.items.matatabi??0)>0&&i===0){cmds[i]={t:'item',item:'matatabi',target:dead};return;}
  if(charging&&m.hp/m.maxHp<.7){cmds[i]={t:'guard'};return;}
  const heal=m.skills.map(s=>SKILLS[s]).find(s=>s.kind==='heal'&&m.mp>=s.cost);
  if(heal&&hurt.m.hp/hurt.m.maxHp<(heal.target==='allies'?.6:.5)){cmds[i]={t:'skill',skill:heal.id,target:hurt.i};return;}
  const shield=m.skills.map(s=>SKILLS[s]).find(s=>s.kind==='shield'&&m.mp>=s.cost);
  if(shield&&b.round%3===1){cmds[i]={t:'skill',skill:shield.id,target:0};return;}
  const dmg=m.skills.map(s=>SKILLS[s]).filter(s=>s.kind==='dmg'&&m.mp>=s.cost).sort((x,y)=>y.power*(x.hits??1)-x.power*(y.hits??1))[0];
  if(dmg&&(foes.length>1||lowest.hp>m.atk*1.5)){cmds[i]={t:'skill',skill:dmg.id,target:lowest.uid};return;}
  cmds[i]={t:'attack',target:lowest.uid};});
 return cmds;}
export function autoplay(run:RunState,skill:Skill,maxSteps=4000){let steps=0;
 while(run.phase!=='over'&&run.phase!=='clear'&&steps++<maxSteps){
  if(run.battle){if(run.battle.over){dismissBattle(run);continue;}resolveRound(run,playTurnCommands(run,skill));continue;}
  if(run.phase==='map'){
   if(skill==='decent'){for(const m of run.party.map((p,i)=>({p,i})).sort((a,c)=>a.p.hp/a.p.maxHp-c.p.hp/c.p.maxHp))if(m.p.hp>0&&m.p.hp/m.p.maxHp<.5)useItem(run,'onigiri',m.i);const d=run.party.findIndex(p=>p.hp<=0);if(d>=0)useItem(run,'matatabi',d);}
   if(run.day>=DAYS){startBoss(run);continue;}
   const hp=run.party.reduce((a,m)=>a+m.hp,0)/run.party.reduce((a,m)=>a+m.maxHp,0);
   const order=run.nodes.map((n,i)=>({n,i})).filter(x=>!x.n.visited);
   const score=(k:string)=>skill==='careless'?({battle:3,elite:2,event:1,rest:1,shop:0} as Record<string,number>)[k]:({rest:hp<.7?5:0,shop:run.gold>=26?4:0,battle:3,event:2.5,elite:hp>.75?2.8:0.5,}as Record<string,number>)[k]??0;
   order.sort((a,c)=>score(c.n.kind)-score(a.n.kind));visit(run,order[0].i);continue;}
  if(run.phase==='event'){const ev=run.event!;if(!ev.done)chooseEvent(run,0);else finishEvent(run);continue;}
  if(run.phase==='rest'){rest(run);continue;}
  if(run.phase==='shop'){if(skill==='decent'){for(const id of run.shop!.offers.sort((a,c)=>ITEMS[a].price-ITEMS[c].price))while(buy(run,id)&&false);let guard=0;while(guard++<6){const want=['feast','matatabi','onigiri'].find(id=>run.shop!.offers.includes(id)&&buy(run,id));if(!want)break;}}leaveShop(run);continue;}
  if(run.phase==='reward'){takeReward(run,0);continue;}
  break;}
 return run.phase;}
