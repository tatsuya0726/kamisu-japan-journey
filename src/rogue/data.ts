/** Static content for the turn-based roguelike run ("遠征"). Pure data: no DOM, no randomness. */
import pack from '../data/mission-pack.json' with {type:'json'};
import {LANDMARKS} from '../local-walk.ts';

export type SkillT={id:string;name:string;cost:number;target:'foe'|'foes'|'ally'|'allies';kind:'dmg'|'heal'|'shield';power:number;hits?:number;mul?:number;turns?:number;note:string};
export const SKILLS:Record<string,SkillT>={
 scratch:{id:'scratch',name:'ひっかき連打',cost:3,target:'foe',kind:'dmg',power:.75,hits:2,note:'1体に2回ひっかく'},
 pounce:{id:'pounce',name:'とびかかり',cost:6,target:'foe',kind:'dmg',power:1.9,note:'1体に強い一撃'},
 fluffguard:{id:'fluffguard',name:'ふわふわガード',cost:4,target:'allies',kind:'shield',power:0,mul:.6,turns:3,note:'3ターン、全員の受けるダメージを減らす'},
 pet:{id:'pet',name:'なでなでヒール',cost:5,target:'ally',kind:'heal',power:.4,note:'仲間1人のHPを回復'},
 veggie:{id:'veggie',name:'野菜なげ',cost:6,target:'foes',kind:'dmg',power:.8,note:'敵全体にダメージ'},
 express:{id:'express',name:'急便アタック',cost:4,target:'foe',kind:'dmg',power:1.5,note:'すばやい一撃'},
 slash:{id:'slash',name:'木剣斬り',cost:6,target:'foe',kind:'dmg',power:2.2,note:'1体に大ダメージ'},
 fishslap:{id:'fishslap',name:'おさかなビンタ',cost:6,target:'foe',kind:'dmg',power:.6,hits:3,note:'1体に3回ビンタ'},
 tailwind:{id:'tailwind',name:'追い風',cost:7,target:'allies',kind:'heal',power:.25,note:'全員のHPを回復'},
 bigshield:{id:'bigshield',name:'大盾',cost:6,target:'allies',kind:'shield',power:0,mul:.45,turns:3,note:'3ターン、全員の受けるダメージを大きく減らす'},
 colors:{id:'colors',name:'色あざやか',cost:8,target:'foes',kind:'dmg',power:1.05,note:'敵全体に強めのダメージ'},
 fist:{id:'fist',name:'正拳突き',cost:6,target:'foe',kind:'dmg',power:2.4,note:'1体に大ダメージ'}
};

export type MemberT={id:string;name:string;art:string;hp:number;mp:number;atk:number;def:number;spd:number;skills:string[];blurb:string};
export const MEMBERS:Record<string,MemberT>={
 kiki:{id:'kiki',name:'キキ',art:'cream',hp:96,mp:14,atk:17,def:6,spd:12,skills:['scratch','pounce'],blurb:'クリーム色。いちばんのバランス型'},
 nene:{id:'nene',name:'ネネ',art:'silver',hp:124,mp:18,atk:11,def:9,spd:8,skills:['fluffguard','pet'],blurb:'銀色。守りと回復が得意'},
 farmer:{id:'farmer',name:'農家猫',art:'farmer',hp:78,mp:16,atk:14,def:5,spd:9,skills:['veggie'],blurb:'野菜で敵全体を攻撃'},
 courier:{id:'courier',name:'配達猫',art:'courier',hp:80,mp:12,atk:14,def:5,spd:19,skills:['express'],blurb:'いつも先に動く'},
 'kiki-sword':{id:'kiki-sword',name:'木剣キキ',art:'kiki-sword',hp:104,mp:12,atk:21,def:7,spd:10,skills:['slash'],blurb:'一撃が重い'},
 'kiki-fish':{id:'kiki-fish',name:'おさかなキキ',art:'kiki-fish',hp:84,mp:14,atk:14,def:5,spd:16,skills:['fishslap'],blurb:'3連続ビンタ'},
 'nene-wings':{id:'nene-wings',name:'翼ネネ',art:'nene-wings',hp:90,mp:20,atk:12,def:6,spd:13,skills:['tailwind'],blurb:'全員を回復'},
 'nene-guard':{id:'nene-guard',name:'ガードネネ',art:'nene-guard',hp:170,mp:10,atk:10,def:13,spd:5,skills:['bigshield'],blurb:'とても頑丈で全員を守る'},
 artist:{id:'artist',name:'絵描き猫',art:'artist',hp:80,mp:20,atk:14,def:5,spd:10,skills:['colors'],blurb:'敵全体に強めの攻撃'},
 karate:{id:'karate',name:'空手猫',art:'karate',hp:98,mp:12,atk:20,def:6,spd:15,skills:['fist'],blurb:'すばやく強い'}
};
export const RECRUITS=Object.keys(MEMBERS).filter(id=>id!=='kiki'&&id!=='nene');

export type MoveT={n:string;p:number;w:number;all?:boolean;buff?:'atkUp'|'guard'|'healSelf'};
export type FoeT={id:string;name:string;art:string;hp:number;atk:number;def:number;spd:number;h:number;moves:MoveT[]};
const nm=(id:string)=>pack.enemies.find(e=>e.id===id)?.name??id;
const x=(id:string,hp:number,atk:number,def:number,spd:number,h:number,moves:MoveT[]):FoeT=>({id,name:nm(id),art:'extra-'+id,hp,atk,def,spd,h,moves});
export const FOES:Record<string,FoeT>={
 buzz_bee:x('buzz_bee',30,13,2,16,70,[{n:'つんつん刺し',p:1,w:1}]),
 bee_swarm:x('bee_swarm',42,12,2,13,92,[{n:'ぐるぐる行進',p:.55,w:2,all:true},{n:'つんつん刺し',p:1,w:1}]),
 bubble_fish:x('bubble_fish',38,14,3,9,84,[{n:'あわあわ弾',p:1,w:2},{n:'あわあわ大ぶり',p:1.4,w:1}]),
 spring_mullet:x('spring_mullet',34,15,2,20,86,[{n:'ぴょん体当たり',p:1.1,w:1}]),
 crab_drummer:x('crab_drummer',58,12,4,8,96,[{n:'タイコ連打',p:.5,w:2,all:true},{n:'応援のリズム',p:0,w:1,buff:'atkUp'}]),
 wind_kite:x('wind_kite',36,14,2,15,92,[{n:'すれ違いざま',p:1,w:2},{n:'ひゅるり急降下',p:1.5,w:1}]),
 pepper_marun:x('pepper_marun',92,15,7,5,104,[{n:'どすん',p:1.2,w:2},{n:'もりもりガード',p:0,w:1,buff:'guard'}]),
 wave_pukkun:x('wave_pukkun',66,14,4,10,108,[{n:'なみなみビンタ',p:1,w:2},{n:'ざぶーん',p:.6,w:1,all:true}]),
 pine_mokomaru:x('pine_mokomaru',112,14,9,4,112,[{n:'ごろごろ転がる',p:1,w:2},{n:'どっしり構え',p:0,w:1,buff:'guard'}]),
 can_robot:x('can_robot',76,16,6,8,104,[{n:'かんかんパンチ',p:1,w:2},{n:'ごみ集め',p:0,w:1,buff:'healSelf'}]),
 rattle_rider:x('rattle_rider',64,18,4,17,106,[{n:'ガタゴト突撃',p:1.3,w:2},{n:'うるさい空ぶかし',p:.5,w:1,all:true}]),
 chinpira:{id:'chinpira',name:'いたずらチンピラ',art:'enemy0',hp:46,atk:15,def:3,spd:11,h:110,moves:[{n:'いたずら',p:1,w:1}]},
 gang:{id:'gang',name:'ハット・ギャング',art:'enemy1',hp:60,atk:17,def:4,spd:9,h:110,moves:[{n:'へなちょこ投げ',p:1,w:2},{n:'帽子ぶんぶん',p:.6,w:1,all:true}]}
};
export type BossT=FoeT&{pattern:'sardine'|'crab'|'boss';title:string};
export const BOSSES:BossT[]=[
 {...x('giant_sardine',320,19,5,7,150,[]),pattern:'sardine',title:'港のぬし'},
 {...x('crab_drummer',520,22,8,8,150,[]),name:'カニカニ太鼓団・親方',pattern:'crab',title:'海岸のリズム番長'},
 {id:'boss',name:'スーツの親分',art:'enemy3',hp:800,atk:27,def:10,spd:9,h:170,moves:[],pattern:'boss',title:'ラスボス'}
];
/** Normal foes available at each place, taken from that place's designed missions (bosses excluded). */
const LOC_IDS=['ikisu_shrine','ishigami_kindergarten','karuno_elementary','thousand_people_gallery','kamisu_central_park','kamisu_disaster_arena','minato_park'];
export const PLACE_POOLS:string[][]=LOC_IDS.map(l=>{const ids=new Set<string>();for(const m of pack.missions)if(m.location_id===l)for(const id of m.enemy_ids)if(FOES[id])ids.add(id);return [...ids];});
export const PLACE_BG=LANDMARKS.map(l=>l.background);
export const BOSS_BG=['port','coast','town'];
export const BOSS_PLACE=['鹿島港','波崎海岸','大野原のまち'];
export const CHAPTER=[{hp:1,atk:1,def:1},{hp:1.55,atk:1.3,def:1.3},{hp:2.15,atk:1.6,def:1.6}];

export type ItemT={id:string;name:string;price:number;note:string};
export const ITEMS:Record<string,ItemT>={
 onigiri:{id:'onigiri',name:'おにぎり',price:12,note:'仲間1人のHPを45%回復'},
 kankan:{id:'kankan',name:'ねこ缶',price:10,note:'仲間1人の気力を8回復'},
 matatabi:{id:'matatabi',name:'またたび',price:26,note:'倒れた仲間をHP35%で起こす'},
 feast:{id:'feast',name:'ごちそう',price:34,note:'全員のHPを40%回復'}
};
export type PerkT={id:string;name:string;note:string};
export const PERKS:PerkT[]=[
 {id:'hp',name:'もこもこ毛並み',note:'全員の最大HP+15%'},
 {id:'atk',name:'するどい爪',note:'全員のこうげき+12%'},
 {id:'def',name:'ふかふか肉球',note:'全員のぼうぎょ+15%'},
 {id:'mp',name:'まるい気力玉',note:'全員の最大気力+6'},
 {id:'purr',name:'ごろごろ喉',note:'戦闘後、全員のHPを6%回復'},
 {id:'lucky',name:'招きねこの小判',note:'戦闘のかつおぶし+50%'},
 {id:'first',name:'先手必勝',note:'戦闘の最初のターン、全員ぼうぎょ状態'}
];
export type Outcome={text:string;gold?:number;heal?:number;hurt?:number;item?:string;xp?:number;mp?:number;maxHp?:number;recruit?:boolean};
export type EventT={id:string;title:string;text:string;choices:{label:string;outs:(Outcome&{w:number})[]}[]};
export const EVENTS:EventT[]=[
 {id:'chime',title:'風鈴の音',text:'木陰に風鈴がつるされている。涼しい音が、疲れた体にしみる。',choices:[{label:'音に耳をすませる',outs:[{w:1,text:'ぐっすり休めた。全員のHPが回復した。',heal:.3}]},{label:'風鈴をゆずってもらう',outs:[{w:1,text:'おばあさん猫から「またたび」をもらった。',item:'matatabi'},{w:1,text:'風鈴は売り切れていた。かわりにかつおぶしを少し拾った。',gold:8}]}]},
 {id:'chest',title:'ごそごそ宝箱',text:'道ばたの箱が、ごそごそ動いている。',choices:[{label:'あける',outs:[{w:3,text:'かつおぶしがぎっしり入っていた！',gold:24},{w:2,text:'中からとびだした何かに、ひっかかれた。',hurt:.12}]},{label:'そっとしておく',outs:[{w:1,text:'何も起きなかった。少し気力が回復した。',mp:3}]}]},
 {id:'lost',title:'迷子の子猫',text:'迷子の子猫が、小さく鳴いている。',choices:[{label:'送りとどける',outs:[{w:1,text:'子猫の家族から、お礼のおにぎりをもらった。',item:'onigiri',xp:12}]},{label:'ごはんを少し分ける',outs:[{w:1,text:'子猫は元気になった。みんなも気分が上がった。',xp:20}]}]},
 {id:'stall',title:'ねこの屋台',text:'屋台のにおいが、風にのって流れてくる。',choices:[{label:'名物を食べる',outs:[{w:3,text:'おいしい！ 全員のHPが回復した。',heal:.25},{w:1,text:'ものすごく辛かった…。',hurt:.1}]},{label:'お店のお手伝いをする',outs:[{w:1,text:'お手伝いのお礼に、かつおぶしをもらった。',gold:16}]}]},
 {id:'training',title:'とっくん場',text:'広い場所で、ふしぎな猫が稽古をしている。',choices:[{label:'一緒にとっくんする',outs:[{w:1,text:'くたくたになったが、強くなった気がする。',xp:34,hurt:.1}]},{label:'見学して休む',outs:[{w:1,text:'のんびり見学。気力が回復した。',mp:6}]}]},
 {id:'traveler',title:'旅の猫',text:'荷物を下ろして休んでいる旅の猫がいる。一緒に行かないかと誘えそうだ。',choices:[{label:'仲間にさそう',outs:[{w:2,text:'旅の猫が仲間になった！',recruit:true},{w:1,text:'「また今度ね」と断られ、かわりにおにぎりをもらった。',item:'onigiri'}]},{label:'あいさつだけする',outs:[{w:1,text:'手をふって別れた。',gold:6}]}]},
 {id:'kite',title:'風まかせの凧',text:'空高く、凧が気持ちよさそうに泳いでいる。糸の先に、何かぶら下がっている。',choices:[{label:'糸をたぐる',outs:[{w:1,text:'ぶら下がっていたのは「ねこ缶」だった。',item:'kankan'},{w:1,text:'糸が切れて、しりもちをついた。',hurt:.08}]},{label:'ながめる',outs:[{w:1,text:'空を見上げて、のんびりした。',heal:.1,mp:2}]}]},
 {id:'well',title:'ふしぎな水たまり',text:'水たまりに、きれいな空がうつっている。のぞくと、体の力がわいてくる気がする。',choices:[{label:'水を飲む',outs:[{w:1,text:'体の中から力がわいた。最大HPが上がった！',maxHp:8},{w:1,text:'ちょっとおなかをこわした…。',hurt:.1}]},{label:'顔を洗う',outs:[{w:1,text:'さっぱりした。気力が回復した。',mp:4}]}]}
];
