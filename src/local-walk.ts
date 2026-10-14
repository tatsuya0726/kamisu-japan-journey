import {pickStory,EXTRA_STORIES,type CatStory} from './cat-stories.ts';
export const LANDMARKS=[
 {id:'ikisu',name:'息栖神社',lat:35.8858061,lon:140.6251283,address:'神栖市息栖2882',source:'https://www.city.kamisu.ibaraki.jp/kanko_sports/culture/1002532/1002533.html',background:'ikisu',title:'木陰の風鈴便り',action:'風鈴を届ける',result:'キキとネネが風鈴を届けた。木陰にやさしい音が広がり、猫たちは耳をすませた。'},
 {id:'ishigami',name:'石神幼稚園',lat:35.869098740645775,lon:140.65128878125168,address:'神栖市石神773-1',source:'https://www.city.kamisu.ibaraki.jp/shisei/p_facility/1002954/1003005.html',background:'ishigami',title:'まるい雲のお話',action:'雲の形を見つける',result:'ネネ「お魚みたいな雲だね」 キキ「ぼくにはおにぎり！」。猫たちは空を見上げて笑った。'},
 {id:'karuno',name:'軽野小学校',lat:35.87191364533871,lon:140.66741874413407,address:'神栖市知手2-2',source:'https://www.city.kamisu.ibaraki.jp/kodomo/shotyuko/1001689/1001691.html',background:'karuno',title:'猫の配達チャレンジ',action:'本の包みを届ける',result:'キキが包みを数え、ネネが荷車を押した。全部届けられて、猫たちはにっこり。'},
 {id:'gallery',name:'1000人画廊',lat:35.8950169,lon:140.7264673,address:'神栖市南浜の護岸',source:'https://www.city.kamisu.ibaraki.jp/kanko_sports/ss_facility/1002393/1002408/1002413.html',background:'gallery',title:'潮風の色さがし',action:'好きな色を見つける',result:'キキは海の青、ネネは夕日の金色を見つけた。自分たちの小さな絵のアイデアができた。'},
 {id:'central',name:'神栖中央公園',lat:35.89783004245183,lon:140.65003,address:'神栖市木崎',source:'https://www.city.kamisu.ibaraki.jp/living/park/1001129/1004215.html',background:'central-park',title:'芝生のピクニック',action:'お弁当を分ける',result:'キキとネネが猫仲間にお弁当を配った。みんな同じ数で、木陰のピクニックが始まった。'},
 {id:'arena',name:'かみす防災アリーナ',lat:35.8988744,lon:140.6499851,address:'神栖市木崎1219-7',source:'https://www.kamisu-arena.com/access/',background:'arena',title:'猫のリレー応援',action:'応援旗をそろえる',result:'ネネが色をそろえ、キキが旗を運んだ。猫たちだけの創作リレー大会を元気に応援！'},
 {id:'portpark',name:'港公園',lat:35.91397755742545,lon:140.67161455102993,address:'神栖市東深芝',source:'https://www.city.kamisu.ibaraki.jp/kanko_sports/ss_facility/1002393/1002401/1002403.html',background:'port-park',title:'地上の港さんぽ',action:'木陰から船を眺める',result:'公園の地上でひと休み。キキとネネは港を行く船を数えた。展望塔には入らず、木陰でのんびり。'}
];
let selected=0,completed=false;let activeStory:CatStory=LANDMARKS[0];const visited=new Set<number>();
export function selectLandmark(i:number){if(Number.isInteger(i)&&LANDMARKS[i]){selected=i;completed=false;const place=LANDMARKS[i];activeStory=pickStory('place:'+place.id,[place,...EXTRA_STORIES[place.id]]);}}
export function anotherVisit(){selectLandmark(selected);}
export const storyCount=(i:number)=>1+(EXTRA_STORIES[LANDMARKS[i].id]?.length??0);
export function visitState(){return {index:selected,place:LANDMARKS[selected],story:activeStory,completed,more:storyCount(selected)>1};}
export function finishVisit(){if(!completed){completed=true;visited.add(selected);}}
