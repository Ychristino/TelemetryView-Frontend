const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { TelemetryData } = require('../backend/utilities/getTelemetryData');
const { SystemDirectory } = require('../backend/utilities/systemDirectory');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL('http://localhost:3000');

  SystemDirectory.watchGamesDirectory(win, path.join(os.homedir(), 'Documents', 'TelemetryData'));
  SystemDirectory.watchTracksDirectory(win, path.join(os.homedir(), 'Documents', 'TelemetryData'));
  SystemDirectory.watchDriversDirectory(win, path.join(os.homedir(), 'Documents', 'TelemetryData'));
  SystemDirectory.watchLapsDirectory(win, path.join(os.homedir(), 'Documents', 'TelemetryData'));
  SystemDirectory.watchConfigurationFileDirectory(win, path.join(os.homedir(), 'Documents', 'TelemetryData'));
  SystemDirectory.watchDriverLapDataChanges(win, path.join(os.homedir(), 'Documents', 'TelemetryData'));

}

ipcMain.handle('get-game-list', async () => {
  try {
    return await TelemetryData.getGameList();
  } catch (error) {
    console.error("Erro no manipulador 'get-game-list':", error);
    throw new Error('Erro ao buscar a lista de jogos no processo principal.');
  }
});

ipcMain.handle('get-track-list', async (event, gameName) => {
  try {
    return await TelemetryData.getTrackList(gameName);
  } catch (error) {
    console.error("Erro no manipulador 'get-track-list':", error);
    throw new Error('Erro ao buscar a dados do jogos no processo principal.');
  }
});

ipcMain.handle('get-game-data', async (event, gameName, trackName) => {
  try {    
    return await TelemetryData.getGameData(gameName, trackName);
  } catch (error) {
    console.error("Erro no manipulador 'get-game-data':", error);
    throw new Error('Erro ao buscar a dados do jogos no processo principal.');
  }
});

ipcMain.handle('get-drivers-list', async (event, gameName, trackName, parameterType) => {
  try {
    return await TelemetryData.getDriversList(gameName, trackName, parameterType);
  } catch (error) {
    console.error("Erro no manipulador 'get-drivers-list':", error);
    throw new Error('Erro ao buscar a dados do jogos no processo principal.');
  }
});

ipcMain.handle('get-laps-list', async (event, gameName, trackName, parameterType, driver) => {
  try {
    return await TelemetryData.getLapsAvailable(gameName, trackName, parameterType, driver);
  } catch (error) {
    console.error("Erro no manipulador 'get-laps-list':", error);
    throw new Error('Erro ao buscar a dados do jogos no processo principal.');
  }
});

ipcMain.handle('get-lap-data', async (event, gameName, trackname, parameterType, driverName, lapDate, lapSessionId, lapNum, filePosition) => {
  try {
    return await TelemetryData.getDriverLapData(gameName, trackname, parameterType, driverName, lapDate, lapSessionId, lapNum, filePosition);
  } catch (error) {
    console.error("Erro no manipulador 'get-lap-data':", error);
    throw new Error('Erro ao buscar a dados do jogos no processo principal.');
  }
});

ipcMain.handle('get-structure-config', async (event, gameName) => {
  try {
    return await TelemetryData.parseStructureFile(gameName);
  } catch (error) {
    console.error("Erro no manipulador 'get-structure-config':", error);
    throw new Error('Erro ao buscar a dados do jogos no processo principal.');
  }
});

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
