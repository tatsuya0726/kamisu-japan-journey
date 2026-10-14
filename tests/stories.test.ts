import test from 'node:test';
import assert from 'node:assert/strict';
import {nextIndex,pickStory,EXTRA_STORIES,BANTER} from '../src/cat-stories.ts';
import {LANDMARKS,STAGE_LANDMARKS} from '../src/local-walk.ts';
import {MISSION_LOCATIONS} from '../src/mission-locations.ts';
import {STAGES} from '../src/defense.ts';
test('story selection excludes the previous entry for every random boundary',()=>{for(const size of [2,3,4])for(let last=0;last<size;last++)for(const value of [0,.25,.5,.999999,1]){const next=nextIndex(size,last,()=>value);assert.notEqual(next,last);assert.ok(next>=0&&next<size);}assert.equal(nextIndex(1,0),0);assert.throws(()=>nextIndex(0,0));assert.equal(nextIndex(3,99,()=>0),0);});
test('independent story decks never immediately repeat, even with constant randomness',()=>{const original=Math.random;Math.random=()=>0;try{assert.equal(pickStory('test-a',['a','b','c']),'a');assert.equal(pickStory('test-b',['x','y']),'x');assert.equal(pickStory('test-a',['a','b','c']),'b');assert.equal(pickStory('test-a',['a','b','c']),'a');assert.equal(pickStory('test-b',['x','y']),'y');}finally{Math.random=original;}});
test('every place keeps distinct stories, festival-decoration filler is gone, and battle lines cover start/win/loss',()=>{assert.equal(Object.keys(EXTRA_STORIES).length,7);for(const [id,stories] of Object.entries(EXTRA_STORIES)){assert.equal(stories.length,id==='ishigami'?0:2);assert.equal(new Set(stories.map(s=>s.title)).size,stories.length);assert.ok(stories.every(s=>s.action&&s.result));}const all=JSON.stringify([LANDMARKS,EXTRA_STORIES,MISSION_LOCATIONS]);assert.doesNotMatch(all,/お祭りの飾り|猫まつり|飾りを(並べ|届け)/);for(const l of LANDMARKS)assert.ok(l.title&&l.action&&l.result);assert.ok(Object.values(BANTER).every(lines=>lines.length>=3&&new Set(lines).size===lines.length));});
test('each strategy-map stage links to a real walk landmark and the base stages are tuned hard',()=>{
 assert.equal(STAGE_LANDMARKS.length,STAGES.length);assert.equal(MISSION_LOCATIONS.length,STAGES.length);
 for(const i of STAGE_LANDMARKS)assert.ok(LANDMARKS[i]);
 for(const s of STAGES){assert.ok((s.hpScale??1)>=2.5);assert.ok((s.dmgScale??1)>=2);assert.ok(s.income<=14);}
});
