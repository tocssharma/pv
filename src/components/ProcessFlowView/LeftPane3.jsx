import React, { useState, useMemo } from 'react';
import { 
    Search, 
    Filter, 
    X,
    ChevronDown,
    ChevronRight 
  } from 'lucide-react';
import { Card } from '../../components/ui/card';
import ProcessDataHandler from "../../lib/dataHelper";
// Filter types for different process elements
const FILTER_TYPES = {
  DOMAIN: 'domain',
  LOB: 'lob',
  JOURNEY: 'journey',
  PROCESS_AREA: 'processArea',
  PROCESS: 'process'
};

const LeftPane = ({ data, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set(Object.values(FILTER_TYPES)));
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Search through the tree structure
  const searchNode = (node, term) => {
    if (!node) return false;
    
    // Check if current node matches
    const nodeMatches = node.name?.toLowerCase().includes(term.toLowerCase()) ||
                       node.id?.toLowerCase().includes(term.toLowerCase());
    
    // Check children
    let childrenMatch = false;
    if (node.children) {
      childrenMatch = Object.values(node.children).some(child => searchNode(child, term));
    }
    if (node.processes) {
      childrenMatch = childrenMatch || Object.values(node.processes).some(process => searchNode(process, term));
    }
    
    return nodeMatches || childrenMatch;
  };

  // Filter nodes based on type
  const filterNode = (node) => {
    if (!node) return false;
    return activeFilters.has(node.type);
  };

  // Combine search and filter
  const processNode = (node, term) => {
    if (!node) return false;
    const matchesSearch = term === '' || searchNode(node, term);
    const matchesFilter = filterNode(node);
    return matchesSearch && matchesFilter;
  };

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Toggle filter
  const toggleFilter = (filterType) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterType)) {
        newFilters.delete(filterType);
      } else {
        newFilters.add(filterType);
      }
      return newFilters;
    });
  };

  // Recursive tree rendering component
  const TreeNode = ({ node, level = 0 }) => {
    if (!processNode(node, searchTerm)) return null;

    const hasChildren = (node.children && Object.keys(node.children).length > 0) ||
                       (node.processes && Object.keys(node.processes).length > 0);
    const isExpanded = expandedNodes.has(node.id);
      // Add this before the return statement
  const processHierarchy = node.processes ? 
  ProcessDataHandler.createHierarchy(node.processes) : null;
  console.log('Hierarchydata:processHierarchy', processHierarchy);

if (processHierarchy) {
  console.log('Process hierarchy for node:', node.id);
  
}

    return (
      <div className="ml-4">
        <div 
          className={`flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded
            ${level === 0 ? 'ml-0' : 'ml-2'}`}
          onClick={() => {
            toggleNode(node.id);
            onSelect(node);
          }}
        >
          {hasChildren && (
            <button className="w-4 h-4 mr-1 flex items-center justify-center">
              {isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
              }
            </button>
          )}
          <span className={`ml-1 text-sm ${searchTerm && searchNode(node, searchTerm) ? 'bg-yellow-100' : ''}`}>
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

  // Node type icons (emoji or you can use Lucide icons)
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
    <Card className="w-72 p-4 m-2 flex flex-col">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search processes..."
          className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-2.5"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(FILTER_TYPES).map(([key, value]) => (
          <button
            key={key}
            className={`px-2 py-1 text-xs rounded-full flex items-center gap-1
              ${activeFilters.has(value) 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'}`}
            onClick={() => toggleFilter(value)}
          >
            {getNodeIcon(value)}
            {key.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto">
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
  );
};

export default LeftPane;