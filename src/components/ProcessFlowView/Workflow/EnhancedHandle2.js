import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import _ from 'lodash';

// Common handle styles that will be used across different handle types
const baseHandleStyle = {
  width: '12px',
  height: '12px',
  border: '2px solid white',
};


// Enhanced base handle styles with dynamic positioning
const getBaseHandleStyle = (position, layoutDirection) => ({
  width: '12px',
  height: '12px',
  border: '2px solid white',
  ...getHandleOffset(position, layoutDirection)
});

// Helper to determine handle position based on layout direction
const getHandleOffset = (position, layoutDirection) => {
  const defaultOffset = '8px';
  
  if (layoutDirection === 'TB') {
    return {
      left: position === Position.Left ? `-${defaultOffset}` : undefined,
      right: position === Position.Right ? `-${defaultOffset}` : undefined,
      top: position === Position.Top ? `-${defaultOffset}` : undefined,
      bottom: position === Position.Bottom ? `-${defaultOffset}` : undefined,
    };
  } else {
    // For LR layout, swap top/bottom positions with left/right
    const swappedPosition = position === Position.Top ? Position.Left :
                          position === Position.Bottom ? Position.Right :
                          position === Position.Left ? Position.Top :
                          position === Position.Right ? Position.Bottom :
                          position;
    
    return {
      left: swappedPosition === Position.Left ? `-${defaultOffset}` : undefined,
      right: swappedPosition === Position.Right ? `-${defaultOffset}` : undefined,
      top: swappedPosition === Position.Top ? `-${defaultOffset}` : undefined,
      bottom: swappedPosition === Position.Bottom ? `-${defaultOffset}` : undefined,
    };
  }
};

// Helper to generate unique handle IDs
const generateHandleId = (type, nodeId, targetId = null) => {
  if (targetId) {
    return `${type}-${nodeId}-${targetId}`;
  }
  return `${type}-${nodeId}-${Date.now()}`;
};

// Helper to calculate handle position on the node with layout direction support
const calculateHandlePosition = (position, index, total, layoutDirection) => {
  if (total <= 1) return undefined;
  
  const spacing = 100 / (total + 1);
  const offset = spacing * (index + 1);
  
  if (layoutDirection === 'TB') {
    return {
      top: (position === Position.Left || position === Position.Right) ? `${offset}%` : undefined,
      left: (position === Position.Top || position === Position.Bottom) ? `${offset}%` : undefined,
    };
  } else {
    // For LR layout, swap the position calculation
    return {
      left: (position === Position.Top || position === Position.Bottom) ? `${offset}%` : undefined,
      top: (position === Position.Left || position === Position.Right) ? `${offset}%` : undefined,
    };
  }
};

// Get adjusted position based on layout direction
const getAdjustedPosition = (position, layoutDirection) => {
  if (layoutDirection === 'TB') return position;
  
  // Map positions for LR layout
  const positionMap = {
    [Position.Top]: Position.Left,
    [Position.Bottom]: Position.Right,
    [Position.Left]: Position.Top,
    [Position.Right]: Position.Bottom
  };
  
  return positionMap[position] || position;
};

const EnhancedHandle = ({
  type,
  position,
  id,
  nodeId,
  style,
  metadata = {},
  onConnect,
  isValidationNode = false,
  handleColor = '#2563eb',
  layoutDirection = 'TB', // Add layoutDirection prop with default
  ...props 
}) => {
  const { getNode, getEdges, setNodes } = useReactFlow();
  const [handles, setHandles] = useState([]);
  
  // Adjust position based on layout direction
  const adjustedPosition = useMemo(() => 
    getAdjustedPosition(position, layoutDirection),
    [position, layoutDirection]
  );

  // Get base style with layout direction considerations
  const baseStyle = useMemo(() => 
    getBaseHandleStyle(adjustedPosition, layoutDirection),
    [adjustedPosition, layoutDirection]
  );


  // Initialize handles from metadata if they exist
  useEffect(() => {
    if (metadata.handles?.[type]) {
      setHandles(metadata.handles[type]);
    }
  }, [metadata, type]);

  // Update node metadata when handles change
  const updateNodeMetadata = useCallback((newHandles) => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              handles: {
                ...node.data.metadata?.handles,
                [type]: newHandles
              }
            }
          }
        };
      }
      return node;
    }));
  }, [nodeId, setNodes, type]);

  // Create a new handle when a connection is made
  const handleConnect = useCallback((params) => {
    // Don't create new handles for validation nodes
    if (isValidationNode) {
      if (onConnect) onConnect(params);
      return;
    }

    const newHandle = {
      id: generateHandleId(type, nodeId, params.target || params.source),
      position,
      connectionId: params.target || params.source
    };

    setHandles(prev => {
      const updated = [...prev, newHandle];
      updateNodeMetadata(updated);
      return updated;
    });

    if (onConnect) onConnect(params);
  }, [nodeId, position, type, onConnect, isValidationNode, updateNodeMetadata]);

 // For validation nodes, render the predefined handles
 if (isValidationNode) {
  if (type === 'source') {
    return (
      <>
        <Handle
          type="source"
          position={Position.Left}
          id="validation-false"
          style={{
            ...baseHandleStyle,
            background: '#ef4444',
            left: '-8px',
            bottom: '20px'
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="validation-true"
          style={{
            ...baseHandleStyle,
            background: '#22c55e',
            right: '-8px',
            bottom: '20px'
          }}
        />
      </>
    );
  }
  return (
    <Handle
      type="target"
      position={Position.Top}
      id="target-default"
      style={{
        ...baseHandleStyle,
        background: handleColor
      }}
    />
  );
}

  // For regular nodes, render dynamic handles
  return (
    <>
      {/* Default handle that's always present */}
      <Handle
        type={type}
        position={adjustedPosition}
        id={`${type}-default-${nodeId}`}
        style={{
          //...baseStyle,
          ...baseHandleStyle,
          background: handleColor,
          ...style
        }}
        onConnect={handleConnect}
        // Add these data attributes for debugging
        data-handleid={id}
        data-handletype={type}
        data-handlepos={adjustedPosition}
        data-nodeid={nodeId}
        {...props}
        
      />
      
      {/* Dynamic handles created from connections */}
      {handles.map((handle, index) => (
        <Handle
          key={handle.id}
          type={type}
          //position={handle.position}
          position={getAdjustedPosition(handle.position, layoutDirection)}
          id={handle.id}
          style={{
            //...baseStyle,
            ...baseHandleStyle,
            background: handleColor,
            ...calculateHandlePosition(handle.position, index, handles.length, layoutDirection),
            ...style
          }}
        />
      ))}
    </>
  );
};

export default EnhancedHandle;