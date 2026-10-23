export class AudioEngine {
  constructor(audioElement) {
    this.audioElement = audioElement;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.isInitialized = false;
    this.isPlaying = false;
    
    // Beat detection state
    this.beatThreshold = 1.5;
    this.beatDecayRate = 0.98;
    this.framesSinceLastBeat = 0;
    this.beatCooldown = 20;
  }

  init() {
    if (this.isInitialized) return;
    
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    
    // Create analyser
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.85;
    
    // Connect source to analyser and then to destination
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    // Setup data array for frequency data
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    this.isInitialized = true;
    this.isPlaying = true;
  }

  getFrequencyData() {
    if (!this.analyser || !this.isPlaying) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getBass() {
    if (!this.dataArray) return 0;
    let sum = 0;
    // Lower frequencies (0-10 bins depending on sample rate)
    for (let i = 0; i < 10; i++) sum += this.dataArray[i];
    return (sum / 10) / 255;
  }

  getMid() {
    if (!this.dataArray) return 0;
    let sum = 0;
    // Mid frequencies (approx 10-100 bins)
    for (let i = 10; i < 100; i++) sum += this.dataArray[i];
    return (sum / 90) / 255;
  }

  getTreble() {
    if (!this.dataArray) return 0;
    let sum = 0;
    // High frequencies (100-300 bins)
    for (let i = 100; i < 300; i++) sum += this.dataArray[i];
    return (sum / 200) / 255;
  }

  checkBeat() {
    const bass = this.getBass();
    let isBeat = false;
    
    if (bass > this.beatThreshold && this.framesSinceLastBeat > this.beatCooldown) {
      isBeat = true;
      this.beatThreshold = bass * 1.2; // Increase threshold for next beat
      this.framesSinceLastBeat = 0;
    } else {
      this.beatThreshold *= this.beatDecayRate;
      this.beatThreshold = Math.max(this.beatThreshold, 0.4); // Minimum threshold
      this.framesSinceLastBeat++;
    }
    
    return isBeat;
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  loadAudio(file) {
    const url = URL.createObjectURL(file);
    this.audioElement.src = url;
    this.audioElement.load();
    // Play automatically after loading
    this.audioElement.play().catch(e => console.warn("Auto-play prevented", e));
  }
}
