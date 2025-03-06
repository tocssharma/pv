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
import { Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronRight, ChevronDown } from 'lucide-react';
import 'reactflow/dist/style.css';

import { Alert, AlertDescription } from '../../components/ui/alert';

// ... [Previous utility functions remain the same] ...

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

// ... [Previous CustomControls implementation remains the same] ...

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
  // ... [Previous Flow implementation remains the same] ...
  const handleNodeClick = (event, node) => {
    event.preventDefault();
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

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

const WorkflowDiagram = ({ data, onNodeSelect, onNodeDoubleClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  // Build node hierarchy and track parent-child relationships
  const processNodes = useCallback((rawNodes, rawEdges) => {
    // Create a map of nodes with their children
    const nodeMap = new Map();
    
    // First pass: Initialize all nodes with empty children arrays
    rawNodes.forEach(node => {
      if (node && node.id) {
        nodeMap.set(node.id, {
          ...node,
          childNodes: [],
          parent: null
        });
      }
    });

    // Second pass: Build parent-child relationships
    rawEdges.forEach(edge => {
      if (!edge || !edge.from || !edge.to) return;
      
      const sourceNode = nodeMap.get(edge.from);
      const targetNode = nodeMap.get(edge.to);
      
      if (sourceNode && targetNode) {
        if (!sourceNode.childNodes) sourceNode.childNodes = [];
        sourceNode.childNodes.push(targetNode.id);
        targetNode.parent = sourceNode.id;
      }
    });

    // Add hasChildren flag for each node
    nodeMap.forEach(node => {
      node.hasChildren = node.childNodes && node.childNodes.length > 0;
    });

    return Array.from(nodeMap.values());
  }, []);

  // Get all descendant nodes recursively
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

  // Toggle node collapse state
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

  // Calculate visible nodes and edges based on collapse state
  const getVisibleElements = useCallback((allNodes, allEdges, collapsed) => {
    const nodesMap = new Map(allNodes.map(node => [node.id, node]));
    const hiddenNodes = new Set();

    // Get all hidden nodes based on collapsed state
    collapsed.forEach(collapsedId => {
      const descendants = getDescendants(collapsedId, nodesMap);
      descendants.forEach(id => hiddenNodes.add(id));
    });

    // Filter nodes and edges
    const visibleNodes = allNodes.filter(node => !hiddenNodes.has(node.id));
    const visibleEdges = allEdges.filter(edge => 
      !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target)
    );

    return { visibleNodes, visibleEdges };
  }, [getDescendants]);

  // Initialize nodes and edges with collapse functionality
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

  // ... [Rest of the WorkflowDiagram implementation remains the same] ...

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

export default WorkflowDiagram;