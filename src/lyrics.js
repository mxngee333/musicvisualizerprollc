export class LyricsManager {
  constructor() {
    this.lyrics = [];
    this.currentLineIndex = -1;
  }

  parseLRC(lrcText) {
    this.lyrics = [];
    this.rawLrcText = lrcText; // Store for digital output
    const lines = lrcText.split('\n');
    
    // Extremely robust regex for timestamps: [mm:ss], [mm:ss.xx], [mm:ss:xx], [m:s], [mm:ss.x]
    const timeRegex = /\[(\d{1,3})[:.](\d{2})(?:[.:](\d{1,3}))?\]/;
    const syncOffset = 0; // No offset, trust the AI timestamps perfectly

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = match[3] ? parseInt(match[3].substring(0, 3).padEnd(3, '0'), 10) / 1000 : 0;
        
        let time = minutes * 60 + seconds + milliseconds + syncOffset;
        if (time < 0) time = 0; // Prevent negative times
        
        const text = line.replace(timeRegex, '').trim();
        
        if (text && !text.includes('```')) {
          this.lyrics.push({ time, text });
        }
      }
    }
    
    this.lyrics.sort((a, b) => a.time - b.time);
  }

  update(currentTime) {
    if (this.lyrics.length === 0) return;

    let activeIndex = -1;
    for (let i = 0; i < this.lyrics.length; i++) {
      if (currentTime >= this.lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    this.currentLineIndex = activeIndex;
    this.currentTime = currentTime; // Store for activeTime calculation
  }

  getCurrentLyric() {
    if (this.currentLineIndex >= 0 && this.currentLineIndex < this.lyrics.length) {
      return this.lyrics[this.currentLineIndex].text;
    }
    return "";
  }

  getCurrentLyricData() {
    if (this.currentLineIndex >= 0 && this.currentLineIndex < this.lyrics.length) {
      const current = this.lyrics[this.currentLineIndex];
      const next = this.lyrics[this.currentLineIndex + 1];
      const duration = next ? (next.time - current.time) * 1000 : 3000;
      const activeTime = (this.currentTime - current.time) * 1000;
      return { text: current.text, duration, activeTime };
    }
    return null;
  }

  loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.parseLRC(e.target.result);
    };
    reader.readAsText(file);
  }
}
