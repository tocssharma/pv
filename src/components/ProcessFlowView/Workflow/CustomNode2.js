import React, { useCallback, useMemo } from 'react';
import { Position, useReactFlow } from 'reactflow';
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
  const stepType = metadata?.['L5 Step type2']?.toLowerCase() || 
                  metadata?.['L4 Step type']?.toLowerCase() || 
                  'normal';
  return stepType;
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

const CustomNode = ({ data, id, selected }) => {
  const { setNodes } = useReactFlow();
  const type = getNodeType(data.metadata);
  const isValidation = type === 'validation';
  const isDistribution = type === 'distribution';
  const hasChildren = data.hasChildren;
  
  const colors = useMemo(() => nodeStyles[type] || nodeStyles.default, [type]);

  const handleToggle = useCallback((event) => {
    event.stopPropagation();
    if (data.onToggle) {
      data.onToggle(id);
    }
  }, [id, data.onToggle]);

  // Calculate outgoing connection points for distribution nodes
  const outgoingHandles = useMemo(() => {
    if (!isDistribution || !data.edges) {
      return [];
    }
    // Find all outgoing edges for this node
    const outgoingEdges = data.edges.filter(edge => edge.from === id);
    const positions = getPositionsOnCircle(outgoingEdges.length);
    
    return outgoingEdges.map((edge, idx) => ({
      ...positions[idx],
      id: `source-${edge.from}-${edge.to}`, // Match the edge source handle ID format
      targetNodeId: edge.to
    }));
  }, [isDistribution, data.edges, id]);

  return (
    <div 
      className={`relative group ${colors.bg} border ${colors.border} rounded-lg shadow-md
        hover:shadow-lg transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        overflow-visible min-w-[200px] max-w-[320px]
      `}
    >
      {/* Node ID Badge - Enhanced for better visibility */}
      <div className="absolute -top-3 -left-1 z-10">
        <div className="flex items-center space-x-1">
          <span className="px-2 py-1 text-xs font-mono bg-gray-800 text-white rounded-md shadow-sm
                         border border-gray-700 whitespace-nowrap">
            {id}
          </span>
          {hasChildren && (
            <button
              onClick={handleToggle}
              className="p-1 rounded-full bg-gray-800 text-white hover:bg-gray-700
                       shadow-sm border border-gray-700 transition-colors"
            >
              {data.isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content with Enhanced Header */}
      <div className="flex flex-col h-full">
        <div className={`p-3 ${colors.headerBg} rounded-t-lg border-b ${colors.border}`}>
          <div className="text-sm font-semibold text-gray-800 line-clamp-2">
            {data.label}
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(data.metadata || {}).map(([key, value]) => {
              if (key.includes('System') || key.includes('Application')) {
                return (
                  <span key={key} className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 
                                           rounded-md whitespace-nowrap overflow-hidden text-ellipsis
                                           max-w-[150px]">
                    {value}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Special Node Types Handling */}
      {isValidation ? (
        <div className="relative">
          <EnhancedHandle
            type="target"
            position={Position.Top}
            nodeId={id}
            metadata={data.metadata}
            isValidationNode={true}
            handleColor={colors.handle}
          />
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="absolute w-0.5 h-4 bg-yellow-400 left-1/2 -translate-x-1/2 -top-2" />
            <svg width="40" height="40" className="transform rotate-45">
              <rect x="8" y="8" width="24" height="24" 
                    className="fill-yellow-400 stroke-white" strokeWidth="2" />
            </svg>
            <EnhancedHandle
              type="source"
              position={Position.Left}
              nodeId={id}
              metadata={data.metadata}
              isValidationNode={true}
              handleColor={colors.handle}
            />
            <EnhancedHandle
              type="source"
              position={Position.Right}
              nodeId={id}
              metadata={data.metadata}
              isValidationNode={true}
              handleColor={colors.handle}
            />
          </div>
        </div>
      ) : isDistribution ? (
        <div className="relative">
          <EnhancedHandle
            type="target"
            position={Position.Top}
            nodeId={id}
            metadata={data.metadata}
            handleColor={colors.handle}
          />
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="absolute w-0.5 h-4 bg-blue-400 left-1/2 -translate-x-1/2 -top-2" />
            <svg width="40" height="40">
              <circle cx="20" cy="20" r="16" 
                      className="fill-blue-400 stroke-white" strokeWidth="2" />
            </svg>
            {outgoingHandles.map((handle) => (
              <EnhancedHandle
                key={handle.id}
                type="source"
                position={Position.Bottom}
                id={handle.id} // Explicitly set the handle ID to match edge sourceHandle
                nodeId={id}
                style={{
                  transform: `translate(${handle.x}px, ${handle.y}px)`,
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                }}
                metadata={{
                  ...data.metadata,
                  targetNodeId: handle.targetNodeId // Pass target node info
                }}
                handleColor={colors.handle}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <EnhancedHandle
            type="target"
            position={Position.Top}
            nodeId={id}
            metadata={data.metadata}
            handleColor={colors.handle}
          />
          <EnhancedHandle
            type="source"
            position={Position.Bottom}
            nodeId={id}
            metadata={data.metadata}
            handleColor={colors.handle}
          />
        </>
      )}
    </div>
  );
};

export default CustomNode;