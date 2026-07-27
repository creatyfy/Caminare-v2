import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

// Screenshots do paywall p/ "App Review screenshot" das assinaturas na App Store
// Connect. Tamanho iPhone 6.5" (1242 x 2688, retrato). Encaixe centralizado
// (letterbox) mantendo proporção, fundo claro #F4F2FB, sem distorcer, PNG.
const W = 1242, H = 2688;
const BG = { r: 0xF4, g: 0xF2, b: 0xFB, alpha: 1 }; // #F4F2FB

const JOBS = [
  {
    src: 'public/telas/Captura de tela 2026-07-10 092254.png', // aba Mensal
    out: 'public/store/paywall-mensal-1242x2688.png',
  },
  {
    src: 'public/telas/Captura de tela 2026-07-10 092318.png', // aba Anual
    out: 'public/store/paywall-anual-1242x2688.png',
  },
];

await mkdir(path.resolve('public/store'), { recursive: true });

for (const job of JOBS) {
  const srcPath = path.resolve(job.src);
  const outPath = path.resolve(job.out);
  const meta = await sharp(srcPath).metadata();

  await sharp(srcPath)
    .resize(W, H, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  const outMeta = await sharp(outPath).metadata();
  console.log(`${job.src}  (${meta.width}x${meta.height})  ->  ${job.out}  (${outMeta.width}x${outMeta.height})`);
}
