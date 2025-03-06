import React, { useMemo } from 'react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style
}) => {
  // If we have a custom path from edge routing, use it
  const edgePath = data?.path || `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  
  // Calculate label position
  const labelPosition = useMemo(() => {
    if (data?.routePoints && data.routePoints.length > 1) {
      // Find middle segment of the route
      const midIndex = Math.floor(data.routePoints.length / 2);
      const point1 = data.routePoints[midIndex - 1];
      const point2 = data.routePoints[midIndex];
      
      return {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2
      };
    }
    
    // Default label position
    return {
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2
    };
  }, [data?.routePoints, sourceX, sourceY, targetX, targetY]);

  const edgeStyle = {
    strokeWidth: data?.isNotFeasible ? 2.5 : 2,
    stroke: data?.isNotFeasible ? '#ef4444' : '#2563eb',
    animation: data?.animated ? 'flow 20s linear infinite' : 'none',
    ...style
  };

  return (
    <g className="react-flow__edge">
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      
      {data?.condition && (
        <g transform={`translate(${labelPosition.x - 50}, ${labelPosition.y - 10})`}>
          <rect
            x="0"
            y="0"
            width="100"
            height="20"
            rx="4"
            fill="white"
            fillOpacity="0.9"
            filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))"
          />
          <text
            x="50"
            y="14"
            textAnchor="middle"
            style={{
              fontSize: '12px',
              fill: edgeStyle.stroke,
              fontWeight: '500',
              userSelect: 'none'
            }}
          >
            {data.condition}
          </text>
        </g>
      )}
    </g>
  );
};

export default React.memo(CustomEdge);