import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const TreeNode = ({ nodeId, data, level = 0, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = data.get(nodeId) || [];
  
  const getNodeDetails = () => {
    for (const [_, nodes] of data) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  };

  const nodeDetails = getNodeDetails();
  const hasChildren = children.length > 0;

  const getProcessName = () => {
    if (!nodeDetails?.attributes) return nodeId;
    const processNameAttr = nodeDetails.attributes.find(attr => 
      attr.key.includes('Process Name') || attr.key === 'processName'
    );
    return processNameAttr?.value || nodeId;
  };

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center py-1 px-2 rounded-md cursor-pointer
          ${level === 0 ? 'bg-gray-100' : 'hover:bg-gray-50'}
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
          onSelect(nodeId);
        }}
      >
        {hasChildren && (
          <button className="p-1 rounded-md hover:bg-gray-200 mr-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        
        <div className="flex-1 flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {getProcessName()}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {nodeId}
          </span>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {children.map(child => (
            <TreeNode
              key={child.id}
              nodeId={child.id}
              data={data}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ data }) => {
  const handleNodeSelect = (nodeId) => {
    console.log('Selected node:', nodeId);
    console.log('data:', data);

  };


  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <TreeNode
        nodeId="JIN"
        data={data}
        onSelect={handleNodeSelect}
      />
    </div>
  );
};

export default TreeView;