// Gera os assets de ORIGEM em assets/ (consumidos por @capacitor/assets) a
// partir da marca em public/owl_cropped.png. Rode: node scripts/gen-source-assets.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OWL = 'public/owl_cropped.png';
const OUT = 'assets';
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const DARK = { r: 15, g: 14, b: 26, alpha: 1 }; // #0F0E1A (tema escuro)

await mkdir(OUT, { recursive: true });

// Redimensiona a coruja para uma altura alvo (mantém proporção), devolve buffer+dims.
async function owlAt(height) {
  const { data, info } = await sharp(OWL)
    .resize({ height, fit: 'inside' })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// Versão BRANCA da coruja (usa o alfa como silhueta) para fundo escuro.
async function whiteOwlAt(height) {
  const { data, w, h } = await owlAt(height);
  const alpha = await sharp(data).extractChannel('alpha').toBuffer();
  const out = await sharp({ create: { width: w, height: h, channels: 3, background: WHITE } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  return { data: out, w, h };
}

// Canvas sólido WxH com a coruja centralizada.
async function compose({ size, bg, owl, flatten = false, file }) {
  const canvas = sharp({ create: { width: size, height: size, channels: flatten ? 3 : 4, background: bg } });
  let img = canvas.composite([{ input: owl.data, gravity: 'center' }]).png();
  if (flatten) img = img.flatten({ background: bg }).removeAlpha(); // opaco, sem transparência
  await img.toFile(`${OUT}/${file}`);
  console.log(`✓ ${file} (${size}x${size}) coruja ${owl.w}x${owl.h}`);
}

// 1) icon.png 1024 — coruja centralizada em fundo branco sólido, com respiro, sem alfa.
await compose({ size: 1024, bg: WHITE, owl: await owlAt(600), flatten: true, file: 'icon.png' });

// 2) icon-foreground.png 1024 — só a coruja, MUITO padding, fundo transparente (adaptativo).
await compose({ size: 1024, bg: { r: 0, g: 0, b: 0, alpha: 0 }, owl: await owlAt(500), file: 'icon-foreground.png' });

// 3) icon-background.png 1024 — fundo branco sólido.
await sharp({ create: { width: 1024, height: 1024, channels: 3, background: WHITE } })
  .png()
  .toFile(`${OUT}/icon-background.png`);
console.log('✓ icon-background.png (1024x1024) branco sólido');

// 4) splash.png 2732 — fundo branco da marca, coruja centralizada.
await compose({ size: 2732, bg: WHITE, owl: await owlAt(820), flatten: true, file: 'splash.png' });

// 5) splash-dark.png 2732 — fundo escuro da marca, coruja BRANCA centralizada.
await compose({ size: 2732, bg: DARK, owl: await whiteOwlAt(820), flatten: true, file: 'splash-dark.png' });

console.log('Pronto.');
