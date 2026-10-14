/** Runtime art: approved main cats, two companions and map.
 * Claude's animation integration should add a separate adapter; never replace source animations.
 */
export const CAT_ART = {
  url: `${import.meta.env.BASE_URL}defense/cats.png`,
  provisional: false,
  frames: [
    {left:0,right:.263}, {left:.263,right:.512},
    {left:.512,right:.769}, {left:.769,right:1}
  ]
};
export const APPROVED_ART = {
 silver: `${import.meta.env.BASE_URL}defense/approved/silver.png`,
 cream: `${import.meta.env.BASE_URL}defense/approved/cream.png`,
 map: `${import.meta.env.BASE_URL}defense/approved/kamisu-map.png`
};
export const CAT_TIPS = [
 '少ないごはんで呼べる前衛。まずはこの子から。',
 '体力が高い守り役。遠距離ネコを後ろで守ろう。',
 '前の仲間を越えて攻撃。盾ネコと組ませよう。',
 '足が速い攻め役。空いた前線をすばやく進もう。',
 '木剣を持ったキキ。少し長い間合いから、強い一撃。',
 'おさかなを運ぶキキ。いちばん速く進み、素早く応援する。',
 '翼をつけたネネ。遠くから応援するが、敵の攻撃は受ける。',
 'もこもこガードのネネ。ごはんは多く必要だが、長く前線を支える。',
 'ローラーを持った応援役。いちばん遠くまで届くが、次の攻撃には時間がかかる。',
 '道着姿の前衛。間合いは短いが、すばやい連続攻撃が得意。'
];

export const CAT_SPRITES = ['cream','silver','farmer','courier','kiki-sword','kiki-fish','nene-wings','nene-guard','artist','karate'];
