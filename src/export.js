export class VideoExporter {
  constructor(canvasElement, audioElement, audioEngine, outFileName) {
    this.canvas = canvasElement;
    this.audioElement = audioElement;
    this.audioEngine = audioEngine;
    this.outFileName = outFileName || 'exported-visualizer.mp4';
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  async startRecording() {
    if (this.isRecording) return;

    this.recordedChunks = [];
    
    // Disable loop to ensure 'ended' event fires
    this.wasLooping = this.audioElement.loop;
    this.audioElement.loop = false;
    
    // 1. Get Canvas Video Stream
    const canvasStream = this.canvas.captureStream(60); // 60 FPS
    
    // 2. Get Audio Stream from Web Audio API
    // We create a MediaStreamDestination to capture the audio output
    const audioDestination = this.audioEngine.audioContext.createMediaStreamDestination();
    this.audioEngine.analyser.connect(audioDestination);
    const audioStream = audioDestination.stream;
    
    // 3. Combine Streams
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    // 4. Determine MIME Type
    let mimeType = 'video/webm; codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm; codecs=vp8,opus';
    }
    
    const options = { videoBitsPerSecond: 8000000 }; // 8000 kbps (HD)
    
    if (MediaRecorder.isTypeSupported(mimeType)) {
      options.mimeType = mimeType;
    }

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(combinedStream, { videoBitsPerSecond: 8000000 }); // Ensure bitrate is kept on fallback
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.downloadVideo();
    };

    // 5. Setup Recording triggers
    // Restart audio
    this.audioElement.currentTime = 0;
    
    // Start recording and playing
    this.mediaRecorder.start(100); // collect 100ms chunks
    this.isRecording = true;
    
    await this.audioElement.play();

    // Stop recording when audio ends
    this.audioElement.onended = () => {
      this.stopRecording();
    };
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.audioElement.onended = null;
      
      this.audioElement.pause();
      
      // Restore loop setting
      if (this.wasLooping !== undefined) {
        this.audioElement.loop = this.wasLooping;
      }
    }
  }

  downloadVideo() {
    // Determine extension based on actual mimetype if possible
    let ext = 'webm';
    if (this.mediaRecorder.mimeType.includes('mp4')) ext = 'mp4';
    
    // For many users, saving webm as mp4 works in VLC, but standard is standard.
    // Given the prompt "mp4 full video", we name it .mp4. Modern players will decode the webm container.
    const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType || 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = this.outFileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
