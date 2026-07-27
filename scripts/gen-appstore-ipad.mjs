import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('public/telas');
const OUT = path.resolve('public/store/appstore-ipad');
const W = 2048, H = 2732; // iPad Pro 12.9"
const BG = { r: 0xF4, g: 0xF2, b: 0xFB, alpha: 1 }; // #F4F2FB

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter(f => /\.png$/i.test(f));
const results = [];

for (const file of files) {
  const base = file.replace(/\.png$/i, '');
  const slug = base.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  const outName = `${slug}-2048x2732.png`;
  const srcPath = path.join(SRC, file);
  const meta = await sharp(srcPath).metadata();

  const resized = await sharp(srcPath)
    .resize(W, H, { fit: 'contain', background: BG }) // letterbox centralizado
    .flatten({ background: BG })                       // remove transparência
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(resized).toFile(path.join(OUT, outName));
  results.push({ src: file, srcSize: `${meta.width}x${meta.height}`, out: outName });
}

for (const r of results) {
  console.log(`${r.src}  (${r.srcSize})  ->  ${r.out}`);
}
console.log(`\nTotal: ${results.length} imagens em public/store/appstore-ipad/`);
