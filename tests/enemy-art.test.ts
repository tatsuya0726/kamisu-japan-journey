import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {enemyArt,missionArtKeys} from '../src/enemy-art.ts';
import {MISSIONS} from '../src/missions.ts';
import {EXTRA_ENEMIES} from '../src/extra-enemies.ts';
import {fresh,tick,ENEMIES} from '../src/defense.ts';
test('all twelve static enemy sprites have bounded transparent runtime PNGs and foot anchors',()=>{
 for(let i=0;i<12;i++){const a=enemyArt(i+3)!;assert.ok(a);const file=`public/defense/runtime/${a.key}.png`,b=readFileSync(file);assert.equal(b.toString('ascii',1,4),'PNG');assert.ok(b.readUInt32BE(16)<=384&&b.readUInt32BE(20)<=384);assert.equal(b[25],6);assert.ok(statSync(file).size<220000);assert.ok(a.footY>.95&&a.footY<1);assert.ok(a.width<=180&&a.height<=126);assert.ok(EXTRA_ENEMIES[i].range>=40);}
});
test('startup loads no expansion art and each mission loads only scheduled enemies including boss support',()=>{
 assert.deepEqual(missionArtKeys(),[]);const all=new Set<string>();
 for(const m of MISSIONS){const keys=missionArtKeys(m.runtime);assert.ok(keys.length>0&&keys.length<=4);assert.equal(keys.length,new Set(keys).size);keys.forEach(k=>all.add(k));for(const s of m.runtime.bossSupports??[])assert.ok(keys.includes(enemyArt(s.kind)!.key));}
 assert.equal(all.size,12);
});
test('all twelve enemy attack boundaries remain independent of transparent image dimensions',()=>{
 for(let kind=3;kind<15;kind++)for(const offset of [-1,1]){const c=ENEMIES[kind],s=fresh();s.units=[{id:1,side:0,kind:1,x:500-c.range-offset,hp:1000,max:1000,cool:100,flash:0},{id:2,side:1,kind,x:500,hp:c.hp,max:c.hp,cool:0,flash:0,born:0}];tick(s,.01);assert.equal(s.units[0].hp,offset<0?1000-c.damage:1000,`${kind} / range offset ${offset}`);}
});
