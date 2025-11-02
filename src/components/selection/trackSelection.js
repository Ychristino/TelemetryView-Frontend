import { Select, Space } from "antd"
import { useCallback, useEffect, useState } from "react"
import { fetchTracks, getGameNameFromPath, getTrackNameFromPath } from "../../services/gameService";
import { convertToTitleCase } from "../../utilities/dataFormat";
import { CompassOutlined } from "@ant-design/icons";

export const TrackSelection = ({ gameName, onChange, isCollapsed }) => {
    const [selectOptionList, setSelectOptionList] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);

    const updateTracksAvailable = async (gameName) => {
        const response = await fetchTracks(gameName)
        const optionList = response.map(item => createOptionItem(item));
        setSelectOptionList(optionList);
        setSelectedTrack(null);
        onChange?.(null);
    }

    const createOptionItem = (item) => {
        return {
            value: item,
            label: convertToTitleCase(item)
        }
    }

    const handleAddTrack = useCallback((trackPath) => {
        const changedTrackGame = getGameNameFromPath(trackPath);
        const changedTrackName = getTrackNameFromPath(trackPath);
        if (changedTrackGame.toLowerCase() === gameName.toLowerCase()) {
            setSelectOptionList(prevTracks => [...prevTracks, createOptionItem(changedTrackName)]);
        }
    }, [gameName]);

    const handleRemoveTrack = useCallback((trackPath) => {
        const changedTrackGame = getGameNameFromPath(trackPath);
        const changedTrackName = getTrackNameFromPath(trackPath);
        if (changedTrackGame.toLowerCase() === gameName.toLowerCase()) {
            setSelectOptionList(prevTracks => 
                prevTracks.filter(optionItem => optionItem.value !== changedTrackName)
            );
        }
    }, [gameName]);

    useEffect(() => {
        if (gameName) {
            updateTracksAvailable(gameName);

            const removeAddListener = window.telemetryData.onTrackAdded(handleAddTrack);
            const removeRmvListener = window.telemetryData.onTrackRemoved(handleRemoveTrack);

            return () => {
                removeAddListener();
                removeRmvListener();
            };
        }
    }, [gameName, handleAddTrack, handleRemoveTrack]);

    return (
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: '10px' }}>
            <CompassOutlined style={{ fontSize: 24, color: "#666" }} />
            {!isCollapsed
            ? <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Search Track"
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={selectOptionList}
                value={selectedTrack}
                onChange={(value) => {
                    setSelectedTrack(value);
                    onChange?.(value);
                }}
            />
            : <></>
            }
        </div>
    )
}