const sharp = require('sharp');
const pngToIcoObj = require('png-to-ico');
const pngToIco = typeof pngToIcoObj === 'function' ? pngToIcoObj : pngToIcoObj.default;
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const publicDir = path.join(__dirname, 'public');
  const svgPath = path.join(publicDir, 'favicon.svg');
  
  if (!fs.existsSync(svgPath)) {
    console.error('favicon.svg not found!');
    process.exit(1);
  }

  try {
    console.log('Generating 48x48 PNG...');
    await sharp(svgPath)
      .resize(48, 48)
      .toFile(path.join(publicDir, 'favicon-48x48.png'));

    console.log('Generating 96x96 PNG...');
    await sharp(svgPath)
      .resize(96, 96)
      .toFile(path.join(publicDir, 'favicon-96x96.png'));

    console.log('Generating 180x180 Apple Touch Icon...');
    await sharp(svgPath)
      .resize(180, 180)
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    console.log('Generating favicon.ico...');
    // pngToIco takes an array of file paths or buffers
    const buf = await pngToIco([
      path.join(publicDir, 'favicon-48x48.png'),
      path.join(publicDir, 'favicon-96x96.png')
    ]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);

    console.log('Done!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
