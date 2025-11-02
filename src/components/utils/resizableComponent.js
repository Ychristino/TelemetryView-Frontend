import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';

export const ResizableComponent = ({
  height = 50,
  minHeight = 20,
  maxHeight = 500,
  enableResizeTop = false,
  enableResizeBottom = false,
  onResizeStop = () => {}
}) => {
  const [size, setSize] = useState({ width: '100%', height });

  useEffect(() => {
    setSize({ width: '100%', height });
  }, [height]);

  return (
    <Resizable
      size={size}
      onResizeStop={(e, direction, ref, delta) => {
        const newHeight = size.height + delta.height;
        setSize({ ...size, height: newHeight });
        onResizeStop(newHeight);
      }}
      style={{
        // border: '5px solid black',
        margin: 0,
        boxSizing: 'border-box'
      }}
      minWidth="100%"
      minHeight={minHeight}
      maxHeight={maxHeight}
      enable={{
        top: enableResizeTop,
        bottom: enableResizeBottom,
        left: false,
        right: false,
        topRight: false,
        topLeft: false,
        bottomRight: false,
        bottomLeft: false,
      }}
    >
    </Resizable>
  );
};

export default ResizableComponent;
