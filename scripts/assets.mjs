import fs from 'node:fs';
fs.mkdirSync('public/assets',{recursive:true});
const palette={ink:'#263e3c',skin:'#f3cf94',hat:'#e9b95d',hatlight:'#ffe3a0',blue:'#548d95',darkblue:'#326577',red:'#c16e55',brown:'#8c6141',light:'#f8ebba',green:'#66824e',leaf:'#8fab61'};
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
function person(frame,dir,red=false){let b='',r=(x,y,w,h,c)=>b+=rect(x,y,w,h,palette[c]||c);const step=frame%2===1?1:frame===2?-1:0;const bob=frame%2;
 r(9,29,15,2,'#263e3c33');r(10,21,5,8-step,'darkblue');r(18,21,5,8+step,'darkblue');r(9,28-step,7,2,'ink');r(18,28+step,7,2,'ink');
 r(9,15+bob,15,10,red?'red':'blue');r(7,17+bob+step,3,7,'skin');r(24,17+bob-step,3,7,'skin');r(12,8+bob,11,9,'skin');
 if(dir!==3){r(dir===1?12:dir===2?21:14,12+bob,2,2,'ink');if(dir===0)r(20,12+bob,2,2,'ink');r(16,16+bob,3,1,'brown');}else r(12,8+bob,11,5,'brown');
 r(11,3+bob,12,7,'hat');r(8,8+bob,18,3,'hatlight');r(13,2+bob,8,2,'hatlight');r(dir===1?20:10,18+bob,5,7,'brown');r(12,17+bob,10,2,'light');return b;
}
for(const [name,red] of [['traveler',false],['neighbor',true]]){let body='';for(let d=0;d<4;d++)for(let f=0;f<4;f++)body+=`<g transform="translate(${f*32} ${d*32})">${person(f,d,red)}</g>`;fs.writeFileSync(`public/assets/${name}.svg`,svg(128,128,body));}
let tiles='';for(let t=0;t<4;t++){const base=['#a6b87c','#d1b47a','#73a4a7','#997a4f'][t];let b=rect(0,0,32,32,base);for(let y=3;y<32;y+=7)for(let x=2;x<32;x+=9)b+=rect((x+y)%30,y,t===2?7:2,t===2?1:2,['#90a96b','#bba06c','#a2c6bc','#b89965'][t]);if(t===3)for(let y=5;y<32;y+=9)b+=rect(0,y,32,2,'#785c43');tiles+=`<g transform="translate(${t*32} 0)">${b}</g>`;}fs.writeFileSync('public/assets/terrain.svg',svg(128,32,tiles));
const write=(key,w,h,parts)=>fs.writeFileSync(`public/assets/${key}.svg`,svg(w,h,parts));
let tree=rect(13,26,7,21,'#785842')+rect(17,28,4,16,'#a0774a');[[8,3,16,7],[3,10,27,9],[0,20,32,10],[5,29,23,7]].forEach(([x,y,w,h],i)=>tree+=rect(x,y,w,h,i%2?'#56794d':'#648951'));tree+=rect(6,13,9,4,'#89a55d')+rect(11,4,8,3,'#9cb768')+rect(23,22,7,5,'#456647');write('tree',32,48,tree);
let cottage=rect(8,36,80,40,'#c69460')+rect(12,42,72,30,'#b28154')+rect(8,69,80,7,'#886043')+rect(3,31,90,8,'#755139');for(let i=0;i<6;i++)cottage+=rect(8+i*6,26-i*4,80-i*12,5,i%2?'#bb7950':'#d18e58');cottage+=rect(21,44,15,17,'#f9d78a')+rect(60,44,15,17,'#f9d78a')+rect(43,44,13,32,'#374c44')+rect(27,44,2,17,'#77533e')+rect(66,44,2,17,'#77533e');write('cottage',96,80,cottage);
let tent=rect(3,45,75,6,'#82633e');for(let i=0;i<8;i++)tent+=rect(8+i*4,40-i*5,64-i*8,6,i%2?'#d0a06a':'#e2b87a');tent+=rect(33,27,14,19,'#395149')+rect(29,41,22,5,'#395149');write('tent',80,56,tent);
let stall=rect(5,18,54,29,'#a97c52')+rect(3,41,58,8,'#74543e')+rect(9,8,3,34,'#674e3a')+rect(52,8,3,34,'#674e3a');for(let i=0;i<6;i++)stall+=rect(i*10+2,4,10,14,i%2?'#f5d89a':'#b7674f');stall+=rect(12,25,40,10,'#e0b16b');for(let i=0;i<5;i++)stall+=rect(15+i*8,23,5,5,'#678853');write('stall',64,52,stall);
write('lotus',24,24,rect(6,4,12,4,'#f4dca5')+rect(3,8,18,10,'#f4dca5')+rect(6,18,12,3,'#f4dca5')+[[7,9],[14,9],[7,14],[14,14]].map(([x,y])=>rect(x,y,3,3,'#b69660')).join(''));
write('melon',24,24,rect(11,1,3,5,'#476b4a')+rect(5,6,14,3,'#79a65b')+rect(2,9,20,10,'#79a65b')+rect(6,19,12,3,'#79a65b')+[5,10,15].map(x=>rect(x,8,2,12,'#bad083')).join('')+rect(3,12,18,2,'#bad083'));
write('chestnut',24,24,rect(10,3,4,4,'#96603e')+rect(6,7,12,4,'#96603e')+rect(3,11,18,8,'#96603e')+rect(3,17,18,4,'#ca9759')+rect(6,21,12,2,'#ca9759'));
write('wood',24,24,rect(3,8,19,7,'#906747')+rect(2,10,4,8,'#d0a16b')+rect(4,16,17,5,'#ad8252')+rect(9,5,13,4,'#ad8252')+rect(6,10,14,1,'#ba9563'));
write('flag',24,36,rect(5,2,3,32,'#805b43')+rect(8,3,14,9,'#ebbb60')+rect(8,12,10,4,'#d5994c')+rect(2,33,10,3,'#805b43'));
write('rock',32,28,rect(8,3,15,4,'#85978c')+rect(3,7,25,15,'#85978c')+rect(1,17,30,7,'#657c75')+rect(6,7,10,4,'#b5bda1')+rect(24,10,4,12,'#526e6b'));
const sheet=svg(512,192,rect(0,0,512,192,'#eef0d2')+Array.from({length:4},(_,d)=>Array.from({length:4},(_,f)=>`<g transform="translate(${f*96+48} ${d*44+4})">${person(f,d)}</g>`).join('')).join(''));
fs.writeFileSync('public/assets/sprite-preview.svg',sheet);
console.log('Generated 4-direction × 4-frame character strips; shared 32×32 cells and bottom-center anchor.');
