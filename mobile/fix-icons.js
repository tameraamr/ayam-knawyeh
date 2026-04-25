const sharp = require('sharp');
const path = require('path');

async function fixIcons() {
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  const targetSize = 1024;
  const logoSize = 650; // 65% of 1024, perfect for Android Safe Zone

  console.log('Processing original logo with professional padding...');

  // 1. Create a padded Adaptive Icon (for Home Screen)
  await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.floor((targetSize - logoSize) / 2),
      bottom: Math.ceil((targetSize - logoSize) / 2),
      left: Math.floor((targetSize - logoSize) / 2),
      right: Math.ceil((targetSize - logoSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(__dirname, 'assets', 'adaptive-icon.png'));

  // 2. Create a padded Splash Icon
  await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.floor((targetSize - logoSize) / 2),
      bottom: Math.ceil((targetSize - logoSize) / 2),
      left: Math.floor((targetSize - logoSize) / 2),
      right: Math.ceil((targetSize - logoSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(__dirname, 'assets', 'splash-icon.png'));

  console.log('Done! Original logo is now centered with perfect safe-zone padding.');
}

fixIcons().catch(console.error);
