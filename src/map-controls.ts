import {constrainMap,wholeMap,zoomMap,type MapView} from './map-camera.ts';
const remembered=new Map<string,{view:MapView;width:number;height:number}>();
let dispose=()=>{};
/** Attach only to the map surface: floating panels never participate in gestures. */
export function mountMap(dialog:HTMLDialogElement){
 dispose();dispose=()=>{};
 const art=dialog.querySelector<HTMLElement>('.map-art');
 const stage=dialog.querySelector<HTMLElement>('.mission-stage');
 if(!art||!stage)return;
 const geographic=art.classList.contains('geo-map'),key=geographic?'walk':'operation';
 const world=geographic?{width:1200,height:500}:{width:1200,height:800};
 const viewport=document.createElement('div');viewport.className='map-viewport';viewport.tabIndex=0;
 viewport.setAttribute('role','region');viewport.setAttribute('aria-label','地図。ドラッグで移動、ホイールやピンチで拡大縮小。矢印キーで移動');
 stage.prepend(viewport);viewport.append(art);art.classList.add('map-world');
 art.style.width=world.width+'px';art.style.height=world.height+'px';
 const credit=art.querySelector('.geo-credit');if(credit)stage.append(credit);
 const controls=document.createElement('nav');controls.className='map-zoom';controls.setAttribute('aria-label','地図の表示');
 controls.innerHTML='<button data-map-zoom="in" aria-label="地図を拡大">＋</button><output aria-label="地図の倍率">100%</output><button data-map-zoom="out" aria-label="地図を縮小">−</button><button data-map-zoom="reset">全体へ</button>';
 stage.append(controls);
 const plate=document.createElement('div');plate.className='map-place-plate';
 plate.textContent=dialog.querySelector('.mission-detail h3')?.textContent||(geographic?'キキとネネのまち歩き':'神栖の防衛作戦');if(dialog.querySelector('.mission-detail'))stage.append(plate);
 const instruction=document.createElement('p');instruction.className='map-gesture-hint';instruction.textContent='ドラッグで移動 · ピンチ／ホイールで拡大';stage.append(instruction);
 const detail=dialog.querySelector<HTMLElement>('.mission-detail');
 if(detail){const launch=dialog.querySelector('[data-launch]');if(launch)detail.append(launch);const close=document.createElement('button');close.className='map-detail-close';if(geographic)close.dataset.walk='';else close.dataset.map='';close.setAttribute('aria-label','ミッション詳細を閉じる');close.textContent='×';detail.prepend(close);}
 const points=new Map<number,{x:number;y:number}>();let moved=false,suppressUntil=0;
 let size={width:viewport.clientWidth,height:viewport.clientHeight},view=constrainMap({scale:Math.max(size.width/world.width,size.height/world.height),x:(size.width-world.width*Math.max(size.width/world.width,size.height/world.height))/2,y:(size.height-world.height*Math.max(size.width/world.width,size.height/world.height))/2},size,world);
 const prior=remembered.get(key);if(prior&&size.width&&size.height){const fit=wholeMap(size,world),old=wholeMap({width:prior.width,height:prior.height},world);const scale=fit.scale*(prior.view.scale/old.scale);view=constrainMap({scale,x:size.width/2-(prior.width/2-prior.view.x)/prior.view.scale*scale,y:size.height/2-(prior.height/2-prior.view.y)/prior.view.scale*scale},size,world);}
 const paint=()=>{view=constrainMap(view,size,world);art.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.scale})`;art.style.setProperty('--map-inverse',String(1/view.scale));controls.querySelector('output')!.textContent=Math.round(view.scale/wholeMap(size,world).scale*100)+'%';remembered.set(key,{view:{...view},...size});};
 const position=(e:PointerEvent|WheelEvent)=>{const r=viewport.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
 let start={x:0,y:0},last={x:0,y:0},pinch:{distance:number;mid:{x:number;y:number}}|undefined;
 const pair=()=>{const [a,b]=[...points.values()];return{distance:Math.hypot(b.x-a.x,b.y-a.y),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};};
 const controller=new AbortController(),signal=controller.signal;
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;const p=position(e);points.set(e.pointerId,p);if(points.size===1){start=last=p;moved=false;}if(points.size===2){pinch=pair();moved=true;suppressUntil=performance.now()+700;}},{signal});
 viewport.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;const p=position(e);points.set(e.pointerId,p);
  if(points.size>=2){const next=pair();if(pinch&&pinch.distance>0){view=zoomMap(view,next.distance/pinch.distance,pinch.mid,size,world);view.x+=next.mid.x-pinch.mid.x;view.y+=next.mid.y-pinch.mid.y;}pinch=next;moved=true;}
  else{if(Math.hypot(p.x-start.x,p.y-start.y)>7)moved=true;if(moved){view.x+=p.x-last.x;view.y+=p.y-last.y;}last=p;}
  if(moved){e.preventDefault();if(!viewport.hasPointerCapture(e.pointerId))viewport.setPointerCapture(e.pointerId);suppressUntil=performance.now()+700;paint();}
 },{signal});
 const release=(e:PointerEvent)=>{if(!points.has(e.pointerId))return;points.delete(e.pointerId);if(moved)suppressUntil=performance.now()+700;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);pinch=undefined;if(points.size){start=last=[...points.values()][0];}else viewport.classList.remove('is-dragging');};
 window.addEventListener('pointerup',release,{signal});window.addEventListener('pointercancel',release,{signal});
 viewport.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},{capture:true,signal});
 viewport.addEventListener('wheel',e=>{e.preventDefault();view=zoomMap(view,Math.exp(-Math.max(-250,Math.min(250,e.deltaY))*.003),position(e),size,world);paint();},{passive:false,signal});
 controls.addEventListener('click',e=>{const action=(e.target as HTMLElement).closest<HTMLElement>('[data-map-zoom]')?.dataset.mapZoom;if(!action)return;view=action==='reset'?wholeMap(size,world):zoomMap(view,action==='in'?1.35:1/1.35,{x:size.width/2,y:size.height/2},size,world);paint();},{signal});
 viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;const d:Record<string,[number,number]>={ArrowLeft:[70,0],ArrowRight:[-70,0],ArrowUp:[0,70],ArrowDown:[0,-70]};if(d[e.key]){e.preventDefault();e.stopPropagation();view.x+=d[e.key][0];view.y+=d[e.key][1];paint();}if(e.key==='Home'){e.preventDefault();view=wholeMap(size,world);paint();}},{signal});
 const resize=new ResizeObserver(()=>{const next={width:viewport.clientWidth,height:viewport.clientHeight};if(!next.width||!next.height)return;if(next.width!==size.width||next.height!==size.height){const oldFit=wholeMap(size,world).scale,newFit=wholeMap(next,world).scale,scale=view.scale*newFit/oldFit;view={scale,x:next.width/2-(size.width/2-view.x)/view.scale*scale,y:next.height/2-(size.height/2-view.y)/view.scale*scale};size=next;}paint();});resize.observe(viewport);paint();
 dispose=()=>{controller.abort();resize.disconnect();};
}
