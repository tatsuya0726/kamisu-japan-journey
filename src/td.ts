import {menu,page,setStage,stepCard,stepHelp,type MenuPage} from './defense-menu.ts';
import Phaser from 'phaser';
import './td.css';
import {CAT_ART,CAT_TIPS} from './defense-assets.ts';
import {CATS,ENEMIES,STAGES,SAVE_KEY,decodeProgress,fresh,spawn,tick} from './defense.ts';
const $=(id:string)=>document.getElementById(id)!;
const modal=$('modal') as HTMLDialogElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let assist=false,assistIndex=0,tv=false;
try{tv=localStorage.getItem('kamisu.display.tv')==='true';}catch{}
document.documentElement.classList.toggle('tv-safe',tv);
function screen(p:MenuPage){modal.dataset.page=p;show(menu(p,progress.cleared,ready,started,portrait,tv));}
function home(){screen('home');}
function settings(){screen('settings');}
let s=fresh(),progress=decodeProgress(null),started=false,lastResult='playing',ready=false,returnPause=false;
try{progress=decodeProgress(localStorage.getItem(SAVE_KEY));}catch{$('save-note').textContent='保存は利用できません';}
const asset=CAT_ART.url;
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(progress));}catch{$('save-note').textContent='保存できません（このまま遊べます）';}}
function portrait(i:number){return `<span class="portrait cat${i}" style="background-image:url('${asset}')"></span>`;}
$('cards').innerHTML=CATS.map((c,i)=>`<button class="unit-card" data-cat="${i}">${portrait(i)}<span class="unit-name">${c.name}</span><span class="role">${c.role} / ${c.cost}ごはん</span><span class="card-state" id="cat-state-${i}">出撃</span><i id="cat-cd-${i}"></i></button>`).join('');
function show(html:string){if(!modal.open)returnPause=s.paused;s.paused=true;modal.innerHTML=html;if(!modal.open)modal.showModal();}
function map(){screen('map');}
function start(i:number){assist=false;assistIndex=0;s=fresh(i);started=true;lastResult='playing';modal.close();scene.rebuild();$('message').textContent='まずは基本ネコと盾ネコ！ ごはんは時間で増えるよ。';}
function catalog(){screen('catalog');}
function help(){screen('help');}
function renderHUD(){const st=STAGES[s.stage];$('stage-name').textContent=st.name;$('hud').innerHTML=`<div><small>町のHP</small><strong>${Math.ceil(s.home)} <em>/ 650</em></strong></div><div class="food"><small>ごはん +${st.income}/秒</small><strong>${Math.floor(s.food)} <em>/ 400</em></strong></div><div><small>敵アジト</small><strong>${Math.ceil(s.enemyBase)} <em>/ ${st.base}</em></strong></div><div><small>敵の波</small><strong>${s.wave} <em>/ ${st.waves.length}</em></strong></div>`;
 $('pause').textContent=s.paused?'再開':'一時停止';$('pause').toggleAttribute('disabled',!started||s.result!=='playing');$('speed').textContent=`速度 ×${s.speed}`;
 $('assist').textContent=assist?'おまかせ ON':'おまかせ OFF';$('assist').setAttribute('aria-pressed',String(assist));$('timer').textContent=`${Math.floor(s.time)}秒`;
 CATS.forEach((c,i)=>{const blocked=s.units.some(u=>u.side===0&&u.x<153),wait=s.cooldowns[i];const btn=document.querySelector<HTMLButtonElement>(`[data-cat="${i}"]`)!;btn.disabled=!started||s.paused||s.result!=='playing'||wait>0||s.food<c.cost||blocked||s.units.filter(u=>u.side===0).length>=24;$(`cat-state-${i}`).textContent=s.paused?'停止中':wait>0?`${wait.toFixed(1)}秒`:s.food<c.cost?'ごはん待ち':blocked?'出口で準備中':'出撃する';$(`cat-cd-${i}`).style.width=`${wait/c.cd*100}%`;});
}
document.addEventListener('click',e=>{if(e.detail>1)return;const el=(e.target as HTMLElement).closest('button');if(!el)return;if(el.dataset.cat!==undefined){if(spawn(s,Number(el.dataset.cat)))$('message').textContent=`${CATS[Number(el.dataset.cat)].name}、出撃！`;}
 if(el.dataset.stage!==undefined){setStage(Number(el.dataset.stage));screen('team');}if(el.dataset.launch!==undefined)start(Number(el.dataset.launch));if(el.hasAttribute('data-home'))home();if(el.hasAttribute('data-settings'))settings();if(el.hasAttribute('data-tv')){tv=!tv;document.documentElement.classList.toggle('tv-safe',tv);try{localStorage.setItem('kamisu.display.tv',String(tv));}catch{}settings();}if(el.dataset.card){stepCard(Number(el.dataset.card));catalog();}if(el.dataset.helpPage){stepHelp(Number(el.dataset.helpPage));help();}if(el.hasAttribute('data-close')){modal.close();s.paused=returnPause;if(!started)home();}if(el.hasAttribute('data-retry'))start(s.stage);if(el.hasAttribute('data-map'))map();if(el.hasAttribute('data-catalog'))catalog();if(el.hasAttribute('data-help'))help();renderHUD();});
$('pause').onclick=e=>{if(e.detail>1)return;s.paused=!s.paused;renderHUD();};$('speed').onclick=e=>{if(e.detail>1)return;s.speed=s.speed===1?2:1;renderHUD();};$('assist').onclick=e=>{if(e.detail>1)return;assist=!assist;renderHUD();};$('map').onclick=map;$('help').onclick=help;$('catalog').onclick=catalog;$('settings').onclick=settings;$('title').onclick=home;
function back(){if(modal.open){if(page==='home'&&started&&s.result==='playing'){modal.close();s.paused=returnPause;}else home();}else settings();}
modal.addEventListener('cancel',e=>{e.preventDefault();back();});
document.addEventListener('keydown',e=>{if(e.repeat||modal.open)return;if(/^[1-4]$/.test(e.key))document.querySelector<HTMLButtonElement>(`[data-cat="${Number(e.key)-1}"]`)?.click();if(e.key.toLowerCase()==='p')$('pause').click();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&s.result==='playing'){s.paused=true;renderHUD();}});
class DefenseScene extends Phaser.Scene {
 sprites=new Map<number,Phaser.GameObjects.Container>(); bg!:Phaser.GameObjects.Graphics; bars!:Phaser.GameObjects.Graphics; labels:Phaser.GameObjects.Text[]=[]; accumulated=0; previous=performance.now();
 preload(){this.load.image('cats',asset);}
 create(){const texture=this.textures.get('cats');const im=texture.getSourceImage() as HTMLImageElement;const edges=[...CAT_ART.frames.map(f=>f.left),1];for(let i=0;i<4;i++)texture.add(`cat${i}`,0,Math.floor(edges[i]*im.width),0,Math.floor((edges[i+1]-edges[i])*im.width),im.height);this.scale.on('resize',()=>this.fitCamera());this.fitCamera();this.bg=this.add.graphics();this.bars=this.add.graphics().setDepth(100);this.rebuild();ready=true;home();renderHUD();}
 fitCamera(){const w=this.scale.width,h=this.scale.height,zoom=w/1000;this.cameras.main.setZoom(zoom);this.cameras.main.centerOn(500,390-Math.min(390,h/zoom)/2);}
 rebuild(){if(!this.bg)return;for(const c of this.sprites.values())c.destroy();this.sprites.clear();this.labels.forEach(x=>x.destroy());this.labels=[];const g=this.bg;g.clear();const theme=STAGES[s.stage].theme;g.fillStyle(theme==='town'?0xf9d6ac:0xc4e9e5).fillRect(0,0,1000,390);g.fillStyle(0xfff4d7).fillCircle(790,65,34);g.fillStyle(theme==='river'?0x76bda9:0x89bfca).fillRect(0,180,1000,115);
 for(let i=0;i<10;i++){const x=i*112+20;if(theme==='port'){g.fillStyle(0x426b7a).fillRect(x,165,13,70).fillRect(x,165,85,9);g.lineStyle(3,0x426b7a).lineBetween(x+7,165,x+75,225);}else if(theme==='town'){g.fillStyle([0x7ca8ad,0xd58d77,0xe7b973][i%3]).fillRoundedRect(x,130+(i%3)*20,82,115,5);g.fillStyle(0xffecc4);for(let j=0;j<3;j++)g.fillRect(x+10+j*23,158+(i%3)*20,13,23);}else{g.fillStyle(0x67996e).fillEllipse(x,192,190,70);}}
 g.fillStyle(0xacc177).fillRect(0,270,1000,120);g.fillStyle(0xe3c7a0).fillRect(0,307,1000,65);g.lineStyle(3,0xf7e7c9).lineBetween(0,318,1000,318);
 g.fillStyle(0xffefd0).fillRoundedRect(20,216,90,108,8);g.fillStyle(0x287783).fillTriangle(10,225,65,179,120,225);g.fillStyle(0xa57253).fillRoundedRect(47,273,31,52,6);g.fillStyle(0x424153).fillRoundedRect(890,225,90,99,7);g.fillStyle(0x735d77).fillTriangle(880,232,935,197,990,232);g.fillStyle(0xf5c76a).fillRect(908,249,18,22).fillRect(946,249,18,22);
 this.labels.push(this.add.text(65,350,'ねこの町',{fontSize:'18px',color:'#23434b',fontStyle:'bold'}).setOrigin(.5),this.add.text(935,350,'悪党アジト',{fontSize:'18px',color:'#4c354b',fontStyle:'bold'}).setOrigin(.5));}
 enemy(kind:number){const c=this.add.container(0,0),g=this.add.graphics();const color=[0x9d547a,0x595f88,0x383b50][kind];g.fillStyle(color).fillRoundedRect(-19,-51,38,40,7);g.fillStyle(0x272a40).fillRect(-18,-17,12,18).fillRect(6,-17,12,18);g.fillStyle(0xf0bd91).fillCircle(0,-62,20);g.fillStyle(0x262539).fillRoundedRect(-19,-70,38,9,3);g.fillStyle(0xffffff).fillRect(-7,-50,14,4);if(kind===1)g.fillStyle(0x3d354e).fillRect(-26,-83,52,7).fillRect(-16,-98,32,20);else if(kind===0)g.fillStyle(0x442f42).fillTriangle(-17,-77,0,-99,16,-77);else g.fillStyle(0xe8d8aa).fillTriangle(-6,-44,6,-44,0,-21);g.fillStyle(0xf0bd91).fillCircle(-25,-28,9);c.add(g);return c;}
 update(_t:number,delta:number){if(!ready)return;const now=performance.now(),elapsed=Math.min((now-this.previous)/1000,.25);this.previous=now;if(started&&!modal.open){tick(s,elapsed);if(assist&&spawn(s,[1,2,0,3,0][assistIndex%5]))assistIndex++;}const ids=new Set(s.units.map(u=>u.id));for(const [id,c] of this.sprites)if(!ids.has(id)){this.sprites.delete(id);if(reduced)c.destroy();else this.tweens.add({targets:c,alpha:0,y:c.y-24,duration:220,onComplete:()=>c.destroy()});}this.bars.clear();for(const u of s.units){let c=this.sprites.get(u.id);if(!c){if(u.side===0){const pic=this.add.image(0,0,'cats',`cat${u.kind}`).setOrigin(.5,1);pic.setScale(Math.min(78/pic.width,96/pic.height));c=this.add.container(0,0,[pic]);}else c=this.enemy(u.kind);this.sprites.set(u.id,c);}c.setPosition(u.x,326+(u.id%3)*4+(s.paused||reduced?0:Math.sin(s.time*9+u.id)*2));c.setDepth(10+u.id%3);c.setScale(u.flash>0&&!reduced?1.08:1);this.bars.fillStyle(0x253d46,.75).fillRoundedRect(u.x-24,219,48,5,2);this.bars.fillStyle(u.side===0?0x319c8d:0xd26079).fillRoundedRect(u.x-24,219,48*u.hp/u.max,5,2);}
 this.bars.fillStyle(0x173944).fillRect(18,160,95,9).fillRect(886,160,95,9);this.bars.fillStyle(0x4fbba4).fillRect(18,160,95*s.home/650,9);this.bars.fillStyle(0xda6885).fillRect(886,160,95*s.enemyBase/STAGES[s.stage].base,9);
 this.accumulated+=elapsed*1000;if(this.accumulated>100){renderHUD();this.accumulated=0;}
 if(s.home<200&&s.result==='playing')$("message").textContent='町のHPがピンチ！ 盾ネコで前線を守ろう。';if(s.result!==lastResult){lastResult=s.result;if(s.result==='win'){progress.cleared=[...new Set([...progress.cleared,s.stage])];save();}modal.dataset.page='result';show(`<span class="eyebrow">${s.result==='win'?'MISSION CLEAR':'TRY AGAIN'}</span><h2>${s.result==='win'?'神栖を守った！！':'もう一度、作戦を立てよう！'}</h2><p>${s.result==='win'?'猫たちのチームワークで悪党は退散！':'盾ネコで前線を支えて、遠距離ネコを後ろから。'}</p><p>${STAGES[s.stage].name} / ${Math.floor(s.time)}秒 / 追い返した敵 ${s.kills}人</p><button data-retry>同じ作戦でもう一度</button>${s.result==='win'&&s.stage<2?`<button data-stage="${s.stage+1}">次の作戦へ</button>`:''}<button data-map>作戦マップへ</button><p class="fine">${STAGES[s.stage].note}</p>`);}}
}
const scene=new DefenseScene();new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1000,height:390,backgroundColor:'#c4e9e5',scene:[scene],scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},input:{touch:{capture:false}},audio:{noAudio:true}});

function focusStep(direction:number){const root=modal.open?modal:document;const buttons=Array.from(root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')).filter(b=>b.getClientRects().length>0);if(!buttons.length)return;const current=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[(current+direction+buttons.length)%buttons.length].focus({preventScroll:true});}
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();focusStep(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1);}});
let previousPadButtons:boolean[]=[],padDirection=0,padRepeat=0;
function pollPad(time:number){const pad=Array.from(navigator.getGamepads?.()??[]).find(p=>p?.connected);const label=document.getElementById('pad-status');if(label)label.textContent=pad?'ゲームパッド接続中 / 標準配置':'ゲームパッド未接続 / キーボードも使えます';if(pad){const pressed=pad.buttons.map(b=>b.pressed);const direction=pressed[14]||pressed[12]||pad.axes[0]<-.55||pad.axes[1]<-.55?-1:pressed[15]||pressed[13]||pad.axes[0]>.55||pad.axes[1]>.55?1:0;if(direction&&(direction!==padDirection||time>padRepeat)){focusStep(direction);padRepeat=time+250;}padDirection=direction;if(pressed[0]&&!previousPadButtons[0]){const active=document.activeElement;if(active instanceof HTMLButtonElement&&!active.disabled)active.click();else focusStep(1);}if(pressed[1]&&!previousPadButtons[1])back();previousPadButtons=pressed;}else{previousPadButtons=[];padDirection=0;}requestAnimationFrame(pollPad);}
requestAnimationFrame(pollPad);

import './defense-screen.css';
