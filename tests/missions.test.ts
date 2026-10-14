import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS,LOCATION_IDS,pack,decodeMissions,rewardMission,MISSION_SAVE_KEY} from '../src/missions.ts';
import {freshMission,spawn,tick,SAVE_KEY,ENEMIES} from '../src/defense.ts';

test('42 unique missions cover seven places and use valid enemy schedules',()=>{
 assert.equal(MISSIONS.length,42);assert.equal(new Set(MISSIONS.map(m=>m.id)).size,42);assert.equal(pack.enemies.length,12);
 for(const id of LOCATION_IDS)assert.equal(MISSIONS.filter(m=>m.location_id===id).length,6);
 for(const m of MISSIONS){assert.ok(m.runtime.waves.length);assert.ok(m.introduction.length&&m.outro.length);for(const [i,[time,kind]] of m.runtime.waves.entries()){assert.ok(ENEMIES[kind]);assert.ok(time>=0);if(i)assert.ok(time>=m.runtime.waves[i-1][0]);}const o=m.runtime.objective;if(o.type==='count')assert.ok(m.runtime.waves.filter(w=>w[1]===o.kind).length>=o.count);}
});
test('mission records isolate old saves, filter corrupt IDs, and reward once',()=>{
 assert.notEqual(MISSION_SAVE_KEY,SAVE_KEY);const id=MISSIONS[0].id;
 assert.deepEqual(decodeMissions('broken'),{version:1,cleared:[]});
 assert.deepEqual(decodeMissions(JSON.stringify({version:1,cleared:[0,id,id,'unknown']})).cleared,[id]);
 const p=decodeMissions(null);assert.equal(rewardMission(p,id),true);assert.equal(rewardMission(p,id),false);assert.equal(rewardMission(p,'unknown'),false);assert.deepEqual(p.cleared,[id]);
});
for(const m of MISSIONS)test(`${m.id}: playable, failure, pause and retry`,()=>{
 const s=freshMission(m.runtime);s.paused=true;const frozen=JSON.stringify(s);tick(s,.2);assert.equal(JSON.stringify(s),frozen);s.paused=false;
 let next=0;while(s.result==='playing'&&s.time<240){if(spawn(s,[1,2,0,3,0][next%5]))next++;tick(s,.1);}assert.equal(s.result,'win');
 const done=JSON.stringify(s);tick(s,.2);assert.equal(JSON.stringify(s),done);
 if(m.runtime.bossSupports)assert.equal(s.triggers!.length,m.runtime.bossSupports.length);
 const idle=freshMission(m.runtime);while(idle.result==='playing'&&idle.time<240)tick(idle,.1);assert.equal(idle.result,'lose');
 const retry=freshMission(m.runtime);assert.equal(retry.time,0);assert.equal(retry.home,m.runtime.homeHP);assert.equal(retry.units.length,0);
});
test('hard-mode tuning: tougher enemies, slower food, and clears take longer than the untuned baseline',()=>{
 for(const m of MISSIONS){assert.ok((m.runtime.hpScale??1)>=2.2,m.id);assert.ok((m.runtime.dmgScale??1)>=2,m.id);assert.ok(m.runtime.income<=17,m.id);assert.ok(m.runtime.homeHP<=240,m.id);}
 let total=0;for(const m of MISSIONS){const s=freshMission(m.runtime);let next=0;while(s.result==='playing'&&s.time<240){if(spawn(s,[1,2,0,3,0][next%5]))next++;tick(s,.1);}assert.equal(s.result,'win',m.id);total+=s.time;}
 assert.ok(total/MISSIONS.length>=75,`average clear ${Math.round(total/MISSIONS.length)}s`);
});
