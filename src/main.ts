import Phaser from 'phaser';
import './style.css';
import {WorldScene} from './scenes/WorldScene.ts';
import {apply,newGame,pathTo} from './systems/game.ts';
import type {Action,State} from './systems/game.ts';
import {decode,save,reset,SAVE_KEY} from './systems/save.ts';
import {HUD} from './ui/hud.ts';
let raw:string|null=null,storageAvailable=true;try{raw=localStorage.getItem(SAVE_KEY);}catch{storageAvailable=false;}
let state:State=decode(raw)??newGame(),corrupt=!!raw&&!decode(raw),busy=false,started=false,ready=false;
const legacy=!!raw&&decode(raw)?.chapter!==2;
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hud=new HUD(),modal=document.querySelector<HTMLDialogElement>('#modal')!;
const scene=new WorldScene({state:()=>state,dispatch:a=>void dispatch(a),travel:t=>void travel(t),reduced:()=>reduced,ready:()=>{ready=true;document.querySelector('#loading')?.remove();hud.render(state,false);showWelcome();}});
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:640,pixelArt:true,roundPixels:true,backgroundColor:'#a6b87c',scene:[scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{touch:{capture:false}},render:{antialias:false},audio:{noAudio:true}});
function persist(){if(corrupt)return;try{if(legacy&&!localStorage.getItem(SAVE_KEY+'.before-kamisu'))localStorage.setItem(SAVE_KEY+'.before-kamisu',raw!);state.chapter=2;save(localStorage,state);hud.saveStatus('✓ 自動保存');}catch{storageAvailable=false;hud.saveStatus('保存できません');}}
async function dispatch(action:Action,internal=false){
  if(!ready||!started||busy||modal.open&&!internal||corrupt)return;
  const before=state,outcome=apply(state,action);hud.message(outcome.message);if(!outcome.ok)return;
  busy=true;state=outcome.state;persist();hud.render(state,true);
  if(before.phase!==state.phase||before.level!==state.level||action.type==='battle')scene.redraw();
  await scene.animate(outcome.effects);busy=false;hud.render(state,false);
  if(state.phase==='battle'&&state.match?.turn==='enemy'&&!state.match.finished){await new Promise(r=>setTimeout(r,reduced?50:480));if(!modal.open)void dispatch({type:'enemy'},true);}
}
async function travel(tile:number){if(busy||modal.open||!started||state.phase!=='explore')return;const route=pathTo(state.position,tile);if(!route.length){if(tile===state.position)hud.message('ここにいるよ。下のボタンでお手伝いや会話ができます。');else hud.message('湖は歩けないよ。岸の道を選ぼう。');return;}for(const step of route){if(modal.open||state.phase!=='explore')break;await dispatch({type:'move',tile:step});}}
function direction(dir:string){if(busy||modal.open||!started)return;const columns=state.phase==='battle'?5:6,at=state.phase==='battle'?state.match!.player:state.position;const x=at%columns+({left:-1,right:1}[dir]??0),y=Math.floor(at/columns)+({up:-1,down:1}[dir]??0);if(x<0||x>=columns||y<0||y>=5)return;if(state.phase==='explore')void dispatch({type:'move',tile:y*columns+x});else if(state.phase==='battle')void dispatch({type:'battleMove',tile:y*columns+x});}
document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;const dir=({ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'} as Record<string,string>)[e.key];if(dir&&!modal.open){e.preventDefault();direction(dir);}if((e.code==='Space'||e.key==='Enter')&&!modal.open&&e.target===document.body){e.preventDefault();void dispatch({type:'interact'});}});
document.addEventListener('click',e=>{const target=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!target||target.disabled)return;
  if(target.dataset.dir){direction(target.dataset.dir);return;}const a=target.dataset.action;if(!a)return;
  if(a.startsWith('tab:')){hud.shopTab=a.slice(4);hud.render(state,busy);return;}
  if(a.startsWith('buy:')||a.startsWith('sell:')){void dispatch({type:'trade',item:Number(a.split(':')[1]),buy:a.startsWith('buy:')});return;}
  if(a==='start'){modal.close();started=true;persist();hud.message(raw?'前回の旅のつづき。あなたのペースで歩こう。':'神栖へようこそ！ 左のピーマン畑でお手伝いして、こはるに届けよう。');if(state.match?.turn==='enemy'&&state.phase==='battle'&&!state.match.finished)void dispatch({type:'enemy'},true);return;}
  if(a==='close'){modal.close();if(started&&state.phase==='battle'&&state.match?.turn==='enemy'&&!state.match.finished)void dispatch({type:'enemy'},true);return;}
  if(a==='restore-reset'){try{const previous=decode(localStorage.getItem(SAVE_KEY+'.before-reset'));if(previous){state=previous;corrupt=false;started=true;modal.close();scene.redraw();hud.render(state,false);persist();hud.message('リセット前の記録に戻りました。');}}catch{hud.message('記録を復元できませんでした。');}return;}
  if(a==='reset'){showReset();return;}if(a==='reset-confirm'){try{localStorage.setItem(SAVE_KEY+'.before-reset',JSON.stringify(state));reset(localStorage);}catch{hud.message('記録の控えを残せないため、リセットしませんでした。');return;}state=newGame();corrupt=false;raw=null;started=true;modal.close();scene.redraw();hud.render(state,false);persist();hud.message('新しい旅のはじまり。茨城の恵みを探そう！');return;}
  if(a==='motion'){reduced=!reduced;scene.redraw();showMenu();return;}
  void dispatch({type:a} as Action);
});
document.querySelector('#menu-open')!.addEventListener('click',showMenu);
modal.addEventListener('cancel',e=>{if(!started)e.preventDefault();});
modal.addEventListener('close',()=>{if(started&&state.phase==='battle'&&state.match?.turn==='enemy'&&!state.match.finished)void dispatch({type:'enemy'},true);});
function show(html:string){modal.innerHTML=html;if(!modal.open)modal.showModal();modal.querySelector<HTMLButtonElement>('button')?.focus();}
function showWelcome(){show(`<span class="section-kicker">KOMOREBI / GAME STUDIO EDITION</span><h1>港から、日本の旅へ。</h1><p>神栖のしおかぜ港から、小さな日本旅。<br>昼はお手伝い、夜は拠点づくり。<br>旗取り広場で、みんなと腕くらべ。</p><div class="intro-art"><img src="${import.meta.env.BASE_URL}assets/cottage.svg" alt="ピクセルの小屋"><img src="${import.meta.env.BASE_URL}assets/tree.svg" alt=""></div><p class="muted">クリック・タップで目的地へ。矢印 / WASD でも移動できます。<br>記録はこのブラウザーに自動保存します。</p>${legacy?'<p class="muted">神栖の港を旅の拠点に追加しました。持ち物・依頼の達成・小屋・対戦は引き継ぎ、現在地から再開します。以前の記録も控えとして残します。</p>':''}${corrupt?'<p class="error">記録を読み込めませんでした。元の記録は保護しています。明示リセットで新しい旅を始められます。</p>':`<button data-action="start" class="primary">${raw?'旅のつづき':'旅をはじめる'}</button>`}<button data-action="reset" class="quiet">記録をリセット</button>${!storageAvailable?'<p class="error">ブラウザーの保存領域が使えません。記録が残らない場合があります。</p>':''}`);}
function hasResetBackup(){try{return !!decode(localStorage.getItem(SAVE_KEY+'.before-reset'));}catch{return false;}}
function showMenu(){show(`<span class="section-kicker">旅の記録と設定</span><h1>ひと息つこう。</h1><p>${state.day}日目 / 拠点 Lv.${state.level} / ${state.coins}コイン<br>このブラウザーだけの記録です。Unity版とは別に保存します。</p><button data-action="motion">動きを控えめに：${reduced?'オン':'オフ'}</button><button data-action="reset" class="quiet">記録をリセット</button><button data-action="restore-reset" ${hasResetBackup()?'':'disabled'}>リセット前の記録に戻す</button><button data-action="close" class="primary">旅にもどる</button>`);}
function showReset(){show(`<span class="section-kicker">記録のリセット</span><h1>最初の日に戻りますか？</h1><p>この比較版の所持品・依頼・小屋・対戦記録を消します。直前の記録は控えに残り、設定から戻せます。Unity版の記録は変わりません。</p><button data-action="${started?'close':'start'}" ${corrupt?'disabled':''}>やめる・記録を残す</button><button data-action="reset-confirm" class="danger">記録を消して、はじめから</button>`);}
