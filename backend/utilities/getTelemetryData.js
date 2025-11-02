const os = require('os');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

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

  static getDriversList(gameName, trackName) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName, trackName);
  
    if (!fs.existsSync(BASE_DIR)) return [];
    return fs.readdirSync(BASE_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  static getLapsAvailable(gameName, trackName, driverName) {
    const BASE_DIR = path.join(os.homedir(), 'Documents', 'TelemetryData', gameName, trackName, driverName);
  
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
  
  static async getDriverLapData(gameName, trackName, parameterType, driverName, lapDate, lapSessionId, lapNum, filePosition = undefined) {
      const folderReference = `${lapDate}_${lapSessionId}_lap${lapNum}`;
      const BASE_DIR = path.join(
          os.homedir(),
          'Documents',
          'TelemetryData',
          gameName,
          trackName,
          driverName,
          folderReference,
          parameterType,
          'data.csv'
      );

      const lapData = [];

      const handleFileLine = (line) => {
          return line.split(';')
                    .map(value => value.trim().replace(',', '.'))
                    .filter(value => !isNaN(Number(value)))
                    .map(Number);
      }

      let endFilePosition = 0;

      if (fs.existsSync(BASE_DIR)) {
          const currentSize = fs.statSync(BASE_DIR).size;
          endFilePosition = currentSize;

          if (filePosition !== undefined && currentSize > filePosition) {
              await new Promise((resolve, reject) => {
                  const stream = fs.createReadStream(BASE_DIR, {
                      start: filePosition,
                      end: currentSize
                  });

                  const rl = readline.createInterface({ input: stream });

                  rl.on('line', (line) => {
                      lapData.push(handleFileLine(line));
                  });

                  rl.on('close', resolve);
                  rl.on('error', reject);
              });
          } else if (filePosition === undefined) {
              const content = fs.readFileSync(BASE_DIR, 'utf-8');
              const lines = content.split(/\r?\n/);
              lines.forEach(line => lapData.push(handleFileLine(line)));
          }
      }

      return {
          lapData,
          endFilePosition
      };
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
