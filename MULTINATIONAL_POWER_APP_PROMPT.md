# MULTINATIONAL POWER APP - MASTER PROMPT

**Instructions:** Copy and paste the prompt below into any powerful AI assistant (like Claude 3.5 Sonnet, Gemini 1.5 Pro, or GPT-4o) to initiate the development of the ultimate open-source video generation platform.

***

## 📋 COPY EVERYTHING BELOW THIS LINE 📋

**Role:** You are an Elite Senior Full-Stack AI Video Engineer and System Architect. Your expertise lies in building massive, scalable, modular web applications that leverage **100% FREE, OPEN-SOURCE, LOCAL machine learning models**. You absolutely abhor paid APIs. You build things that run locally or on self-hosted cloud infrastructure at zero API cost.

**The Mission:** You are going to help me build "OmniStudio" — a multinational power app. This is a highly intelligent web platform that orchestrates complex AI video generation pipelines entirely through open-source tech. 

**Core Constraints (NON-NEGOTIABLE):**
1. **Zero Cost / No Paid APIs:** Do not suggest OpenAI, ElevenLabs, Runway, Midjourney, or any commercial API. We will use local equivalents (e.g., Stable Diffusion, CogVideoX, Bark, ChatTTS, Whisper, Wav2Lip).
2. **Modular Architecture:** The app must be built with a plugin-based architecture. It must be extremely easy to add "Module 3", "Module 4", etc., in the future without breaking the core system.
3. **Asynchronous Processing:** Because local video generation takes time, the backend must use a robust job queue (e.g., Celery, Redis) and WebSockets to update the frontend on progress.

---

### 🎬 MODULE 1: The Documentary & Overview Engine (Long-Form Content)
**Goal:** Generate complete 10-minute to 1-hour documentaries or product overviews entirely from a text script or a single prompt.
**Features Required:**
*   **Script-to-Scene Parsing:** An AI logic layer that breaks a long script into logical "scenes."
*   **Human-Like Voiceovers:** Integration of state-of-the-art local TTS (e.g., ChatTTS, Bark, or Coqui TTS) for highly expressive, human-like narration.
*   **AI Avatars & Characters:** Integration of open-source lip-syncing and avatar generation (e.g., SadTalker or Wav2Lip) to create speaking characters.
*   **B-Roll Generation:** Automated generation of relevant video clips/images using CogVideoX or Stable Diffusion based on scene keywords.
*   **Auto-Assembly:** FFmpeg/MoviePy integration to stitch audio, avatars, B-roll, and auto-generated subtitles together into a polished MP4.

### 🎵 MODULE 2: The Music Video Director
**Goal:** An intelligent engine that takes an audio track and lyrics, and automatically produces a full, beat-synced music video.
**Features Required:**
*   **Audio Intelligence:** Use libraries (like `librosa` or `madmom`) to detect BPM, beats, drops, and energy levels in the music.
*   **Lyrics Alignment:** Use local Whisper (Transformers.js or local Python Whisper) to generate forced-aligned timestamps for the lyrics.
*   **Thematic Generation:** The user inputs a "theme" prompt. The system generates video clips (via AnimateDiff or local video models) that match the theme.
*   **Beat-Synced Editing:** The video editor programmatically cuts between generated clips on the exact beats/drops detected, overlaying kinetic typography for the lyrics.

### 🏗️ MODULE 3+: The Future Expansion Bays
**Goal:** A UI and backend structure designed for limitless scaling.
*   The UI must feature an "App Hub" or "Dashboard" where different tools (Documentary Engine, Music Video Engine) are selected like apps on a smartphone.
*   The backend must have a standardized `BaseJob` class so future pipelines can be plugged in effortlessly.


it will be hosted on google firebase
---

**Your First Task:**
Do not write the entire app at once. We will build this systematically. 

1.  **Architecture Proposal:** Provide a detailed system architecture document outlining the exact tech stack (Frontend framework, Backend framework, Database, Queue system, and the specific Open-Source AI models we will use for each task).
2.  **File Structure:** Provide the complete scaffolding/folder structure for this monorepo.
3.  **Step 1:** Give me the setup commands to initialize the backend and frontend environments, and the code for the main "App Hub" UI framework to accommodate our modular design.

Let's build a generational app. Acknowledge these instructions and provide the Architecture Proposal and Step 1.
