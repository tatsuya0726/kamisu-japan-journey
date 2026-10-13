import type {State} from './game.ts';
export const SAVE_KEY='komorebi.phaser.comparison.save.v1';
const int=(v:unknown,min:number,max=1e9)=>Number.isInteger(v)&&Number(v)>=min&&Number(v)<=max;
export function decode(raw:string|null):State|null{
  if(!raw)return null;try{const s=JSON.parse(raw);if(s.version!==1||!int(s.day,1)||!int(s.coins,0)||!int(s.energy,0,8)||!int(s.level,1,2)||!int(s.position,0,29)||!int(s.dishes,0)||!int(s.wins,0)||typeof s.night!=='boolean'||!['explore','camp','map','battle'].includes(s.phase))return null;
    if(!Array.isArray(s.bag)||![4,5].includes(s.bag.length)||!s.bag.every((x:unknown)=>int(x,0))||!Array.isArray(s.done)||s.done.length!==2||!s.done.every((x:unknown)=>typeof x==='boolean')||!Array.isArray(s.harvested)||!s.harvested.every((x:unknown)=>int(x,0,29)))return null;
    if(s.phase==='battle'){const m=s.match;if(!m||!int(m.player,0,24)||!int(m.enemy,0,24)||m.player===m.enemy||!int(m.round,1,8)||!int(m.actions,0,3)||!['player','enemy'].includes(m.turn)||typeof m.finished!=='boolean'||typeof m.boosted!=='boolean'||!Array.isArray(m.paint)||m.paint.length!==25||!m.paint.every((x:unknown)=>int(x,0,2)))return null;}
    if(s.bag.length===4)s.bag.push(0);
    return s as State;
  }catch{return null;}
}
export interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void;}
export function save(storage:StorageLike,s:State){storage.setItem(SAVE_KEY,JSON.stringify(s));}
export function reset(storage:StorageLike){storage.removeItem(SAVE_KEY);}
