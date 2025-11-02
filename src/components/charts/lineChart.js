import { useRef, useState } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

export const TelemetryLineChart = ({
  parameterItem,
  data,
  driverIdentifiersList,
  currentActiveCard,
  colors,
}) => {
    const [paddingTop, setPaddingTop] = useState(0);
    const [paddingBot, setPaddingBot] = useState(0);
    const dragState = useRef({ dragging: false, y: 0, direction: undefined, sum: 0, paddingTop: 0, paddingBot: 0 });
    
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
        const paddingSum = dragState.current.paddingTop + dragState.current.paddingBot;
        dragState.current.y = e.clientY;
        
        if (dragState.current.direction === 'top'){

            if (deltaY > 0 && dragState.current.paddingTop >= 0 && paddingSum < 600){
                dragState.current.paddingTop += deltaY;
                setPaddingTop(dragState.current.paddingTop)
            }
            else if(deltaY < 0 && dragState.current.paddingTop + deltaY >= 0){
                dragState.current.paddingTop += deltaY;
                setPaddingTop(dragState.current.paddingTop);
            }

        }
        else {
            if (deltaY < 0 && paddingSum < 600){
                dragState.current.paddingBot += (deltaY * -1);
                setPaddingBot(dragState.current.paddingBot);
            }
            else if(deltaY > 0 && dragState.current.paddingBot >= 0){
                dragState.current.paddingBot += (deltaY * -1);
                setPaddingBot(dragState.current.paddingBot);
            }
        }
        
    }

    const handleMouseUp = () => {
        dragState.current.dragging = false;
        dragState.current.direction = undefined;
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                top: paddingTop,
                bottom: dragState.current.paddingBot,
                userSelect: 'none'
            }}
        >
            <div
                id='top'
                onMouseDown={handleMouseDown}
                style={{
                    zIndex: currentActiveCard === parameterItem ? 9 : 1,
                    width: '100%',
                    height: '50%',
                    position: "absolute",
                    top: 0
                }}
            >
            </div>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            key={parameterItem}
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
            <YAxis
                axisLine={currentActiveCard === parameterItem}
                tick={currentActiveCard === parameterItem}
            />
            {driverIdentifiersList.map((driverKey, index) => (
                <Line
                key={`${driverKey}_${colors[index]}`}
                type="monotone"
                dataKey={driverKey}
                stroke={colors[index] || "#000"}
                dot={false}
                isAnimationActive={false}
                />
            ))}
            </LineChart>
        </ResponsiveContainer>
        <div
            id='bottom'
            onMouseDown={handleMouseDown}
            style={{
                zIndex: currentActiveCard === parameterItem ? 9 : 1,
                width: '100%',
                height: '50%',
                position: "absolute",
                bottom: 0
            }}
        >
        </div>
        </div>
    );
};
