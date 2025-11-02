import { useState } from 'react'; // Import useState
import { Card, Space, Typography } from "antd";
import { SelectedDriverItem } from "./selectedDriverItem";
import { convertToTitleCase } from "../../utilities/dataFormat";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const SelectedParameterItem = ({ driversList, parameter, onDriverLapColorChange, handleCardClick, handleCardRemove, handleRemoveDriver, isSelected }) => {

  const handleDriverColorChange = (data, color) => {
    
    onDriverLapColorChange?.({
      ...parameter,
      ...data
    }, color);
  }

  return (
      <Card
        key={parameter.parameterItem}
        title={convertToTitleCase(parameter.parameterItem)}
        extra={<a href="#" onClick={() => handleCardRemove(parameter.parameterItem)}>Remove</a>}
        onClick={() => handleCardClick(parameter.parameterItem)}
        style={{
          cursor: 'pointer',
          border: isSelected ? '2px solid #188fff' : '1px solid #f0f0f0',
          backgroundColor: isSelected ? '#5f5f5f0c' : 'white',
        }}
      >
      <Space direction="vertical" style={{ width: '100%' }}>
        {driversList.length > 0
        ? driversList?.map((driver, index) => (
            <SelectedDriverItem 
              key={index} 
              driver={driver} 
              onColorChange={handleDriverColorChange}
              handleRemoveDriver={handleRemoveDriver}
            />
          ))
        : <div>
            <UserOutlined style={{ fontSize: 24, opacity: 0.6 }} />
            <Text type="secondary">No Drivers Selected</Text>
          </div>
        }
      </Space>
    </Card>
  );
};
