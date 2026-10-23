import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export class OfflineExporter {
  constructor(audioFile, visualizer, threeManager, progressBar, statusText, outFileName) {
    this.audioFile = audioFile;
    this.outFileName = outFileName || 'music-visualizer-export.mp4';
    this.visualizer = visualizer;
    this.threeManager = threeManager;
    this.progressBar = progressBar;
    this.statusText = statusText;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    this.fps = this.isMobile ? 30 : 60;
    
    // Scale down resolution for mobile to prevent RAM Out-Of-Memory crashes
    let w = this.visualizer.canvas.width;
    let h = this.visualizer.canvas.height;
    if (this.isMobile) {
      const ratio = w / h;
      if (w > h) { w = 1280; h = Math.round(1280 / ratio); }
      else { h = 1280; w = Math.round(1280 * ratio); }
    }
    
    // Ensure dimensions are even numbers (required by AVC encoder)
    this.width = Math.floor(w / 2) * 2;
    this.height = Math.floor(h / 2) * 2;
  }

  // FIX: drain encode queue without blocking the event loop (replaces tight while-loop)
  _drainQueue(encoder, max = 4) {
    return new Promise(resolve => {
      const check = () => {
        if (encoder.encodeQueueSize <= max || encoder.state !== 'configured') resolve();
        else setTimeout(check, 5);
      };
      check();
    });
  }

  // FIX: VideoFrame with createImageBitmap fallback for older Android WebViews
  async _makeVideoFrame(canvas, timestampUs) {
    try {
      return new VideoFrame(canvas, { timestamp: timestampUs, alpha: 'discard' });
    } catch (_) {
      const bitmap = await createImageBitmap(canvas);
      const frame = new VideoFrame(bitmap, { timestamp: timestampUs, alpha: 'discard' });
      bitmap.close();
      return frame;
    }
  }

  async exportVideo() {
    window.isExporting = true;
    this.updateProgress(0, 'Initializing offline render...');
    
    // Request Screen Wake Lock to prevent phone from going to sleep
    let wakeLock = null;
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock is active');
      }
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
    
    try {
      // 1. Decode Audio
      this.updateProgress(0, 'Decoding audio...');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await this.audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const duration = audioBuffer.duration;
      const totalFrames = Math.floor(duration * this.fps);
      
      // 2. Setup OfflineAudioContext for extracting frequency data frame-by-frame
      this.updateProgress(2, 'Preparing audio processing...');
      const offlineCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      
      const analyser = offlineCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyser.connect(offlineCtx.destination);
      source.start(0);

      // 3. Setup MP4 Muxer & Video/Audio Encoders
      this.updateProgress(4, 'Setting up Encoders...');
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: { codec: 'avc', width: this.width, height: this.height },
        audio: { codec: 'aac', sampleRate: audioBuffer.sampleRate, numberOfChannels: audioBuffer.numberOfChannels },
        fastStart: false
      });

      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: e => { console.error(e); this.updateProgress(0, 'Video Encoder Error: ' + e.message); }
      });
      
      videoEncoder.configure({
        codec: 'avc1.640028',
        width: this.width,
        height: this.height,
        bitrate: this.isMobile ? 2_000_000 : 6_000_000, // Drastically reduce bitrate on mobile to save RAM
        framerate: this.fps,
        hardwareAcceleration: 'prefer-hardware'
      });
      
      const audioEncoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: e => { console.error(e); this.updateProgress(0, 'Audio Encoder Error: ' + e.message); }
      });
      
      audioEncoder.configure({
        codec: 'mp4a.40.2',
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        bitrate: 128000
      });

      // 4. Setup OffscreenCanvas
      const offscreenCanvas = new OffscreenCanvas(this.width, this.height);
      
      // Monkey patch visualizer temporarily to use offscreen canvas
      const oldCanvas = this.visualizer.canvas;
      const oldCtx = this.visualizer.ctx;
      this.visualizer.canvas = offscreenCanvas;
      this.visualizer.ctx = offscreenCanvas.getContext('2d', { alpha: false });
      const originalGetFrequencyData = this.visualizer.audioEngine.getFrequencyData.bind(this.visualizer.audioEngine);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // 5. Render Loop (Offline)
      this.updateProgress(5, 'Rendering video frames (0%)...');
      
      let currentFrame = 0;
      const blockTime = 128 / offlineCtx.sampleRate;
      
      // Schedule the first suspend
      let nextSuspendTime = Math.ceil((0.0001) / blockTime) * blockTime;
      let suspendPromise = offlineCtx.suspend(nextSuspendTime);
      
      // Start the offline context rendering
      offlineCtx.startRendering();
      
      // Fast zero-delay yielder to bypass iOS setTimeout throttling
      const zeroDelayYield = () => new Promise(resolve => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => resolve();
        channel.port2.postMessage(null);
      });

      // Fewer frames per chunk on mobile so the event loop breathes more often
      const CHUNK_SIZE = this.isMobile ? 30 : 120;

      // Render in chunks to avoid blocking main thread completely
      const renderChunk = async () => {
        try {
          const endFrame = Math.min(currentFrame + CHUNK_SIZE, totalFrames);
          
          for (; currentFrame < endFrame; currentFrame++) {
            const timeSec = currentFrame / this.fps;
            const timeMs = timeSec * 1000;
            
            if (timeSec < duration) {
              try {
                await suspendPromise;
                analyser.getByteFrequencyData(dataArray);
                
                // FIX: guard prevents deadlock when nextSuspendTime >= duration
                const nextTimeSec = (currentFrame + 1) / this.fps;
                const candidate = Math.ceil((nextTimeSec + 0.0001) / blockTime) * blockTime;
                if (candidate < duration - blockTime) {
                  suspendPromise = offlineCtx.suspend(candidate);
                } else {
                  // Let the offline context finish on its own; resolve immediately
                  suspendPromise = Promise.resolve();
                }
                offlineCtx.resume();
              } catch(e) {
                console.warn("OfflineAudioContext suspend error", e);
                analyser.getByteFrequencyData(dataArray);
              }
            } else {
              dataArray.fill(0);
            }

            // Force update engine data
            this.visualizer.audioEngine.getFrequencyData = () => dataArray;
            
            // Force update lyrics and slideshow time
            if (this.visualizer.lyricsManager) {
              this.visualizer.lyricsManager.update(timeSec);
            }
            if (this.visualizer.slideshowManager) this.visualizer.slideshowManager.update(timeMs);
            
            // Draw Visualizer Frame
            this.visualizer.drawFrame(timeMs);
            
            // (ThreeJS frame is now synchronously updated and composited inside visualizer.drawFrame)
            
            // FIX: Use _makeVideoFrame which falls back to createImageBitmap on old Androids
            const frame = await this._makeVideoFrame(offscreenCanvas, timeMs * 1000);
            videoEncoder.encode(frame, { keyFrame: currentFrame % 60 === 0 });
            frame.close();

            // Yield to keep the main thread breathing
            if (currentFrame % 10 === 0) {
              await zeroDelayYield();
            }
            
            // FIX: Back-pressure via setTimeout polling instead of a blocking while-loop
            if (videoEncoder.encodeQueueSize > 4) {
              await this._drainQueue(videoEncoder, 4);
            }
          }
          
          // Yield to UI to update the progress bar physically on screen
          await new Promise(r => requestAnimationFrame(r));
          const overallPct = 5 + (currentFrame/totalFrames)*80;
          this.updateProgress(overallPct, `Rendering Video...`);
          
          if (currentFrame < totalFrames) {
            // Schedule next chunk immediately using zeroDelay instead of setTimeout to maintain top speed
            await zeroDelayYield();
            renderChunk();
          } else {
            finishExport();
          }
        } catch (err) {
          console.error("Export Error:", err);
          this.updateProgress(0, 'Export Failed: ' + err.message);
          this.visualizer.canvas = oldCanvas;
          this.visualizer.ctx = oldCtx;
          this.visualizer.audioEngine.getFrequencyData = originalGetFrequencyData;
          window.isExporting = false;
          this.removeOverlay();
        }
      };
      
      const finishExport = async () => {
        this.updateProgress(85, 'Encoding Audio Track...');
        
        // Encode the entire AudioBuffer
        const channelData = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
          channelData.push(audioBuffer.getChannelData(i));
        }
        
        const chunkSize = audioBuffer.sampleRate; // 1 second chunks
        const format = 'f32-planar';
        for (let offset = 0; offset < audioBuffer.length; offset += chunkSize) {
          const frames = Math.min(chunkSize, audioBuffer.length - offset);
          const data = new Float32Array(frames * audioBuffer.numberOfChannels);
          for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
            data.set(channelData[c].subarray(offset, offset + frames), c * frames);
          }
          const audioData = new AudioData({
            format,
            sampleRate: audioBuffer.sampleRate,
            numberOfFrames: frames,
            numberOfChannels: audioBuffer.numberOfChannels,
            timestamp: (offset / audioBuffer.sampleRate) * 1_000_000, // microseconds
            data
          });
          audioEncoder.encode(audioData);
          audioData.close();
          
          // FIX: Back-pressure for audio encoder - no tight while-loop
          if (audioEncoder.encodeQueueSize > 4) {
            await this._drainQueue(audioEncoder, 4);
          }
          
          // Yield to prevent UI freeze during audio encoding
          if (offset % (chunkSize * 10) === 0) {
             const overallAudioPct = 85 + (offset / audioBuffer.length) * 10;
             this.updateProgress(overallAudioPct, `Encoding Audio Track...`);
             await new Promise(r => setTimeout(r, 1));
          }
        }
        
        this.updateProgress(96, 'Flushing Encoders...');
        // Give the UI two animation frames to render "96%" before CPU locks up
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => requestAnimationFrame(r));
        
        // Add a safety timeout to flush to prevent indefinite hangs on iOS
        const safeFlush = async (encoder) => {
          if (encoder.state !== 'configured') return;
          try {
            await Promise.race([
              encoder.flush(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Flush Timeout')), 15000))
            ]);
          } catch (e) {
            console.warn("Encoder flush bypassed:", e);
          }
        };
        
        await safeFlush(audioEncoder);
        await safeFlush(videoEncoder);
        
        this.updateProgress(98, 'Packaging MP4...');
        // Yield so "98%" renders before finalize
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => requestAnimationFrame(r));
        
        try {
          muxer.finalize();
          
          const { buffer } = muxer.target;
          
          // Use zero-copy Uint8Array views to chunk the buffer.
          const chunks = [];
          const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
          for (let i = 0; i < buffer.byteLength; i += CHUNK_SIZE) {
            const length = Math.min(CHUNK_SIZE, buffer.byteLength - i);
            chunks.push(new Uint8Array(buffer, i, length));
          }
          
          const blob = new Blob(chunks, { type: 'video/mp4' });
          
          const finalizeAndCleanup = async () => {
            this.visualizer.canvas = oldCanvas;
            this.visualizer.ctx = oldCtx;
            this.visualizer.audioEngine.getFrequencyData = originalGetFrequencyData;
            window.isExporting = false;
            this.removeOverlay();
            if (wakeLock) await wakeLock.release();
            const audioEl = document.getElementById('audio-player');
            if (audioEl) audioEl.pause();
          };

          // FIX: ALWAYS trigger browser download first — works on all platforms
          this.updateProgress(100, 'Done! Saving to Downloads...');
          this.downloadBlob(blob, this.outFileName);
          await finalizeAndCleanup();

          // FIX: On mobile, ALSO offer a secondary gallery/share button (non-blocking)
          if (this.isMobile && navigator.canShare) {
            const file = new File([blob], this.outFileName, { type: 'video/mp4' });
            if (navigator.canShare({ files: [file] })) {
              // Show share button after download is already triggered
              this.overlay = document.createElement('div');
              this.overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.88);z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;font-family:Inter,sans-serif;backdrop-filter:blur(12px);padding:20px;box-sizing:border-box;gap:20px;';
              this.overlay.innerHTML = `
                <div style="font-size:2rem;font-weight:800;background:linear-gradient(45deg,#00ccff,#00ff88);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">
                  ✅ Download Started!
                </div>
                <button id="share-gallery-btn" style="padding:18px 36px;font-size:1.3rem;border-radius:14px;background:linear-gradient(45deg,#00ccff,#0066ff);color:white;border:none;font-weight:800;cursor:pointer;box-shadow:0 8px 30px rgba(0,204,255,0.45);">
                  📲 Also Save to Gallery / Share
                </button>
                <p style="font-size:0.85rem;color:#888;margin:0;text-align:center;">
                  File is downloading to your Downloads folder.
                </p>
                <button id="close-export-overlay" style="background:transparent;border:1px solid #444;color:#888;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:0.9rem;margin-top:10px;">Close</button>`;
              document.body.appendChild(this.overlay);
              document.getElementById('close-export-overlay').addEventListener('click', () => this.removeOverlay());
              document.getElementById('share-gallery-btn').addEventListener('click', async () => {
                try { await navigator.share({ files: [file], title: 'Music Visualizer Pro' }); }
                catch (err) { console.warn('Share dismissed:', err.message); }
              });
              setTimeout(() => this.removeOverlay(), 20_000);
              return; // leave overlay open for user to interact
            }
          }

        } catch (muxErr) {
          throw new Error("Packaging Failed: " + muxErr.message);
        }
      };

      // Start chunked encoding
      renderChunk();

    } catch (e) {
      console.error(e);
      this.statusText.textContent = 'Export failed: ' + e.message;
      this.removeOverlay();
      if (wakeLock) wakeLock.release().catch(console.error);
    }
  }

  updateProgress(percent, text, giantPct = null) {
    if (this.progressBar) {
      this.progressBar.style.width = percent + "%";
    }
    if (this.statusText) {
      this.statusText.textContent = text;
    }
    
    // Create or update giant overlay
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.85); z-index: 9999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; font-family: 'Inter', sans-serif; backdrop-filter: blur(10px);
      `;
      
      this.giantText = document.createElement('h1');
      this.giantText.style.cssText = 'font-size: 8rem; margin: 0; font-weight: 800; background: linear-gradient(45deg, #00ccff, #0066ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 40px rgba(0,204,255,0.5);';
      
      this.statusDesc = document.createElement('p');
      this.statusDesc.style.cssText = 'font-size: 1.5rem; margin-top: 20px; color: #ccc; font-weight: 600; letter-spacing: 2px;';
      
      this.overlay.appendChild(this.giantText);
      this.overlay.appendChild(this.statusDesc);
      document.body.appendChild(this.overlay);
    }
    
    this.statusDesc.textContent = text.toUpperCase();
    if (giantPct !== null) {
      this.giantText.textContent = giantPct + "%";
    } else {
      this.giantText.textContent = Math.round(percent) + "%";
    }
  }

  removeOverlay() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000); // Wait 10s on iOS before revoking
    }, 100);
  }
}
