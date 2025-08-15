const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG icon template for vehicle tracking
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.25})">
    <!-- Car body -->
    <rect x="0" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.2}" rx="${size * 0.05}" fill="white"/>
    <!-- Car roof -->
    <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.4}" height="${size * 0.15}" rx="${size * 0.03}" fill="white"/>
    <!-- Wheels -->
    <circle cx="${size * 0.12}" cy="${size * 0.4}" r="${size * 0.06}" fill="white"/>
    <circle cx="${size * 0.48}" cy="${size * 0.4}" r="${size * 0.06}" fill="white"/>
    <!-- Dashboard indicator -->
    <rect x="${size * 0.45}" y="${size * 0.08}" width="${size * 0.08}" height="${size * 0.04}" rx="${size * 0.01}" fill="#10b981"/>
  </g>
</svg>`;

// Icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...');

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`✓ Generated ${filename}`);
});

console.log('✅ All PWA icons generated successfully!');
console.log('📝 Note: For production, convert SVG icons to PNG using an online converter or image processing tool.');
