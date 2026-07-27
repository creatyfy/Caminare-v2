import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('public/telas');
const OUT = path.resolve('public/store/appstore');
const W = 1242, H = 2688;
const BG = { r: 0xF4, g: 0xF2, b: 0xFB, alpha: 1 }; // #F4F2FB

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter(f => /\.png$/i.test(f));
const results = [];

for (const file of files) {
  const base = file.replace(/\.png$/i, '');
  // sanitize: espaços -> hifen, colapsar hifens
  const slug = base.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  const outName = `${slug}-1242x2688.png`;
  const srcPath = path.join(SRC, file);
  const meta = await sharp(srcPath).metadata();

  // encaixe centralizado mantendo proporção (letterbox)
  const resized = await sharp(srcPath)
    .resize(W, H, { fit: 'contain', background: BG })
    .flatten({ background: BG })       // remove qualquer transparência
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(resized).toFile(path.join(OUT, outName));
  results.push({ src: file, srcSize: `${meta.width}x${meta.height}`, out: outName });
}

for (const r of results) {
  console.log(`${r.src}  (${r.srcSize})  ->  ${r.out}`);
}
console.log(`\nTotal: ${results.length} imagens em public/store/appstore/`);
