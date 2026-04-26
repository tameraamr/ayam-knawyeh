const sharp = require('sharp');
const path = require('path');

async function createIcon() {
  const inputPath = path.join(__dirname, '..', '..', 'logo.jpeg');
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const adaptiveIconPath = path.join(__dirname, 'assets', 'adaptive-icon.png');
  const faviconPath = path.join(__dirname, 'assets', 'favicon.png');

  // Get original image dimensions
  const metadata = await sharp(inputPath).metadata();
  console.log(`Original: ${metadata.width}x${metadata.height}`);

  // Create 1024x1024 icon (main app icon for iOS and general use)
  await sharp(inputPath)
    .resize(1024, 1024, {
      fit: 'cover',
      position: 'centre',
    })
    .png()
    .toFile(iconPath);
  console.log('✅ Created icon.png (1024x1024)');

  // Create 1024x1024 adaptive icon (Android foreground)
  await sharp(inputPath)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 139, g: 0, b: 0, alpha: 1 }, // #8b0000
    })
    .png()
    .toFile(adaptiveIconPath);
  console.log('✅ Created adaptive-icon.png (1024x1024)');

  // Create 48x48 favicon
  await sharp(inputPath)
    .resize(48, 48, {
      fit: 'cover',
      position: 'centre',
    })
    .png()
    .toFile(faviconPath);
  console.log('✅ Created favicon.png (48x48)');

  console.log('\n🎉 All icons generated successfully!');
}

createIcon().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
