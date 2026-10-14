/** Pixel camera shared by the illustrated and geographic maps. No saved progress. */
export type MapView={scale:number;x:number;y:number};
export type MapSize={width:number;height:number};
export function fitScale(viewport:MapSize,world:MapSize){return Math.min(viewport.width/world.width,viewport.height/world.height);}
export function constrainMap(view:MapView,viewport:MapSize,world:MapSize):MapView{
 const min=fitScale(viewport,world),scale=Math.max(min,Math.min(min*4,view.scale));
 const axis=(offset:number,available:number,extent:number)=>extent<=available?(available-extent)/2:Math.max(available-extent,Math.min(0,offset));
 return {scale,x:axis(view.x,viewport.width,world.width*scale),y:axis(view.y,viewport.height,world.height*scale)};
}
export function wholeMap(viewport:MapSize,world:MapSize):MapView{return constrainMap({scale:fitScale(viewport,world),x:0,y:0},viewport,world);}
export function zoomMap(view:MapView,factor:number,anchor:{x:number;y:number},viewport:MapSize,world:MapSize):MapView{
 const min=fitScale(viewport,world),scale=Math.max(min,Math.min(min*4,view.scale*factor)),ratio=scale/view.scale;
 return constrainMap({scale,x:anchor.x-(anchor.x-view.x)*ratio,y:anchor.y-(anchor.y-view.y)*ratio},viewport,world);
}
