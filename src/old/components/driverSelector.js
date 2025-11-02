import React, { useState, useCallback, memo, useEffect } from 'react';
import { Select, ColorPicker, message } from 'antd';
import { toTitleCase } from '../../utilities/dataFormat';

const { Option } = Select;

const DriverSelectorComponent = ({
  record,
  driverList,
  onChange,
  gameName,
  trackName,
  parameterType,
  lapsAvailable,
  getLapData
}) => {
  const [colorOpen, setColorOpen] = useState(null);

  const handleDriverChange = useCallback((selectedKeys) => {
    const updatedDrivers = selectedKeys.map(key => {
      const existing = record.people?.find(p => p.key === key);
      const driver = driverList.find(d => d.key === key);
      return existing ? existing : { key, name: driver?.label, laps: [] };
    });
    onChange(record.key, updatedDrivers);
  }, [record.key, record.people, driverList, onChange]);

  const handleLapSelect = useCallback((driver, selectedLaps) => {
    // Apenas atualiza a lista de voltas selecionadas no estado imediatamente.
    const existingLapsMap = new Map(driver.laps.map(lap => [lap.number, lap]));
    const updatedLaps = selectedLaps.map(lapNumber => existingLapsMap.get(lapNumber) || { number: lapNumber, data: null, color: '#1677ff' });

    const updatedPeople = record.people.map(p =>
      p.key === driver.key ? { ...p, laps: updatedLaps } : p
    );
    onChange(record.key, updatedPeople);
  }, [onChange, record.key, record.people]);

  const handleLapColorChange = useCallback((driverKey, lapNumber, color) => {
    const updatedPeople = record.people.map(p => {
      if (p.key === driverKey) {
        const laps = p.laps.map(l =>
          l.number === lapNumber ? { ...l, color: color.toHexString() } : l
        );
        return { ...p, laps };
      }
      return p;
    });
    onChange(record.key, updatedPeople);
  }, [record.key, record.people, onChange]);


  // O Efeito para buscar dados a cada 5 segundos
  useEffect(() => {
    const intervalIds = [];
    
    // Itera sobre cada piloto selecionado
    record.people?.forEach(driver => {
      // Para cada volta de cada piloto, inicia um intervalo
      driver.laps?.forEach(lap => {
        const fetchData = async () => {
          try {
            const data = await getLapData(gameName, trackName, parameterType, driver.name, lap.number);
            const updatedPeople = record.people.map(p => {
              if (p.key === driver.key) {
                const updatedLaps = p.laps.map(l =>
                  l.number === lap.number ? { ...l, data } : l
                );
                return { ...p, laps: updatedLaps };
              }
              return p;
            });
            onChange(record.key, updatedPeople);
          } catch (error) {
            console.error(`Erro ao buscar dados para a volta ${lap.number} do piloto ${driver.name}:`, error);
            message.error(`Falha ao carregar dados da volta ${lap.number} do piloto ${driver.name}.`);
          }
        };

        // Chama a função imediatamente na montagem ou atualização
        fetchData();
        
        // Configura o intervalo para as chamadas subsequentes a cada 5s
        const intervalId = setInterval(fetchData, 5000);
        intervalIds.push(intervalId);
      });
    });

    // Função de limpeza: limpa todos os intervalos quando o componente é desmontado
    // ou quando as dependências do useEffect mudam
    return () => {
      intervalIds.forEach(id => clearInterval(id));
    };
    
  }, [record.people, getLapData, gameName, trackName, parameterType, onChange, record.key]); // Dependências do useEffect


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
                <Option key={lap.label} value={lap.label}>
                  Volta {lap.label.toString().padStart(2, '0')}
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

export const DriverSelector = memo(DriverSelectorComponent, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.record) === JSON.stringify(nextProps.record) &&
         prevProps.driverList === nextProps.driverList &&
         prevProps.lapsAvailable === nextProps.lapsAvailable;
});
