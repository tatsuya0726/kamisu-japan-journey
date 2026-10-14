$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
public static class EnemyAlpha {
 public static Rectangle Bounds(Bitmap b) {
  int l=b.Width,t=b.Height,r=0,d=0;
  for(int y=0;y<b.Height;y++)for(int x=0;x<b.Width;x++)if(b.GetPixel(x,y).A>8){l=Math.Min(l,x);t=Math.Min(t,y);r=Math.Max(r,x+1);d=Math.Max(d,y+1);}
  return Rectangle.FromLTRB(l,t,r,d);
 }
}
'@
$source=Join-Path $PSScriptRoot '../.local-assets/enemies'
$dest=Join-Path $PSScriptRoot '../public/defense/runtime'
$manifest=Get-Content (Join-Path $source 'manifest.json') -Raw -Encoding utf8 | ConvertFrom-Json
$records=@()
foreach($a in $manifest.assets){
 $inputPath=Join-Path $source $a.file_name
 $hash=(Get-FileHash -LiteralPath $inputPath -Algorithm SHA256).Hash.ToLowerInvariant()
 if($hash -ne $a.sha256){throw "Source checksum mismatch: $($a.id)"}
 $im=[System.Drawing.Bitmap]::FromFile($inputPath)
 $bounds=[EnemyAlpha]::Bounds($im)
 $long=if($a.id -eq 'giant_sardine'){384}else{256}
 $scale=($long-8)/[math]::Max($bounds.Width,$bounds.Height)
 $w=[int][math]::Round($bounds.Width*$scale);$h=[int][math]::Round($bounds.Height*$scale)
 $out=New-Object System.Drawing.Bitmap ($w+8),($h+8)
 $g=[System.Drawing.Graphics]::FromImage($out)
 $g.Clear([System.Drawing.Color]::Transparent)
 $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $g.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
 $g.DrawImage($im,[System.Drawing.Rectangle]::new(4,4,$w,$h),$bounds,[System.Drawing.GraphicsUnit]::Pixel)
 $target=Join-Path $dest ('extra-'+$a.id+'.png')
 $out.Save($target,[System.Drawing.Imaging.ImageFormat]::Png)
 $records+=@{id=$a.id;file=('extra-'+$a.id+'.png');source_sha256=$hash;source_bytes=(Get-Item $inputPath).Length;bytes=(Get-Item $target).Length;width=$out.Width;height=$out.Height;alpha_crop=@($bounds.X,$bounds.Y,$bounds.Width,$bounds.Height);facing='left';pose='static';foot_y=($h+4)/($h+8)}
 $g.Dispose();$out.Dispose();$im.Dispose()
}
$records | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $PSScriptRoot '../src/data/enemy-art.json') -Encoding utf8
$records | ForEach-Object {[PSCustomObject]$_} | Select-Object id,width,height,bytes | Format-Table
Write-Output ('Total runtime bytes: '+(($records | ForEach-Object {$_.bytes}) | Measure-Object -Sum).Sum)
