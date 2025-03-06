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

import { motion, AnimatePresence } from 'framer-motion';

let direction="TB";

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

  

  const CustomNode3 = ({ data, type , xPos, yPos}) => {
    const [expanded, setExpanded] = useState(false);
    const [childNodes, setChildNodes] = useState([]);
    const { setNodes, setEdges, getNodes } = useReactFlow();
  

    
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
    // Function to calculate handle positions for validation diamond
  const getValidationHandles = () => {
    if (direction === 'TB') {
      return [
        { id: 'left', position: Position.Left, style: { left: '-20px' } },
        { id: 'right', position: Position.Right, style: { right: '-20px' } }
      ];
    }
    return [
      { id: 'top', position: Position.Top, style: { top: '-20px' } },
      { id: 'bottom', position: Position.Bottom, style: { bottom: '-20px' } }
    ];
  };

    // Function to calculate handle positions for distribution circle
    const getDistributionHandles = (targetCount) => {
      const handles = [];
      const radius = 20;
      for (let i = 0; i < targetCount; i++) {
        const angle = (i * 360) / targetCount;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        handles.push({
          id: `handle-${i}`,
          position: Position.Bottom,
          style: { 
            transform: `translate(${x}px, ${y}px)`,
            background: '#2563eb'
          }
        });
      }
      return handles;
    };

    const expandNode = useCallback(() => {
      if (!expanded && data.children?.length) {
        const currentNodes = getNodes();
        const newNodes = data.children.map((childId, index) => ({
          id: childId,
          type: getNodeTypeFromData(data.childrenData[childId]),
          position: { 
            x: xPos + (index * 300), 
            y: yPos + 200 
          },
          data: {
            ...data.childrenData[childId],
            parentId: data.id
          }
        }));
  
        const newEdges = data.children.map(childId => ({
          id: `${data.id}-${childId}`,
          source: data.id,
          target: childId,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: true
        }));
  
        setNodes([...currentNodes, ...newNodes]);
        setEdges(edges => [...edges, ...newEdges]);
      }
      setExpanded(!expanded);
    }, [expanded, data, setNodes, setEdges, getNodes, xPos, yPos]);
    
    const getNodeStyle = () => {
      const baseStyle = {
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        backgroundColor: '#fff',
        border: '2px solid'
      };
  
      switch (type) {
        case 'validation':
          return {
            ...baseStyle,
            borderColor: '#eab308',
            backgroundColor: '#fef9c3'
          };
        case 'distribution':
          return {
            ...baseStyle,
            borderColor: '#2563eb',
            backgroundColor: '#dbeafe'
          };
        default:
          return {
            ...baseStyle,
            borderColor: '#64748b',
            backgroundColor: '#f8fafc'
          };
      }
    };
    
    // Function to count different types of nodes in the hierarchy
  const getNodeCounts = useCallback(() => {
    if (!data.children || !data.allNodes) return null;

    // Get all descendant nodes for this parent
    const getDescendants = (nodeId) => {
      const descendants = [];
      const stack = [nodeId];
      
      while (stack.length > 0) {
        const currentId = stack.pop();
        const node = data.allNodes.find(n => n.id === currentId);
        if (node) {
          descendants.push(node);
          if (node.data?.children) {
            stack.push(...node.data.children);
          }
        }
      }
      return descendants;
    };

    const descendants = getDescendants(data.id);
    
    return {
      validations: descendants.filter(node => node.type === 'Validation').length,
      distributions: descendants.filter(node => node.type === 'Distribution').length,
      totalSteps: descendants.length
    };
  }, [data.children, data.allNodes, data.id]);

   // Stats indicator component
   const StatsIndicator = ({ counts }) => {
    if (!counts) return null;
    
    return (
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-4 px-4">
        {/* Steps Count */}
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
          <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
            <path 
              fill="currentColor" 
              d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"
            />
          </svg>
          <span className="text-sm font-medium">
            Steps: {counts.totalSteps}
          </span>
        </div>

        {/* Validation Count */}
        {counts.validations > 0 && (
          <div className="flex items-center bg-yellow-100 rounded-full px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
              <path 
                fill="#EAB308" 
                d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
              />
            </svg>
            <span className="text-sm font-medium text-yellow-700">
              V: {counts.validations}
            </span>
          </div>
        )}

        {/* Distribution Count */}
        {counts.distributions > 0 && (
          <div className="flex items-center bg-blue-100 rounded-full px-3 py-1">
            <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
              <path 
                fill="#2563EB" 
                d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M9.5,11H7.75V9H9.5V11M14.5,11H12.75V9H14.5V11M19.5,11H17.75V9H19.5V11M9.5,16H7.75V14H9.5V16M14.5,16H12.75V14H14.5V16M19.5,16H17.75V14H19.5V16Z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-700">
              D: {counts.distributions}
            </span>
          </div>
        )}
      </div>
    );
  };


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
    ${expanded && (type === 'group' || type === 'root') ? 'w-[500px] min-h-[200px]' : 'w-[500px] min-h-[200px]'}
    flex flex-col
  `;
  
    const titleClass = `
      ${getTitleBackground()}
      ${data.isParent ? 'rounded-t-lg border-b' : 'rounded-lg'}
      flex-grow
      flex flex-col justify-center
      p-2
      transition-all duration-300
      h-full
    `;
  
    const nodeIdClass = `
    absolute -top-10 left-0
    px-4 py-2
    text-2xl font-mono
    bg-gray-700 text-white
    rounded-md shadow-md
    opacity-85
    z-10
    font-bold
    min-width-[100px]
    text-center
  `;
  
    const expandButtonClass = `
      absolute top-2 right-2
      w-8 h-8
      flex items-center justify-center
      rounded-full
      hover:bg-black/10
      transition-colors
      text-xl font-medium
      z-20
    `;
    console.log("customnode:data",data);
    console.log("customnode:data.children",data.isParent);
    console.log("customnode:data.children",data.children);
    // Get the counts for this node
  const nodeCounts = (type === 'group' || type === 'root') ? getNodeCounts() : null;

  console.log("CustomNode:type",type);

    return (
      <TooltipRoot>
        <TooltipTrigger asChild>
          <div className={containerClass}>
            <div className={"nodeIdClass node-status "}>
              {data.id}
            </div>
  
            <div className={titleClass}>
              <div className="flex flex-col justify-center items-center h-full w-full">
                {/* Main title with much larger text */}
                <div 
                  className="w-full text-center break-words px-2"
                  style={{
                    fontSize: '2.5rem', // Significantly larger text
                    lineHeight: '1.1',  // Tighter line height
                    fontWeight: '700',  // Bolder text
                    display: '-webkit-box',
                    WebkitLineClamp: '3', // Show max 3 lines
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxHeight: '160px'   // Control maximum height
                  }}
                >
                  {data.label}
                </div>

              </div>
  
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
            {(type === 'group' || type === 'root') && nodeCounts && (
              <StatsIndicator counts={nodeCounts} />
            )}
            </div>
  
      {/* Validation Diamond */}
      {type === 'validation' && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <svg width="80" height="80" className="transform rotate-45">
              <rect
                x="16"
                y="16"
                width="48"
                height="48"
                fill="#eab308"
                stroke="#fff"
                strokeWidth="2"
                rx="4"  // Slightly rounded corners
              />
            </svg>
            
            {/* Handle container that doesn't rotate with the diamond */}
            <div className="absolute top-0 left-0 w-full h-full -rotate-45">
              {/* Left Handle */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                <Handle
                  type="source"
                  position={Position.Left}
                  style={{ 
                    width: '12px', 
                    height: '12px',
                    background: '#eab308',
                    border: '2px solid white'
                  }}
                />
              </div>
              
              {/* Right Handle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                <Handle
                  type="source"
                  position={Position.Right}
                  style={{ 
                    width: '12px', 
                    height: '12px',
                    background: '#eab308',
                    border: '2px solid white'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Circle */}
      {type === 'distribution' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <svg width="40" height="40">
            <circle
              cx="20"
              cy="20"
              r="12"
              fill="#2563eb"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          {getDistributionHandles(data.targetCount || 1).map(handle => (
            <Handle
              key={handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
            />
          ))}
        </div>
      )}

      {/* Default Handle */}
      {type !== 'validation' && type !== 'distribution' && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500"
          />
        </>
      )}
      </div>
        </TooltipTrigger>
        <TooltipContent 
  side="top" 
  align="center" 
  className="z-50 bg-gray-800 shadow-xl" // Added darker background and stronger shadow
  sideOffset={10} // Increased distance from node
>
  <div className="max-w-lg p-6 text-2xl"> {/* Increased max-width and padding, larger base text */}
    <p className="text-3xl font-bold mb-4 text-white"> {/* Much larger title text */}
      {data.label}
    </p>
    {data.metadata?.system && (
      <p className="text-xl text-gray-200 font-medium"> {/* Larger metadata text */}
        <span className="text-gray-400">System:</span> {data.metadata.system}
      </p>
    )}
              {(type === 'group' || type === 'root') && nodeCounts && (
            <div className="mt-2 text-sm text-slate-300">
              <p>Total Steps: {nodeCounts.totalSteps}</p>
              <p>Validations: {nodeCounts.validations}</p>
              <p>Distributions: {nodeCounts.distributions}</p>
            </div>
          )}
  </div>
</TooltipContent>
      </TooltipRoot>
    );
  };

  // Custom node types
const CustomNode2 = ({ data, type, xPos, yPos }) => {
  const [expanded, setExpanded] = useState(false);
  const [childNodes, setChildNodes] = useState([]);
  const { setNodes, setEdges, getNodes } = useReactFlow();
  
  // Function to calculate handle positions for validation diamond
  const getValidationHandles = () => {
    if (direction === 'TB') {
      return [
        { id: 'left', position: Position.Left, style: { left: '-20px' } },
        { id: 'right', position: Position.Right, style: { right: '-20px' } }
      ];
    }
    return [
      { id: 'top', position: Position.Top, style: { top: '-20px' } },
      { id: 'bottom', position: Position.Bottom, style: { bottom: '-20px' } }
    ];
  };

  // Function to calculate handle positions for distribution circle
  const getDistributionHandles = (targetCount) => {
    const handles = [];
    const radius = 20;
    for (let i = 0; i < targetCount; i++) {
      const angle = (i * 360) / targetCount;
      const x = radius * Math.cos((angle * Math.PI) / 180);
      const y = radius * Math.sin((angle * Math.PI) / 180);
      handles.push({
        id: `handle-${i}`,
        position: Position.Bottom,
        style: { 
          transform: `translate(${x}px, ${y}px)`,
          background: '#2563eb'
        }
      });
    }
    return handles;
  };

  const expandNode = useCallback(() => {
    if (!expanded && data.children?.length) {
      const currentNodes = getNodes();
      const newNodes = data.children.map((childId, index) => ({
        id: childId,
        type: getNodeTypeFromData(data.childrenData[childId]),
        position: { 
          x: xPos + (index * 300), 
          y: yPos + 200 
        },
        data: {
          ...data.childrenData[childId],
          parentId: data.id
        }
      }));

      const newEdges = data.children.map(childId => ({
        id: `${data.id}-${childId}`,
        source: data.id,
        target: childId,
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true
      }));

      setNodes([...currentNodes, ...newNodes]);
      setEdges(edges => [...edges, ...newEdges]);
    }
    setExpanded(!expanded);
  }, [expanded, data, setNodes, setEdges, getNodes, xPos, yPos]);

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      backgroundColor: '#fff',
      border: '2px solid'
    };

    switch (type) {
      case 'validation':
        return {
          ...baseStyle,
          borderColor: '#eab308',
          backgroundColor: '#fef9c3'
        };
      case 'distribution':
        return {
          ...baseStyle,
          borderColor: '#2563eb',
          backgroundColor: '#dbeafe'
        };
      default:
        return {
          ...baseStyle,
          borderColor: '#64748b',
          backgroundColor: '#f8fafc'
        };
    }
  };

  return (
    <div className="relative" style={getNodeStyle()}>
      {/* Main Node Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{data.label}</h3>
        {data.metadata && (
          <div className="text-sm text-gray-600">
            {Object.entries(data.metadata).map(([key, value]) => (
              <div key={key}>{`${key}: ${value}`}</div>
            ))}
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {data.children?.length > 0 && (
        <button
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center 
                     rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          onClick={expandNode}
        >
          {expanded ? '−' : '+'}
        </button>
      )}

      {/* Validation Diamond */}
      {type === 'validation' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <svg width="40" height="40" className="transform rotate-45">
            <rect
              x="8"
              y="8"
              width="24"
              height="24"
              fill="#eab308"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          {getValidationHandles().map(handle => (
            <Handle
              key={handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
              className="bg-yellow-500"
            />
          ))}
        </div>
      )}

      {/* Distribution Circle */}
      {type === 'distribution' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <svg width="40" height="40">
            <circle
              cx="20"
              cy="20"
              r="12"
              fill="#2563eb"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          {getDistributionHandles(data.targetCount || 1).map(handle => (
            <Handle
              key={handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
            />
          ))}
        </div>
      )}

      {/* Default Handle */}
      {type !== 'validation' && type !== 'distribution' && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500"
          />
        </>
      )}
    </div>
  );
};




// Custom node types
// Custom node types
const CustomNode1 = ({ data, type, xPos, yPos }) => {
  const [expanded, setExpanded] = useState(false);
  const [childNodes, setChildNodes] = useState([]);
  const { setNodes, setEdges, getNodes } = useReactFlow();
  
  // Function to calculate handle positions for validation diamond
  const getValidationHandles = (direction = 'TB') => {
    const handleStyles = {
      width: '12px',
      height: '12px',
      background: '#eab308',
      border: '2px solid white',
      borderRadius: '50%',
      zIndex: 1000
    };

    if (direction === 'TB') {
      return [
        {
          id: 'left',
          position: Position.Left,
          style: {
            ...handleStyles,
            left: 0,
            transform: 'translateX(-50%)'
          }
        },
        {
          id: 'right',
          position: Position.Right,
          style: {
            ...handleStyles,
            right: 0,
            transform: 'translateX(50%)'
          }
        }
      ];
    }

    return [
      {
        id: 'top',
        position: Position.Top,
        style: {
          ...handleStyles,
          top: 0,
          transform: 'translateY(-50%)'
        }
      },
      {
        id: 'bottom',
        position: Position.Bottom,
        style: {
          ...handleStyles,
          bottom: 0,
          transform: 'translateY(50%)'
        }
      }
    ];
  };

  // Function to calculate handle positions for distribution circle
  const getDistributionHandles = (targetCount) => {
    const handles = [];
    const radius = 20;
    for (let i = 0; i < targetCount; i++) {
      const angle = (i * 360) / targetCount;
      const x = radius * Math.cos((angle * Math.PI) / 180);
      const y = radius * Math.sin((angle * Math.PI) / 180);
      handles.push({
        id: `handle-${i}`,
        position: Position.Bottom,
        style: { 
          transform: `translate(${x}px, ${y}px)`,
          background: '#2563eb'
        }
      });
    }
    return handles;
  };

  const expandNode = useCallback(() => {
    if (!expanded && data.children?.length) {
      const currentNodes = getNodes();
      const newNodes = data.children.map((childId, index) => ({
        id: childId,
        type: getNodeTypeFromData(data.childrenData[childId]),
        position: { 
          x: xPos + (index * 300), 
          y: yPos + 200 
        },
        data: {
          ...data.childrenData[childId],
          parentId: data.id
        }
      }));

      const newEdges = data.children.map(childId => ({
        id: `${data.id}-${childId}`,
        source: data.id,
        target: childId,
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true
      }));

      setNodes([...currentNodes, ...newNodes]);
      setEdges(edges => [...edges, ...newEdges]);
    }
    setExpanded(!expanded);
  }, [expanded, data, setNodes, setEdges, getNodes, xPos, yPos]);

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      backgroundColor: '#fff',
      border: '2px solid'
    };

    switch (type) {
      case 'validation':
        return {
          ...baseStyle,
          borderColor: '#eab308',
          backgroundColor: '#fef9c3'
        };
      case 'distribution':
        return {
          ...baseStyle,
          borderColor: '#2563eb',
          backgroundColor: '#dbeafe'
        };
      default:
        return {
          ...baseStyle,
          borderColor: '#64748b',
          backgroundColor: '#f8fafc'
        };
    }
  };

  return (
    <div className="relative" style={getNodeStyle()}>
      {/* Main Node Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{data.label}</h3>
        {data.metadata && (
          <div className="text-sm text-gray-600">
            {Object.entries(data.metadata).map(([key, value]) => (
              <div key={key}>{`${key}: ${value}`}</div>
            ))}
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {data.children?.length > 0 && (
        <button
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center 
                     rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          onClick={expandNode}
        >
          {expanded ? '−' : '+'}
        </button>
      )}

      {/* Validation Diamond */}
      {type === 'validation' && (
        <>
          {/* Target handle for incoming connection */}
          <Handle
            type="target"
            position={Position.Top}
            style={{ 
              width: '12px', 
              height: '12px',
              background: '#eab308',
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: 1000
            }}
          />

          {/* Diamond shape with source handles */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              {/* Diamond SVG */}
              <svg width="80" height="80" className="transform rotate-45">
                <rect
                  x="16"
                  y="16"
                  width="48"
                  height="48"
                  fill="#eab308"
                  stroke="#fff"
                  strokeWidth="2"
                  rx="4"
                />
              </svg>
              
              {/* Handles container that doesn't rotate with the diamond */}
              <div className="absolute top-0 left-0 w-full h-full -rotate-45">
                {/* Left source handle for "Not Feasible" path */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                  <Handle
                    type="source"
                    position={Position.Left}
                    id="validation-false"
                    style={{ 
                      width: '12px', 
                      height: '12px',
                      background: '#ef4444', // Red color for false/not feasible
                      border: '2px solid white',
                      borderRadius: '50%',
                      zIndex: 1000
                    }}
                  />
                </div>
                
                {/* Right source handle for "Feasible" path */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id="validation-true"
                    style={{ 
                      width: '12px', 
                      height: '12px',
                      background: '#22c55e', // Green color for true/feasible
                      border: '2px solid white',
                      borderRadius: '50%',
                      zIndex: 1000
                    }}
                  />
                </div>

                {/* Optional: Add labels for the handles */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 text-sm text-red-500">
                  Not Feasible
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 text-sm text-green-500">
                  Feasible
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Distribution Circle */}
      {type === 'distribution' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <svg width="40" height="40">
            <circle
              cx="20"
              cy="20"
              r="12"
              fill="#2563eb"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          {getDistributionHandles(data.targetCount || 1).map(handle => (
            <Handle
              key={handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
            />
          ))}
        </div>
      )}

      {/* Default Handle */}
      {type !== 'validation' && type !== 'distribution' && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500"
          />
        </>
      )}
    </div>
  );
};



// Custom node types
const CustomNode = ({ data, type, xPos, yPos }) => {
  const [expanded, setExpanded] = useState(false);
  const [childNodes, setChildNodes] = useState([]);
  const { setNodes, setEdges, getNodes } = useReactFlow();
  
  // Function to get distributed handle positions
  const getDistributedHandlePositions = (count, type = 'source') => {
    const positions = [];
    const spacing = 20; // pixels between handles

    // For odd number of handles, center the middle one
    const startOffset = -((count - 1) * spacing) / 2;
    
    for (let i = 0; i < count; i++) {
      positions.push({
        id: `${type}-handle-${i}`,
        type,
        position: type === 'source' ? Position.Bottom : Position.Top,
        offset: startOffset + (i * spacing),
        style: {
          width: '8px',
          height: '8px',
          background: '#2563eb',
          border: '2px solid white',
          position: 'absolute',
          left: '50%',
          transform: `translateX(${startOffset + (i * spacing)}px) translateY(${type === 'source' ? '100%' : '-100%'})`,
          zIndex: 1000,
        }
      });
    }
    return positions;
  };

  // Helper function to calculate connection line path
  const getConnectionPath = (nodeWidth, nodeHeight, shapeSize) => {
    const startX = nodeWidth / 2;
    const startY = nodeHeight;
    const endY = startY + (nodeHeight / 4); // Position shape at 1/4th distance
    return `M ${startX} ${startY} L ${startX} ${endY}`;
  };

  // Render node content based on type
  const renderNodeContent = (type, data, nodeWidth = 200, nodeHeight = 100) => {
    const shapeSize = Math.min(nodeWidth, nodeHeight) / 4; // Shape is 1/4th of node size

    switch (type) {
      case 'validation':
        return (
          <div className="relative w-full h-full">
            {/* Main node content */}
            <div className="w-full h-full p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <div className="font-medium">{data.label}</div>
            </div>

            {/* Connection line and diamond */}
            <div className="absolute left-0 top-full w-full">
              <svg width="100%" height={nodeHeight/2}>
                {/* Connection line */}
                <path
                  d={getConnectionPath(nodeWidth, 0, shapeSize)}
                  stroke="#eab308"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Diamond shape */}
                <g transform={`translate(${nodeWidth/2 - shapeSize/2}, ${nodeHeight/4 - shapeSize/2})`}>
                  <rect
                    width={shapeSize}
                    height={shapeSize}
                    transform={`rotate(45, ${shapeSize/2}, ${shapeSize/2})`}
                    fill="#eab308"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </g>
              </svg>
              
              {/* Source handles on diamond */}
              <div className="absolute" style={{ top: `${nodeHeight/4}px` }}>
                <Handle
                  type="source"
                  position={Position.Left}
                  id="validation-false"
                  style={{
                    left: `${nodeWidth/2 - shapeSize}px`,
                    background: '#ef4444',
                    width: '8px',
                    height: '8px',
                    border: '2px solid white'
                  }}
                />
                <Handle
                  type="source"
                  position={Position.Right}
                  id="validation-true"
                  style={{
                    left: `${nodeWidth/2 + shapeSize}px`,
                    background: '#22c55e',
                    width: '8px',
                    height: '8px',
                    border: '2px solid white'
                  }}
                />
              </div>
            </div>

            {/* Target handles distributed on top */}
            {getDistributedHandlePositions(data.targetHandles || 1, 'target').map(handle => (
              <Handle
                key={handle.id}
                type={handle.type}
                position={handle.position}
                id={handle.id}
                style={handle.style}
              />
            ))}
          </div>
        );

      case 'distribution':
        return (
          <div className="relative w-full h-full">
            {/* Main node content */}
            <div className="w-full h-full p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
              <div className="font-medium">{data.label}</div>
            </div>

            {/* Connection line and circle */}
            <div className="absolute left-0 top-full w-full">
              <svg width="100%" height={nodeHeight/2}>
                {/* Connection line */}
                <path
                  d={getConnectionPath(nodeWidth, 0, shapeSize)}
                  stroke="#2563eb"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Circle shape */}
                <circle
                  cx={nodeWidth/2}
                  cy={nodeHeight/4}
                  r={shapeSize/2}
                  fill="#2563eb"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Source handles distributed around circle */}
              {getDistributedHandlePositions(data.sourceHandles || 2, 'source').map(handle => (
                <Handle
                  key={handle.id}
                  type={handle.type}
                  position={handle.position}
                  id={handle.id}
                  style={{
                    ...handle.style,
                    top: `${nodeHeight/4 + shapeSize}px`
                  }}
                />
              ))}
            </div>

            {/* Target handles distributed on top */}
            {getDistributedHandlePositions(data.targetHandles || 1, 'target').map(handle => (
              <Handle
                key={handle.id}
                type={handle.type}
                position={handle.position}
                id={handle.id}
                style={handle.style}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full p-4 bg-white border-2 border-gray-200 rounded-lg">
            <div className="font-medium">{data.label}</div>
            
            {/* Distributed source handles */}
            {getDistributedHandlePositions(data.sourceHandles || 1, 'source').map(handle => (
              <Handle
                key={handle.id}
                type={handle.type}
                position={handle.position}
                id={handle.id}
                style={handle.style}
              />
            ))}
            
            {/* Distributed target handles */}
            {getDistributedHandlePositions(data.targetHandles || 1, 'target').map(handle => (
              <Handle
                key={handle.id}
                type={handle.type}
                position={handle.position}
                id={handle.id}
                style={handle.style}
              />
            ))}
          </div>
        );
    }
  };

  // Function to calculate handle positions for distribution circle
  const getDistributionHandles = (targetCount) => {
    const handles = [];
    const radius = 20;
    for (let i = 0; i < targetCount; i++) {
      const angle = (i * 360) / targetCount;
      const x = radius * Math.cos((angle * Math.PI) / 180);
      const y = radius * Math.sin((angle * Math.PI) / 180);
      handles.push({
        id: `handle-${i}`,
        position: Position.Bottom,
        style: { 
          transform: `translate(${x}px, ${y}px)`,
          background: '#2563eb'
        }
      });
    }
    return handles;
  };

  const expandNode = useCallback(() => {
    if (!expanded && data.children?.length) {
      const currentNodes = getNodes();
      const newNodes = data.children.map((childId, index) => ({
        id: childId,
        type: getNodeTypeFromData(data.childrenData[childId]),
        position: { 
          x: xPos + (index * 300), 
          y: yPos + 200 
        },
        data: {
          ...data.childrenData[childId],
          parentId: data.id
        }
      }));

      const newEdges = data.children.map(childId => ({
        id: `${data.id}-${childId}`,
        source: data.id,
        target: childId,
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true
      }));

      setNodes([...currentNodes, ...newNodes]);
      setEdges(edges => [...edges, ...newEdges]);
    }
    setExpanded(!expanded);
  }, [expanded, data, setNodes, setEdges, getNodes, xPos, yPos]);

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      backgroundColor: '#fff',
      border: '2px solid'
    };

    switch (type) {
      case 'validation':
        return {
          ...baseStyle,
          borderColor: '#eab308',
          backgroundColor: '#fef9c3'
        };
      case 'distribution':
        return {
          ...baseStyle,
          borderColor: '#2563eb',
          backgroundColor: '#dbeafe'
        };
      default:
        return {
          ...baseStyle,
          borderColor: '#64748b',
          backgroundColor: '#f8fafc'
        };
    }
  };

  return (
    <div className="relative" style={getNodeStyle()}>
      {/* Main Node Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{data.label}</h3>
        {data.metadata && (
          <div className="text-sm text-gray-600">
            {Object.entries(data.metadata).map(([key, value]) => (
              <div key={key}>{`${key}: ${value}`}</div>
            ))}
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {data.children?.length > 0 && (
        <button
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center 
                     rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          onClick={expandNode}
        >
          {expanded ? '−' : '+'}
        </button>
      )}

      {/* Validation Diamond */}
      {type === 'validation' && (
        <>
          {/* Target handle for incoming connection */}
          <Handle
            type="target"
            position={Position.Top}
            style={{ 
              width: '12px', 
              height: '12px',
              background: '#eab308',
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: 1000
            }}
          />

          {/* Diamond shape with source handles */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              {/* Diamond SVG */}
              <svg width="80" height="80" className="transform rotate-45">
                <rect
                  x="16"
                  y="16"
                  width="48"
                  height="48"
                  fill="#eab308"
                  stroke="#fff"
                  strokeWidth="2"
                  rx="4"
                />
              </svg>
              
              {/* Handles container that doesn't rotate with the diamond */}
              <div className="absolute top-0 left-0 w-full h-full -rotate-45">
                {/* Left source handle for "Not Feasible" path */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                  <Handle
                    type="source"
                    position={Position.Left}
                    id="validation-false"
                    style={{ 
                      width: '12px', 
                      height: '12px',
                      background: '#ef4444', // Red color for false/not feasible
                      border: '2px solid white',
                      borderRadius: '50%',
                      zIndex: 1000
                    }}
                  />
                </div>
                
                {/* Right source handle for "Feasible" path */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id="validation-true"
                    style={{ 
                      width: '12px', 
                      height: '12px',
                      background: '#22c55e', // Green color for true/feasible
                      border: '2px solid white',
                      borderRadius: '50%',
                      zIndex: 1000
                    }}
                  />
                </div>

                {/* Optional: Add labels for the handles */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 text-sm text-red-500">
                  Not Feasible
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 text-sm text-green-500">
                  Feasible
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Distribution Circle */}
      {type === 'distribution' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <svg width="40" height="40">
            <circle
              cx="20"
              cy="20"
              r="12"
              fill="#2563eb"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          {getDistributionHandles(data.targetCount || 1).map(handle => (
            <Handle
              key={handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
            />
          ))}
        </div>
      )}

      {/* Default Handle */}
      {type !== 'validation' && type !== 'distribution' && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500"
          />
        </>
      )}
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
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.2,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      className="react-flow__edge"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={isHovered ? 3 : 2}
        stroke={data?.condition === 'Not Feasible' ? '#ef4444' : '#2563eb'}
        markerEnd={markerEnd}
      />
      
      {data?.condition && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x="-50"
            y="-10"
            width="100"
            height="20"
            fill="white"
            rx="4"
            stroke={data.condition === 'Not Feasible' ? '#ef4444' : '#2563eb'}
            strokeWidth="1"
            opacity={isHovered ? 0.9 : 0.75}
          />
          <text
            dominantBaseline="middle"
            textAnchor="middle"
            fill={data.condition === 'Not Feasible' ? '#ef4444' : '#2563eb'}
            fontSize="12"
            fontWeight="500"
            pointerEvents="none"
          >
            {data.condition}
          </text>
        </g>
      )}
    </g>
  );
};


const CustomEdge1 = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25
  });

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          animation: 'dashOffset 15s linear infinite'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '12px' }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};


const CustomEdge2 = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25
  });

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          animation: 'dashOffset 15s linear infinite'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '12px' }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
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
    root: (props) => <CustomNode {...props} type="root" />,
    group: (props) => <CustomNode {...props} type="group" />,
    Normal: (props) => <CustomNode {...props} type="normal" />,
    Distribution: (props) => <CustomNode {...props} type="distribution" />,
    Validation: (props) => <CustomNode {...props} type="validation" />,
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

  const getLayoutedElements = (nodes, edges) => {
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
    
    console.log("WorkflowDiagramInner:data",data);
    console.log("WorkflowDiagramInner:edges",edges);
    
    return (
         <div className={`workflow-container w-full h-[800px] relative ${isFullScreen ? 'fullscreen' : ''}`}>
           <style>{edgeStyles} {groupNodeStyles} {tooltipStyles}</style>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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