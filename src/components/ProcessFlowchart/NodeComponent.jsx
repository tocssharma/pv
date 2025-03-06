import React from 'react';

const NodeComponent = ({ 
  nodeId, 
  position = { x: 0, y: 0 },
  processData, 
  isSelected,
  isHovered,
  onSelect, 
  onHover 
}) => {
  if (!position) return null;
  
  const { x = 0, y = 0 } = position;

  // Get node data
  const getNodeData = () => {
    if (!processData) return null;
    for (const [_, nodes] of processData) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  };

  const nodeData = getNodeData();
  if (!nodeData) return null;

  // Get process name and format it
  const getProcessName = () => {
    if (!nodeData?.attributes) return '';
    const processNameAttr = nodeData.attributes.find(attr => 
      attr.key.includes('Process Name') || attr.key === 'processName'
    );
    const name = processNameAttr?.value || '';
    
    // Format long names
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  // Get node ID display format
  const getDisplayId = () => {
    const parts = nodeId.split('-');
    if (parts.length > 2) {
      return `...${parts.slice(-2).join('-')}`;
    }
    return nodeId;
  };

  // Get node type and associated styles
  const getNodeType = () => {
    if (!nodeData?.relationships) return 'default';
    if (nodeData.relationships.some(r => r.type === 'Validation')) return 'validation';
    if (nodeData.relationships.some(r => r.type === 'Distribution')) return 'distribution';
    return 'default';
  };

  const getNodeStyles = () => {
    const type = getNodeType();
    const baseStyles = {
      width: 120,
      height: 80,
      background: isSelected ? 'white' : '#F3F4F6',
      border: '2px solid',
    };

    switch (type) {
      case 'validation':
        return {
          ...baseStyles,
          borderColor: isSelected ? '#2563EB' : '#3B82F6',
          background: isSelected ? '#EFF6FF' : '#F3F4F6',
        };
      case 'distribution':
        return {
          ...baseStyles,
          borderColor: isSelected ? '#059669' : '#10B981',
          background: isSelected ? '#ECFDF5' : '#F3F4F6',
        };
      default:
        return {
          ...baseStyles,
          borderColor: isSelected ? '#4B5563' : '#9CA3AF',
          background: isSelected ? '#F9FAFB' : '#F3F4F6',
        };
    }
  };

  const nodeStyles = getNodeStyles();
  const nodeSize = 60;

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(nodeId)}
      onMouseEnter={() => onHover(nodeId)}
      onMouseLeave={() => onHover(null)}
      className={`
        cursor-pointer transition-all duration-200 ease-in-out
        ${isHovered ? 'scale-101' : ''}
        ${isSelected ? 'scale-101' : ''}
      `}
    >
      {/* Node Shape with Shadow */}
      <g filter="url(#shadow)">
        {getNodeType() === 'validation' ? (
          <path
            d={`M 0,-${nodeSize} L ${nodeSize},0 L 0,${nodeSize} L -${nodeSize},0 Z`}
            fill={nodeStyles.background}
            stroke={nodeStyles.borderColor}
            strokeWidth={isSelected ? 2 : 1.5}
            className="transition-all duration-200"
          />
        ) : getNodeType() === 'distribution' ? (
          <circle
            r={nodeSize}
            fill={nodeStyles.background}
            stroke={nodeStyles.borderColor}
            strokeWidth={isSelected ? 2 : 1.5}
            className="transition-all duration-200"
          />
        ) : (
          <rect
            x={-nodeSize}
            y={-nodeSize}
            width={nodeSize * 2}
            height={nodeSize * 2}
            rx="8"
            fill={nodeStyles.background}
            stroke={nodeStyles.borderColor}
            strokeWidth={isSelected ? 2 : 1.5}
            className="transition-all duration-200"
          />
        )}
      </g>

      {/* Node Content */}
      <foreignObject
        x={-nodeSize}
        y={-nodeSize}
        width={nodeSize * 2}
        height={nodeSize * 2}
        className="pointer-events-none"
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          {/* Process Name */}
          <div className={`
            text-center leading-tight
            ${isSelected ? 'text-gray-900' : 'text-gray-700'}
            font-medium text-sm
          `}>
            {getProcessName()}
          </div>
          
          {/* Node ID */}
          <div className={`
            mt-1 text-xs
            ${isSelected ? 'text-gray-600' : 'text-gray-500'}
          `}>
            {getDisplayId()}
          </div>
        </div>
      </foreignObject>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <rect
          x={-nodeSize - 2}
          y={-nodeSize - 2}
          width={(nodeSize * 2) + 4}
          height={(nodeSize * 2) + 4}
          rx="10"
          fill="none"
          stroke={nodeStyles.borderColor}
          strokeWidth="2"
          strokeDasharray="4 2"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

// Add filter definition to your SVG in ProcessFlowchart
const ShadowFilter = () => (
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow 
        dx="0" 
        dy="2" 
        stdDeviation="3"
        floodColor="#000000"
        floodOpacity="0.1"
      />
    </filter>
  </defs>
);

export default NodeComponent;