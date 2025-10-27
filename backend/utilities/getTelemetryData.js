const os = require('os');
const path = require('path');
const fs = require('fs');

class TelemetryData {
  
  static getGameList() {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData');
  
    if (!fs.existsSync(BASE_DIR)) return [];
    return fs.readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  static getTrackList(gameName) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName);

    if (!fs.existsSync(BASE_DIR)) return [];
    return fs.readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  static getGameData(gameName, trackName) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName, trackName);
  
    if (!fs.existsSync(BASE_DIR)) return [];
    return fs.readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  static getDriversList(gameName, trackName, parameterType) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName, trackName, parameterType);
  
    if (!fs.existsSync(BASE_DIR)) return [];
    return fs.readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }
  
  static getLapsAvailable(gameName, trackName, parameterType, driver) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName, trackName, parameterType, driver);

    if (!fs.existsSync(BASE_DIR)) return [];

    return fs
      .readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(entry => 
        entry.isFile() && /^(\d{8})_lap(\d+)\.csv$/i.test(entry.name)
      )
      .map(entry => {
        const match = entry.name.match(/_lap(\d+)\.csv$/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(num => num !== null)
      .sort((a, b) => a - b);
  }
  
  static getLapData(gameName, trackName, parameterType, driver, lapNumber) {
    const BASE_DIR = path.join(
      os.homedir(),
      'Documents',
      'TelemetryData',
      gameName,
      trackName,
      parameterType,
      driver
    );

    const fileName = fs
      .readdirSync(BASE_DIR, { withFileTypes: true })
      .find(
        entry =>
          entry.isFile() &&
          new RegExp(`.*_lap${lapNumber}\\.csv$`, 'i').test(entry.name)
      )?.name;
    
    if (!fileName) {
      console.warn(`Lap ${lapNumber} file not found for driver ${driver}`);
      return null;
    }

    const filePath = path.join(BASE_DIR, fileName);

    let lastSize = 0;
    if (fs.existsSync(filePath)) {
      lastSize = fs.statSync(filePath).size;
      const initialContent = fs.readFileSync(filePath, 'utf8');
      const rows = initialContent
        .trim()
        .split('\n')
        .map(line =>
          line
            .split(';')
            .map(value => value.trim().replace(',', '.'))
            .filter(value => !isNaN(Number(value)))
            .map(Number)
        );

      return rows;
    }    
  }

  static parseStructureFile(gameName) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName, '.structure');
    if (!fs.existsSync(BASE_DIR)) return [];
    
    const content = fs.readFileSync(BASE_DIR, 'utf-8');
    const lines = content.split(/\r?\n/);
    const config = {};
    let currentSection = null;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        config[currentSection] = [];
      } else if (currentSection) {
        config[currentSection].push({
          key: line.split('=')[0],
          title:line.split('=')[1].split(',')[0],
          position:line.split('=')[1].split(',')[1]
        });
      }
    }

    return config;
  }
}

module.exports = { TelemetryData };
