export const fetchGames = async () => {
    try {
        const gameList = await window.telemetryData.getGameList();
        return gameList;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const fetchTracks = async (gameName) => {
    try {
        const trackList = await window.telemetryData.getTrackList(gameName);
        return trackList;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const fetchDrivers = async (gameName, trackName) => {
    try {
        const driverList = await window.telemetryData.getDriversList(gameName, trackName);
        return driverList;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const fetchLaps = async (gameName, trackName, driverName) => {
    try {
        const lapList = await window.telemetryData.getLapsAvailable(gameName, trackName, driverName);
        return lapList;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const fetchConfigurationFile = async (gameName) => {
    try {
        const parameterTypeList = await window.telemetryData.parseStructureFile(gameName);
        return parameterTypeList;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const fetchDriverLapData = async (gameName, trackname, parameterType, driverName, lapDate, lapSessionId, lapNum, endFilePosition) => {
    try {
        const driverLapData = await window.telemetryData.getDriverLapData(gameName, trackname, parameterType, driverName, lapDate, lapSessionId, lapNum, endFilePosition);
        return driverLapData;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const getGameNameFromPath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/');

    const telemetryIndex = parts.indexOf('TelemetryData');
    if (telemetryIndex >= 0 && parts.length > telemetryIndex + 1) {
        return parts[telemetryIndex + 1];
    }

    return '';
}

export const getTrackNameFromPath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/');

    const telemetryIndex = parts.indexOf('TelemetryData');
    if (telemetryIndex >= 0 && parts.length > telemetryIndex + 2) {
        return parts[telemetryIndex + 2];
    }

    return '';
}

export const getDriverNameFromPath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/');

    const telemetryIndex = parts.indexOf('TelemetryData');
    if (telemetryIndex >= 0 && parts.length > telemetryIndex + 2) {
        return parts[telemetryIndex + 3];
    }

    return '';
}

export const getLapIdentifierFromPath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/');

    const telemetryIndex = parts.indexOf('TelemetryData');
    if (telemetryIndex >= 0 && parts.length > telemetryIndex + 2) {
        return parts[telemetryIndex + 4];
    }

    return '';
}

export const getParameterTypeFromPath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/');

    const telemetryIndex = parts.indexOf('TelemetryData');
    if (telemetryIndex >= 0 && parts.length > telemetryIndex + 2) {
        return parts[telemetryIndex + 5];
    }

    return '';
}

export const getLapNumberFromPath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';

    const normalizedPath = filePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/');

    const telemetryIndex = parts.indexOf('TelemetryData');
    if (telemetryIndex >= 0 && parts.length > telemetryIndex + 2) {
        return parts[telemetryIndex + 4];
    }

    return '';
}

export const getLapDate = (filename) => {
  if (!filename) return '';
  return filename.split('_')[0];
}

export const getLapSessionId = (filename) => {
  if (!filename) return '';
  return filename.split('_')[1];
}

export const getLapNumber = (filename) => {
  if (!filename) return '';
  const lapInfo = filename.split('_')[2];
  const match = lapInfo.match(/lap(\d+)/i);
  return match[1];
}

export const formatLapDate = (dateString) => {
  if (!dateString) return '';

  const year = dateString.substring(0,4);
  const month = dateString.substring(4,6);
  const day = dateString.substring(6,8);
  return new Date(year, month - 1, day).toLocaleDateString();
}

export const formatLapName = (lapNumber) => {
  if (!lapNumber) return '';

  const match = lapNumber.match(/(\d+)/i);
  if (!match) return 'Lap';

  return `Lap ${match[1]}`;
};
