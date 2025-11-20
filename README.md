# 🎵 YouTube Desktop Downloader

**A simple, fast, cross-platform desktop application for converting YouTube links to MP3 audio or MP4 video files.**

This application is built with Electron and Vue.js, leveraging the power of Node.js on the backend to provide a native, fast user experience.

---

## 💻 Tech Stack

This project combines web technologies with native system tools for performance and reliability.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **Vue.js 3** | Reactive user interface for a smooth experience. |
| **Styling** | **Tailwind CSS + DaisyUI** | Utility-first CSS for the modern dark/glass aesthetic. |
| **Desktop Framework** | **Electron** | Packages the Node.js backend and Vue frontend into a single desktop application. |
| **Video/Audio Engine** | **yt-dlp (Binary)** | Handles retrieving stream manifest and bypassing anti-bot measures. |
| **Conversion** | **FFmpeg (Binary)** | Merges video/audio streams and converts to MP3 format. |
| **Packaging** | **electron-builder** | Creates the final `.exe` installer. |

---

## 🛠️ Installation & Building

### 🚀 Recommended: Download Latest Release

You can download the latest installer (`.exe`) directly from the [Releases page](https://github.com/KKhamwiset/youtube-downloader-desktop/releases/latest).

### ⚙️ Developer Build (From Source)

To run the application in development mode or build the installer yourself:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/KKhamwiset/youtube-downloader-desktop.git](https://github.com/KKhamwiset/youtube-downloader-desktop.git)
    cd youtube-downloader-desktop
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Add Binaries:**
    * Download the latest **`yt-dlp.exe`** from the official GitHub releases.
    * Locate **`ffmpeg.exe`** inside your project's `node_modules/ffmpeg-static/` folder.
    * **Crucially, place both `yt-dlp.exe` and `ffmpeg.exe` inside a new folder named `bin` in your project root.**
4.  **Run in Development:**
    ```bash
    npm run dev:electron
    ```
5.  **Build Installer (`.exe`):**
    ```bash
    npm run dist
    # The installer will be generated in the /dist-electron folder.
    ```

---

## 🛑 Important Disclaimer

This application is intended for **personal use only** (e.g., downloading content that you own or have permission to use). Users are solely responsible for ensuring they comply with YouTube's Terms of Service and all applicable copyright laws in their region. The developer is not responsible for misuse of this software.s