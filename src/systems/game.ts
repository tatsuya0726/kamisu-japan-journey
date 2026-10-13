import { items, region, rules } from '../data/world.ts';
export type Phase = 'explore'|'camp'|'battle'|'map';
export interface Match { player:number; enemy:number; round:number; actions:number; paint:number[]; turn:'player'|'enemy'; finished:boolean; boosted:boolean; result:number|null; }
export interface State { version:1; chapter?:number; day:number; energy:number; coins:number; level:number; position:number; dishes:number; wins:number; bag:number[]; done:boolean[]; harvested:number[]; night:boolean; phase:Phase; match:Match|null; }
export type Action = {type:'move';tile:number}|{type:'interact'}|{type:'camp'}|{type:'sleep'}|{type:'upgrade'}|{type:'cook'}|{type:'trade';item:number;buy:boolean}|{type:'map'}|{type:'back'}|{type:'battle'}|{type:'battleMove';tile:number}|{type:'wait'}|{type:'boost'}|{type:'enemy'};
export interface Effect {type:'walk'|'gain'|'push'|'upgrade'|'turn'|'finish'; actor?:'player'|'enemy';from?:number;to?:number;item?:number;amount?:number;}
export interface Outcome {state:State;ok:boolean;message:string;effects:Effect[];}
export const newGame=():State=>({version:1,chapter:2,day:1,energy:6,coins:4,level:1,position:region.home,dishes:0,wins:0,bag:[0,0,0,0,0],done:[false,false],harvested:[],night:false,phase:'explore',match:null});
export const freshMatch=():Match=>({player:20,enemy:4,round:1,actions:2,paint:Array.from({length:25},(_,i)=>i===20?1:i===4?2:0),turn:'player',finished:false,boosted:false,result:null});
export const distance=(a:number,b:number,cols:number)=>Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols));
export const score=(m:Match,side:number)=>m.paint.filter(x=>x===side).length+(m.paint[rules.flag]===side?3:0);
export function pathTo(from:number,to:number):number[]{
  if(to<0||to>=30||region.water.includes(to))return [];
  const queue:number[][]=[[from]],seen=new Set([from]);
  while(queue.length){const p=queue.shift()!,last=p[p.length-1];if(last===to)return p.slice(1);for(let t=0;t<30;t++)if(!seen.has(t)&&!region.water.includes(t)&&distance(last,t,6)===1){seen.add(t);queue.push([...p,t]);}}
  return [];
}
export function apply(state:State,action:Action):Outcome{
  const s=structuredClone(state), effects:Effect[]=[];let message='';
  const fail=(text:string):Outcome=>({state,ok:false,message:text,effects:[]});
  const validItem=(id:number)=>Number.isInteger(id)&&id>=0&&id<items.length;
  switch(action.type){
    case 'move':{
      if(s.phase!=='explore'||s.night)return fail('今は歩けないよ。');
      const t=action.tile;if(!Number.isInteger(t)||t<0||t>=30||region.water.includes(t)||distance(s.position,t,6)!==1)return fail('岸の道を、ひとマスずつ歩こう。');
      effects.push({type:'walk',actor:'player',from:s.position,to:t});s.position=t;
      message=region.sites.find(x=>x.tile===t)?.name??region.quests.find(x=>x.tile===t)?.text??(t===region.home?'ここがあなたの旅の拠点。':'風が気持ちいい。次はどこへ行こう？');break;
    }
    case 'interact':{
      if(s.phase!=='explore')return fail('昼の探索でお手伝いしよう。');
      const site=region.sites.find(x=>x.tile===s.position),qi=region.quests.findIndex(x=>x.tile===s.position);
      if(site){if(s.harvested.includes(site.tile))return fail('今日はもうお手伝いしたよ。また明日！');if(s.energy<1)return fail('元気を使い切った。拠点で休もう。');s.energy--;s.harvested.push(site.tile);s.bag[site.item]+=site.amount;message=site.text;effects.push({type:'gain',item:site.item,amount:site.amount});}
      else if(qi>=0){const q=region.quests[qi];if(s.done[qi])return fail('ありがとう！ 旅を楽しんでね。');if(s.bag[q.item]<q.count)return fail(q.text);s.bag[q.item]-=q.count;s.done[qi]=true;s.coins+=q.reward;message=`「ありがとう！」 ${q.reward}コインのお礼を受け取った。`;effects.push({type:'gain',amount:q.reward});}
      else return fail('光る作物や、住民のところへ行ってみよう。');break;
    }
    case 'camp':if(s.phase!=='explore')return fail('探索から拠点へ戻ろう。');s.night=true;s.phase='camp';message='夜の灯りがともった。今日の恵みを、何に使おう？';break;
    case 'sleep':if(s.phase!=='camp')return fail('拠点で休もう。');s.day++;s.energy=s.level===2?8:6;s.night=false;s.harvested=[];s.position=region.home;s.phase='explore';message='新しい朝！ お手伝いできる場所がまた増えた。';break;
    case 'upgrade':if(s.phase!=='camp'||s.level===2)return fail('小屋はもう完成しているよ。');if(s.coins<8||s.bag[3]<3)return fail('木材３つと８コインで小屋をつくれるよ。');s.coins-=8;s.bag[3]-=3;s.level=2;message='旅人の小屋が完成！ 明日から元気の上限が８になる。';effects.push({type:'upgrade'});break;
    case 'cook':if(s.phase!=='camp')return fail('料理は夜の拠点で。');if(s.bag[0]<1||s.bag[2]<1)return fail('れんこん１つと栗１つが必要だよ。');s.bag[0]--;s.bag[2]--;s.dishes++;message='ほくほくの旅のお弁当ができた！';effects.push({type:'gain',amount:1});break;
    case 'trade':{if(s.phase!=='camp'||!validItem(action.item))return fail('夜市で交換しよう。');const i=action.item,cost=items[i].price+(action.buy?2:0);if(action.buy){if(s.coins<cost)return fail('コインが足りないよ。');s.coins-=cost;s.bag[i]++;}else{if(s.bag[i]<1)return fail('その品物は持っていないよ。');s.bag[i]--;s.coins+=cost;}message=`${items[i].name}を１つ${action.buy?'買った':'売った'}。コイン ${action.buy?'−':'＋'}${cost}`;break;}
    case 'map':if(s.phase==='battle')return fail('対戦を終えてから地図を見よう。');s.phase='map';message='北へ、西へ、南へ。次の旅の行き先を思いえがこう。';break;
    case 'back':s.phase=s.night?'camp':'explore';message=s.level===2&&s.wins>0?'小屋づくりと旗取り１勝、達成！ 最初の旅の一周ができました。':'また、あなたのペースで旅をつづけよう。';break;
    case 'battle':if(s.phase!=='camp'&&!(s.phase==='battle'&&s.match?.finished))return fail('夜の広場で腕くらべしよう。');s.match=freshMatch();s.phase='battle';message='青があなた。１ラウンド２行動。中央の旗は追加３点！';break;
    case 'battleMove':case 'wait':case 'boost':{
      const m=s.match;if(s.phase!=='battle'||!m||m.finished||m.turn!=='player')return fail('いまは相手の番だよ。');
      if(action.type==='boost'){if(m.boosted||s.dishes<1)return fail('お弁当は１試合１回だけ使えるよ。');s.dishes--;m.boosted=true;m.actions++;message='お弁当で行動＋１！（ゲーム内の効果）';break;}
      if(action.type==='battleMove'){const t=action.tile;if(!Number.isInteger(t)||t<0||t>=25||rules.rocks.includes(t)||distance(m.player,t,5)!==1)return fail('石をよけて、上下左右の隣のマスへ。');if(t===m.enemy){const home=t===4?0:4;effects.push({type:'push',actor:'enemy',from:m.enemy,to:home});m.enemy=home;}effects.push({type:'walk',actor:'player',from:m.player,to:t});m.player=t;m.paint[t]=1;message=t===12?'旗をとった！ 守る？ ほかの色を広げる？':'青い色が広がった！';}else message='１行動待った。';
      m.actions--;if(m.actions===0){m.turn='enemy';effects.push({type:'turn'});}break;
    }
    case 'enemy':{
      const m=s.match;if(s.phase!=='battle'||!m||m.finished||m.turn!=='enemy')return fail('まだあなたの番だよ。');
      for(let step=0;step<2;step++){let choice=-1,best=-999;for(let t=0;t<25;t++){if(rules.rocks.includes(t)||distance(m.enemy,t,5)!==1)continue;const value=(m.paint[t]!==2?5:0)+(t===12?8:0)-distance(t,12,5)+(t===m.player?3:0);if(value>best){best=value;choice=t;}}
        if(choice>=0){if(choice===m.player){const home=choice===20?24:20;effects.push({type:'push',actor:'player',from:m.player,to:home});m.player=home;}effects.push({type:'walk',actor:'enemy',from:m.enemy,to:choice});m.enemy=choice;m.paint[choice]=2;}}
      if(m.round>=8){m.finished=true;m.result=Math.sign(score(m,1)-score(m,2));s.coins+=m.result>0?6:2;if(m.result>0)s.wins++;effects.push({type:'finish'});message=m.result>0?'青チームの勝ち！ お祝いに６コイン。':m.result<0?'赤チームの勝ち！ 参加賞２コイン。また挑戦しよう。':'引き分け！ 参加賞２コイン。いい勝負だったね。';}
      else{m.round++;m.actions=2;m.turn='player';message='あなたの番！ 青い輪のマスに進めるよ。';}break;
    }
  }
  return {state:s,ok:true,message,effects};
}
