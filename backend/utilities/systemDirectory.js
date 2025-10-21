const chokidar = require('chokidar');


class SystemDirectory {
  static watchDirectory(win, directory) {
    const watcher = chokidar.watch(directory, { ignoreInitial: true, depth: 99 });

    watcher.on('all', (event, path) => {
      console.log(`Arquivo alterado: ${path}, evento: ${event}`);
      win.webContents.send('telemetry-dir-changed', { eventType: event, filename: path });
    });
  }
}

module.exports = { SystemDirectory };
