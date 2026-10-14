import test from 'node:test';
import assert from 'node:assert/strict';
import {mountMap} from '../src/map-controls.ts';
class ElementStub extends EventTarget {
 className='';textContent='';innerHTML='';tabIndex=0;clientWidth=800;clientHeight=450;
 style:any={setProperty(){}};dataset:any={};children:ElementStub[]=[];output?:ElementStub;captured=new Set<number>();
 classList={contains:()=>false,add(){},remove(){}};
 setAttribute(){} append(e:ElementStub){this.children.push(e);} prepend(e:ElementStub){this.children.unshift(e);}
 querySelector(selector:string):any{if(selector==='output')return this.output??=new ElementStub();return null;}
 getBoundingClientRect(){return{left:0,top:0};}
 hasPointerCapture(id:number){return this.captured.has(id);}setPointerCapture(id:number){this.captured.add(id);}releasePointerCapture(id:number){this.captured.delete(id);}
}
function event(type:string,values:Record<string,unknown>={}){const e=new Event(type,{cancelable:true});Object.assign(e,values);return e;}
test('map input handles two-finger pinch, drag threshold, cancellation and post-gesture click suppression',()=>{
 const art=new ElementStub(),stage=new ElementStub(),dialog=new ElementStub(),windowStub=new EventTarget();
 dialog.querySelector=(s:string)=>s==='.map-art,.geo-map'?art:s==='.mission-stage'?stage:null;
 const old={document:globalThis.document,window:globalThis.window,ResizeObserver:globalThis.ResizeObserver};
 Object.assign(globalThis,{document:{createElement:()=>new ElementStub()},window:windowStub,ResizeObserver:class{observe(){}disconnect(){}}});
 try{
  mountMap(dialog as any);const surface=stage.children[0],initial=art.style.transform;
  surface.dispatchEvent(event('pointerdown',{pointerId:1,pointerType:'touch',clientX:300,clientY:220}));
  surface.dispatchEvent(event('pointermove',{pointerId:1,clientX:304,clientY:222}));assert.equal(art.style.transform,initial);
  windowStub.dispatchEvent(event('pointerup',{pointerId:1}));const tap=event('click');surface.dispatchEvent(tap);assert.equal(tap.defaultPrevented,false);
  surface.dispatchEvent(event('pointerdown',{pointerId:2,pointerType:'touch',clientX:300,clientY:220}));
  surface.dispatchEvent(event('pointerdown',{pointerId:3,pointerType:'touch',clientX:500,clientY:220}));
  surface.dispatchEvent(event('pointermove',{pointerId:3,clientX:650,clientY:220}));assert.notEqual(art.style.transform,initial);
  windowStub.dispatchEvent(event('pointerup',{pointerId:3}));windowStub.dispatchEvent(event('pointerup',{pointerId:2}));
  const pinchClick=event('click');surface.dispatchEvent(pinchClick);assert.equal(pinchClick.defaultPrevented,true);
  const before=art.style.transform;surface.dispatchEvent(event('pointermove',{pointerId:3,clientX:10,clientY:10}));assert.equal(art.style.transform,before);
  surface.dispatchEvent(event('pointerdown',{pointerId:4,pointerType:'touch',clientX:350,clientY:220}));
  surface.dispatchEvent(event('pointermove',{pointerId:4,clientX:200,clientY:260}));assert.notEqual(art.style.transform,before);
  windowStub.dispatchEvent(event('pointercancel',{pointerId:4}));const cancelled=art.style.transform;
  surface.dispatchEvent(event('pointermove',{pointerId:4,clientX:500,clientY:300}));assert.equal(art.style.transform,cancelled);
  const wheel=event('wheel',{clientX:400,clientY:200,deltaY:-100});surface.dispatchEvent(wheel);assert.equal(wheel.defaultPrevented,true);assert.notEqual(art.style.transform,cancelled);
  // Detail panels are siblings of the surface; their events have no camera listeners.
  const panel=new ElementStub();stage.append(panel);const still=art.style.transform;panel.dispatchEvent(event('wheel',{clientX:400,clientY:200,deltaY:-100}));assert.equal(art.style.transform,still);
  mountMap(new ElementStub() as any);
 }finally{Object.assign(globalThis,old);}
});
