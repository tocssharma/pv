import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre'; // For automatic layout

// Custom node component to display process information
const ProcessNode = ({ data }) => {
  const { id, name, metadata = {} } = data;
  
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-[200px] relative">
      {/* Target handles */}
      <Handle
        type="target"
        position="top"
        id="target-top"
        className="w-2 h-2 !bg-blue-500"
      />
      <Handle
        type="target"
        position="left"
        id="target-left"
        className="w-2 h-2 !bg-blue-500"
      />
      
      {/* Source handles */}
      <Handle
        type="source"
        position="bottom"
        id="source-bottom"
        className="w-2 h-2 !bg-blue-500"
      />
      <Handle
        type="source"
        position="right"
        id="source-right"
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
  );
};

const nodeTypes = {
  process: ProcessNode,
};

// Layout helper function
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Layout the graph
  dagre.layout(dagreGraph);

  // Get the positioned nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125, // center offset
        y: nodeWithPosition.y - 50,  // center offset
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const Flow = ({ rows, levelConfig, onAddNode, onUpdateRelationship }) => {
  // Transform rows into nodes and edges
  const getInitialElements = () => {
    const initialNodes = rows.map((row) => ({
      id: row[levelConfig.id],
      type: 'process',
      data: {
        id: row[levelConfig.id],
        name: row[levelConfig.name],
        metadata: levelConfig.metadata?.reduce((acc, field) => {
          acc[field] = row[field];
          return acc;
        }, {})
      },
      position: { x: 0, y: 0 }, // Initial position will be set by layout
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
              initialEdges.push({
                id: `edge-${predId}-${row[levelConfig.id]}`,
                source: predId,
                target: row[levelConfig.id],
                label: row[conditionField] || '',
                type: 'smoothstep',
                animated: true,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
                style: { stroke: '#333' },
              });
            }
          });
        }
      });
    }

    // Apply automatic layout
    return getLayoutedElements(initialNodes, initialEdges);
  };

  const { nodes: initialNodes, edges: initialEdges } = getInitialElements();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: 'smoothstep',
      animated: true,
      label: '', // Initial empty condition
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#333' },
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    
    if (onUpdateRelationship) {
      onUpdateRelationship(params.source, params.target);
    }
  }, [setEdges, onUpdateRelationship]);

  return (
    <div className="w-full h-[600px]">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onAddNode}
          className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
        >
          Add Node
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#333' },
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// Wrap the flow component with ReactFlowProvider
const ProcessFlow = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};

export default ProcessFlow;