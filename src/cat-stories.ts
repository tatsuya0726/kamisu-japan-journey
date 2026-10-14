export type CatStory={title:string,action:string,result:string};
export function nextIndex(length:number,last:number|undefined,random=Math.random):number{if(length<1)throw Error('Empty story set');if(length===1)return 0;const valid=Number.isInteger(last)&&Number(last)>=0&&Number(last)<length;const n=Math.min((valid?length-1:length)-1,Math.max(0,Math.floor(random()*(valid?length-1:length))));return valid&&n>=Number(last)?n+1:n;}
const key='kamisu.stories.last.v1';let previous:Record<string,number>={};try{const p=JSON.parse(localStorage.getItem(key)??'{}');if(p&&typeof p==='object'&&!Array.isArray(p))previous=Object.fromEntries(Object.entries(p).filter(([,v])=>Number.isInteger(v)&&Number(v)>=0)) as Record<string,number>;}catch{}
export function pickStory<T>(id:string,items:readonly T[]):T{const index=nextIndex(items.length,previous[id]);previous[id]=index;try{localStorage.setItem(key,JSON.stringify(previous));}catch{}return items[index];}
export const BANTER={
 start:['キキ「準備できた！」 ネネ「ごはんを分けて進もう」','ネネ「旗は持った？」 キキ「しっぽも元気！」','キキ「先を見てくるね」 ネネ「急がず、一緒にね」','ネネ「今日はどんな作戦？」 キキ「仲間に合わせよう！」'],
 win:['キキ「みんな、ありがとう！」 ネネ「おやつを分けよう」','ネネ「旗がきれいに揺れてる」 キキ「いい風だね！」','キキ「やったね！」 ネネ「休憩も大事な作戦だよ」','ネネ「町が静かになったね」 キキ「次はお散歩しよう！」'],
 lose:['キキ「ひと休みしよう」 ネネ「次は一緒に考えよう」','ネネ「みんな無事だね」 キキ「作戦を変えてみよう！」','キキ「ごはんをためすぎたかな」 ネネ「次に試してみよう」']
} as const;
export const EXTRA_STORIES:Record<string,CatStory[]>={
 ikisu:[{title:'葉っぱのしおり',action:'落ち葉の色を比べる',result:'キキ「金色を見つけた！」 ネネ「落ちた葉だけで、しおりにしよう」。猫たちは木陰で色を並べた。'},{title:'小さな休憩便',action:'猫仲間に水を届ける',result:'ネネが水の包みを確認し、キキが木陰まで運んだ。「ゆっくり休もうね」。猫仲間の休憩が始まった。'}],
 ishigami:[{title:'しっぽ色のリボン',action:'猫まつりのリボンを分ける',result:'キキ「クリーム色はこっち！」 ネネ「銀色もあるよ」。猫たちは同じ数ずつリボンを分けた。'},{title:'まるい雲のお話',action:'雲の形を見つける',result:'ネネ「お魚みたいな雲だね」 キキ「ぼくにはおにぎり！」。猫たちは空を見上げて笑った。'}],
 karuno:[{title:'猫の図書便',action:'猫仲間の本をそろえる',result:'キキが大きい本、ネネが小さい本を並べた。「包みは三つ。置き忘れなし！」。猫の読書会へ出発。'},{title:'地図の小さな印',action:'猫の旅地図に印をつける',result:'ネネ「帰り道も印をつけよう」 キキ「寄り道の木陰もね」。猫たちだけの旅地図ができた。'}],
 gallery:[{title:'風の色えんぴつ',action:'自分たちの絵を描く',result:'キキは波、ネネは雲を自分の紙に描いた。「二枚を並べると、ひとつの景色！」。壁には何も描かず持ち帰った。'},{title:'潮風の絵はがき',action:'猫仲間への便りを作る',result:'ネネ「青を少し足そう」 キキ「ぼくの足あとも！」。猫仲間へ渡す、オリジナルの絵はがきができた。'}],
 central:[{title:'木陰の配達',action:'猫仲間へ敷物を運ぶ',result:'キキが敷物、ネネがお弁当を持った。「荷物を分けると歩きやすいね」。木陰で猫のピクニック。'},{title:'丘を見ながらひと休み',action:'猫の休憩場所を選ぶ',result:'ネネ「ここなら涼しそう」 キキ「景色も見える！」。猫たちは通り道を空けて、のんびり腰を下ろした。'}],
 arena:[{title:'猫の応援リズム',action:'手拍子のリズムを合わせる',result:'キキ「ぱん、ぱん、ひと休み！」 ネネ「同じ速さでね」。猫たちだけの創作リレーに、やさしい応援が届いた。'},{title:'旗の忘れ物チェック',action:'猫チームの荷物を数える',result:'ネネ「旗が二本、水が二つ」 キキ「おやつも二つ！」。猫の創作大会に向けて、持ち物がそろった。'}],
 portpark:[{title:'地上からの船くらべ',action:'木陰で船の色を探す',result:'キキ「白い船だ！」 ネネ「あちらは青だね」。展望塔には入らず、公園の地上から港を眺めた。'},{title:'潮風の休憩便',action:'猫仲間の帽子を届ける',result:'ネネが帽子を押さえ、キキが木陰へ届けた。「風が気持ちいいね」。猫たちは地上の散歩を楽しんだ。'}]
};
