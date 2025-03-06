import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component to display process information
const ProcessNode = ({ data }) => {
  const { id, name, metadata = {} } = data;
  
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-[200px]">
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

const ProcessFlow = ({ rows, levelConfig, onAddNode, onUpdateRelationship }) => {
  // Transform rows into nodes
  const getInitialNodes = () => {
    return rows.map((row, index) => ({
      id: row[levelConfig.id],
      type: 'process',
      position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        id: row[levelConfig.id],
        name: row[levelConfig.name],
        metadata: levelConfig.metadata?.reduce((acc, field) => {
          acc[field] = row[field];
          return acc;
        }, {})
      }
    }));
  };

  // Transform relationships into edges
  const getInitialEdges = () => {
    const edges = [];
    console.log("ProcessFlow:getInitialEdges:levelConfig",levelConfig);
    console.log("ProcessFlow:getInitialEdges:rows",rows);
    
    
    if (levelConfig.relationship) {
      rows.forEach(row => {
        const predecessors = row[levelConfig.relationship.predecessor]?.split(',') || [];
        const condition = row[levelConfig.relationship.condition];
        
        predecessors.forEach(predecessor => {
          const predId = predecessor.trim();
          if (predId) {
            edges.push({
              id: `${predId}-${row[levelConfig.id]}`,
              source: predId,
              target: row[levelConfig.id],
              label: condition,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              className: 'text-xs',
            });
          }
        });
      });
    }
    console.log("ProcessFlow:getInitialEdges:edges",edges);
    return edges;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  const onConnect = useCallback((params) => {
    // When a new connection is made, update the relationships
    const newEdge = {
      ...params,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
    
    // Call the callback to update relationships in the parent component
    if (onUpdateRelationship) {
      onUpdateRelationship(params.source, params.target);
    }
  }, [setEdges, onUpdateRelationship]);

  const handleAddNode = useCallback(() => {
    if (onAddNode) {
      onAddNode();
    }
  }, [onAddNode]);

  console.log("ProcessFLow:BeforeReturn:Nodes",nodes);
  console.log("ProcessFLow:BeforeReturn:Edges",edges);
  
  return (
    <div className="w-full h-[600px]">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleAddNode}
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
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlow;