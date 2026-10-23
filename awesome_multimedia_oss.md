# 🎨 Awesome Open-Source Multimedia & Native AI

If you loved what `Transformers.js` did for native audio transcription, you will be blown away by what else is possible today using open-source tools—especially those that run natively in the browser!

Here is a massive, highly curated list of the best open-source libraries for pushing the limits of audio, video, graphics, and AI in your applications.

---

## 🧠 Browser-Native AI (No APIs Needed)
*Run massive AI models directly on the user's GPU/CPU inside the browser.*

1. **[Transformers.js](https://github.com/huggingface/transformers.js)**: Run Hugging Face models (Whisper, BERT, Vision) natively in the browser via WebGL/WebGPU.
    ```bash
    npm install @xenova/transformers
    ```
2. **[MediaPipe Web](https://developers.google.com/mediapipe)**: Google's ultra-fast ML solutions for face tracking, hand tracking, pose estimation, and background segmentation in real-time.
    ```bash
    npm install @mediapipe/tasks-vision
    ```
3. **[TensorFlow.js](https://github.com/tensorflow/tfjs)**: Train and deploy ML models in the browser. Powers things like real-time background blur.
    ```bash
    npm install @tensorflow/tfjs
    ```
4. **[WebLLM](https://github.com/mlc-ai/web-llm)**: Run Large Language Models (like Llama 3) directly in the browser using WebGPU. No API keys needed.
    ```bash
    npm install @mlc-ai/web-llm
    ```
5. **[face-api.js](https://github.com/justadudewhohacks/face-api.js)**: Browser-based facial recognition and emotion detection.
    ```bash
    npm install face-api.js
    ```
6. **[Vosk-browser](https://github.com/ccoreilly/vosk-browser)**: Offline speech recognition using WebAssembly.
    ```bash
    npm install vosk-browser
    ```
7. **[Wllama](https://github.com/ngxson/wllama)**: WebAssembly port of llama.cpp to run LLMs natively in the browser.
    ```bash
    npm install @wllama/wllama
    ```
8. **[ONNX Runtime Web](https://github.com/microsoft/onnxruntime)**: Run ONNX models using WebGL and WebGPU.
    ```bash
    npm install onnxruntime-web
    ```
9. **[Picovoice Porcupine](https://github.com/Picovoice/porcupine)**: On-device wake word detection (e.g., "Hey Siri" functionality).
    ```bash
    npm install @picovoice/porcupine-web
    ```
10. **[Jeeliz FaceFilter](https://github.com/jeeliz/jeelizFaceFilter)**: Lightweight, robust WebGL face tracking library.
    ```bash
    npm install facefilter
    ```

---

## 🎵 Audio Analysis, Processing & Visualizers
*Tools to analyze beats, separate stems, and synthesize audio.*

11. **[Tone.js](https://github.com/Tonejs/Tone.js)**: A Web Audio framework for making interactive music in the browser.
    ```bash
    npm install tone
    ```
12. **[Howler.js](https://github.com/goldfire/howler.js)**: The ultimate javascript audio library for the modern web (fallback support, spatial audio).
    ```bash
    npm install howler
    ```
13. **[Meyda](https://github.com/meyda/meyda)**: Audio feature extraction for the web. Perfect for building visualizers (gets MFCCs, spectral roll-off, etc.).
    ```bash
    npm install meyda
    ```
14. **[Wavesurfer.js](https://github.com/katspaugh/wavesurfer.js)**: Create navigable waveforms from audio files (like SoundCloud).
    ```bash
    npm install wavesurfer.js
    ```
15. **[AudioMotion-analyzer](https://github.com/hvianna/audioMotion-analyzer)**: A high-resolution real-time audio spectrum analyzer.
    ```bash
    npm install audiomotion-analyzer
    ```
16. **[Essentia.js](https://github.com/MTG/essentia.js)**: Extensive library for audio analysis and music information retrieval (BPM, key detection, mood).
    ```bash
    npm install essentia.js
    ```
17. **[Spleeter](https://github.com/deezer/spleeter)**: Deezer's source separation library (Python) to extract vocals, drums, and bass from any song.
    ```bash
    pip install spleeter
    # Usage: spleeter separate -p spleeter:2stems audio_example.mp3
    ```
18. **[Demucs](https://github.com/facebookresearch/demucs)**: Meta's state-of-the-art music source separation (often outperforms Spleeter).
    ```bash
    pip install demucs
    # Usage: demucs input.mp3
    ```
19. **[WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)**: The built-in native browser spec for complex audio routing and processing.
    ```javascript
    // Built into the browser - no installation required
    const audioContext = new AudioContext();
    ```
20. **[Pedalboard](https://github.com/spotify/pedalboard)**: Spotify's Python library for adding studio-quality audio effects (reverb, chorus, VSTs) programmatically.
    ```bash
    pip install pedalboard
    ```
21. **[Aubio](https://github.com/aubio/aubio)**: C/Python library for audio feature extraction (pitch, beat tracking).
    ```bash
    pip install aubio
    ```
22. **[Librosa](https://github.com/librosa/librosa)**: The standard Python library for music and audio analysis.
    ```bash
    pip install librosa
    ```
23. **[Pizzicato.js](https://github.com/alemangui/pizzicato)**: Simplify Web Audio API to create and manipulate sounds with effects.
    ```bash
    npm install pizzicato
    ```
24. **[Tuna.js](https://github.com/Theodeus/tuna)**: An audio effects library for the Web Audio API.
    ```bash
    npm install tunajs
    ```

---

## 🎞️ Video Processing & Rendering
*Edit, encode, and generate videos directly in code.*

25. **[FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)**: The holy grail. Run FFmpeg directly inside the browser using WebAssembly. Convert videos, extract audio, or trim clips client-side!
    ```bash
    npm install @ffmpeg/ffmpeg @ffmpeg/util
    ```
26. **[Remotion](https://github.com/remotion-dev/remotion)**: Create videos programmatically using React. Code your animations and render them as MP4s.
    ```bash
    npx create-video@latest
    ```
27. **[MoviePy](https://github.com/Zulko/moviepy)**: Python module for video editing (cuts, concatenations, title insertions).
    ```bash
    pip install moviepy
    ```
28. **[MP4Box.js](https://github.com/gpac/mp4box.js)**: JavaScript library to process MP4 files in the browser (muxing/demuxing).
    ```bash
    npm install mp4box
    ```
29. **[WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)**: Native browser API for low-level access to video/audio encoders and decoders.
    ```javascript
    // Built into modern browsers - no installation required
    const encoder = new VideoEncoder({ output, error });
    ```
30. **[RecordRTC](https://github.com/muaz-khan/RecordRTC)**: WebRTC JavaScript library for audio/video/screen recording.
    ```bash
    npm install recordrtc
    ```
31. **[Video.js](https://github.com/videojs/video.js)**: Open-source HTML5 video player framework.
    ```bash
    npm install video.js
    ```
32. **[Whammy](https://github.com/antimatter15/whammy)**: A real-time WebM video encoder written purely in JavaScript.
    ```bash
    npm install whammy
    ```
33. **[CCapture.js](https://github.com/spite/ccapture.js)**: Library to capture canvas-based animations (Three.js, p5.js) at fixed framerates and export to video.
    ```bash
    npm install ccapture.js
    ```
34. **[WebAV](https://github.com/bilibili/WebAV)**: High-performance audio/video processing in the browser built on WebCodecs and WebAssembly.
    ```bash
    npm install @webav/av-cliper
    ```

---

## 🎨 3D, Graphics, and Shaders
*Push the boundaries of visual art in the browser.*

35. **[Three.js](https://github.com/mrdoob/three.js)**: The absolute standard for 3D graphics in the browser.
    ```bash
    npm install three
    ```
36. **[PixiJS](https://github.com/pixijs/pixijs)**: Lightning-fast 2D WebGL rendering engine.
    ```bash
    npm install pixi.js
    ```
37. **[P5.js](https://github.com/processing/p5.js)**: Creative coding library making canvas and WebGL accessible for artists.
    ```bash
    npm install p5
    ```
38. **[Babylon.js](https://github.com/BabylonJS/Babylon.js)**: Powerful 3D engine with incredible physics and game development tools.
    ```bash
    npm install @babylonjs/core
    ```
39. **[OGL](https://github.com/oframe/ogl)**: Minimalist WebGL framework. Perfect for when Three.js is too heavy.
    ```bash
    npm install ogl
    ```
40. **[Theatre.js](https://github.com/theatre-js/theatre)**: Motion design toolkit for the web. Animate Three.js or React elements with a visual timeline editor.
    ```bash
    npm install @theatre/core @theatre/studio
    ```
41. **[R3F (React Three Fiber)](https://github.com/pmndrs/react-three-fiber)**: A React renderer for Three.js.
    ```bash
    npm install @react-three/fiber three
    ```
42. **[GlslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas)**: Simple tool to load GLSL shaders into an HTML canvas.
    ```bash
    npm install glsl-canvas
    ```
43. **[Lottie](https://github.com/airbnb/lottie-web)**: Render After Effects animations natively on the web.
    ```bash
    npm install lottie-web
    ```
44. **[GSAP](https://github.com/greensock/GSAP)**: The most robust high-performance JavaScript animation library.
    ```bash
    npm install gsap
    ```
45. **[Curtains.js](https://github.com/martinlaxenaire/curtainsjs)**: WebGL library to convert DOM elements into 3D textured planes (perfect for wavy image effects).
    ```bash
    npm install curtainsjs
    ```
46. **[Twgl.js](https://github.com/greggman/twgl.js)**: A tiny WebGL helper library.
    ```bash
    npm install twgl.js
    ```
47. **[A-Frame](https://github.com/aframevr/aframe)**: Web framework for building Virtual Reality (VR) experiences.
    ```bash
    npm install aframe
    ```

---

## 🗣️ Voice, Text-to-Speech & Deepfakes (Audio/Video AI)
*Cutting-edge Generative AI for multimedia.*

48. **[Bark](https://github.com/suno-ai/bark)**: Transformer-based text-to-audio model capable of highly realistic speech, music, and sound effects.
    ```bash
    pip install git+https://github.com/suno-ai/bark.git
    ```
49. **[Tortoise-TTS](https://github.com/neonbjb/tortoise-tts)**: The most realistic open-source text-to-speech engine (voice cloning).
    ```bash
    pip install tortoise-tts
    ```
50. **[Audiocraft (MusicGen)](https://github.com/facebookresearch/audiocraft)**: Meta's open-source library for generating high-quality music from text prompts.
    ```bash
    pip install audiocraft
    ```
51. **[RVC (Retrieval-based Voice Conversion)](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)**: Real-time AI voice cloning (used for AI covers).
    ```bash
    git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git
    cd Retrieval-based-Voice-Conversion-WebUI
    pip install -r requirements.txt
    ```
52. **[SadTalker](https://github.com/OpenTalker/SadTalker)**: Generate realistic talking head videos from a single image and an audio file.
    ```bash
    git clone https://github.com/OpenTalker/SadTalker.git
    cd SadTalker
    pip install -r requirements.txt
    ```
53. **[Wav2Lip](https://github.com/Rudrabha/Wav2Lip)**: Highly accurate lip-syncing AI to match any audio to any video.
    ```bash
    git clone https://github.com/Rudrabha/Wav2Lip.git
    cd Wav2Lip
    pip install -r requirements.txt
    ```
54. **[Coqui TTS](https://github.com/coqui-ai/TTS)**: Deep learning toolkit for Text-to-Speech, battle-tested in research and production.
    ```bash
    pip install TTS
    # Usage: tts --text "Hello World" --out_path output.wav
    ```
55. **[Amphion](https://github.com/open-mmlab/Amphion)**: Toolkit for Audio, Music, and Speech generation.
    ```bash
    git clone https://github.com/open-mmlab/Amphion.git
    cd Amphion
    pip install -r requirements.txt
    ```

---

## 🛠️ Specialized Utilities & Tools
*Libraries that solve very specific multimedia problems brilliantly.*

56. **[JSMediaTags](https://github.com/aadsm/jsmediatags)**: Read ID3 tags (album art, artist) from MP3/MP4 files in the browser.
    ```bash
    npm install jsmediatags
    ```
57. **[ColorThief](https://github.com/lokesh/color-thief)**: Extract the dominant colors or a color palette from an image (great for dynamic UI themes based on album art).
    ```bash
    npm install colorthief
    ```
58. **[Tesseract.js](https://github.com/naptha/tesseract.js)**: Pure JavaScript OCR (Optical Character Recognition) for reading text from images natively.
    ```bash
    npm install tesseract.js
    ```
59. **[Cropper.js](https://github.com/fengyuanchen/cropperjs)**: The best JavaScript image cropper.
    ```bash
    npm install cropperjs
    ```
60. **[Gif.js](https://github.com/jnordberg/gif.js)**: JavaScript GIF encoder that runs in your browser.
    ```bash
    npm install gif.js
    ```
61. **[Sharp](https://github.com/lovell/sharp)**: High-performance Node.js image processing (resizing, WebP conversion).
    ```bash
    npm install sharp
    ```
62. **[Fabric.js](https://github.com/fabricjs/fabric.js)**: HTML5 canvas library with an interactive object model (build your own MS Paint / Figma).
    ```bash
    npm install fabric
    ```
63. **[Vite](https://github.com/vitejs/vite)**: Not strictly multimedia, but the blazing fast build tool that makes all modern web multimedia possible.
    ```bash
    npm create vite@latest my-app
    ```
64. **[WebRTC](https://webrtc.org/)**: Open framework for real-time peer-to-peer audio/video communication.
    ```javascript
    // Built into all modern browsers - no installation required
    const pc = new RTCPeerConnection();
    ```
