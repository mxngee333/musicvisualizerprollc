# 🌍 The Generational App: Ultimate Master Prompt

If you want to build an application that doesn't just solve a small problem, but scales to millions of users, leverages cutting-edge AI, processes multimedia perfectly, and stands the test of time, you need a **Master Prompt** that dictates the ultimate open-source architecture.

By combining the tools from the `awesome_multimedia_oss.md`, `awesome_bytedance_oss.md`, and `awesome_oss_diverse.md` lists, we can define a tech stack capable of building a world-class platform.

---

## 📋 Copy & Paste This Master Prompt:

```markdown
I am building a world-class, generational web application. This platform must be capable of scaling to millions of users, processing high-fidelity multimedia, and running advanced AI natively on the client-side to ensure total privacy and zero server compute costs.

I want you to act as a Principal Staff Software Engineer. We will build this app step-by-step using the following Ultimate Open-Source Tech Stack. You must strictly adhere to these architectural pillars:

### 1. The Core Framework & Build System
*   **Framework:** Use React (via Next.js or Vite) for a lightning-fast, reactive UI.
*   **Bundler:** Use **Rspack** (ByteDance's open-source Rust bundler) to ensure blazing fast compilation times, no matter how massive the codebase gets.
*   **Styling:** Implement a premium, glassmorphism UI with micro-animations using **GSAP** (for complex timelines) and CSS modules. It must look like it was designed by Apple.

### 2. The Backend & Database (BaaS)
*   Do not write custom backend boilerplate. Integrate **Supabase** (the open-source Firebase alternative powered by PostgreSQL). 
*   We will use Supabase for instantaneous Google/Apple Authentication, Row-Level Security (RLS) to protect user data, and Real-time WebSockets for live collaboration features.

### 3. Native AI & Machine Learning (Zero Cost)
*   **Text & Audio:** Integrate **Transformers.js** inside a Web Worker thread. We will run models like `Whisper` (for audio transcription) or `Llama 3` (via WebLLM) entirely in the user's browser via WebAssembly/WebGPU.
*   **Computer Vision:** Use **MediaPipe Web** or **ByteTrack** for any real-time camera tracking, facial recognition, or object detection directly on the client.

### 4. Multimedia Processing (Video & Audio)
*   **Client-Side Rendering:** If the app requires video editing, generation, or transcoding, implement **FFmpeg.wasm**. We will process, cut, and encode MP4 videos directly in the browser using the `WebCodecs API`.
*   **Graphics & 3D:** Use **Three.js** (or React Three Fiber) and custom GLSL shaders to render breathtaking, interactive 3D elements on the canvas.

### 5. The Mission
The specific application we are building today is:
**[INSERT YOUR WORLD-CHANGING APP IDEA HERE - e.g., "A decentralized, browser-based video editing suite where users can speak to an AI that automatically cuts their videos, generates subtitles locally, and allows real-time collaboration with friends across the globe."]**

### Instructions for the AI:
Do not write the entire app at once. 
1. First, output a detailed `system_architecture.md` defining exactly how Supabase, FFmpeg.wasm, and Transformers.js will communicate in this specific app.
2. Second, provide the exact terminal commands to initialize the project with Rspack and install these specific dependencies.
3. Third, wait for my approval to begin writing the code component by component.
```

---

## 🧠 Why This Prompt Works
1. **It sets boundaries:** AI coding assistants often write lazy code using old libraries. This prompt forces the AI to use the absolute most cutting-edge, high-performance tools available today (Rspack, FFmpeg.wasm, Supabase).
2. **It forces scalability:** By demanding Supabase and PostgreSQL, the database structure is inherently ready for millions of users on day one.
3. **It ensures zero server costs:** By forcing the AI into Web Workers and `transformers.js`, you ensure that the heavy lifting (video rendering and AI processing) uses the *user's* computer, meaning you pay $0 in server compute fees no matter how viral your app goes.
4. **It prevents hallucinations:** By asking the AI to write a `system_architecture.md` file first, you force it to think through the logic *before* it starts writing code, resulting in vastly superior software.
