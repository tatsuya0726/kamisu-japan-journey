export const SAVE_KEY='kamisu.defense.progress.v1';
export const CATS=[
 {name:'クリーム猫',role:'基本',cost:40,cd:2.5,hp:100,damage:17,range:40,speed:42,attack:0.8},
 {name:'銀色猫',role:'盾',cost:70,cd:6,hp:360,damage:10,range:38,speed:24,attack:1.2},
 {name:'農家猫',role:'遠距離',cost:100,cd:7,hp:70,damage:34,range:165,speed:30,attack:1.7},
 {name:'配達猫',role:'俊足',cost:65,cd:4,hp:85,damage:24,range:38,speed:75,attack:0.65}
];
export const ENEMIES=[
 {name:'いたずらチンピラ',hp:70,damage:10,range:38,speed:29,attack:1.2},
 {name:'ハット・ギャング',hp:100,damage:16,range:120,speed:23,attack:1.8},
 {name:'スーツの親分',hp:310,damage:25,range:42,speed:18,attack:1.5}
];
export const STAGES=[
 {name:'鹿島港・神栖側',subtitle:'潮風の防衛線',note:'神栖市の北部から東部には鹿島港が広がります。',theme:'port',base:360,income:17,waves:[[5,0],[13,0],[22,0],[30,1],[40,0],[48,0],[57,2],[68,1]]},
 {name:'波崎海岸',subtitle:'潮風とねこの作戦',note:'波崎海水浴場は、神栖市波崎にある遠浅の海水浴場です。',theme:'coast',base:500,income:18,waves:[[4,0],[10,0],[17,1],[24,0],[29,2],[37,1],[45,0],[50,2],[60,1],[70,2]]},
 {name:'大野原のまち',subtitle:'みんなの帰る場所',note:'大野原は、神栖市の商業の核となる地区の一つです。',theme:'town',base:650,income:20,waves:[[4,0],[9,1],[17,0],[23,2],[29,1],[36,2],[43,0],[49,1],[57,2],[66,1],[72,2],[80,2]]}
];
export type Unit={id:number,side:0|1,kind:number,x:number,hp:number,max:number,cool:number,flash:number};
export type Battle={stage:number,time:number,food:number,home:number,enemyBase:number,units:Unit[],cooldowns:number[],wave:number,nextId:number,paused:boolean,speed:1|2,result:'playing'|'win'|'lose',kills:number};
export type Progress={version:1,cleared:number[]};
export function decodeProgress(raw:string|null):Progress {try{const p=JSON.parse(raw??'null');if(p?.version===1&&Array.isArray(p.cleared)&&p.cleared.every((n:unknown)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<STAGES.length))return {version:1,cleared:[...new Set<number>(p.cleared)]};}catch{}return {version:1,cleared:[]};}
export function fresh(stage=0):Battle{return {stage:Math.max(0,Math.min(2,stage)),time:0,food:120,home:650,enemyBase:STAGES[Math.max(0,Math.min(2,stage))].base,units:[],cooldowns:[0,0,0,0],wave:0,nextId:1,paused:false,speed:1,result:'playing',kills:0};}
export function spawn(s:Battle,kind:number):boolean {const c=CATS[kind];if(!c||s.paused||s.result!=='playing'||s.food<c.cost||s.cooldowns[kind]>0||s.units.some(u=>u.side===0&&u.x<153)||s.units.filter(u=>u.side===0).length>=24)return false;s.food-=c.cost;s.cooldowns[kind]=c.cd;s.units.push({id:s.nextId++,side:0,kind,x:105,hp:c.hp,max:c.hp,cool:0,flash:0});return true;}
export function tick(s:Battle,elapsed:number){if(s.paused||s.result!=='playing')return;let left=Math.max(0,Math.min(elapsed,0.25))*s.speed;while(left>0&&s.result==='playing'){const dt=Math.min(left,0.025);step(s,dt);left-=dt;}}
function step(s:Battle,dt:number){const stage=STAGES[s.stage];s.time+=dt;s.food=Math.min(400,s.food+stage.income*dt);s.cooldowns=s.cooldowns.map(c=>Math.max(0,c-dt));
 while(s.wave<stage.waves.length&&s.time>=stage.waves[s.wave][0]){const kind=stage.waves[s.wave++][1],c=ENEMIES[kind];s.units.push({id:s.nextId++,side:1,kind,x:895,hp:c.hp,max:c.hp,cool:0,flash:0});}
 const hits=new Map<number,number>();let homeHit=0,enemyHit=0;
 for(const u of s.units){const c=u.side===0?CATS[u.kind]:ENEMIES[u.kind],dir=u.side===0?1:-1;u.cool=Math.max(0,u.cool-dt);u.flash=Math.max(0,u.flash-dt);
 const targets=s.units.filter(v=>v.side!==u.side&&v.hp>0&&(v.x-u.x)*dir>=-2).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x));const target=targets[0],baseX=u.side===0?910:90,dist=target?Math.abs(target.x-u.x):Math.abs(baseX-u.x);
 if(dist<=c.range){if(u.cool<=0){u.cool=c.attack;u.flash=0.16;if(target)hits.set(target.id,(hits.get(target.id)??0)+c.damage);else if(u.side===0)enemyHit+=c.damage;else homeHit+=c.damage;}}
 else {let movement=Math.min(c.speed*dt,Math.max(0,dist-c.range));const front=s.units.filter(v=>v.side===u.side&&(v.x-u.x)*dir>0.01).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x))[0];if(front)movement=Math.min(movement,Math.max(0,Math.abs(front.x-u.x)-48));u.x+=dir*movement;}
 }
 for(const u of s.units)u.hp-=hits.get(u.id)??0;s.kills+=s.units.filter(u=>u.hp<=0&&u.side===1).length;s.units=s.units.filter(u=>u.hp>0);s.home=Math.max(0,s.home-homeHit);s.enemyBase=Math.max(0,s.enemyBase-enemyHit);if(s.home<=0)s.result='lose';else if(s.enemyBase<=0)s.result='win';
}
