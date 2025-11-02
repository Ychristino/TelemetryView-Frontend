// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// expõe a API para o processo de renderização
contextBridge.exposeInMainWorld('telemetryData', {
  getGameList: () => ipcRenderer.invoke('get-game-list'),
  getTrackList: (gameName) => ipcRenderer.invoke('get-track-list', gameName),
  getGameData: (gameName, trackName) => ipcRenderer.invoke('get-game-data', gameName, trackName),
  getDriversList: (gameName, trackName, parameterType) => ipcRenderer.invoke('get-drivers-list', gameName, trackName, parameterType),
  getLapsAvailable: (gameName, trackName, parameterType, driver) => ipcRenderer.invoke('get-laps-list', gameName, trackName, parameterType, driver),
  getDriverLapData: (gameName, trackname, parameterType, driverName, lapDate, lapSessionId, lapNum, filePosition) => ipcRenderer.invoke('get-lap-data', gameName, trackname, parameterType, driverName, lapDate, lapSessionId, lapNum, filePosition),
  parseStructureFile: (gameName) => ipcRenderer.invoke('get-structure-config', gameName),

  onGameAdded: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('telemetry-dir-added', subscription);
    return () => {
      ipcRenderer.removeListener('telemetry-dir-added', subscription);
    };
  },
  
  onGameRemoved: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('telemetry-dir-removed', subscription);
    return () => {
      ipcRenderer.removeListener('telemetry-dir-removed', subscription);
    };
  },

  onTrackAdded: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('track-dir-added', subscription);
    return () => {
      ipcRenderer.removeListener('track-dir-added', subscription);
    };
  },
  
  onTrackRemoved: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('track-dir-removed', subscription);
    return () => {
      ipcRenderer.removeListener('track-dir-removed', subscription);
    };
  },

  onDriverAdded: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('driver-dir-added', subscription);
    return () => {
      ipcRenderer.removeListener('driver-dir-added', subscription);
    };
  },

  onDriverRemoved: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('driver-dir-removed', subscription);
    return () => {
      ipcRenderer.removeListener('driver-dir-removed', subscription);
    };
  },

  onLapAdded: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('lap-dir-added', subscription);
    return () => {
      ipcRenderer.removeListener('lap-dir-added', subscription);
    };
  },

  onLapRemoved: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('lap-dir-removed', subscription);
    return () => {
      ipcRenderer.removeListener('lap-dir-removed', subscription);
    };
  },

  onConfigurationFileChange: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('config-file-change', subscription);
    return () => {
      ipcRenderer.removeListener('config-file-change', subscription);
    };
  },

  onDriverLapDataFileChange: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('driver-lap-data-file-change', subscription);
    return () => {
      ipcRenderer.removeListener('driver-lap-data-file-change', subscription);
    };
  },
});
