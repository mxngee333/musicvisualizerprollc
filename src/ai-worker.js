import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are running in the browser
env.allowLocalModels = false;

// Define model
const MODEL_NAME = 'Xenova/whisper-tiny.en';

// Singleton pipeline instance
class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = MODEL_NAME;
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Convert Whisper chunks to LRC format
function formatLRC(chunks) {
    let lrcText = '';
    
    for (const chunk of chunks) {
        // chunk.timestamp is an array [start_time, end_time] in seconds
        // chunk.text is the transcribed text
        
        const startTime = chunk.timestamp[0];
        
        // Convert to minutes:seconds.hundredths
        const minutes = Math.floor(startTime / 60).toString().padStart(2, '0');
        const seconds = Math.floor(startTime % 60).toString().padStart(2, '0');
        const hundredths = Math.floor((startTime % 1) * 100).toString().padStart(2, '0');
        
        const text = chunk.text.trim();
        
        if (text) {
            lrcText += `[${minutes}:${seconds}.${hundredths}] ${text}\n`;
        }
    }
    
    return lrcText;
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { audio } = event.data;
    
    if (!audio) return;
    
    try {
        // Retrieve the pipeline. It will be downloaded the first time.
        const transcriber = await PipelineSingleton.getInstance((x) => {
            // Send download progress back to the main thread
            self.postMessage({ status: 'progress', data: x });
        });

        // Run inference
        self.postMessage({ status: 'transcribing' });
        
        const output = await transcriber(audio, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: true,
        });

        // Format to LRC
        const lrcText = formatLRC(output.chunks);

        // Send the result back
        self.postMessage({
            status: 'complete',
            result: lrcText
        });
        
    } catch (error) {
        self.postMessage({
            status: 'error',
            error: error.message
        });
    }
});
