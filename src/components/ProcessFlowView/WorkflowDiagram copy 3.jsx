import React, { useState, useCallback, useLayoutEffect, useMemo,memo } from 'react';
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
import { Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronRight, ChevronDown } from 'lucide-react';
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
              Error loading workflow diagram. Please try refreshing the page.
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

// Enhanced CustomNode with collapse/expand functionality
const CustomNode = ({ data, id, selected, isConnectable }) => {
  const type = getNodeType(data.metadata);
  const isValidation = type === 'validation';
  const hasChildren = data.hasChildren;



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


const Flow = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  nodeTypes, 
  edgeTypes,
  onNodeSelect,
  onNodeDoubleClick,
  selectedNodeId,
  onNodeToggle 
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


// Memoize the nodes map to prevent unnecessary recalculations
const useNodesMap = (nodes) => {
  return useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);
};

const WorkflowDiagram = ({ data, onNodeSelect, onNodeDoubleClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());  
const [isInitialized, setIsInitialized] = useState(false);
console.log("WorkflowDiagram:initialCollapsed",collapsedNodes);

  const processNodes2 = useCallback((rawNodes, rawEdges) => {
    // Create a map of nodes with their children
    const nodeMap = new Map();
    
     // Process nodes first
     rawNodes.forEach(node => {
      if (node && node.id) {
        nodeMap.set(node.id, {
          ...node,
          childNodes: [],
          parent: null,
          hasChildren: false
        });
      }
    });

     // Process edges separately to avoid nested loops
     rawEdges.forEach(edge => {
      if (!edge?.from || !edge?.to) return;
      
      const sourceNode = nodeMap.get(edge.from);
      const targetNode = nodeMap.get(edge.to);
      
      if (sourceNode && targetNode) {
        sourceNode.childNodes.push(targetNode.id);
        sourceNode.hasChildren = true;
        targetNode.parent = sourceNode.id;
      }
    });

    // Add hasChildren flag for each node
    nodeMap.forEach(node => {
      node.hasChildren = node.childNodes && node.childNodes.length > 0;
    });
    console.log("processNodes:Array.from(nodeMap.values())",Array.from(nodeMap.values()))
    return Array.from(nodeMap.values());
  }, []);


  const processNodes1 = useCallback((rawNodes, rawEdges) => {
    // Create a map of nodes with their children
    const nodeMap = new Map();
    
    // Helper function to determine if one ID is parent of another
    const isParentOf = (potentialParentId, childId) => {
      return childId.startsWith(potentialParentId) && 
             childId !== potentialParentId &&
             childId.replace(potentialParentId, '').startsWith('-');
    };
  
    // Helper function to find immediate parent ID
    const findImmediateParentId = (nodeId, allNodeIds) => {
      return Array.from(allNodeIds)
        .filter(potentialParentId => isParentOf(potentialParentId, nodeId))
        .sort((a, b) => b.length - a.length)[0]; // Get the longest matching parent ID
    };
  
    // First pass: Initialize nodes
    rawNodes.forEach(node => {
      if (node && node.id) {
        nodeMap.set(node.id, {
          ...node,
          childNodes: [],
          parent: null,
          hasChildren: false,
          level: node.id.split('-').length // Add level based on ID structure
        });
      }
    });
  
    // Second pass: Build hierarchy based on IDs
    const allNodeIds = new Set(nodeMap.keys());
    nodeMap.forEach((node, nodeId) => {
      const parentId = findImmediateParentId(nodeId, allNodeIds);
      if (parentId) {
        const parentNode = nodeMap.get(parentId);
        if (parentNode) {
          // Set parent reference
          node.parent = parentId;
          
          // Add to parent's children if not already there
          if (!parentNode.childNodes.includes(nodeId)) {
            parentNode.childNodes.push(nodeId);
            parentNode.hasChildren = true;
          }
        }
      }
    });
  
    // Third pass: Add additional connections from edges
    rawEdges.forEach(edge => {
      if (!edge?.from || !edge?.to) return;
      
      const sourceNode = nodeMap.get(edge.from);
      const targetNode = nodeMap.get(edge.to);
      
      if (sourceNode && targetNode && !isParentOf(edge.from, edge.to)) {
        // Only add edge-based relationships if they're not already parent-child
        if (!sourceNode.childNodes.includes(targetNode.id)) {
          sourceNode.childNodes.push(targetNode.id);
          sourceNode.hasChildren = true;
        }
        
        // Only set edge-based parent if node doesn't already have an ID-based parent
        if (!targetNode.parent) {
          targetNode.parent = sourceNode.id;
        }
      }
    });
  
    // Final pass: Ensure hasChildren flag is accurate
    nodeMap.forEach(node => {
      node.hasChildren = node.childNodes.length > 0;
    });
    console.log("processNodes:Array.from(nodeMap.values())",Array.from(nodeMap.values()))
  
    return Array.from(nodeMap.values());
  }, []);


  const processNodes = useCallback((rawNodes, rawEdges) => {
    const nodeMap = new Map();
    
    // Helper function to get parent ID by removing last segment
    const getParentId = (nodeId) => {
      const parts = nodeId.split('-');
      if (parts.length <= 4) return null; // Base level node (e.g., JIN-NIC-P2B-NPD-01)
      parts.pop(); // Remove the last segment (e.g., "01" from "01-01")
      return parts.join('-');
    };
  
    // First pass: Initialize nodes
    rawNodes.forEach(node => {
      if (node && node.id) {
        nodeMap.set(node.id, {
          ...node,
          childNodes: [],
          parent: null,
          hasChildren: false,
          level: node.id.split('-').length
        });
      }
    });
  
    // Second pass: Build hierarchy based on IDs
    nodeMap.forEach((node, nodeId) => {
      const parentId = getParentId(nodeId);
      if (parentId && nodeMap.has(parentId)) {
        // Set parent reference
        node.parent = parentId;
        
        // Add to parent's children
        const parentNode = nodeMap.get(parentId);
        if (!parentNode.childNodes.includes(nodeId)) {
          parentNode.childNodes.push(nodeId);
          parentNode.hasChildren = true;
        }
      }
    });
  
    // Final pass: Ensure hasChildren flag is accurate
    nodeMap.forEach(node => {
      node.hasChildren = node.childNodes.length > 0;
    });
    console.log("processNodes:Array.from(nodeMap.values())",Array.from(nodeMap.values()))
  
    return Array.from(nodeMap.values());
  }, []);

  const getDescendants = useCallback((nodeId, nodesMap) => {
    const descendants = new Set();
    const node = nodesMap.get(nodeId);
    
    if (!node) return descendants;

    const traverse = (currentNodeId) => {
      const currentNode = nodesMap.get(currentNodeId);
      if (!currentNode || !currentNode.childNodes) return;
      
      (currentNode.childNodes || []).forEach(childId => {
        if (childId) {
          descendants.add(childId);
          traverse(childId);
        }
      });
    };

    traverse(nodeId);
    return descendants;
  }, []);




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

  // Optimized getVisibleElements with cycle detection
  const getVisibleElements = useCallback((allNodes, allEdges, collapsed) => {
    const nodesMap = new Map(allNodes.map(node => [node.id, node]));
    const hiddenNodes = new Set();
    const visited = new Set(); // For cycle detection

    // Helper function to safely traverse child nodes
    const addDescendantsToHidden = (nodeId) => {
      if (visited.has(nodeId)) return; // Prevent cycles
      visited.add(nodeId);

      const node = nodesMap.get(nodeId);
      if (!node?.data?.childNodes) return;

      node.data.childNodes.forEach(childId => {
        if (!hiddenNodes.has(childId)) {
          hiddenNodes.add(childId);
          addDescendantsToHidden(childId);
        }
      });
    };

    // Process collapsed nodes
    collapsed.forEach(collapsedId => {
      visited.clear(); // Reset visited set for each collapsed node
      addDescendantsToHidden(collapsedId);
    });

    // Filter nodes and edges efficiently
    const visibleNodes = allNodes.filter(node => !hiddenNodes.has(node.id));
    const visibleEdges = allEdges.filter(edge => 
      !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target)
    );

    return { visibleNodes, visibleEdges };
  }, []);

  // Optimized node toggle with state batching
  const handleNodeToggle = useCallback((nodeId) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    // Calculate initial collapsed nodes
    const initialCollapsed = new Set();
    data.nodes.forEach(node => {
      // Check if node is a parent (has -01, -02 etc. children)
      const hasChildNodes = data.nodes.some(potentialChild => {
        const baseId = node.id;
        const childPattern = new RegExp(`^${baseId}-\\d{2}$`);
        return childPattern.test(potentialChild.id);
      });
      
      if (hasChildNodes) {
        initialCollapsed.add(node.id);
      }
    });
    
    // Update collapsed nodes state
    setCollapsedNodes(initialCollapsed);
  
    const processedNodes = processNodes(data.nodes, data.edges);
    
    const initialNodes = processedNodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        ...node,
        edges: data.edges,
        isCollapsed: initialCollapsed.has(node.id), // Use the newly calculated initialCollapsed
        onToggle: handleNodeToggle,
        hasChildren: node.hasChildren
      }
    }));
  
    const initialEdges = data.edges.map(edge => {
      const sourceNode = processedNodes.find(n => n.id === edge.from);
      const sourceNodeType = getNodeType(sourceNode?.metadata);
      const isValidationNode = sourceNodeType === 'validation';
      const isNotFeasible = edge.condition?.toLowerCase().includes('not feasible');
  
      return {
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'custom',
        sourceHandle: isValidationNode 
          ? (isNotFeasible ? 'validation-false' : 'validation-true')
          : `source-${edge.from}-${edge.to}`,
        targetHandle: `target-${edge.from}-${edge.to}`,
        data: { 
          condition: edge.condition,
          animated: true,
          nodeType: sourceNodeType
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: isNotFeasible ? '#ef4444' : '#2563eb'
        }
      };
    });
  
    // Batch the visibility and layout calculations
    try {
      const { visibleNodes, visibleEdges } = getVisibleElements(initialNodes, initialEdges, initialCollapsed); // Use initialCollapsed here
      const layoutedNodes = calculateLayout(visibleNodes, visibleEdges);
      
      // Batch state updates
      setNodes(layoutedNodes);
      setEdges(visibleEdges);
    } catch (error) {
      console.error('Error processing workflow:', error);
      // Fallback to showing all nodes if there's an error
      const layoutedNodes = calculateLayout(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(initialEdges);
    }
  }, [data.nodes, data.edges, processNodes, getVisibleElements, handleNodeToggle]);


  
  return (
    <div className="w-full h-[800px] bg-gray-50">
      <style>{/* ... [Previous styles remain the same] ... */}</style>
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

// Add memoization for nodeTypes and edgeTypes outside the component
const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };


export default memo(WorkflowDiagram);