import pack from './data/mission-pack.json' with {type:'json'};
import type {MissionStage,Objective} from './defense.ts';
export {pack};
export const LOCATION_IDS=['ikisu_shrine','ishigami_kindergarten','karuno_elementary','thousand_people_gallery','kamisu_central_park','kamisu_disaster_arena','minato_park'];
const themes=['ikisu','ishigami','karuno','gallery','central-park','arena','port-park'];
export type Mission=typeof pack.missions[number]&{runtime:MissionStage;locationIndex:number};
// Enemy indices in the supplied pack. Each inner array is one designed wave group.
type Group=number[][];
const schedule:Group[][]=[
 [[[0,4]],[[7,1]],[[7,2]]], [[[6,4]],[[2,2],[6,4]],[[6,4]]], [[[9,1]],[[5,2]],[[9,2]]], [[[0,4]],[[0,4]],[[1,3]],[[0,3]]], [[[2,4]],[[8,2]],[[2,3],[8,2]]], [[[5,2]],[[10,3]],[[7,2]],[[5,1],[10,2],[7,1]]],
 [[[0,6]],[[1,2]],[[0,4],[1,2]]], [[[7,1]],[[11,2]],[[7,2]]], [[[2,2]],[[3,4]],[[2,2],[3,4]]], [[[5,1]],[[0,4],[5,2]],[[5,1]]], [[[11,2]],[[9,1]],[[11,3]]], [[[7,2]],[[8,2]],[[9,1]],[[7,1],[8,1],[9,1]]],
 [[[5,2]],[[11,2]],[[5,2],[11,2]]], [[[3,6]],[[2,2],[3,6]],[[3,6]]], [[[7,1]],[[6,5]],[[7,3]]], [[[9,1]],[[0,5]],[[9,2]],[[9,1]]], [[[11,2]],[[5,2]],[[11,3]],[[11,4]]], [[[6,4]],[[10,2]],[[11,2]],[[10,4]]],
 [[[2,4]],[[8,2]],[[2,3],[8,2]]], [[[6,5],[0,1]],[[6,5],[0,1]],[[6,5],[0,1]],[[6,5]]], [[[5,1]],[[7,1]],[[5,2]],[[5,2]]], [[[3,4]],[[11,2]],[[3,6]]], [[[7,2]],[[9,2]],[[7,3]]], [[[2,3]],[[4,1]]],
 [[[7,1]],[[8,1]],[[8,1],[7,2]]], [[[0,5]],[[1,3]],[[0,4]]], [[[9,2]],[[6,4]],[[9,2]],[[9,2]]], [[[11,2]],[[7,1]],[[11,4]]], [[[10,2]],[[10,2]],[[10,2],[5,1]],[[10,2]],[[10,2]],[[10,2]]], [[[7,2]],[[8,2]],[[9,2]],[[11,2]],[[7,1],[8,1],[9,1],[11,1]]],
 [[[11,2]],[[6,4]],[[11,3],[6,2]]], [[[5,2]],[[0,4]],[[5,2]],[[5,2]]], [[[7,2]],[[9,1]],[[7,3]]], [[[3,4]],[[2,2]],[[3,6]],[[2,2],[3,3]]], [[[8,1]],[[11,2]],[[8,1],[11,2]],[[8,1],[11,2]]], [[[5,2]],[[7,2]],[[11,2]],[[8,2]],[[5,1],[7,1],[8,1],[11,1]]],
 [[[6,4]],[[0,6]],[[6,6]]], [[[5,1]],[[2,4]],[[5,3]]], [[[3,4]],[[8,1]],[[3,6]]], [[[9,1]],[[11,2]],[[9,2]],[[9,2]]], [[[10,2]],[[5,2]],[[11,2]],[[10,3],[5,1]]], [[[3,4]],[[4,1]]]
];
/** Hard-mode tuning: enemy HP/damage multipliers and slower food income per designed difficulty. */
export const TUNING:Record<string,{hp:number;dmg:number;income:number;swarm:number}>={easy:{hp:1.5,dmg:1.2,income:17,swarm:1},normal:{hp:1.8,dmg:1.3,income:17,swarm:1.25},hard:{hp:1.7,dmg:1.25,income:18,swarm:1.1},boss:{hp:1.8,dmg:1.4,income:18,swarm:1}};
export const MISSIONS:Mission[]=LOCATION_IDS.flatMap((id,locationIndex)=>pack.missions.filter(m=>m.location_id===id).map((m,index)=>{
 const groups=schedule[locationIndex*6+index],first=pack.enemies.findIndex(e=>e.id===m.enemy_ids[0])+3;
 const seconds=Number(m.objective.match(/(\d+)秒/)?.[1]??0),count=Number(m.objective.match(/(\d+)体/)?.[1]??0);
 const objective:Objective=m.difficulty==='boss'?{type:'boss',kind:7}:seconds?{type:'survive',seconds}:count?{type:'count',kind:m.location_id==='karuno_elementary'&&index===5?13:first,count}:{type:'clear'};
 const waves:number[][]=[];groups.forEach((g,gi)=>{let n=0;for(const [kind,amount] of g)for(let i=0;i<Math.ceil(amount*TUNING[m.difficulty].swarm);i++)waves.push([2+gi*(seconds?Math.max(7,(seconds-12)/groups.length):13)+n++*1.3,kind+3]);});waves.sort((a,b)=>a[0]-b[0]);
 const bossSupports=m.difficulty==='boss'?(locationIndex===6?[{threshold:.7,kind:11,count:1},{threshold:.4,kind:8,count:1}]:[{threshold:.5,kind:8,count:2}]):undefined;
 return {...m,locationIndex,runtime:{id:m.id,name:m.title,subtitle:m.location,note:m.premise,theme:themes[locationIndex],base:500,income:TUNING[m.difficulty].income,hpScale:TUNING[m.difficulty].hp,dmgScale:TUNING[m.difficulty].dmg,homeHP:seconds?100:300,spawnX:seconds?700:1050,waves,objective,groups:groups.length,bossSupports}};
}));
export const missionById=(id:string)=>MISSIONS.find(m=>m.id===id);
export const MISSION_SAVE_KEY='kamisu.missions.progress.v1';
export type MissionProgress={version:1;cleared:string[]};
export function decodeMissions(raw:string|null):MissionProgress{try{const p=JSON.parse(raw??'null');if(p?.version===1&&Array.isArray(p.cleared))return{version:1,cleared:[...new Set<string>(p.cleared.filter((id:unknown)=>typeof id==='string'&&!!missionById(id)))]};}catch{}return{version:1,cleared:[]};}
export function rewardMission(p:MissionProgress,id:string){if(!missionById(id)||p.cleared.includes(id))return false;p.cleared.push(id);return true;}
