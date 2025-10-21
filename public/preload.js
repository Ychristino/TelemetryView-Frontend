const { contextBridge, ipcRenderer } = require('electron');

// expõe a API para o processo de renderização
contextBridge.exposeInMainWorld('telemetryData', {
  getGameList: () => ipcRenderer.invoke('get-game-list'),
  getTrackList: (gameName) => ipcRenderer.invoke('get-track-list', gameName),
  getGameData: (gameName, trackName) => ipcRenderer.invoke('get-game-data', gameName, trackName),
  getDriversList: (gameName, trackName, parameterType) => ipcRenderer.invoke('get-drivers-list', gameName, trackName, parameterType),
  getLapsAvailable: (gameName, trackName, parameterType, driver) => ipcRenderer.invoke('get-laps-list', gameName, trackName, parameterType, driver),
  getLapData: (gameName, trackName, parameterType, driver, lap) => ipcRenderer.invoke('get-lap-data', gameName, trackName, parameterType, driver, lap),
  onDirChange: (callback) => ipcRenderer.on('telemetry-dir-changed', callback),
  parseStructureFile: (gameName) => ipcRenderer.invoke('get-structure-config', gameName),
});