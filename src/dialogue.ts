import {BANTER} from './cat-stories.ts';
export const EMOTIONS=['normal','smile','sleepy','yawn','surprised'] as const;
export type Emotion=typeof EMOTIONS[number];
export type Speaker='kiki'|'nene';
export type TalkFace={speaker:Speaker,emotion:Emotion};
export function emotionOrNormal(value:unknown):Emotion{return EMOTIONS.includes(value as Emotion)?value as Emotion:'normal';}
const pair=(kiki:Emotion='normal',nene:Emotion='normal'):TalkFace[]=>[{speaker:'kiki',emotion:kiki},{speaker:'nene',emotion:nene}];
export const STORY_FACES:Record<string,{intro:TalkFace[],result:TalkFace[]}>=Object.fromEntries(([
 ['木陰の風鈴便り','normal','normal','smile','smile'],
 ['葉っぱのしおり','normal','normal','surprised','smile'],
 ['小さな休憩便','normal','sleepy','smile','yawn'],
 ['猫たちの色あそび','normal','normal','smile','smile'],
 ['しっぽ色のリボン','normal','normal','smile','smile'],
 ['まるい雲のお話','normal','normal','surprised','smile'],
 ['猫の配達チャレンジ','normal','normal','smile','smile'],
 ['猫の図書便','normal','normal','smile','normal'],
 ['地図の小さな印','normal','normal','smile','normal'],
 ['潮風の色さがし','normal','normal','surprised','smile'],
 ['風の色えんぴつ','normal','normal','smile','surprised'],
 ['潮風の絵はがき','normal','normal','smile','smile'],
 ['芝生のピクニック','normal','normal','smile','smile'],
 ['木陰の配達','normal','normal','smile','sleepy'],
 ['丘を見ながらひと休み','sleepy','normal','yawn','sleepy'],
 ['猫のリレー応援','normal','normal','smile','smile'],
 ['猫の応援リズム','normal','normal','smile','smile'],
 ['旗の忘れ物チェック','normal','normal','surprised','smile'],
 ['地上の港さんぽ','normal','normal','sleepy','yawn'],
 ['地上からの船くらべ','normal','normal','surprised','smile'],
 ['潮風の休憩便','normal','normal','smile','sleepy']
] as const).map(([title,k,n,kr,nr])=>[title,{intro:pair(k,n),result:pair(kr,nr)}]));
const banterMoods={start:[pair('smile','normal'),pair('smile','normal'),pair('normal','normal'),pair('smile','normal')],win:[pair('smile','smile'),pair('smile','smile'),pair('surprised','smile'),pair('smile','smile')],lose:[pair('sleepy','normal'),pair('normal','smile'),pair('surprised','normal')]} as const;
export const BANTER_FACES:Record<string,TalkFace[]>=Object.fromEntries((['start','win','lose'] as const).flatMap(kind=>BANTER[kind].map((text,i)=>[text,banterMoods[kind][i]])));
export function storyFaces(title:string,completed:boolean){const story=STORY_FACES[title];return story?(completed?story.result:story.intro):pair();}
export function banterFaces(text:string){return BANTER_FACES[text]??pair();}
const labels:Record<Emotion,string>={normal:'通常',smile:'笑顔',sleepy:'眠そう',yawn:'あくび',surprised:'驚き'};
export function faceHTML(face:TalkFace,base='./'){const speaker=face.speaker==='nene'?'nene':'kiki',emotion=emotionOrNormal(face.emotion),name=speaker==='kiki'?'キキ':'ネネ';return `<figure class="talk-face" data-speaker="${speaker}" data-emotion="${emotion}"><img width="200" height="200" decoding="async" src="${base}defense/expressions/${speaker}-${emotion}.png" alt="${name}（${labels[emotion]}）"><figcaption>${name}</figcaption></figure>`;}
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function banterHTML(text:string,base='./'){const faces=banterFaces(text);return `<div class="banter-dialogue">${faceHTML(faces[0],base)}<p>${escape(text)}</p>${faceHTML(faces[1],base)}</div>`;}
