import React, { useState, useRef, useEffect } from 'react';
import TelemetryLineChart from './telemetryLineChart';
import { OverlappedLineChartStyle } from '../styles/telemetryChart';

const OverlappedCharts = ({data, colorSchema, activeKey}) => {
  const [adjustedData, setAdjustedData] = useState({});
  
  const chartState = useRef({ driverList: [] });

  const normalizeData = (data) => {
    if (!hasData(data)) return [];

    const ID_LIST = new Set();
    chartState.current.driverList = new Set();

    data.forEach(param => {
      param.data.forEach(d => {
        ID_LIST.add(d.id);
        Object.keys(d).forEach(k => {
          if (k !== 'id') chartState.current.driverList.add(k);
        });
      });
    });

    const newData = {};

    data.forEach(param => {
      if (!newData[param.parameter]) newData[param.parameter] = [];

      ID_LIST.forEach(id => {
        const idData = param.data.find(e => e.id === id) || { id };
        chartState.current.driverList.forEach(d => {
          if (!Object.prototype.hasOwnProperty.call(idData, d)) {
            idData[d] = undefined;
          }
        });

        newData[param.parameter].push({ ...idData });
      });
    });
    setAdjustedData(newData);
  };

  const hasData = (item) => {
    return (
      item &&
      typeof item === 'object'    &&
      Array.isArray(item)         &&
      item.length > 0             &&
      Array.isArray(item[0].data) &&
      item[0].data.length > 0
    );
  };

  useEffect(()=> {
    normalizeData(data)
  }, [data])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '80vh',
      }}
    >
      
      {adjustedData ? Object.keys(adjustedData).map((el, idx) => (
        <React.Fragment key={el}>
          {idx === 0 && (
            <TelemetryLineChart
              data={adjustedData[el]}
              xKey="id"
              yKeys={[...chartState.current.driverList]}
              colors={['#8884d8', '#82ca9d']}
              style={OverlappedLineChartStyle}
              allowRedimension={false}
              showYLabel={false}
              showXLabel={true}
              hidePlot={true}
            />
          )}

          <TelemetryLineChart
            data={adjustedData[el]}
            xKey="id"
            yKeys={[...chartState.current.driverList]}
            colors={[...chartState.current.driverList].map(driver => colorSchema[driver] || '#000')}
            style={OverlappedLineChartStyle}
            allowRedimension={idx === activeKey}
            showYLabel={idx === activeKey}
            showXLabel={false}
          />
        </React.Fragment>
      )) : <></>}
    </div>
  );
};

export default OverlappedCharts;
