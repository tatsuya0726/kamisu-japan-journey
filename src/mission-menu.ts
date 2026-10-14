import {MISSIONS,missionById} from './missions.ts';
import {LANDMARKS,selectLandmark,visitState} from './local-walk.ts';
import {faceHTML,storyFaces,type Emotion} from './dialogue.ts';
let place=0,selected='';
export function selectMissionPlace(i:number){if(LANDMARKS[i]){place=i;selected='';if(visitState().index!==i)selectLandmark(i);}}
export const currentPlace=()=>place;
export function selectExtraMission(id:string){const m=missionById(id);if(m){place=m.locationIndex;selected=id;if(visitState().index!==place)selectLandmark(place);}}
export function missionDialogue(lines:{speaker:string;emotion:string;text:string}[]){return `<div class="mission-conversation">${lines.map(l=>`<div>${faceHTML({speaker:l.speaker==='キキ'?'kiki':'nene',emotion:l.emotion as Emotion},import.meta.env.BASE_URL)}<p>${l.text}</p></div>`).join('')}</div>`;}
export function missionMenu(cleared:string[]){const location=LANDMARKS[place],m=missionById(selected),list=MISSIONS.filter(x=>x.locationIndex===place);
 const body=m?`<small>架空のゲーム事件 / ${difficulty(m.difficulty)}</small><h3>${m.title}</h3><p>${m.premise}</p><p class="mission-goal">目標：${m.objective}</p><small>登場：${m.enemy_ids.map(id=>enemyName(id)).join('・')}</small>${missionDialogue(m.introduction)}<button data-mission-place="${place}">6つの作戦から選び直す</button>`:`<small>ここだけの架空ミッション / ${list.filter(x=>cleared.includes(x.id)).length} / 6 クリア</small><h3>${location.name}</h3><div class="mission-picks">${list.map((m,i)=>`<button data-extra-mission="${m.id}"><b>${cleared.includes(m.id)?'✓':String(i+1).padStart(2,'0')}</b><span>${m.title}<small>${difficulty(m.difficulty)}</small></span></button>`).join('')}</div>${walkStory()}`;
 const panel=`<section class="mission-detail extra-mission-detail" aria-label="地点の作戦"><div class="detail-copy">${body}<small class="fiction-note">実在の施設の事故や出来事ではなく、創作のお話です。</small></div>${m?`<button data-launch-mission="${m.id}" class="primary">この作戦に出撃 →</button>`:''}</section>`;
 return panel;
}
/** Kiki & Nene's small walk story for the selected place, shown inside the place panel. */
function walkStory(){const v=visitState(),faces=storyFaces(v.story.title,v.completed).map(f=>faceHTML(f,import.meta.env.BASE_URL)).join('');
 return `<div class="location-event"><small>キキとネネのまち歩き / ${v.story.title}</small><div class="map-visit-row"><div class="map-visit-faces">${faces}</div>${v.completed?`<p role="status">${v.story.result}</p>`:`<button data-map-visit>${v.story.action}</button>`}</div>${v.completed&&v.more?'<button data-another-visit class="quiet">もうひとつのお話</button>':''}</div>`;
}
import {pack} from './missions.ts';
function enemyName(id:string){return pack.enemies.find(e=>e.id===id)?.name??id;}
function difficulty(value:string){return({easy:'やさしい',normal:'ふつう',hard:'手ごたえ',boss:'大きな相手'} as Record<string,string>)[value]??value;}
