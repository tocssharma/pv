import React, { useCallback, useLayoutEffect, useState, useMemo  } from 'react';
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

  const CustomNode = ({ data, type }) => {
    const [expanded, setExpanded] = useState(true);
    
    const getBackgroundColor = () => {
        switch (type) {
          case 'root':
            return 'bg-slate-50 border-slate-300';
          case 'group':
            return 'bg-gray-50 border-gray-300';
          case 'Distribution':
            return 'bg-blue-50 border-blue-300';
          case 'Validation':
            return 'bg-yellow-50 border-yellow-300';
          default:
            return 'bg-white border-slate-200';
        }
      };
    
      const getTitleBackground = () => {
        switch (type) {
          case 'root':
            return 'bg-slate-100';
          case 'group':
            return 'bg-gray-100';
          case 'Distribution':
            return 'bg-blue-100';
          case 'Validation':
            return 'bg-yellow-100';
          default:
            return 'bg-slate-50';
        }
      };
    
      const containerClass = `
        relative
        ${getBackgroundColor()}
        ${type === 'group' || type === 'root' ? 'border-2' : 'border'}
        rounded-lg shadow-lg
        transition-all duration-300 ease-in-out
        ${expanded && (type === 'group' || type === 'root') ? 'min-w-[500px] min-h-[100px] p-8' : 'w-80 min-h-[120px] p-0'}
        ${type === 'group' ? 'group-node' : ''}
      `;
  
    const titleClass = `
      ${getTitleBackground()}
      ${data.isParent ? 'rounded-t-lg border-b' : 'rounded-lg'}
      ${expanded ? 'p-3' : 'p-2'}
      transition-all duration-300
    `;
  
    const nodeIdClass = `
      absolute -top-6 left-0
      px-2 py-1 text-xs font-mono
      bg-gray-700 text-white
      rounded-md shadow-sm
      opacity-75
      z-10
    `;
  
    // Container for child nodes
    const childrenContainerClass = `
      mt-4 relative
      transition-all duration-300 ease-in-out
      ${expanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}
    `;
  
    const expandButtonClass = `
      absolute top-2 right-2
      w-6 h-6
      flex items-center justify-center
      rounded-full
      hover:bg-black/10
      transition-colors
      text-sm font-medium
      z-20
    `;
  
    return (
      <TooltipRoot>
        <TooltipTrigger asChild>
          <div className={containerClass}>
            {/* Node ID display */}
            <div className={nodeIdClass}>
              {data.id}
            </div>
  
            {/* Node Title Section */}
            <div className={titleClass}>
              <div className="text-base font-medium leading-tight">
                {data.label}
              </div>
              
              {/* Expand/Collapse Button */}
              {(type === 'group' || type === 'root') && (
              <button
                className={expandButtonClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? '−' : '+'}
              </button>
            )}
          </div>
  
            {/* Metadata Preview */}
            {expanded && data.metadata && (
              <div className="px-3 py-2 text-xs text-gray-600">
                {data.metadata.system && (
                  <div className="truncate">
                    System: {data.metadata.system}
                  </div>
                )}
              </div>
            )}
  
            {/* Handles for connections */}
            <Handle
              type="target"
              position={Position.Top}
              className="w-3 h-3 bg-blue-500/50 border-2 border-blue-500"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              className="w-3 h-3 bg-blue-500/50 border-2 border-blue-500"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="z-50">
          <div className="max-w-xs p-2">
            <p className="font-medium mb-1">{data.label}</p>
            {data.metadata?.system && (
              <p className="text-xs text-slate-200">
                System: {data.metadata.system}
              </p>
            )}
            {data.isParent && (
              <p className="text-xs text-slate-300 mt-1">
                {expanded ? 'Click to collapse' : 'Click to expand'}
              </p>
            )}
          </div>
        </TooltipContent>
      </TooltipRoot>
    );
  };
  
  const groupNodeStyles = `
.group-node {
  background-color: rgba(240, 240, 240, 0.9);
  border: 2px dashed #ccc;
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
    root: (props) => <CustomNode {...props} type="root" />,
    group: (props) => <CustomNode {...props} type="group" />,
    Normal: (props) => <CustomNode {...props} type="Normal" />,
    Distribution: (props) => <CustomNode {...props} type="Distribution" />,
    Validation: (props) => <CustomNode {...props} type="Validation" />,
  };
  
  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
  
    dagreGraph.setGraph({
      rankdir: direction,
      ranker: 'network-simplex',
      nodesep: 120,  // Increased separation
      ranksep: 220,  // Increased separation
      align: 'UL',
    });
  
    // Calculate node dimensions based on whether it's a container
    nodes.forEach((node) => {
      const isContainer = node.data.isParent;
      dagreGraph.setNode(node.id, { 
        width: isContainer ? 300 : 210,
        height: isContainer ? 350 : 210,
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
          x: nodeWithPosition.x - (isContainer ? 150 : 100),
          y: nodeWithPosition.y - (isContainer ? 75 : 40),
        },
      };
    });
  
    return { nodes: layoutedNodes, edges };
  };


  const WorkflowDiagramInner = ({ data, root }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { fitView } = useReactFlow();
    const rootProcessNode=root;
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
          const parentId =   node.parentId;//getParentId(node.id);
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
        // Add edges from root to top-level nodes
        const rootEdges = inputNodes
          .filter(node => {
            // Get nodes that should connect to root
            const parentId = getParentId(node.id);
            const isTopLevel = !inputNodes.some(n => n.id === parentId);
            // Only connect to root if it's a top-level node and doesn't end with "01"
            return isTopLevel && node.id.endsWith('01');
          })
          .map(node => ({
            id: `${rootProcessNode.id}-${node.id}`,
            source: rootProcessNode.id,
            target: node.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#333', strokeWidth: 1, opacity: 0.5 },
          }));
      
        // Add edges from parents to their first children (ending with "01")
        const parentChildEdges = inputNodes
          .filter(node => node.id.endsWith('01')) // Find all nodes ending with "01"
          .map(node => {
            const parentId = getParentId(node.id);
            // Only create edge if parent exists in the nodes
            if (inputNodes.some(n => n.id === parentId)) {
              return {
                id: `${parentId}-${node.id}`,
                source: parentId,
                target: node.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#333', strokeWidth: 2 },
              };
            }
            return null;
          })
          .filter(Boolean); // Remove null entries
      
        // Process existing edges
        const normalEdges = inputEdges.map((edge) => ({
          id: `${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          label: edge.condition,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#333', strokeWidth: 2 },
        }));
      
        console.log("All edges:", [...rootEdges, ...parentChildEdges, ...normalEdges]);
        return [...rootEdges, ...parentChildEdges, ...normalEdges];
      }, [getParentId, rootProcessNode.id]);
        
    
    const toggleFullScreen = useCallback(() => {
      const element = document.querySelector('.workflow-container');
      if (!isFullScreen) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullScreen(!isFullScreen);
      setTimeout(() => fitView(), 100);
    }, [isFullScreen, fitView]);
  
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
        
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 100);
      }
    }, [data, processNodes, processEdges, setNodes, setEdges, fitView]);
    const defaultViewport = { x: 0, y: 0, zoom: 1.5 }
    return (
        <div className="workflow-container w-full h-[800px] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node)}
            defaultViewport = {defaultViewport}
            fitViewOptions={{ padding: 0.2, zoom: 100 }}
            minZoom={0.1}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <Panel position="top-right">
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleFullScreen}
                    className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
                  >
                    {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </TooltipContent>
              </TooltipRoot>
            </Panel>
          </ReactFlow>
          {selectedNode && (
            <NodeDetails 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      );
    };
  
  const WorkflowDiagram = ({ data, root }) => {
    return (
      <TooltipProvider>
        <ReactFlowProvider>
          <WorkflowDiagramInner data={data}  root={root}/>
        </ReactFlowProvider>
      </TooltipProvider>
    );
  };
  
  export default WorkflowDiagram;
  