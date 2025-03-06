import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import _ from 'lodash';

// Common handle styles that will be used across different handle types
const baseHandleStyle = {
  width: '12px',
  height: '12px',
  border: '2px solid white',
};


// Updated base handle style
const getBaseHandleStyle = (position, layoutDirection, type) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  border: '2px solid white',
  borderRadius: '50%',
  background: '#fff',
  ...getHandleOffset(position, layoutDirection, type)
});


const getValidationHandlePositions = (layoutDirection) => {
  if (layoutDirection === 'TB') {
    return {
      false: {
        position: Position.Left,
        style: {
          left: '-8px',
          bottom: '50%',
          transform: 'translateY(50%)'
        }
      },
      true: {
        position: Position.Right,
        style: {
          right: '-8px',
          bottom: '50%',
          transform: 'translateY(50%)'
        }
      }
    };
  } else {
    return {
      false: {
        position: Position.Top,
        style: {
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }
      },
      true: {
        position: Position.Bottom,
        style: {
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }
      }
    };
  }
};



const getHandleOffset = (position, layoutDirection, type) => {
  const defaultOffset = '8px';
  
  // Base positioning for all handles
  const basePosition = {
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%'
  };

  if (layoutDirection === 'TB') {
    switch (position) {
      case Position.Top:
        return {
          ...basePosition,
          top: `-${defaultOffset}`,
          left: '50%'
        };
      case Position.Bottom:
        return {
          ...basePosition,
          bottom: `-${defaultOffset}`,
          top: 'auto',
          left: '50%'
        };
      case Position.Left:
        return {
          ...basePosition,
          left: `-${defaultOffset}`,
          top: '50%'
        };
      case Position.Right:
        return {
          ...basePosition,
          right: `-${defaultOffset}`,
          left: 'auto',
          top: '50%'
        };
      default:
        return basePosition;
    }
  } else {
    // For LR layout
    const actualPosition = type === 'source' ? Position.Right : Position.Left;
    
    return {
      ...basePosition,
      ...(actualPosition === Position.Left && {
        left: `-${defaultOffset}`,
        top: '50%'
      }),
      ...(actualPosition === Position.Right && {
        right: `-${defaultOffset}`,
        left: 'auto',
        top: '50%'
      })
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

  // Update base style calculation
  const baseStyle = useMemo(() => ({
    ...getBaseHandleStyle(position, layoutDirection, type),
    background: handleColor // Override background with handle color
  }), [position, layoutDirection, type, handleColor]);

  // Determine the actual position based on layout direction
  const getActualPosition = (originalPosition, handleType) => {
    if (layoutDirection === 'TB') return originalPosition;
    return handleType === 'source' ? Position.Right : Position.Left;
  };

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
    const positions = getValidationHandlePositions(layoutDirection);
    return (
      <>
        <Handle
          type="source"
          position={positions.false.position}
          id="validation-false"
          style={{
            ...baseStyle,
            //...baseHandleStyle,
            background: '#ef4444',
            ...positions.false.style
            //left: '-8px',
            //bottom: '20px'
          }}
        />
        <Handle
          type="source"
          position={positions.true.position}
          id="validation-true"
          style={{
            ...baseStyle,
            //...baseHandleStyle,
            background: '#22c55e',
            ...positions.true.style
            //right: '-8px',
            //bottom: '20px'
          }}
        />
      </>
    );
  }
  return (
    <Handle
      type="target"
      position={getActualPosition(Position.Top, 'target')}
      id="target-default" 
      style={{
        ...baseStyle,
        //...baseHandleStyle,
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
        position={getActualPosition(position, type)}
        id={`${type}-default-${nodeId}`}
        style={{
          ...baseStyle,
          //...baseHandleStyle,
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
          position={getActualPosition(handle.position, type)}
          id={handle.id}
          style={{
            ...baseStyle,
            //...baseHandleStyle,
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