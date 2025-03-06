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
import { Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronRight, ChevronDown } from 'lucide-react';
import 'reactflow/dist/style.css';

import { Alert, AlertDescription } from '../../components/ui/alert';

import {
  NodeContextMenu,
  MetaDataEditor,
  CustomNode,
  ShapeNode,
  CustomEdge,
  CustomControls,
  Stencil,
  useNodeOperations,
  WorkflowProvider
} from './Workflow/index.js';





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

// Helper to determine node type from metadata
const getNodeType = (metadata) => {
  const stepType = metadata?.['L5 Step type2']?.toLowerCase() || 
                  metadata?.['L4 Step type']?.toLowerCase() || 
                  'normal';
  return stepType;
};


const Flow = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  nodeTypes, 
  edgeTypes,
  onConnect,
  onNodeContextMenu,
  onNodeSelect,
  onNodeDoubleClick,
  selectedNodeId,
  
}) => {
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'shape',
        position,
        data: { 
          type,
          label: type.charAt(0).toUpperCase() + type.slice(1)
        },
        style: {
          width: 100,
          height: 100,
        },
      };

      // Since we don't have direct access to setNodes, we need to handle this through a callback
      if (onNodesChange) {
        onNodesChange([{
          type: 'add',
          item: newNode
        }]);
      }
    },
    [project, onNodesChange]
  );

  const handleNodeClick = (event, node) => {
    event.preventDefault();
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  const handleNodeDoubleClick = useCallback((event, node) => {
    event.preventDefault();
    onNodeDoubleClick?.(node);
  }, [onNodeDoubleClick]);

  const handlePaneClick = useCallback((event) => {
    event.preventDefault();
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Update nodes with selection state
  const nodesWithSelection = useMemo(() => 
    nodes.map(node => ({
      ...node,
      selected: node.id === selectedNodeId
    }))
  , [nodes, selectedNodeId]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1,
        }}
        
        defaultViewport={{ 
          x: 0, 
          y: 0, 
          zoom: 1 
        }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-gray-50"
      >
        <Stencil />
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
    </div>
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
  const [contextMenu, setContextMenu] = useState(null);
  const [showMetaDataEditor, setShowMetaDataEditor] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());  
const [isInitialized, setIsInitialized] = useState(false);


  // Import node operation handlers
  const {
    handleDeleteNode,
    handleResizeNode,
    handleColorChange,
    handleShapeChange,
    handleConnect,
    handleSaveNode,
    handleEdgeTypeChange,
  } = useNodeOperations(setNodes, setEdges, nodes, edges);


   // Event handlers
   const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      node,
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleMetaDataEdit = useCallback((node) => {
    setSelectedNode(node);
    setShowMetaDataEditor(true);
    closeContextMenu();
  }, []);

  const handleMetaDataSave = useCallback(async (metadata) => {
    try {
      await handleSaveNode(metadata);
      setShowMetaDataEditor(false);
      setSelectedNode(null);
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }, [handleSaveNode]);


console.log("WorkflowDiagram:initialCollapsed",collapsedNodes);


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
          onConnect={handleConnect}
          onNodeContextMenu={onNodeContextMenu}
          onNodeSelect={handleNodeSelect}
          onNodeDoubleClick={handleNodeDoubleClick}
          selectedNodeId={selectedNodeId}
        />
          {/* Context Menu - at Workflow level */}
          {contextMenu && (
          <NodeContextMenu
            node={contextMenu.node}
            position={contextMenu.position}
            onClose={closeContextMenu}
            onDelete={handleDeleteNode}
            onResize={handleResizeNode}
            onColorChange={handleColorChange}
            onShapeChange={handleShapeChange}
            onMetaDataEdit={handleMetaDataEdit}
          />
        )}

        {/* Metadata Editor - at Workflow level */}
        {showMetaDataEditor && selectedNode && (
          <MetaDataEditor
            node={selectedNode}
            onSave={handleMetaDataSave}
            onClose={() => {
              setShowMetaDataEditor(false);
              setSelectedNode(null);
            }}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
};

// Add memoization for nodeTypes and edgeTypes outside the component
const nodeTypes = { custom: CustomNode,
  shape: ShapeNode  };
const edgeTypes = { custom: CustomEdge };

// Wrap the component with WorkflowProvider
const WorkflowDiagramWithProvider = (props) => (
  <WorkflowProvider>
    <WorkflowDiagram {...props} />
  </WorkflowProvider>
);
export default memo(WorkflowDiagramWithProvider);

