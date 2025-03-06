import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import 'reactflow/dist/style.css';


const NodeEditForm = memo(({ node, levelConfig, onSave, onClose, rows }) => {
  const lastRow = rows?.[rows.length - 1];
  
  const generateNextId = (parentId, existingIds) => {
    const childIds = existingIds.filter(id => id.startsWith(parentId + '-'));
    const lastNumbers = childIds.map(id => {
      const lastPart = id.split('-').pop();
      return parseInt(lastPart, 10);
    });
    const maxNumber = lastNumbers.length > 0 ? Math.max(...lastNumbers) : 0;
    const nextNumber = (maxNumber + 1).toString().padStart(2, '0');
    return `${parentId}-${nextNumber}`;
  };

  const initializeFormData = () => {
    if (node) {
      return {
        [levelConfig.id]: node.data?.id || '',
        [levelConfig.name]: node.data?.name || '',
        ...node.data?.metadata || {}
      };
    } else {
      const existingIds = rows?.map(row => row[levelConfig.id]) || [];
      const newId = generateNextId(rows?.[0]?.[levelConfig.id]?.split('-').slice(0, -1).join('-') || '', existingIds);

      return {
        [levelConfig.id]: newId,
        [levelConfig.name]: newId,
        ...(levelConfig.metadata?.reduce((acc, field) => {
          if (field.toLowerCase().includes('step type')) {
            acc[field] = 'Normal';
          } else if (levelConfig.relationship && (
            field === levelConfig.relationship.predecessor ||
            field === levelConfig.relationship.condition
          )) {
            acc[field] = '';
          } else {
            acc[field] = lastRow?.[field] || '';
          }
          return acc;
        }, {}))
      };
    }
  };

  const [formData, setFormData] = useState(initializeFormData());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{node ? 'Edit Node' : 'Add New Node'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor={levelConfig.id}>ID</Label>
            <input
              id={levelConfig.id}
              value={formData[levelConfig.id] || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [levelConfig.id]: e.target.value 
              }))}
              required
              className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor={levelConfig.name}>Name</Label>
            <input
              id={levelConfig.name}
              value={formData[levelConfig.name] || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [levelConfig.name]: e.target.value 
              }))}
              required
              className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {levelConfig.metadata?.map(field => {
            if (field.toLowerCase().includes('step type')) {
              return (
                <div key={field}>
                  <Label htmlFor={field}>{field}</Label>
                  <select
                    id={field}
                    value={formData[field] || 'Normal'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [field]: e.target.value 
                    }))}
                    className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Validation">Validation</option>
                  </select>
                </div>
              );
            }
            return (
              <div key={field}>
                <Label htmlFor={field}>{field}</Label>
                <input
                  id={field}
                  value={formData[field] || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [field]: e.target.value 
                  }))}
                  className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            );
          })}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

const getStepType = (metadata) => {
  const stepTypeField = Object.keys(metadata).find(key => 
    key.toLowerCase().includes('step type')
  );
  return stepTypeField ? metadata[stepTypeField].toLowerCase() : 'normal';
};

const nodeStyles = {
  validation: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    handle: '#fbbf24',
    headerBg: 'bg-yellow-100'
  },
  distribution: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    handle: '#3b82f6',
    headerBg: 'bg-blue-100'
  },
  default: {
    bg: 'bg-white',
    border: 'border-slate-200',
    handle: '#64748b',
    headerBg: 'bg-slate-100'
  }
};

// Handle positions for different shapes
const getHandlePositions = (type) => {
  switch (type) {
    case 'validation':
      return [
        { id: 'target', type: 'target', position: Position.Top },
        { id: 'source-left', type: 'source', position: Position.Left },
        { id: 'source-right', type: 'source', position: Position.Right }
      ];
    case 'distribution':
      // Generate handles spread around bottom half of circle
      return [
        { id: 'top', type: 'target', position: Position.Top },
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `out-${i}`,
          type: 'source',
          position: Position.Bottom,
          style: {
            left: `${20 + i * 15}%`,
            bottom: '-4px'
          }
        }))
      ];
    default:
      return [
        { id: 'top', type: 'target', position: Position.Top },
        { id: 'bottom', type: 'source', position: Position.Bottom }
      ];
  }
};

// Custom layout function (remains the same as before)
const getCustomLayout = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ 
    rankdir: 'TB',
    nodesep: 100,
    ranksep: 200,
    align: 'UL',
    ranker: 'tight-tree' // This helps maintain the desired structure
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
    const successorY = nodeWithPosition.y + 300; // Adjust this value to control vertical spacing
    
    if (stepType === 'validation') {
      // Get all edges from this validation node
      const outgoingEdges = edges.filter(e => e.source === node.id);
      
      // Sort edges based on their source handle
      const leftEdge = outgoingEdges.find(e => e.sourceHandle === 'source-left');
      const rightEdge = outgoingEdges.find(e => e.sourceHandle === 'source-right');

       // Calculate position below the diamond (diamond is 20px below node, itself is 16px tall)


      // Position nodes connected to left handle on the left side
      if (leftEdge) {
        dagreGraph.setNode(leftEdge.target, { 
          x: nodeWithPosition.x - 300,
          y: successorY
        });
      }

      // Position nodes connected to right handle on the right side
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
        const offset = (index - (successors.length - 1) / 2) * 400;
        dagreGraph.setNode(successor, {
          x: nodeWithPosition.x + offset,
          y: successorY + 50
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


// Helper function to determine if condition contains negative words
const isNegativeCondition = (condition) => {
  return condition?.toLowerCase().includes('no') || condition?.toLowerCase().includes('not');
};


// Helper function to determine edge colors for validation nodes
const getValidationEdgeColors = (edges, sourceId, conditions) => {
  const existingEdges = edges.filter(e => e.source === sourceId);
  let leftColor, rightColor;

  // Extract conditions
  const leftCondition = conditions[0] || '';
  const rightCondition = conditions[1] || '';

  // Case 1: Both conditions exist
  if (leftCondition && rightCondition) {
    const leftIsNegative = isNegativeCondition(leftCondition);
    const rightIsNegative = isNegativeCondition(rightCondition);

    if (leftIsNegative && rightIsNegative) {
      // Both negative - left red, right blue
      leftColor = '#EF4444';
      rightColor = '#3B82F6';
    } else if (leftIsNegative) {
      // Only left negative - left red, right blue
      leftColor = '#EF4444';
      rightColor = '#3B82F6';
    } else if (rightIsNegative) {
      // Only right negative - right red, left blue
      leftColor = '#3B82F6';
      rightColor = '#EF4444';
    } else {
      // Neither negative - right red, left blue
      leftColor = '#3B82F6';
      rightColor = '#EF4444';
    }
  }
  // Case 2: No conditions exist
  else if (!leftCondition && !rightCondition) {
    // Default: left red, right blue
    leftColor = '#EF4444';
    rightColor = '#3B82F6';
  }
  // Case 3 & 4: Only one condition exists
  else {
    const existingCondition = leftCondition || rightCondition;
    const isNegative = isNegativeCondition(existingCondition);
    
    if (isNegative) {
      // Negative condition - make it red, other blue
      leftColor = leftCondition ? '#EF4444' : '#3B82F6';
      rightColor = rightCondition ? '#EF4444' : '#3B82F6';
    } else {
      // Positive condition - make it blue, other red
      leftColor = leftCondition ? '#3B82F6' : '#EF4444';
      rightColor = rightCondition ? '#3B82F6' : '#EF4444';
    }
  }

  return existingEdges.length === 0 ? leftColor : rightColor;
};
// Shape components
const Diamond = ({ className = '' }) => (
  <div className="relative w-16 h-16">
    <div className={`absolute w-12 h-12 left-2 top-2 transform rotate-45 border-2 border-gray-400 bg-white ${className}`} />
    {/* Vertical line connecting to the node */}
    <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-400 -translate-x-1/2 -translate-y-full" />
  </div>
);

const Circle = ({ className = '' }) => (
  <div className="relative w-16 h-16">
    <div className={`absolute w-12 h-12 left-2 top-2 rounded-full border-2 border-gray-400 bg-white ${className}`} />
    {/* Vertical line connecting to the node */}
    <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-400 -translate-x-1/2 -translate-y-full" />
  </div>
);


// Get source handle positions based on step type
const getSourceHandles = (type) => {
  switch (type) {
    case 'validation':
      return [
        { id: 'source-left', type: 'source', position: Position.Left },
        { id: 'source-right', type: 'source', position: Position.Right }
      ];
    case 'distribution':
      // Generate handles spread around bottom half of circle
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

const ProcessNode = memo(({ data }) => {
  const { id, name, metadata = {} } = data;
  const type = getStepType(metadata);
  const stepType = getStepType(metadata);
  const sourceHandles = getSourceHandles(stepType);
  const colors = useMemo(() => nodeStyles[type] || nodeStyles.default, [type]);
  console.log("ProcessNode:sourceHandles",sourceHandles);
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


    // Add target handle render function
    const renderTargetHandle = () => (
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="w-2 h-2 !bg-blue-500"
      />
    );
  return (


    <div 
    className={`relative group ${colors.bg} border ${colors.border} rounded-lg shadow-md
      hover:shadow-lg transition-all duration-200
      overflow-visible min-w-[200px] max-w-[320px]
    `}
  >
            {/* Always render target handle at the top of the node */}
            {renderTargetHandle()}
    {/* Main Content with Enhanced Header */}
    <div className="flex flex-col h-full">
      <div className={`p-3 ${colors.headerBg} rounded-t-lg border-b ${colors.border}`}>

        {/* Node ID Badge moved inside the header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-white rounded-md 
                         shadow-sm border border-gray-700 whitespace-nowrap">
            {id}
          </span>

        </div>

        <div className="text-sm font-semibold text-gray-800 line-clamp-2">
          {data.label}
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(data.metadata || {}).map(([key, value]) => {
            if (key.includes('System') || key.includes('Application') || key.includes('Actor')) {
              return (
                <span key={key} className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 
                                         rounded-md whitespace-nowrap overflow-hidden text-ellipsis
                                         max-w-[350px]">
                  {value}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>



    <div className="relative">
      <div className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-[200px]">

      
        
        <div className="font-bold text-sm text-gray-700 mb-2">{id}</div>
        <div className="text-sm text-gray-900 mb-2">{name}</div>
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-600">
            {key}: {value}
          </div>
        ))}
      </div>
      {renderShape()}
    </div></div>
  );
});


const nodeTypes = {
  process: ProcessNode,
};




const Flow = memo(({ rows, levelConfig, onAddNode,onUpdateNode, onUpdateRelationship }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  const getInitialElements = useCallback(() => {
    if (!rows || !levelConfig) return;

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
               else if (sourceType === 'distribution') {
                // Find all targets connected to this distribution node
                const distributionTargets = rows.filter(r => 
                  r[predecessorField]?.split(',').map(p => p.trim()).includes(predId)
                );
                
                // Get the index for this target based on its condition or order
                const targetIndex = distributionTargets.findIndex(r => r[levelConfig.id] === row[levelConfig.id]);
                
                // Assign a source handle based on the target's position
                // Use same handle IDs as defined in the node component
                sourceHandle = `source-${targetIndex}`;
                
                // Optional: can use different colors for different outputs
                edgeColor = '#2563eb'; // or create a color scheme for distribution outputs
              }
  


              initialEdges.push({
                id: `edge-${predId}-${sourceHandle}-${row[levelConfig.id]}`,
                source: predId,
                target: row[levelConfig.id],
                sourceHandle: sourceHandle,
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
  console.log("ProcessFlow:InitialElements:initialNodes",initialNodes);
  console.log("ProcessFlow:InitialElements:initialEdgesBefore",initialEdges);
  // Then filter out duplicates
const initialEdgesWithoutDuplicates = initialEdges.filter((edge, index, self) =>
  index === self.findIndex((e) => (
    e.source === edge.source &&
    e.target === edge.target &&
    e.sourceHandle === edge.sourceHandle
  ))
);
console.log("ProcessFlow:InitialElements:initialEdgesAfter",initialEdgesWithoutDuplicates);

    return getCustomLayout(initialNodes, initialEdgesWithoutDuplicates);
  }, [rows, levelConfig]);

    
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getInitialElements() || { nodes: [], edges: [] };
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Cleanup function
    return () => {
      setNodes([]);
      setEdges([]);
    };
  }, [getInitialElements, setNodes, setEdges]);


// Handle node selection
const onNodeClick = useCallback((_, node) => {
  setSelectedNode(node);
  setIsEditFormOpen(true);
}, []);

// Handle node data updates
const handleNodeUpdate = useCallback((formData) => {
  if (onUpdateNode) {
    onUpdateNode(formData);
  }
  setIsEditFormOpen(false);
  setSelectedNode(null);
}, [onUpdateNode]);

// Handle adding new node
const handleAddNode = useCallback(() => {
  setSelectedNode(null);
  setIsEditFormOpen(true);
}, []);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const sourceType = sourceNode ? getStepType(sourceNode.data.metadata) : 'normal';
    let edgeColor = '#333';
  console.log("sourceType",sourceType);
    if (sourceType === 'validation') {
      // Get all existing edges from this validation node
      const existingEdges = edges.filter(e => e.source === params.source);
      
      // Get conditions for existing edges and the new connection
      const conditions = edges
        .filter(e => e.source === params.source)
        .map(e => e.label || '')
        .concat(['']); // Add empty condition for new connection
  
      edgeColor = getValidationEdgeColors(existingEdges, params.source, conditions);
    }

      // Special handling for distribution nodes
  if (sourceType === 'distribution') {
    console.log('Distribution node connection:', {
      sourceHandle: params.sourceHandle,
      source: params.source,
      target: params.target
    });
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
      sourceHandle: params.sourceHandle,
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    
    if (onUpdateRelationship) {
      onUpdateRelationship(params.source, params.target);
    }
  }, [nodes, edges, setEdges, onUpdateRelationship]);

  // Memoize default edge options
  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#333' },
  }), []);

  return (
    <div className="w-full h-[600px]">
       {isEditFormOpen && (
        <NodeEditForm
          node={selectedNode}
          levelConfig={levelConfig}
          onSave={handleNodeUpdate}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedNode(null);
          }}
          rows={rows}
        />
      )}
      <div className="absolute top-4 right-4 z-10">
        {/*<button
          onClick={handleAddNode}
          className="bg-green-500 hover:bg-green-600"
        >
          Add Node
        </button> */}
      </div>
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
      >
        <Background />
        <Controls />
      </ReactFlow>
      
    </div>
  )  ;
});

// Wrap the flow component with ReactFlowProvider
const ProcessFlow = memo((props) => {
  const handleUpdateNode = (formData) => {
    console.log('handleUpdateNode:Starting update with formData:', formData);
    console.log('handleUpdateNode:Current rows:', props.rows);
    console.log('handleUpdateNode:LevelConfig:', props.levelConfig);
    
    // Get the existing IDs from rows
    const existingIds = props.rows.map(r => r[props.levelConfig.id]);
    console.log('handleUpdateNode:Existing IDs:', existingIds);
    console.log('handleUpdateNode:Looking for ID:', formData[props.levelConfig.id]);
    
    // If editing existing node
    if (existingIds.includes(formData[props.levelConfig.id])) {
      console.log('Updating existing node');
      
      const updatedRows = props.rows.map(row => {
        // Log the comparison for each row
        console.log('Checking row:', {
          rowId: row[props.levelConfig.id],
          formDataId: formData[props.levelConfig.id],
          isMatch: row[props.levelConfig.id] === formData[props.levelConfig.id]
        });

        if (row[props.levelConfig.id] === formData[props.levelConfig.id]) {
          // Log the update operation
          const updatedRow = {
            ...row,
            [props.levelConfig.id]: formData[props.levelConfig.id],
            [props.levelConfig.name]: formData[props.levelConfig.name],
            ...(props.levelConfig.metadata?.reduce((acc, field) => {
              acc[field] = formData[field];
              return acc;
            }, {}))
          };
          console.log('handleUpdateNode:Row before update:', row);
          console.log('handleUpdateNode:Row after update:', updatedRow);
          return updatedRow;
        }
        return row;
      });

      console.log('handleUpdateNode:Final updated rows:', updatedRows);
      props.onUpdateNode?.(updatedRows);
    }
    // If adding new node
    else {
      console.log('handleUpdateNode:Adding new node');
      const newRow = {
        [props.levelConfig.id]: formData[props.levelConfig.id],
        [props.levelConfig.name]: formData[props.levelConfig.name],
        ...(props.levelConfig.metadata?.reduce((acc, field) => {
          acc[field] = formData[field];
          return acc;
        }, {}))
      };
      console.log('handleUpdateNode:New row created:', newRow);
      props.onAddNode?.(newRow);
    }
  };

  return (
    <ReactFlowProvider>
      <Flow 
        {...props} 
        onUpdateNode={handleUpdateNode}
      />
    </ReactFlowProvider>
  );
});
export default ProcessFlow;