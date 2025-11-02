import { useCallback, useEffect, useState } from "react";
import { fetchDriverLapData, getDriverNameFromPath, getGameNameFromPath, getLapDate, getLapIdentifierFromPath, getLapNumber, getLapSessionId, getParameterTypeFromPath, getTrackNameFromPath } from "../../services/gameService";
import { TelemetryLineChart } from "./lineChart";
import { UserOutlined } from "@ant-design/icons";
import { Text } from "recharts";

export const OverlappedChart = ({ gameName, trackName, parametersList, currentActiveCard }) => {
    const [driversData, setDriversData] = useState([]);
    const [chartData, setChartData] = useState([]);

    const handleChartData = useCallback((driverName, lapDate, lapSessionId, lapNumber, parameterType, lapData) => {
        setChartData(prevData => {
            const parameterConfig = parametersList.filter(p => p.parameterType === parameterType);
            if (!parameterConfig || parameterConfig.length === 0) return prevData;

            const driverIdentifier = `${driverName}_${lapDate}_${lapSessionId}_lap_${lapNumber}`;
            
            const updatedDataMap = new Map();

            prevData.forEach(item => {
                updatedDataMap.set(`${item.parameterType}_${item.parameterItem}_${item.lapMetters}`, { ...item });
            });

            parameterConfig.forEach(parameter => {
                const csvColumnIndex = parameter.csvPosition;

                lapData.forEach(frame => {
                    const lapMetters = frame[0];
                    const newValue = frame[csvColumnIndex];

                    const key = `${parameter.parameterType}_${parameter.parameterItem}_${lapMetters}`;
                    const oldEntry = updatedDataMap.get(key) || {
                        lapMetters,
                        parameterType: parameter.parameterType,
                        parameterItem: parameter.parameterItem,
                    };

                    updatedDataMap.set(key, { ...oldEntry, [driverIdentifier]: newValue });
                });
            });

            return Array.from(updatedDataMap.values()).sort((a, b) => a.lapMetters - b.lapMetters);
        });
    }, [parametersList]);

    const getInitialChartData = async (gameName, trackName, parametersList) => {
        const chartDataPromises = parametersList?.flatMap(parameter =>
            parameter.driversList?.map(async (driver) => {
                const dataExists = driversData.some(driverData =>
                    driverData.driverName === driver.driverName &&
                    driverData.lapDate === driver.lapDate &&
                    driverData.sessionId === driver.lapSessionId &&
                    driverData.lapNum === driver.lapNum &&
                    driverData.parameterType === parameter.parameterType
                );

                const data = await fetchDriverLapData(
                    gameName,
                    trackName,
                    parameter.parameterType,
                    driver.driverName,
                    driver.lapDate,
                    driver.lapSessionId,
                    driver.lapNum
                );

                handleChartData(driver.driverName,
                                driver.lapDate,
                                driver.lapSessionId,
                                driver.lapNum,
                                parameter.parameterType,
                                data.lapData
                );

                if (dataExists) {
                    return null;
                }

                return {
                    driverName: driver.driverName,
                    lapDate: driver.lapDate,
                    sessionId: driver.lapSessionId,
                    lapNum: driver.lapNum,
                    parameterType: parameter.parameterType,
                    data,
                };
            }) || []
        );

        const newChartData = (await Promise.all(chartDataPromises)).filter(Boolean);

        if (newChartData.length > 0) {
            setDriversData(prev => [...prev, ...newChartData]);
        }
        return newChartData;
    };

    const handleDriverLapData = useCallback(async (dataFilePath) => {
        const changedGameName = getGameNameFromPath(dataFilePath);
        const changedTrackName = getTrackNameFromPath(dataFilePath);
        const changedDriverName = getDriverNameFromPath(dataFilePath);
        const changedLapIdentifier = getLapIdentifierFromPath(dataFilePath);
        const changedParameterType = getParameterTypeFromPath(dataFilePath);

        const driver = driversData.find(driver =>
            driver.driverName === changedDriverName &&
            driver.lapDate === getLapDate(changedLapIdentifier) &&
            driver.sessionId === getLapSessionId(changedLapIdentifier) &&
            driver.lapNum === getLapNumber(changedLapIdentifier) &&
            driver.parameterType === changedParameterType &&
            changedGameName === gameName &&
            changedTrackName === trackName
        );

        if (changedGameName !== gameName || changedTrackName !== trackName || !driver) return;

        const newData = await fetchDriverLapData(
            changedGameName,
            changedTrackName,
            changedParameterType,
            changedDriverName,
            getLapDate(changedLapIdentifier),
            getLapSessionId(changedLapIdentifier),
            getLapNumber(changedLapIdentifier),
            driver.data.endFilePosition
        );

        setDriversData(prevDrivers =>
            prevDrivers.map(driver => {
                if (
                    driver.driverName === changedDriverName &&
                    driver.lapDate === getLapDate(changedLapIdentifier) &&
                    driver.sessionId === getLapSessionId(changedLapIdentifier) &&
                    driver.lapNum === getLapNumber(changedLapIdentifier) &&
                    driver.parameterType === changedParameterType
                ) {
                    return {
                        ...driver,
                        data: {
                            lapData: [...(driver.data.lapData || []), ...newData.lapData],
                            endFilePosition: newData.endFilePosition
                        }
                    };
                }
                return driver;
            })
        );
        handleChartData(changedDriverName,
                        getLapDate(changedLapIdentifier),
                        getLapSessionId(changedLapIdentifier),
                        getLapNumber(changedLapIdentifier),
                        changedParameterType,
                        newData.lapData
        );
    }, [driversData, gameName, trackName, handleChartData]);
    
    useEffect(() => {
        if (gameName && trackName && parametersList?.length > 0 && parametersList[0].driversList?.length > 0) {
            getInitialChartData(gameName, trackName, parametersList);

            const removeLapDataChangeListener = window.telemetryData.onDriverLapDataFileChange(handleDriverLapData);

            return () => removeLapDataChangeListener();
        }
    }, [gameName, trackName, parametersList, handleDriverLapData]);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '720px',
            }}
        >
            {parametersList?.map(parameter => {
                const filteredData = chartData?.filter(data => data.parameterItem === parameter.parameterItem);

                const driverKeys = filteredData?.length > 0 
                    ? Object.keys(filteredData[0]).filter(k => !["lapMetters", "parameterType", "parameterItem"].includes(k))
                    : [];

                const colors = driverKeys.map((driverKey, index) => {
                    const driverMatch = parameter.driversList.find(driver => {
                        const id = `${driver.driverName}_${driver.lapDate}_${driver.lapSessionId}_lap_${driver.lapNum}`;
                        return id === driverKey;
                    });
                    return driverMatch?.color || "#000";
                });

                return driverKeys?.length > 0 
                    ? (
                    <TelemetryLineChart 
                        // key={`${parameter.parameterType}_${parameter.parameterItem}`}
                        parameterItem={parameter.parameterItem}
                        data={filteredData}
                        driverIdentifiersList={driverKeys}
                        currentActiveCard={currentActiveCard}
                        colors={colors}
                    />
                    ) : (
                    <div
                        style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        }}    
                    >
                        <UserOutlined style={{ fontSize: 24, opacity: 0.6 }} />
                        <Text type="secondary">Waiting for Drivers Data</Text>
                    </div>
                    );
                })}


        </div>
  );
}