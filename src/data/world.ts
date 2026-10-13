export const items = [
  { id: 'lotus', name: 'れんこん', price: 3, fact: '霞ヶ浦周辺は、れんこんの産地。', icon: 'lotus' },
  { id: 'melon', name: 'メロン', price: 4, fact: '鉾田はメロンの主な産地のひとつ。', icon: 'melon' },
  { id: 'chestnut', name: '栗', price: 3, fact: '笠間では栗作りが盛んです。', icon: 'chestnut' },
  { id: 'wood', name: '木材', price: 1, fact: '道具や拠点づくりの材料。', icon: 'wood' },
  { id: 'pepper', name: 'ピーマン', price: 3, fact: '神栖はピーマンの産地。温暖な気候と砂質の土壌を生かして栽培されています。', icon: 'pepper' },
] as const;
export const region = {
  id: 'ibaraki', name: '茨城県', columns: 6, rows: 5, home: 28,
  water: [16, 17, 23, 29],
  sites: [
    { tile: 26, name: '神栖のピーマン畑', item: 4, amount: 2, text: '農家さんの箱づめをお手伝い。ピーマンを２つ分けてもらった！' },
    { tile: 10, name: '霞ヶ浦の蓮田', item: 0, amount: 2, text: '蓮田の農家さんをお手伝い。れんこんを２つ分けてもらった！' },
    { tile: 5, name: '鉾田の市場', item: 1, amount: 2, text: '市場の荷運びをお手伝い。メロンを２つ分けてもらった！' },
    { tile: 2, name: '笠間の直売所', item: 2, amount: 2, text: '直売所のお手伝い。栗を２つ分けてもらった！' },
    { tile: 22, name: '港の資材置き場', item: 3, amount: 2, text: '大工さんの片づけをお手伝い。使ってよい木材を２つ分けてもらった！' },
    { tile: 25, name: '林の落ち枝', item: 3, amount: 2, text: '足もとの落ち枝を拾った。木材は拠点づくりに使えるよ。' },
  ],
  quests: [
    { id: 'koharu', tile: 13, name: '港の料理人 こはる', item: 4, count: 2, reward: 8, text: '港の食堂を開きたいの。神栖のピーマンを２つ、届けてくれる？' },
    { id: 'souta', tile: 8, name: '旅人 そうた', item: 2, count: 2, reward: 7, text: '旅のおみやげに、栗を２つ探しているよ。' },
  ],
  neighbors: [{name:'福島県',direction:'北'}, {name:'栃木県',direction:'西'}, {name:'埼玉県',direction:'南西の一部'}, {name:'千葉県',direction:'南'}],
};
export const rules = { maxRounds: 8, upgradeCoins: 8, upgradeWood: 3, flag: 12, rocks: [7,17], playerHome: 20, enemyHome: 4 };
