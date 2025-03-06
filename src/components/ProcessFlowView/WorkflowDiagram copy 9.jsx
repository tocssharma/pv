import React, { useRef, useState, useCallback, useLayoutEffect, memo  } from 'react';
import  {
  ReactFlowProvider,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  } from 'reactflow';
import 'reactflow/dist/style.css';

import { Alert, AlertDescription } from '../../components/ui/alert';

import {
  CustomNode,
  ShapeNode,
  CustomEdge,
  useNodeOperations,
  WorkflowProvider,
  
  calculateProcessLayout, calculateEnhancedLayout, calculateSimplifiedLayout,
  
  
  FlowWithControls
} from './Workflow/index.js';
import dagre from 'dagre';







const getStepType = (metadata) => {
  const stepTypeField = Object.keys(metadata).find(key => 
    key.toLowerCase().includes('step type')
  );
  return stepTypeField ? metadata[stepTypeField].toLowerCase() : 'normal';
};

// Helper to determine node type from metadata
const getNodeType = (metadata) => {
  // Look for any key that includes 'step type' case-insensitively
  const stepTypeKey = Object.keys(metadata || {}).find(key => 
    key.toLowerCase().includes('step type')
  );
  
  // Return the value in lowercase if found, otherwise return 'normal'
  return (stepTypeKey ? metadata[stepTypeKey].toLowerCase() : 'normal');
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



const WorkflowDiagram = ({ data, onNodeSelect, selectedNode,onNodeDoubleClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());  
  const [isInitialized, setIsInitialized] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState('TB');
  // Import node operation handlers
  const {
    handleConnect,
    
  } = useNodeOperations(setNodes, setEdges, nodes, edges);


  const handleLayoutDirectionChange = useCallback((newDirection='TB', fitViewFn) => {
    setLayoutDirection(newDirection);
    setIsInitialized(false);
    
    setTimeout(() => {
      setNodes((nodes) => {
        const { nodes: layoutedNodes } = getCustomLayout(nodes, edges);
        return layoutedNodes;
      });
      
      // Use the provided fitView function
      if (fitViewFn) {
        setTimeout(fitViewFn, 50);
      }
    }, 0);
  }, [edges, setNodes]);



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
        
        
        let childNodeIds = [];
        if (node.children && Array.isArray(node.children)) {
            childNodeIds = node.children.map(child => child.nodeId);
        } else if (node.children && typeof node.children === 'object') {
            // If children is an object, convert its values to an array
            childNodeIds = Object.values(node.children).map(child => child.nodeId);
        }

      nodeMap.set(node.id, {
          ...node,
          childNodes: childNodeIds,
          parent: null,
          hasChildren: node.children.length>0 ? true : false,
          level: node.id.split('-').length
        });
      }
    });
  
    // Second pass: Build hierarchy based on IDs
    nodeMap.forEach((node, nodeId) => {
      //const parentId = getParentId(nodeId);
      const parentId=node.parentId;

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
      node.hasChildren = Boolean(node.childNodes.length > 0 || node.children.length>0 ? true : false);
      //node.hasChildren=node.children ? true : false;
      
    });
  
    return Array.from(nodeMap.values());
  }, []);

    /*// Handle node selection
    const handleNodeSelect = (node) => {
      
      setSelectedNodeId(node ? node.id : null);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    }; */
  
    // Utility function to safely get level number
const getLevelNumber = (level) => {
  if (!level) return 0;
  
  // If it's already a number, return it
  if (typeof level === 'number') return level;
  
  // If it's a string starting with 'L', parse the number after it
  if (typeof level === 'string' && level.startsWith('L')) {
    return parseInt(level.substring(1));
  }
  
  // If it's a string of just a number, parse it
  if (typeof level === 'string') {
    return parseInt(level);
  }
  
  return 0;
};

/*
    const handleNodeSelect = (node) => {
      // Compare both id and lineage
      const isSameNode = (a, b) => {
        if (a.id !== b.id) return false;
        
        // Compare lineage objects
        const aLineage = a.data?.lineage || {};
        const bLineage = b.data?.lineage || {};
        
        // Get max level to compare
        const currentLevel = getLevelNumber(a.data?.level);
        
        // Compare each level in lineage
        for (let i = 0; i <= currentLevel; i++) {
          const levelKey = `L${i}_ID`;
          if (aLineage[levelKey] !== bLineage[levelKey]) {
            return false;
          }
        }
        return true;
      };
    
      setSelectedNodeId(node ? node.id : null);
      
      // Find the exact node in our nodes array using lineage
      const exactNode = nodes.find(n => isSameNode(n, node));
      
      if (onNodeSelect && exactNode) {
        onNodeSelect(exactNode);
      }
    }; */

    const handleNodeSelect = (node) => {
      // Compare both id and lineage with null checks
      const isSameNode = (a, b) => {
        // Check if either node is null/undefined
        if (!a || !b) return false;
        
        // Check if required properties exist
        if (!a.id || !b.id) return false;
        if (!a.data || !b.data) return false;
        
        // Basic ID comparison
        if (a.id !== b.id) return false;
        
        // Compare lineage objects with null checks
        const aLineage = a.data?.lineage || {};
        const bLineage = b.data?.lineage || {};
        
        // Get max level to compare using safe parsing
        const currentLevel = getLevelNumber(a.data?.level);
        
        // Compare each level in lineage
        for (let i = 0; i <= currentLevel; i++) {
          const levelKey = `L${i}_ID`;
          if (aLineage[levelKey] !== bLineage[levelKey]) {
            return false;
          }
        }
        return true;
      };
    
      // Add null check before setting selectedNodeId
      setSelectedNodeId(node?.id || null);
      
      // Only proceed with node finding if we have a node
      if (node) {
        // Find the exact node in our nodes array using lineage
        const exactNode = nodes.find(n => isSameNode(n, node));
        
        if (onNodeSelect && exactNode) {
          onNodeSelect(exactNode);
        }
      } else {
        // Handle null node case - might want to clear selection
        onNodeSelect?.(null);
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

  
const getCustomLayout = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ 
    rankdir: 'TB',
    nodesep: 100,
    ranksep: 200,
    align: 'UL',
    ranker: 'tight-tree' // This helps maintain the desired structure
  });

  nodes.forEach((node) => {
    const stepType = getStepType(node.data.metadata);
    const width = 250;
    const height = stepType === 'normal' ? 100 : 150;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const stepType = getStepType(node.data.metadata);
    const successorY = nodeWithPosition.y + 300; // Adjust this value to control vertical spacing
    
    if (stepType === 'validation') {
      // Get all edges from this validation node
      const outgoingEdges = edges.filter(e => e.source === node.id);
      
      // Sort edges based on their source handle
      const leftEdge = outgoingEdges.find(e => e.sourceHandle === 'source-left');
      const rightEdge = outgoingEdges.find(e => e.sourceHandle === 'source-right');

       // Calculate position below the diamond (diamond is 20px below node, itself is 16px tall)


      // Position nodes connected to left handle on the left side
      if (leftEdge) {
        dagreGraph.setNode(leftEdge.target, { 
          x: nodeWithPosition.x - 300,
          y: successorY
        });
      }

      // Position nodes connected to right handle on the right side
      if (rightEdge) {
        dagreGraph.setNode(rightEdge.target, {
          x: nodeWithPosition.x + 300,
          y: successorY
        });
      }
    }
    
    if (stepType === 'distribution') {
      const successors = edges
        .filter(e => e.source === node.id)
        .map(e => e.target);
      
      successors.forEach((successor, index) => {
        const offset = (index - (successors.length - 1) / 2) * 400;
        dagreGraph.setNode(successor, {
          x: nodeWithPosition.x + offset,
          y: successorY + 50
        });
      });
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 50
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};


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

       // Check if node is the selected node and has children
       if (node.children) {
        const hasSelectedNodeChildren = node.children && node.children.length > 0;
        
        if (hasSelectedNodeChildren) {
          initialCollapsed.add(selectedNode.id);
        }
      }


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
      lineage:node.lineage,
      position: { x: 0, y: 0 },
      data: {
        ...node, level: node.level,
        edges: data.edges,
        isCollapsed: initialCollapsed.has(node.id), 
        onToggle: handleNodeToggle,
        hasChildren: node.hasChildren,
        layoutDirection  
      },
      
    }));
  

    const initialEdges = data.edges.map(edge => {



      const sourceNode = processedNodes.find(n => n.id === edge.from);
      const sourceNodeType = getNodeType(sourceNode?.metadata);
      const isValidationNode = sourceNodeType === 'validation';
      const isDistributionNode = sourceNodeType === 'distribution';
      const isNotFeasible = edge.condition?.toLowerCase().includes('no');
      let sourceHandle = 'source';
      let edgeColor = '#333';

      if (isDistributionNode){
        const distributionTargets=processedNodes.find(n => n.id === edge.to);
        // Get the index for this target based on its condition or order
        console.log("WorkflowDiagram:distributionTargets",distributionTargets);
        console.log("WorkflowDiagram:distributionTargets:edge.to",edge.to);

        const targetsArray = Array.isArray(distributionTargets) ? 
                    distributionTargets : 
                    [distributionTargets];
                    console.log("WorkflowDiagram:distributionTargets:targetsArray",targetsArray);
const targetIndex = targetsArray.findIndex(r => r.id === edge.to);

      console.log("WorkflowDiagram:distributionTargetsLtargetIndex",targetIndex);
      // Assign a source handle based on the target's position
      // Use same handle IDs as defined in the node component
      sourceHandle = `source-${targetIndex}`;
      }
      
      //edgeColor = getValidationEdgeColors(initialEdges, predId, conditions);
      // Generate source handle ID based on node type
      const sourceHandleId = isValidationNode 
        ? (isNotFeasible ? 'source-left' : 'source-right')
        : isDistributionNode
          ? sourceHandle
          : `source-${edge.from}`;
    
      return {
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'custom',
        sourceHandle: sourceHandleId,
        targetHandle: `target-${edge.to}`, // Simplified target handle ID
        data: { 
          condition: edge.condition,
          animated: true,
          nodeType: sourceNodeType,
          
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: isNotFeasible ? '#ef4444' : '#2563eb'
        },
        style: { 
          stroke: isNotFeasible ? '#ef4444' : '#2563eb',
          strokeWidth: 2
        },
      };
    });
  
    // Batch the visibility and layout calculations
    try {
      const { visibleNodes, visibleEdges } = getVisibleElements(initialNodes, initialEdges, initialCollapsed); 
      //const { nodes: layoutedNodes, edges: routedEdges } = calculateSimplifiedLayout(visibleNodes, visibleEdges, layoutDirection );
      const { nodes: layoutedNodes, edges: routedEdges } = getCustomLayout(visibleNodes, visibleEdges );
      
      // Batch state updates
      setNodes(layoutedNodes);
      //setEdges(visibleEdges);
      setEdges(routedEdges);
    } catch (error) {
      console.error('Error processing workflow:', error);
      // Fallback to showing all nodes if there's an error
      const layoutedNodes = calculateLayout(initialNodes, initialEdges, layoutDirection);
      setNodes(layoutedNodes);
      setEdges(initialEdges);
      
    }
  }, [data.nodes, data.edges, processNodes, getVisibleElements, handleNodeToggle, layoutDirection]);


  
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
      <FlowWithControls
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={handleConnect}
          onNodeSelect={handleNodeSelect}
          onNodeDoubleClick={handleNodeDoubleClick}
          selectedNode={selectedNode}
          selectedNodeId={selectedNodeId}
          handleLayoutDirectionChange={handleLayoutDirectionChange}
          layoutDirection={layoutDirection}
          onLayoutDirectionChange={handleLayoutDirectionChange}
          
        />
      </ReactFlowProvider>
    </div>
  );
};

// Add memoization for nodeTypes and edgeTypes outside the component
const nodeTypes = { custom: CustomNode,
  shape: ShapeNode, process: CustomNode};
const edgeTypes = { custom: CustomEdge };

// Wrap the component with WorkflowProvider
const WorkflowDiagramWithProvider = (props) => (
  <WorkflowProvider>
    <WorkflowDiagram {...props} />
  </WorkflowProvider>
);
export default memo(WorkflowDiagramWithProvider);

