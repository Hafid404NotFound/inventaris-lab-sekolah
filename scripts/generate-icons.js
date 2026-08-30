const sharp = require('sharp');
const fs = require('fs');

// Simple icon generator
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#059669"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle">LK</text>
</svg>
`;

// Generate PNG icons
async function generateIcons() {
  try {
    // Generate 512x512 icon
    await sharp(Buffer.from(svgIcon))
      .resize(512, 512)
      .toFile('public/icon-512.png');
    
    // Generate 192x192 icon
    await sharp(Buffer.from(svgIcon))
      .resize(192, 192)
      .toFile('public/icon-192.png');
    
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();