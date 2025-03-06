import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X,
  ChevronDown,
  ChevronRight,
  BarChart,
  List,
  Network
} from 'lucide-react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ProcessDataHandler from "../../lib/dataHelper";
import HierarchyAnalytics from './HierarchyAnalytics';
import MetadataAnalysis from './MetadataAnalysis';
import { useData } from '../../contexts/DataContext';

// Filter types for different process elements
const FILTER_TYPES = {
  DOMAIN: 'domain',
  LOB: 'lob',
  JOURNEY: 'journey',
  PROCESS_AREA: 'processArea',
  PROCESS: 'process'
};

const LeftPane = ({ data, onSelect, DBData }) => {
//const { Hierarchydata } = useData();
const Hierarchydata=DBData;
  console.log("LeftPane:data from DB",Hierarchydata);
  console.log("LeftPane:Hierarchydata passed to LeftPane",data);
  const transformedData = ProcessDataHandler.transformToHierarchy_New1(Hierarchydata);
  const PHierarchy = ProcessDataHandler.createHierarchy1(DBData);
  
  console.log("LeftPane:transformedData using tranformedata_new1",transformedData);
  
  console.log("LeftPane:PHierarchy using createhierachy1",PHierarchy);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set(Object.values(FILTER_TYPES)));
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [activeTab, setActiveTab] = useState("tree");

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
    //if (!processNode(node, searchTerm)) return null;

    const hasChildren = (node.children && Object.keys(node.children).length > 0) ||
    (node.processes && Object.keys(node.processes).length > 0);
    const isExpanded = expandedNodes.has(node.id);
  
    const processHierarchy = node.processes ? 
  ProcessDataHandler.createHierarchy1(node.processes) : null;
  console.log('Hierarchydata:processHierarchy', processHierarchy);

if (processHierarchy) {
  console.log('Process hierarchy for node:', node.id);
  
}    
    return (
      <div className="ml-4">
        {/* Always render the node itself */}
        <div 
          className={`flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded
            ${level === 0 ? 'ml-0' : 'ml-2'}`}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            onSelect(node);
          }}
        >
          {/* Show expand/collapse icon only for nodes with children */}
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
            ) : (
              // Add a placeholder for leaf nodes to maintain alignment
              <span className="w-3 h-3"></span>
            )}
          </div>
      
          
          <div className="flex-1 flex items-center">
  <span className={`text-sm font-medium text-gray-900 ${searchTerm && searchNode(node, searchTerm) ? 'bg-yellow-100' : ''}`}>
    {getNodeIcon(node.type)} {node.name}
  
  <span className="ml-2 text-xs text-gray-500">
    ({node.id})
  </span>
  </span>
</div>

        </div>

        {/* Render children if they exist and the node is expanded */}
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
    <div className="h-full overflow-hidden">
      <Card className="h-full m-2 flex flex-col overflow-hidden">
        <Tabs defaultValue="tree" className="w-full h-full flex flex-col" onValueChange={setActiveTab}>
          <div className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="tree" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Tree View
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                Metadata
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="tree" className="h-full m-0 overflow-auto">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Business Processes</h2>
                {data ? (
                  Object.values(data).map((node) => (
                    <TreeNode key={node.id} node={node} />
                  ))
                ) : (
                  <div className="text-gray-500 text-center">Loading...</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0 overflow-auto">
              <div className="p-4">
                <HierarchyAnalytics Hierarchydata={Hierarchydata} />
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="h-full m-0 overflow-auto">
              <div className="p-4">
                <MetadataAnalysis Hierarchydata={Hierarchydata} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default LeftPane;