const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  downloadMedia : (url,format) => ipcRenderer.invoke('download-media', url,format)
});