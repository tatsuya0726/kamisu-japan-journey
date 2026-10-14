/** Evolution: a member's habits (attack / guard / support) decide how they evolve. Pure data + tiny helpers. */
export type Track='fang'|'shell'|'heart';
export type Evo={fang:number;shell:number;heart:number;path:''|Track;tier:0|1|2;ready:''|Track};
export const TRACKS:Track[]=['fang','shell','heart'];
export const T1=3,T2=7;
export type EvoStats={hp:number;atk:number;def:number;mp:number;spd:number};
export const PATH:Record<Track,{mark:string;label:string;hint:string;prefix:[string,string];skills:[string,string];stats:[EvoStats,EvoStats];color:string}>={
 fang:{mark:'牙',label:'攻めの道',hint:'たたかう・攻撃わざ',prefix:['きばの','烈きばの'],skills:['fangstrike','rampage'],stats:[{hp:1,atk:1.1,def:1,mp:0,spd:1},{hp:1.04,atk:1.2,def:1,mp:0,spd:2}],color:'#ff7a59'},
 shell:{mark:'守',label:'守りの道',hint:'ぼうぎょ・守りわざ',prefix:['まもりの','鉄壁の'],skills:['bulwark','shellbash'],stats:[{hp:1.07,atk:1,def:1.12,mp:0,spd:0},{hp:1.14,atk:1,def:1.25,mp:0,spd:0}],color:'#5aaeff'},
 heart:{mark:'癒',label:'支えの道',hint:'回復わざ・どうぐ',prefix:['やさしい','聖なる'],skills:['warmth','bless'],stats:[{hp:1.03,atk:1,def:1.03,mp:3,spd:0},{hp:1.06,atk:1.05,def:1.06,mp:6,spd:0}],color:'#7dffb0'}
};
const NAMES:Record<string,Partial<Record<Track,[string,string]>>>={
 kiki:{fang:['木剣キキ','剣豪キキ'],shell:['ふわもこキキ','鉄壁キキ'],heart:['おさかなキキ','海のキキ']},
 nene:{fang:['つめネネ','女王ネネ'],shell:['ガードネネ','城壁ネネ'],heart:['翼ネネ','天使ネネ']}
};
const ART:Record<string,Partial<Record<Track,string>>>={kiki:{fang:'kiki-sword',heart:'kiki-fish'},nene:{shell:'nene-guard',heart:'nene-wings'}};
export const formName=(id:string,base:string,p:Track,tier:1|2)=>NAMES[id]?.[p]?.[tier-1]??PATH[p].prefix[tier-1]+base;
export const formArt=(id:string,baseArt:string,p:Track)=>ART[id]?.[p]??baseArt;
export const evoOf=(m:{evo?:Evo}):Evo=>m.evo??(m.evo={fang:0,shell:0,heart:0,path:'',tier:0,ready:''});
const NONE:EvoStats={hp:1,atk:1,def:1,mp:0,spd:0};
export const evoStats=(m:{evo?:Evo}):EvoStats=>{const e=m.evo;return e&&e.path&&e.tier?PATH[e.path].stats[e.tier-1]:NONE;};
export function trackAct(m:{evo?:Evo},t:Track){const e=evoOf(m);e[t]++;
 if(e.tier===0&&!e.ready&&e[t]>=T1)e.ready=t;
 if(e.tier===1&&t===e.path&&e[t]>=T2)e.ready=t;}
export type EvoEvent={i:number;before:{name:string;art:string;hp:number;mp:number;atk:number;def:number;spd:number;path:''|Track;tier:number};after:{name:string;art:string;hp:number;mp:number;atk:number;def:number;spd:number;path:Track;tier:number};skill:string};
