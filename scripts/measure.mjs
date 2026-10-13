import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const files=walk('dist').map(file=>{const data=fs.readFileSync(file);return {file,bytes:data.length,gzipBytes:zlib.gzipSync(data).length};});
const result={generated:new Date().toISOString(),totalBytes:files.reduce((n,f)=>n+f.bytes,0),individualGzipBytes:files.reduce((n,f)=>n+f.gzipBytes,0),note:'File-size measurement only. Browser network time and FPS were not measured.',files};fs.writeFileSync('size-report.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
