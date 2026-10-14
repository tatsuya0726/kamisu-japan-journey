/** Images enhance the game; failed or stalled downloads never gate its UI. */
export function watchImages(root:HTMLElement){
 const seen=new WeakSet<HTMLImageElement>();
 const placeholder='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="12" fill="#e9bc70"/><text x="48" y="60" text-anchor="middle" font-size="40" fill="#183f49">猫</text></svg>');
 const inspect=()=>root.querySelectorAll('img').forEach(img=>{if(seen.has(img))return;seen.add(img);let done=false;const finish=(failed=false)=>{if(done)return;done=true;clearTimeout(timer);if(failed){img.dataset.fallback='true';img.src=placeholder;}};const timer=setTimeout(()=>finish(!img.complete||!img.naturalWidth),8000);img.addEventListener('load',()=>finish(),{once:true});img.addEventListener('error',()=>finish(true),{once:true});if(img.complete)finish(!img.naturalWidth);});
 new MutationObserver(inspect).observe(root,{childList:true,subtree:true});inspect();
}
