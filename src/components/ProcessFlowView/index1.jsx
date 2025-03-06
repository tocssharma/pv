import React, { useState, useEffect } from 'react';
import { FoldersIcon, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { Card } from '../../components/ui/card';
import ProcessDataHandler from "../../lib/dataHelper";
import LeftPane from './LeftPane';

// Main container component
const ProcessFlowView = (data, rawData) => {
  const [hierarchy, setHierarchy] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [processFlow, setProcessFlow] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);

  useEffect(() => {
    console.log("data in index",data);
    console.log("rawData in index",data["rawData"]);
    // Transform your data when component mounts
    const transformedData = ProcessDataHandler.transformToHierarchy(data["rawData"]);
    console.log("transformedData",transformedData);
    setHierarchy(transformedData);
  }, []);

  const handleNodeSelect = (node, path = []) => {
    setSelectedNode(node);
    setBreadcrumb(path);
    console.log("node",node);
    // Get process flow if this is a process area
    if (node.type === 'processArea' && node.processes) {
      const flow = ProcessDataHandler.getProcessFlow(node.processes);
      console.log("flow",flow);
      setProcessFlow(flow);
    } else {
      setProcessFlow(null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftPane 
          data={hierarchy} 
          onSelect={handleNodeSelect} 
        />
        <MainContent 
          selectedNode={selectedNode}
          processFlow={processFlow}
          breadcrumb={breadcrumb}
        />
        <DetailsPane node={selectedNode} />
      </div>
    </div>
  );
};

// Enhanced TreeNode component
const TreeNode = ({ node, path = [], onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && Object.keys(node.children).length > 0;
  
  const handleClick = () => {
    setIsExpanded(!isExpanded);
    onSelect(node, [...path, { id: node.id, name: node.name, type: node.type }]);
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'domain': return '🏢';
      case 'lob': return '📑';
      case 'journey': return '🔄';
      case 'processArea': return '⚙️';
      default: return '📄';
    }
  };

  return (
    
    <div className="ml-4">
      <div 
        className="flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded"
        onClick={handleClick}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : <div className="w-4" />}
        <span className="ml-1">{getNodeIcon(node.type)} {node.name} ({node.id})</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4">
          {Object.values(node.children).map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              path={[...path, { id: node.id, name: node.name, type: node.type }]}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced ProcessFlow component
const ProcessFlow = ({ flow }) => {
  if (!flow || !flow.nodes.length) return null;

  const calculateNodePositions = () => {
    // Simple layout algorithm - you might want to use a more sophisticated one
    const levels = {};
    const nodePositions = {};
    
    // Find node levels based on dependencies
    flow.nodes.forEach(node => {
      const incomingEdges = flow.edges.filter(e => e.to === node.id);
      const level = incomingEdges.length ? Math.max(...incomingEdges.map(e => levels[e.from] || 0)) + 1 : 0;
      levels[node.id] = level;
      
      if (!nodePositions[level]) nodePositions[level] = [];
      nodePositions[level].push(node);
    });

    return { levels, nodePositions };
  };

  const { levels, nodePositions } = calculateNodePositions();
  const maxLevel = Math.max(...Object.values(levels));
  const levelWidth = 300;
  const nodeHeight = 200;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${(maxLevel + 1) * levelWidth + 100} ${Object.values(nodePositions).reduce((max, nodes) => Math.max(max, nodes.length), 0) * nodeHeight + 100}`}>
      {/* Draw edges first so they appear behind nodes */}
      {flow.edges.map((edge, idx) => {
        const fromLevel = levels[edge.from];
        const toLevel = levels[edge.to];
        const fromIdx = nodePositions[fromLevel].findIndex(n => n.id === edge.from);
        const toIdx = nodePositions[toLevel].findIndex(n => n.id === edge.to);
        
        const x1 = fromLevel * levelWidth + 150;
        const y1 = fromIdx * nodeHeight + 50;
        const x2 = toLevel * levelWidth + 50;
        const y2 = toIdx * nodeHeight + 50;

        return (
          <g key={`edge-${idx}`}>
            <path
              d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="black"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
            />
            {edge.condition && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} className="text-xs">
                {edge.condition}
              </text>
            )}
          </g>
        );
      })}

      {/* Draw nodes */}
      {Object.entries(nodePositions).map(([level, nodes]) =>
        nodes.map((node, idx) => (
          <g key={node.id} transform={`translate(${level * levelWidth + 50}, ${idx * nodeHeight + 20})`}>
            <rect
              width="250"
              height="160"
              rx="5"
              className="fill-white stroke-gray-300"
            />
            <text x="75" y="25" textAnchor="middle" className="text-sm font-semibold">
              {node.id}
            </text>
            <text x="75" y="45" textAnchor="middle" className="text-sm">
              {node.label}
            </text>
          </g>
        ))
      )}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
    </svg>
  );
};

// Enhanced MainContent component
const MainContent = ({ selectedNode, processFlow, breadcrumb }) => (
  <div className="flex-1 flex flex-col p-4 overflow-hidden">
    <div className="mb-4 px-2 py-1 bg-gray-100 rounded flex items-center">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
          <span className="text-sm">{item.name}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="flex-1 bg-white rounded border p-4 overflow-auto">
      {processFlow ? (
        <ProcessFlow flow={processFlow} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <Info className="w-6 h-6 mr-2" />
          <span>Select a process area to view its flow</span>
        </div>
      )}
    </div>
  </div>
);

// Enhanced DetailsPane component
const DetailsPane = ({ node }) => (
  <Card className="w-80 p-4 m-2 overflow-y-auto">
    <h2 className="text-lg font-semibold mb-4">Node Details</h2>
    {node ? (
      <div className="space-y-2">
        <div className="p-2 bg-gray-50 rounded">
          <p><strong>Type:</strong> {node.type}</p>
          <p><strong>ID:</strong> {node.id}</p>
          <p><strong>Name:</strong> {node.name}</p>
        </div>
        
        {node.metadata && Object.entries(node.metadata).length > 0 && (
          <div className="p-2 bg-gray-50 rounded">
            <p className="font-semibold mb-1">Metadata:</p>
            {Object.entries(node.metadata).map(([key, value]) => (
              <p key={key} className="text-sm">
                <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
              </p>
            ))}
          </div>
        )}

        {node.relationships && (
          <div className="p-2 bg-gray-50 rounded">
            <p className="font-semibold mb-1">Relationships:</p>
            {node.relationships.predecessors && (
              <p className="text-sm">
                <strong>Predecessors:</strong> {node.relationships.predecessors.join(', ')}
              </p>
            )}
            {node.relationships.condition && (
              <p className="text-sm">
                <strong>Condition:</strong> {node.relationships.condition}
              </p>
            )}
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-500">Select a node to view details</p>
    )}
  </Card>
);

// Header component remains the same
const Header = () => (
  <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
    <FoldersIcon className="w-6 h-6" />
    <h1 className="text-xl font-semibold">Jio Business Process Viewer</h1>
  </div>
);

export default ProcessFlowView;