import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { fetchGames } from '../services/gameService';
import { convertToTitleCase } from '../utilities/dataFormat';
import { ParameterSelection } from './selection/parameterSelection';
import { SelectedDataList } from './listData/selectedDataList';
import { getRandomColor } from '../utilities/generators';
import Sider from 'antd/es/layout/Sider';
import { OverlappedChart } from './charts/overlappedChart';

const { Header, Content } = Layout;

export const WorkArea = () => {
    const [gameListMenu, setGameListMenu] = useState([]);
    const [currentActiveMenu, setCurrentActiveMenu] = useState();
    const [currentSelectedTrack, setCurrentSelectedTrack] = useState([]);
    const [currentSelectedDrivers, setCurrentSelectedDrivers] = useState([]);
    const [currentSelectedParameters, setCurrentSelectedParameters] = useState([]);

    const [currentSelectedParameterCardKey, setCurrentSelectedParameterCardKey] = useState(0);
    const [parameterSelectionCollapsed, setParameterSelectionCollapsed] = useState(false);

    const handleMenuChange = (event) => {
        setCurrentActiveMenu(event.key)
    }

    const handleAddGame = useCallback((gameName) => {
        const newItem = createMenuItem(gameName);

        setGameListMenu((prev) => {
            const alreadyExists = prev.some((item) => item.key === newItem.key);
            if (alreadyExists) return prev;
            return [...prev, newItem];
        });
    },[]);

    const handleRemoveGame = useCallback((gameName) => {
        setGameListMenu((prev) => prev.filter((item) => item.key !== gameName));
    },[]);

    const createMenuItem = (item) => {
        return {
            key: item,
            label: convertToTitleCase(item),
        };
    }

    const updateGameList = async () => {
    try {
        const response = await fetchGames();
        const menuList = response.map(item => createMenuItem(item));
        setGameListMenu(menuList);
        if (menuList.length > 0) {
            setCurrentActiveMenu(menuList[0].key);
        }
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
    }
    };

    const handleTrackSelection = (trackSelected) => {
        setCurrentSelectedTrack(trackSelected);
    }

    const handleAddDriverSelection = (newDriver) => {
        setCurrentSelectedDrivers(prevDrivers => {
            const exists = prevDrivers.some(driver =>
                driver.driverName === newDriver.driverName &&
                driver.lapDate === newDriver.lapDate &&
                driver.lapSessionId === newDriver.lapSessionId &&
                driver.lapNum === newDriver.lapNum
            );
            if (exists) return prevDrivers;
            return [...prevDrivers, { ...newDriver, color: newDriver.color || getRandomColor() }];
        });

        setCurrentSelectedParameters(prevParams =>
            prevParams.map(param => {
                const alreadyExists = param.driversList?.some(driver =>
                    driver.driverName === newDriver.driverName &&
                    driver.lapDate === newDriver.lapDate &&
                    driver.lapSessionId === newDriver.lapSessionId &&
                    driver.lapNum === newDriver.lapNum
                );

                return {
                    ...param,
                    driversList: alreadyExists
                        ? param.driversList
                        : [...(param.driversList || []), { ...newDriver, color: newDriver.color || getRandomColor() }]
                };
            })
        );
    };

    const handleAddParameterSelection = (newParam) => {
        setCurrentSelectedParameters(prevParams => {
            const exists = prevParams.some(param =>
                param.parameterType === newParam.parameterType &&
                param.parameterItem === newParam.parameterItem
            );
            if (exists) return prevParams;

            const newParameterWithDrivers = {
                ...newParam,
                driversList: currentSelectedDrivers.map(driver => ({
                    ...driver,
                    color: driver.color || getRandomColor()
                }))
            };

            return [...prevParams, newParameterWithDrivers];
        });
        setCurrentSelectedParameterCardKey(newParam.parameterItem)
    };

    const handleDriverLapColorChange = (driverToUpdate, color) => {
        setCurrentSelectedDrivers(prevDrivers =>
            prevDrivers.map(driver => {
                if (
                    driver.driverName === driverToUpdate.driverName &&
                    driver.lapDate === driverToUpdate.lapDate &&
                    driver.sessionId === driverToUpdate.sessionId &&
                    driver.lapNum === driverToUpdate.lapNum
                ) {
                    return { ...driver, color };
                }
                return driver;
            })
        );
        setCurrentSelectedParameters(prevParams =>
            prevParams.map(param => ({
                ...param,
                driversList: param.driversList.map(driver => {
                    if (
                    param.parameterType === driverToUpdate.parameterType &&
                    param.parameterItem === driverToUpdate.parameterItem &&
                    driver.driverName === driverToUpdate.driverName &&
                    driver.lapDate === driverToUpdate.lapDate &&
                    driver.lapSessionId === driverToUpdate.lapSessionId &&
                    driver.lapNum === driverToUpdate.lapNum
                    ) {
                    return { ...driver, color };
                    }
                    return driver;
                }),
            }))
        );
    };

    const handleCardParamtersSelectedClick = (key) => {
        setCurrentSelectedParameterCardKey(key);
    }

    const handleCardParamtersRemove = (key) => {
        setCurrentSelectedParameters((prev) => 
            prev.filter((param) => param.parameterItem !== key)
        );
    };

    const handleRemoveDriver = (driverToRemove) => {
        setCurrentSelectedDrivers((prev) =>
            prev.filter(
                (driver) =>
                    driver.driverName !== driverToRemove.driverName ||
                    driver.lapDate !== driverToRemove.lapDate ||
                    driver.lapNum !== driverToRemove.lapNum ||
                    driver.lapSessionId !== driverToRemove.lapSessionId
            )
        );

        setCurrentSelectedParameters((prev) =>
            prev.map((param) => ({
                ...param,
                driversList: param.driversList?.filter(
                    (driver) =>
                        driver.driverName !== driverToRemove.driverName ||
                        driver.lapDate !== driverToRemove.lapDate ||
                        driver.lapNum !== driverToRemove.lapNum ||
                        driver.lapSessionId !== driverToRemove.lapSessionId
                ),
            }))
        );
    };

    useEffect(() => {
        updateGameList();
        const removeAddListener = window.telemetryData.onGameAdded(handleAddGame);
        const removeRemoveListener = window.telemetryData.onGameRemoved(handleRemoveGame);

        return () => {
            removeAddListener();
            removeRemoveListener();
        };
    }, []);

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center'}}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={currentActiveMenu ? [currentActiveMenu] : []}
                    items={gameListMenu}
                    style={{ flex: 1, minWidth: 0 }}
                    onClick={handleMenuChange}
                />
            </Header>

            <Layout>
                <Sider
                    width={340}
                    theme="light"
                    style={{
                        padding: '16px',
                        overflowY: 'auto',
                        boxSizing: 'border-box',
                        borderRight: '1px solid #f0f0f0',
                    }}
                    collapsible
                    collapsed={parameterSelectionCollapsed}
                    onCollapse={(value) => setParameterSelectionCollapsed(value)}
                >
                    <ParameterSelection
                        gameName={currentActiveMenu}
                        onTrackSelect={handleTrackSelection}
                        onDriverSelect={handleAddDriverSelection}
                        onParameterSelect={handleAddParameterSelection}
                        parametersSelected={currentSelectedParameters}
                        isCollapsed={parameterSelectionCollapsed}
                    />
                </Sider>

                <Content
                    style={{
                        padding: '20px',
                        overflowY: 'auto',
                        background: '#fff',
                    }}
                >
                    <OverlappedChart 
                        gameName={currentActiveMenu}
                        trackName={currentSelectedTrack}
                        parametersList={currentSelectedParameters}
                        currentActiveCard={currentSelectedParameterCardKey}
                    />
                </Content>

                <Sider
                    width={340}
                    theme="light"
                    style={{
                        padding: '16px',
                        overflowY: 'auto',
                        borderLeft: '1px solid #f0f0f0',
                    }}
                >
                    <SelectedDataList
                        parametersList={currentSelectedParameters}
                        onDriverLapColorChange={handleDriverLapColorChange}
                        handleCardClick={handleCardParamtersSelectedClick}
                        currentActiveCard={currentSelectedParameterCardKey}
                        handleCardRemove={handleCardParamtersRemove}
                        handleRemoveDriver={handleRemoveDriver}
                    />
                </Sider>
            </Layout>
        </Layout>
    );
};