import React, { useCallback, useLayoutEffect, useState, useMemo, useEffect } from 'react';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  getSmoothStepPath, getBezierPath, MarkerType
} from 'reactflow';
import dagre from 'dagre';
import { Maximize2, Minimize2, X  } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  TooltipProvider, 
  TooltipRoot, 
  TooltipTrigger, 
  TooltipContent 
} from '../../components/ui/tooltip';
import 'reactflow/dist/style.css';

// Calculate the position of a point along a line at a given distance from the start
const getPointAlongLine = (x1, y1, x2, y2, distance) => {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const ratio = distance / length;
    return {
      x: x1 + (x2 - x1) * ratio,
      y: y1 + (y2 - y1) * ratio,
    };
  };
// Node details modal component
const NodeDetails = ({ node, onClose }) => {
    if (!node) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative w-full max-w-lg mx-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">{node.data.label}</CardTitle>
              <button 
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(node.data.metadata || {}).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4">
                    <dt className="text-sm font-medium text-gray-500">{key}:</dt>
                    <dd className="text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };


  

// Function to determine node type from data
const getNodeTypeFromData = (nodeData) => {
  if (!nodeData) return 'default';

  // Check if it's a parent/group node
  if (nodeData.children && Object.keys(nodeData.children).length > 0) {
    return 'group';
  }

  // Check metadata for step type
  const stepType = nodeData.metadata?.['L5 Step type2'] || 
                  nodeData.metadata?.['L4 Step type'] || 
                  nodeData.type;

  switch (stepType?.toLowerCase()) {
    case 'validation':
      return 'validation';
    case 'distribution':
      return 'distribution';
    case 'root':
      return 'root';
    case 'group':
      return 'group';
    default:
      // Check if node has specific type indicators in metadata
      if (nodeData.metadata) {
        const metadataStr = JSON.stringify(nodeData.metadata).toLowerCase();
        if (metadataStr.includes('validation')) return 'validation';
        if (metadataStr.includes('distribution')) return 'distribution';
      }
      
      // Check node structure for type indicators
      if (nodeData.id?.includes('VAL')) return 'validation';
      if (nodeData.id?.includes('DIST')) return 'distribution';
      
      return 'default';
  }
};


  const groupNodeStyles = `
.group-node {
  background-color: transparent; /* Fully transparent background */
  border: 2px dashed rgba(204, 204, 204, 0); /* Fully transparent border */
}

.group-node.expanded {
  padding: 20px;
}

.group-node .node-content {
  background-color: white;
  border-radius: 8px;
  padding: 10px;
}
`;




  const nodeTypes = {
    custom: CustomNode
  };

  const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label,
    style = {},
    markerEnd,
  }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Bottom,
      targetX,
      targetY,
      targetPosition: Position.Top,
      curvature: 0.5,
    });
  
    return (
      <>
        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
        />
        {label && (
          <foreignObject
            width={200}
            height={80}
            x={labelX - 100}
            y={labelY - 40}
            style={{ 
              pointerEvents: 'none',
              outline: 'none',
              border: 'none'
            }}
          >
            <div className="edge-label-container">
              <div style={{
                color: '#dc2626',
                fontSize: '28px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                wordBreak: 'break-word'
              }}>
                {label}
              </div>
            </div>
          </foreignObject>
        )}
      </>
    );
  };
  
  
  

// Add some helpful utility functions for edge customization
const getEdgeParams = (source, target) => {
    const sourceCenter = {
      x: source.x + source.width / 2,
      y: source.y + source.height,
    };
  
    const targetCenter = {
      x: target.x + target.width / 2,
      y: target.y,
    };
  
    const distance = Math.sqrt(
      Math.pow(targetCenter.x - sourceCenter.x, 2) +
      Math.pow(targetCenter.y - sourceCenter.y, 2)
    );
  
    return {
      sx: sourceCenter.x,
      sy: sourceCenter.y,
      tx: targetCenter.x,
      ty: targetCenter.y,
      distance,
    };
  };
  
  const edgeTypes = {
    custom: CustomEdge,
  };  

  
  // Add these styles to your CSS for better tooltip appearance
const tooltipStyles = `
.custom-tooltip {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  max-width: none !important;
}

.custom-tooltip [data-radix-tooltip-content] {
  max-width: none !important;
  font-size: 1.5rem;
}
`;
  const edgeStyles = `
  /* Base edge styles */
.group-node {
  background-color: transparent; /* Fully transparent background */
  border: 2px dashed rgba(204, 204, 204, 0); /* Fully transparent border */
}

.group-node.expanded {
  padding: 20px;
}

.group-node .node-content {
  background-color: white;
  border-radius: 8px;
  padding: 10px;
}
.node-status {
  text-align: center;
  font-size: x-large;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
  .react-flow__edge-path {
    stroke: #333;
    stroke-width: 2;
    transition: all 0.3s ease;
  }

  /* Fullscreen specific styles - higher specificity */
  .workflow-container.fullscreen .react-flow__edge-path {
    stroke: #2563eb !important;
    stroke-width: 3 !important;
    filter: drop-shadow(0 0 3px rgba(37, 99, 235, 0.3));
  }

  /* Hover styles */
  .react-flow__edge:hover .react-flow__edge-path {
    stroke-width: 4 !important;
    stroke: #1d4ed8 !important;
  }

  /* Selected state */
  .react-flow__edge.selected .react-flow__edge-path {
    stroke-width: 3;
  }

  /* Edge label styles */
  .edge-label-container {
    pointer-events: none;
  }

  .edge-label-container > div {
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 28px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: 1px solid #e5e7eb;
  }

  /* Fullscreen label styles */
  .workflow-container.fullscreen .edge-label-container > div {
    background: white;
    border: 2px solid #2563eb;
  }

  .react-flow__edge-text {
    font-size: 28px !important;
    fill: #dc2626 !important;
  }
`;

  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
  
    dagreGraph.setGraph({
      rankdir: direction,
      ranker: 'network-simplex',
      nodesep: 300,
      ranksep: 250,
      align: 'UL',
    });
  
    nodes.forEach((node) => {
      const isContainer = node.data.isParent;
      dagreGraph.setNode(node.id, { 
        width: isContainer ? 400 : 300,
        height: isContainer ? 120 : 100,
      });
    });
  
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);
  
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const isContainer = node.data.isParent;
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (isContainer ? 200 : 150),
          y: nodeWithPosition.y - (isContainer ? 60 : 50),
        },
      };
    });
  
    return { nodes: layoutedNodes, edges };
  };
  


  const WorkflowDiagramInner = ({ data, root, onSelect }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { fitView } = useReactFlow();
    const rootProcessNode=root;
    
    const handleNodeClick = (node) => {
        console.log("handleNodeClick:node",node);
        setSelectedNode(node); // Update selected node state
        onSelect(node); // Call the onSelect function passed from parent
    };

    console.log("root",root);
    // Helper function to get parent ID
    const getParentId = useCallback((nodeId) => {
      return nodeId.slice(0, -3);
    }, []);
  
    // Helper function to check if a node is a parent of another node
    const isParentOf = useCallback((potentialParentId, nodeId) => {
      return nodeId.startsWith(potentialParentId) && nodeId !== potentialParentId;
    }, []);
    
    const processNodes = useCallback((inputNodes) => {
        // Create root node
        const rootNode = {
          id: rootProcessNode.id,
          type: 'root',
          data: {
            id: rootProcessNode.id,
            label: rootProcessNode.name,
            isParent: true,
            children: [],
            metadata: {}
          },
          position: { x: 0, y: 0 }
        };
      
        // First, identify all parent-child relationships
        const nodeGroups = new Map();
        const topLevelNodes = new Set();
      
        inputNodes.forEach(node => {
          const parentId = getParentId(node.id);
          
          // Check if this node has a parent in our input nodes
          const hasParent = inputNodes.some(n => n.id === parentId);
          
          if (!hasParent) {
            topLevelNodes.add(node.id);
            rootNode.data.children.push(node.id);
          } else {
            if (!nodeGroups.has(parentId)) {
              nodeGroups.set(parentId, []);
            }
            nodeGroups.get(parentId).push(node.id);
          }
        });
      
        // Process all nodes and add parentNode property
        const processedNodes = inputNodes.map((node) => {
          const parentId = getParentId(node.id);
          const hasParent = inputNodes.some(n => n.id === parentId);
          const isParentNode = nodeGroups.has(node.id);
          
          // Determine node type
          let nodeType;
          if (isParentNode & nodeType!=='root') {
            nodeType = 'group';  // Set parent nodes as group type
          } else {
            nodeType = node.metadata?.['L5 Step type2'] || node.metadata?.['L4 Step type'] || 'Normal';
          }
      
          return {
            id: node.id,
            type: nodeType,
            data: {
              id: node.id,
              label: node.label,
              metadata: node.metadata || {},
              isParent: isParentNode,
              children: nodeGroups.get(node.id) || [],
            },
            position: { x: 0, y: 0 },
            parentid: hasParent ? parentId : undefined,
            style: isParentNode ? {
              padding: 100,
              width: 200,
              height: 100,
            } : undefined,
            className: isParentNode ? 'light' : undefined,
            extent:isParentNode ? undefined:'parent',
          };
        });
        console.log("[rootNode, ...processedNodes]",[rootNode, ...processedNodes]);
        return [rootNode, ...processedNodes];
      }, [getParentId, rootProcessNode.id]);

  
      const processEdges = useCallback((inputNodes, inputEdges) => {
        const rootEdges = inputNodes
          .filter(node => {
            const parentId = getParentId(node.id);
            const isTopLevel = !inputNodes.some(n => n.id === parentId);
            return isTopLevel && node.id.endsWith('01');
          })
          .map(node => ({
            id: `${rootProcessNode.id}-${node.id}`,
            source: rootProcessNode.id,
            target: node.id,
            type: 'custom',
            animated: true,
            style: { 
              stroke: isFullScreen ? '#2563eb' : '#333',
              strokeWidth: isFullScreen ? 3 : 2,
            },
            isFullScreen
          }));
    
        const parentChildEdges = inputNodes
          .filter(node => node.id.endsWith('01'))
          .map(node => {
            const parentId = getParentId(node.id);
            if (inputNodes.some(n => n.id === parentId)) {
              return {
                id: `${parentId}-${node.id}`,
                source: parentId,
                target: node.id,
                type: 'custom',
                animated: true,
                style: { 
                  stroke: isFullScreen ? '#FF0000' : '#333',
                  strokeWidth: isFullScreen ? 3 : 2,
                },
                isFullScreen
              };
            }
            return null;
          })
          .filter(Boolean);
    
        const normalEdges = inputEdges.map((edge) => ({
          id: `${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          label: edge.condition,
          type: 'custom',
          animated: true,
          style: { 
            stroke: isFullScreen ? '#2563eb' : '#333',
            strokeWidth: isFullScreen ? 3 : 2,
          },
          isFullScreen
        }));
    
        return [...rootEdges, ...parentChildEdges, ...normalEdges];
      }, [getParentId, rootProcessNode.id, isFullScreen]);
        
    
    const toggleFullScreen = useCallback(() => {
        try {
          const element = document.querySelector('.workflow-container');
          if (!element) return;
      
          if (!isFullScreen) {
            // Entering fullscreen
            if (element.requestFullscreen) {
              element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) { // Safari
              element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { // IE11
              element.msRequestFullscreen();
            }
          } else {
            // Exiting fullscreen
            if (document.fullscreenElement) {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
              } else if (document.msExitFullscreen) { // IE11
                document.msExitFullscreen();
              }
            }
          }
      
          // Update state after a short delay to ensure the transition is complete
          setTimeout(() => {
            setIsFullScreen(!isFullScreen);
            fitView();
          }, 100);
      
        } catch (error) {
          console.warn('Fullscreen toggle failed:', error);
          // Fallback: just update the state
          setIsFullScreen(!isFullScreen);
        }
      }, [isFullScreen, fitView]);
  
      useEffect(() => {
        const handleFullscreenChange = () => {
          if (!document.fullscreenElement && 
              !document.webkitFullscreenElement && 
              !document.msFullscreenElement) {
            setIsFullScreen(false);
          }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
      
        return () => {
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
          document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
      }, []);


    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
    useLayoutEffect(() => {
      if (data?.nodes && data?.edges) {
        const initialNodes = processNodes(data.nodes);
        const initialEdges = processEdges(data.nodes, data.edges);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          initialNodes,
          initialEdges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        console.log("getLayoutedElements:layoutedNodes",layoutedNodes);
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 100);
      }
    }, [data, processNodes, processEdges, setNodes, setEdges, fitView]);
    
    return (
         <div className={`workflow-container w-full h-[800px] relative ${isFullScreen ? 'fullscreen' : ''}`}>
           <style>{edgeStyles} {groupNodeStyles} {tooltipStyles}</style>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={{ custom: CustomEdge }}
            onNodeClick={(_, node) => handleNodeClick(node)}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'custom',
              animated: true,
              style: { strokeWidth: 10 },
              markerEnd: { type: MarkerType.ArrowClosed }
            }}
          >
            
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'root':
                    return '#94a3b8';
                  case 'group':
                    return '#cbd5e1';
                  default:
                    return '#e2e8f0';
                }
              }}
              maskColor="#ffffff50"
            />
            <Panel position="top-right">
            <style>{tooltipStyles} </style>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleFullScreen}
                    className="bg-white p-3 rounded-md shadow-md hover:bg-gray-100"
                  >
                    {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </TooltipContent>
              </TooltipRoot>
            </Panel>
          </ReactFlow>
          
        </div>
      );
    
    };

  const WorkflowDiagram = ({ data, root, onSelect }) => {
    return (
      <TooltipProvider>
        <ReactFlowProvider>
          <WorkflowDiagramInner data={data}  root={root} onSelect={onSelect}/>
        </ReactFlowProvider>
      </TooltipProvider>
    );
  };
  
  export default WorkflowDiagram;