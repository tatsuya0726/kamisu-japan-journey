import {EXTRA_ENEMIES,extraEnemy} from './extra-enemies.ts';
export const FIELD={width:1600,home:90,enemy:1510,spawn:105,enemySpawn:1495};
export const SAVE_KEY='kamisu.defense.progress.v1';
export type Objective={type:'clear'}|{type:'survive';seconds:number}|{type:'count';kind:number;count:number}|{type:'boss';kind:number};
export type MissionStage={id:string;name:string;subtitle:string;note:string;theme:string;base:number;income:number;waves:number[][];objective:Objective;homeHP:number;spawnX:number;groups:number;hpScale?:number;dmgScale?:number;bossSupports?:{threshold:number;kind:number;count:number}[]};
export function battleStage(s:Battle){return s.mission??{...STAGES[s.stage],homeHP:650,spawnX:FIELD.enemySpawn};}
export function freshMission(mission:MissionStage):Battle{return {...fresh(),mission,home:mission.homeHP,enemyBase:mission.base,settled:{},triggers:[]};}
function speedFactor(s:Battle,u:Unit){let factor=(u.slowUntil??0)>s.time?.65:1;if(u.side===0||u.kind<3)return factor;const c=extraEnemy(u.kind),age=s.time-(u.born??0),cycle=age%6;
 if(c.role==='runner')factor*=cycle<1?0:cycle<2.5?2:cycle<3.4?.15:1;
 if(c.role==='flier')factor*=cycle<1?.5:cycle<2.5?1.6:1;
 if(c.role==='tank')factor*=cycle>4.7?.15:cycle>3?1.5:1;
 if(c.role==='blocker')factor*=age%9>6?0:1;
 if(c.role==='support'&&cycle>4)factor=0;
 if(s.units.some(v=>v.side===1&&v.id!==u.id&&Math.abs(v.x-u.x)<180&&['support','disruptor'].includes(extraEnemy(v.kind)?.role??'')))factor*=1.2;
 return factor;
}
function resolveMission(s:Battle){const m=s.mission!,o=m.objective;const boss=s.units.find(u=>u.side===1&&extraEnemy(u.kind)?.role==='boss');
 if(boss)for(const [i,t] of (m.bossSupports??[]).entries())if(boss.hp/boss.max<=t.threshold&&!s.triggers!.includes(i)){s.triggers!.push(i);for(let n=0;n<t.count;n++){const c=ENEMIES[t.kind],hp=Math.round(c.hp*(m.hpScale??1));s.units.push({id:s.nextId++,side:1,kind:t.kind,x:m.spawnX+n*50,hp,max:hp,cool:c.attack,flash:0,born:s.time});}}
 const count=o.type==='count'||o.type==='boss'?(s.settled?.[o.kind]??0):0;
 if(o.type==='survive'?s.time>=o.seconds:o.type==='count'?count>=o.count:o.type==='boss'?count>=1:s.wave===m.waves.length&&!s.units.some(u=>u.side===1))s.result='win';
}
export const CATS=[
 {name:'キキ',role:'基本',cost:40,cd:2.5,hp:100,damage:17,range:40,speed:42,attack:0.8},
 {name:'ネネ',role:'盾',cost:70,cd:6,hp:360,damage:10,range:38,speed:24,attack:1.2},
 {name:'農家猫',role:'遠距離',cost:100,cd:7,hp:70,damage:34,range:165,speed:30,attack:1.7},
 {name:'配達猫',role:'俊足',cost:65,cd:4,hp:85,damage:24,range:38,speed:75,attack:0.65},
 {name:'木剣キキ',role:'近接',cost:110,cd:7,hp:180,damage:38,range:48,speed:36,attack:1.1},
 {name:'おさかなキキ',role:'快速',cost:90,cd:5,hp:95,damage:19,range:38,speed:95,attack:0.55},
 {name:'翼ネネ',role:'空から応援',cost:170,cd:10,hp:125,damage:42,range:200,speed:34,attack:1.9},
 {name:'ガードネネ',role:'重装',cost:240,cd:18,hp:1000,damage:16,range:38,speed:18,attack:1.4},
 {name:'絵描き猫',role:'長距離応援',cost:130,cd:9,hp:90,damage:28,range:225,speed:25,attack:2.1},
 {name:'空手猫',role:'素早い近接',cost:85,cd:4.5,hp:165,damage:14,range:34,speed:55,attack:.45}
];
export const ENEMIES=[
 {name:'いたずらチンピラ',hp:70,damage:10,range:38,speed:29,attack:1.2},
 {name:'ハット・ギャング',hp:100,damage:16,range:120,speed:23,attack:1.8},
 {name:'スーツの親分',hp:310,damage:25,range:42,speed:18,attack:1.5},...EXTRA_ENEMIES
];
export const STAGES=[
 {name:'鹿島港・神栖側',subtitle:'潮風の防衛線',note:'神栖市の北部から東部には鹿島港が広がります。',theme:'port',base:520,income:12,hpScale:2.5,dmgScale:2,waves:[[5,0],[13,0],[22,0],[30,1],[40,0],[48,0],[57,2],[68,1]]},
 {name:'波崎海岸',subtitle:'潮風とねこの作戦',note:'波崎海水浴場は、神栖市波崎にある遠浅の海水浴場です。',theme:'coast',base:700,income:13,hpScale:3.2,dmgScale:2.4,waves:[[4,0],[10,0],[17,1],[24,0],[29,2],[37,1],[45,0],[50,2],[60,1],[70,2]]},
 {name:'大野原のまち',subtitle:'みんなの帰る場所',note:'大野原は、神栖市の商業の核となる地区の一つです。',theme:'town',base:900,income:14,hpScale:3.4,dmgScale:2.6,waves:[[4,0],[9,1],[17,0],[23,2],[29,1],[36,2],[43,0],[49,1],[57,2],[66,1],[72,2],[80,2]]}
];
export type Unit={id:number,side:0|1,kind:number,x:number,hp:number,max:number,cool:number,flash:number;born?:number;slowUntil?:number};
export type Battle={stage:number,time:number,food:number,home:number,enemyBase:number,units:Unit[],cooldowns:number[],wave:number,nextId:number,paused:boolean,speed:1|2,result:'playing'|'win'|'lose',kills:number;mission?:MissionStage;settled?:Record<number,number>;triggers?:number[]};
export type Progress={version:1,cleared:number[]};
export function decodeProgress(raw:string|null):Progress {try{const p=JSON.parse(raw??'null');if(p?.version===1&&Array.isArray(p.cleared)&&p.cleared.every((n:unknown)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<STAGES.length))return {version:1,cleared:[...new Set<number>(p.cleared)]};}catch{}return {version:1,cleared:[]};}
export function fresh(stage=0):Battle{return {stage:Math.max(0,Math.min(2,stage)),time:0,food:120,home:650,enemyBase:STAGES[Math.max(0,Math.min(2,stage))].base,units:[],cooldowns:CATS.map(()=>0),wave:0,nextId:1,paused:false,speed:1,result:'playing',kills:0};}
export function spawn(s:Battle,kind:number):boolean {const c=CATS[kind];if(!c||s.paused||s.result!=='playing'||s.food<c.cost||s.cooldowns[kind]>0||s.units.filter(u=>u.side===0).length>=24)return false;s.food-=c.cost;s.cooldowns[kind]=c.cd;s.units.push({id:s.nextId++,side:0,kind,x:FIELD.spawn,hp:c.hp,max:c.hp,cool:0,flash:0});return true;}
export function tick(s:Battle,elapsed:number){if(s.paused||s.result!=='playing')return;let left=Math.max(0,Math.min(elapsed,0.25))*s.speed;while(left>0&&s.result==='playing'){const dt=Math.min(left,0.025);step(s,dt);left-=dt;}}
function step(s:Battle,dt:number){const stage=battleStage(s);s.time+=dt;s.food=Math.min(400,s.food+stage.income*dt);s.cooldowns=s.cooldowns.map(c=>Math.max(0,c-dt));
 while(s.wave<stage.waves.length&&s.time>=stage.waves[s.wave][0]){const kind=stage.waves[s.wave++][1],c=ENEMIES[kind],hp=Math.round(c.hp*(stage.hpScale??1));s.units.push({id:s.nextId++,side:1,kind,x:stage.spawnX??FIELD.enemySpawn,hp,max:hp,cool:kind>=3?c.attack:0,flash:0,born:s.time});}
 const hits=new Map<number,number>();let homeHit=0,enemyHit=0;
 for(const u of s.units){const c=u.side===0?CATS[u.kind]:ENEMIES[u.kind],dir=u.side===0?1:-1;u.cool=Math.max(0,u.cool-dt);u.flash=Math.max(0,u.flash-dt);
 const targets=s.units.filter(v=>v.side!==u.side&&v.hp>0&&(v.x-u.x)*dir>=-2).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x));const target=targets[0],baseX=u.side===0?(s.mission?.spawnX??FIELD.enemy):FIELD.home,dist=target?Math.abs(target.x-u.x):Math.abs(baseX-u.x);
 if(dist<=c.range){if(u.cool<=0){const damage=c.damage*(u.side===1?stage.dmgScale??1:1);u.cool=c.attack;u.flash=0.16;if(target){hits.set(target.id,(hits.get(target.id)??0)+damage);if(u.side===1&&extraEnemy(u.kind)?.id==='bubble_fish')target.slowUntil=s.time+1.4;}else if(u.side===0)enemyHit+=damage;else homeHit+=damage;}}
 else {let movement=Math.min(c.speed*dt*speedFactor(s,u),Math.max(0,dist-c.range));if(u.side===1){const front=s.units.filter(v=>v.side===1&&(v.x-u.x)*dir>0.01).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x))[0];if(front)movement=Math.min(movement,Math.max(0,Math.abs(front.x-u.x)-48));}u.x+=dir*movement;}
 }
 for(const u of s.units){const hit=hits.get(u.id)??0;const armored=u.side===1&&extraEnemy(u.kind)?.id==='can_robot'&&(s.time-(u.born??0))%6>4;u.hp-=hit*(armored?.65:1);if(hit>0&&u.side===1&&extraEnemy(u.kind)?.id==='buzz_bee')u.x=Math.min(stage.spawnX??FIELD.enemySpawn,u.x+12);if(u.hp<=0&&u.side===1&&s.settled)s.settled[u.kind]=(s.settled[u.kind]??0)+1;}s.kills+=s.units.filter(u=>u.hp<=0&&u.side===1).length;s.units=s.units.filter(u=>u.hp>0);s.home=Math.max(0,s.home-homeHit);s.enemyBase=Math.max(0,s.enemyBase-enemyHit);if(s.home<=0)s.result='lose';else if(!s.mission&&s.enemyBase<=0)s.result='win';else if(s.mission)resolveMission(s);
}
