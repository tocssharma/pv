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

  // Utility functions moved to separate concerns
  const nodeStyles = {
    validation: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      handle: 'bg-yellow-500'
    },
    distribution: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      handle: 'bg-blue-500'
    },
    default: {
      bg: 'bg-white',
      border: 'border-slate-200',
      handle: 'bg-slate-500'
    }
  };
  
// Helper to determine node type from metadata
const getNodeType = (metadata) => {
  const stepType = metadata?.['L5 Step type2']?.toLowerCase() || 
                  metadata?.['L4 Step type']?.toLowerCase() || 
                  'normal';
  return stepType;
};
// Enhanced CustomNode with collapse/expand functionality
const CustomNode = ({ data, id, selected, isConnectable }) => {
    
    const { setNodes } = useReactFlow();

    
    const type = getNodeType(data.metadata);
    const isValidation = type === 'validation';
    const hasChildren = data.hasChildren;
  
    const handleResize = useCallback(({ width, height }) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              style: {
                ...node.style,
                width,
                height,
              },
            }
          : node
      )
    );
  }, [id, setNodes]);
  
  
    const { incomingEdges, outgoingEdges } = useMemo(() => {
      const edges = data.edges || [];
      return {
        incomingEdges: edges.filter(e => e.to === id),
        outgoingEdges: edges.filter(e => e.from === id)
      };
    }, [id, data.edges]);
  
  
    // Calculate handle positions based on edges
    const getHandles = () => {
      if (isValidation) {
        return {
          target: [{ id: 'target-default', position: Position.Top }],
          source: [
            { id: 'validation-false', position: Position.Left },
            { id: 'validation-true', position: Position.Right }
          ]
        };
      }
  
  
      // For normal nodes, create specific handles for each connection
      const targetHandles = incomingEdges.map((edge, index) => {
        const handleId = `target-${edge.from}-${edge.to}`;
        if (index === 0) {
          return { id: handleId, position: Position.Top };
        }
        // Distribute additional handles between left and right
        return {
          id: handleId,
          position: index % 2 === 0 ? Position.Left : Position.Right,
          style: { top: `${25 + (Math.floor(index/2) * 25)}%` }
        };
      });
  
      const sourceHandles = outgoingEdges.map((edge, index) => {
        const handleId = `source-${edge.from}-${edge.to}`;
        if (index === 0) {
          return { id: handleId, position: Position.Bottom };
        }
        // Distribute additional handles between left and right
        return {
          id: handleId,
          position: index % 2 === 0 ? Position.Left : Position.Right,
          style: { top: `${60 + (Math.floor(index/2) * 25)}%` }
        };
      });
  
      return {
        target: targetHandles,
        source: sourceHandles
      };
    };
  
  
   const handles = getHandles();
    const colors = useMemo(() => nodeStyles[type] || nodeStyles.default, [type]);
    const handleStyle = {
      width: '12px',
      height: '12px',
      border: '2px solid white',
    };
  
    const handleToggle = (event) => {
      event.stopPropagation();
      if (data.onToggle) {
        data.onToggle(id);
      }
    };
  
  
    return (
      <div 
        className={`relative group ${colors.bg} border-2 ${colors.border} rounded-lg shadow-lg w-80
          cursor-pointer hover:shadow-xl transition-all duration-200
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
      >
        {/* Collapse/Expand Button */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            {data.isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
  
        {/* Node ID Badge */}
        <div className="absolute -top-3 left-2 px-2 py-1 text-xs font-mono bg-gray-800 text-white rounded-md opacity-75">
          {id}
        </div>
  
        {/* Main Content */}
        <div className="p-4">
          <div className="text-lg font-bold mb-2">{data.label}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(data.metadata || {}).map(([key, value]) => {
              if (key.includes('System') || key.includes('Application')) {
                return (
                  <span key={key} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {value}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
  
        {/* Handles */}
        {isValidation ? (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id="target-default"
              style={{ ...handleStyle, background: colors.handle }}
            />
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="absolute w-0.5 h-4 bg-yellow-400" style={{ left: '50%', transform: 'translateX(-50%)', top: '-8px' }} />
              <svg width="40" height="40" className="transform rotate-45">
                <rect x="8" y="8" width="24" height="24" className="fill-yellow-400 stroke-white" strokeWidth="2" />
              </svg>
              <Handle
                type="source"
                position={Position.Left}
                id="validation-false"
                style={{ ...handleStyle, background: '#ef4444', left: '-8px', bottom: '20px' }}
              />
              <Handle
                type="source"
                position={Position.Right}
                id="validation-true"
                style={{ ...handleStyle, background: '#22c55e', right: '-8px', bottom: '20px' }}
              />
            </div>
          </>
        ) : (
          <>
            {handles.target.map((handle) => (
              <Handle
                key={handle.id}
                type="target"
                id={handle.id}
                position={handle.position}
                style={{ ...handleStyle, background: colors.handle, ...handle.style }}
                isConnectable={isConnectable}
              />
            ))}
            {handles.source.map((handle) => (
              <Handle
                key={handle.id}
                type="source"
                id={handle.id}
                position={handle.position}
                style={{ ...handleStyle, background: colors.handle, ...handle.style }}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  export default CustomNode