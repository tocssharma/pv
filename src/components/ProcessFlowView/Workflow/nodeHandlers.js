import React, { useRef, useState, useCallback, useLayoutEffect, useMemo,memo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  MarkerType,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow
} from 'reactflow';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronRight, ChevronDown } from 'lucide-react';
import 'reactflow/dist/style.css';
const useNodeOperations = (setNodes, setEdges, nodes, edges) => {
    // Delete node and its edges
    const handleDeleteNode = useCallback((nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ));
    }, [setNodes, setEdges]);
  
    // Resize node
    const handleResizeNode = useCallback((node) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            const newSize = n.style?.width === 200 ? 100 : 200;
            return {
              ...n,
              style: {
                ...n.style,
                width: newSize,
                height: newSize,
              },
            };
          }
          return n;
        })
      );
    }, [setNodes]);
  
    // Change node color
    const handleColorChange = useCallback((nodeId, color) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Handle both custom and shape nodes
            if (node.type === 'shape') {
              return {
                ...node,
                data: {
                  ...node.data,
                  backgroundColor: color,
                },
              };
            } else {
              return {
                ...node,
                data: {
                  ...node.data,
                  backgroundColor: color,
                },
                style: {
                  ...node.style,
                  backgroundColor: color,
                },
              };
            }
          }
          return node;
        })
      );
    }, [setNodes]);
  
    // Change node shape
    const handleShapeChange = useCallback((nodeId, shape) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const currentData = node.data;
            return {
              ...node,
              type: 'shape',
              data: {
                ...currentData,
                type: shape,
                label: currentData.label || shape.charAt(0).toUpperCase() + shape.slice(1)
              },
            };
          }
          return node;
        })
      );
    }, [setNodes]);
  
    // Handle connections between nodes
    const handleConnect = useCallback((params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      
      // Prevent self-connections
      if (params.source === params.target) {
        return;
      }
      
      // Prevent duplicate connections
      const duplicateEdge = edges.find(
        edge => edge.source === params.source && edge.target === params.target
      );
      if (duplicateEdge) {
        return;
      }
      
      // Generate unique edge ID
      const edgeId = `${params.source}-${params.target}`;
      
      // Create new edge with default styling
      const newEdge = {
        id: edgeId,
        source: params.source,
        target: params.target,
        type: 'custom',
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        data: {
          edgeType: 'default',
          label: '',
          animated: false
        },
        style: { stroke: '#2563eb' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#2563eb'
        }
      };
      
      setEdges((eds) => [...eds, newEdge]);
      
      // Update target node's metadata
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.target) {
            return {
              ...node,
              data: {
                ...node.data,
                metadata: {
                  ...node.data.metadata,
                  predecessors: [
                    ...(node.data.metadata?.predecessors || []),
                    params.source,
                  ],
                },
              },
            };
          }
          return node;
        })
      );
    }, [nodes, edges, setEdges, setNodes]);
  
    // Change edge type
    const handleEdgeTypeChange = useCallback((edgeId, newType) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              data: {
                ...edge.data,
                edgeType: newType,
                animated: newType === 'animated',
              },
              style: {
                ...edge.style,
                strokeDasharray: newType === 'dashed' ? '5,5' : null,
              },
            };
          }
          return edge;
        })
      );
    }, [setEdges]);
  
    // Save node to backend
    const handleSaveNode = useCallback(async (nodeData) => {
      try {
        const response = await fetch('/api/nodes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nodeData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save node');
        }
        
        const savedNode = await response.json();
        
        // Update local state with saved node data
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === savedNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...savedNode,
                },
              };
            }
            return node;
          })
        );
        
        return savedNode;
      } catch (error) {
        console.error('Error saving node:', error);
        throw error;
      }
    }, [setNodes]);
  
    // Update node metadata
    const handleMetadataUpdate = useCallback((nodeId, metadata) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                metadata: {
                  ...node.data.metadata,
                  ...metadata,
                },
              },
            };
          }
          return node;
        })
      );
    }, [setNodes]);
  
    return {
      handleDeleteNode,
      handleResizeNode,
      handleColorChange,
      handleShapeChange,
      handleConnect,
      handleSaveNode,
      handleEdgeTypeChange,
      handleMetadataUpdate,
    };
  };

  
  export { useNodeOperations}