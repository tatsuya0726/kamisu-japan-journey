import test from 'node:test';
import assert from 'node:assert/strict';
import {wholeMap,zoomMap,constrainMap} from '../src/map-camera.ts';
const world={width:1200,height:800},viewport={width:800,height:450};
test('whole map fits and centers without clipping any world edge',()=>{
 const v=wholeMap(viewport,world);assert.equal(v.scale,.5625);assert.equal(v.x,62.5);assert.equal(v.y,0);
});
test('wheel/pinch zoom keeps the world under the anchor fixed away from bounds',()=>{
 const v=wholeMap(viewport,world),anchor={x:330,y:160},next=zoomMap(v,2,anchor,viewport,world);
 assert.equal((anchor.x-v.x)/v.scale,(anchor.x-next.x)/next.scale);
 assert.equal((anchor.y-v.y)/v.scale,(anchor.y-next.y)/next.scale);
});
test('extreme pan and zoom never expose empty space beyond a large map',()=>{
 const v=constrainMap({scale:100,x:1e9,y:-1e9},viewport,world);
 assert.equal(v.scale,2.25);assert.equal(v.x,0);assert.equal(v.y,450-800*2.25);
 assert.deepEqual(zoomMap(v,.00001,{x:0,y:0},viewport,world),wholeMap(viewport,world));
});
test('small and TV viewports retain the same geographic proportions',()=>{
 for(const viewport of [{width:600,height:330},{width:1728,height:972}]){
  const v=wholeMap(viewport,world);assert.ok(v.x>=-1e-9&&v.y>=-1e-9);assert.ok(world.width*v.scale<=viewport.width+1e-9);assert.ok(world.height*v.scale<=viewport.height+1e-9);
 }
});
