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
  getSmoothStepPath,
  useReactFlow
} from 'reactflow';
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import 'reactflow/dist/style.css';

import { Alert, AlertDescription } from '../../components/ui/alert';
// Error Boundary Component
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };
  
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <Alert variant="destructive">
            <AlertDescription>
              Error loading the diagram. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        );
      }
      return this.props.children;
    }
  }
  

  const CustomControls = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { zoomIn: flowZoomIn, zoomOut: flowZoomOut, setViewport, getViewport } = useReactFlow();
    const [zoomLevel, setZoomLevel] = useState(1);
  
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    };
  

    // Wrapper component that has access to ReactFlow context

    const handleZoomChange = (e) => {
      const newZoom = parseFloat(e.target.value);
      setZoomLevel(newZoom);
      const viewport = getViewport();
      setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom });
    };
  
    const handleZoomIn = () => {
      const newZoom = Math.min(zoomLevel + 0.1, 2);
      setZoomLevel(newZoom);
      const viewport = getViewport();
      setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom });
    };
  
    const handleZoomOut = () => {
      const newZoom = Math.max(zoomLevel - 0.1, 0.1);
      setZoomLevel(newZoom);
      const viewport = getViewport();
      setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom });
    };
  
    // Update zoomLevel when ReactFlow's zoom changes
    useLayoutEffect(() => {
      const viewport = getViewport();
      setZoomLevel(viewport.zoom);
    }, [getViewport]);
  
    return (
      <>
        {/* Zoom Controls */}
        <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-lg m-2">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500 font-medium">Zoom: {(zoomLevel * 100).toFixed(0)}%</div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-32 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoomLevel - 0.1) * 52.6}%, #e2e8f0 ${(zoomLevel - 0.1) * 52.6}%, #e2e8f0 100%)`
                }}
              />
              
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </Panel>
  
        {/* Fullscreen Toggle */}
        <Panel position="top-right" className="m-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </Panel>
      </>
    );
  };

  const Flow = ({ 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    nodeTypes, 
    edgeTypes,
    onNodeSelect,
    onNodeDoubleClick,
    selectedNodeId 
  }) => {
    const handleNodeClick = (event, node) => {
      event.preventDefault();
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    };
  
    const handleNodeDoubleClick = (event, node) => {
      event.preventDefault();
      if (onNodeDoubleClick) {
        onNodeDoubleClick(node);
      }
    };
  
    const handlePaneClick = (event) => {
      event.preventDefault();
      if (onNodeSelect) {
        onNodeSelect(null);
      }
    };
  
    // Update nodes with selected state
    const nodesWithSelection = useMemo(() => 
      nodes.map(node => ({
        ...node,
        selected: node.id === selectedNodeId
      }))
    , [nodes, selectedNodeId]);
  
    return (
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        fitView
        className="bg-gray-50"
      >
        <CustomControls />
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
    );
  };
  

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

const CustomNode = ({ data, id, selected  }) => {
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
  const colors = useMemo(() => nodeStyles[type] || nodeStyles.default, [type]);
    const handleStyle = {
    width: '12px',
    height: '12px',
    border: '2px solid white',
  };

  return (
    <div 
    className={`relative group ${colors.bg} border-2 ${colors.border} rounded-lg shadow-lg w-80
    cursor-pointer hover:shadow-xl transition-all duration-200
    ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
  `}>
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
  const isDistributionPath = sourceHandle?.includes('distribution-') || data?.condition;
  
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
    : isDistributionPath ? getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.25
      }) : getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16
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
  const levelHeight = 220;
  
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

const WorkflowDiagram = ({ data, onNodeSelect, onNodeDoubleClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
  
    // Handle node selection
    const handleNodeSelect = (node) => {
      setSelectedNodeId(node ? node.id : null);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    };
  
    // Handle node double click
    const handleNodeDoubleClick = (node) => {
      if (onNodeDoubleClick) {
        onNodeDoubleClick(node);
      }
    };
  
    // Initialize nodes and edges
    useLayoutEffect(() => {
      const processedNodes = processNodes(data.nodes, data.edges);
      const initialNodes = processedNodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          ...node,
          edges: data.edges,
          isCollapsed: collapsedNodes.has(node.id),
          onToggle: handleNodeToggle,
          childNodes: node.childNodes
        }
      }));
  
      const initialEdges = data.edges.map(edge => ({
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'custom',
        sourceHandle: (sourceNodeType === 'validation' && edge.condition?.toLowerCase().includes('not feasible')) ? 
          'validation-false' : (sourceNodeType === 'validation' ? 'validation-true' : `source-${edge.from}-${edge.to}`),
        targetHandle: `target-${edge.from}-${edge.to}`,
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
      }));
  
      const { visibleNodes, visibleEdges } = getVisibleElements(initialNodes, initialEdges, collapsedNodes);
      const layoutedNodes = calculateLayout(visibleNodes, visibleEdges);
      
      setNodes(layoutedNodes);
      setEdges(visibleEdges);
    }, [data.nodes, data.edges, collapsedNodes, processNodes, getVisibleElements, handleNodeToggle]);
  
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
          .fullscreen {
            width: 100vw !important;
            height: 100vh !important;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            transition: background .3s ease-in-out;
          }
          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: none;
            transition: background .3s ease-in-out;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            background: #2563eb;
          }
          input[type="range"]::-moz-range-thumb:hover {
            background: #2563eb;
          }
        `}</style>
        <ReactFlowProvider>
          <Flow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeSelect={handleNodeSelect}
            onNodeDoubleClick={handleNodeDoubleClick}
            selectedNodeId={selectedNodeId}
          />
        </ReactFlowProvider>
      </div>
    );
  };
  
  export default WorkflowDiagram;