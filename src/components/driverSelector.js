import React, { useState } from 'react';
import { Select, ColorPicker } from 'antd';
import { toTitleCase } from '../utilities/dataFormat';
import { fetchLapData, fetchLapsAvailable } from '../services/gameData';

const { Option } = Select;

export const DriverSelector = ({ record, driverList, onChange, gameName, trackName, parameterType, interval = 5000 }) => {
  const [colorOpen, setColorOpen] = useState(null);
  const [lapsAvailable, setLapsAvailable] = useState({});
  const [lapData, setLapData] = useState([]);

  const handleDriverChange = (selectedKeys) => {
    const updatedDrivers = selectedKeys.map(key => {
      const existing = record.people?.find(p => p.key === key);
      const driver = driverList.find(d => d.key === key);
      return existing ? existing : { key, name: driver?.label, laps: [] };
    });

    onChange(record.key, updatedDrivers);

    updateLapsAvailable(gameName, trackName, parameterType);
    setInterval(()=>{
      updateLapsAvailable(gameName, trackName, parameterType);
    }, interval)
  };

  const updateLapsAvailable = (gameName, trackName, parameterType) => {
    driverList.forEach(driver => {
      getLapsAvailable(gameName, trackName, parameterType, driver.label, driver.key);
    });
  }

  const getLapsAvailable = (gameName, trackName, parameterType, driverLabel, driverKey) => {
    fetchLapsAvailable(gameName, trackName, parameterType, driverLabel)
      .then(response => {
        setLapsAvailable(prev => ({
          ...prev,
          [driverKey]: response || [],
        }));
      })
      .catch(err => console.error('Erro ao buscar voltas disponíveis!', err));
  };

  const handleLapSelect = async (driver, selectedLaps) => {
    updateLapData(driver, selectedLaps);
    setInterval(()=> {
      updateLapData(driver, selectedLaps)
    }, interval)
  }

  const updateLapData = async (driver, selectedLaps) => {
    const updated = await Promise.all(
      record.people.map(async (p) => {
        if (p.key === driver.key) {
          const laps = await Promise.all(
            selectedLaps.map(async (num) => {
              const existingLap = p.laps?.find(l => l.number === num);
              if (existingLap) return existingLap;

              let lapData = [];
              try {
                lapData = await getLapData(gameName, trackName, parameterType, driver.name, num);
              } catch (err) {
                console.error('Erro ao buscar dados da volta', num, err);
              }

              return {
                number: num,
                color: '#ff0000',
                data: lapData,
              };
            })
          );

          return { ...p, laps };
        }
        return p;
      })
    );

    onChange(record.key, updated);
  };

  const getLapData = async (gameName, trackName, parameterType, driver, lap) => {
    try {
      const response = await fetchLapData(gameName, trackName, parameterType, driver, lap);
      return response || [];
    } catch (err) {
      console.error('Error during drivers items request!', err);
      return [];
    }
  };

  const handleLapColorChange = (driverKey, lapNumber, color) => {
    const updated = record.people.map(p => {
      if (p.key === driverKey) {
        const laps = p.laps.map(l =>
          l.number === lapNumber ? { ...l, color: color.toHexString() } : l
        );
        return { ...p, laps };
      }
      return p;
    });
    onChange(record.key, updated);
  };

  return (
    <div>
      <Select
        mode="multiple"
        placeholder="Selecionar pilotos"
        value={record.people?.map(p => p.key) || []}
        style={{ width: '100%' }}
        onChange={handleDriverChange}
      >
        {driverList.map(driver => (
          <Option key={driver.key} value={driver.key}>
            {toTitleCase(driver.label)}
          </Option>
        ))}
      </Select>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {record.people?.map(p => (
          <div
            key={p.key}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 8,
              background: '#fafafa',
            }}
          >
            <strong style={{ display: 'block', marginBottom: 8 }}>{p.name}</strong>

            <Select
              mode="multiple"
              placeholder="Selecionar voltas"
              value={p.laps?.map(l => l.number) || []}
              style={{ width: '100%', marginBottom: 8 }}
              onChange={(laps) => handleLapSelect(p, laps)}
            >
              {(lapsAvailable[p.key] || []).map(lap => (
                <Option key={lap.key} value={lap.label}>
                  Lap {lap.label.toString().padStart(2, '0')}
                </Option>
              ))}
            </Select>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.laps?.map(lap => (
                <div
                  key={lap.number}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <span style={{ width: 70 }}>Volta {lap.number}</span>
                  <ColorPicker
                    value={lap.color}
                    open={colorOpen === `${p.key}-${lap.number}`}
                    onOpenChange={(open) =>
                      setColorOpen(open ? `${p.key}-${lap.number}` : null)
                    }
                    onChange={(color) =>
                      handleLapColorChange(p.key, lap.number, color)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
