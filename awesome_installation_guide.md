# 💻 Generic Installation Prompts & Commands

Because the tools listed in the previous documents span across different programming languages and environments, they are installed in different ways. 

Here is a cheat sheet of the generic commands you would use in your terminal to install these tools into your projects, broken down by their ecosystem.

---

## 🟡 1. JavaScript / Web Native Tools (Node.js & NPM)
*Applies to: Transformers.js, Three.js, Tone.js, React Three Fiber, PixiJS, etc.*

If you are building a web application (like your Music Visualizer) using Vite, React, or vanilla JS, you will install these tools using the **Node Package Manager (NPM)**.

**To initialize a new project:**
```bash
npm create vite@latest my-project-name
cd my-project-name
npm install
```

**To install a specific tool into the project:**
```bash
npm install [package-name]
```
*Example:* `npm install @xenova/transformers` or `npm install three`

**To run the project locally:**
```bash
npm run dev
```

---

## 🐍 2. AI, Machine Learning & Automation (Python)
*Applies to: yt-dlp, Auto-Editor, Spleeter, MoviePy, Pandas, etc.*

Most heavy AI, machine learning, and data science tools are built in **Python**. You install these using Python's package manager, **pip**.

**To install a tool globally on your computer:**
```bash
pip install [package-name]
```
*Example:* `pip install yt-dlp` or `pip install auto-editor`

**If you are building a Python project, you should use a Virtual Environment:**
```bash
# Create a virtual environment
python -m venv myenv

# Activate it (Windows)
myenv\Scripts\activate

# Activate it (Mac/Linux)
source myenv/bin/activate

# Install your tools inside the environment
pip install spleeter
```

---

## 🐳 3. Backend, Databases & Self-Hosted SaaS (Docker)
*Applies to: Supabase, Appwrite, n8n, Metabase, Redis, PostgreSQL, etc.*

When you want to run an entire backend or a massive piece of software locally, you don't install it line-by-line. Instead, you run it inside a **Docker Container**—a pre-packaged mini-computer that has everything already set up.

**To pull and run a software image using Docker:**
```bash
docker run -d -p [port] [image-name]
```
*Example (Running a local Redis database):* `docker run -d -p 6379:6379 redis`

**For complex apps (like Supabase or n8n), you use Docker Compose:**
You create a `docker-compose.yml` file and simply run:
```bash
docker-compose up -d
```
*(This tells Docker to download the software, set up the database, configure the networks, and start it running in the background automatically).*

---

## 🖥️ 4. System-Level Command Line Tools (OS Specific)
*Applies to: FFmpeg, Nmap, Git, Node.js itself.*

Some tools are so low-level that they need to be installed directly onto your operating system so any other program can use them.

**For Windows (Using Winget or Chocolatey):**
```powershell
winget install [software-name]
# Example: winget install ffmpeg
```

**For Mac (Using Homebrew):**
```bash
brew install [software-name]
# Example: brew install ffmpeg
```

**For Linux (Debian/Ubuntu using APT):**
```bash
sudo apt install [software-name]
# Example: sudo apt install ffmpeg
```
