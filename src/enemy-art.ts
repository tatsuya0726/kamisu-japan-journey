import records from './data/enemy-art.json' with {type:'json'};
import {extraEnemy} from './extra-enemies.ts';
import type {MissionStage} from './defense.ts';
const sizes:Record<string,[number,number]>={buzz_bee:[70,74],bee_swarm:[90,104],bubble_fish:[84,86],spring_mullet:[92,88],giant_sardine:[180,124],crab_drummer:[96,106],wind_kite:[90,100],pepper_marun:[82,112],wave_pukkun:[86,116],pine_mokomaru:[100,126],rattle_rider:[98,114],can_robot:[84,116]};
export function enemyArt(kind:number){const enemy=extraEnemy(kind),record=records.find(r=>r.id===enemy?.id);if(!record)return;const [width,height]=sizes[record.id];return{key:'extra-'+record.id,width,height,footY:record.foot_y,flying:['buzz_bee','bee_swarm','wind_kite'].includes(record.id)};}
export function missionArtKeys(mission?:MissionStage){if(!mission)return [];return [...new Set([...mission.waves.map(w=>w[1]),...(mission.bossSupports??[]).map(s=>s.kind)].map(kind=>enemyArt(kind)?.key).filter((key):key is string=>!!key))];}
