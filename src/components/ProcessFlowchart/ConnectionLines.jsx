import React from 'react';

const ConnectionLines = ({ sourceNode, targetNode }) => {
  // Calculate straight line between siblings
  const path = `M ${sourceNode.x + 40},${sourceNode.y} L ${targetNode.x - 40},${targetNode.y}`;

  return (
    <path
      d={path}
      stroke="#9CA3AF"
      strokeWidth="1.5"
      fill="none"
      markerEnd="url(#arrow)"
    />
  );
};

export default ConnectionLines;