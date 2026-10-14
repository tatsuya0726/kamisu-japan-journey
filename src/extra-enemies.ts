import pack from './data/mission-pack.json' with {type:'json'};
export const EXTRA_ENEMIES=pack.enemies.map((e,i)=>({id:e.id,name:e.name,hp:Math.round(70*e.hp_multiplier*(e.role==='boss'?2:1)),speed:29*e.speed_multiplier,damage:[8,12,9,10,38,12,8,18,13,20,14,17][i],range:e.role==='boss'?190:e.role==='ranged'?145:40,attack:e.role==='boss'?3.8:e.role==='ranged'?1.8:1.25,role:e.role,behavior:e.behavior,resolution:e.peaceful_resolution}));
export function extraEnemy(kind:number){return EXTRA_ENEMIES[kind-3];}
