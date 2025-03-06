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
  // Calculate the angle between source and target to determine optimal path type
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
  
  // Determine edge type based on source handle and data
  const edgeType = useMemo(() => {
    if (sourceHandle?.includes('validation-')) return 'validation';
    if (sourceHandle?.includes('distribution-')) return 'distribution';
    if (Math.abs(angle) > 45) return 'smooth'; // Use smooth steps for steep angles
    return 'bezier'; // Use bezier for gentle angles
  }, [sourceHandle, angle]);

  // Calculate path and label positions based on edge type
  const [edgePath, labelX, labelY] = useMemo(() => {
    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    switch (edgeType) {
      case 'validation':
        return getSmoothStepPath({
          ...pathParams,
          borderRadius: 16,
          offset: 20 // Add offset for validation paths
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
          offset: Math.abs(targetY - sourceY) > 200 ? 50 : 20 // Adjust offset based on vertical distance
        });
      default:
        return getBezierPath({
          ...pathParams,
          curvature: Math.abs(targetX - sourceX) > 300 ? 0.2 : 0.4 // Adjust curvature based on horizontal distance
        });
    }
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, edgeType]);

  // Determine edge styling
  const edgeStyle = useMemo(() => {
    const isNotFeasible = 
      sourceHandle === 'validation-false' ||
      data?.condition?.toLowerCase()?.includes('not feasible');

    const baseColor = isNotFeasible ? '#ef4444' : '#2563eb';
    const baseWidth = isNotFeasible ? 2.5 : 2;
    
    return {
      strokeWidth: baseWidth,
      stroke: baseColor,
      // Add animation only for flowchart-type edges
      animation: edgeType !== 'validation' ? 'flow 20s linear infinite' : 'none',
      // Add transition for smooth color changes
      transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
      ...style
    };
  }, [sourceHandle, data?.condition, style, edgeType]);

  // Calculate label position adjustments based on edge type and angle
  const labelAdjustment = useMemo(() => {
    let xOffset = -50; // Default center alignment
    let yOffset = -10; // Default above the line

    if (Math.abs(angle) > 45) {
      // Adjust for steep angles
      xOffset = angle > 0 ? -100 : 0;
      yOffset = -20;
    }

    return { xOffset, yOffset };
  }, [angle]);

  return (
    <g className="react-flow__edge">
      {/* Edge Path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />

      {/* Edge Label */}
      {data?.condition && (
        <g transform={`translate(${labelX + labelAdjustment.xOffset}, ${labelY + labelAdjustment.yOffset})`}>
          {/* Label Background */}
          <rect
            x="0"
            y="0"
            width="100"
            height="20"
            rx="4"
            fill="white"
            fillOpacity="0.9"
            // Add subtle shadow for better visibility
            filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))"
          />
          {/* Label Text */}
          <text
            x="50"
            y="14"
            textAnchor="middle"
            style={{
              fontSize: '12px',
              fill: edgeStyle.stroke,
              fontWeight: '500',
              userSelect: 'none' // Prevent text selection
            }}
          >
            {data.condition}
          </text>
        </g>
      )}
    </g>
  );
};

// Memoize the component to prevent unnecessary rerenders
export default React.memo(CustomEdge);