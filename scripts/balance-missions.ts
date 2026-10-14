import {MISSIONS} from '../src/missions.ts';
import {freshMission,spawn,tick} from '../src/defense.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
const rows=MISSIONS.map(m=>{
 const run=(active:boolean)=>{const s=freshMission(m.runtime);let next=0;while(s.result==='playing'&&s.time<240){if(active&&spawn(s,[1,2,0,3,0][next%5]))next++;tick(s,.1);}return{result:s.result,time:Math.round(s.time*10)/10,home:Math.round(s.home),settled:s.kills};};
 return{id:m.id,difficulty:m.difficulty,objective:m.runtime.objective,mixed:run(true),idle:run(false)};
});
mkdirSync('Captures',{recursive:true});writeFileSync('Captures/mission-balance.json',JSON.stringify(rows,null,2));
console.log('Wins',rows.filter(r=>r.mixed.result==='win').length,'Idle wins',rows.filter(r=>r.idle.result==='win').length);
