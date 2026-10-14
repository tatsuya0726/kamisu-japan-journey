import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,tick,spawn,decodeProgress,SAVE_KEY,STAGES,CATS} from '../src/defense.ts';
const advance=(s:ReturnType<typeof fresh>,seconds:number)=>{for(let i=0;i<seconds*20;i++)tick(s,.05);};
test('defense save namespace rejects journey records and malformed progress',()=>{assert.notEqual(SAVE_KEY,'komorebi.phaser.comparison.save.v1');assert.deepEqual(decodeProgress('{"day":10,"coins":30}'),{version:1,cleared:[]});assert.deepEqual(decodeProgress('{"version":1,"cleared":[0,2,2]}').cleared,[0,2]);assert.deepEqual(decodeProgress('{"version":1,"cleared":[7]}').cleared,[]);});
test('income cap, pause, speed, and bounded frame time',()=>{const s=fresh();advance(s,1);assert.ok(Math.abs(s.food-(120+STAGES[0].income))<.001);s.paused=true;const before=JSON.stringify(s);advance(s,4);assert.equal(JSON.stringify(s),before);s.paused=false;s.speed=2;advance(s,1);assert.ok(Math.abs(s.time-3)<.001);tick(s,100);assert.ok(s.time<3.51);});
test('spawn cost and cooldown prevent duplicates while companions share the exit',()=>{const s=fresh();assert.equal(spawn(s,0),true);assert.equal(s.food,80);assert.equal(spawn(s,0),false);assert.equal(spawn(s,1),true);assert.equal(s.food,10);advance(s,3);assert.equal(spawn(s,0),true);assert.equal(spawn(s,99),false);});
test('fast companions pass friendly shields but not enemies',()=>{const s=fresh();spawn(s,1);advance(s,2.2);s.food=400;spawn(s,3);advance(s,4);const shield=s.units.find(u=>u.side===0&&u.kind===1)!,fast=s.units.find(u=>u.side===0&&u.kind===3)!,enemy=s.units.find(u=>u.side===1)!;assert.ok(fast.x>shield.x);assert.ok(fast.x<enemy.x);});
test('ranged units hit from range without crossing targets',()=>{const s=fresh();s.units=[{id:1,side:0,kind:2,x:400,hp:70,max:70,cool:0,flash:0},{id:2,side:1,kind:0,x:540,hp:70,max:70,cool:0,flash:0}];advance(s,.1);assert.equal(s.units[1].hp,36);assert.equal(s.units[0].hp,70);assert.equal(s.units[0].x,400);});
test('loss stops all simulation; restart is independent',()=>{const s=fresh();advance(s,200);assert.equal(s.result,'lose');const done=JSON.stringify(s);advance(s,20);assert.equal(JSON.stringify(s),done);assert.equal(spawn(s,0),false);const r=fresh();assert.equal(r.home,650);assert.equal(r.time,0);assert.equal(r.units.length,0);assert.equal(r.food,120);});
for(let stage=0;stage<STAGES.length;stage++)test(`stage ${stage+1} winnable with mixed deployment`,()=>{const s=fresh(stage);let choice=0;const order=[1,2,0,3,0];for(let i=0;i<6000&&s.result==='playing';i++){if(spawn(s,order[choice%order.length]))choice++;tick(s,.05);}assert.equal(s.result,'win',JSON.stringify({time:s.time,home:s.home,enemy:s.enemyBase,units:s.units.length}));const done=JSON.stringify(s);advance(s,2);assert.equal(JSON.stringify(s),done);});
test('ten distinct companions and three local stages',()=>{assert.equal(CATS.length,10);assert.ok(CATS[1].hp>CATS[0].hp);assert.ok(CATS[2].range>CATS[0].range);assert.ok(CATS[3].speed>CATS[0].speed);assert.equal(STAGES.length,3);});
test('enemies overlap: every enemy walks to the front and attacks, none queues behind another',()=>{
 const s=fresh();s.food=0;s.wave=STAGES[0].waves.length;
 s.units=[{id:1,side:0,kind:1,x:700,hp:100000,max:100000,cool:100,flash:0},...[0,1,2].map(i=>({id:2+i,side:1,kind:0,x:900,hp:70,max:70,cool:0,flash:0,born:0}))];
 for(let i=0;i<200;i++)tick(s,.1);
 const enemies=s.units.filter(u=>u.side===1);assert.equal(enemies.length,3);
 assert.ok(enemies.every(e=>Math.abs(e.x-enemies[0].x)<1),'enemies stack on the same spot');
 assert.ok(s.units[0].hp<100000-3*ENEMIES_DAMAGE(),'all three enemies damaged the cat');
});
function ENEMIES_DAMAGE(){return 10*(STAGES[0].dmgScale??1);}
