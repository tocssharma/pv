import React, { useState, useCallback, useLayoutEffect, useMemo } from 'react';
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
  getSmoothStepPath
} from 'reactflow';
import { Maximize2, Minimize2, X } from 'lucide-react';
import 'reactflow/dist/style.css';

// Helper to determine node type from metadata
const getNodeType = (metadata) => {
  const stepType = metadata?.['L5 Step type2']?.toLowerCase() || 
                  metadata?.['L4 Step type']?.toLowerCase() || 
                  'normal';
  return stepType;
};

// Helper to determine edge handle based on condition
const getEdgeHandleId = (condition) => {
  if (!condition) return null;
  switch (condition.toLowerCase()) {
    case 'not feasible':
    case 'notfeasible':
      return 'validation-false';
    case 'feasible':
      return 'validation-true';
    default:
      return null;
  }
};

const CustomNode = ({ data, id }) => {
  const type = getNodeType(data.metadata);
  const isValidation = type === 'validation';

  const getNodeColors = () => {
    switch (type) {
      case 'validation':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          handle: 'bg-yellow-500'
        };
      case 'distribution':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          handle: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-slate-200',
          handle: 'bg-slate-500'
        };
    }
  };

  // Get incoming and outgoing edges for this node
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
  const colors = getNodeColors();
  const handleStyle = {
    width: '12px',
    height: '12px',
    border: '2px solid white',
  };

  return (
    <div className={`relative group ${colors.bg} border-2 ${colors.border} rounded-lg shadow-lg w-80`}>
      <>
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

        {/* Handles and Shapes */}
        {isValidation ? (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id="target-default"
              style={{ ...handleStyle, background: colors.handle }}
            />
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              {/* Connecting line */}
              <div 
                className="absolute w-0.5 h-4 bg-yellow-400" 
                style={{ 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  top: '-8px' 
                }} 
              />
              {/* Diamond shape */}
              <svg width="40" height="40" className="transform rotate-45">
                <rect
                  x="8"
                  y="8"
                  width="24"
                  height="24"
                  className="fill-yellow-400 stroke-white"
                  strokeWidth="2"
                />
              </svg>
              <Handle
                type="source"
                position={Position.Left}
                id="validation-false"
                style={{
                  ...handleStyle,
                  background: '#ef4444',
                  left: '-8px',
                  bottom: '20px'
                }}
              />
              <Handle
                type="source"
                position={Position.Right}
                id="validation-true"
                style={{
                  ...handleStyle,
                  background: '#22c55e',
                  right: '-8px',
                  bottom: '20px'
                }}
              />
              {/* Handle Labels */}
              <div className="absolute whitespace-nowrap -left-[calc(100%+20px)] top-1/2 transform -translate-y-1/2 text-xs text-red-500 font-medium">
                Not Feasible
              </div>
              <div className="absolute whitespace-nowrap -right-[calc(100%+20px)] top-1/2 transform -translate-y-1/2 text-xs text-green-500 font-medium">
                Feasible
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Target Handles */}
            {handles.target.map((handle) => (
              <Handle
                key={handle.id}
                type="target"
                id={handle.id}
                position={handle.position}
                style={{ 
                  ...handleStyle, 
                  background: colors.handle,
                  ...handle.style
                }}
              />
            ))}
            
            {/* Source Handles */}
            {handles.source.map((handle) => (
              <Handle
                key={handle.id}
                type="source"
                id={handle.id}
                position={handle.position}
                style={{ 
                  ...handleStyle, 
                  background: colors.handle,
                  ...handle.style
                }}
              />
            ))}
          </>
        )}
      </>
    </div>
  );
};


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
  targetHandle
}) => {
  const isValidationPath = sourceHandle?.includes('validation-') || data?.condition;
  const [edgePath, labelX, labelY] = isValidationPath
    ? getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16
      })
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.25
      });

  const isNotFeasible = 
    sourceHandle === 'validation-false' || 
    data?.condition?.toLowerCase()?.includes('not feasible');
  
  const edgeColor = isNotFeasible ? '#ef4444' : '#2563eb';
  
  return (
    <g className="react-flow__edge">
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: edgeColor,
          animation: 'flow 20s linear infinite'
        }}
      />
      {data?.condition && (
        <g transform={`translate(${labelX - 50}, ${labelY - 10})`}>
          <rect
            x="0"
            y="0"
            width="100"
            height="20"
            rx="4"
            fill="white"
            fillOpacity="0.9"
          />
          <text
            x="50"
            y="14"
            textAnchor="middle"
            style={{ 
              fontSize: '12px', 
              fill: edgeColor,
              fontWeight: '500'
            }}
          >
            {data.condition}
          </text>
        </g>
      )}
    </g>
  );
};

const calculateLayout = (nodes, edges) => {
  const levelWidth = 400;
  const levelHeight = 250;
  
  // Create a map of node levels using BFS
  const nodeLevels = new Map();
  const nodeColumns = new Map();
  const visited = new Set();
  let currentLevel = 0;
  
  // Find root nodes (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !hasIncoming.has(n.id));
  
  // BFS queue with column tracking
  const queue = roots.map(node => ({ node, preferredColumn: 0 }));
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelColumns = new Set();
    
    for (let i = 0; i < levelSize; i++) {
      const { node, preferredColumn } = queue.shift();
      if (!node || visited.has(node.id)) continue;
      
      visited.add(node.id);
      nodeLevels.set(node.id, currentLevel);
      
      let column = preferredColumn;
      while (levelColumns.has(column)) {
        column += 1;
      }
      levelColumns.add(column);
      nodeColumns.set(node.id, column);
      
      const children = edges
        .filter(e => e.source === node.id)
        .map(e => nodes.find(n => n.id === e.target))
        .filter(Boolean);
        
      const offset = Math.floor(children.length / 2);
      children.forEach((child, index) => {
        queue.push({
          node: child,
          preferredColumn: column - offset + index
        });
      });
    }
    currentLevel++;
  }
  
  return nodes.map(node => ({
    ...node,
    position: {
      x: nodeColumns.get(node.id) * levelWidth + (nodeLevels.get(node.id) % 2 === 0 ? 0 : levelWidth / 2),
      y: nodeLevels.get(node.id) * levelHeight
    }
  }));
};

const WorkflowDiagram = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const initialNodes = useMemo(() => 
    data.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { ...node, edges: data.edges }
    })), [data.nodes, data.edges]);

  const initialEdges = useMemo(() => 
    data.edges.map(edge => {
      const edgeId = `${edge.from}-${edge.to}`;
      const sourceNode = data.nodes.find(n => n.id === edge.from);
      const targetNode = data.nodes.find(n => n.id === edge.to);
      const sourceNodeType = sourceNode?.metadata?.['L5 Step type2']?.toLowerCase();
      const targetNodeType = targetNode?.metadata?.['L5 Step type2']?.toLowerCase();
      
      let sourceHandle, targetHandle;
      
      if (sourceNodeType === 'validation') {
        // For validation nodes, use validation-specific handles
        sourceHandle = edge.condition?.toLowerCase().includes('not feasible') ? 
          'validation-false' : 'validation-true';
        
        // Use default target handle for nodes receiving from validation
        targetHandle = `target-${edge.from}-${edge.to}`;
      } else {
        // For normal nodes, use the standardized handle IDs
        sourceHandle = `source-${edge.from}-${edge.to}`;
        targetHandle = `target-${edge.from}-${edge.to}`;
      }

      return {
        id: edgeId,
        source: edge.from,
        target: edge.to,
        type: 'custom',
        sourceHandle,
        targetHandle,
        data: { 
          condition: edge.condition,
          animated: true
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: edge.condition?.toLowerCase()?.includes('not feasible') ? '#ef4444' : '#2563eb'
        }
      };
    }), [data.edges, data.nodes]);

  useLayoutEffect(() => {
    const layoutedNodes = calculateLayout(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  return (
    <div className="w-full h-[800px] bg-gray-50">
      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .react-flow__edge-path {
          stroke-dasharray: 5;
          animation-timing-function: linear;
        }
      `}</style>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              const type = getNodeType(node.data?.metadata);
              switch (type) {
                case 'validation':
                  return '#fef9c3';
                case 'distribution':
                  return '#dbeafe';
                default:
                  return '#ffffff';
              }
            }}
            maskColor="#f9fafb50"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowDiagram;