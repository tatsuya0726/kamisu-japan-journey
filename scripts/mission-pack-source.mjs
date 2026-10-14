import {writeFileSync,mkdirSync} from 'node:fs';
// Lossless compact transcription: repeated fields are expanded by this assembler.
export const fiction='実在の場所を舞台にした架空のゲーム事件です。実際の出来事・施設の状況を示すものではありません。';
export const notes=['既存の3戦闘ステージ・21小話を上書きしない追加ミッション。','会話の追加だけでは実装済みに数えない。敵配置・勝敗条件・報酬を接続してから公開。'];
export const enemyRows=[
 ['buzz_bee','ぶんぶん偵察バチ','scout',.65,1.45,'丸い黄色いハチ。小さなゴーグルと、花粉色のほっぺ。','細い列で進み、軽い一撃で後退する。','花の道しるべを見つけ、画面外の架空の花畑へ帰る。'],
 ['bee_swarm','ぐるぐるハチ大行列','swarm',1.3,1.15,'5匹の丸いハチが、ゆるい渦の形で飛ぶ。','先頭が止まると全員ぐるぐる。足止めに弱い。','隊列がハート形になり、全員で帰っていく。'],
 ['bubble_fish','ぷくぷく泡さかな','ranged',.85,.85,'泡ヘルメットをかぶった青い魚。ぽってりした唇。','遠くからシャボン玉を飛ばし、猫の動きを少し遅くする。','不思議な帰海バブルに入り、海の方向へふわふわ帰る。'],
 ['spring_mullet','ぴょんぴょんボラ','runner',.75,1.75,'銀色の魚。尾びれがばねのようにくるんと丸い。','予告マークの後に短いダッシュ。着地時はひと休み。','跳びすぎを反省し、帰海バブルの順番を待つ。'],
 ['giant_sardine','どでかイワシ大将','boss',9,.3,'砂に乗り上げた青銀色の巨大イワシ。困り眉。','大きなしっぽで砂の波を起こす。体当たりはしない。','魔法のふわふわ潮に運ばれ、海で大きくお辞儀する。'],
 ['crab_drummer','カニカニ太鼓団','support',1.5,.65,'赤いカニ。貝殻の太鼓を肩から下げ、二本のはさみで演奏。','太鼓で近くの仲間を加速。演奏前に足を止める。','音量を下げて、楽しい小さな拍子で退場する。'],
 ['wind_kite','いたずら雲だこ','flier',.7,1.3,'白い雲の顔が描かれた紙凧。水色の尾がひらひら。','ふわっと進み、風の予告の後だけ加速する。','架空の風ポケットへ戻り、空に笑顔を描く。'],
 ['pepper_marun','ピーマルン','tank',3.1,.55,'緑の丸いピーマン妖精。短い手足と葉っぱの帽子。完全オリジナル。','ころころ突進する丈夫な前衛。転がった後に目が回る。','応援されるとうれしくなり、行列の案内係になる。'],
 ['wave_pukkun','なみプックン','disruptor',2,.95,'青い波頭のついた丸いマスコット。白い泡のほっぺ。完全オリジナル。','泡の道を作り、後ろの敵を少し加速する。','小さな波の拍手で謝り、泡の道を消す。'],
 ['pine_mokomaru','まつモコ丸','blocker',3.7,.45,'茶色の松ぼっくりの体、緑の冠、眠そうな目。完全オリジナル。','ゆっくり進んで道に居眠り。起床予告の後に再移動。','目を覚まして道を空け、指定の休憩場所でお昼寝。'],
 ['rattle_rider','ガタゴトライダー','runner',1.4,1.5,'大人のライダー。顔が見えるヘルメットと、玩具のような小さなバイク。','ガタゴト音とともに走る。減速マークで一時停止する。','音の出る飾りを外し、エンジンを止めて押して帰る。'],
 ['can_robot','カラカンロボ','collector',2.3,.75,'銀色の空き缶風ロボ。磁石の手と左右ちがう丸い目。','磁石の予告後に落ち葉や缶を集め、ちょっと丈夫になる。','回収モードの向きを直し、散らかった道を片づける。']
];
export const pack={schema_version:'1.0.0',game_title:'神栖を守れ！！',language:'ja',pack_type:'additive_playable_mission_design',implementation_status:'content_design_only',existing_content:{combat_stages:3,smalltalk_scenes:21,action:'preserve'},characters:[{id:'kiki',name:'キキ',appearance:'クリーム色の猫'},{id:'nene',name:'ネネ',appearance:'シルバー色の猫'}],emotion_tags:['normal','smile','sleepy','yawn','surprised'],global_fiction_notice:'すべて架空のゲームストーリーです。実在の施設の事故、迷惑行為、害虫発生、災害の報告ではありません。人物・マスコット・事件は創作です。',safety_and_tone:[
 '攻撃演出は猫パンチの風・光・泡・音符。出血、負傷、死亡は描かない。','HPはいたずらパワーまたは落ち着くまでのゲージ。0になると退却・帰海・静音化。','ハチに関する行動はゲームの光る花マーカーのみ。現実の駆除・捕獲手順を含めない。','子どもの実名や容姿を登場させない。学校・園は架空のイベント時間などで演出。','バイクの相手は架空の大人。現実の個人・団体・地域住民を悪者にしない。','マスコット3種は完全オリジナルで、既存キャラクターの姿・設定を引用しない。','港公園の展望塔は閉鎖中という前提を維持し、入場・登塔・塔内ミッションを作らない。','巨大魚の救出は明確な魔法表現。現実の大型海洋生物へ近づくことや自力で押し戻すことを勧めない。'],balance_baseline:{reference:'通常の既存ザコ敵をHP=1.0、速度=1.0とする相対案。実装前に既存数値へ変換。',boss_scaling:'巨大イワシは本体1体。攻撃予告を長くし、支援敵を減らす時間を作る。'},enemies:enemyRows.map(([id,name,role,hp_multiplier,speed_multiplier,visual,behavior,peaceful_resolution])=>({id,name,role,hp_multiplier,speed_multiplier,visual,behavior,peaceful_resolution,damage_meaning:'HPはげんき・いたずらパワー。0で退却し、死亡や負傷は描かない。'})),missions:[]};
export function add(location_id,location,rows){rows.forEach((r,i)=>{const [title,premise,objective,enemy_ids,wave_concept,difficulty,intro,outro]=r;const lines=a=>a.map(([emotion,text],j)=>({speaker:j?'ネネ':'キキ',emotion,text}));pack.missions.push({id:location_id+'_ex_'+String(i+1).padStart(2,'0'),location_id,location,title,content_type:'playable_mission',status:'proposed_not_implemented',fiction_notice:fiction,premise,objective,enemy_ids,wave_concept,difficulty,introduction:lines(intro),outro:lines(outro),implementation_notes:location_id==='minato_park'?[...notes,'タワー入場や塔内探索なし。全戦闘・会話は公園の地上エリア。']:notes});});}
export function write(){mkdirSync('src/data',{recursive:true});writeFileSync('src/data/mission-pack.json',JSON.stringify(pack,null,2)+'\n');}
