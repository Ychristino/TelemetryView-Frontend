import { ColorPicker, Space, Typography } from "antd";
import { formatLapDate, formatLapName } from "../../services/gameService";
import { getRandomColor } from "../../utilities/generators";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const SelectedDriverItem = ({ driver, onColorChange, handleRemoveDriver }) => {
  if (!driver.color) {
    driver.color = getRandomColor();
  }

  return (
    <Space
      direction="horizontal"
      align="center"
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Space direction="horizontal" align="center">
        <ColorPicker
          defaultValue={driver.color}
          showText={() => (
            <Text>
              {driver.driverName} ({formatLapName(driver.lapNum)} -{" "}
              {formatLapDate(driver.lapDate)})
            </Text>
          )}
          onChange={(color) => onColorChange(driver, color.toHexString())}
        />
      </Space>

      <DeleteOutlined
        style={{
          cursor: "pointer",
          fontSize: 20,
        }}
        onClick={() => handleRemoveDriver?.(driver)}
      />
    </Space>
  );
};
