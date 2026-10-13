import Phaser from 'phaser';
import {assets} from '../assets.ts';
import {items,region,rules} from '../data/world.ts';
import {distance} from '../systems/game.ts';
import type {State,Effect,Action} from '../systems/game.ts';

export interface Bridge {state:()=>State;dispatch:(action:Action)=>void;travel:(tile:number)=>void;reduced:()=>boolean;ready:()=>void;}
export class WorldScene extends Phaser.Scene{
  private bridge:Bridge;private phase='';private layer!:Phaser.GameObjects.Container;private markers!:Phaser.GameObjects.Graphics;
  private player!:Phaser.GameObjects.Sprite;private enemy?:Phaser.GameObjects.Sprite;private paint!:Phaser.GameObjects.Graphics;
  constructor(bridge:Bridge){super('world');this.bridge=bridge;}
  preload(){for(const [key,url] of Object.entries(assets.characters))this.load.spritesheet(key,url,{frameWidth:32,frameHeight:32});for(const group of [assets.environment,assets.items])for(const [key,url] of Object.entries(group))this.load.image(key,url);}
  create(){
    for(const who of ['traveler','neighbor'])for(let dir=0;dir<4;dir++)this.anims.create({key:`${who}-${dir}`,frames:this.anims.generateFrameNumbers(who,{start:dir*4,end:dir*4+3}),frameRate:8,repeat:-1});
    this.cameras.main.setBackgroundColor('#adc08a');this.redraw();this.bridge.ready();
  }
  point(tile:number,battle=this.bridge.state().phase==='battle'){return battle?{x:285+tile%5*88,y:151+Math.floor(tile/5)*88}:{x:150+tile%6*112,y:124+Math.floor(tile/6)*100};}
  private image(x:number,y:number,key:string,scale=2,originY=1){const image=this.add.image(x,y,key).setOrigin(.5,originY).setScale(scale);this.layer.add(image);return image;}
  private label(x:number,y:number,text:string,size=14,color='#344b3c'){const label=this.add.text(x,y,text,{fontFamily:'"Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,backgroundColor:'#f5ebcbee',padding:{x:7,y:4}}).setOrigin(.5,0);this.layer.add(label);return label;}
  redraw(){
    const s=this.bridge.state();this.phase=s.phase;
    this.tweens.killAll();this.children.removeAll(true);this.layer=this.add.container(0,0);this.enemy=undefined;
    if(s.phase==='battle')this.drawArena();else if(s.phase==='camp')this.drawCamp();else if(s.phase==='map')this.drawMap();else this.drawExplore();
    this.refresh();
  }
  private background(night=false){
    const g=this.add.graphics();this.layer.add(g);g.fillStyle(night?0x334e46:0xa6b87c).fillRect(0,0,960,640);
    for(let y=0;y<20;y++)for(let x=0;x<30;x++){const n=(x*37+y*71)%19;g.fillStyle(night?(n<8?0x3b5549:0x354f44):(n<8?0xb1bf83:0x9fb47a)).fillRect(x*32,y*32,32,32);if(n%3===0){g.fillStyle(night?0x4a6150:0x89a16a).fillRect(x*32+6,y*32+17,3,4).fillRect(x*32+10,y*32+20,2,2);}}
    return g;
  }
  private drawExplore(){
    const g=this.background();
    // Coarse walkable nodes share exactly the same topology as the Unity slice.
    g.fillStyle(0x709da0).fillRect(806,0,154,640).fillRect(646,277,314,363).fillRect(758,177,202,463);
    g.fillStyle(0xb8c397).fillRect(632,277,14,363).fillRect(646,263,112,14).fillRect(744,177,14,86).fillRect(758,163,48,14);
    for(let y=292;y<640;y+=46)for(let x=678;x<960;x+=66){g.fillStyle(0x94b8b3).fillRect(x+(y%3)*8,y,18,2);}
    // The forest clearing stays on shore, as in the source layout.
    g.fillStyle(0xa6b87c).fillRect(588,458,152,128);g.fillStyle(0xc1bd86).fillRect(736,458,8,128);
    const road=this.add.graphics();this.layer.add(road);road.lineStyle(15,0xd0b67e,1);
    for(let t=0;t<30;t++){if(region.water.includes(t))continue;const a=this.point(t);for(const n of [t+1,t+6]){if(n>=30||region.water.includes(n)||distance(t,n,6)!==1)continue;const b=this.point(n);road.lineBetween(a.x,a.y,b.x,b.y);}}
    road.lineStyle(2,0xe2c68d,.7);for(let t=0;t<30;t++){if(region.water.includes(t))continue;const p=this.point(t);road.strokeCircle(p.x,p.y,9);}
    // Orchard and small cultivation beds; products are rewards, not lake pickups.
    for(const t of [2,5,10]){const p=this.point(t);g.fillStyle(0x856b49).fillRect(p.x-39,p.y-30,78,45);for(let y=0;y<3;y++)for(let x=0;x<5;x++){g.fillStyle(0x607c49).fillRect(p.x-30+x*14,p.y-22+y*14,8,5);g.fillStyle(0x8ca65a).fillRect(p.x-28+x*14,p.y-25+y*14,3,4);}}
    [[53,135],[79,205],[61,300],[85,377],[49,504],[94,601],[327,585],[468,586],[556,619],[29,604],[829,113],[61,65],[455,74],[577,60],[683,64],[396,69],[222,68]].forEach(([x,y],i)=>this.image(x,y,'tree',i%3===0?2:1.65));
    const home=this.point(region.home);this.image(home.x,home.y-2,this.bridge.state().level===2?'cottage':'tent',1.3);
    g.fillStyle(0xb99361).fillRect(741,482,103,24);for(let x=749;x<844;x+=16)g.fillStyle(0x705b45).fillRect(x,482,3,24);
    g.fillStyle(0x805c42).fillRect(810,371,79,17).fillRect(821,388,58,7);g.fillStyle(0xf1e3b1).fillRect(840,337,4,34).fillTriangle(845,338,845,367,873,367);
    this.image(374,121,'stall',1.05);this.image(710,119,'stall',1.05);
    this.label(home.x,545,'神栖・しおかぜ港',14);this.label(374,557,'ピーマン畑',12);this.label(374,153,'笠間の直売所',12);this.label(710,153,'鉾田の市場',12);this.label(598,253,'霞ヶ浦の蓮田',12);
    for(const site of region.sites){const p=this.point(site.tile);this.image(p.x+23,p.y-10,items[site.item].icon,1.25);}
    for(const q of region.quests){const p=this.point(q.tile);const n=this.add.sprite(p.x,p.y+9,'neighbor',0).setOrigin(.5,1).setScale(1.65);this.layer.add(n);this.label(p.x,p.y+18,q.name.split(' ')[1],12);}
    this.label(863,424,'太平洋',17,'#eaf2d2').setBackgroundColor('#426f7455');
    this.markers=this.add.graphics();this.layer.add(this.markers);
    for(let t=0;t<30;t++){if(region.water.includes(t))continue;const p=this.point(t);const zone=this.add.zone(p.x,p.y,106,92).setInteractive({useHandCursor:true});zone.on('pointerup',(p:Phaser.Input.Pointer)=>{if(p.getDistance()<12)this.bridge.travel(t);});this.layer.add(zone);}
    const p=this.point(this.bridge.state().position);this.player=this.add.sprite(p.x,p.y+14,'traveler',0).setScale(1.75).setOrigin(.5,1).setDepth(50);
    if(!this.bridge.reduced()){const cloud=this.add.graphics().fillStyle(0xf5efd0,.3).fillRect(10,20,90,9).fillRect(24,12,50,8);this.tweens.add({targets:cloud,x:60,duration:18000,yoyo:true,repeat:-1});}
  }
  private drawCamp(){
    const g=this.background(true);g.fillStyle(0x263f40).fillRect(0,0,960,110);for(let i=0;i<35;i++){g.fillStyle(i%4?0xa3ae87:0xe4d394).fillRect((i*113)%950,12+(i*31)%90,i%4?2:3,2);}
    g.fillStyle(0xe3d7a1).fillCircle(826,56,24);g.fillStyle(0x263f40).fillCircle(838,49,22);
    [[50,288],[116,207],[64,549],[168,608],[839,232],[908,477],[800,594]].forEach(([x,y])=>this.image(x,y,'tree',2.5).setTint(0x839c7b));
    g.fillStyle(0x8d805d).fillRect(200,349,540,158);g.fillStyle(0xac9667).fillRect(240,381,450,14);
    this.image(408,365,this.bridge.state().level===2?'cottage':'tent',3.2);
    this.image(743,395,'stall',2.1).setTint(0xcab88b);this.label(741,411,'夜市',17);
    const fire=this.add.graphics().fillStyle(0xe1ae5a,.16).fillCircle(387,451,74).fillStyle(0x745340).fillRect(361,463,53,8).fillStyle(0xd77843).fillRect(372,429,30,36).fillStyle(0xeeb45d).fillRect(378,420,17,34).fillStyle(0xffdfa0).fillRect(382,439,9,23);this.layer.add(fire);
    if(!this.bridge.reduced())this.tweens.add({targets:fire,alpha:.7,duration:420,yoyo:true,repeat:-1});
    this.player=this.add.sprite(324,474,'traveler',8).setScale(2.3).setOrigin(.5,1);this.label(408,528,this.bridge.state().level===2?'旅人の小屋 / Lv.2':'こもれびのテント / Lv.1',18);
  }
  private drawArena(){
    const g=this.background();g.fillStyle(0xceb98a).fillRect(201,69,520,535);g.fillStyle(0xe6d7ad).fillRect(211,79,500,515);
    [[56,191],[139,339],[810,182],[892,403],[809,585],[113,594]].forEach(([x,y])=>this.image(x,y,'tree',2));
    this.paint=this.add.graphics();this.layer.add(this.paint);this.markers=this.add.graphics();this.layer.add(this.markers);
    for(let t=0;t<25;t++){const p=this.point(t,true);if(rules.rocks.includes(t))this.image(p.x,p.y+13,'rock',2);if(t===12)this.image(p.x,p.y+20,'flag',1.8);const zone=this.add.zone(p.x,p.y,80,80).setInteractive({useHandCursor:!rules.rocks.includes(t)});zone.on('pointerup',(p:Phaser.Input.Pointer)=>{if(p.getDistance()<12)this.bridge.dispatch({type:'battleMove',tile:t});});this.layer.add(zone);}
    const m=this.bridge.state().match!,p=this.point(m.player,true),e=this.point(m.enemy,true);
    this.player=this.add.sprite(p.x,p.y+17,'traveler',0).setScale(1.9).setOrigin(.5,1).setDepth(50);
    this.enemy=this.add.sprite(e.x,e.y+17,'neighbor',0).setScale(1.9).setOrigin(.5,1).setDepth(50);
    this.label(462,611,'旗 ＋３点  ·  色のマス １点',16);
  }
  private drawMap(){
    const g=this.background();g.fillStyle(0xe7d9ae).fillRect(78,48,804,539);g.lineStyle(3,0xae9467).strokeRect(90,60,780,515);g.fillStyle(0x75a4a6).fillRect(631,165,195,335);
    const chips=[{x:450,y:115,w:150,h:85,name:'福島',color:0x94aa79},{x:266,y:231,w:160,h:115,name:'栃木',color:0xa8b884},{x:451,y:231,w:151,h:143,name:'茨城',color:0x5b8872},{x:266,y:394,w:160,h:100,name:'埼玉',color:0xb4bf8a},{x:451,y:404,w:151,h:128,name:'千葉',color:0x94aa79}];
    for(const c of chips){g.fillStyle(c.color).fillRect(c.x,c.y,c.w,c.h);this.label(c.x+c.w/2,c.y+c.h/2-13,c.name,22,c.name==='茨城'?'#f7efcd':'#324f41').setBackgroundColor('#ffffff00');}
    this.label(730,301,'太平洋',22,'#f3efd3').setBackgroundColor('#ffffff00');this.label(450,548,'境界・形・距離は模式図です',14);this.image(584,367,'flag',.8);this.label(582,370,'神栖',14);
  }
  refresh(){
    const s=this.bridge.state();if(s.phase!==this.phase){this.redraw();return;}
    if(s.phase==='explore'){
      this.markers.clear();for(let t=0;t<30;t++){if(region.water.includes(t))continue;const p=this.point(t);if(distance(s.position,t,6)===1)this.markers.lineStyle(2,0xf9e6a6,.75).strokeEllipse(p.x,p.y+9,38,16);}
      const p=this.point(s.position);this.markers.lineStyle(3,0xffedac).strokeEllipse(p.x,p.y+13,42,18);
      for(const site of region.sites){const q=this.point(site.tile);this.markers.fillStyle(s.harvested.includes(site.tile)?0x6b825a:0xf1ce78).fillRect(q.x+36,q.y-50,6,6);}
    }else if(s.phase==='battle'){
      const m=s.match!;this.paint.clear();this.markers.clear();for(let t=0;t<25;t++){const p=this.point(t,true);this.paint.fillStyle(m.paint[t]===1?0x91bdc0:m.paint[t]===2?0xd9a082:0xc7cda1).fillRect(p.x-39,p.y-38,78,78);if(m.turn==='player'&&!m.finished&&!rules.rocks.includes(t)&&distance(m.player,t,5)===1)this.markers.lineStyle(3,0x347c88).strokeRect(p.x-36,p.y-35,72,72);}
    }
  }
  async animate(effects:Effect[]){
    for(const e of effects){
      if((e.type==='walk'||e.type==='push')&&e.to!==undefined){const actor=e.actor==='enemy'?this.enemy:this.player;if(!actor)continue;const to=this.point(e.to);const from=this.point(e.from??e.to);const dir=to.x<from.x?1:to.x>from.x?2:to.y<from.y?3:0;actor.play(`${e.actor==='enemy'?'neighbor':'traveler'}-${dir}`);await new Promise<void>(resolve=>this.tweens.add({targets:actor,x:to.x,y:to.y+(this.phase==='battle'?17:14),duration:this.bridge.reduced()?0:e.type==='push'?190:220,ease:'Sine.easeInOut',onComplete:()=>{actor.stop();actor.setFrame(dir*4);resolve();}}));}
      if(e.type==='gain'||e.type==='upgrade'||e.type==='finish'){const x=this.player?.x??480,y=(this.player?.y??360)-52;const note=this.add.text(x,y,e.type==='gain'?`＋${e.amount??1}`:e.type==='upgrade'?'小屋が完成！':'おつかれさま！',{fontFamily:'"Yu Gothic",sans-serif',fontSize:'26px',fontStyle:'bold',color:'#fff1af',stroke:'#3b5443',strokeThickness:5}).setOrigin(.5).setDepth(100);this.tweens.add({targets:note,y:y-34,alpha:0,duration:this.bridge.reduced()?600:1100,onComplete:()=>note.destroy()});}
    }
    this.refresh();
  }
}
