export class Visualizer {
  constructor(canvasElement, audioEngine, slideshowManager, lyricsManager) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.audioEngine = audioEngine;
    this.slideshowManager = slideshowManager;
    this.lyricsManager = lyricsManager;
    this.animationId = null;
    
    // Presets
    this.visualizerStyle = 0;
    this.animationStyle = 0;
    this.bgOpacity = 0.6;
    this.avatar2DStyle = 0;
    this.backgroundStyle = 0;
    this.effectStyle = 0;
    this.particles = [];
    this.logoImage = null;
    this.logoSize = 250;
    this.gentlePan = true;
    this.gentlePanIntensity = 1.0;
    this.shakeBeatIntensity = 1.0;
    this.logoShake = true;
    this.logoShakeIntensity = 1.0;

    // Sliders
    this.sliderVis = 1;
    this.sliderAnim = 1;
    this.sliderAvatar2D = 1;
    this.sliderBg = 1;
    this.sliderEffect = 1;
    
    // Load 2D Avatar assets
    this.avatars2D = {
      1: this.loadImage('/avatars/neon_dancer.png'),
      2: this.loadImage('/avatars/anime_dancer.png')
    };
    
    // Store current dimensions to prevent window resize from resetting it
    this.targetWidth = 1920;
    this.targetHeight = 1080;
    
    this.resize(1920, 1080);
    window.addEventListener('resize', () => this.resize(this.targetWidth, this.targetHeight));
  }

  resize(width = this.targetWidth, height = this.targetHeight) {
    this.targetWidth = width;
    this.targetHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  setStyles(visStyle, animStyle, avatar2DStyle, bgStyle, effectStyle) {
    this.visualizerStyle = parseInt(visStyle, 10);
    this.animationStyle = parseInt(animStyle, 10);
    if (avatar2DStyle !== undefined) this.avatar2DStyle = parseInt(avatar2DStyle, 10);
    if (bgStyle !== undefined) this.backgroundStyle = parseInt(bgStyle, 10);
    if (effectStyle !== undefined) {
      const newEffectStyle = parseInt(effectStyle, 10);
      if (this.effectStyle !== newEffectStyle) {
        this.effectStyle = newEffectStyle;
        this.particles = []; // Clear old particles immediately so they don't overlap
      }
    }
  }

  setLogo(url) {
    this.logoImage = new Image();
    this.logoImage.src = url;
  }

  setSliders(vis, anim, avatar2D, bg, effect) {
    if (vis !== undefined) this.sliderVis = vis;
    if (anim !== undefined) this.sliderAnim = anim;
    if (avatar2D !== undefined) this.sliderAvatar2D = avatar2D;
    if (bg !== undefined) this.sliderBg = bg;
    if (effect !== undefined) this.sliderEffect = effect;
  }

  start() {
    if (this.animationId) return;
    this.render(performance.now());
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  render(time) {
    this.animationId = requestAnimationFrame((t) => this.render(t));
    if (window.isExporting) return; // Pause live render during export
    this.drawFrame(time);
  }

  drawFrame(time) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Reset canvas state to prevent leaks from previous frames
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Clear canvas
    this.ctx.fillStyle = '#0d0d0d';
    this.ctx.fillRect(0, 0, width, height);

    // === Fetch Audio Data First ===
    let dataArray = this.audioEngine.getFrequencyData();
    let isPreview = false;
    
    if (!dataArray || dataArray.every(v => v === 0)) {
      isPreview = true;
      dataArray = new Uint8Array(128);
      for(let i=0; i<128; i++) {
        dataArray[i] = ((Math.sin(i*0.08 + time/4000) * 0.5 + 0.5) * 25);
      }
    }
    
    let rawBass = this.audioEngine.getBass ? this.audioEngine.getBass() : 0;
    let isBeat = this.audioEngine.checkBeat ? this.audioEngine.checkBeat() : false;
    
    if (isPreview) {
      isBeat = false;
      rawBass = 0.05;
    }

    if (!this.smoothBass) this.smoothBass = 0;
    this.smoothBass += (rawBass - this.smoothBass) * 0.2;
    
    if (!this.beatIntensity) this.beatIntensity = 0;
    if (isBeat) this.beatIntensity = 1.0;
    else this.beatIntensity *= 0.92;

    this.ctx.save();
    
    // Background Shake (Smooth Rhythmic Sync)
    if (this.shakeBeat && this.beatIntensity > 0.05) {
      this.ctx.translate(width/2, height/2);
      
      const intensity = this.shakeBeatIntensity || 1.0;
      // Smooth rhythmic pump
      const bgScaleBump = 1.0 + (this.beatIntensity * 0.05 * intensity); 
      this.ctx.scale(bgScaleBump, bgScaleBump);
      
      // Smooth rhythmic sway (figure-8 motion tied to beat intensity)
      const swayX = Math.sin(time / 200) * this.beatIntensity * 30 * intensity;
      const swayY = Math.cos(time / 400) * this.beatIntensity * 15 * intensity;
      this.ctx.translate(swayX, swayY);
      
      this.ctx.translate(-width/2, -height/2);
    }

    // 0. Procedural Background
    if (this.backgroundStyle > 0) {
      this.drawBackgroundPreset(width, height, time);
    }

    // 1. Draw Background
    if (this.slideshowManager) {
      this.slideshowManager.update(time);
      const slideData = this.slideshowManager.getRenderData();
      
      if (slideData) {
        this.ctx.save();
        this.drawCoverImage(slideData.currentImage, width, height, slideData.timeSinceLastSlide);
        if (slideData.nextImage && slideData.fadeProgress > 0) {
          this.ctx.globalAlpha = slideData.fadeProgress;
          this.drawCoverImage(slideData.nextImage, width, height, 0);
        }
        this.ctx.restore();
        
        // Dark overlay
        const safeOpacity = isNaN(this.bgOpacity) ? 0.6 : Math.min(this.bgOpacity, 0.85);
        this.ctx.fillStyle = `rgba(0,0,0,${safeOpacity})`;
        this.ctx.fillRect(0, 0, width, height);
      }
    }
    
    this.ctx.restore(); // Restore after background drawn so it doesn't leak into 3D avatar or other parts unless we want them to shake too.

    // 1.5 Draw 3D Avatar composite
    // FIX: Only draw (and sync GPU->CPU) if 3D avatar is actually enabled to prevent "GPU stall due to ReadPixels"
    const threeCanvas = document.getElementById('three-canvas');
    if (threeCanvas && window.threeManager && window.threeManager.style > 0) {
      window.threeManager.update(dataArray, time);
      this.ctx.drawImage(threeCanvas, 0, 0, width, height);
    }
    
    // 2. Draw Visualizer
    
    this.ctx.save();
    
    // Beat-driven Screen Shake
    if (this.beatIntensity > 0.1) {
      const shakeX = (Math.random() - 0.5) * this.beatIntensity * 10;
      const shakeY = (Math.random() - 0.5) * this.beatIntensity * 10;
      this.ctx.translate(shakeX, shakeY);
    }
    
    this.drawVisualizerPreset(dataArray, width, height, time, this.smoothBass, this.beatIntensity);
    this.ctx.restore();

    // 3. Draw 2D Avatar
    if (this.avatar2DStyle > 0 && this.avatars2D[this.avatar2DStyle]) {
      const img = this.avatars2D[this.avatar2DStyle];
      if (img.complete && img.naturalWidth > 0) {
        // Use smooth bass and beat intensity for avatar animation
        let avatarH = height * 0.6;
        let avatarW = img.width * (avatarH / img.height);
        
        // Ensure avatar doesn't overflow horizontally on vertical screens (e.g. 9:16)
        if (avatarW > width * 0.8) {
          avatarW = width * 0.8;
          avatarH = img.height * (avatarW / img.width);
        }
        
        this.ctx.save();
        // Bounce dynamically based on beats and smooth bass
        const bounce = (this.smoothBass * 50) + (this.beatIntensity * 30);
        this.ctx.translate(width/2, height - avatarH/2 - bounce);
        
        // Scale pulse on beat
        const baseScale = this.sliderAvatar2D || 1;
        const scale = baseScale + (this.smoothBass * 0.1 * baseScale) + (this.beatIntensity * 0.05 * baseScale);
        this.ctx.scale(scale, scale);
        
        // Tilt slightly on beat
        this.ctx.rotate(Math.sin(time/200) * this.smoothBass * 0.1);
        
        // Use screen blend mode to make black backgrounds completely transparent!
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.drawImage(img, -avatarW/2, -avatarH/2, avatarW, avatarH);
        this.ctx.restore();
      }
    } else if (this.avatar2DStyle >= 3 && this.avatar2DStyle <= 32) {
      // Procedural 2D Avatars
      this.ctx.save();
      const seed = this.avatar2DStyle;
      const baseScale = this.sliderAvatar2D || 1;
      const bounce = (this.smoothBass * 50) + (this.beatIntensity * 30);
      this.ctx.translate(width/2, height/2 - bounce + 100);
      
      const scale = baseScale + (this.smoothBass * 0.1 * baseScale) + (this.beatIntensity * 0.05 * baseScale);
      this.ctx.scale(scale, scale);
      this.ctx.rotate(Math.sin(time/200) * this.smoothBass * 0.1);
      
      this.ctx.globalCompositeOperation = 'screen';
      
      const numPoints = (seed % 10) + 3; // 3 to 12 points
      const radius = 150 + (seed % 5) * 20;
      
      this.ctx.beginPath();
      for (let i = 0; i <= Math.PI * 2.01; i += Math.PI * 2 / numPoints) {
        const r = radius + Math.sin(i * (seed % 4 + 1) + time / 200) * (this.smoothBass * 100);
        const x = Math.cos(i) * r;
        const y = Math.sin(i) * r;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      
      const hue = ((seed * 137.5) + time / 20) % 360;
      this.ctx.lineWidth = 4 + (seed % 5);
      this.ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
      this.ctx.stroke();
      
      if (seed % 2 === 0) {
        this.ctx.fillStyle = `hsla(${(hue + 180) % 360}, 100%, 50%, 0.3)`;
        this.ctx.fill();
      }
      
      // Draw Inner elements
      const numRings = (seed % 4) + 1;
      for (let j = 1; j <= numRings; j++) {
        this.ctx.beginPath();
        const innerRadius = radius * (j / (numRings + 1)) * (1 + this.beatIntensity * 0.2);
        this.ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsla(${(hue + j * 40) % 360}, 100%, 70%, 0.8)`;
        this.ctx.stroke();
      }
      
      // Draw orbiting particles
      const numParticles = (seed % 8) * 3;
      for (let p = 0; p < numParticles; p++) {
        const pAngle = (p / numParticles) * Math.PI * 2 + time / (500 + (seed % 3)*100);
        const pRadius = radius + 40 + Math.sin(time/100 + p) * 20 * this.smoothBass;
        this.ctx.beginPath();
        this.ctx.arc(Math.cos(pAngle)*pRadius, Math.sin(pAngle)*pRadius, 5 + this.beatIntensity * 5, 0, Math.PI*2);
        this.ctx.fillStyle = `hsl(${(hue + p*10)%360}, 100%, 80%)`;
        this.ctx.fill();
      }

      this.ctx.restore();
    } else if (this.avatar2DStyle >= 33 && this.avatar2DStyle <= 62) {
      // Pro DJ Gear 2D Procedural Avatars
      this.ctx.save();
      const seed = this.avatar2DStyle;
      const baseScale = this.sliderAvatar2D || 1;
      const bounce = (this.smoothBass * 50) + (this.beatIntensity * 30);
      this.ctx.translate(width/2, height/2 - bounce + 100);
      
      const scale = baseScale + (this.smoothBass * 0.1 * baseScale) + (this.beatIntensity * 0.05 * baseScale);
      this.ctx.scale(scale, scale);
      
      this.ctx.globalCompositeOperation = 'screen';
      
      if (seed % 2 === 0) {
        // Speaker Cone Theme
        const r1 = 250 + this.smoothBass * 100;
        const r2 = 180 + this.beatIntensity * 120;
        const hue = (seed * 25 + time/50) % 360;
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r1, 0, Math.PI * 2);
        this.ctx.fillStyle = '#222';
        this.ctx.fill();
        this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.lineWidth = 10;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(0, 0, r2, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.fill();
      } else {
        // Turntable Theme
        const hue = (seed * 40 - time/50) % 360;
        this.ctx.rotate(time / 200 * (1 + this.smoothBass));
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 300, 0, Math.PI * 2);
        this.ctx.fillStyle = '#111';
        this.ctx.fill();

        for (let i = 0; i < 5; i++) {
           this.ctx.beginPath();
           this.ctx.arc(0, 0, 250 - i * 30, 0, Math.PI * 2);
           this.ctx.strokeStyle = '#333';
           this.ctx.lineWidth = 2;
           this.ctx.stroke();
        }
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 100 + this.beatIntensity * 40, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.fill();
      }

      this.ctx.restore();
    } else if (this.avatar2DStyle >= 63 && this.avatar2DStyle <= 69) {
      // Custom Vinyl Records
      this.ctx.save();
      const baseScale = this.sliderAvatar2D || 1;
      const bounce = (this.smoothBass * 30) + (this.beatIntensity * 20);
      this.ctx.translate(width/2, height/2 - bounce + 100);
      
      const scale = baseScale + (this.smoothBass * 0.05 * baseScale);
      this.ctx.scale(scale, scale);
      
      // Spin the vinyl based on time and beat
      this.ctx.rotate((time / 500) + (this.smoothBass * 0.5));
      
      // Draw outer vinyl (black)
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 200, 0, Math.PI * 2);
      this.ctx.fillStyle = '#111'; // Dark grey/black
      this.ctx.fill();
      
      // Draw grooves
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeStyle = '#222';
      for (let r = 70; r < 190; r += 12) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      // Draw shine
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 200, 0, Math.PI * 2);
      const grad = this.ctx.createLinearGradient(-200, -200, 200, 200);
      grad.addColorStop(0, 'rgba(255,255,255,0.15)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.05)');
      this.ctx.fillStyle = grad;
      this.ctx.fill();
      
      // Draw inner label
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 65, 0, Math.PI * 2);
      if (this.avatar2DStyle === 63) this.ctx.fillStyle = '#eeeeee'; // White
      else if (this.avatar2DStyle === 64) this.ctx.fillStyle = '#d32f2f'; // Red
      else if (this.avatar2DStyle === 65) this.ctx.fillStyle = '#fbc02d'; // Yellow
      else if (this.avatar2DStyle === 66) this.ctx.fillStyle = '#1976d2'; // Blue
      else if (this.avatar2DStyle === 67) this.ctx.fillStyle = '#00bcd4'; // Sea Blue
      else if (this.avatar2DStyle === 68) this.ctx.fillStyle = '#e91e63'; // Pink
      else if (this.avatar2DStyle === 69) this.ctx.fillStyle = '#4caf50'; // Green
      this.ctx.fill();
      
      // Label details (track ring)
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 55, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Center hole
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = '#0d0d0d'; // match background
      this.ctx.fill();
      
      this.ctx.restore();
    } else if (this.avatar2DStyle === 70) {
      // 71. DJ Turntable Setup
      this.ctx.save();
      const baseScale = this.sliderAvatar2D || 1;
      const bounce = (this.smoothBass * 40) + (this.beatIntensity * 20);
      this.ctx.translate(width/2, height/2 - bounce + 100);
      
      const scale = baseScale + (this.smoothBass * 0.05 * baseScale);
      this.ctx.scale(scale, scale);
      
      // Draw mixer base
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.roundRect(-380, -140, 760, 280, 15);
      this.ctx.fill();
      this.ctx.stroke();

      // Function to draw platter
      const drawPlatter = (x, color, timeOffset) => {
        this.ctx.save();
        this.ctx.translate(x, 0);
        this.ctx.rotate((time / 400) + timeOffset + (this.smoothBass * 0.5));
        
        // Outer platter
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 110, 0, Math.PI * 2);
        this.ctx.fillStyle = '#111';
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#222';
        
        // Grooves
        for (let r = 40; r < 100; r += 10) {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, r, 0, Math.PI * 2);
          this.ctx.stroke();
        }
        
        // Label
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 35, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Hole
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        
        this.ctx.restore();
      };

      drawPlatter(-200, '#ff3366', 0); // Left platter
      drawPlatter(200, '#00ccff', Math.PI); // Right platter

      // Center Mixer Section
      this.ctx.fillStyle = '#222';
      this.ctx.beginPath();
      this.ctx.roundRect(-80, -140, 160, 280, 5);
      this.ctx.fill();
      this.ctx.stroke();

      // EQ Knobs (bumping with bass)
      const knobScale = 1 + this.beatIntensity * 0.2;
      for (let y = -90; y <= 10; y += 45) {
        this.ctx.save();
        this.ctx.translate(-40, y);
        this.ctx.scale(knobScale, knobScale);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = '#444';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.translate(40, y);
        this.ctx.scale(knobScale, knobScale);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = '#444';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Crossfader sliding back and forth based on beat/time
      const faderX = Math.sin(time / 250) * 45 * (this.beatIntensity + 0.5);
      this.ctx.fillStyle = '#050505';
      this.ctx.fillRect(-60, 90, 120, 12); // Fader track
      
      this.ctx.fillStyle = '#666';
      this.ctx.beginPath();
      this.ctx.roundRect(faderX - 12, 70, 24, 52, 4); // Fader knob
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.restore();
    }

    // 3.5 Draw Video Effects
    if (this.effectStyle > 0) {
      this.drawVideoEffectPreset(width, height, time, this.smoothBass, this.beatIntensity);
    }

    // 4. Draw Lyrics (Subtitles)
    let lyricData = this.lyricsManager ? this.lyricsManager.getCurrentLyricData() : null;
    
    if (!lyricData || !lyricData.text) {
      if (isPreview) {
        // Mock lyric for preview, loop animation every 2.5 seconds
        const animCycle = 2500;
        let activeTime = time % animCycle;
        
        // If previewAnimStart is set, sync the preview animation to that time
        if (this.previewAnimStart) {
           activeTime = (time - this.previewAnimStart) % animCycle;
        }

        lyricData = { text: "Preview Animation", duration: animCycle, activeTime: activeTime, isPreviewMode: true };
      }
    }

    if (lyricData && lyricData.text) {
      this.drawLyricPreset(lyricData, width, height, time);
    }
    
    // 5. Draw Logo
    if (this.logoImage && this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      const logoW = this.logoSize || 250; 
      const ratio = this.logoImage.naturalWidth / this.logoImage.naturalHeight;
      const logoH = logoW / ratio;
      const padding = 50;
      
      this.ctx.save();
      this.ctx.globalAlpha = 0.9;
      // Use standard blend to preserve logo colors
      this.ctx.globalCompositeOperation = 'source-over';
      
      if (this.logoShake && this.beatIntensity > 0.05) {
        const intensity = this.logoShakeIntensity || 1.0;
        const logoScaleBump = 1.0 + (this.beatIntensity * 0.1 * intensity);
        const centerX = width - logoW/2 - padding;
        const centerY = padding + logoH/2;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(logoScaleBump, logoScaleBump);
        
        // Slight rotation shake
        const rotationShake = (Math.random() - 0.5) * 0.1 * this.beatIntensity * intensity;
        this.ctx.rotate(rotationShake);
        
        this.ctx.translate(-centerX, -centerY);
      }
      
      this.ctx.drawImage(this.logoImage, width - logoW - padding, padding, logoW, logoH);
      this.ctx.restore();
    }
  }

  drawCoverImage(img, canvasWidth, canvasHeight, timeForPan = 0) {
    if (!img) return;
    
    // For images, we wait for complete. For videos, we check readyState >= 2 (HAVE_CURRENT_DATA)
    if (img instanceof HTMLImageElement && !img.complete) return;
    if (img instanceof HTMLVideoElement && img.readyState < 2) return;
    
    const imgW = img.videoWidth || img.naturalWidth || img.width;
    const imgH = img.videoHeight || img.naturalHeight || img.height;
    
    if (!imgW || !imgH || imgW === 0 || imgH === 0) return;

    const imgRatio = imgW / imgH;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = imgW * (canvasHeight / imgH);
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvasWidth;
      drawHeight = imgH * (canvasWidth / imgW);
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    }
    
    // Safety check against NaN or Infinity
    if (!isFinite(drawWidth) || !isFinite(drawHeight) || !isFinite(offsetX) || !isFinite(offsetY)) {
      this.ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      return;
    }

    try {
      this.ctx.save();
      if (this.gentlePan) {
        const duration = this.slideshowManager ? this.slideshowManager.displayTime : 5000;
        const progress = Math.min(timeForPan / duration, 1.5);
        const intensity = this.gentlePanIntensity || 1.0;
        const scale = 1.0 + (progress * 0.08 * intensity); // Subtle zoom * intensity
        
        this.ctx.translate(canvasWidth / 2, canvasHeight / 2);
        this.ctx.scale(scale, scale);
        // Subtle drift
        this.ctx.translate((-canvasWidth / 2) + (progress * 15 * intensity), -canvasHeight / 2);
      }
      this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      this.ctx.restore();
    } catch(e) {
      // Fallback if drawImage fails for any weird reason
      console.warn("drawCoverImage error", e);
    }
  }

  // --- 12 VISUALIZER PRESETS ---
  drawVisualizerPreset(dataArray, w, h, time, smoothBass, beatIntensity) {
    this.ctx.save();
    
    // Add global beat glow
    if (beatIntensity > 0.1) {
       this.ctx.shadowBlur = beatIntensity * 50;
       this.ctx.shadowColor = `hsla(${time/10 % 360}, 100%, 50%, ${beatIntensity})`;
    }
    
    const bassPulse = smoothBass || 0;
    
    const cx = w / 2;
    const cy = h / 2;

    // Apply visualizer scale slider
    const visScale = this.sliderVis || 1;
    this.ctx.translate(cx, cy);
    this.ctx.scale(visScale, visScale);
    this.ctx.translate(-cx, -cy);

    switch (this.visualizerStyle) {
      case 0: // Circular Bars
        this.drawCircularBars(dataArray, cx, cy, Math.min(w,h)/4 + bassPulse*50, h/3, time);
        break;
      case 1: // Horizontal Bars
        this.drawHorizontalBars(dataArray, w, h, time);
        break;
      case 2: // Symmetrical Center
        this.drawSymmetricalBars(dataArray, w, h, time);
        break;
      case 3: // Waveform
        this.drawWaveform(dataArray, w, h, time);
        break;
      case 4: // Circular Wave
        this.drawCircularWave(dataArray, cx, cy, Math.min(w,h)/4 + bassPulse*50, h/4, time);
        break;
      case 5: // Luminous Tide
        this.drawLuminousTide(dataArray, w, h, time, bassPulse);
        break;
      case 6: // Zen Garden Ripples
        this.drawZenGardenRipples(dataArray, cx, cy, time, bassPulse);
        break;
      case 7: // Radial Burst
        this.drawRadialBurst(dataArray, cx, cy, time);
        break;
      case 8: // Smooth Aurora
        this.drawSmoothAurora(dataArray, w, h, time, bassPulse);
        break;
      case 9: // Floating Orbs
        this.drawFloatingOrbs(dataArray, w, h, time);
        break;
      case 10: // Digital Equalizer
        this.drawDigitalEqualizer(dataArray, w, h, time);
        break;
      case 11: // Minimalist Orbit
        this.drawMinimalistOrbit(dataArray, cx, cy, time, bassPulse);
        break;
      case 12: // Ethereal Mist
        this.drawEtherealMist(dataArray, w, h, time, bassPulse);
        break;
      case 13: // Laser Arcs
        this.drawLaserArcs(dataArray, cx, cy, Math.min(w,h)/3, time, bassPulse);
        break;
      case 14: // Infinity Hexagons
        this.drawInfinityHexagons(dataArray, cx, cy, Math.min(w,h)/4, time, bassPulse);
        break;
      case 15: // Soft Glow Rings
        this.drawSoftGlowRings(dataArray, cx, cy, Math.min(w,h)/4, time, bassPulse);
        break;
    }

    if (this.visualizerStyle >= 18 && this.visualizerStyle <= 47) {
      // 30 Pro DJ Decks & Studio EQs Procedural Generator
      this.ctx.save();
      const seed = this.visualizerStyle;
      const numBands = 32 + (seed % 4) * 16;
      const step = Math.floor(dataArray.length / numBands);
      const angleStep = (Math.PI * 2) / numBands;
      
      const cx2 = w / 2;
      const cy2 = h / 2 + 50;
      const baseRadius = 250 + (seed % 5) * 40;

      if (seed % 2 === 0) {
        // Circular Vinyl / Studio EQ style
        for (let i = 0; i < numBands; i++) {
          const val = dataArray[i * step] || 0;
          const vh = (val / 255) * 400 * (1 + smoothBass * 0.5);
          const a = i * angleStep + (time / 1000) * ((seed % 3) + 1);
          
          this.ctx.beginPath();
          this.ctx.lineWidth = 4 + (seed % 3);
          this.ctx.strokeStyle = `hsl(${((seed * 15) + (i * 2) + (time / 10)) % 360}, 100%, 60%)`;
          this.ctx.moveTo(cx2 + Math.cos(a) * baseRadius, cy2 + Math.sin(a) * baseRadius);
          this.ctx.lineTo(cx2 + Math.cos(a) * (baseRadius + vh), cy2 + Math.sin(a) * (baseRadius + vh));
          this.ctx.stroke();
        }
      } else {
        // Linear V-Mixer Deck style
        const barWidth = w / numBands;
        for (let i = 0; i < numBands; i++) {
          const val = dataArray[i * step] || 0;
          const vh = (val / 255) * 600 * (1 + smoothBass * 0.5);
          const x = i * barWidth;
          const y = h - vh;
          
          this.ctx.fillStyle = `hsl(${((seed * 25) + (i * 5) - (time / 10)) % 360}, 100%, 60%)`;
          this.ctx.fillRect(x, y, barWidth - (seed % 3), vh);
        }
      }
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  // --- NEW PREMIUM VISUALIZER METHODS ---
  drawLaserArcs(data, cx, cy, radius, time, bassPulse) {
    const bars = 32;
    const step = (Math.PI * 2) / bars;
    this.ctx.lineCap = 'round';
    for (let i = 0; i < bars; i++) {
      const v = (data[i * 2] || 0) / 255;
      const angle = i * step + (time/2000);
      const r = radius + v * 150 + (bassPulse * 50);
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, angle, angle + step * 0.5);
      this.ctx.strokeStyle = `hsla(${(i/bars)*360 + time/20}, 100%, 60%, 0.8)`;
      this.ctx.lineWidth = 4 + v * 10;
      this.ctx.stroke();
    }
  }

  drawInfinityHexagons(data, cx, cy, radius, time, bassPulse) {
    const layers = 6;
    for (let l = 0; l < layers; l++) {
      const v = (data[l * 5] || 0) / 255;
      const r = radius * (1 + l * 0.3) + (v * 50) + (bassPulse * 20);
      this.ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const angle = i * (Math.PI / 3) + (time/1000) * (l%2==0?1:-1);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.strokeStyle = `hsla(${l*30 + time/20}, 100%, 50%, ${1 - l/layers})`;
      this.ctx.lineWidth = 3 + v * 5;
      this.ctx.stroke();
    }
  }

  drawLiquidAudio(data, cx, cy, radius, time, bassPulse) {
    const points = 64;
    const step = (Math.PI * 2) / points;
    this.ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const idx = i % points;
      const v = (data[idx] || 0) / 255;
      const angle = i * step;
      // Perlin-like organic deformation using sine waves
      const noise = Math.sin(angle * 5 + time/500) * 20 + Math.cos(angle * 3 - time/400) * 15;
      const r = radius + noise + (v * 100) + (bassPulse * 40);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = `hsla(${time/30 % 360}, 100%, 60%, 0.4)`;
    this.ctx.fill();
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = `hsla(${(time/30 + 180) % 360}, 100%, 60%, 0.8)`;
    this.ctx.stroke();
  }

  // Visualizer Helpers
  drawCircularBars(data, cx, cy, radius, maxH, time) {
    const bars = data.length;
    const step = (Math.PI * 2) / bars;
    for (let i = 0; i < bars; i++) {
      const v = data[i] / 255;
      const angle = i * step;
      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * (radius + v * maxH);
      const y2 = cy + Math.sin(angle) * (radius + v * maxH);
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokeStyle = `hsla(${(i/bars)*360 + time/50}, 100%, 60%, 0.8)`;
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }
  }
  
  drawHorizontalBars(data, w, h, time) {
    const bars = data.length;
    const barW = w / bars;
    for (let i = 0; i < bars; i++) {
      const v = data[i] / 255;
      const barH = v * (h * 0.5);
      this.ctx.fillStyle = `hsla(${(i/bars)*360 + time/50}, 100%, 60%, 0.8)`;
      this.ctx.fillRect(i * barW, h - barH, barW - 2, barH);
    }
  }

  drawSymmetricalBars(data, w, h, time) {
    const bars = data.length / 2; // only use half
    const barW = w / (bars * 2);
    for (let i = 0; i < bars; i++) {
      const v = data[i] / 255;
      const barH = v * (h * 0.4);
      this.ctx.fillStyle = `hsla(${(i/bars)*360 + time/50}, 100%, 60%, 0.8)`;
      // Right side
      this.ctx.fillRect(w/2 + i * barW, h/2 - barH/2, barW - 2, barH);
      // Left side
      this.ctx.fillRect(w/2 - i * barW - barW, h/2 - barH/2, barW - 2, barH);
    }
  }

  drawWaveform(data, w, h, time) {
    const bars = data.length;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h/2);
    for (let i = 0; i < bars; i++) {
      const v = data[i] / 255;
      const x = (i / bars) * w;
      const y = h/2 + (v - 0.5) * (h * 0.5);
      this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = `hsla(${time/50 % 360}, 100%, 60%, 0.8)`;
    this.ctx.lineWidth = 5;
    this.ctx.stroke();
  }

  drawCircularWave(data, cx, cy, radius, maxH, time) {
    const bars = data.length;
    const step = (Math.PI * 2) / bars;
    this.ctx.beginPath();
    for (let i = 0; i <= bars; i++) {
      const v = data[i % bars] / 255;
      const r = radius + (v * maxH);
      const angle = i * step;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i===0) this.ctx.moveTo(x,y);
      else this.ctx.lineTo(x,y);
    }
    this.ctx.strokeStyle = `hsla(${time/30 % 360}, 100%, 60%, 0.8)`;
    this.ctx.lineWidth = 6;
    this.ctx.stroke();
  }

  drawLuminousTide(data, w, h, time, bass) {
    const lines = 4;
    for (let i = 0; i < lines; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, h);
      
      const v = (data[i * 10] || 0) / 255;
      
      let x = 0;
      for (let j = 0; j <= 5; j++) {
        const segW = w / 5;
        x = j * segW;
        const y = h/2 + Math.sin(time/1000 + i + j) * (100 + bass * 100) + (i*30) - (v*50);
        
        if (j === 0) {
          this.ctx.lineTo(x, y);
        } else {
          const prevX = (j - 1) * segW;
          const prevY = h/2 + Math.sin(time/1000 + i + (j-1)) * (100 + bass * 100) + (i*30) - (v*50);
          const cpX1 = prevX + segW / 2;
          const cpY1 = prevY;
          const cpX2 = x - segW / 2;
          const cpY2 = y;
          this.ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
        }
      }
      this.ctx.lineTo(w, h);
      this.ctx.closePath();
      
      this.ctx.fillStyle = `hsla(${200 + i*15 + (time/50 % 360)}, 70%, 60%, ${0.1 + v*0.2})`;
      this.ctx.fill();
    }
  }

  drawZenGardenRipples(data, cx, cy, time, bass) {
    const bars = data.length;
    for (let i = 0; i < 5; i++) {
      const v = (data[i*10] || 0) / 255;
      const r = (time/20 + i*100) % Math.max(cx, cy);
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r + (v*50*bass), 0, Math.PI*2);
      this.ctx.strokeStyle = `hsla(200, 50%, 80%, ${0.5 - (r/Math.max(cx, cy))*0.5})`;
      this.ctx.lineWidth = 2 + v*5;
      this.ctx.stroke();
    }
  }

  drawRadialBurst(data, cx, cy, time) {
    const bars = data.length;
    for (let i = 0; i < bars; i+=3) {
      const v = data[i] / 255;
      const angle = (i / bars) * Math.PI * 2 + time/2000;
      const dist = v * 800;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(cx + Math.cos(angle)*dist, cy + Math.sin(angle)*dist);
      this.ctx.strokeStyle = `hsla(${v*360}, 100%, 60%, ${v*0.5})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  drawSmoothAurora(data, w, h, time, bass) {
    const bars = data.length;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h);
    for (let i = 0; i < bars; i+=4) {
      const v = data[i] / 255;
      const x = (i / bars) * w;
      const y = h/2 + Math.sin(time/500 + i)*100 - (v*200*bass);
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(w, h);
    this.ctx.closePath();
    const grad = this.ctx.createLinearGradient(0, h/2, 0, h);
    grad.addColorStop(0, `hsla(${time/50 % 360}, 70%, 60%, 0.4)`);
    grad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = grad;
    this.ctx.fill();
  }

  drawFloatingOrbs(data, w, h, time) {
    for(let i=0; i<data.length; i+=4) {
      const v = data[i]/255;
      const x = (i/data.length)*w;
      const y = h - (v*h) - (Math.sin(time/500 + i)*50);
      this.ctx.fillStyle = `hsla(${i*2}, 100%, 70%, ${v})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, v*40, 0, Math.PI*2);
      this.ctx.fill();
    }
  }

  drawDigitalEqualizer(data, w, h, time) {
    const bars = 32;
    const step = Math.floor(data.length / bars);
    const barW = w / bars;
    for(let i=0; i<bars; i++) {
      let sum = 0;
      for(let j=0; j<step; j++) sum += data[i*step + j];
      const v = (sum/step)/255;
      const blocks = Math.floor(v * 20);
      const blockH = (h*0.6) / 20;
      for(let b=0; b<blocks; b++) {
        this.ctx.fillStyle = b > 15 ? 'red' : b > 10 ? 'yellow' : 'lime';
        this.ctx.fillRect(i*barW + 5, h - (b*blockH) - blockH, barW - 10, blockH - 2);
      }
    }
  }

  drawMinimalistOrbit(data, cx, cy, time, bass) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(time/1000);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 200 + bass*50, 0, Math.PI*2);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    const v = data[10]/255;
    this.ctx.beginPath();
    this.ctx.arc(200 + bass*50, 0, 5 + v*10, 0, Math.PI*2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.restore();
  }

  drawEtherealMist(data, w, h, time, bass) {
    for (let i = 0; i < 3; i++) {
      const v = (data[i*20] || 0) / 255;
      const x = w/2 + Math.sin(time/800 + i)*300;
      const y = h/2 + Math.cos(time/700 + i)*200;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 200 + v*150*bass, 0, Math.PI*2);
      this.ctx.fillStyle = `hsla(${180 + i*40 + time/50}, 60%, 60%, 0.1)`;
      this.ctx.filter = 'blur(40px)';
      this.ctx.fill();
      this.ctx.filter = 'none';
    }
  }

  // --- 12 SUBTITLE ANIMATION PRESETS ---
  drawLyricPreset(lyricData, w, h, time) {
    const animScale = this.sliderAnim || 1;
    const { text, duration } = lyricData;
    let activeTime = lyricData.activeTime * animScale;
    let localTime = time * animScale;
    
    // Calculate a natural highlight duration (approx 350ms per word), but no longer than actual duration
    const wordsCount = text.split(' ').length;
    const highlightDuration = Math.min(duration || 2000, Math.max(1000, wordsCount * 350));
    
    // Progress for highlighting/animation caps at 1
    const progress = Math.min(activeTime / highlightDuration, 1);
    
    this.ctx.save();
    this.ctx.font = 'bold 72px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const lyricY = h * 0.85;

    if (this.animationStyle >= 16) {
      this.drawCapCutStyles(lyricData, w, h, time, animScale, progress);
      this.ctx.restore();
      return;
    }

    // Apply specific animation
    let alpha = 1;
    let yOffset = 0;
    let scale = 1;
    let drawText = text;

    switch(this.animationStyle) {
      case 0: // Instant
        break;
      case 1: // Fade In
        alpha = Math.min(activeTime / 500, 1);
        break;
      case 2: // Slide Up
        alpha = Math.min(activeTime / 500, 1);
        yOffset = 50 * (1 - alpha);
        break;
      case 3: // Typewriter
        const chars = Math.floor((activeTime / 1000) * text.length);
        drawText = text.substring(0, Math.max(1, chars));
        break;
      case 4: // Bounce
        scale = 1 + Math.sin(Math.min(activeTime/300, Math.PI)) * 0.5;
        break;
      case 5: // Glitch
        if (activeTime < 300 && Math.random() > 0.5) {
          this.ctx.translate(Math.random()*20-10, Math.random()*10-5);
          this.ctx.fillStyle = Math.random() > 0.5 ? 'cyan' : 'magenta';
        }
        break;
      case 6: // Zoom Scale
        scale = 0.5 + Math.min(activeTime/500, 0.5);
        alpha = Math.min(activeTime / 300, 1);
        break;
      case 7: // Blur Reveal (Simulated with alpha)
        alpha = Math.min(activeTime / 800, 1);
        this.ctx.filter = `blur(${10 * (1-alpha)}px)`;
        break;
      case 8: // Wave Text
        yOffset = Math.sin(localTime/200) * 20;
        break;
      case 9: // Swing
        this.ctx.translate(w/2, lyricY);
        this.ctx.rotate(Math.sin(localTime/300) * 0.1);
        this.ctx.translate(-w/2, -lyricY);
        break;
      case 10: // Flash
        alpha = (Math.floor(activeTime / 100) % 2 === 0 && activeTime < 600) ? 0 : 1;
        break;
      case 11: // Color Cycle
        this.ctx.fillStyle = `hsl(${(localTime/10)%360}, 100%, 50%)`;
        break;
      case 12: // Dancing Text
        yOffset = Math.sin(activeTime/100) * 30;
        this.ctx.rotate(Math.sin(activeTime/150) * 0.2);
        scale = 1 + Math.sin(activeTime/200) * 0.2;
        this.ctx.fillStyle = `hsl(${(localTime/5)%360}, 100%, 60%)`;
        break;
      case 13: // Cinematic 3D Rotate
        const rotY = Math.max(0, 1 - activeTime/1000) * Math.PI;
        this.ctx.transform(Math.cos(rotY), 0, 0, 1, 0, 0);
        scale = 1 + (activeTime/5000); // slow zoom in
        break;
      case 14: // Neon Pulse
        scale = 1 + Math.abs(Math.sin(localTime/150)) * 0.3;
        this.ctx.shadowBlur = Math.abs(Math.sin(localTime/150)) * 40;
        this.ctx.shadowColor = '#0ff';
        this.ctx.fillStyle = '#fff';
        break;
      case 15: // Cyber Glitch
        if (Math.random() > 0.8) {
          yOffset = (Math.random() - 0.5) * 40;
          this.ctx.translate((Math.random() - 0.5) * 50, 0);
          this.ctx.fillStyle = Math.random() > 0.5 ? '#0f0' : '#f0f';
        } else {
          this.ctx.fillStyle = '#fff';
        }
        break;
    }

    this.ctx.translate(w/2, lyricY + yOffset);
    // Apply slider scale explicitly
    if (lyricData.isPreviewMode) {
      scale *= (animScale * 0.6); // Scale down for preview
      alpha *= 0.5; // Lower opacity for preview
    } else {
      scale *= animScale;
    }
    this.ctx.scale(scale, scale);
    this.ctx.globalAlpha = alpha;

    // Gold & Black standard base (unless overridden by animation)
    if (this.animationStyle !== 5 && this.animationStyle !== 11 && this.animationStyle !== 12 && this.animationStyle !== 14 && this.animationStyle !== 15) {
      this.ctx.fillStyle = '#FFD700'; // Gold
    }

    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 4;
    this.ctx.shadowOffsetY = 4;
    
    this.ctx.lineWidth = 10;
    this.ctx.strokeStyle = '#000000';
    
    // KARAOKE RED HIGHLIGHTER (word by word)
    const textWidth = this.ctx.measureText(drawText).width;
    const grad = this.ctx.createLinearGradient(-textWidth/2, 0, textWidth/2, 0);
    
    const words = drawText.split(' ');
    const totalWords = words.length;
    let wordProgress = 0;
    if (totalWords > 0) {
      const currentWordIdx = Math.min(Math.floor(progress * totalWords), totalWords - 1);
      const textUpToWord = words.slice(0, currentWordIdx + 1).join(' ') + ' ';
      wordProgress = this.ctx.measureText(textUpToWord).width / textWidth;
    }
    
    const stopPoint = Math.min(Math.max(wordProgress, 0), 1);
    grad.addColorStop(0, '#ff0000'); // Exact red color requested
    grad.addColorStop(Math.max(0, stopPoint - 0.001), '#ff0000');
    
    const defaultFill = typeof this.ctx.fillStyle === 'string' ? this.ctx.fillStyle : '#FFD700';
    grad.addColorStop(stopPoint, defaultFill); 
    grad.addColorStop(1, defaultFill);
    
    this.ctx.fillStyle = grad;
    
    this.ctx.strokeText(drawText, 0, 0);
    this.ctx.fillText(drawText, 0, 0);

    this.ctx.restore();
  }

  drawCapCutStyles(lyricData, w, h, time, animScale, progress) {
    const { text } = lyricData;
    const words = text.split(' ');
    const totalWords = words.length;
    const lyricY = h * 0.85;

    this.ctx.font = '900 80px Inter, sans-serif'; // Extra bold, large trending font
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    
    // Measure total width to center the entire line
    let totalWidth = 0;
    const wordMetrics = [];
    const spacing = 15; // Adjusted spacing for better readability
    for (let word of words) {
      const width = this.ctx.measureText(word).width;
      wordMetrics.push({ word, width });
      totalWidth += width + spacing;
    }
    totalWidth -= spacing;

    // Responsive scaling: Ensure it fits within 90% of screen
    const maxAllowedWidth = w * 0.9;
    let fitScale = 1;
    if (totalWidth > maxAllowedWidth) {
      fitScale = maxAllowedWidth / totalWidth;
    }

    this.ctx.save();
    this.ctx.translate(w/2, lyricY);
    this.ctx.scale(fitScale, fitScale);
    this.ctx.translate(-w/2, -lyricY);

    let currentX = (w / 2) - (totalWidth / 2);

    for (let i = 0; i < totalWords; i++) {
      const { word, width } = wordMetrics[i];
      const wordStartProgress = i / totalWords;
      const wordEndProgress = (i + 1) / totalWords;
      
      let wProg = (progress - wordStartProgress) / (wordEndProgress - wordStartProgress);
      wProg = Math.max(0, Math.min(1, wProg));
      
      this.ctx.save();
      
      // Base styles
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowOffsetY = 8;
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 14;

      let scale = 1;
      let alpha = 1;
      let dx = 0;
      let dy = 0;

      if (this.animationStyle === 16) {
        // 17. CapCut Word Pop (Elastic bounce up from 0)
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords, 1);
          scale = 1 + Math.sin(t * Math.PI * 3) * Math.pow(1 - t, 2) * 0.4;
          if (t < 0.1) scale = t * 10;
        } else {
          scale = 0;
        }
      } 
      else if (this.animationStyle === 17) {
        // 18. CapCut Karaoke Spring (Current word springs HUGE and turns red)
        if (progress > wordStartProgress && progress < wordEndProgress) {
          scale = 1.35 + Math.sin(wProg * Math.PI) * 0.15;
          this.ctx.fillStyle = '#FF0044'; 
          this.ctx.shadowColor = '#FF0044';
          this.ctx.shadowBlur = 40;
          dy = -20 * Math.sin(wProg * Math.PI);
        } else if (progress >= wordEndProgress) {
          scale = 1.0;
          this.ctx.fillStyle = '#FFD700'; // Gold trail
        } else {
          scale = 0.95;
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.globalAlpha = 0.7;
        }
      }
      else if (this.animationStyle === 18) {
        // 19. CapCut Trailing Blur (Words fly in with massive motion blur)
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords, 1); 
          if (t < 0.3) {
            const flightProg = t / 0.3;
            dx = 200 * (1 - flightProg);
            this.ctx.filter = `blur(${20 * (1 - flightProg)}px)`;
            alpha = flightProg;
          } else {
            dx = 0;
            alpha = 1;
          }
          if (progress > wordStartProgress && progress < wordEndProgress) {
             this.ctx.fillStyle = '#00FFFF'; // Bright cyan active
             this.ctx.shadowColor = '#00FFFF';
             this.ctx.shadowBlur = 30;
          } else {
             this.ctx.fillStyle = '#FFFFFF';
          }
        } else {
          alpha = 0;
        }
      }
      else if (this.animationStyle === 19) {
        // 20. CapCut Neon Flash
        if (progress > wordStartProgress) {
          if (progress < wordEndProgress) {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.shadowColor = '#00FF00';
            this.ctx.shadowBlur = 50;
            scale = 1.15;
          } else {
            this.ctx.fillStyle = '#FFFFFF';
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 20) {
        // 21. CapCut Cinematic Drop
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords * 2, 1);
          if (t < 1) {
            dy = -100 * (1 - t);
            alpha = t;
          }
          if (progress < wordEndProgress && t === 1) {
             dy = Math.sin(time/30) * 6; // shake
             this.ctx.fillStyle = '#FFAA00';
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 21) {
        // 22. CapCut Glitch Reveal
        if (progress > wordStartProgress) {
          if (progress < wordEndProgress) {
            dx = (Math.random() - 0.5) * 15;
            dy = (Math.random() - 0.5) * 15;
            this.ctx.fillStyle = Math.random() > 0.5 ? '#00FFFF' : '#FF00FF';
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 22) {
        // 23. CapCut Wave Swipe
        if (progress > wordStartProgress) {
          dy = Math.sin((progress * Math.PI * 4) + i) * 20;
          if (progress < wordEndProgress) this.ctx.fillStyle = '#FFAAFF';
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 23) {
        // 24. CapCut Type Burst
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords * 4, 1);
          scale = t;
          if (progress < wordEndProgress) this.ctx.fillStyle = '#FFFF00';
        } else { alpha = 0; scale = 0; }
      }
      else if (this.animationStyle === 24) {
        // 25. CapCut Gradient Shift
        if (progress > wordStartProgress) {
          if (progress < wordEndProgress) {
            this.ctx.fillStyle = `hsl(${(time/5 + i*20)%360}, 100%, 60%)`;
            scale = 1.2;
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 25) {
        // 26. CapCut Elastic Pull
        if (progress > wordStartProgress) {
          if (progress < wordEndProgress) {
            const t = wProg;
            this.ctx.transform(1 + Math.sin(t*Math.PI)*0.5, 0, 0, 1 - Math.sin(t*Math.PI)*0.2, 0, 0);
            this.ctx.fillStyle = '#FF5555';
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 26) {
        // 27. CapCut Spin In
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords * 2, 1);
          this.ctx.rotate((1 - t) * Math.PI);
          scale = t;
          alpha = t;
          if (progress < wordEndProgress) this.ctx.fillStyle = '#55FF55';
        } else { alpha = 0; scale = 0; }
      }
      else if (this.animationStyle === 27) {
        // 28. CapCut 3D Flip
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords * 2, 1);
          this.ctx.transform(1, 0, 0, t, 0, 0);
          alpha = t;
          if (progress < wordEndProgress) this.ctx.fillStyle = '#5555FF';
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 28) {
        // 29. CapCut Letter Zoom
        if (progress > wordStartProgress) {
          if (progress < wordEndProgress) {
             this.ctx.transform(1.5, 0, 0, 1, 0, 0);
             this.ctx.fillStyle = '#FF00AA';
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 29) {
        // 30. CapCut Fire Aura
        if (progress > wordStartProgress) {
          if (progress < wordEndProgress) {
             this.ctx.shadowColor = '#FF4400';
             this.ctx.shadowBlur = 40 + Math.random() * 20;
             this.ctx.fillStyle = '#FFDD00';
             dy = -5;
          }
        } else { alpha = 0; }
      }
      else if (this.animationStyle === 30) {
        // 31. CapCut Bounce Drop
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords * 2, 1);
          dy = -Math.abs(Math.cos(t * Math.PI * 3)) * 60 * (1 - t);
          alpha = t;
          if (progress < wordEndProgress) this.ctx.fillStyle = '#00AAFF';
        } else { alpha = 0; }
      }
      else if (this.animationStyle >= 31 && this.animationStyle <= 60) {
        // 30 Pro DJ Text Anim Procedural Generator
        const seed = this.animationStyle;
        if (progress > wordStartProgress) {
          const t = Math.min((progress - wordStartProgress) * totalWords * (1 + (seed % 3)), 1);
          
          if (seed % 3 === 0) {
            // Club Strobe Pop
            scale = t < 1 ? 1 + Math.sin(time / 50) * 0.5 : 1;
            alpha = t < 1 ? (Math.random() > 0.5 ? 1 : 0) : 1;
            if (progress < wordEndProgress) {
              this.ctx.fillStyle = `hsl(${(seed * 20 + time/10) % 360}, 100%, 60%)`;
              this.ctx.shadowBlur = 20;
              this.ctx.shadowColor = this.ctx.fillStyle;
            }
          } else if (seed % 3 === 1) {
            // Beat Drop Shake
            if (progress < wordEndProgress) {
              dx = (Math.random() - 0.5) * 20;
              dy = (Math.random() - 0.5) * 20;
              this.ctx.fillStyle = '#FFFFFF';
              this.ctx.shadowColor = `hsl(${(seed * 40) % 360}, 100%, 50%)`;
              this.ctx.shadowBlur = 30 + Math.random() * 20;
              scale = 1.1;
            }
            alpha = t;
          } else {
            // Crossfader Swipe
            dx = (1 - t) * (i % 2 === 0 ? -200 : 200);
            alpha = t;
            if (progress < wordEndProgress) {
               this.ctx.fillStyle = `hsl(${time/5 % 360}, 100%, 70%)`;
               this.ctx.shadowBlur = 10;
               this.ctx.shadowColor = this.ctx.fillStyle;
            }
          }
        } else { alpha = 0; scale = 0; }
      }

      if (lyricData.isPreviewMode) {
        scale *= 0.6;
        alpha *= 0.5;
      }

      scale *= animScale;

      this.ctx.globalAlpha = alpha;
      this.ctx.translate(currentX + width / 2 + dx, lyricY + dy);
      this.ctx.scale(scale, scale);

      if (alpha > 0 && scale > 0) {
        this.ctx.strokeText(word, 0, 0);
        this.ctx.fillText(word, 0, 0);
      }

      this.ctx.restore();
      currentX += width + spacing; 
    }
    this.ctx.restore(); // Restore global fitScale
  }

  // --- 12 PROCEDURAL BACKGROUND PRESETS ---
  drawBackgroundPreset(w, h, time) {
    this.ctx.save();
    const bgScale = this.sliderBg || 1;
    let localTime = time * bgScale;
    
    this.ctx.globalAlpha = Math.min(1, bgScale);
    let grad;
    switch (this.backgroundStyle) {
      case 1: // Midnight Blue
        grad = this.ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#00001a');
        grad.addColorStop(1, '#000033');
        this.ctx.fillStyle = grad;
        break;
      case 2: // Cyberpunk Neon
        grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#2b00ff');
        grad.addColorStop(0.5, '#ff0055');
        grad.addColorStop(1, '#00ffcc');
        this.ctx.fillStyle = grad;
        break;
      case 3: // Sunset Glow
        grad = this.ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#ff4e50');
        grad.addColorStop(1, '#f9d423');
        this.ctx.fillStyle = grad;
        break;
      case 4: // Deep Space
        grad = this.ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
        grad.addColorStop(0, '#1a0033');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        break;
      case 5: // Emerald Green
        grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#004d00');
        grad.addColorStop(1, '#001a00');
        this.ctx.fillStyle = grad;
        break;
      case 6: // Ruby Red
        grad = this.ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/2);
        grad.addColorStop(0, '#4d0000');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        break;
      case 7: // Gold & Black
        grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#332200');
        grad.addColorStop(0.5, '#000000');
        grad.addColorStop(1, '#4d3300');
        this.ctx.fillStyle = grad;
        break;
      case 8: // Matrix Green
        this.ctx.fillStyle = '#001100';
        break;
      case 9: // Ocean Blue
        grad = this.ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#001133');
        grad.addColorStop(1, '#004466');
        this.ctx.fillStyle = grad;
        break;
      case 10: // Amethyst Purple
        grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1a0033');
        grad.addColorStop(1, '#330066');
        this.ctx.fillStyle = grad;
        break;
      case 11: // Crimson Fire
        grad = this.ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, '#660000');
        grad.addColorStop(1, '#1a0000');
        this.ctx.fillStyle = grad;
        break;
      case 12: // Ice Frost
        grad = this.ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.5);
        grad.addColorStop(0, '#00334d');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        break;
      case 13: // Retrowave Grid
        this.ctx.fillStyle = '#110022';
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        // Horizon line
        this.ctx.moveTo(0, h/2);
        this.ctx.lineTo(w, h/2);
        // Vertical perspective lines
        for(let i=0; i<=20; i++) {
          const x0 = w/2;
          const y0 = h/2;
          const x1 = w/2 + (i-10)*200;
          const y1 = h;
          this.ctx.moveTo(x0, y0);
          this.ctx.lineTo(x1, y1);
        }
        // Horizontal moving lines
        const offset = (localTime/10) % 50;
        for(let i=0; i<10; i++) {
          const y = h/2 + Math.pow(i*50 + offset, 1.2)/10;
          if (y < h) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
          }
        }
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.beginPath();
        this.ctx.arc(w/2, h/2, 150, Math.PI, 0);
        this.ctx.fill();
        this.ctx.restore();
        return; // Don't use standard fillRect
      case 14: // Dark Matter
        grad = this.ctx.createRadialGradient(w/2 + Math.sin(localTime/1000)*100, h/2 + Math.cos(localTime/1000)*100, 0, w/2, h/2, Math.max(w, h));
        grad.addColorStop(0, '#2b0033');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        break;
      case 15: // Blood Moon
        grad = this.ctx.createRadialGradient(w/2, h/2 - 200, 0, w/2, h/2, Math.max(w,h));
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(0.3, '#330000');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        break;
      default:
        this.ctx.fillStyle = '#000000';
    }

    if (this.backgroundStyle >= 16 && this.backgroundStyle <= 45) {
      // 30 Pro Festival Laser & Club BGs
      const seed = this.backgroundStyle;
      if (seed % 3 === 0) {
        // Strobe Lasers
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
        this.ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 5 + (seed%5); i++) {
           this.ctx.beginPath();
           this.ctx.moveTo(w/2, h);
           const angle = Math.sin(localTime/1000 + i + seed) * Math.PI;
           this.ctx.lineTo(w/2 + Math.cos(angle)*w, h - Math.abs(Math.sin(angle))*h*2);
           this.ctx.strokeStyle = `hsla(${(seed*20 + localTime/10)%360}, 100%, 50%, 0.5)`;
           this.ctx.lineWidth = 10 + (seed%10);
           this.ctx.stroke();
        }
        this.ctx.restore();
        return;
      } else if (seed % 3 === 1) {
        // LED Wall Matrix
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, w, h);
        const gridSize = 40 + (seed%10)*5;
        this.ctx.fillStyle = `hsla(${(seed*40 + localTime/20)%360}, 80%, 50%, 0.3)`;
        for(let x=0; x<w; x+=gridSize) {
          for(let y=0; y<h; y+=gridSize) {
            if (Math.sin(x*0.01 + y*0.01 + localTime/500) > 0.5) {
              this.ctx.fillRect(x+2, y+2, gridSize-4, gridSize-4);
            }
          }
        }
        this.ctx.restore();
        return;
      } else {
        // Smoke Machine Haze
        grad = this.ctx.createRadialGradient(w/2 + Math.sin(localTime/800)*200, h/2 + Math.cos(localTime/700)*200, 0, w/2, h/2, w);
        grad.addColorStop(0, `hsla(${(seed*15 + localTime/50)%360}, 70%, 20%, 0.8)`);
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
      }
    }
    
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.restore();
  }

  // --- 12 VIDEO EFFECT PRESETS (Particle System) ---
  drawVideoEffectPreset(w, h, time, bass, beat) {
    this.ctx.save();
    
    const effScale = this.sliderEffect || 1;
    
    // Manage particles
    if (this.particles.length > 200 * effScale) this.particles = this.particles.slice(0, 200 * effScale);
    
    // Add new particles based on effect
    if (Math.random() < (0.3 + bass) * effScale) {
      const p = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 5 + 1,
        life: 1.0,
        color: `hsl(${Math.random()*360}, 100%, 70%)`
      };
      
      switch (this.effectStyle) {
        case 1: // Sparkles
          p.vy = -Math.random() * 2 - 1;
          break;
        case 2: // Snow
          p.y = -10;
          p.vy = Math.random() * 2 + 1;
          p.vx = (Math.random() - 0.5) * 1;
          p.color = 'white';
          p.size = Math.random() * 3 + 1;
          break;
        case 3: // Smoke
          p.y = h + 20;
          p.vy = -Math.random() * 1 - 0.5;
          p.size = Math.random() * 40 + 20;
          p.color = `rgba(100,100,100,0.1)`;
          break;
        case 4: // Wind
          p.x = 0;
          p.vx = Math.random() * 10 + 5 + (bass * 20);
          p.vy = 0;
          p.size = 2;
          p.width = Math.random() * 100 + 50;
          p.color = 'rgba(255,255,255,0.3)';
          break;
        case 5: // Gentle Dust Motes
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = (Math.random() - 0.5) * 0.5;
          p.size = Math.random() * 3 + 1;
          p.color = `rgba(255,255,255,0.4)`;
          break;
        case 6: // Stars
          p.vx = 0; p.vy = 0;
          p.size = Math.random() * 2;
          p.color = 'white';
          p.life = Math.random() * 2;
          break;
        case 7: // Rain
          p.y = -20;
          p.vy = Math.random() * 15 + 10;
          p.vx = 2;
          p.size = 1;
          p.height = Math.random() * 30 + 10;
          p.color = 'rgba(150, 200, 255, 0.6)';
          break;
        case 8: // Fireflies
          p.color = 'rgba(255, 255, 100, 0.8)';
          p.size = Math.random() * 3 + 1;
          break;
        case 9: // Bubbles
          p.y = h + 20;
          p.vy = -Math.random() * 3 - 1;
          p.size = Math.random() * 15 + 5;
          p.color = 'rgba(255,255,255,0.2)';
          break;
        case 10: // Cinematic Glow
          if (beat > 0.3) {
            p.x = w/2 + (Math.random() - 0.5) * 400;
            p.y = h/2 + (Math.random() - 0.5) * 400;
            p.size = Math.random() * 200 + 100;
            p.vx = 0; p.vy = 0;
            p.life = 0.8;
            p.color = `hsla(${time/50 % 360}, 80%, 60%, 0.15)`;
          } else {
            p.life = 0;
          }
          break;
        case 11: // Bokeh Blur
          p.vx = (Math.random() - 0.5) * 1;
          p.vy = -Math.random() * 2;
          p.size = Math.random() * 40 + 20;
          p.color = `hsla(${Math.random()*360}, 70%, 60%, 0.3)`;
          break;
        case 12: // Slow Drifting Orbs
          p.vx = Math.random() * 2 - 1;
          p.vy = Math.random() * 2 - 1;
          p.size = Math.random() * 15 + 5;
          p.color = `hsla(210, 80%, 80%, 0.4)`;
          break;
        case 13: // Falling Petals
          p.y = -20;
          p.vy = Math.random() * 2 + 1;
          p.vx = Math.random() * 3 + 1; // drifting right
          p.size = Math.random() * 10 + 5;
          p.color = '#ffb7c5'; // sakura pink
          p.angle = Math.random() * Math.PI * 2;
          p.spin = Math.random() * 0.1 - 0.05;
          break;
        case 15: // Hyperdrive
          p.x = w/2;
          p.y = h/2;
          p.angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10 + 5 + (bass * 20);
          p.vx = Math.cos(p.angle) * speed;
          p.vy = Math.sin(p.angle) * speed;
          p.size = 2;
          p.color = 'white';
          break;
        case 46: // Fire Particles
          p.x = Math.random() * w;
          p.y = h + 20;
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = -Math.random() * 5 - 2;
          p.size = Math.random() * 10 + 5;
          p.color = `rgba(255, ${Math.random()*150 + 50}, 0, 0.8)`;
          break;
        case 47: // Raging Fire
          p.x = w/2 + (Math.random() - 0.5) * (w * 0.8);
          p.y = h + 50;
          p.vx = (Math.random() - 0.5) * 5;
          p.vy = -Math.random() * 10 - 5;
          p.size = Math.random() * 30 + 10;
          p.color = `rgba(255, ${Math.random()*100}, 0, 0.6)`;
          break;
        case 48: // Fire Ring
          const angle = Math.random() * Math.PI * 2;
          const radius = (Math.min(w, h) / 3) + (Math.random() * 20) + (bass * 50);
          p.x = w/2 + Math.cos(angle) * radius;
          p.y = h/2 + Math.sin(angle) * radius;
          p.vx = Math.cos(angle) * 2 + (Math.random()-0.5);
          p.vy = Math.sin(angle) * 2 + (Math.random()-0.5);
          p.size = Math.random() * 15 + 5;
          p.color = `rgba(255, ${Math.random()*200}, 50, 0.7)`;
          break;
      }
      if (p.life > 0) this.particles.push(p);
    }
    
    // Update and Draw
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      switch (this.effectStyle) {
        case 1: // Sparkles
        case 2: // Snow
        case 8: // Fireflies
          if (this.effectStyle === 8) {
            p.vx += (Math.random() - 0.5) * 0.5; // Firefly erratic
            p.vy += (Math.random() - 0.5) * 0.5;
          }
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.life;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          p.life -= 0.005;
          break;
        case 3: // Smoke
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          p.size += 0.5;
          p.life -= 0.002;
          break;
        case 4: // Wind
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(p.x, p.y, p.width, p.size);
          if (p.x > w) p.life = 0;
          break;
        case 5: // Sports / Bokeh
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size + (bass*50), 0, Math.PI*2);
          this.ctx.fill();
          p.life -= 0.01;
          break;
        case 6: // Stars
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.abs(Math.sin(time/200 + p.x));
          this.ctx.fillRect(p.x, p.y, p.size, p.size);
          p.life -= 0.001;
          break;
        case 7: // Rain
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = p.size;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x - p.vx*2, p.y - p.height);
          this.ctx.stroke();
          if (p.y > h) p.life = 0;
          break;
        case 9: // Bubbles
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(p.x + Math.sin(time/200 + p.y)*10, p.y, p.size, 0, Math.PI*2);
          this.ctx.stroke();
          p.life -= 0.005;
          break;
        case 10: // Soft Light Leaks
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          break;
        case 11: // Cinematic Glow
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          p.life -= 0.005;
          break;
        case 12: // Bokeh Blur
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          if (p.y < -100) p.life = 0;
          break;
        case 13: // Slow Drifting Orbs
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          break;
        case 14: // Falling Petals
          p.angle += p.spin;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.angle);
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI*2);
          this.ctx.fill();
          this.ctx.restore();
          if (p.y > h) p.life = 0;
          break;
        case 15: // Hyperdrive
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x - p.vx*2, p.y - p.vy*2);
          this.ctx.stroke();
          if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) p.life = 0;
          break;
        case 46:
        case 47:
        case 48:
          this.ctx.fillStyle = p.color;
          this.ctx.globalCompositeOperation = 'screen';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          this.ctx.fill();
          this.ctx.globalCompositeOperation = 'source-over';
          p.size *= 0.95; // Shrink as it rises
          p.life -= 0.02;
          break;
      }
      
      if (p.life <= 0 || p.y < -100 || p.y > h + 100 || p.x > w + 100 || p.x < -100) {
        this.particles.splice(i, 1);
      }
    }
    
    if (this.effectStyle >= 16 && this.effectStyle <= 45) {
      // 30 Pro DJ Video Filters & Deck FX
      const seed = this.effectStyle;
      
      if (seed % 4 === 0) {
        // High-Pass Filter Color Shift
        this.ctx.fillStyle = `hsla(${(seed*30 + time/10)%360}, 100%, 50%, 0.1)`;
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillRect(0, 0, w, h);
      } else if (seed % 4 === 1) {
        // Vinyl Scratch Jitter
        if (beat > 0.5) {
          const shiftX = (Math.random() - 0.5) * 50 * bass;
          const shiftY = (Math.random() - 0.5) * 50 * bass;
          this.ctx.translate(shiftX, shiftY);
          // Chromatic aberration fake
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
          this.ctx.globalCompositeOperation = 'screen';
          this.ctx.fillRect(-shiftX*2, -shiftY*2, w, h);
        }
      } else if (seed % 4 === 2) {
        // VHS Scanlines & Glitch
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for(let y=0; y<h; y+=4) {
          if (y % 8 === 0) this.ctx.fillRect(0, y + (time/20)%8, w, 2);
        }
        if (Math.random() < 0.1 * bass) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
          this.ctx.fillRect(0, Math.random()*h, w, Math.random()*100);
        }
      } else {
        // Flanger Distortion / Vignette
        const grad = this.ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(0,0,0,${0.5 + bass*0.5})`);
        this.ctx.fillStyle = grad;
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillRect(0, 0, w, h);
      }
    }
    
    if (this.effectStyle >= 49 && this.effectStyle <= 75) {
      // Capcut Neon Edge Flow, Solid Edge, and Solid Flowing Edge
      this.ctx.save();
      const speed = this.sliderEffect || 1;
      const flowOffset = -(time / 5) * speed;
      
      let colorIndex = this.effectStyle;
      if (this.effectStyle >= 67) colorIndex = this.effectStyle - 18;
      else if (this.effectStyle >= 58) colorIndex = this.effectStyle - 9;
      
      let neonColor = '#FFD700';
      if (colorIndex === 49) neonColor = '#FFD700'; // Gold
      else if (colorIndex === 50) neonColor = '#FF2222'; // Red
      else if (colorIndex === 51) neonColor = '#FFFFFF'; // White
      else if (colorIndex === 52) neonColor = '#00CCFF'; // Blue
      else if (colorIndex === 53) neonColor = '#FF00FF'; // Pink
      else if (colorIndex === 54) neonColor = '#00FF00'; // Green
      else if (colorIndex === 55) neonColor = '#111111'; // Black
      else if (colorIndex === 56) neonColor = '#A89F91'; // Moth (Warm dusty grey)
      else if (colorIndex === 57) neonColor = `hsl(${(time/20)%360}, 100%, 60%)`; // Multi
      
      const lineWidth = 15 + bass * 10;
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = neonColor;
      
      if (this.effectStyle >= 67) {
        // Solid Flowing Edge (using rotating Conic Gradient to simulate flow in a completely connected line)
        if (this.ctx.createConicGradient) {
           const angle = (time / 500) * speed;
           const grad = this.ctx.createConicGradient(angle, w/2, h/2);
           
           // Make a glowing flowing head
           if (colorIndex === 57) {
             grad.addColorStop(0, `hsla(${(time/20)%360}, 100%, 40%, 0.4)`);
             grad.addColorStop(0.7, `hsla(${(time/20)%360}, 100%, 40%, 0.4)`);
             grad.addColorStop(0.9, `hsla(${(time/20)%360}, 100%, 60%, 1)`);
             grad.addColorStop(0.98, '#ffffff'); // bright head
             grad.addColorStop(1, `hsla(${(time/20)%360}, 100%, 40%, 0.4)`);
           } else {
             // Parse hex to rgba
             let r = 255, g = 255, b = 255;
             if (neonColor.startsWith('#') && neonColor.length === 7) {
               r = parseInt(neonColor.slice(1,3), 16);
               g = parseInt(neonColor.slice(3,5), 16);
               b = parseInt(neonColor.slice(5,7), 16);
             }
             const dimColor = `rgba(${r},${g},${b},0.3)`;
             grad.addColorStop(0, dimColor);
             grad.addColorStop(0.7, dimColor);
             grad.addColorStop(0.9, neonColor);
             grad.addColorStop(0.98, '#ffffff');
             grad.addColorStop(1, dimColor);
           }
           this.ctx.strokeStyle = grad;
        }
      }
      
      // Black neon flow needs a white shadow to be visible on black backgrounds, otherwise use neon color
      if (colorIndex === 55) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(255,255,255,0.3)';
      } else {
        this.ctx.shadowBlur = 20 + bass * 20;
        this.ctx.shadowColor = neonColor;
      }
      
      if (this.effectStyle <= 57) {
        // Line dash for "flow" effect. Two segments chasing each other
        const perimeter = (w + h) * 2;
        const dashLength = perimeter * 0.15; // 15% glowing segment
        const gapLength = perimeter * 0.35;  // 35% gap
        // Total is 0.5, so 2 segments complete the perimeter
        this.ctx.setLineDash([dashLength, gapLength]);
        this.ctx.lineDashOffset = flowOffset;
      }
      
      this.ctx.globalCompositeOperation = 'screen';
      if (colorIndex === 55) this.ctx.globalCompositeOperation = 'source-over'; // Black shouldn't use screen blend
      
      this.ctx.strokeRect(lineWidth/2, lineWidth/2, w - lineWidth, h - lineWidth);
      
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }
}
