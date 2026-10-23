const fs = require('fs');

const path = 'c:/Users/kwame/Downloads/MUSIC VISUALIZER FIX/index.html';
let html = fs.readFileSync(path, 'utf8');

const generateOptions = (startIdx, prefix) => {
  let opts = [];
  for (let i = 0; i < 30; i++) {
    const val = startIdx + i;
    opts.push(`                <option value="${val}">${val + 1}. ${prefix} ${i + 1}</option>`);
  }
  return opts.join('\n') + '\n';
};

const inserts = {
  'visualizer-style': generateOptions(18, 'V-Deck FX'),
  'animation-style': generateOptions(31, 'CC-Style Anim'),
  'avatar-2d-style': generateOptions(33, 'S-Gear 2D'),
  'avatar-3d-style': generateOptions(35, 'Club 3D Prop'),
  'background-style': generateOptions(12, 'Fest Laser BG'),
  'video-effect-style': generateOptions(12, 'S-Deck Filter')
};

for (const [id, newOpts] of Object.entries(inserts)) {
  const regex = new RegExp(`(<select id="${id}"[^>]*>[\\s\\S]*?)(</select>)`);
  html = html.replace(regex, `$1${newOpts}              $2`);
}

fs.writeFileSync(path, html);
console.log('HTML updated successfully!');
