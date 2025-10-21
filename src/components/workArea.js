import React, { useEffect, useRef, useState } from 'react';
import { Flex, message } from 'antd';
import TelemetryDataList from "./telemetryDataList";
import { DriverSelector } from './driverSelector';
import { fetchDrivers, fetchStructureDataConfiguration } from '../services/gameData';
import { leftColumnStyle, rightColumnStyle } from '../styles/workArea';

import OverlappedCharts from './overlappedCharts';

export const WorkArea = ({ parameterData }) => {

  const [selectedParameter, setSelectedParameter] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [configuration, setConfiguration] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeChart, setActiveChart] = useState(0);
  const [colorSchema, setColorSchema] = useState([]);

  const selectionState = useRef({gameName: undefined, trackName: undefined, parameterType: undefined})

  useEffect(() => {
    if (parameterData != ''
    && parameterData.split('-').length >= 3  
    ){
      const dataQuery = parameterData.split('-');
      selectionState.current.gameName = dataQuery[0]; 
      selectionState.current.trackName = dataQuery[1]; 
      selectionState.current.parameterType = dataQuery[2];

      getDriversList(selectionState.current.gameName, selectionState.current.trackName, selectionState.current.parameterType);
      getConfiguration(selectionState.current.gameName, selectionState.current.parameterType)
    }
  }, [parameterData]);

  useEffect(()=> {
    getChartData();
  }, [selectedParameter]);

  const getConfiguration = (gameName, parameterType) => {
    fetchStructureDataConfiguration(gameName)
      .then(response => {
        setConfiguration(response[parameterType]);
      })
      .catch(err => {
        console.error('Error during configuration items request!', err);
      }); 
  };

  const getDriversList = (gameName, trackName, parameterType) => {
    fetchDrivers(gameName, trackName, parameterType)
      .then(response => {
          setDriversList([...response])
        })
      .catch(err => console.error('Error during drivers items request!', err));
  };

  const handleAddParameterType = (record) => {
    if (selectedParameter.some(item => item.key === record.key)) {
      message.warning('Este item já foi adicionado.');
      return;
    }
    setSelectedParameter(prev => [...prev, { ...record, people: [] }]);
  };

  const handleRemoveParameterType = (record) => {
    setSelectedParameter(prev => prev.filter(item => item.key !== record.key));
  };
  
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
          onChange={(itemKey, updatedDriver) => {
            setSelectedParameter(prev => prev.map(item =>
              item.key === itemKey ? { ...item, people: updatedDriver } : item
            ));
          }}
        />
      ),
    },
  ];
  
  const getChartData = () => {
    if (!selectedParameter || !Array.isArray(selectedParameter)) return;

    let newData = [];
    let newColorSchema = [];

    selectedParameter.forEach(param => {
      let paramGroup = newData.find(item => item.parameter === param.key);

      if (!paramGroup) {
        paramGroup = { parameter: param.key, data: [] };
        newData.push(paramGroup);
      }
      param.people.forEach(driver => {
        driver.laps.forEach(lap => {
          if (Array.isArray(lap.data)) {
            const identifierList = lap.data
              .filter(item => Array.isArray(item) && item.length > 0)
              .map(item => ({
                id: item[0],
                value: item[parseInt(param.position)],
              }));

            identifierList.forEach(({ id, value }) => {
              let idEntry = paramGroup.data.find(f => f.id === id);

              if (!idEntry) {
                idEntry = { id };
                paramGroup.data.push(idEntry);
              }

              idEntry[`${driver.name}_${param.key}_${lap.number}`] = value;
            });
          }
          newColorSchema[`${driver.name}_${param.key}_${lap.number}`] = lap.color;
        });
      });
    });

    newData.forEach(param => {
      param.data.sort((a, b) => a.id - b.id);
    });

    setColorSchema(newColorSchema)
    setChartData(newData);
    return newData;
  };

  const handleCharSelectionParameter = (rowData, rowIndex) => {
    setActiveChart(rowIndex);
  }

  return (
    <Flex justify='space-between' gap={16}>
      <TelemetryDataList 
        title="Parâmetros Disponíveis"
        columns={LeftListColumns}
        data={configuration}
        onDoubleClickHandler={handleAddParameterType}
        style={leftColumnStyle}
      />

      <OverlappedCharts 
        data={chartData}
        activeKey={activeChart}
        colorSchema={colorSchema}
      />
      <TelemetryDataList 
        title="Itens Selecionados"
        columns={RightListColumns}
        data={selectedParameter}
        onDoubleClickHandler={handleRemoveParameterType}
        onClickHandler={handleCharSelectionParameter}
        style={rightColumnStyle}
      />
    </Flex>
  );
};
