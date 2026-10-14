import {MISSIONS,missionById} from './missions.ts';
import {LANDMARKS,walkMenu} from './local-walk.ts';
import {faceHTML,type Emotion} from './dialogue.ts';
let place=0,selected='';
export function selectMissionPlace(i:number){if(LANDMARKS[i]){place=i;selected='';}}
export function selectExtraMission(id:string){const m=missionById(id);if(m){place=m.locationIndex;selected=id;}}
export function missionDialogue(lines:{speaker:string;emotion:string;text:string}[]){return `<div class="mission-conversation">${lines.map(l=>`<div>${faceHTML({speaker:l.speaker==='キキ'?'kiki':'nene',emotion:l.emotion as Emotion},import.meta.env.BASE_URL)}<p>${l.text}</p></div>`).join('')}</div>`;}
export function missionMenu(cleared:string[]){const location=LANDMARKS[place],m=missionById(selected),list=MISSIONS.filter(x=>x.locationIndex===place);
 const body=m?`<small>架空のゲーム事件 / ${difficulty(m.difficulty)}</small><h3>${m.title}</h3><p>${m.premise}</p><p class="mission-goal">目標：${m.objective}</p><small>登場：${m.enemy_ids.map(id=>enemyName(id)).join('・')}</small>${missionDialogue(m.introduction)}<button data-mission-place="${place}">6つの作戦から選び直す</button>`:`<small>ここだけの架空ミッション / ${list.filter(x=>cleared.includes(x.id)).length} / 6 クリア</small><h3>${location.name}</h3><div class="mission-picks">${list.map((m,i)=>`<button data-extra-mission="${m.id}"><b>${cleared.includes(m.id)?'✓':String(i+1).padStart(2,'0')}</b><span>${m.title}<small>${difficulty(m.difficulty)}</small></span></button>`).join('')}</div><button data-open-visit="${place}">キキとネネの小話を読む</button>`;
 const panel=`<section class="mission-detail extra-mission-detail" aria-label="地点の作戦"><div class="detail-copy">${body}<small class="fiction-note">実在の施設の事故や出来事ではなく、創作のお話です。</small></div>${m?`<button data-launch-mission="${m.id}" class="primary">この作戦に出撃 →</button>`:''}</section>`;
 return walkMenu(false).replace('</div></div><nav class="menu-nav">',`</div>${panel}</div><nav class="menu-nav">`);
}
import {pack} from './missions.ts';
function enemyName(id:string){return pack.enemies.find(e=>e.id===id)?.name??id;}
function difficulty(value:string){return({easy:'やさしい',normal:'ふつう',hard:'手ごたえ',boss:'大きな相手'} as Record<string,string>)[value]??value;}
