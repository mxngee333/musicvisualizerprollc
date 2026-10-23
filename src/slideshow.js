export class SlideshowManager {
  constructor() {
    this.images = []; // Array of media (img or video)
    this.currentIndex = 0;
    this.nextIndex = 0;
    this.fadeProgress = 0; // 0 to 1
    this.isFading = false;
    this.transitionTime = 800; // ms
    this.lastTime = 0;
    this.intervalId = null;
    this.displayTime = 5000;
  }

  stopAllMedia() {
    if (!this.images) return;
    this.images.forEach(media => {
      if (media.src) URL.revokeObjectURL(media.src); // Prevent memory leak!
      if (media instanceof HTMLVideoElement) {
        media.pause();
        media.removeAttribute('src');
        media.load();
      }
    });
  }

  updateVideoPlayback() {
    if (!this.images || this.images.length === 0) return;
    this.images.forEach((media, index) => {
      if (media instanceof HTMLVideoElement) {
        // Pre-warm the next video by always keeping it playing alongside the current one
        const isActive = (index === this.currentIndex) || (index === this.nextIndex);
        if (isActive) {
          if (media.paused) {
            const playPromise = media.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => console.log("Video auto-play prevented:", e));
            }
          }
        } else {
          if (!media.paused) media.pause();
        }
      }
    });
  }

  async loadImages(files) {
    this.stop();
    this.stopAllMedia();
    this.images = [];
    this.currentIndex = 0;
    this.nextIndex = 0;
    this.fadeProgress = 0;
    this.isFading = false;

    try {
      const loadPromises = Array.from(files).map((file) => {
        return new Promise((resolve) => {
          const url = URL.createObjectURL(file);
          
          if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            // Removed autoplay; updateVideoPlayback will manage it
            video.onloadeddata = () => {
              resolve(video);
            };
            video.onerror = () => {
              console.error("Failed to load video", file.name);
              resolve(null);
            };
            video.src = url;
            video.load();
          } else {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
              console.error("Failed to load image", file.name);
              resolve(null);
            };
            img.src = url;
          }
        });
      });

      const results = await Promise.all(loadPromises);
      this.images = results.filter(img => img !== null);

      if (this.images.length > 0) {
        this.start();
      } else if (files.length > 0) {
        alert("Failed to load the uploaded image(s). Please make sure you are uploading standard image formats like JPG, PNG, or WEBP. (Note: HEIC from iPhones are not supported by web browsers.)");
      }
    } catch (err) {
      console.error("Critical error loading images:", err);
      alert("A critical error occurred while loading the image. It might be too large or corrupted.");
    }
  }

  start() {
    this.isFading = false;
    this.fadeProgress = 0;
    this.lastTime = 0;
    this.timeSinceLastSlide = 0;
    this.currentIndex = 0;
    this.nextIndex = this.images.length > 1 ? 1 : 0;
    this.updateVideoPlayback();
  }

  stop() {
    // No-op
  }

  triggerFade() {
    if (this.images.length < 2) return;
    this.isFading = true;
    this.fadeProgress = 0;
  }

  update(currentTime) {
    if (this.images.length < 2) return;
    
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return;
    }
    
    let delta = currentTime - this.lastTime;
    
    // Detect if time jumped backwards (e.g. offline export started from 0)
    if (delta < 0) {
      this.lastTime = currentTime;
      this.isFading = false;
      this.fadeProgress = 0;
      this.timeSinceLastSlide = 0;
      delta = 0;
      this.updateVideoPlayback();
    }
    
    this.lastTime = currentTime;

    if (!this.isFading) {
      // We are showing a slide, count up to displayTime
      if (this.timeSinceLastSlide === undefined) this.timeSinceLastSlide = 0;
      
      this.timeSinceLastSlide += delta;
      
      if (this.timeSinceLastSlide >= this.displayTime) {
        this.triggerFade();
        this.timeSinceLastSlide = 0;
      }
    } else {
      // We are crossfading
      this.fadeProgress += delta / this.transitionTime;

      if (this.fadeProgress >= 1) {
        this.fadeProgress = 0;
        this.isFading = false;
        
        // Advance slides
        this.currentIndex = this.nextIndex;
        this.nextIndex = (this.currentIndex + 1) % this.images.length;
        
        // Update which videos are playing to pre-warm the NEW next slide
        this.updateVideoPlayback();
      }
    }
  }

  // Returns data for rendering
  getRenderData() {
    if (this.images.length === 0) return null;
    return {
      currentImage: this.images[this.currentIndex],
      nextImage: this.isFading ? this.images[this.nextIndex] : null,
      fadeProgress: this.fadeProgress,
      timeSinceLastSlide: this.timeSinceLastSlide || 0,
    };
  }
}
