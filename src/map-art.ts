import {STAGES} from './defense.ts';
import {LANDMARKS} from './local-walk.ts';
import {MISSION_LOCATIONS,PLACE_LOCATIONS} from './mission-locations.ts';
import {MISSIONS} from './missions.ts';
import {APPROVED_ART} from './defense-assets.ts';
/** The one illustrated map: 3 stages (01-03) plus 7 places (each with 6 missions and a Kiki & Nene story). */
export function artMap(o:{cleared:number[];ready:boolean;missionCleared:string[];stage?:number;place?:number}){
 const stages=STAGES.map((stage,i)=>`<button data-point="${i}" style="left:${MISSION_LOCATIONS[i].x}%;top:${MISSION_LOCATIONS[i].y}%" class="mission-point ${o.cleared.includes(i)?'cleared':''} ${o.stage===i?'selected':''}" aria-label="${stage.name}・${o.cleared.includes(i)?'クリア済み':'未クリア'}の詳細" aria-pressed="${o.stage===i}" ${!o.ready?'disabled':''}><b>${o.cleared.includes(i)?'✓':String(i+1).padStart(2,'0')}</b><span>${stage.name}</span></button>`).join('');
 const places=LANDMARKS.map((l,i)=>{const done=MISSIONS.filter(m=>m.locationIndex===i&&o.missionCleared.includes(m.id)).length,all=done===6;return `<button data-landmark="${i}" style="left:${PLACE_LOCATIONS[i].x}%;top:${PLACE_LOCATIONS[i].y}%" class="mission-point place-point place-${l.id} ${all?'cleared':''} ${o.place===i?'selected':''}" aria-label="${l.name}・6つの作戦のうち${done}つクリア" aria-pressed="${o.place===i}" ${!o.ready?'disabled':''}><b>${all?'✓':done+'/6'}</b><span>${l.name}</span></button>`;}).join('');
 return `<div class="map-art"><img src="${APPROVED_ART.map}" alt="港、川、田畑とまちを描いた神栖の冒険マップ">${stages}${places}</div>`;
}
