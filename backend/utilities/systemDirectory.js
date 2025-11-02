const chokidar = require('chokidar');
const readline = require('readline');

class SystemDirectory {
  static watchGamesDirectory(win, directory) {
    const watcher = chokidar.watch(directory, 
      { 
        persistent: true,
        ignoreInitial: true, 
        depth: 0 
      }
    );

    watcher.on('addDir', (path, stats) => {
      win.webContents.send('telemetry-dir-added', path);
    })
    watcher.on('unlinkDir', (path, stats) => {
      win.webContents.send('telemetry-dir-removed', path);
    })
  }

  static watchTracksDirectory(win, directory) {
    const watcher = chokidar.watch(directory, 
      { 
        persistent: true,
        ignoreInitial: true, 
        depth: 1 
      }
    );

    watcher.on('addDir', (path, stats) => {
      win.webContents.send('track-dir-added', path);
    })
    watcher.on('unlinkDir', (path, stats) => {
      win.webContents.send('track-dir-removed', path);
    })
  }

  static watchDriversDirectory(win, directory) {
    const watcher = chokidar.watch(directory, 
      { 
        persistent: true,
        ignoreInitial: true, 
        depth: 2 
      }
    );

    watcher.on('addDir', (path, stats) => {
      win.webContents.send('driver-dir-added', path);
    })
    watcher.on('unlinkDir', (path, stats) => {
      win.webContents.send('driver-dir-removed', path);
    })
  }

  static watchLapsDirectory(win, directory) {
    const watcher = chokidar.watch(directory, 
      { 
        persistent: true,
        ignoreInitial: true, 
        depth: 3 
      }
    );

    watcher.on('addDir', (path, stats) => {
      win.webContents.send('lap-dir-added', path);
    })
    watcher.on('unlinkDir', (path, stats) => {
      win.webContents.send('lap-dir-removed', path);
    })
  }

  static watchConfigurationFileDirectory(win, directory) {
    const watcher = chokidar.watch(`${directory}/*/.structure`, 
      { 
        persistent: true,
        ignoreInitial: true, 
        depth: 1 
      }
    );

    watcher.on('all', (stats, path) => {
      win.webContents.send('config-file-change', path);
    });

  }
  
  static watchDriverLapDataChanges(win, directory) {
    const watcher = chokidar.watch(`${directory}/*/*/*/*/*/data.csv`, 
      { 
        persistent: true,
        ignoreInitial: true, 
        depth: 6 
      }
    );

    watcher.on('all', (stats, path) => {
      win.webContents.send('driver-lap-data-file-change', path);
    });
  }
}

module.exports = { SystemDirectory };
