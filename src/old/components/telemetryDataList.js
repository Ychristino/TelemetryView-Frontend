import React from 'react';
import { Table, Typography } from 'antd';

const { Title } = Typography;

const TelemetryDataList = ({ title, columns, data, onClickHandler, onDoubleClickHandler, style }) => {
  return (
    <div style={style}>
      <Title level={5} style={{ textAlign: 'center' }}>
        {title}
      </Title>
      <Table
        columns={columns}
        dataSource={data}
        size="small"
        pagination={false}
        onRow={(record, index) => ({
          onClick: (e) => {
            e.stopPropagation();
            onClickHandler?.(record, index);
          },
          onDoubleClick: (e) => {
            e.stopPropagation();
            onDoubleClickHandler?.(record);
          },
          style: { cursor: 'pointer' },
        })}
        rowKey="key"
      />
    </div>
  );
};

export default TelemetryDataList;
