
import React, { useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import ProcessDataHandler from "../../lib/dataHelper";
import { useTreeStore } from './Workflow/TreeController2';

const FILTER_TYPES = {
  DOMAIN: 'domain',
  LOB: 'lob',
  JOURNEY: 'journey',
  PROCESS_AREA: 'processArea',
  PROCESS: 'process'
};

const LeftPane = ({ data, onSelect }) => {
  const { expandedNodes, selectedNode, toggleNode } = useTreeStore();

  // Recursive tree rendering component
  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = (node.children && Object.keys(node.children).length > 0) ||
      (node.processes && Object.keys(node.processes).length > 0);
    const isExpanded = expandedNodes.includes(node.id);
    const isSelected = selectedNode?.id === node.id;
  
    const processHierarchy = node.processes ? 
      ProcessDataHandler.createHierarchy(node.processes) : null;

    return (
      <div className="ml-4">
        <div 
          className={`flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded
            ${level === 0 ? 'ml-0' : 'ml-2'}
            ${isSelected ? 'bg-blue-100' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            onSelect(node);
          }}
        >
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
            ) : (
              <span className="w-3 h-3"></span>
            )}
          </div>
          <span className="ml-1 text-sm">
            {getNodeIcon(node.type)} {node.name} ({node.id})
          </span>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children && Object.values(node.children).map((child) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                level={level + 1}
              />
            ))}
            {node.processes && Object.values(processHierarchy).map((process) => (
              <TreeNode 
                key={process.id} 
                node={process} 
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Node type icons
  const getNodeIcon = (type) => {
    switch (type) {
      case FILTER_TYPES.DOMAIN: return '🏢';
      case FILTER_TYPES.LOB: return '📑';
      case FILTER_TYPES.JOURNEY: return '🔄';
      case FILTER_TYPES.PROCESS_AREA: return '⚙️';
      case FILTER_TYPES.PROCESS: return '📄';
      default: return '📄';
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <Card className="h-full m-2 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 pt-0">
          <h2 className="text-lg font-semibold mb-4">Business Processes</h2>
          {data ? (
            Object.values(data).map((node) => (
              <TreeNode key={node.id} node={node} />
            ))
          ) : (
            <div className="text-gray-500 text-center">Loading...</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LeftPane;