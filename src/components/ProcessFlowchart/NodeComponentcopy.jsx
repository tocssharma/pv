import React from 'react';

const NodeComponent = ({ 
  nodeId, 
  position,
  processData, 
  isSelected,
  isHovered,
  onSelect, 
  onHover 
}) => {
  const { x, y } = position;

  // Get node data
  const getNodeData = () => {
    for (const [_, nodes] of processData) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  };

  const nodeData = getNodeData();
  if (!nodeData) return null;

  // Get process name
  const getProcessName = () => {
    if (!nodeData?.attributes) return '';
    const processNameAttr = nodeData.attributes.find(attr => 
      attr.key.includes('Process Name') || attr.key === 'processName'
    );
    return processNameAttr?.value || '';
  };

  // Get node type
  const getNodeType = () => {
    if (!nodeData?.relationships) return 'default';
    if (nodeData.relationships.some(r => r.type === 'Validation')) return 'validation';
    if (nodeData.relationships.some(r => r.type === 'Distribution')) return 'distribution';
    return 'default';
  };

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(nodeId)}
      onMouseEnter={() => onHover(nodeId)}
      onMouseLeave={() => onHover(null)}
      className={`
        cursor-pointer transition-transform duration-200
        ${isHovered ? 'scale-105' : ''}
        ${isSelected ? 'scale-110' : ''}
      `}
    >
      {/* Node Shape */}
      {getNodeType() === 'validation' ? (
        <path
          d="M 0,-30 L 30,0 L 0,30 L -30,0 Z"
          className={`
            ${isSelected ? 'fill-blue-200 stroke-blue-600' : 'fill-blue-100 stroke-blue-500'}
            transition-colors duration-200
          `}
          strokeWidth={isSelected ? 2 : 1}
        />
      ) : getNodeType() === 'distribution' ? (
        <circle
          r="30"
          className={`
            ${isSelected ? 'fill-green-200 stroke-green-600' : 'fill-green-100 stroke-green-500'}
            transition-colors duration-200
          `}
          strokeWidth={isSelected ? 2 : 1}
        />
      ) : (
        <rect
          x="-30"
          y="-30"
          width="60"
          height="60"
          rx="4"
          className={`
            ${isSelected ? 'fill-gray-200 stroke-gray-600' : 'fill-gray-100 stroke-gray-500'}
            transition-colors duration-200
          `}
          strokeWidth={isSelected ? 2 : 1}
        />
      )}

      {/* Process Name */}
      <text
        textAnchor="middle"
        dy=".3em"
        className={`
          text-xs font-medium
          ${isSelected ? 'fill-gray-900' : 'fill-gray-700'}
        `}
      >
        {getProcessName()}
      </text>
    </g>
  );
};

export default NodeComponent;