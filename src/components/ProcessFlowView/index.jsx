import React, { useState, useEffect, useContext, useRef } from 'react';
import { FoldersIcon, ChevronRight, ChevronDown, Info, PanelLeftClose, PanelRightClose, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Alert, AlertDescription } from "../../components/ui/alert";
import BreadcrumbPopover from "./BreadcrumbPopover";
import { hierarchyApi } from '../../services/api';
import ProcessDataHandler_Nodes from '../../utils/hierarchyTransformer';
import ProcessDataHandler from "../../lib/dataHelper";
import LeftPane from './LeftPane8';
import WebflowManager from './WorkflowDiagram copy 9';
import {  DetailsPane } from './Header-DetailsPane';
import { Header } from './Header';
import { useData } from '../../contexts/DataContext';
import { useTreeController } from './Workflow/TreeController3';
import { processExcelData } from '../ExcelViewer/Excel-Processor';
import { useAuth } from '../../contexts/AuthContext';
import ProcessAdmin from '../ProcessAdmin';
import IntegratedETOMViewer from '../ProcessAdmin/components/IntegratedETOMViewer';
import { useView } from '../../contexts/ViewContext';



const reportError = window.console.error;
window.console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver') || args[0]?.message?.includes?.('ResizeObserver')) {
    return;
  }
  reportError(...args);
};



/*
// Function to get path from hierarchy
const getNodePath = (hierarchy, targetId, lineage) => {
  console.log("getNodePath:hierarchy",hierarchy);
  console.log("getNodePath:lineage",lineage);
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
}; */ 




const getNodePath = (hierarchy, targetId, nodeLineage) => {
  
  console.log("getNodePath:hierarchy",hierarchy);
  console.log("getNodePath:nodeLineage",nodeLineage);
  
  if (!nodeLineage) return null;

  
  const path = [];
  let currentNode = hierarchy;
  
  // Compare function that checks both id and lineage
  const isMatchingNode = (node, levelIndex, targetLineage) => {
    if (!node || !node.lineage) return false;
    
    // Compare lineage up to current level
    for (let i = 0; i <= levelIndex; i++) {
      const levelKey = `L${i}_ID`;
      if (node.lineage[levelKey] !== targetLineage[levelKey]) {
        return false;
      }
    }
    return true;
  };

  // Build path based on lineage levels
  for (let i = 0; i < Object.keys(nodeLineage).length; i++) {
    const levelKey = `L${i}_ID`;
    const nodeId = nodeLineage[levelKey];
    
    if (!nodeId) break;
    
    if (i === 0) {
      // Root level
      if (currentNode[nodeId] && 
          isMatchingNode(currentNode[nodeId], i, nodeLineage)) {
        currentNode = currentNode[nodeId];
        path.push(currentNode);
      } else break;
    } else {
      // Other levels
      if (currentNode.children?.[nodeId] && 
          isMatchingNode(currentNode.children[nodeId], i, nodeLineage)) {
        currentNode = currentNode.children[nodeId];
        path.push(currentNode);
      } else if (currentNode.processes?.[nodeId] && 
                 isMatchingNode(currentNode.processes[nodeId], i, nodeLineage)) {
        currentNode = currentNode.processes[nodeId];
        path.push(currentNode);
      } else break;
    }
  }

  return path.length > 0 ? path : null;
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
const Breadcrumb = ({ items, onItemClick, maxVisibleItems = 10 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log("Breadcrumb:items",items);

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

{visibleItems && (
  <BreadcrumbPopover 
    items={items}
    hiddenCount={visibleItems.length}
    onItemClick={onItemClick}
  />
)}

        {hasHiddenItems && (
  <BreadcrumbPopover 
    items={items}
    hiddenCount={hiddenCount}
    onItemClick={onItemClick}
  />
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
  const [viewsVisible, setViewsVisible] = useState(false);
  const { isAdmin } = useAuth();
  // Get the ETOMViewer state from context
  const { showETOMViewer } = useView();
    
    // Pane widths state
    const [leftPaneWidth, setLeftPaneWidth] = useState(INITIAL_LEFT_WIDTH);
    const [rightPaneWidth, setRightPaneWidth] = useState(INITIAL_RIGHT_WIDTH);
    
    // Resize handling state
    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);


    
    const transformToRowFormat=(nodes)=> {
      //console.log("fetchHierarchy:rowFormat-0",nodes); //fetchHierarchy:rowFormat
      // First pass: build ID to Name mapping for all levels
        const idToNameMap = {};
        nodes.forEach(node => {
          //console.log("fetchHierarchy:rowFormat-0.1",node); 
          // Store current node's ID, name, metadata and relationships
          if (node.id) {
            //console.log("fetchHierarchy:rowFormat-0.2",node);           
            idToNameMap[node.id] = {
              name: node.name || '',
              metadata: node.metadata || {},
              relationship: node.relationship || {},
              relationships: node.relationships || {}
            };
          }
        });
  
  
      return nodes.map(node => {
        //console.log("fetchHierarchy:rowFormat-0.3",node);           
  
        const row = {};
        
        Object.entries(ProcessDataHandler_Nodes.LEVELS).forEach(([level, config]) => {
          if (node.level === level) {
            row[config.id] = node.id || '';
            row[config.name] = node.name || '';
            
            // Add metadata
            if (config.metadata) {
              config.metadata.forEach(field => {
                row[field] = node.metadata?.[field] || '';
              });
            }
            //console.log("fetchHierarchy:rowFormat-0.4",level,config);           
            
            // Add relationships
            if (config.relationships) {
              const { predecessor, condition } = config.relationships;
              row[predecessor] = node.relationships?.predecessors?.join(',') || '';
              row[condition] = JSON.stringify(node.relationships?.condition || {});
              //console.log("fetchHierarchy:rowFormat-0.5",config.relationships,JSON.stringify(node.relationships?.condition),row[condition],);           
  
            }
          } else {
            //console.log("transformToRowFormat:node.level",level);
            //console.log("transformToRowFormat1:node.config.id",config.id);
            row[config.id] = node.lineage?.[`${level}_ID`] || '';
            const ancestorId = row[config.id];
  
            
              row[config.name] =  idToNameMap[ancestorId]?.name || ''; //= ''ancestorId ? (idToNameMap[ancestorId] || '') : '';
            
            // Add metadata
            if (config.metadata) {
              config.metadata.forEach(field => {
                row[field] = idToNameMap[ancestorId]?.metadata?.[field] || ''; //node.metadata?.[field] || '';
              });
            }
            //console.log("fetchHierarchy:rowFormat-0.6",config.relationships);           
            
            // Add relationships
            if (config.relationships) {
              //console.log("fetchHierarchy:rowFormat-0.7",config.relationships,ancestorId );           
  
              const { predecessor, condition } = config.relationships;
              row[predecessor] = idToNameMap[ancestorId]?.relationships?.predecessors?.join(',') || '';
              row[condition] = JSON.stringify(idToNameMap[ancestorId]?.relationships?.condition || {});
              //console.log("fetchHierarchy:rowFormat-0.8",row[condition],JSON.stringify(idToNameMap[ancestorId]?.relationships?.condition));           
              
            }
  
          }
        });
     //console.log("fetchHierarchy:rowFormat-0.9",row);
        return row;
      });
    }
  
  
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const data = await hierarchyApi.fetchHierarchy();
        
        //console.log("fetchHierarchy:data",data);
        if (data.nodes){
  
            // Transform to row format
            const rowFormat = transformToRowFormat(data.nodes);
            
            console.log("fetchHierarchy:rowformat:after-1",rowFormat);
            
            // Process hierarchy
            const result=ProcessDataHandler_Nodes.processDBData(rowFormat);
            //const hierarchy = processHierarchy(rowFormat);
            console.log("fetchHierarchy:rowFormat:after-2",result.hierarchy);
            const hierarchy = result.hierarchy;
      
           
        setHierarchy(hierarchy);
        setError(null);
      } }
      
      catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const DB_Nodes_Data = async () => {
      try {
        setLoading(true);
        const data = await hierarchyApi.fetchHierarchy();
        
        //console.log("fetchHierarchy:data",data);
        if (data.nodes){
  
            // Transform to row format
            const rowFormat = transformToRowFormat(data.nodes);
            
            //console.log("fetchHierarchy:rowformat:after-1",rowFormat);
            
            // Process hierarchy
//            const result=ProcessDataHandler_Nodes.processDBData(rowFormat);
            //const hierarchy = processHierarchy(rowFormat);
  //          console.log("fetchHierarchy:rowFormat:after-2",result.hierarchy);
    //        const hierarchy = result.hierarchy;
      
           
      //  setHierarchy(hierarchy);
        setError(null);
        return rowFormat;
      } }
      
      catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

const handleSelect = (selection) => {
  if (selection.type === 'HIERARCHY_UPDATE') {
    setHierarchy(selection.data);
    
    // Optionally persist changes to backend
    //saveHierarchyToBackend(selection.data);
  } else {
    handleNodeSelect(selection)
    // Handle other selection types
  }
};

const processData = async (source,Nodes_DB) => {
  let Nodes_data=null;
  switch (source) {
  case 'Nodes_DB':
  if (!Nodes_DB) return;
  if (Nodes_DB.length===0) return;
  Nodes_data=Nodes_DB;
  console.log("Index:processData:Processing Nodes_DB data...",Nodes_data);

    default:
      if (!data) return;
      if (data.length===0) return;
      console.log("Index:processData:Processing data...",data);
      Nodes_data=data;
  }
  
  setIsProcessing(true);
  try {
    console.log("Index:processData:Nodes_Data...",Nodes_data);
    
    const {hierarchy:newHierarchy} = await processExcelData(
      null,
      Nodes_data,
      ProcessDataHandler_Nodes.LEVELS,
      ProcessDataHandler_Nodes,
      'DB'
    );
    console.log("Index:processData:Processing newHierarchy...",newHierarchy);
    setHierarchy(newHierarchy);
    setError(null);
    
    
  } catch (error) {
    console.error("Error processing data:", error);
    setError(error.message);
  } finally {
    setIsProcessing(false);
  }
};



useEffect(() => {
    fetchHierarchy();
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
   console.log("Processflowview:handleNodeSelect:ProcessFlowView:node",node);
    const path = getNodePath(hierarchy, node.id, node.lineage);
    try{
    if (path) {
      setSelectedNode(node);
      
      setBreadcrumb(path);
      
      // Process flow logic
      switch (true) {
        case (Boolean(node.type === 'processArea' && node.processes)):
          const flow = ProcessDataHandler_Nodes.getProcessFlow(node.processes);
          
          setProcessFlow(flow);
          break;
      
        case ((node.children && typeof node.children === 'object' && Object.keys(node.children).length > 0)):
          const childrenFlow = ProcessDataHandler_Nodes.getProcessFlow(node.children);
          
          setProcessFlow(childrenFlow);
          break;
      
        default:
          //setProcessFlow(null);
      }
      if (!rightPaneVisible) {
        //setRightPaneVisible(true);
      }
    }} catch {return}
  };

  const handleBreadcrumbClick = (item) => {
    // Find the node in the hierarchy and select it
    console.log("Processflowview:handleBreadcrumbClick:item",item);
    try{
    const path = getNodePath(hierarchy, item.id, item.lineage);
    if (path) {
      const node = path[path.length - 1];
      handleNodeSelect(node);
      //clickNode(node.id);
    }} 
    catch{
      return
    }
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

const MainContent = React.memo(({ selectedNode, processFlow, breadcrumb, handleNodeSelect, handleNodeDoubleClick }) => {
  const contentRef = useRef(null);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current) {
        // Get the parent container dimensions
        const parentRect = contentRef.current.parentElement.getBoundingClientRect();
        
        // Calculate available space by accounting for padding and borders
        const computedStyle = window.getComputedStyle(contentRef.current);
        const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
        const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);

        // Set dimensions accounting for padding and borders
        const availableWidth = parentRect.width - paddingX - borderX;
        const availableHeight = parentRect.height - paddingY - borderY;

        
        setViewportDimensions({ 
          width: availableWidth,
          height: availableHeight
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Create ResizeObserver for continuous monitoring
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid excessive updates
      requestAnimationFrame(updateDimensions);
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
      // Also observe parent to catch container resizing
      resizeObserver.observe(contentRef.current.parentElement);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={contentRef}
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        // Ensure the container takes full available space
        width: '100%',
        height: '100%',
        // Debug outline to visualize the container
        outline: process.env.NODE_ENV === 'development' ? '1px solid red' : 'none'
      }}
    >
      <div 
        className="flex-1 bg-white rounded border overflow-auto"
        style={{
          // Ensure inner content respects viewport dimensions
          width: viewportDimensions.width > 0 ? `${viewportDimensions.width}px` : '100%',
          height: viewportDimensions.height > 0 ? `${viewportDimensions.height}px` : '100%'
        }}
      >
        {processFlow ? (
           
          <WebflowManager 
            data={processFlow} 
            onNodeSelect={handleNodeSelect} 
            selectedNode={selectedNode} 
            onNodeDoubleClick={handleNodeDoubleClick}
            viewportDimensions={viewportDimensions}
          />
          
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <Info className="w-6 h-6 mr-2" />
            <span>Select a process area to view its flow</span>
          </div>
        )}
      </div>
    </div>
  );
});


    
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
   

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      {showETOMViewer ? (
        // Show the ETOMViewer when the state is true
        <div className="flex-1 overflow-hidden">
          <IntegratedETOMViewer />
        </div>
      ) :isAdmin ? (
        // Admin view - full height minus header
        <div >

          <ProcessAdmin />
        </div>
      ) : (
        // Regular user view
        <div className="flex flex-col flex-1">
          <div className="flex items-center px-4 py-2 bg-gray-50">
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
                visibility: leftPaneVisible ? 'visible' : 'hidden',
                transition: 'all 300ms ease-in-out'
              }}
              className="flex-shrink-0 h-full overflow-hidden transition-all duration-300"
            >
              <LeftPane 
                data={hierarchy} 
                onSelect={handleSelect}
                DBData={data} 
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
              <DetailsPane 
                node={selectedNode}
                hierarchy={hierarchy}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





export default ProcessFlowView;