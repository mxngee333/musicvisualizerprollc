# 🎙️ Native Audio Transcription Architecture

This document explains the architectural change made to the Music Visualizer app, replacing the cloud-based Google Gemini API with a **100% native, client-side implementation** using Hugging Face's `transformers.js`.

## ❌ The Old Way: Google Gemini API

Previously, the app used the `@google/genai` SDK to transcribe audio. 

**The Workflow:**
1. User uploaded an audio file.
2. The browser sent the audio file to Google's servers.
3. The Gemini AI processed the audio and returned a transcript.
4. The transcript was formatted into LRC.

**The Problems:**
- **Cost & Limits:** It required an API key, which could run out of credits or get blocked (which is what happened).
- **Privacy:** User audio files had to be uploaded to a third-party server.
- **Latency:** Uploading large audio files over the network caused delays.

---

## ✅ The New Way: Transformers.js (Native Browser AI)

We completely removed the Gemini API and replaced it with `transformers.js`, allowing us to run OpenAI's **Whisper** model directly inside the user's browser using WebAssembly.

### How We Built It

#### 1. The Web Worker (`src/ai-worker.js`)
Machine learning models require heavy computation. If we ran the transcription on the main UI thread, the entire webpage would freeze until the transcription was finished. 
To solve this, we created a **Web Worker**. The worker runs in a separate background thread.
- It imports `pipeline` from `@xenova/transformers`.
- It downloads the `Xenova/whisper-tiny.en` model (this is cached in the browser after the first download).
- It listens for messages from the main thread containing raw audio data.
- It runs the Whisper model on the audio and sends progress updates and the final transcript back to the main thread.

#### 2. Audio Processing (`src/ai.js`)
The Whisper model requires a very specific audio format: **16kHz, mono, raw PCM float32 arrays**.
We updated `generateLyricsFromAudio` to process the user's audio file *before* sending it to the AI:
1. We use the browser's native `AudioContext` to decode the MP3/WAV file.
2. We resample the audio to 16,000 Hz.
3. We extract the raw channel data (PCM).
4. We send this raw array to the `ai-worker.js` thread.

#### 3. UI Updates (`src/main.js`)
Because the model downloads and transcribes locally, we added a progress callback. 
When the user clicks "Auto-Sync Lyrics", the button text now updates dynamically:
- `⏳ Downloading AI Model: 45%`
- `⏳ Transcribing Audio...`
- `Done!`

### Why This is Better
1. **100% Free forever.** No API keys, no subscriptions, no rate limits.
2. **Infinite Scale.** Because the AI runs on the *user's* hardware, you don't pay for server compute. 1 user or 1 million users costs you the same amount ($0).
3. **Total Privacy.** The audio file never leaves the user's computer. It is processed entirely locally.
4. **Offline Support.** Once the model is cached in the browser, the transcription feature works even if the user disconnects from the internet.
