import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });
mkdirSync('./public/screenshots', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate a simple Remmy icon — black bg, yellow cat emoji style
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#080808"/>
  
  <!-- Ears -->
  <polygon points="120,160 80,60 180,140" fill="#111" stroke="#E8FF47" stroke-width="8"/>
  <polygon points="392,160 432,60 332,140" fill="#111" stroke="#E8FF47" stroke-width="8"/>
  
  <!-- Head -->
  <circle cx="256" cy="260" r="160" fill="#111" stroke="#E8FF47" stroke-width="8"/>
  
  <!-- Eyes -->
  <ellipse cx="196" cy="240" rx="36" ry="40" fill="#0a0a0a" stroke="#E8FF47" stroke-width="6"/>
  <ellipse cx="316" cy="240" rx="36" ry="40" fill="#0a0a0a" stroke="#E8FF47" stroke-width="6"/>
  <ellipse cx="200" cy="244" rx="18" ry="22" fill="#E8FF47"/>
  <ellipse cx="320" cy="244" rx="18" ry="22" fill="#E8FF47"/>
  <circle cx="208" cy="234" r="6" fill="#fff" opacity="0.8"/>
  <circle cx="328" cy="234" r="6" fill="#fff" opacity="0.8"/>
  
  <!-- Nose -->
  <polygon points="256,278 242,294 270,294" fill="#E8FF47" opacity="0.8"/>
  
  <!-- Mouth -->
  <path d="M 228 304 Q 256 322 284 304" fill="none" stroke="#E8FF47" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  
  <!-- Whiskers left -->
  <line x1="80" y1="278" x2="196" y2="286" stroke="#E8FF47" stroke-width="3" opacity="0.4"/>
  <line x1="80" y1="298" x2="196" y2="296" stroke="#E8FF47" stroke-width="3" opacity="0.4"/>
  
  <!-- Whiskers right -->
  <line x1="432" y1="278" x2="316" y2="286" stroke="#E8FF47" stroke-width="3" opacity="0.4"/>
  <line x1="432" y1="298" x2="316" y2="296" stroke="#E8FF47" stroke-width="3" opacity="0.4"/>
</svg>
`;

const svgBuffer = Buffer.from(svgIcon);

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`./public/icons/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}

console.log('All icons generated!');