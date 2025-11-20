const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { execFile } = require("child_process");
const sanitize = require('sanitize-filename');
const { arch } = require("os");
let basePath;
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  basePath = path.join(__dirname, '..', 'bin');
} else {
  basePath = path.join(process.resourcesPath, 'bin');
}
const ffmpegPath = path.join(basePath, "ffmpeg.exe");
const ytDlpPath = path.join(basePath, "yt-dlp.exe");
let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  mainWindow.setMenu(null);
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }
}

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile(ytDlpPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error("yt-dlp error:", stderr);
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

ipcMain.handle("download-media", async (_event, videoUrl,format) => {

  console.log("Processing:", videoUrl);

  try {

    const jsonOutput = await runYtDlp([
      videoUrl,
      "--dump-json",
      "--no-playlist"
    ]);
    
    const info = JSON.parse(jsonOutput);
    const cleanTitle = sanitize(info.title)
    const ext = format === 'mp3' ? 'mp3' : 'mp4';
    const fileType = format === 'mp3' ? 'Audio Files' : 'Video Files';
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save MP3',
      defaultPath: path.join(app.getPath('downloads'), `${cleanTitle}.${ext}`),
      filters: [{ name: [fileType], extensions: [ext] }]
    });

    args_ = [
      videoUrl,
      "--output", filePath, 
      "--ffmpeg-location", ffmpegPath,
      "--no-playlist"
    ]
    if (canceled || !filePath) 
      return { 
      ok: false, message: "Cancelled"
     };
     if (format === 'mp3') {
      args_.push("--extract-audio", "--audio-format", "mp3");
    } else {
      args_.push("-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best");
    }
    await runYtDlp(args_);

    return { 
      ok: true, 
      message: "Download Complete!",
      title: cleanTitle,
      path: filePath };

  } catch (error) {
    console.error("Main Process Error:", error);
    return { 
      ok: false, 
      message: "Failed to download", 
      error: error.message ,
    };
  }
});