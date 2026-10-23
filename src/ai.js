let aiWorker = null;

export async function generateLyricsFromAudio(audioFile, progressCallback = null) {
  // 1. Initialize Worker if not already done
  if (!aiWorker) {
    aiWorker = new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
  }

  // 2. Decode the audio file
  if (progressCallback) progressCallback('Reading audio file...');
  
  const arrayBuffer = await audioFile.arrayBuffer();
  
  // Transformers.js expects 16kHz audio
  if (progressCallback) progressCallback('Decoding audio (16kHz)...');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Get the raw float32 array from the first channel
  const float32Audio = audioBuffer.getChannelData(0);

  // 3. Send to worker and wait for result
  return new Promise((resolve, reject) => {
    // Handle messages from the worker
    const messageHandler = (event) => {
      const { status, data, result, error } = event.data;
      
      switch (status) {
        case 'progress':
          if (progressCallback && data) {
            if (data.status === 'downloading') {
              progressCallback(`Downloading AI Model (${data.file || ''}): ${Math.round(data.progress || 0)}%`);
            } else if (data.status === 'init') {
              progressCallback('Initializing AI Model...');
            } else if (data.status === 'ready') {
              progressCallback('AI Model Ready!');
            }
          }
          break;
          
        case 'transcribing':
          if (progressCallback) progressCallback('Transcribing Audio... (This may take a minute)');
          break;
          
        case 'complete':
          aiWorker.removeEventListener('message', messageHandler);
          resolve(result);
          break;
          
        case 'error':
          aiWorker.removeEventListener('message', messageHandler);
          reject(new Error(error));
          break;
      }
    };

    aiWorker.addEventListener('message', messageHandler);

    // Send the audio data to the worker
    aiWorker.postMessage({ audio: float32Audio });
  });
}
