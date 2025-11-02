import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Flex, message } from 'antd';
import TelemetryDataList from "./telemetryDataList";
import { DriverSelector } from './driverSelector';
import { fetchDrivers, fetchStructureDataConfiguration, fetchLapsAvailable, fetchLapData } from '../../services/gameData';
import { leftColumnStyle, rightColumnStyle } from '../../styles/workArea';
import OverlappedCharts from './overlappedCharts';

export const WorkArea = ({ parameterData, interval = 5000 }) => {
    const [selectedParameterType, setSelectedParameterType] = useState([]);
    const [driversList, setDriversList] = useState([]);
    const [dataConfigurationParameters, setDataConfigurationParameters] = useState([]);
    const [allLapsAvailable, setAllLapsAvailable] = useState({});
    const [currentActiveChartKey, setCurrentActiveChartKey] = useState(0);

    const selectionState = useRef({ gameName: undefined, trackName: undefined, parameterType: undefined });

    const getConfiguration = useCallback(async (gameName, parameterType) => {
        try {
            const response = await fetchStructureDataConfiguration(gameName);
            setDataConfigurationParameters(prev => {
                const newConfig = response[parameterType] || [];
                if (JSON.stringify(prev) !== JSON.stringify(newConfig)) {
                    return newConfig;
                }
                return prev;
            });
        } catch (err) {
            console.error('Error during configuration items request!', err);
        }
    }, []);

    const getDriversList = useCallback(async (gameName, trackName, parameterType) => {
        try {
            const response = await fetchDrivers(gameName, trackName, parameterType);
            setDriversList(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(response)) {
                    return response;
                }
                return prev;
            });
        } catch (err) {
            console.error('Error during drivers items request!', err);
        }
    }, []);

    const getLapsAvailable = useCallback(async (gameName, trackName, parameterType, drivers) => {
        if (!drivers || drivers.length === 0) return;
        
        const lapsData = {};
        for (const driver of drivers) {
            try {
                const response = await fetchLapsAvailable(gameName, trackName, parameterType, driver.label);
                lapsData[driver.key] = response || [];
            } catch (err) {
                console.error('Erro ao buscar voltas disponíveis para', driver.label, err);
            }
        }
        setAllLapsAvailable(lapsData);
    }, []);

    const getLapData = useCallback(async (gameName, trackName, parameterType, driverName, lapNumber) => {
        try {
            const response = await fetchLapData(gameName, trackName, parameterType, driverName, lapNumber);
            return response || [];
        } catch (err) {
            console.error('Error during fetching lap data!', err);
            return [];
        }
    }, []);

    useEffect(() => {
        if (parameterData && parameterData.split('-').length >= 3) {
            const [gameName, trackName, parameterType] = parameterData.split('-');
            selectionState.current = { gameName, trackName, parameterType };

            const fetchAllData = async () => {
                await getDriversList(gameName, trackName, parameterType);
                await getConfiguration(gameName, parameterType);
            };

            const intervalId = setInterval(fetchAllData, interval);
            fetchAllData();

            return () => clearInterval(intervalId);
        }
    }, [parameterData, interval, getDriversList, getConfiguration]);

    useEffect(() => {
        const { gameName, trackName, parameterType } = selectionState.current;
        if (gameName && trackName && parameterType && driversList.length > 0) {
            getLapsAvailable(gameName, trackName, parameterType, driversList);
        }
    }, [driversList, getLapsAvailable]);

    const handleAddParameterType = useCallback((record) => {
        if (selectedParameterType.some(item => item.key === record.key)) {
            message.warning('Este item já foi adicionado.');
            return;
        }
        setSelectedParameterType(prev => [...prev, { ...record, people: [] }]);
    }, [selectedParameterType]);

    const handleRemoveParameterType = useCallback((record) => {
        setSelectedParameterType(prev => prev.filter(item => item.key !== record.key));
    }, []);

    const handleCharSelectionParameter = useCallback((rowData, rowIndex) => {
        setCurrentActiveChartKey(rowIndex);
    }, []);

    const { chartData, colorSchema } = useMemo(() => {
        if (!selectedParameterType || !Array.isArray(selectedParameterType)) {
            return { chartData: [], colorSchema: {} };
        }

        const newData = [];
        const newColorSchema = {};

        selectedParameterType.forEach(param => {
            let paramGroup = newData.find(item => item.parameter === param.key);
            if (!paramGroup) {
                paramGroup = { parameter: param.key, data: [] };
                newData.push(paramGroup);
            }
            param.people.forEach(driver => {
                driver.laps.forEach(lap => {
                    if (Array.isArray(lap.data)) {
                        lap.data.forEach(dataPoint => {
                            const dataPointId = `${dataPoint}-${lap.number}`; 
                            let idEntry = paramGroup.data.find(f => f.id === dataPointId);
                            if (!idEntry) {
                                idEntry = { id: dataPointId };
                                paramGroup.data.push(idEntry);
                            }
                            idEntry[`${driver.name}_${param.key}_${lap.number}`] = dataPoint[parseInt(param.position)];
                        });
                    }
                    newColorSchema[`${driver.name}_${param.key}_${lap.number}`] = lap.color;
                });
            });
        });

        newData.forEach(param => {
            param.data.sort((a, b) => {
                // A ordenação também precisa ser ajustada para a nova chave
                const idA = parseInt(a.id.split('-')[0]);
                const idB = parseInt(b.id.split('-')[0]);
                return idA - idB;
            });
        });

        return { chartData: newData, colorSchema: newColorSchema };
    }, [selectedParameterType]);

    const LeftListColumns = [
        {
            title: 'Nome',
            dataIndex: 'title',
            key: 'title',
            align: 'left',
            render: text => <div style={{ cursor: 'pointer', userSelect: 'none' }}>{text}</div>,
        },
    ];

    const RightListColumns = [
        {
            title: 'Nome',
            dataIndex: 'title',
            key: 'title',
            align: 'center',
            render: text => <div style={{ cursor: 'pointer', userSelect: 'none' }}>{text}</div>,
        },
        {
            title: 'Pilotos',
            dataIndex: 'people',
            key: 'people',
            align: 'left',
            render: (_, record) => (
                <DriverSelector
                    gameName={selectionState.current.gameName}
                    trackName={selectionState.current.trackName}
                    parameterType={selectionState.current.parameterType}
                    record={record}
                    driverList={driversList}
                    lapsAvailable={allLapsAvailable}
                    getLapData={getLapData}
                    onChange={(itemKey, updatedDriver) => {
                        setSelectedParameterType(prev => prev.map(item =>
                            item.key === itemKey ? { ...item, people: updatedDriver } : item
                        ));
                    }}
                />
            ),
        },
    ];

    return (
        <Flex justify='space-between' gap={16}>
            <TelemetryDataList
                title="Parâmetros Disponíveis"
                columns={LeftListColumns}
                data={dataConfigurationParameters.filter(item => !item.key.startsWith('__') || !item.title.startsWith('__'))}
                onDoubleClickHandler={handleAddParameterType}
                style={leftColumnStyle}
            />

            <OverlappedCharts
                data={chartData}
                activeKey={currentActiveChartKey}
                colorSchema={colorSchema}
            />

            <TelemetryDataList
                title="Itens Selecionados"
                columns={RightListColumns}
                data={selectedParameterType}
                onDoubleClickHandler={handleRemoveParameterType}
                onClickHandler={handleCharSelectionParameter}
                style={rightColumnStyle}
            />
        </Flex>
    );
};
