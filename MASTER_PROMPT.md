# 🤖 Master AI Prompt: Build a Native Browser AI App

If you want to build another application using native, free, client-side AI (like the Music Visualizer), you can copy and paste the prompt below into any AI coding assistant to get started perfectly on the first try.

---

### Copy & Paste This Prompt:

```markdown
I want to build a modern web application that uses **100% native, client-side AI** so that it runs completely in the user's browser without any backend servers or API keys. 

Please build this using Vite, Vanilla JavaScript, and the `@xenova/transformers` library.

Here are the strict architectural requirements you MUST follow:

1. **Web Worker Architecture**: You must run the AI model inside a dedicated Web Worker (`worker.js`). Do NOT run the AI model on the main UI thread, or the browser will freeze during inference.
2. **Model Caching**: Ensure that the `pipeline` from `@xenova/transformers` is only initialized once and cached so the user doesn't redownload the model on every click.
3. **Progress Callbacks**: Set up a `progress_callback` in the worker that sends messages back to the main thread. I want the UI to display the live download percentage of the model (e.g., "Downloading AI Model: 45%").
4. **Data Handling**: If the app processes audio or images, write the necessary code on the main thread to decode the media (e.g., using `AudioContext` for raw PCM audio data or Canvas for image data) BEFORE sending it to the Web Worker.

**The specific app I want you to build is:**
[INSERT YOUR APP IDEA HERE - e.g., "An app that takes a photo from the webcam and removes the background using the 'briaai/RMBG-1.4' model"]

Please provide:
1. The terminal commands to initialize the Vite project and install dependencies.
2. The code for the `index.html` UI.
3. The code for the `main.js` file (handling UI events and sending messages to the worker).
4. The code for the `worker.js` file (loading the transformers.js pipeline and running inference).
```

---

### 💡 Ideas for what you can insert at the bottom:
*   *"An app that lets a user speak into their microphone and translates it to French in real-time using the `Xenova/whisper-tiny` model."*
*   *"An image editor that removes backgrounds from photos instantly using the `Xenova/segformer-b0-finetuned-ade-512-512` model."*
*   *"A sentiment analyzer where the user types a review, and the app instantly classifies if it is Positive, Negative, or Neutral using the `Xenova/distilbert-base-uncased-finetuned-sst-2-english` model."*
*   *"An object detection app that analyzes a photo and draws bounding boxes around all the cars and people using the `Xenova/detr-resnet-50` model."*
