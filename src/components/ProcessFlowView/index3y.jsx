import React, { useState, useEffect, useContext } from 'react';
import { FoldersIcon, ChevronRight, ChevronDown, Info, PanelLeftClose, PanelRightClose, MoreHorizontal } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

import ProcessDataHandler from "../../lib/dataHelper";
import LeftPane from './LeftPane';
import WebflowManager from './WorkflowDiagram copy 8';
import {  DetailsPane } from './Header-DetailsPane';
import { Header } from './Header';
import { dataProcessing } from "../../lib/utils";
import { useData } from '../../contexts/DataContext';
import { useTreeController } from './Workflow/TreeController2';





// Function to get path from hierarchy
const getNodePath = (hierarchy, targetId) => {
  // For root level nodes
  if (hierarchy[targetId]) {
    return [hierarchy[targetId]];
  }

  // Helper function to search within a node
  const findPath = (node, targetId, path = []) => {
    // Add current node to path
    const currentPath = [...path, node];
    
    // Found target
    if (node.id === targetId) {
      return currentPath;
    }

    // Search in children
    if (node.children) {
      for (const childId in node.children) {
        const result = findPath(node.children[childId], targetId, currentPath);
        if (result) return result;
      }
    }

    // Search in processes
    if (node.processes) {
      for (const processId in node.processes) {
        const result = findPath(node.processes[processId], targetId, currentPath);
        if (result) return result;
      }
    }

    return null;
  };

  // Search from each root node
  for (const rootId in hierarchy) {
    const result = findPath(hierarchy[rootId], targetId);
    if (result) return result;
  }

  return null;
};
// Enhanced BreadcrumbItem component
const BreadcrumbItem = ({ item, isLast, onClick, maxWidth = 150 }) => {
  const getNodeMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "No additional information available";
    }
    return Object.entries(metadata)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`)
      .join('\n');
  };

  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={300}>
        <TooltipTrigger>
          <span 
            onClick={() => onClick(item)}
            className={`
              inline-block px-3 py-1 rounded-full text-sm text-white
              ${isLast ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
              transition-all duration-300 ease-in-out
              hover:transform hover:-translate-y-0.5 hover:shadow-md
              cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis
            `}
            style={{ maxWidth }}
          >
            {item.name}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="p-2">
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm">Type: {item.type}</div>
            <div className="text-xs whitespace-pre-line">
              {getNodeMetadata(item.metadata)}
            </div>
          </div>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
};


const BreadcrumbSeparator = () => (
  <div className="
    w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center
    flex-shrink-0 transition-all duration-300 ease-in-out
  ">
    <ChevronRight className="w-4 h-4 text-white" />
  </div>
);


// Enhanced Breadcrumb component
const Breadcrumb = ({ items, onItemClick, maxVisibleItems = 8 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items.length) return null;

  const visibleItems = isExpanded ? items : [
    ...items.slice(0, 1),
    ...items.slice(Math.max(1, items.length - (maxVisibleItems - 1)))
  ];

  const hasHiddenItems = !isExpanded && items.length > maxVisibleItems;
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div className="flex-1 px-4">
      <div className={`
        flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg
        transition-all duration-300 ease-in-out
      `}>
        {visibleItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <BreadcrumbSeparator />
            )}
            <BreadcrumbItem 
              item={item} 
              isLast={index === items.length - 1}
              onClick={onItemClick}
            />
          </React.Fragment>
        ))}

        {hasHiddenItems && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="px-2 py-1 rounded-full hover:bg-blue-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="ml-1 text-xs">{hiddenCount}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
              <div className="flex flex-col gap-2">
                {items.slice(1, -2).map((item) => (
                  <BreadcrumbItem
                    key={item.id}
                    item={item}
                    isLast={false}
                    onClick={onItemClick}
                    maxWidth={500}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};


// Constants for pane widths
const INITIAL_LEFT_WIDTH = 450;
const INITIAL_RIGHT_WIDTH = 350;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

// New ResizeHandle component
const ResizeHandle = ({ onMouseDown }) => (
  <div
    className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors"
    onMouseDown={onMouseDown}
  />
);

// Main container component
const ProcessFlowView = () => {
  const [hierarchy, setHierarchy] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [processFlow, setProcessFlow] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const { data } = useData();
  const { clickNode } = useTreeController();
    // Pane visibility state
    const [leftPaneVisible, setLeftPaneVisible] = useState(true);
    const [rightPaneVisible, setRightPaneVisible] = useState(true);
    
    // Pane widths state
    const [leftPaneWidth, setLeftPaneWidth] = useState(INITIAL_LEFT_WIDTH);
    const [rightPaneWidth, setRightPaneWidth] = useState(INITIAL_RIGHT_WIDTH);
    
    // Resize handling state
    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);


  useEffect(() => {
    // Transform your data when component mounts
    const transformedData = ProcessDataHandler.transformToHierarchy(data);
    setHierarchy(transformedData);
  }, [data]);


  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
        setLeftPaneWidth(newWidth);
      } else if (isDraggingRight) {
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, 
          window.innerWidth - e.clientX));
        setRightPaneWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.classList.add('select-none');
    } else {
      document.body.classList.remove('select-none');
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('select-none');
    };
  }, [isDraggingLeft, isDraggingRight]);


const handleNodeDoubleClick = (node) => {
  //handleNodeSelect(node);
};

  const handleNodeSelect = (node) => {
    console.log("Index:handleNodeSelect:node",node);
    // Get the complete path to the selected node
    const path = getNodePath(hierarchy, node.id);
    try{
    if (path) {
      setSelectedNode(node);
      
      setBreadcrumb(path);
      
      // Process flow logic
      switch (true) {
        case (Boolean(node.type === 'processArea' && node.processes)):
          const flow = ProcessDataHandler.getProcessFlow(node.processes);
          console.log("handleNodeSelect:Boolean(node.type === 'processArea' && node.processes)",'true');
          console.log("handleNodeSelect:Boolean(node.type === 'processArea' && node.processes:node.processes)",node.processes);
          console.log("handleNodeSelect:Boolean(node.type === 'processArea' && node.processes:flow)",flow);

          setProcessFlow(flow);
          break;
      
        case ((node.children && typeof node.children === 'object' && Object.keys(node.children).length > 0)):
          const childrenFlow = ProcessDataHandler.getProcessFlow(node.children);
          console.log("(handleNodeSelect:node.children && typeof node.children === 'object' && Object.keys(node.children).length > 0)",'true');
          console.log("(handleNodeSelect:node.children && typeof node.children === 'object' && Object.keys(node.children).length > 0):node.children",node.children);
          console.log("(handleNodeSelect:node.children && typeof node.children === 'object' && Object.keys(node.children).length > 0):childrenFlow",childrenFlow);

          setProcessFlow(childrenFlow);
          break;
      
        default:
          console.log("(handleNodeSelect:default case",childrenFlow);
          setProcessFlow(null);
      }
      if (!rightPaneVisible) {
        //setRightPaneVisible(true);
      }
    }} catch {return}
  };

  const handleBreadcrumbClick = (item) => {
    // Find the node in the hierarchy and select it
    try{
    const path = getNodePath(hierarchy, item.id);
    if (path) {
      const node = path[path.length - 1];
      handleNodeSelect(node);
      clickNode(node.id);
    }} 
    catch{
      return
    }
  };

    


  return (
    <div className="h-screen flex flex-col">
    <Header />
    <div className="flex items-center p+x-4 py-2 bg-gray-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLeftPaneVisible(!leftPaneVisible)}
        className="flex-shrink-0"
      >
        <PanelLeftClose className={`h-4 w-4 transition-transform ${!leftPaneVisible ? 'rotate-180' : ''}`} />
      </Button>
        <Breadcrumb items={breadcrumb} onItemClick={handleBreadcrumbClick} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightPaneVisible(!rightPaneVisible)}
          className="flex-shrink-0"
        >
          <PanelRightClose className={`h-4 w-4 transition-transform ${!rightPaneVisible ? 'rotate-180' : ''}`} />
        </Button>
      </div>


      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane */}
        <div 
          style={{ 
            width: leftPaneVisible ? `${leftPaneWidth}px` : '0px',
            minWidth: leftPaneVisible ? `${MIN_WIDTH}px` : '0px',
            opacity: leftPaneVisible ? 1 : 0,
            visibility: leftPaneVisible ? 'visible' : 'hidden'
          }}
          className="flex-shrink-0 h-full overflow-hidden transition-all duration-300"
        >
          
        <LeftPane 
          data={hierarchy} 
          onSelect={handleNodeSelect} 
        />
      </div>
            {/* Left Resize Handle */}
            {leftPaneVisible && (
          <ResizeHandle onMouseDown={(e) => {
            setIsDraggingLeft(true);
            e.preventDefault();
          }} />
        )}

             {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <MainContent 
            selectedNode={selectedNode}
            processFlow={processFlow}
            breadcrumb={breadcrumb}
            handleNodeSelect={handleBreadcrumbClick}
            handleNodeDoubleClick={handleNodeDoubleClick}
          />
        </div>

          {/* Right Resize Handle */}
          {rightPaneVisible && (
          <ResizeHandle onMouseDown={(e) => {
            setIsDraggingRight(true);
            e.preventDefault();
          }} />
        )}
   {/* Right Pane */}
   <div 
          style={{ 
            width: rightPaneVisible ? `${rightPaneWidth}px` : '0px',
            minWidth: rightPaneVisible ? `${MIN_WIDTH}px` : '0px',
            opacity: rightPaneVisible ? 1 : 0,
            visibility: rightPaneVisible ? 'visible' : 'hidden'
          }}
          className="flex-shrink-0 h-full overflow-hidden transition-all duration-300"
        >
          <DetailsPane node={selectedNode} />
        </div>
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

// Enhanced MainContent component
const MainContent = React.memo(({ selectedNode, processFlow, breadcrumb, handleNodeSelect,handleNodeDoubleClick }) => (

<div className="flex-1 flex flex-col p-4 overflow-hidden">
    <div className="flex-1 bg-white rounded border p-4 overflow-auto">
    {console.log("MainContent:processFlow",processFlow)}
    {console.log("MainContent:selectedNode",selectedNode)}
      {processFlow ? (
        
        <WebflowManager data={processFlow} onNodeSelect={handleNodeSelect} selectedNode={selectedNode} onNodeDoubleClick={handleNodeDoubleClick}  />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <Info className="w-6 h-6 mr-2" />
          <span>Select a process area to view its flow</span>
        </div>
      )}
    </div>
  </div>
));

/* //Updated DetailsPane component
const DetailsPane = ({ node }) => (
  <Card className="h-full m-2 p-4 overflow-auto">
    <h2 className="text-lg font-semibold mb-4">{node?node.name:''}</h2>
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
);*/

export default ProcessFlowView;