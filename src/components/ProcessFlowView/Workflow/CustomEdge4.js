import React, { useMemo } from 'react';
import { getBezierPath, getSmoothStepPath } from 'reactflow';
import { BaseEdge, getStraightPath } from '@xyflow/react';

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
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);

  // Determine edge type and handle path calculation based on layout direction
  const { edgeType, pathParams } = useMemo(() => {
    const isLRLayout = sourcePosition === 'right' || sourcePosition === 'left';
    const params = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    let type;
    if (sourceHandle?.includes('validation-')) {
      type = 'validation';
    } else if (sourceHandle?.includes('distribution-')) {
      type = 'distribution';
    } else {
      // For regular edges, choose path type based on layout direction
      type = isLRLayout ? 'smooth' : (Math.abs(angle) > 45 ? 'smooth' : 'bezier');
    }

    return { edgeType: type, pathParams: params };
  }, [sourceHandle, angle, sourcePosition, targetPosition, sourceX, sourceY, targetX, targetY]);

  // Calculate edge path with updated parameters
  const [edgePath, labelX, labelY] = useMemo(() => {
    switch (edgeType) {
      case 'validation':
        return getSmoothStepPath({
          ...pathParams,
          borderRadius: 16,
          offset: 20
        });
      case 'distribution':
        return getBezierPath({
          ...pathParams,
          curvature: 0.25
        });
      case 'smooth':
        return getSmoothStepPath({
          ...pathParams,
          borderRadius: 12,
          offset: Math.abs(targetY - sourceY) > 200 ? 50 : 20
        });
      default:
        /*return getBezierPath({
          ...pathParams,
          curvature: Math.abs(targetX - sourceX) > 300 ? 0.2 : 0.4
        });*/
        return getSmoothStepPath({
          ...pathParams,
          borderRadius: 12,
          offset: Math.abs(targetY - sourceY) > 200 ? 50 : 20
        });
    }
  }, [edgeType, pathParams]);

  // Edge styling
  const edgeStyle = useMemo(() => {
    const isNotFeasible = 
      sourceHandle === 'validation-false' ||
      data?.condition?.toLowerCase()?.includes('not feasible');

    return {
      strokeWidth: isNotFeasible ? 2.5 : 2,
      stroke: isNotFeasible ? '#ef4444' : '#2563eb',
      animation: edgeType !== 'validation' ? 'flow 20s linear infinite' : 'none',
      transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
      ...style
    };
  }, [sourceHandle, data?.condition, style, edgeType]);

  // Adjust label position based on layout direction
  const labelAdjustment = useMemo(() => {
    const isLRLayout = sourcePosition === 'right' || sourcePosition === 'left';
    if (isLRLayout) {
      return {
        xOffset: -50,
        yOffset: angle > 0 ? -20 : 20
      };
    }
    return {
      xOffset: angle > 45 ? -100 : (angle < -45 ? 0 : -50),
      yOffset: -10
    };
  }, [angle, sourcePosition]);

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
        <g transform={`translate(${labelX + labelAdjustment.xOffset}, ${labelY + labelAdjustment.yOffset})`}>
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