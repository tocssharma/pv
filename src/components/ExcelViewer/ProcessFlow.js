// ProcessFlow.js
import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import dagre from 'dagre';
import { EditForm, updateRowData, generateNextId } from './processUtils';
import 'reactflow/dist/style.css';

const getStepType = (metadata = {}) => {
  try {
    // Find any field that includes 'step type' (case insensitive)
    const stepTypeField = Object.keys(metadata)
      .find(key => key && typeof key === 'string' && key.toLowerCase().includes('step type'));
    
    if (!stepTypeField || !metadata[stepTypeField]) {
      return 'normal';
    }

    const stepType = metadata[stepTypeField].toLowerCase();
    // Only return valid step types
    return ['normal', 'validation', 'distribution'].includes(stepType) ? stepType : 'normal';
  } catch (error) {
    console.warn('Error getting step type:', error);
    return 'normal';
  }
};

const Diamond = ({ className = '' }) => (
  <div className="relative w-16 h-16">
    <div className={`absolute w-12 h-12 left-2 top-2 transform rotate-45 border-2 border-gray-400 bg-white ${className}`} />
    <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-400 -translate-x-1/2 -translate-y-full" />
  </div>
);

const Circle = ({ className = '' }) => (
  <div className="relative w-16 h-16">
    <div className={`absolute w-12 h-12 left-2 top-2 rounded-full border-2 border-gray-400 bg-white ${className}`} />
    <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-400 -translate-x-1/2 -translate-y-full" />
  </div>
);

// Helper for determining edge colors
const isNegativeCondition = (condition) => {
  return condition?.toLowerCase().includes('no') || condition?.toLowerCase().includes('not');
};

const getValidationEdgeColors = (edges, sourceId, conditions) => {
  const existingEdges = edges.filter(e => e.source === sourceId);
  let leftColor, rightColor;

  const leftCondition = conditions[0] || '';
  const rightCondition = conditions[1] || '';

  if (leftCondition && rightCondition) {
    const leftIsNegative = isNegativeCondition(leftCondition);
    const rightIsNegative = isNegativeCondition(rightCondition);

    if (leftIsNegative && rightIsNegative) {
      leftColor = '#EF4444';
      rightColor = '#3B82F6';
    } else if (leftIsNegative) {
      leftColor = '#EF4444';
      rightColor = '#3B82F6';
    } else if (rightIsNegative) {
      leftColor = '#3B82F6';
      rightColor = '#EF4444';
    } else {
      leftColor = '#3B82F6';
      rightColor = '#EF4444';
    }
  } else if (!leftCondition && !rightCondition) {
    leftColor = '#EF4444';
    rightColor = '#3B82F6';
  } else {
    const existingCondition = leftCondition || rightCondition;
    const isNegative = isNegativeCondition(existingCondition);
    
    leftColor = leftCondition ? (isNegative ? '#EF4444' : '#3B82F6') : '#3B82F6';
    rightColor = rightCondition ? (isNegative ? '#EF4444' : '#3B82F6') : '#EF4444';
  }

  return existingEdges.length === 0 ? leftColor : rightColor;
};

// Custom layout function
const getCustomLayout = (nodes, edges) => {
  console.log("ProcessFlow - getCustomLayout received nodes:", nodes);
  
  nodes.forEach((node) => {
    console.log("ProcessFlow - Processing node in layout:", {
      nodeId: node.id,
      nodeData: node.data,
      metadata: node.data?.metadata,
      stepType: getStepType(node.data?.metadata)
    });
  });
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ 
    rankdir: 'TB',
    nodesep: 100,
    ranksep: 200,
    align: 'UL',
    ranker: 'tight-tree'
  });

  nodes.forEach((node) => {
    const stepType = getStepType(node.data.metadata);
    const width = 250;
    const height = stepType === 'normal' ? 100 : 150;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const stepType = getStepType(node.data.metadata);
    
    if (stepType === 'validation') {
      const outgoingEdges = edges.filter(e => e.source === node.id);
      const leftEdge = outgoingEdges.find(e => e.sourceHandle === 'source-left');
      const rightEdge = outgoingEdges.find(e => e.sourceHandle === 'source-right');
      const successorY = nodeWithPosition.y + 300;

      if (leftEdge) {
        dagreGraph.setNode(leftEdge.target, { 
          x: nodeWithPosition.x - 300,
          y: successorY
        });
      }

      if (rightEdge) {
        dagreGraph.setNode(rightEdge.target, {
          x: nodeWithPosition.x + 300,
          y: successorY
        });
      }
    }
    
    if (stepType === 'distribution') {
      const successors = edges
        .filter(e => e.source === node.id)
        .map(e => e.target);
      
      successors.forEach((successor, index) => {
        const offset = (index - (successors.length - 1) / 2) * 200;
        dagreGraph.setNode(successor, {
          x: nodeWithPosition.x + offset,
          y: nodeWithPosition.y + 200
        });
      });
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 50
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ProcessNode component
const ProcessNode = memo(({ data }) => {
  const { id, name, metadata = {} } = data;
  const stepType = getStepType(metadata);
  
  const getSourceHandles = () => {
    switch (stepType) {
      case 'validation':
        return [
          { id: 'source-left', type: 'source', position: Position.Left },
          { id: 'source-right', type: 'source', position: Position.Right }
        ];
      case 'distribution':
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

  const sourceHandles = getSourceHandles();

  const renderShape = () => {
    switch (stepType) {
      case 'validation':
        return (
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Diamond />
              {sourceHandles.map(handle => (
                <Handle
                  key={handle.id}
                  type={handle.type}
                  position={handle.position}
                  id={handle.id}
                  className="w-2 h-2 !bg-blue-500"
                  style={handle.style}
                />
              ))}
            </div>
          </div>
        );
      case 'distribution':
        return (
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Circle />
              {sourceHandles.map(handle => (
                <Handle
                  key={handle.id}
                  type={handle.type}
                  position={handle.position}
                  id={handle.id}
                  className="w-2 h-2 !bg-blue-500"
                  style={handle.style}
                />
              ))}
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

  return (
    <div className="relative">
      <div className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-[200px]">
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          className="w-2 h-2 !bg-blue-500"
        />
        
        <div className="font-bold text-sm text-gray-700 mb-2">{id}</div>
        <div className="text-sm text-gray-900 mb-2">{name}</div>
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-600">
            {key}: {value}
          </div>
        ))}
      </div>
      {renderShape()}
    </div>
  );
});
// Define nodeTypes outside and before any component
const nodeTypes = {
  process: ProcessNode
};

// Flow component
const Flow = memo(({ rows, levelConfig, onAddNode, onUpdateNode, onUpdateRelationship }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // Initialize nodes and edges from rows
  const getInitialElements = useCallback(() => {
    if (!rows || !levelConfig) return;

    const initialNodes = rows.map((row) => ({
      id: row[levelConfig.id],
      type: 'process',
      data: {
        id: row[levelConfig.id],
        name: row[levelConfig.name],
        metadata: levelConfig.metadata?.reduce((acc, field) => {
          acc[field] = row[field]  || '';
          return acc;
        }, {})
      },
      position: { x: 0, y: 0 },
    }));
  
    const initialEdges = [];
    if (levelConfig.relationship) {
      rows.forEach(row => {
        const predecessorField = levelConfig.relationship.predecessor;
        const conditionField = levelConfig.relationship.condition;
        
        if (row[predecessorField]) {
          const predecessors = row[predecessorField].split(',').map(p => p.trim());
          predecessors.forEach(predId => {
            if (predId) {
              const sourceNode = initialNodes.find(n => n.id === predId);
              const sourceType = sourceNode ? getStepType(sourceNode.data.metadata) : 'normal';
              let sourceHandle = 'source';
              let edgeColor = '#333';
              
              if (sourceType === 'validation') {
                const validationTargets = rows.filter(r => 
                  r[predecessorField]?.split(',').map(p => p.trim()).includes(predId)
                );
                const conditions = validationTargets.map(t => t[conditionField]);
                const existingEdges = initialEdges.filter(e => e.source === predId);
                sourceHandle = existingEdges.length === 0 ? 'source-left' : 'source-right';
                edgeColor = getValidationEdgeColors(initialEdges, predId, conditions);
              }
  
              initialEdges.push({
                id: `edge-${predId}-${sourceHandle}-${row[levelConfig.id]}`,
                source: predId,
                target: row[levelConfig.id],
                sourceHandle,
                label: row[conditionField] || '',
                type: 'smoothstep',
                animated: true,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: edgeColor
                },
                style: { 
                  stroke: edgeColor,
                  strokeWidth: 2
                },
              });
            }
          });
        }
      });
    }
  
    return getCustomLayout(initialNodes, initialEdges);
  }, [rows, levelConfig]);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getInitialElements() || { nodes: [], edges: [] };
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [getInitialElements, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setIsEditFormOpen(true);
  }, []);

  const handleNodeUpdate = useCallback((formData) => {
    // Log for debugging
    console.log("handleNodeUpdate - Initial formData:", formData);
    console.log("handleNodeUpdate - Current rows:", rows);
  
    // Create updated rows using updateRowData
    const updatedRows = updateRowData(formData, rows, levelConfig);
    
    // Log resulting rows
    console.log("handleNodeUpdate - Updated rows:", updatedRows);
  
    // Set states and call update callback
    setNodes((prevNodes) => {
      return prevNodes.map(node => {
        if (node.id === formData[levelConfig.id]) {
          return {
            ...node,
            data: {
              ...node.data,
              id: formData[levelConfig.id],
              name: formData[levelConfig.name],
              metadata: levelConfig.metadata?.reduce((acc, field) => {
                acc[field] = formData[field] || '';
                return acc;
              }, {})
            }
          };
        }
        return node;
      });
    });
    onUpdateNode(updatedRows);
    setIsEditFormOpen(false);
    setSelectedNode(null);
  }, [rows, levelConfig, onUpdateNode]);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const sourceType = sourceNode ? getStepType(sourceNode.data.metadata) : 'normal';
    let edgeColor = '#333';
  
    if (sourceType === 'validation') {
      const existingEdges = edges.filter(e => e.source === params.source);
      const conditions = edges
        .filter(e => e.source === params.source)
        .map(e => e.label || '')
        .concat(['']);
  
      edgeColor = getValidationEdgeColors(existingEdges, params.source, conditions);
    }
  
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.sourceHandle}-${params.target}`,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor
      },
      style: { 
        stroke: edgeColor,
        strokeWidth: 2
      },
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    onUpdateRelationship(params.source, params.target);
  }, [nodes, edges, setEdges, onUpdateRelationship]);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#333' },
  }), []);

  return (
    <div className="w-full h-[600px] relative">
      {/* EditForm Modal */}
      {isEditFormOpen && (
        <EditForm
          isOpen={isEditFormOpen}
          node={selectedNode}
          levelConfig={levelConfig}
          rows={rows}
          onSave={handleNodeUpdate}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedNode(null);
          }}
          parentId={selectedNode?.data?.id}
        />
      )}
  
      {/* Add Node Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            setSelectedNode(null);
            setIsEditFormOpen(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
        >
          Add Node
        </button>
      </div>
  
      {/* ReactFlow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={defaultEdgeOptions}
        className="w-full h-full"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
  });
  
  // Wrap with ReactFlowProvider for context
  const ProcessFlow = memo((props) => {
    return (
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    );
  });
  
  export default ProcessFlow;