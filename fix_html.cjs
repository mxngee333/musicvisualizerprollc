const fs = require('fs');

const path = 'c:/Users/kwame/Downloads/MUSIC VISUALIZER FIX/index.html';
let html = fs.readFileSync(path, 'utf8');

const selectIds = [
  'visualizer-style',
  'animation-style',
  'avatar-2d-style',
  'avatar-3d-style',
  'background-style',
  'video-effect-style'
];

for (const id of selectIds) {
  const selectRegex = new RegExp(`(<select id="${id}"[^>]*>)([\\s\\S]*?)(</select>)`);
  html = html.replace(selectRegex, (match, openTag, optionsHtml, closeTag) => {
    let index = 0;
    const newOptionsHtml = optionsHtml.replace(/<option value="[^"]*">/g, (optMatch) => {
      const newOpt = `<option value="${index}">`;
      index++;
      return newOpt;
    });
    return openTag + newOptionsHtml + closeTag;
  });
}

fs.writeFileSync(path, html);
console.log('HTML option values sequentially renumbered successfully!');
