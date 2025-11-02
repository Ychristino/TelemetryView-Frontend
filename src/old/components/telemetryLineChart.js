import React, { useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { lineChartStyle } from '../../styles/telemetryChart';

const TelemetryLineChart = ({
  data,
  xKey,
  yKeys,
  colors,
  initialDomain = null,
  style = lineChartStyle,
  allowRedimension = true,
  showYLabel = true,
  showXLabel = true,
  hidePlot = false
}) => {

  const [defaultMin, setDefaultMin] = useState(0)
  const [defaultMax, setDefaultMax] = useState(0)
  const [yDomain, setYDomain] = useState({ min: defaultMin, max: defaultMax });
  const [paddingTop, setPaddingTop] = useState(0);
  const [paddingBot, setPaddingBot] = useState(0);

  const dragState = useRef({ dragging: false, y: 0, direction: undefined });

  useEffect(()=> {
    if (data){
      setDefaultMin(initialDomain?.min ?? Math.min(...data.flatMap(d => yKeys.map(k => d[k] ?? 0))));
      setDefaultMax(initialDomain?.max ?? Math.max(...data.flatMap(d => yKeys.map(k => d[k] ?? 0))));    
    }
  }, [data])
  
  const handleMouseDown = (e) => {
    dragState.current.dragging = true;
    dragState.current.y = e.clientY;
    dragState.current.direction = e.target.id;

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!dragState.current.dragging) return;
    const deltaY = (e.clientY - dragState.current.y);

    if (dragState.current.direction === 'top'){
      const perc = paddingTop + (deltaY/window.screen.height) * 100;
      if (perc <= 50){
        setPaddingTop(perc);
      }
    }
    else {
      const perc = paddingBot + (((deltaY/window.screen.height) * 100) * -1);
      if (perc <= 50){
        setPaddingBot(perc);
      }

    }
  }

  const handleMouseUp = () => {
    dragState.current.dragging = false;
    dragState.current.direction = undefined;
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const handleDoubleClick = (e) => {
    setPaddingTop(0)
    setPaddingBot(0)
  }

  return (
    <div>
      <div
        onDoubleClick={allowRedimension ? handleDoubleClick : null}
        style={{
          ...style,
          zIndex:allowRedimension ? 998 : 1,
          paddingTop:`${paddingTop}%`,
          paddingBottom:`${paddingBot}%`,
          overflowY: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <span 
          style={{
            width: '100%',
            minHeight:'5%',
            display: 'inline-block',
            position: 'absolute',
            top:{paddingTop},
            zIndex:allowRedimension ? 999 : 1,
          }}
          onMouseDown={allowRedimension ? handleMouseDown : null}
          id='top'
        />
        <ResponsiveContainer 
          width="100%" 
          height="95%"
        >
          <LineChart data={data}>
            <XAxis 
              tick={showXLabel}
              dataKey={xKey}
              axisLine={showXLabel}
            />
            <YAxis
              domain={[yDomain.min, yDomain.max]}
              tick={showYLabel ? { fill: '#444'} : false}
              axisLine={showYLabel}
            />
            <Tooltip />
            {hidePlot ? <Line></Line> : 
              yKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx] || '#007bff'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))
            }
          </LineChart>
          <span 
            style={{
              width: '100%',
              minHeight:'5%',
              display: 'inline-block',
              position: 'absolute',
              transform: `translateY(-110%)`,
              bottom:{paddingBot}
            }}
            onMouseDown={allowRedimension ? handleMouseDown : null}
            id='bot'
          />
        </ResponsiveContainer>

        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 10,
            color: '#777',
            fontSize: 12,
            margin: '10px',
            zIndex:allowRedimension ? 999 : 1,
          }}
        >
          (arraste para mover eixo Y, scroll para zoom, duplo clique para resetar)
        </div>
      </div>
    </div>
  );
};

export default TelemetryLineChart;
