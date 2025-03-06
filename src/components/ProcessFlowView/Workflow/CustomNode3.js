import React, { useCallback, useMemo } from 'react';
import { Position, useReactFlow, Handle } from 'reactflow';
import { ChevronRight, ChevronDown } from 'lucide-react';
import EnhancedHandle from './EnhancedHandle';


// Enhanced node style configurations
const nodeStyles = {
  validation: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    handle: '#fbbf24',
    headerBg: 'bg-yellow-100'
  },
  distribution: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    handle: '#3b82f6',
    headerBg: 'bg-blue-100'
  },
  default: {
    bg: 'bg-white',
    border: 'border-slate-200',
    handle: '#64748b',
    headerBg: 'bg-slate-100'
  }
};

const getNodeType = (metadata) => {
  // Look for any key that includes 'step type' case-insensitively
  const stepTypeKey = Object.keys(metadata || {}).find(key => 
    key.toLowerCase().includes('step type')
  );
  
  // Return the value in lowercase if found, otherwise return 'normal'
  return (stepTypeKey ? metadata[stepTypeKey].toLowerCase() : 'normal');
};

// Helper to calculate positions on circle
const getPositionsOnCircle = (count, radius = 20) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2; // Start from bottom
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    positions.push({ x, y });
  }
  return positions;
};


// Shape components
const Diamond = ({ className = '' }) => (
  <div className="relative w-16 h-16">
    <div className={`absolute w-12 h-12 left-2 top-2 transform rotate-45 border-2 border-gray-400 bg-white ${className}`} />
    {/* Vertical line connecting to the node */}
    <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-400 -translate-x-1/2 -translate-y-full" />
  </div>
);

const Circle = ({ className = '' }) => (
  <div className="relative w-16 h-16">
    <div className={`absolute w-12 h-12 left-2 top-2 rounded-full border-2 border-gray-400 bg-white ${className}`} />
    {/* Vertical line connecting to the node */}
    <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-400 -translate-x-1/2 -translate-y-full" />
  </div>
);


const getSourceHandles = (type) => {
  switch (type) {
    case 'validation':
      return [
        { id: 'source-left', type: 'source', position: Position.Left },
        { id: 'source-right', type: 'source', position: Position.Right }
      ];
    case 'distribution':
      // Generate handles spread around bottom half of circle
      return Array.from({ length: 5 }, (_, i) => ({
        id: `source-${i}`,
        type: 'source',
        position: Position.Bottom,
        style: {
          left: `${20 + i * 15}%`,
          bottom: '-4px'
        }
      }));
    default:
      return [
        { id: 'source', type: 'source', position: Position.Bottom }
      ];
  }
};



const CustomNode = ({ data, id, selected }) => {
console.log("CustomNode data:", data);
  var layoutDirection;
  if (!data.layoutDirection){layoutDirection="TB"} else {layoutDirection=data.layoutDirection} ;


  const { setNodes } = useReactFlow();
  const type = getNodeType(data.metadata);
  const stepType = type;
  const sourceHandles = getSourceHandles(stepType);
  const isValidation = type === 'validation';
  const isDistribution = type === 'distribution';
  const hasChildren = data.hasChildren;
  console.log("CustomNode type:", type);
  const colors = useMemo(() => nodeStyles[type] || nodeStyles.default, [type]);

  const handleToggle = useCallback((event) => {
    event.stopPropagation();
    if (data.onToggle) {
      data.onToggle(id);
    }
  }, [id, data.onToggle]);

  const renderShape = () => {
    console.log("renderShape stepType:", stepType);
    switch (stepType) {
      case 'validation':
        return (
          <div className="relative">
          <EnhancedHandle
            type="target"
            position={ Position.Top}
            id={`target-${id}`}
            nodeId={id}
            isValidationNode={true}
            handleColor={colors.handle}
            layoutDirection={layoutDirection}
          />
<div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Diamond />
              <EnhancedHandle
              type="source"
              position={ Position.Left }
              id="validation-false"
              nodeId={id}
              isValidationNode={true}
              handleColor={colors.handle}
              layoutDirection={layoutDirection}
            />
            <EnhancedHandle
              type="source"
              position={ Position.Right}
              id="validation-true"
              nodeId={id}
              isValidationNode={true}
              handleColor={colors.handle}
              layoutDirection={layoutDirection}
            />
            </div>
          </div></div>
        );
      case 'distribution':
        return (
          <div className="relative"><EnhancedHandle
          type="target"
          position={Position.Top}
          id={`target-${id}`}
          nodeId={id}
          handleColor={colors.handle}
          layoutDirection={layoutDirection}
        />
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Circle />
              {sourceHandles.map(handle => (
                <EnhancedHandle
                type="source"
                position={Position.Bottom}
                id={`source-${id}-${handle.targetNodeId}`}
                style={{ position: 'absolute' }}
                handleColor={colors.handle}
                layoutDirection={layoutDirection}
              />
            ))}
            </div>
          </div>
</div>




        );
      default:
        return sourceHandles.map(handle => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            className="w-2 h-2 !bg-blue-500"
          />
        ));
    }
  };
  
  // Calculate outgoing connection points for distribution nodes
  const outgoingHandles = useMemo(() => {


    if (!isDistribution) {
      return [];
    }
    
    // Find all outgoing edges for this node
    const outgoingEdges = (data.edges || []).filter(edge => edge.from === id);
    
    // Calculate positions on circle
    const positions = getPositionsOnCircle(Math.max(1, outgoingEdges.length));
    
    // Map edges to positions with handle IDs
    return outgoingEdges.map((edge, idx) => {
      const position = positions[idx % positions.length];
      return {
        ...position,
        id: `source-${edge.from}-${edge.to}`,
        targetNodeId: edge.to,
        condition: edge.condition
      };
    });
  }, [isDistribution, id, data.edges]);


  // Helper to get shape position classes based on layout direction
const getShapePositionClasses = (layoutDirection) => {
  if (layoutDirection === 'TB') {
    return {
      container: "absolute -bottom-16 left-1/2 transform -translate-x-1/2",
      connector: "absolute w-0.5 h-4 bg-yellow-400 left-1/2 -translate-x-1/2 -top-2"
    };
  } else {
    return {
      container: "absolute -right-16 top-1/2 transform -translate-y-1/2",
      connector: "absolute h-0.5 w-4 bg-yellow-400 top-1/2 -translate-y-1/2 -left-2"
    };
  }
};


  return (
    <div 
      className={`relative group ${colors.bg} border ${colors.border} rounded-lg shadow-md
        hover:shadow-lg transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        overflow-visible min-w-[200px] max-w-[320px]
      `}
    >
      {/* Main Content with Enhanced Header */}
      <div className="flex flex-col h-full">
        <div className={`p-3 ${colors.headerBg} rounded-t-lg border-b ${colors.border}`}>

          {/* Node ID Badge moved inside the header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-white rounded-md 
                           shadow-sm border border-gray-700 whitespace-nowrap">
              {id}
            </span>
            {hasChildren && (
              <button
                onClick={handleToggle}
                className="p-0.5 rounded-full bg-gray-800 text-white hover:bg-gray-700
                         shadow-sm border border-gray-700 transition-colors"
              >
                {data.isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          <div className="text-sm font-semibold text-gray-800 line-clamp-2">
            {data.label}
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(data.metadata || {}).map(([key, value]) => {
              if (key.includes('System') || key.includes('Application') || key.includes('Actor')) {
                return (
                  <span key={key} className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 
                                           rounded-md whitespace-nowrap overflow-hidden text-ellipsis
                                           max-w-[350px]">
                    {value}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
      <EnhancedHandle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            nodeId={id}
            handleColor={colors.handle}
            layoutDirection={layoutDirection}
          />      
{isValidation || isDistribution ?  renderShape() : (
        <>
          <EnhancedHandle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            nodeId={id}
            handleColor={colors.handle}
            layoutDirection={layoutDirection}
          />
      
          <EnhancedHandle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            nodeId={id}
            handleColor={colors.handle}
            layoutDirection={layoutDirection}
          />
        </>
      )}
    </div>
  );
};

export default CustomNode;