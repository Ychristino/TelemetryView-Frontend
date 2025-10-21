import React from 'react';
import { FileOutlined } from '@ant-design/icons';
import { toTitleCase } from '../utilities/dataFormat';

const fetchGameData = async (gameName, trackName) => {
    try {
        const dataList = await window.telemetryData.getGameData(gameName, trackName) || [];
        if (!Array.isArray(dataList) || dataList.length === 0) return undefined;

        return dataList.map((name, index) => ({
            key: `${gameName}-${trackName}-${name}`,
            label: toTitleCase(name),
        }));
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return undefined;
    }
};

const fetchTracks = async (gameName) => {
    try {
        const trackList = await window.telemetryData.getTrackList(gameName);
        if (!Array.isArray(trackList) || trackList.length === 0) return undefined;

        const menuItems = await Promise.all(
            trackList.map(async (trackName, index) => {
                const children = await fetchGameData(gameName, trackName);
                const item = {
                    key: `${gameName}-${trackName}`,
                    label: toTitleCase(trackName),
                    ...(children !== undefined ? { children } : {})
                };

                return item;
            })
        );

        return menuItems;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
}

export const fetchGames = async () => {
    try {
        const gameList = await window.telemetryData.getGameList();

        const menuItems = await Promise.all(
            gameList.map(async (name, index) => {
                const children = await fetchTracks(name);
                const item = {
                    key: `${name}`,
                    label: toTitleCase(name),
                    icon: <FileOutlined />,
                    ...(children !== undefined ? { children } : {})
                };

                return item;
            })
        );

        return menuItems;
    } catch (err) {
        console.log(`Error fetching game data: [${err}]`);
        return [];
    }
};

export const fetchDrivers = async (gameName, trackName, parameterType) => {
    try {
        const driversList = await window.telemetryData.getDriversList(gameName, trackName, parameterType);

        const items = await Promise.all(
            driversList.map(async (name, index) => {
                const item = {
                    key: `${index}`,
                    label: toTitleCase(name),
                };

                return item;
            })
        );

        return items;
    } catch (err) {
        console.log(`Error fetching drivers data: [${err}]`);
        return [];
    }
};

export const fetchLapsAvailable = async (gameName, trackName, parameterType, driver) => {
    try {
        const lapsList = await window.telemetryData.getLapsAvailable(gameName, trackName, parameterType, driver);
        const items = await Promise.all(
            lapsList.map(async (lap, index) => {
                const item = {
                    key: `${lap}`,
                    label: lap,
                };
                return item;
            })
        );

        return items;
    } catch (err) {
        console.log(`Error fetching lap data: [${err}]`);
        return [];
    }
};

export const fetchLapData = async (gameName, trackName, parameterType, driver, lap) => {
    try {
        const lapData = await window.telemetryData.getLapData(gameName, trackName, parameterType, driver, lap);
        return lapData;
    } catch (err) {
        console.log(`Error fetching lap data: [${err}]`);
        return [];
    }
};

export const fetchStructureDataConfiguration = async (gameName) => {
  try {
    const response = await window.telemetryData.parseStructureFile(gameName);
    return response;
  } catch (err) {
    console.error(`Error fetching structure data: [${err}]`);
    return [];
  }
};
