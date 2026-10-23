const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: "AI Music Visualizer Pro",
    // icon: path.join(__dirname, 'dist/favicon.ico'), // Will use default if none provided
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true // Safe because we just use input type="file"
    }
  });

  // Remove the default Electron menu bar
  Menu.setApplicationMenu(null);

  // Load the compiled Vite app
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
