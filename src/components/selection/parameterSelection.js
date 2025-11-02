import { Space } from "antd";
import { useState } from "react";
import { TrackSelection } from "./trackSelection";
import { DriverSelector } from "./driverSelection";
import { ParameterTypeSelector } from "./parameterTypeSelection";

export const ParameterSelection = ({ 
  gameName, 
  onTrackSelect, 
  onParameterSelect, 
  onDriverSelect, 
  parametersSelected,
  isCollapsed
}) => {
  const [selectedTrack, setSelectedTrack] = useState();

  const handleTrackSelection = (trackName) => {
    setSelectedTrack(trackName);
    onTrackSelect?.(trackName);
  };

  const handleDriverSelection = (data) => {
    onDriverSelect?.(data);
  };

  const handleParameterTypeSelection = (data) => {
    onParameterSelect?.(data);
  };

  return (
    <Space 
      direction="vertical" 
      size="large" 
      style={{ display: "flex", width: "100%" }}
    >
      <TrackSelection 
        gameName={gameName}
        onChange={handleTrackSelection}
        isCollapsed={isCollapsed}
      />

      <ParameterTypeSelector 
        gameName={gameName}
        onChange={handleParameterTypeSelection}
        parametersSelected={parametersSelected}
        isCollapsed={isCollapsed}
      />

      <DriverSelector 
        gameName={gameName}
        trackName={selectedTrack}
        onChange={handleDriverSelection}
        parametersSelected={parametersSelected}
        isCollapsed={isCollapsed}
      />
    </Space>
  );
};
