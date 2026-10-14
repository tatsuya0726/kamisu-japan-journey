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
 '足が速い攻め役。空いた前線をすばやく進もう。'
];

export const CAT_SPRITES = ['cream','silver','farmer','courier'];
