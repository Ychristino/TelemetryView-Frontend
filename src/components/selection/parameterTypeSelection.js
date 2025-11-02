import { Cascader, Space } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { convertToTitleCase } from "../../utilities/dataFormat";
import { fetchConfigurationFile, getGameNameFromPath } from "../../services/gameService";
import { ProfileOutlined } from "@ant-design/icons";

export const ParameterTypeSelector = ({gameName, onChange, parametersSelected, isCollapsed}) => {
    const [selectOptionList, setSelectOptionList] = useState([]);
    const [currentValue, setCurrentValue] = useState(null);

    const updateParametersAvailable = async (gameName) => {
    const configurationFileResponse = await fetchConfigurationFile(gameName);

    const parameterTypes = Object.keys(configurationFileResponse)
        .filter(parameterTypeItem => !parameterTypeItem.startsWith("__"))
        .map(parameterTypeItem =>
        createParameterTypeItem(parameterTypeItem, configurationFileResponse[parameterTypeItem])
        );

        setSelectOptionList(parameterTypes);
    };

    const createParameterTypeItem = (parameterType, parameterInformation) => ({
        value: parameterType,
        label: convertToTitleCase(parameterType),
        children: createParameterItem(parameterInformation)
    });

    const createParameterItem = (parameterItemList) => {
        return parameterItemList
            ?.filter(parameterItem => !parameterItem.key.startsWith("__"))
                .map(parameterItem => ({
                    value: parameterItem.key,
                    label: parameterItem.title,
                    csvPosition: parseInt(parameterItem.position)
            })
        ) || [];
    };


    const handleParameterTypesFileChange = useCallback((configurationFilePath) => {
        const changedGameFolder = getGameNameFromPath(configurationFilePath);
        if (changedGameFolder.toLocaleLowerCase() === gameName.toLowerCase()){
            updateParametersAvailable(gameName);
        }
    }, [gameName]);
    
    const handleSelect = (value, selectedOptions) => {
        if (!selectedOptions || selectedOptions.length < 2) return;

        const parameterType = selectedOptions[0];
        const parameterItem = selectedOptions[1];
        const parameterValue = parameterItem.value;

        onChange?.({
            parameterType: parameterType.value,
            parameterItem: parameterValue,
            csvPosition: parameterItem.csvPosition,
        });

        setCurrentValue(null);
    };

    useEffect(() => {
        if (gameName) {
            updateParametersAvailable(gameName);

            const removeConfigurationFileChangeListener = window.telemetryData.onConfigurationFileChange(handleParameterTypesFileChange);

            return () => {
                removeConfigurationFileChangeListener();
            };
        }
    }, [gameName, handleParameterTypesFileChange]);
    
    const optionsWithDisabled = useMemo(() => {
        return selectOptionList.map(parameterType => ({
            ...parameterType,
            children: (parameterType.children || []).map(parameterItem => ({
                ...parameterItem,
                disabled: parametersSelected.find(param=> param.parameterItem === parameterItem.value)
            }))
        }));
    }, [selectOptionList, parametersSelected]);

    return (
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: '10px' }}>
            <ProfileOutlined style={{ fontSize: 24, color: "#666" }} />
            {!isCollapsed
            ? <Cascader
                options={optionsWithDisabled}
                placeholder="Select Parameters"
                style={{ width: '100%' }}
                onChange={handleSelect}
                value={currentValue}
            />
            : <></>
            }
        </div>
    );
}