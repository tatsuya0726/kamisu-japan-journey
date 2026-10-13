import {items,region} from '../data/world.ts';
import {score} from '../systems/game.ts';
import type {State} from '../systems/game.ts';
const button=(label:string,action:string,disabled=false,kind='')=>`<button data-action="${action}" class="${kind}" ${disabled?'disabled':''}>${label}</button>`;
const icon=(i:number)=>`<img src="${import.meta.env.BASE_URL}assets/${items[i].icon}.svg" alt="" class="item-icon">`;
export class HUD{
  shopTab='camp';
  render(s:State,busy:boolean){
    document.body.dataset.phase=s.phase;document.body.classList.toggle('busy',busy);
    document.querySelector('#status')!.innerHTML=`<span class="day">${s.night?'☾':'☀'} ${s.day}日目 <b>${s.night?'夜':'昼'}</b></span><span>元気 <strong>${s.energy}</strong><small>/${s.level===2?8:6}</small></span><span class="coins">● <strong>${s.coins}</strong> <small>コイン</small></span>`;
    const status=document.querySelector('#phase-label')!;status.textContent=s.phase==='battle'?(s.match?.finished?'結果発表':s.match?.turn==='enemy'?'赤チームの番…':'あなたの番'):{explore:'昼の旅',camp:'夜の灯り',map:'旅の地図'}[s.phase];
    document.querySelector('#place-label')!.textContent=s.phase==='battle'?'FLAG GARDEN / 旗取り広場':'KAMISU / 神栖からの旅';
    const panel=document.querySelector('#panel')!,actions=document.querySelector('#world-actions')!;
    if(s.phase==='explore'){
      const site=region.sites.find(x=>x.tile===s.position),quest=region.quests.find(x=>x.tile===s.position);const used=site&&s.harvested.includes(site.tile);
      panel.innerHTML=`<div class="section-kicker">今日の旅ノート</div><h1>小さな恵みを、<br>明日の灯りに。</h1><p class="muted">歩くのは元気０。お手伝いは元気１。気になる場所をタップして歩こう。</p><div class="context"><small>いまいる場所</small><h2>${site?.name??quest?.name??(s.position===region.home?'神栖・しおかぜ港':'茨城の旅路')}</h2><p>${site?(used?'今日はお手伝い済み。また明日！':`${items[site.item].name}を２つ分けてもらえるよ。`):quest?.text??'畑や直売所、住民を訪ねてみよう。'}</p></div>${this.bag(s)}<details><summary>住民のお願い <span>${s.done.filter(Boolean).length}/2</span></summary>${region.quests.map((q,i)=>`<div class="quest"><b>${s.done[i]?'✓ ':''}${q.name}</b><span>${items[q.item].name} ${q.count} → ${q.reward}コイン</span></div>`).join('')}</details><div class="milestones"><span class="${s.level===2?'done':''}">⌂ 小屋づくり</span><span class="${s.wins?'done':''}">⚑ 旗取り１勝</span></div>`;
      actions.innerHTML=button(site?'お手伝いする −元気１':quest?'話す / 届ける':'ここを調べる','interact',busy||!!used||!!site&&s.energy===0,'primary')+button('旅の地図','map',busy)+button('夜の拠点へ ☾','camp',busy);
    }else if(s.phase==='camp'){
      const tabs=`<div class="tabs">${['camp','shop','cook'].map((t,i)=>button(['拠点','夜市','料理'][i],`tab:${t}`,false,this.shopTab===t?'active':'')).join('')}</div>`;
      let contents='';if(this.shopTab==='camp')contents=`<h1>${s.level===2?'灯りが、ともった。':'港に、旅の家を。'}</h1><p>${s.level===2?'小屋が完成！ 翌朝から元気の上限が８に増えます。':'神栖・しおかぜ港のテントを、木材３つと８コインで小屋に。明日から元気が増える。'}</p><div class="cost"><span>木材 <b>${s.bag[3]} / 3</b></span><span>コイン <b>${s.coins} / 8</b></span></div>${button(s.level===2?'✓ 小屋は完成':'小屋をつくる','upgrade',busy||s.level===2||s.coins<8||s.bag[3]<3,'primary full')}<p class="muted">あとで売る？ 料理に残す？<br>集めた恵みの使い道を考えてみよう。</p>`;
      if(this.shopTab==='shop')contents=`<h1>夜市の交換所</h1><p class="muted">１個ずつ交換。買う値段は、売る値段より２コイン高いよ。</p>${items.map((it,i)=>`<div class="trade-row">${icon(i)}<div><b>${it.name} ×${s.bag[i]}</b><div>${button(`売る ＋${it.price}`,`sell:${i}`,busy||!s.bag[i])}${button(`買う −${it.price+2}`,`buy:${i}`,busy||s.coins<it.price+2)}</div></div></div>`).join('')}`;
      if(this.shopTab==='cook')contents=`<h1>ほくほく、旅じたく。</h1><p>れんこんと栗の、旅のお弁当。</p><div class="recipe">${icon(0)}<span>１ ＋</span>${icon(2)}<span>１</span></div><p>旗取りで、１試合に１回だけ行動＋１。<small class="muted">※創作したゲーム内の効果です。</small></p>${button('お弁当をつくる','cook',busy||s.bag[0]<1||s.bag[2]<1,'primary full')}<div class="cost">お弁当 <b>${s.dishes}個</b></div>`;
      panel.innerHTML=`<div class="section-kicker">夜をととのえる / LV.${s.level}</div>${tabs}${contents}${this.bag(s)}`;
      actions.innerHTML=button('旗取りで腕くらべ ⚑','battle',busy,'primary')+button('朝まで休む ☀','sleep',busy)+button('旅の地図','map',busy);
    }else if(s.phase==='battle'){
      const m=s.match!,yourTurn=!busy&&m.turn==='player'&&!m.finished;
      panel.innerHTML=`<div class="section-kicker">色を広げる、小さな作戦</div><h1>${m.finished?(m.result!>0?'青チームの勝ち！':m.result!<0?'赤チームの勝ち！':'引き分け！'):m.turn==='player'?'あなたの番。':'赤チームの番…'}</h1><div class="round">ラウンド <b>${m.round}</b> / 8</div><div class="scoreboard"><div class="blue">青<strong>${score(m,1)}</strong></div><span>:</span><div class="coral">赤<strong>${score(m,2)}</strong></div></div><div class="actions-left">${m.finished?'試合終了':`行動 <b>${m.actions}</b> 回 ${'●'.repeat(m.actions)}`}</div><p class="muted">色のマスは１点ずつ。中央の旗は追加３点。相手のマスに入ると、相手をスタートへ押し戻せます。</p>${button(`お弁当で行動＋１ (${s.dishes})`,'boost',!yourTurn||m.boosted||!s.dishes,'full')}<small class="muted">お弁当は１試合１回。食品の実際の効能ではありません。</small>`;
      actions.innerHTML=m.finished?button('もう一度あそぶ','battle',busy,'primary')+button('拠点へ戻る','back',busy):button('１行動待つ','wait',!yourTurn)+button('対戦をやめて拠点へ','back',busy,'quiet');
    }else{
      panel.innerHTML=`<div class="section-kicker">次の旅は、どこへ？</div><h1>神栖から、<br>日本をめぐる。</h1><p>東は太平洋。北は福島、西は栃木、南は千葉。南西の一部は埼玉につながっています。</p><div class="context"><h2>出発地：茨城県 神栖市</h2><p>神栖は茨城県の東南部。東は太平洋、西は利根川。港町「しおかぜ港」と人物・道は創作です。周辺県は今後の追加予定。</p></div><details><summary>旅の豆知識</summary>${items.slice(0,3).map(i=>`<p>${i.fact}</p>`).join('')}<p>市場・直売所で交換するため、季節によらず入手できます。地形・距離は模式化しています。</p></details>`;
      actions.innerHTML=button('茨城の旅につづく','back',busy,'primary');
    }
    (document.querySelector('#menu-open') as HTMLButtonElement).disabled=busy;
    document.querySelectorAll<HTMLButtonElement>('#touch-pad button').forEach(b=>b.disabled=busy||!['explore','battle'].includes(s.phase)||s.phase==='battle'&&(s.match!.turn!=='player'||s.match!.finished));
  }
  bag(s:State){return `<div class="bag"><h3>旅のかばん</h3><div class="bag-items">${items.map((it,i)=>`<div title="${it.fact}">${icon(i)}<span>${it.name}</span><b>${s.bag[i]}</b></div>`).join('')}</div></div>`;}
  message(text:string){document.querySelector('#message')!.textContent=text;}
  saveStatus(text:string){document.querySelector('#save-status')!.textContent=text;}
}
