import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const navy = '#102833';
const foam = '#F4FBFC';
const teal = '#0C6E6A';
const amber = '#C47B2B';
const blue = '#1D4E89';

function svg({ padding, background, mono = false }) {
  const bg = background ? `<rect width="1024" height="1024" fill="${background}"/>` : '';
  const x = padding;
  const y = padding;
  const size = 1024 - padding * 2;
  const plate = mono ? '' : `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="${navy}"/>`;
  const stroke = mono ? '#FFFFFF' : foam;
  const nodes = [
    [0.28, 0.34, mono ? '#FFFFFF' : teal],
    [0.72, 0.3, mono ? '#FFFFFF' : blue],
    [0.5, 0.72, mono ? '#FFFFFF' : amber],
  ];
  const circles = nodes
    .map(([nx, ny, fill]) => {
      const cx = x + size * nx;
      const cy = y + size * ny;
      const r = size * 0.09;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${size * 0.018}"/>`;
    })
    .join('\n');
  const [a, b, c] = nodes.map(([nx, ny]) => [x + size * nx, y + size * ny]);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bg}
  ${plate}
  <path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} M${a[0]} ${a[1]} L${c[0]} ${c[1]} M${b[0]} ${b[1]} L${c[0]} ${c[1]}" fill="none" stroke="${stroke}" stroke-width="${size * 0.028}" stroke-linecap="round"/>
  ${circles}
</svg>`;
}

async function png(svgText, file, size) {
  await sharp(Buffer.from(svgText)).resize(size, size).png().toFile(file);
}

await mkdir('assets/images', { recursive: true });
await mkdir('public/icons', { recursive: true });

const regular = svg({ padding: 96, background: navy });
const maskable = svg({ padding: 210, background: navy });
const splash = svg({ padding: 180, background: null });
const foreground = svg({ padding: 200, background: null });
const mono = svg({ padding: 210, background: null, mono: true });

await png(regular, 'assets/images/icon.png', 1024);
await png(regular, 'assets/images/favicon.png', 48);
await png(splash, 'assets/images/splash-icon.png', 512);
await png(foreground, 'assets/images/android-icon-foreground.png', 1024);
await png(mono, 'assets/images/android-icon-monochrome.png', 1024);
await png(regular, 'public/icons/icon-192.png', 192);
await png(regular, 'public/icons/icon-512.png', 512);
await png(maskable, 'public/icons/icon-maskable-512.png', 512);
await png(regular, 'public/apple-touch-icon.png', 180);
await png(regular, 'public/favicon.png', 48);
console.log('Wrote Bot Fleet icons');
