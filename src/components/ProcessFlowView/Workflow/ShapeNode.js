import React, { useRef, useState, useCallback, useLayoutEffect, useMemo,memo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  MarkerType,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow
} from 'reactflow';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronRight, ChevronDown,Shapes, X  } from 'lucide-react';
import 'reactflow/dist/style.css';
// Custom shape components for different node types
const ShapeNode = memo(({ data, id, selected }) => {
    const getShapeStyles = () => {
      const baseStyles = {
        width: '100px',
        height: '100px',
        border: '2px solid #666',
        backgroundColor: data.backgroundColor || 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
      };

        switch (data.type) {
          case 'circle':
            return {
              ...baseStyles,
              borderRadius: '50%',
            };
          case 'diamond':
            return {
              ...baseStyles,
              transform: 'rotate(45deg)',
            };
          case 'triangle':
            return {
              ...baseStyles,
              border: 'none',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              backgroundColor: data.backgroundColor || '#666',
            };
          default: // square
            return baseStyles;
        }
      };
      

      return (
        <div style={getShapeStyles()}>
          <Handle 
            type="target" 
            position={Position.Top} 
            style={{ 
              background: '#666',
              width: '8px',
              height: '8px',
              top: '-5px'
            }} 
          />
          <div style={data.type === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
            {data.label}
          </div>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            style={{ 
              background: '#666',
              width: '8px',
              height: '8px',
              bottom: '-5px'
            }} 
          />
        </div>
      );
    });

  export default ShapeNode