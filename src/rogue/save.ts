import type {RunState} from './engine.ts';
export const RUN_KEY='kamisu.rogue.run.v1',BEST_KEY='kamisu.rogue.best.v1';
export type Best={v:1;runs:number;clears:number;bestDays:number};
const store=()=>{try{return localStorage;}catch{return undefined;}};
export function decodeRun(raw:string|null):RunState|null{try{const r=JSON.parse(raw??'null');if(r&&r.v===1&&Array.isArray(r.party)&&r.party.length&&Array.isArray(r.nodes)&&r.nodes.length===7&&typeof r.chapter==='number'&&r.chapter>=1&&r.chapter<=3&&typeof r.rng==='number'&&r.phase!=='over'&&r.phase!=='clear')return r as RunState;}catch{}return null;}
export function loadRun(){try{return decodeRun(store()?.getItem(RUN_KEY)??null);}catch{return null;}}
export function saveRun(run:RunState){try{store()?.setItem(RUN_KEY,JSON.stringify(run));}catch{}}
export function clearRun(){try{store()?.removeItem(RUN_KEY);}catch{}}
export const hasSavedRun=()=>!!loadRun();
export function decodeBest(raw:string|null):Best{try{const b=JSON.parse(raw??'null');if(b&&b.v===1)return {v:1,runs:Math.max(0,b.runs|0),clears:Math.max(0,b.clears|0),bestDays:Math.max(0,b.bestDays|0)};}catch{}return {v:1,runs:0,clears:0,bestDays:0};}
export function loadBest(){try{return decodeBest(store()?.getItem(BEST_KEY)??null);}catch{return decodeBest(null);}}
export function recordResult(run:RunState,cleared:boolean){const b=loadBest();b.runs++;if(cleared)b.clears++;b.bestDays=Math.max(b.bestDays,(run.chapter-1)*7+run.day);try{store()?.setItem(BEST_KEY,JSON.stringify(b));}catch{}return b;}
