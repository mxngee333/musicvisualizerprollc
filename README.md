# AI Music Visualizer Pro

A powerful, entirely client-side, browser-based and desktop-ready music visualization engine. It takes an audio file and generates stunning, customizable visuals in real-time, complete with 3D backgrounds, dynamic typography, and offline/real-time MP4 video rendering.

## 🌟 Key Features

*   **Real-time Audio Analysis:** Uses the Web Audio API to analyze frequency and waveform data dynamically.
*   **16 Custom Visualizers:** Ranges from classic Equalizer Bars to 3D Infinite Hexagons and Ethereal Mists.
*   **Dual-Rendering Engine:** Uses HTML5 Canvas for crisp 2D geometry and Three.js (WebGL) for deep, interactive 3D particle effects.
*   **Seamless Video Backgrounds:** Implements an advanced "Pre-Warmed Decoding" engine to ensure zero latency and zero stuttering when crossfading between 4K video files.
*   **Dual MP4 Export System:**
    *   **Offline Render (🚀):** Uses advanced WebCodecs APIs to compile frame-by-frame video extremely fast in the background. (Best for images/static backgrounds).
    *   **Screen Record (🔴):** Uses the `MediaRecorder` API to capture the active tab. (Required for dynamic video backgrounds).
*   **Cross-Platform Desktop App:** Wrapped in Electron to run natively on Windows (.exe) and macOS (.dmg).
*   **Mobile-Friendly Design:** Features a fully responsive UI with a dedicated mobile settings toggle, allowing the visualizer to take up the full screen uninterrupted on mobile devices.

### 🚀 Recent Updates
*   **Mobile Export Engine Overhaul:** Massively upgraded the offline export engine for iOS and Android. Added a smart memory downscaler to prevent Out-Of-Memory WebKit crashes, implemented the Screen Wake Lock API to prevent mobile screens from sleeping during long renders, fixed synchronous CPU watchdog freezes during MP4 finalization, and added a native Web Share API integration so users can tap "Save to Gallery" and drop the video directly into their camera roll!
*   **Gumroad License Gateway:** Integrated a robust 3-tier Gumroad payment verification system (Monthly, Yearly, Lifetime). The system securely queries the Gumroad API to validate license keys before granting access to the visualizer, utilizing IP and browser fingerprinting securely stored in Firestore to prevent bypasses and unauthorized sharing.
*   **Dynamic Aspect Ratios:** Added live, on-the-fly aspect ratio switching (16:9, 9:16, 1:1, 3:4, 4:3). Utilizes intelligent bounding boxes and `object-fit: contain` to ensure 2D avatars, 3D scenes, and text lyrics smoothly scale without overflowing or distorting regardless of the video's orientation.
*   **CapCut-Style Neon & Solid Flowing Edges:** Added 27 unique glowing border animations across 9 colors (Gold, Red, White, Blue, Pink, Green, Black, Moth, and Multi-Color). Features 3 modes: "Neon Edge Flow" (dashed racing lines), "Solid Neon Edge" (fully connected, beat-pulsing borders), and "Solid Flowing Edge" (fully connected borders with a racing conic gradient light beam).
*   **Offline Export Freeze Prevention & Cinematic UI:** Redesigned the WebCodecs Offline Export engine to render asynchronously in micro-chunks. This completely eliminates UI freezing during massive 4K exports. Added a beautiful full-screen, cinematic percentage overlay to keep users informed during the export.
*   **Beat-Reactive Logo & Expanded 2D Gear:** Added a "Shake to Beat" toggle and intensity slider for the logo. Expanded the 2D procedurals with new DJ Turntable Vinyls featuring dynamic coloring (Blue, Pink, Green, Gold, etc.).
*   **Intelligent Magic Preset Engine:** Upgraded the randomizer button to a cohesive "Master Theme Engine." Instead of clashing elements, it selects from four professional aesthetics (Cyberpunk, Fire/Aggressive, Chill/Ethereal, and Minimalist/Matrix) ensuring the 2D avatars, 3D scenes, visualizers, and backgrounds match perfectly. It also prevents overlapping 2D and 3D avatars.
*   **Cleaner UI:** Moved the Magic Preset button to live seamlessly alongside the Aspect Ratio dropdown and tightened up label spacing for a more organized interface.
---

## 🛠️ How to Run & Build

This project is built using **Vite**, **Vanilla Javascript**, and **Electron**.

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### 2. Local Development (Web)
To start a live-reloading local server so you can test changes instantly:
```bash
npm install
npm run dev
```

### 3. Build for the Web (Hosting)
To compile the files for the internet (Firebase, Vercel, Netlify):
```bash
npm run build
```

### 4. Build for Desktop (Windows & Mac)
To compile a native double-clickable application:
```bash
npm run electron:build
```
*Note: To get a `.dmg` Apple file, you must run this command on a Mac computer.*

---

## 🤖 Standalone Prompts for AI Replication

If you ever need an AI to rebuild this architecture from scratch or add major features, you can provide it with these "Standalone Prompts" to give it context on how the engine was designed:

### Prompt 1: The Core Architecture
> "I am building a browser-based Music Visualizer using Vanilla JS and the Web Audio API. The architecture must have a main loop driven by `requestAnimationFrame`. We need two canvases layered on top of each other: one standard HTML5 Canvas for 2D UI elements/shapes, and a `three-canvas` behind it running Three.js for 3D background particle effects. Do not use React or frameworks, keep it pure Vanilla JS for maximum frame performance."

### Prompt 2: The Slideshow Engine (Zero-Latency Video)
> "Write a SlideshowManager class that accepts an array of image/video Files from a user input. Crucially, when transitioning between videos, the browser decoder often lags. Implement a 'Pre-Warmed Decoding' algorithm where the *next* video in the array is instantiated as a muted background `<video>` element and starts playing silently off-screen *before* the crossfade begins. During the crossfade, both the current and next videos must be playing simultaneously to ensure a zero-latency, seamless transition on the Canvas."

### Prompt 3: Offline MP4 Export (WebCodecs)
> "I need to export a visualizer canvas to an MP4 file offline. Write an `offline-export.js` module that uses the `OfflineAudioContext` to process audio faster than real-time. Sync this with the `VideoEncoder` WebCodecs API and `mp4-muxer` library to encode video frames exactly matching the audio time stamps. Ensure that when exporting, the `requestAnimationFrame` loop steps forward artificially using the current audio frame index rather than real-time clock."

### Prompt 4: Electron Desktop Wrapper
> "I have a Vite web application that I want to convert into a desktop `.exe` using Electron. Write an `electron-main.cjs` file that creates a borderless `BrowserWindow` and loads my `dist/index.html` file. Ensure `vite.config.js` is set to `base: './'` so that local file system assets load properly without a server."

### Prompt 5: Dynamic Aspect Ratios & 3D Camera Scaling
> "I have a visualizer with both a 2D Canvas and a 3D Canvas (Three.js). I need to allow the user to select aspect ratios (16:9, 9:16, 1:1). Write the logic to resize the internal `<canvas>` dimensions. Use CSS `width: 100vw; height: 100vh; object-fit: contain;` to ensure the canvases visually snap to the screen while maintaining their internal ratio. For Three.js, ensure the `PerspectiveCamera` scales the `avatarGroup` down when the aspect ratio is less than 1 (vertical) so the 3D dancer does not get horizontally cropped."

### Prompt 6: CapCut-Style Neon Edge Flow Effects
> "Write a canvas 2D function that draws a glowing neon border flow effect (like CapCut) perfectly mapped to the edges of the canvas. Use `ctx.setLineDash([dashLength, gapLength])` where the dash is 15% of the total perimeter and the gap is 35%. Animate `ctx.lineDashOffset` using the elapsed time and an intensity multiplier. Ensure the `shadowBlur` and `shadowColor` match the neon stroke to create a bloom effect."

### Prompt 7: WebCodecs Unblocking Offline Render
> "My WebCodecs `VideoEncoder` and `OfflineAudioContext` loop is freezing the browser tab because the `while` loop runs synchronously for thousands of frames. Rewrite the export loop to render in chunks, yielding to the main thread every 5 frames using `await new Promise(r => requestAnimationFrame(r))`. This will unblock the paint thread so I can update a giant percentage UI overlay."

### Prompt 8: Solid Flowing Conic Gradient Edge
> "I need a canvas effect that draws a fully connected, unbroken border around the screen (`strokeRect`), but looks like a beam of light is racing around it. Create a rotating conic gradient using `ctx.createConicGradient((time / 500), w/2, h/2)`. Add color stops so the base color is dim `rgba(..., 0.3)` but the head of the gradient is bright white `#ffffff` right next to the base color. Stroke the border with this gradient to simulate a flowing flare of light on a solid line."
