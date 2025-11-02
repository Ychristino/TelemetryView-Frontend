import { Cascader, Space } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { convertToTitleCase } from "../../utilities/dataFormat";
import { fetchDrivers, fetchLaps, formatLapDate, formatLapName, getDriverNameFromPath, getGameNameFromPath, getLapDate, getLapNumber, getLapNumberFromPath, getLapSessionId, getTrackNameFromPath } from "../../services/gameService";
import { UserOutlined } from "@ant-design/icons";

export const DriverSelector = ({gameName, trackName, onChange, parametersSelected, isCollapsed}) => {
    const [selectOptionList, setSelectOptionList] = useState([]);
    const [currentValue, setCurrentValue] = useState(null);

    const updateDriversAvailable = async (gameName, trackName) => {
        const driversResponse = await fetchDrivers(gameName, trackName);

        const optionList = await Promise.all(
            driversResponse.map(async (driverName) => {
                const lapsResponse = await fetchLaps(gameName, trackName, driverName);
                return createDriverItem(driverName, lapsResponse);
            })
        );

        setSelectOptionList(optionList);
    };

    const createDriverItem = (driverName, lapsList) => {
        return {
            value: driverName,
            label: convertToTitleCase(driverName),
            children: createLapItem(lapsList)
        }
    }
    const createLapItem = (lapsList) => {
        return lapsList?.map(lap=>{
            const lapDate = getLapDate(lap);
            const lapSessionId = getLapSessionId(lap);
            const lapNum = getLapNumber(lap);

            return {
                value: `${lapDate}${lapSessionId}${lapNum}`,
                label: `${formatLapName(lapNum)} - ${formatLapDate(lapDate)}`,
                lapDate: lapDate,
                lapSessionId: lapSessionId,
                lapNum: lapNum,
            }
        })
    }

    const handleAddDriver = useCallback((driverPath) => {
        const changedTrackGame = getGameNameFromPath(driverPath);
        const changedTrackName = getTrackNameFromPath(driverPath);
        const changedDriverName = getDriverNameFromPath(driverPath)
        if (changedTrackGame.toLowerCase() === gameName.toLowerCase() && changedTrackName.toLowerCase() === trackName.toLowerCase()) {
            fetchLaps(gameName, trackName, changedDriverName)
            .then(response=>{
                console.log(response)
                setSelectOptionList(prevDrivers => [...prevDrivers, createDriverItem(changedDriverName, response)]);
            });
        }
    }, [gameName, trackName]);

    const handleAddLap = useCallback((lapPath) => {
        const changedTrackGame = getGameNameFromPath(lapPath);
        const changedTrackName = getTrackNameFromPath(lapPath);
        const changedDriverName = getDriverNameFromPath(lapPath);
        if (changedTrackGame.toLowerCase() === gameName.toLowerCase() && changedTrackName.toLowerCase() === trackName.toLowerCase()) {
            fetchLaps(gameName, trackName, changedDriverName).then((response) => {
                setSelectOptionList((prevDrivers) =>
                    prevDrivers.map((driver) => {
                        if (driver.value === changedDriverName) {
                            const existingLapValues = driver.children?.map(c => c.value) || [];
                            const newLaps = createLapItem(response).filter(lap => !existingLapValues.includes(lap.value));
                            return {
                                ...driver,
                                children: [...(driver.children || []), ...newLaps]
                            };
                        }
                        return driver;
                    })
                );
            });
        }
    }, [gameName, trackName]);

    const handleRemoveDriver = useCallback((driverPath) => {
        const changedTrackGame = getGameNameFromPath(driverPath);
        const changedTrackName = getTrackNameFromPath(driverPath);
        const changedDriverName = getDriverNameFromPath(driverPath)
        if (changedTrackGame.toLowerCase() === gameName.toLowerCase() && changedTrackName.toLowerCase() === trackName.toLowerCase()) {
            setSelectOptionList(prevDrivers => 
                prevDrivers.filter(optionItem => optionItem.value !== changedDriverName)
            );
        }
    }, [gameName, trackName]);

    const handleRemoveLap = useCallback((lapPath) => {
        const changedTrackGame = getGameNameFromPath(lapPath);
        const changedTrackName = getTrackNameFromPath(lapPath);
        const changedDriverName = getDriverNameFromPath(lapPath);
        const changedLapNumber = getLapNumberFromPath(lapPath)
        const lapValueToRemove = `${getLapDate(changedLapNumber)}${getLapSessionId(changedLapNumber)}${getLapNumber(changedLapNumber)}`;

        if (changedTrackGame.toLowerCase() === gameName.toLowerCase() && changedTrackName.toLowerCase() === trackName.toLowerCase()) {
            setSelectOptionList((prevDrivers) =>
                prevDrivers.map((driver) => {
                    if (driver.value === changedDriverName) {
                        return {
                            ...driver,
                            children: driver.children?.filter((lap) => lap.value !== lapValueToRemove) || []
                        };
                    }
                    return driver;
                })
            );
        }
    }, [gameName, trackName]);

    const handleSelect = (value, selectedOptions) => {
        if (!selectedOptions || selectedOptions.length < 2) return;

        const driver = selectedOptions[0];
        const lap = selectedOptions[1];
        const lapValue = lap.value;

        onChange?.({
            driverName: driver.value,
            lapDate: lap.lapDate,
            lapSessionId: lap.lapSessionId,
            lapNum: lap.lapNum
        });

        setCurrentValue(null);
    };
  
    useEffect(() => {
        if (gameName && trackName) {
            updateDriversAvailable(gameName, trackName);

            const removeDriverAddListener = window.telemetryData.onDriverAdded(handleAddDriver);
            const removeDriverRmvListener = window.telemetryData.onDriverRemoved(handleRemoveDriver);
            const removeLapAddListener = window.telemetryData.onLapAdded(handleAddLap);
            const removeLapRmvListener = window.telemetryData.onLapRemoved(handleRemoveLap);

            return () => {
                removeDriverAddListener();
                removeDriverRmvListener();
                removeLapAddListener();
                removeLapRmvListener();
            };
        }
    }, [gameName, trackName, handleAddDriver, handleRemoveDriver, handleAddLap, handleRemoveLap]);
    
    const optionsWithDisabled = useMemo(() => {
        return selectOptionList.map(driver => ({
            ...driver,
            children: (driver.children || []).map(lap => {
                const isDisabled = parametersSelected?.some(param =>
                    param.driversList?.some(data =>
                        data.driverName === driver.value &&
                        data.lapDate === lap.lapDate &&
                        data.lapSessionId === lap.lapSessionId &&
                        data.lapNum === lap.lapNum
                    )
                );

                return {
                    ...lap,
                    disabled: isDisabled
                };
            })
        }));
    }, [selectOptionList, parametersSelected]);


    return (
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: '10px' }}>
            <UserOutlined style={{ fontSize: 24, color: "#666" }} />
            {!isCollapsed
            ? <Cascader
                options={optionsWithDisabled}
                placeholder="Select Driver / Lap"
                style={{ width: "100%" }}
                onChange={handleSelect}
                value={currentValue}
            />
            :<></>
            }

        </div>
    );
};