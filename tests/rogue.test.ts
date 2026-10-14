import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,visit,startBoss,resolveRound,dismissBattle,DAYS,CHAPTERS} from '../src/rogue/engine.ts';
import {autoplay,playTurnCommands} from '../src/rogue/bot.ts';
import {decodeRun,decodeBest,RUN_KEY,BEST_KEY} from '../src/rogue/save.ts';
import {BOSSES} from '../src/rogue/data.ts';
import {MISSIONS,MISSION_SAVE_KEY} from '../src/missions.ts';
import {SAVE_KEY} from '../src/defense.ts';

test('run structure: 3 weeks x 7 days, 7 places per week, boss on day 7', () => {
  assert.equal(DAYS, 7); assert.equal(CHAPTERS, 3); assert.equal(BOSSES.length, 3);
  const r = newRun(1);
  assert.equal(r.nodes.length, 7); assert.equal(r.party.length, 2);
  assert.deepEqual(r.party.map(m => m.name), ['キキ', 'ネネ']);
  assert.equal(BOSSES[2].title, 'ラスボス');
});
test('each action costs one day and the boss is unlocked on day 7', () => {
  const r = newRun(5); const d = r.day;
  assert.ok(visit(r, 0)); assert.equal(r.day, d + 1);
  assert.equal(startBoss(r), false);
});
test('same seed gives same run', () => {
  const a = newRun(42), b = newRun(42);
  assert.deepEqual(a.nodes.map(n => n.kind), b.nodes.map(n => n.kind));
  const ra = newRun(7), rb = newRun(7); autoplay(ra, 'decent'); autoplay(rb, 'decent'); const x = JSON.stringify(ra), y = JSON.stringify(rb);
  assert.equal(x, y);
});
test('a full run always terminates in clear or over; decent play clears sometimes, careless rarely', () => {
  let dec = 0, car = 0;
  for (let s = 1; s <= 60; s++) {
    const d = autoplay(newRun(s), 'decent'); assert.ok(d === 'clear' || d === 'over'); if (d === 'clear') dec++;
    const c = autoplay(newRun(s), 'careless'); assert.ok(c === 'clear' || c === 'over'); if (c === 'clear') car++;
  }
  assert.ok(dec >= 12 && dec <= 54, `decent clears ${dec}/60`);
  assert.ok(car < dec);
});
test('run state survives save/restore and rejects garbage', () => {
  const r = newRun(3); visit(r, 0);
  const back = decodeRun(JSON.stringify(r));
  assert.deepEqual(back, JSON.parse(JSON.stringify(r)));
  assert.equal(decodeRun('{"v":9}'), null); assert.equal(decodeRun('xx'), null); assert.equal(decodeRun(null), null);
  assert.deepEqual(decodeBest('nope'), {v: 1, runs: 0, clears: 0, bestDays: 0});
});
test('battles resolve and can be dismissed', () => {
  const r = newRun(11); let k = 0; while (r.nodes[k].kind !== 'battle' && k < 6) k++;
  if (r.nodes[k].kind === 'battle') { visit(r, k); assert.ok(r.battle); let g = 0; while (r.battle && !r.battle.over && g++ < 80) resolveRound(r, playTurnCommands(r, 'decent')); assert.ok(r.battle!.over); dismissBattle(r); assert.ok(!r.battle); }
});
test('old defense mode data and save keys are untouched', () => {
  assert.equal(MISSIONS.length, 42); assert.equal(MISSION_SAVE_KEY, 'kamisu.missions.progress.v1'); assert.equal(SAVE_KEY, 'kamisu.defense.progress.v1');
  assert.equal(RUN_KEY, 'kamisu.rogue.run.v1'); assert.equal(BEST_KEY, 'kamisu.rogue.best.v1');
});

import {evoOf,trackAct,T1,T2,PATH,formName} from '../src/rogue/evolve.ts';
import {checkEvolutions} from '../src/rogue/engine.ts';
test('3 actions on one habit evolve a member (look, stats, skill); 7 more evolve again', () => {
  const r = newRun(2); const m = r.party[0]; const hp0 = m.maxHp, atk0 = m.atk;
  for (let i = 0; i < T1 - 1; i++) trackAct(m, 'fang');
  assert.equal(checkEvolutions(r).length, 0);
  trackAct(m, 'fang');
  const ev = checkEvolutions(r); assert.equal(ev.length, 1);
  assert.equal(m.name, formName('kiki', 'キキ', 'fang', 1)); assert.equal(m.art, 'kiki-sword');
  assert.ok(m.atk > atk0 && m.maxHp >= hp0); assert.ok(m.skills.includes(PATH.fang.skills[0]));
  assert.equal(evoOf(m).tier, 1);
  for (let i = evoOf(m).fang; i < T2; i++) trackAct(m, 'fang');
  assert.equal(checkEvolutions(r).length, 1); assert.equal(evoOf(m).tier, 2); assert.ok(m.skills.includes(PATH.fang.skills[1]));
});
test('different habits lead to different forms and skills', () => {
  const r = newRun(3); const [a, b] = r.party;
  for (let i = 0; i < T1; i++) { trackAct(a, 'shell'); trackAct(b, 'heart'); }
  checkEvolutions(r);
  assert.equal(evoOf(a).path, 'shell'); assert.equal(evoOf(b).path, 'heart');
  assert.equal(b.art, 'nene-wings'); assert.ok(a.skills.includes('bulwark')); assert.ok(b.skills.includes('warmth'));
});
