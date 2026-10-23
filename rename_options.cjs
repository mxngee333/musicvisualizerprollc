const fs = require('fs');

const path = 'c:/Users/kwame/Downloads/MUSIC VISUALIZER FIX/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Rename "CapCut" to "VIZHD" + adjectives
const capcutAdjectives = ['Epic', 'Cinematic', 'Dynamic', 'Vibrant', 'Kinetic', 'Flashy', 'Smooth', 'Intense', 'Bold', 'Electric', 'Neon', 'Cosmic'];
let capcutCount = 0;
html = html.replace(/CapCut\s+([^<]+)/g, (match, suffix) => {
  const adj = capcutAdjectives[capcutCount % capcutAdjectives.length];
  capcutCount++;
  return `VIZHD ${adj} ${suffix}`;
});

// 2. Generate unique names for the new elements
const adjectives = ['Neon', 'Cyber', 'Cosmic', 'Quantum', 'Astro', 'Hyper', 'Sonic', 'Electric', 'Plasma', 'Dynamic', 'Kinetic', 'Vibrant', 'Pulse', 'Retro', 'Synth', 'Holo', 'Laser', 'Bass', 'Beat', 'Rhythm', 'Echo', 'Vortex', 'Strobe', 'Glow', 'Flux', 'Crystal', 'Lunar', 'Solar', 'Stellar', 'Nova'];
const nouns = {
  'V-Deck FX': ['Wave', 'EQ', 'Mixer', 'Filter', 'Sweep', 'Drop', 'Drive', 'Phase', 'Flange', 'Vinyl', 'Scratch', 'Fader', 'Pitch', 'Tempo', 'Beat', 'Sync', 'Cut', 'Loop', 'Sampler', 'Pad', 'Knob', 'Dial', 'Slider', 'Meter', 'Grid', 'Matrix', 'Synth', 'Bassline', 'Lead', 'Engine'],
  'CC-Style Anim': ['Pop', 'Drop', 'Shake', 'Swipe', 'Flash', 'Zoom', 'Bounce', 'Glitch', 'Shift', 'Spin', 'Flip', 'Aura', 'Glow', 'Pulse', 'Wave', 'Surge', 'Burst', 'Dash', 'Strike', 'Hit', 'Snap', 'Crack', 'Smash', 'Shatter', 'Break', 'Tear', 'Rip', 'Shred', 'Grind', 'Crush'],
  'S-Gear 2D': ['Cone', 'Sub', 'Woofer', 'Tweeter', 'Horn', 'Platter', 'Needle', 'Stylus', 'Arm', 'Spindle', 'Motor', 'Belt', 'Drive', 'Pitch', 'Slider', 'Fader', 'Knob', 'Button', 'Switch', 'Dial', 'Screen', 'Pad', 'Trigger', 'Key', 'Synth', 'Drum', 'Machine', 'Sampler', 'Sequencer', 'Mixer'],
  'Club 3D Prop': ['Ball', 'Laser', 'Strobe', 'Spot', 'Wash', 'Beam', 'Truss', 'Rig', 'Stage', 'Booth', 'Deck', 'Mixer', 'Speaker', 'Sub', 'Monitor', 'Screen', 'Panel', 'Matrix', 'Grid', 'Wall', 'Ceiling', 'Floor', 'Dance', 'Bar', 'Lounge', 'VIP', 'Area', 'Zone', 'Room', 'Vault'],
  'Fest Laser BG': ['Sky', 'Space', 'Galaxy', 'Nebula', 'Star', 'Sun', 'Moon', 'Planet', 'Orbit', 'Meteor', 'Comet', 'Asteroid', 'Dust', 'Cloud', 'Storm', 'Rain', 'Snow', 'Ice', 'Fire', 'Wind', 'Wave', 'Tide', 'Ocean', 'Sea', 'River', 'Lake', 'Pond', 'Pool', 'Drop', 'Ripple'],
  'Pro DJ FX': ['Verb', 'Delay', 'Echo', 'Chorus', 'Flange', 'Phase', 'Distort', 'Drive', 'Fuzz', 'Crush', 'Bit', 'Rate', 'Sample', 'Hold', 'Stutter', 'Slice', 'Dice', 'Chop', 'Cut', 'Mute', 'Solo', 'Pan', 'Width', 'Depth', 'Space', 'Time', 'Pitch', 'Shift', 'Bend', 'Glide']
};

const keys = Object.keys(nouns);
for (const key of keys) {
  let count = 0;
  // Match `>NUMBER. KEY NUMBER<` e.g., `>36. Club 3D Prop 1<`
  const regex = new RegExp(`>(\\d+\\.\\s*)${key}\\s*\\d+<`, 'g');
  html = html.replace(regex, (match, prefix) => {
    const noun = nouns[key][count % 30];
    const adj = adjectives[count % 30];
    count++;
    return `>${prefix}${adj} ${noun}<`;
  });
}

// Write it back
fs.writeFileSync(path, html);
console.log('HTML options successfully renamed.');
