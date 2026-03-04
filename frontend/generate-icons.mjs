import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });
mkdirSync('./public/screenshots', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#080808"/>
  
  <!-- Wings -->
  <ellipse cx="90" cy="360" rx="70" ry="110" fill="#111" stroke="#E8FF47" stroke-width="8"
    transform="rotate(-15 90 360)"/>
  <ellipse cx="422" cy="360" rx="70" ry="110" fill="#111" stroke="#E8FF47" stroke-width="8"
    transform="rotate(15 422 360)"/>

  <!-- Body -->
  <ellipse cx="256" cy="380" rx="130" ry="145" fill="#111" stroke="#E8FF47" stroke-width="8"/>
  
  <!-- Chest rings -->
  <ellipse cx="256" cy="400" rx="80" ry="100" fill="none" stroke="rgba(232,255,71,0.15)" stroke-width="4"/>
  <ellipse cx="256" cy="420" rx="48" ry="62" fill="none" stroke="rgba(232,255,71,0.08)" stroke-width="3"/>

  <!-- Head -->
  <ellipse cx="256" cy="210" rx="140" ry="130" fill="#111" stroke="#E8FF47" stroke-width="8"/>

  <!-- Ear tufts -->
  <polygon points="136,110 104,18 184,90" fill="#111" stroke="#E8FF47" stroke-width="8" stroke-linejoin="round"/>
  <polygon points="376,110 408,18 328,90" fill="#111" stroke="#E8FF47" stroke-width="8" stroke-linejoin="round"/>

  <!-- Facial disc -->
  <ellipse cx="256" cy="218" rx="110" ry="100" fill="none" stroke="rgba(232,255,71,0.2)" stroke-width="5"/>

  <!-- Left eye -->
  <ellipse cx="192" cy="200" rx="50" ry="55" fill="#0a0a0a" stroke="#E8FF47" stroke-width="7"/>
  <ellipse cx="192" cy="205" rx="32" ry="35" fill="#E8FF47"/>
  <circle cx="208" cy="188" r="12" fill="#fff" opacity="0.9"/>
  <circle cx="178" cy="214" r="5" fill="#fff" opacity="0.35"/>

  <!-- Right eye -->
  <ellipse cx="320" cy="200" rx="50" ry="55" fill="#0a0a0a" stroke="#E8FF47" stroke-width="7"/>
  <ellipse cx="320" cy="205" rx="32" ry="35" fill="#E8FF47"/>
  <circle cx="336" cy="188" r="12" fill="#fff" opacity="0.9"/>
  <circle cx="306" cy="214" r="5" fill="#fff" opacity="0.35"/>

  <!-- Beak -->
  <polygon points="256,256 228,296 284,296" fill="#E8FF47" opacity="0.85"/>
  <line x1="256" y1="256" x2="256" y2="296" stroke="#080808" stroke-width="3"/>

  <!-- Talons -->
  <line x1="196" y1="500" x2="178" y2="512" stroke="#E8FF47" stroke-width="9" stroke-linecap="round"/>
  <line x1="216" y1="504" x2="208" y2="512" stroke="#E8FF47" stroke-width="9" stroke-linecap="round"/>
  <line x1="236" y1="506" x2="236" y2="512" stroke="#E8FF47" stroke-width="9" stroke-linecap="round"/>
  <line x1="276" y1="506" x2="276" y2="512" stroke="#E8FF47" stroke-width="9" stroke-linecap="round"/>
  <line x1="296" y1="504" x2="304" y2="512" stroke="#E8FF47" stroke-width="9" stroke-linecap="round"/>
  <line x1="316" y1="500" x2="334" y2="512" stroke="#E8FF47" stroke-width="9" stroke-linecap="round"/>
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