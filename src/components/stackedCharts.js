import React, { useState } from 'react';
import TelemetryLineChart from './telemetryLineChart';

const StackedCharts = ({ data, xKey, yKeysList, colorsList, titles }) => {
  // Cada gráfico terá sua altura individual
  const [heights, setHeights] = useState(yKeysList.map(() => 200)); // altura inicial 200px

  const handleHeightChange = (index, newHeight) => {
    setHeights(prev => prev.map((h, i) => (i === index ? newHeight : h)));
  };

  return (
    <div style={{ width: '100%' }}>
      {yKeysList.map((yKeys, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <TelemetryLineChart
            data={data}
            xKey={xKey}
            yKeys={yKeys}
            colors={colorsList[idx]}
            title={titles[idx]}
            height={heights[idx]}
            minHeight={100}
            maxHeight={500}
            onHeightChange={(h) => handleHeightChange(idx, h)}
          />
        </div>
      ))}
    </div>
  );
};

export default StackedCharts;
