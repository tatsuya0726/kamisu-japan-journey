import {menu,page,setStage,stepCard,stepHelp,type MenuPage} from './defense-menu.ts';
import Phaser from 'phaser';
import './td.css';
import {CAT_SPRITES,APPROVED_ART} from './defense-assets.ts';
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

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(progress));}catch{$('save-note').textContent='保存できません（このまま遊べます）';}}
function portrait(i:number){return `<img class="portrait approved-portrait" src="${import.meta.env.BASE_URL}defense/approved/${CAT_SPRITES[i]}.png" alt="${CATS[i].name}">`;}
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
 sprites=new Map<number,Phaser.GameObjects.Container>(); bg!:Phaser.GameObjects.Graphics; bars!:Phaser.GameObjects.Graphics; labels:Phaser.GameObjects.Text[]=[]; scenery:Phaser.GameObjects.Image[]=[]; accumulated=0; previous=performance.now();
 preload(){for(const key of CAT_SPRITES)this.load.image(key,`${import.meta.env.BASE_URL}defense/approved/${key}.png`);for(const key of ['port','coast','town','home-base','rival-base'])this.load.image(key,`${import.meta.env.BASE_URL}defense/approved/${key}.png`);for(let i=0;i<4;i++)this.load.image('enemy'+i,`${import.meta.env.BASE_URL}defense/approved/enemy${i}.png`);}
 create(){this.scale.on('resize',()=>this.fitCamera());this.fitCamera();this.bg=this.add.graphics();this.bars=this.add.graphics().setDepth(100);this.rebuild();ready=true;home();renderHUD();}
 fitCamera(){const w=this.scale.width,h=this.scale.height,zoom=w/1000;this.cameras.main.setZoom(zoom);this.cameras.main.centerOn(500,390-Math.min(390,h/zoom)/2);}
 rebuild(){if(!this.bg)return;for(const c of this.sprites.values())c.destroy();this.sprites.clear();this.labels.forEach(x=>x.destroy());this.labels=[];this.scenery.forEach(x=>x.destroy());this.scenery=[];this.bg.clear();
 const backdrop=this.add.image(500,475,STAGES[s.stage].theme).setOrigin(.5,1).setDepth(-10);backdrop.setScale(1000/backdrop.width);this.scenery.push(backdrop);
 // Whole original images; anchors account for transparent margins, preserving building proportions.
 for(const [key,x,foot] of [['home-base',65,.904],['rival-base',935,.836]] as const){const base=this.add.image(x,332,key).setOrigin(.5,foot).setDepth(2);base.setScale(148/base.width);this.scenery.push(base);}
 this.labels.push(this.add.text(65,350,'ねこの町',{fontSize:'18px',color:'#fff2d5',backgroundColor:'#173944',padding:{x:6,y:3},fontStyle:'bold'}).setOrigin(.5),this.add.text(935,350,'悪党アジト',{fontSize:'18px',color:'#fff2d5',backgroundColor:'#4c354b',padding:{x:6,y:3},fontStyle:'bold'}).setOrigin(.5));}

 enemy(kind:number,id:number){const index=kind===2?3:kind===1?2:id%2;const pic=this.add.image(0,0,'enemy'+index).setOrigin(.5,1);pic.setScale(Math.min(76/pic.width,(kind===2?112:100)/pic.height));return this.add.container(0,0,[pic]);}
 update(_t:number,delta:number){if(!ready)return;const now=performance.now(),elapsed=Math.min((now-this.previous)/1000,.25);this.previous=now;if(started&&!modal.open){tick(s,elapsed);if(assist&&spawn(s,[1,2,0,3,0][assistIndex%5]))assistIndex++;}const ids=new Set(s.units.map(u=>u.id));for(const [id,c] of this.sprites)if(!ids.has(id)){this.sprites.delete(id);if(reduced)c.destroy();else this.tweens.add({targets:c,alpha:0,y:c.y-24,duration:220,onComplete:()=>c.destroy()});}this.bars.clear();for(const u of s.units){let c=this.sprites.get(u.id);if(!c){if(u.side===0){const pic=this.add.image(0,0,CAT_SPRITES[u.kind]).setOrigin(.5,1);pic.setScale(Math.min(78/pic.width,96/pic.height));c=this.add.container(0,0,[pic]);}else c=this.enemy(u.kind,u.id);this.sprites.set(u.id,c);}c.setPosition(u.x,326+(u.id%3)*4+(s.paused||reduced?0:Math.sin(s.time*9+u.id)*2));c.setDepth(10+u.id%3);c.setScale(u.flash>0&&!reduced?1.08:1);this.bars.fillStyle(0x253d46,.75).fillRoundedRect(u.x-24,219,48,5,2);this.bars.fillStyle(u.side===0?0x319c8d:0xd26079).fillRoundedRect(u.x-24,219,48*u.hp/u.max,5,2);}
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
