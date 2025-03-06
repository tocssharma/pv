import React, { useMemo } from 'react';
import { getBezierPath, getSmoothStepPath } from 'reactflow';

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
  sourceHandle,
  targetHandle,
  style
}) => {
  // Calculate the angle between source and target
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
  
  // Determine edge type and path
  const [edgePath, labelX, labelY] = useMemo(() => {
    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    // Use control points if provided in data
    if (data?.controlPoint) {
      return getBezierPath({
        ...pathParams,
        sourcePosition,
        targetPosition,
        controlPoint: data.controlPoint
      });
    }

    // Default path calculation based on edge type
    const isValidationPath = sourceHandle?.includes('validation-');
    const isNotFeasible = 
      sourceHandle === 'validation-false' ||
      data?.condition?.toLowerCase()?.includes('not feasible');

    if (isValidationPath) {
      return getSmoothStepPath({
        ...pathParams,
        borderRadius: 16,
        offset: 20
      });
    }

    // Use bezier path for horizontal edges, smooth step for vertical
    return Math.abs(angle) > 45 
      ? getSmoothStepPath({
          ...pathParams,
          borderRadius: 12,
          offset: Math.abs(targetY - sourceY) > 200 ? 50 : 20
        })
      : getBezierPath({
          ...pathParams,
          curvature: Math.abs(targetX - sourceX) > 300 ? 0.2 : 0.4
        });
  }, [
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    sourceHandle,
    data?.controlPoint,
    angle
  ]);

  // Determine edge color and style
  const edgeStyle = useMemo(() => {
    const isNotFeasible = 
      sourceHandle === 'validation-false' ||
      data?.condition?.toLowerCase()?.includes('not feasible');

    return {
      strokeWidth: isNotFeasible ? 2.5 : 2,
      stroke: isNotFeasible ? '#ef4444' : '#2563eb',
      animation: data?.animated ? 'flow 20s linear infinite' : 'none',
      ...style
    };
  }, [sourceHandle, data?.condition, data?.animated, style]);

  // Calculate label position adjustments
  const labelAdjustments = useMemo(() => {
    let xOffset = -50;
    let yOffset = -10;

    if (Math.abs(angle) > 45) {
      xOffset = angle > 0 ? -100 : 0;
      yOffset = -20;
    }

    return { xOffset, yOffset };
  }, [angle]);

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
        <g transform={`translate(${labelX + labelAdjustments.xOffset}, ${labelY + labelAdjustments.yOffset})`}>
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