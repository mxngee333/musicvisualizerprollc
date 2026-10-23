import './firebase.js';
import './style.css';
// Anti-Clone Domain Lock removed for development

import { AudioEngine } from './audio.js';
import { Visualizer } from './visualizer.js';
import { LyricsManager } from './lyrics.js';
import { LicenseManager } from './license.js';
import { SlideshowManager } from './slideshow.js';
import { OfflineExporter } from './offline-export.js';
import { VideoExporter } from './export.js';
import { ThreeManager } from './three-manager.js';
import { generateLyricsFromAudio } from './ai.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const audioElement = document.getElementById('audio-player');
  const canvasElement = document.getElementById('visualizer-canvas');
  const threeCanvas = document.getElementById('three-canvas');
  
  const audioUpload = document.getElementById('audio-upload');
  const imagesUpload = document.getElementById('images-upload');
  const lyricsUpload = document.getElementById('lyrics-upload');
  const logoUpload = document.getElementById('logo-upload');
  
  const exportBtn = document.getElementById('export-button');
  const exportRecordBtn = document.getElementById('export-record-button');
  const exportStatus = document.getElementById('export-status');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  
  // Paywall UI
  const paywallModal = document.getElementById('paywall-modal');
  const licenseInput = document.getElementById('license-input');
  const verifyLicenseBtn = document.getElementById('verify-license-btn');
  const licenseError = document.getElementById('license-error');
  const closePaywallBtn = document.getElementById('close-paywall-btn');

  // Initialize Core Systems
  const licenseManager = new LicenseManager();
  
  const visSelect = document.getElementById('visualizer-style');
  const animSelect = document.getElementById('animation-style');
  const avatar2dSelect = document.getElementById('avatar-2d-style');
  const avatar3dSelect = document.getElementById('avatar-3d-style');
  const backgroundSelect = document.getElementById('background-style');
  const videoEffectSelect = document.getElementById('video-effect-style');
  const bgOpacityInput = document.getElementById('bg-opacity');
  const logoSizeInput = document.getElementById('logo-size');
  
  const sliderVis = document.getElementById('slider-vis');
  const sliderAnim = document.getElementById('slider-anim');
  const sliderAvatar2D = document.getElementById('slider-avatar-2d');
  const sliderAvatar3D = document.getElementById('slider-avatar-3d');
  const sliderBg = document.getElementById('slider-bg');
  const sliderEffect = document.getElementById('slider-effect');
  const aspectRatioSelect = document.getElementById('aspect-ratio');

  // UI Toggle for Mobile
  const toggleBtn = document.getElementById('toggle-ui-btn');
  const controlPanel = document.getElementById('control-panel');
  if (toggleBtn && controlPanel) {
    toggleBtn.addEventListener('click', () => {
      const isSettingsOn = controlPanel.classList.toggle('show-mobile');
      if (isSettingsOn) {
        toggleBtn.textContent = '👁️ Preview';
      } else {
        toggleBtn.textContent = '⚙️ Settings';
      }
    });
  }

  // Load Settings from LocalStorage
  const defaultProfessionalSettings = {
    visStyle: "1",             // 2. Horizontal Bars
    animStyle: "0",            // 1. Instant
    avatar2dStyle: "64",       // 65. Black Vinyl (Red Inner)
    avatar3dStyle: "0",        // None
    backgroundStyle: "0",      // 1. Default (Black/Uploaded)
    videoEffectStyle: "8",     // 9. Fireflies
    bgOpacity: "0.6",
    sliderVis: "1",
    sliderAnim: "1",
    sliderAvatar2D: "1",
    sliderAvatar3D: "1",
    sliderBg: "1",
    sliderEffect: "1",
    logoSize: "250",
    gentlePan: true,
    shakeBeat: true,
    gentlePanIntensity: "1",
    shakeBeatIntensity: "1",
    logoShake: true,
    logoShakeIntensity: "1",
    aspectRatio: "16:9"
  };

  const savedSettings = JSON.parse(localStorage.getItem('visualizerSettings') || 'null') || defaultProfessionalSettings;
  
  if (savedSettings.visStyle !== undefined) visSelect.value = savedSettings.visStyle;
  if (savedSettings.animStyle !== undefined) animSelect.value = savedSettings.animStyle;
  if (savedSettings.avatar2dStyle !== undefined) avatar2dSelect.value = savedSettings.avatar2dStyle;
  if (savedSettings.avatar3dStyle !== undefined) avatar3dSelect.value = savedSettings.avatar3dStyle;
  if (savedSettings.backgroundStyle !== undefined) backgroundSelect.value = savedSettings.backgroundStyle;
  if (savedSettings.videoEffectStyle !== undefined) videoEffectSelect.value = savedSettings.videoEffectStyle;
  if (savedSettings.bgOpacity !== undefined) bgOpacityInput.value = savedSettings.bgOpacity;
  if (savedSettings.logoSize !== undefined && logoSizeInput) logoSizeInput.value = savedSettings.logoSize;
  if (savedSettings.aspectRatio !== undefined && aspectRatioSelect) aspectRatioSelect.value = savedSettings.aspectRatio;
  
  if (savedSettings.sliderVis !== undefined) sliderVis.value = savedSettings.sliderVis;
  if (savedSettings.sliderAnim !== undefined) sliderAnim.value = savedSettings.sliderAnim;
  if (savedSettings.sliderAvatar2D !== undefined) sliderAvatar2D.value = savedSettings.sliderAvatar2D;
  if (savedSettings.sliderAvatar3D !== undefined) sliderAvatar3D.value = savedSettings.sliderAvatar3D;
  if (savedSettings.sliderBg !== undefined) sliderBg.value = savedSettings.sliderBg;
  if (savedSettings.sliderEffect !== undefined) sliderEffect.value = savedSettings.sliderEffect;

  const slideshowSpeed = document.getElementById('slideshow-speed');
  const slideshowSpeedLabel = document.getElementById('slideshow-speed-label');
  if (savedSettings.slideshowSpeed !== undefined && slideshowSpeed) {
    slideshowSpeed.value = savedSettings.slideshowSpeed;
    if (slideshowSpeedLabel) slideshowSpeedLabel.innerText = `${savedSettings.slideshowSpeed}s`;
  }

  const gentlePanCheckbox = document.getElementById('gentle-pan');
  const shakeBeatCheckbox = document.getElementById('shake-beat');
  const gentlePanSlider = document.getElementById('gentle-pan-slider');
  const shakeBeatSlider = document.getElementById('shake-beat-slider');
  const logoShakeCheckbox = document.getElementById('logo-shake');
  const logoShakeSlider = document.getElementById('logo-shake-slider');
  const resetRacksBtn = document.getElementById('reset-racks-btn');
  if (savedSettings.gentlePan !== undefined && gentlePanCheckbox) {
    gentlePanCheckbox.checked = savedSettings.gentlePan;
  }
  if (savedSettings.shakeBeat !== undefined && shakeBeatCheckbox) {
    shakeBeatCheckbox.checked = savedSettings.shakeBeat;
  }
  if (savedSettings.logoShake !== undefined && logoShakeCheckbox) {
    logoShakeCheckbox.checked = savedSettings.logoShake;
  }
  if (savedSettings.gentlePanIntensity !== undefined && gentlePanSlider) {
    gentlePanSlider.value = savedSettings.gentlePanIntensity;
  }
  if (savedSettings.shakeBeatIntensity !== undefined && shakeBeatSlider) {
    shakeBeatSlider.value = savedSettings.shakeBeatIntensity;
  }
  if (savedSettings.logoShakeIntensity !== undefined && logoShakeSlider) {
    logoShakeSlider.value = savedSettings.logoShakeIntensity;
  }

  // Initialize Managers
  const audioEngine = new AudioEngine(audioElement);
  const slideshowManager = new SlideshowManager();
  const lyricsManager = new LyricsManager();
  const visualizer = new Visualizer(canvasElement, audioEngine, slideshowManager, lyricsManager);
  const threeManager = new ThreeManager(threeCanvas);
  window.threeManager = threeManager; // Expose globally to prevent GPU stall in visualizer when inactive
  
  // Apply initial settings
  visualizer.setStyles(visSelect.value, animSelect.value, avatar2dSelect.value, backgroundSelect.value, videoEffectSelect.value);
  visualizer.setSliders(parseFloat(sliderVis.value), parseFloat(sliderAnim.value), parseFloat(sliderAvatar2D.value), parseFloat(sliderBg.value), parseFloat(sliderEffect.value));
  threeManager.setStyle(avatar3dSelect.value);
  threeManager.setSlider(parseFloat(sliderAvatar3D.value));
  visualizer.bgOpacity = parseFloat(bgOpacityInput.value);
  if (logoSizeInput) visualizer.logoSize = parseFloat(logoSizeInput.value);
  if (slideshowSpeed) slideshowManager.displayTime = parseInt(slideshowSpeed.value, 10) * 1000;
  if (gentlePanCheckbox) visualizer.gentlePan = gentlePanCheckbox.checked;
  if (shakeBeatCheckbox) visualizer.shakeBeat = shakeBeatCheckbox.checked;
  if (gentlePanSlider) visualizer.gentlePanIntensity = parseFloat(gentlePanSlider.value);
  if (shakeBeatSlider) visualizer.shakeBeatIntensity = parseFloat(shakeBeatSlider.value);
  if (logoShakeCheckbox) visualizer.logoShake = logoShakeCheckbox.checked;
  if (logoShakeSlider) visualizer.logoShakeIntensity = parseFloat(logoShakeSlider.value);

  // --- Apply Aspect Ratio ---
  function applyAspectRatio() {
    if (!aspectRatioSelect) return;
    const ratio = aspectRatioSelect.value;
    let w = 1920, h = 1080; // default 16:9

    if (ratio === '9:16') { w = 1080; h = 1920; }
    else if (ratio === '1:1') { w = 1080; h = 1080; }
    else if (ratio === '3:4') { w = 1080; h = 1440; }
    else if (ratio === '4:3') { w = 1440; h = 1080; }

    // Update Visualizer and ThreeJS internal resolution
    // CSS object-fit: contain will automatically handle the aspect ratio visually!
    visualizer.resize(w, h);
    threeManager.resize(w, h);
  }
  
  // Apply initial aspect ratio and resizing
  applyAspectRatio();
  
  if (aspectRatioSelect) {
    aspectRatioSelect.addEventListener('change', () => {
      applyAspectRatio();
      saveSettings();
    });
  }
  
  // Start visualizer immediately to show previews
  visualizer.start();
  
  // Update Presets & Save to LocalStorage
  const saveSettings = () => {
    localStorage.setItem('visualizerSettings', JSON.stringify({
      visStyle: visSelect.value,
      animStyle: animSelect.value,
      avatar2dStyle: avatar2dSelect.value,
      avatar3dStyle: avatar3dSelect.value,
      backgroundStyle: backgroundSelect.value,
      videoEffectStyle: videoEffectSelect.value,
      bgOpacity: bgOpacityInput.value,
      logoSize: logoSizeInput ? logoSizeInput.value : "250",
      sliderVis: sliderVis.value,
      sliderAnim: sliderAnim.value,
      sliderAvatar2D: sliderAvatar2D.value,
      sliderAvatar3D: sliderAvatar3D.value,
      sliderBg: sliderBg.value,
      sliderEffect: sliderEffect.value,
      slideshowSpeed: slideshowSpeed ? slideshowSpeed.value : "5",
      gentlePan: gentlePanCheckbox ? gentlePanCheckbox.checked : true,
      shakeBeat: shakeBeatCheckbox ? shakeBeatCheckbox.checked : true,
      gentlePanIntensity: gentlePanSlider ? gentlePanSlider.value : "1",
      shakeBeatIntensity: shakeBeatSlider ? shakeBeatSlider.value : "1",
      logoShake: logoShakeCheckbox ? logoShakeCheckbox.checked : true,
      logoShakeIntensity: logoShakeSlider ? logoShakeSlider.value : "1"
    }));
  };

  [visSelect, animSelect, avatar2dSelect, backgroundSelect, videoEffectSelect].forEach(select => {
    select.addEventListener('input', () => {
      visualizer.setStyles(visSelect.value, animSelect.value, avatar2dSelect.value, backgroundSelect.value, videoEffectSelect.value);
      if (select.id === 'animation-style') {
        visualizer.previewAnimStart = performance.now();
      }
      saveSettings();
    });
  });

  [sliderVis, sliderAnim, sliderAvatar2D, sliderBg, sliderEffect].forEach(slider => {
    slider.addEventListener('input', () => {
      visualizer.setSliders(parseFloat(sliderVis.value), parseFloat(sliderAnim.value), parseFloat(sliderAvatar2D.value), parseFloat(sliderBg.value), parseFloat(sliderEffect.value));
      saveSettings();
    });
  });

  sliderAvatar3D.addEventListener('input', () => {
    threeManager.setSlider(parseFloat(sliderAvatar3D.value));
    saveSettings();
  });
  
  if (slideshowSpeed) {
    slideshowSpeed.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (slideshowSpeedLabel) slideshowSpeedLabel.innerText = `${val}s`;
      slideshowManager.displayTime = val * 1000;
      if (slideshowManager.intervalId) {
        slideshowManager.start();
      }
      saveSettings();
    });
  }

  if (gentlePanCheckbox) {
    gentlePanCheckbox.addEventListener('change', (e) => {
      visualizer.gentlePan = e.target.checked;
      saveSettings();
    });
  }

  if (shakeBeatCheckbox) {
    shakeBeatCheckbox.addEventListener('change', (e) => {
      visualizer.shakeBeat = e.target.checked;
      saveSettings();
    });
  }

  if (gentlePanSlider) {
    gentlePanSlider.addEventListener('input', (e) => {
      visualizer.gentlePanIntensity = parseFloat(e.target.value);
      saveSettings();
    });
  }

  if (shakeBeatSlider) {
    shakeBeatSlider.addEventListener('input', (e) => {
      visualizer.shakeBeatIntensity = parseFloat(e.target.value);
      saveSettings();
    });
  }

  if (logoShakeCheckbox) {
    logoShakeCheckbox.addEventListener('change', (e) => {
      visualizer.logoShake = e.target.checked;
      saveSettings();
    });
  }

  if (logoShakeSlider) {
    logoShakeSlider.addEventListener('input', (e) => {
      visualizer.logoShakeIntensity = parseFloat(e.target.value);
      saveSettings();
    });
  }

  if (resetRacksBtn) {
    resetRacksBtn.addEventListener('click', () => {
      // Clear saved settings
      localStorage.removeItem('visualizerSettings');
      
      // Apply defaults
      if (visSelect) { visSelect.value = defaultProfessionalSettings.visStyle; visSelect.dispatchEvent(new Event('input', { bubbles: true })); }
      if (animSelect) { animSelect.value = defaultProfessionalSettings.animStyle; animSelect.dispatchEvent(new Event('input', { bubbles: true })); }
      if (avatar2dSelect) { avatar2dSelect.value = defaultProfessionalSettings.avatar2dStyle; avatar2dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
      if (avatar3dSelect) { avatar3dSelect.value = defaultProfessionalSettings.avatar3dStyle; avatar3dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
      if (backgroundSelect) { backgroundSelect.value = defaultProfessionalSettings.backgroundStyle; backgroundSelect.dispatchEvent(new Event('input', { bubbles: true })); }
      if (effectSelect) { effectSelect.value = defaultProfessionalSettings.videoEffectStyle; effectSelect.dispatchEvent(new Event('input', { bubbles: true })); }
      
      if (bgOpacityInput) { bgOpacityInput.value = defaultProfessionalSettings.bgOpacity; bgOpacityInput.dispatchEvent(new Event('input', { bubbles: true })); }
      if (logoSizeInput) { logoSizeInput.value = defaultProfessionalSettings.logoSize; logoSizeInput.dispatchEvent(new Event('input', { bubbles: true })); }
      if (gentlePanCheckbox) { gentlePanCheckbox.checked = defaultProfessionalSettings.gentlePan; gentlePanCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
      if (shakeBeatCheckbox) { shakeBeatCheckbox.checked = defaultProfessionalSettings.shakeBeat; shakeBeatCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
      if (gentlePanSlider) { gentlePanSlider.value = defaultProfessionalSettings.gentlePanIntensity; gentlePanSlider.dispatchEvent(new Event('input', { bubbles: true })); }
      if (shakeBeatSlider) { shakeBeatSlider.value = defaultProfessionalSettings.shakeBeatIntensity; shakeBeatSlider.dispatchEvent(new Event('input', { bubbles: true })); }
      if (logoShakeCheckbox) { logoShakeCheckbox.checked = defaultProfessionalSettings.logoShake; logoShakeCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
      if (logoShakeSlider) { logoShakeSlider.value = defaultProfessionalSettings.logoShakeIntensity; logoShakeSlider.dispatchEvent(new Event('input', { bubbles: true })); }
      if (aspectRatioSelect) { aspectRatioSelect.value = defaultProfessionalSettings.aspectRatio; aspectRatioSelect.dispatchEvent(new Event('change', { bubbles: true })); }
      
      // Reset sliders
      const sliders = [
        { el: sliderVis, val: defaultProfessionalSettings.sliderVis },
        { el: sliderAnim, val: defaultProfessionalSettings.sliderAnim },
        { el: sliderAvatar2D, val: defaultProfessionalSettings.sliderAvatar2D },
        { el: sliderAvatar3D, val: defaultProfessionalSettings.sliderAvatar3D },
        { el: sliderBg, val: defaultProfessionalSettings.sliderBg },
        { el: sliderEffect, val: defaultProfessionalSettings.sliderEffect }
      ];
      sliders.forEach(s => {
         if (s.el) {
            s.el.value = s.val;
            s.el.dispatchEvent(new Event('input', { bubbles: true }));
         }
      });
    });
  }

  avatar3dSelect.addEventListener('input', (e) => {
    threeManager.setStyle(e.target.value);
    saveSettings();
  });
  
  bgOpacityInput.addEventListener('input', (e) => {
    visualizer.bgOpacity = parseFloat(e.target.value);
    saveSettings();
  });

  if (logoSizeInput) {
    logoSizeInput.addEventListener('input', (e) => {
      visualizer.logoSize = parseFloat(e.target.value);
      saveSettings();
    });
  }

  let hasAudio = false;
  let currentAudioFile = null;

  // Real-time keyboard preview for dropdowns
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (active && active.tagName === 'SELECT') {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent default browser dropdown highlight
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        let newIdx = active.selectedIndex + dir;
        if (newIdx < 0) newIdx = 0;
        if (newIdx >= active.options.length) newIdx = active.options.length - 1;
        if (active.selectedIndex !== newIdx) {
          active.selectedIndex = newIdx;
          active.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  });

  // File Upload Handlers
  audioUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      currentAudioFile = e.target.files[0];
      audioEngine.init();
      audioEngine.loadAudio(currentAudioFile);
      hasAudio = true;
      exportBtn.disabled = false;
      if (exportRecordBtn) exportRecordBtn.disabled = false;
      document.getElementById('auto-lyrics-btn').style.display = 'inline-block';
      document.getElementById('auto-lyrics-btn').textContent = '✨ Auto-Sync Lyrics (AI)';
      document.getElementById('auto-lyrics-btn').disabled = false;
      
      // Extract Native Lyrics using jsmediatags
      if (window.jsmediatags) {
        window.jsmediatags.read(currentAudioFile, {
          onSuccess: function(tag) {
            if (tag.tags && tag.tags.USLT) {
              const lyricsText = tag.tags.USLT.text || tag.tags.USLT;
              if (lyricsText) {
                lyricsManager.parseLRC(lyricsText);
                document.getElementById('auto-lyrics-btn').textContent = '✅ Native Lyrics Loaded';
                document.getElementById('auto-lyrics-btn').disabled = true;
              }
            } else if (tag.tags && tag.tags.SYLT) {
              console.log('SYLT tag found but relying on USLT or LRC upload.');
            }
          },
          onError: function(error) {
            console.log('No ID3 tags found:', error.type);
          }
        });
      }
    }
  });

  imagesUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      slideshowManager.loadImages(e.target.files);
      
      // Auto-switch background preset to Default so the user knows the uploaded image is active
      backgroundSelect.value = "0";
      visualizer.backgroundStyle = 0;
      saveSettings();
    }
    // Allow re-uploading the exact same file
    e.target.value = '';
  });

  lyricsUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      lyricsManager.loadFromFile(e.target.files[0]);
    }
  });

  logoUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      visualizer.setLogo(url);
    }
  });

  // AI Lyrics Generation
  const autoLyricsBtn = document.getElementById('auto-lyrics-btn');
  autoLyricsBtn.addEventListener('click', async () => {
    if (!currentAudioFile) return;
    
    autoLyricsBtn.disabled = true;
    const originalText = autoLyricsBtn.textContent;
    autoLyricsBtn.textContent = '⏳ Generating... (This may take a moment)';
    
    try {
      const generatedLrcText = await generateLyricsFromAudio(currentAudioFile, (progressText) => {
        autoLyricsBtn.textContent = `⏳ ${progressText}`;
      });
      lyricsManager.parseLRC(generatedLrcText);
      if (lyricsManager.lyrics.length === 0) {
        throw new Error("No timestamps were found in the generated lyrics. The AI may have failed to format them correctly.");
      }
      autoLyricsBtn.textContent = '✅ Lyrics Synced!';
      document.getElementById('download-lrc-btn').style.display = 'inline-block'; // Show download
      setTimeout(() => {
        autoLyricsBtn.textContent = originalText;
        autoLyricsBtn.disabled = false;
      }, 3000);
    } catch (error) {
      console.error(error);
      alert(`Transcription Failed: ${error.message}\nIf the audio is too large, Gemini may reject it. Try a shorter/smaller MP3 file.`);
      autoLyricsBtn.textContent = '❌ Failed to generate';
      setTimeout(() => {
        autoLyricsBtn.textContent = originalText;
        autoLyricsBtn.disabled = false;
      }, 3000);
    }
  });

  // Digital Output (Download LRC)
  const downloadLrcBtn = document.getElementById('download-lrc-btn');
  downloadLrcBtn.addEventListener('click', () => {
    if (!lyricsManager.rawLrcText) return;
    const blob = new Blob([lyricsManager.rawLrcText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'generated-lyrics.lrc';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });

  // (Old renderLoop removed to avoid duplicate identifier)

  // Profile Save/Load (App Presets)
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const loadProfileBtn = document.getElementById('load-profile-btn');
  const presetSlot = document.getElementById('preset-slot');

  if (saveProfileBtn && loadProfileBtn && presetSlot) {
    saveProfileBtn.addEventListener('click', () => {
      saveSettings(); // Ensure latest are saved
      const settingsStr = localStorage.getItem('visualizerSettings') || '{}';
      const slot = presetSlot.value;
      localStorage.setItem(`visualizerPreset_${slot}`, settingsStr);
      
      const originalText = saveProfileBtn.textContent;
      saveProfileBtn.textContent = '✅ Saved!';
      setTimeout(() => saveProfileBtn.textContent = originalText, 2000);
    });

    loadProfileBtn.addEventListener('click', () => {
      const slot = presetSlot.value;
      const settingsStr = localStorage.getItem(`visualizerPreset_${slot}`);
      if (settingsStr) {
        localStorage.setItem('visualizerSettings', settingsStr);
        alert(`Preset ${slot} loaded successfully! The page will now reload to apply settings.`);
        window.location.reload();
      } else {
        alert(`No saved preset found in Slot ${slot}.`);
      }
    });
  }

  const magicPresetBtn = document.getElementById('magic-preset-btn');
  if (magicPresetBtn) {
    magicPresetBtn.addEventListener('click', () => {
      const randomOption = (select) => {
        if (!select || !select.options) return;
        const count = select.options.length;
        const randIdx = Math.floor(Math.random() * count);
        select.selectedIndex = randIdx;
        select.dispatchEvent(new Event('input', { bubbles: true }));
      };
      
      const randomSlider = (slider, min, max) => {
        if (!slider) return;
        const val = (Math.random() * (max - min) + min).toFixed(2);
        slider.value = val;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      };

      // Master Themes: Color & Graphic cohesive combinations
      const themeChoice = Math.random();
      
      const pickRandom = (select, arr) => {
        if (!select || !arr || arr.length === 0) return;
        select.selectedIndex = arr[Math.floor(Math.random() * arr.length)];
        select.dispatchEvent(new Event('input', { bubbles: true }));
      };

      if (themeChoice < 0.25) {
        // Theme: Cyberpunk / Synthwave (Neon Pink/Blue/Purple)
        pickRandom(visSelect, [16, 17, 24, 30, 42, 45]); // Neon Wave, Cyber EQ, Synth Beat
        pickRandom(animSelect, [14, 15, 26, 31]); // Neon Pulse, Cyber Glitch, Neon Spin In
        pickRandom(backgroundSelect, [2, 10, 13, 16, 30]); // Cyberpunk Neon, Retrowave, Neon Sky
        pickRandom(videoEffectSelect, [15, 49, 52, 53]); // Hyperdrive, Neon Edges (Blue/Pink)

        if (Math.random() < 0.5) {
          pickRandom(avatar2dSelect, [1, 4, 10, 34]); // Neon Dancer, Cyber Circle, Synthwave Sun
        } else {
          if (avatar2dSelect) { avatar2dSelect.selectedIndex = 0; avatar2dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
        }
        
        // Force 3D avatar to None
        if (avatar3dSelect) { avatar3dSelect.selectedIndex = 0; avatar3dSelect.dispatchEvent(new Event('input', { bubbles: true })); }

        randomSlider(sliderVis, 1.2, 2.0);
        randomSlider(sliderAnim, 1.2, 1.8);
        randomSlider(sliderBg, 1.0, 1.5);
        randomSlider(sliderEffect, 1.5, 2.5);
        if (bgOpacityInput) { bgOpacityInput.value = (Math.random() * 0.2 + 0.5).toFixed(2); bgOpacityInput.dispatchEvent(new Event('input', { bubbles: true })); }
        
        const gentlePanCheckbox = document.getElementById('gentle-pan');
        const shakeBeatCheckbox = document.getElementById('shake-beat');
        if (gentlePanCheckbox) { gentlePanCheckbox.checked = true; gentlePanCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
        if (shakeBeatCheckbox) { shakeBeatCheckbox.checked = true; shakeBeatCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }

      } else if (themeChoice < 0.50) {
        // Theme: Aggressive / Fire (Red/Orange/Gold)
        pickRandom(visSelect, [21, 28, 43, 8]); // Hyper Drop, Pulse Pitch, Solar Bassline
        pickRandom(animSelect, [23, 29, 20]); // Intense Type Burst, Fire Aura, Kinetic Drop
        pickRandom(backgroundSelect, [6, 11, 34]); // Ruby Red, Crimson Fire, Beat Fire
        pickRandom(videoEffectSelect, [46, 47, 48, 50]); // Fire Particles, Raging Fire, Neon Edge Red

        if (Math.random() < 0.5) {
          pickRandom(avatar2dSelect, [6, 26, 28]); // Plasma Star, Energy Core, Prism Burst
        } else {
          if (avatar2dSelect) { avatar2dSelect.selectedIndex = 0; avatar2dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
        }
        
        // Force 3D avatar to None
        if (avatar3dSelect) { avatar3dSelect.selectedIndex = 0; avatar3dSelect.dispatchEvent(new Event('input', { bubbles: true })); }

        randomSlider(sliderVis, 1.5, 2.5);
        randomSlider(sliderAnim, 1.5, 2.5);
        randomSlider(sliderBg, 1.5, 2.0);
        randomSlider(sliderEffect, 1.5, 2.5);
        if (bgOpacityInput) { bgOpacityInput.value = (Math.random() * 0.2 + 0.4).toFixed(2); bgOpacityInput.dispatchEvent(new Event('input', { bubbles: true })); }
        
        const gentlePanCheckbox = document.getElementById('gentle-pan');
        const shakeBeatCheckbox = document.getElementById('shake-beat');
        if (gentlePanCheckbox) { gentlePanCheckbox.checked = false; gentlePanCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
        if (shakeBeatCheckbox) { shakeBeatCheckbox.checked = true; shakeBeatCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }

      } else if (themeChoice < 0.75) {
        // Theme: Deep Space / Chill / Ethereal (Dark Blue/Purple)
        pickRandom(visSelect, [8, 9, 12, 18, 20]); // Smooth Aurora, Floating Orbs, Ethereal Mist, Cosmic Mixer
        pickRandom(animSelect, [1, 7, 13]); // Fade In, Blur Reveal, Cinematic Rotate
        pickRandom(backgroundSelect, [1, 4, 9, 14, 18]); // Midnight Blue, Deep Space, Ocean Blue, Cosmic Galaxy
        pickRandom(videoEffectSelect, [6, 11, 13, 12, 5]); // Stars, Cinematic Glow, Slow Orbs, Bokeh, Dust

        // Chill vibes = usually no avatars
        if (avatar2dSelect) { avatar2dSelect.selectedIndex = 0; avatar2dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
        if (avatar3dSelect) { avatar3dSelect.selectedIndex = 0; avatar3dSelect.dispatchEvent(new Event('input', { bubbles: true })); }

        randomSlider(sliderVis, 0.6, 1.0);
        randomSlider(sliderAnim, 0.4, 0.8);
        randomSlider(sliderBg, 0.3, 0.7);
        randomSlider(sliderEffect, 0.5, 1.2);
        if (bgOpacityInput) { bgOpacityInput.value = (Math.random() * 0.2 + 0.6).toFixed(2); bgOpacityInput.dispatchEvent(new Event('input', { bubbles: true })); }
        
        const gentlePanCheckbox = document.getElementById('gentle-pan');
        const shakeBeatCheckbox = document.getElementById('shake-beat');
        if (gentlePanCheckbox) { gentlePanCheckbox.checked = true; gentlePanCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
        if (shakeBeatCheckbox) { shakeBeatCheckbox.checked = false; shakeBeatCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }

      } else {
        // Theme: Matrix / Tech / Minimal (Green/Geometric)
        pickRandom(visSelect, [10, 14, 40, 41]); // Digital EQ, Infinity Hexagons, Flux Grid, Crystal Matrix
        pickRandom(animSelect, [3, 5, 21]); // Typewriter, Glitch, Flashy Glitch Reveal
        pickRandom(backgroundSelect, [5, 8, 25]); // Emerald Green, Matrix Green, Dynamic Meteor
        pickRandom(videoEffectSelect, [54, 63, 72]); // Neon Edge Green, Solid Neon Green, Flowing Edge Green

        if (Math.random() < 0.5) {
          pickRandom(avatar2dSelect, [16, 24, 30, 31]); // Digital Clockwork, Data Stream, Glitch Face, Pixel Art
        } else {
          if (avatar2dSelect) { avatar2dSelect.selectedIndex = 0; avatar2dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
        }
        
        // Force 3D avatar to None
        if (avatar3dSelect) { avatar3dSelect.selectedIndex = 0; avatar3dSelect.dispatchEvent(new Event('input', { bubbles: true })); }
        
        randomSlider(sliderVis, 1.0, 1.5);
        randomSlider(sliderAnim, 1.0, 1.8);
        randomSlider(sliderBg, 1.0, 1.5);
        randomSlider(sliderEffect, 1.0, 2.0);
        if (bgOpacityInput) { bgOpacityInput.value = (Math.random() * 0.3 + 0.4).toFixed(2); bgOpacityInput.dispatchEvent(new Event('input', { bubbles: true })); }
        
        const gentlePanCheckbox = document.getElementById('gentle-pan');
        const shakeBeatCheckbox = document.getElementById('shake-beat');
        if (gentlePanCheckbox) { gentlePanCheckbox.checked = false; gentlePanCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
        if (shakeBeatCheckbox) { shakeBeatCheckbox.checked = true; shakeBeatCheckbox.dispatchEvent(new Event('change', { bubbles: true })); }
      }

      if (sliderAvatar2D) randomSlider(sliderAvatar2D, 0.9, 1.3);
      
      const originalText = magicPresetBtn.textContent;
      magicPresetBtn.textContent = '✨ Magically Randomized! ✨';
      setTimeout(() => magicPresetBtn.textContent = originalText, 1500);
    });
  }

  function getExportFilename() {
    let ratioStr = '16x9';
    if (aspectRatioSelect) {
      const selectedText = aspectRatioSelect.options[aspectRatioSelect.selectedIndex].text;
      const match = selectedText.match(/(\d+:\d+)/);
      if (match) ratioStr = match[1].replace(':', 'x');
    }
    const audioName = currentAudioFile ? currentAudioFile.name.replace(/\.[^/.]+$/, "") : 'Music-Visualizer';
    // Replace spaces and underscores with hyphens
    const cleanAudioName = audioName.replace(/[^a-zA-Z0-9 \-_]/g, '').trim().replace(/[\s_]+/g, '-');
    return `${cleanAudioName}-${ratioStr}-[Visualizer]-(Lyric-Video).mp4`;
  }

  // Paywall Logic
  function showPaywall() {
    paywallModal.style.display = 'flex';
  }
  
  closePaywallBtn.addEventListener('click', () => {
    paywallModal.style.display = 'none';
  });

  verifyLicenseBtn.addEventListener('click', async () => {
    const key = licenseInput.value.trim();
    if (!key) return;
    
    verifyLicenseBtn.textContent = 'Verifying...';
    verifyLicenseBtn.disabled = true;
    licenseError.style.display = 'none';
    
    // Array of product_ids: Monthly, Yearly, Lifetime
    const productIds = [
      '6I7RaglE31nXHeyvI30a2g==', 
      'aRKsvJlnWnBh0mj8OMCIhg==', 
      'YCTY-kMSEt0B2dh4R47v2A=='
    ];
    let verified = false;
    let lastMessage = '';

    // Loop through each product to see which one the key belongs to
    for (const pid of productIds) {
      const result = await licenseManager.verifyGumroadKey(pid, key);
      if (result.success) {
        verified = true;
        break;
      } else {
        lastMessage = result.message; // Keep the error message in case none succeed
      }
    }
    
    if (verified) {
      licenseError.style.color = '#00FF00';
      licenseError.textContent = 'License Verified! Thank you.';
      licenseError.style.display = 'block';
      setTimeout(() => {
        paywallModal.style.display = 'none';
        licenseError.style.display = 'none';
      }, 2000);
    } else {
      licenseError.style.color = '#ff4444';
      licenseError.textContent = lastMessage || 'Invalid license key.';
      licenseError.style.display = 'block';
    }
    
    verifyLicenseBtn.textContent = 'Verify License';
    verifyLicenseBtn.disabled = false;
  });

  // Export Logic (Offline WebCodecs)
  exportBtn.addEventListener('click', async () => {
    if (!currentAudioFile) return;
    
    if (!(await licenseManager.canExport())) {
      showPaywall();
      return;
    }
    await licenseManager.incrementExportCount();
    
    exportBtn.disabled = true;
    exportBtn.style.display = 'none';
    progressContainer.style.display = 'block';
    
    // Create new offline exporter instance
    const outFileName = getExportFilename();
    const exporter = new OfflineExporter(currentAudioFile, visualizer, threeManager, progressBar, exportStatus, outFileName);
    await exporter.exportVideo();
    
    // When done (or failed)
    setTimeout(() => {
      exportBtn.disabled = false;
      if (exportRecordBtn) exportRecordBtn.disabled = false;
      exportBtn.style.display = 'block';
      progressContainer.style.display = 'none';
      if (!exportStatus.textContent.includes('failed')) {
      }
    }, 5000);
  });

  // Export Logic (Screen Record)
  if (exportRecordBtn) {
    let exporterRecord = null;
    exportRecordBtn.addEventListener('click', async () => {
      if (!currentAudioFile) return;
      
      if (exporterRecord && exporterRecord.isRecording) {
        // Stop recording
        exporterRecord.stopRecording();
        exportRecordBtn.textContent = '🔴 Export MP4 (Screen Record)';
        exportStatus.textContent = 'Recording stopped. Downloading...';
        exportBtn.disabled = false;
      } else {
        if (!(await licenseManager.canExport())) {
          showPaywall();
          return;
        }
        await licenseManager.incrementExportCount();

        // Start recording
        const outFileName = getExportFilename();
        exporterRecord = new VideoExporter(canvasElement, audioElement, audioEngine, outFileName);
        exportBtn.disabled = true;
        exportRecordBtn.textContent = '⏹️ Stop Recording';
        exportStatus.textContent = 'Recording in progress... Playing audio.';
        await exporterRecord.startRecording();
        
        // Wait for it to finish naturally
        audioElement.addEventListener('ended', function onEnded() {
          exportRecordBtn.textContent = '🔴 Export MP4 (Screen Record)';
          exportStatus.textContent = 'Recording finished. Downloading...';
          exportBtn.disabled = false;
          audioElement.removeEventListener('ended', onEnded);
        });
      }
    });
  }

  // Audio Playback Events
  audioElement.addEventListener('play', () => {
    audioEngine.resume();
  });

  // Main Loop for updating lyrics sync & rendering ThreeManager
  const renderLoop = (time) => {
    requestAnimationFrame(renderLoop);
    if (window.isExporting) return; // Pause live rendering during offline export
    
    // update lyrics sync
    lyricsManager.update(audioElement.currentTime);
    
    // (ThreeManager is now updated internally by visualizer.drawFrame)
  };
  requestAnimationFrame(renderLoop);

  // Web Worker for background rendering heartbeat (keeps screen record alive if tab is hidden)
  const workerCode = `
    let timerId;
    self.onmessage = function(e) {
      if (e.data === 'start') {
        timerId = setInterval(() => self.postMessage('tick'), 1000 / 60);
      } else if (e.data === 'stop') {
        clearInterval(timerId);
      }
    };
  `;
  const timerWorker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));

  timerWorker.onmessage = () => {
    if (document.hidden && !window.isExporting) {
      const time = performance.now();
      lyricsManager.update(audioElement.currentTime);
      // (ThreeManager is updated inside visualizer.drawFrame)
      visualizer.drawFrame(time);
    }
  };
  timerWorker.postMessage('start');
});
