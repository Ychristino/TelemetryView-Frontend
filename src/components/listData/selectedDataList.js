import { Space } from "antd";
import { SelectedParameterItem } from "./selectedParameterItem";

export const SelectedDataList = ({
  parametersList,
  currentActiveCard,
  onDriverLapColorChange,
  handleCardClick,
  handleCardRemove,
  handleRemoveDriver
}) => {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {parametersList?.map((parameter) => (
        <SelectedParameterItem
          key={parameter.parameterItem}
          parameter={parameter}
          driversList={parameter.driversList}
          onDriverLapColorChange={onDriverLapColorChange}
          handleCardClick={handleCardClick}
          handleCardRemove={handleCardRemove}
          isSelected={currentActiveCard === parameter.parameterItem}
          handleRemoveDriver={handleRemoveDriver}
        />
      ))}
    </Space>
  );
};
