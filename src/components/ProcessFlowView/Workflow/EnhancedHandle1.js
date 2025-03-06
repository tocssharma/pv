import React, { useCallback, useEffect, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import _ from 'lodash';

// Common handle styles that will be used across different handle types
const baseHandleStyle = {
  width: '12px',
  height: '12px',
  border: '2px solid white',
};

// Helper to generate unique handle IDs
const generateHandleId = (type, nodeId, targetId = null) => {
  if (targetId) {
    return `${type}-${nodeId}-${targetId}`;
  }
  return `${type}-${nodeId}-${Date.now()}`;
};

// Helper to calculate handle position on the node
const calculateHandlePosition = (position, index, total) => {
  if (total <= 1) return undefined;
  
  const spacing = 100 / (total + 1);
  const offset = spacing * (index + 1);
  
  return {
    top: position === Position.Left || position === Position.Right ? `${offset}%` : undefined,
    left: position === Position.Top || position === Position.Bottom ? `${offset}%` : undefined,
  };
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
  ...props 
}) => {
  const { getNode, getEdges, setNodes } = useReactFlow();
  const [handles, setHandles] = useState([]);
  
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
        position={position}
        id={`${type}-default-${nodeId}`}
        style={{
          ...baseHandleStyle,
          background: handleColor,
          ...style
        }}
        onConnect={handleConnect}
        // Add these data attributes for debugging
        data-handleid={id}
        data-handletype={type}
        data-handlepos={position}
        data-nodeid={nodeId}
        {...props}
        
      />
      
      {/* Dynamic handles created from connections */}
      {handles.map((handle, index) => (
        <Handle
          key={handle.id}
          type={type}
          position={handle.position}
          id={handle.id}
          style={{
            ...baseHandleStyle,
            background: handleColor,
            ...calculateHandlePosition(handle.position, index, handles.length),
            ...style
          }}
        />
      ))}
    </>
  );
};

export default EnhancedHandle;