import React, { useRef, useCallback,  useMemo, useEffect  } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useReactFlow
} from 'reactflow';

import {
    CustomControls,
    useDebugHandles, 
    DownloadControls,
    LayoutToggle,
    useKeyboardNavigation,NodeHeaderExtended
  } from './index.js';

  import { useTreeController } from './TreeController3.js';


const FlowWithControls  = ({ 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    nodeTypes, 
    edgeTypes,
    onConnect,
    onNodeSelect,
    onNodeDoubleClick,
    selectedNode,
    selectedNodeId,
    handleLayoutDirectionChange,
    layoutdirection,onLayoutDirectionChange
  }) => {

    const { clickNode } = useTreeController();
    // Add ref to store parent node info
    const selectedParentRef = useRef(null);

    const { fitView, project, setViewport, getViewport } = useReactFlow();
    const reactFlowWrapper = useRef(null);
   // Add a ref to track if the layout was initialized
   const isInitialized = useRef(false);
   // Add a ref to track if changes are from user interaction
   const isUserInteraction = useRef(false);
  
   const prevNodeCount=useRef(0);
    // Use our custom keyboard navigation hook
    useKeyboardNavigation();
  
 // Function to ensure controls are visible
 const ensureControlsVisible = useCallback(() => {
    const flowContainer = reactFlowWrapper.current;
    const downloadButton = document.querySelector('.download-controls-button');
    
    
    if (flowContainer && (downloadButton)) {
      const containerRect = flowContainer.getBoundingClientRect();
      const buttonRect = downloadButton.getBoundingClientRect();
      
      // If button is outside viewport, adjust container
      if (buttonRect.bottom > containerRect.bottom || 
        buttonRect.right > containerRect.right ) {
        flowContainer.style.minHeight = '800px'; // Increased minimum height
         // Set minimum width based on button position
         const minWidth = buttonRect.right - containerRect.left + 20; // 20px padding
         flowContainer.style.minWidth = `${minWidth}px`;

        flowContainer.style.overflow = 'auto';
      }
    }
  }, []);

  


useEffect(() => {
    const handleKeyDown = (event) => {
      const PAN_AMOUNT = 100; // Pixels to pan per keypress
      const currentViewport = getViewport();

      switch (event.key) {
        case 'ArrowUp':
          setViewport({
            ...currentViewport,
            y: currentViewport.y + PAN_AMOUNT
          });
          break;
        case 'ArrowDown':
          setViewport({
            ...currentViewport,
            y: currentViewport.y - PAN_AMOUNT
          });
          break;
        case 'ArrowLeft':
          setViewport({
            ...currentViewport,
            x: currentViewport.x + PAN_AMOUNT
          });
          break;
        case 'ArrowRight':
          setViewport({
            ...currentViewport,
            x: currentViewport.x - PAN_AMOUNT
          });
          break;
        default:
          // Handle zoom shortcuts
          if (event.ctrlKey || event.metaKey) {
            if (event.key === '=' || event.key === '+') {
              event.preventDefault();
              setViewport({
                ...currentViewport,
                zoom: currentViewport.zoom * 1.2
              });
            } else if (event.key === '-') {
              event.preventDefault();
              setViewport({
                ...currentViewport,
                zoom: currentViewport.zoom / 1.2
              });
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getViewport, setViewport]);

     // Add debug hook
     const checkHandles = useDebugHandles();
    
     /*const getParentNodeId = (nodeId) => {
        // Remove last segment (e.g., "01" from "JIN-NIC-P2B-NPD-01-01")
        const parts = nodeId.split('-');
        if (parts.length <= 4) return nodeId; // Base level node (e.g., JIN-NIC-P2B-NPD-01)
        parts.pop();
        return parts.join('-');
      }; */


      // Utility function to safely get level number
const getLevelNumber = (level) => {
  if (!level) return 0;
  
  // If it's already a number, return it
  if (typeof level === 'number') return level;
  
  // If it's a string starting with 'L', parse the number after it
  if (typeof level === 'string' && level.startsWith('L')) {
    return parseInt(level.substring(1));
  }
  
  // If it's a string of just a number, parse it
  if (typeof level === 'string') {
    return parseInt(level);
  }
  
  return 0;
};


      const getParentNodeId = (nodes, nodeData) => {
        if (!nodeData?.lineage) return null;
        
        const level = nodeData.level;
        const currentLevel =  getLevelNumber(nodeData.level);
          
        console.log("Level parsing:", { 
          originalLevel: level,
          parsedLevel: currentLevel,
          nodeData 
        });  // Debug log
        
        if (currentLevel === 0) return null;
        
        // Get parent level info
        const parentLevel = `L${currentLevel - 1}`;
        const parentId = nodeData.lineage[`${parentLevel}_ID`];
        
        // Find parent node by matching both ID and lineage
        const parentNode = nodes.find(node => {
          if (node.id !== parentId) return false;
          
          // Compare lineage up to parent level
          for (let i = 0; i < currentLevel - 1; i++) {
            const levelKey = `L${i}_ID`;
            if (node.data.lineage[levelKey] !== nodeData.lineage[levelKey]) {
              return false;
            }
          }
          return true;
        });
      
        return parentNode;
      };

      

     // Pass fitView up to parent when layout changes
    useEffect(() => {

        if (selectedNodeId && nodes.length) {
            const currentNode = nodes.find(node => node.id === selectedNodeId);
            if (currentNode?.data?.parent) {
              selectedParentRef.current = {
                id: currentNode.data.parent,
                nodeData: currentNode.data
              };
            }
          }
        }, [selectedNodeId, nodes]);
        

    useEffect(() => {

    
        if (onLayoutDirectionChange) {
      onLayoutDirectionChange(layoutdirection, () => {
          
        fitView({
          padding: 0.2,
          duration: 800,
          minZoom: 0.5,
          maxZoom: 1
        });
        
      });
    }
    }, [layoutdirection, onLayoutDirectionChange, fitView]);
    

    // Add debug effect
     useEffect(() => {
       // Check handles after nodes and edges are rendered
       const timer = setTimeout(() => {
         checkHandles();
       }, 1000);
       
       return () => clearTimeout(timer);
     }, [nodes, edges, checkHandles]);
  
     useEffect(() => {
        // Only perform automatic fit view if:
        // 1. It's the initial layout (isInitialized is false)
        // 2. It's not from user interaction
        // 3. There are actually nodes to fit
        if (!isInitialized.current && !isUserInteraction.current && nodes.length > 0) {
          const timer = setTimeout(() => {
            fitView({
              padding: 0.2,
              minZoom: 0.5,
              maxZoom: 1,
              duration: 800
            }); 
            // Mark as initialized after first fit
            isInitialized.current = true;
          }, 100);
    
          return () => clearTimeout(timer);
        }
        
        // Reset user interaction flag after each nodes update
        isUserInteraction.current = false;
      }, [nodes, fitView]);
  

    // Create a wrapper for node changes that marks user interactions
    const handleNodesChange = (changes) => {
      // Check if the change is from user dragging or manual position adjustment
      const isManualChange = changes.some(change => 
        change.type === 'position' || 
        change.type === 'dimensions'
      );
      
      if (isManualChange) {
        isUserInteraction.current = true;
      }
      
      // Call the original onNodesChange
      if (onNodesChange) {
        onNodesChange(changes);
      }
    };
    
  // Additional utility functions you can add to the Flow component
  
  const resetAndFitView = () => {
    // Reset the initialization flag to allow automatic fit
    isInitialized.current = false;
    isUserInteraction.current = false;
    
    // Trigger the fit view effect
    const timer = setTimeout(() => {
      fitView({
        padding: 0.2,
        minZoom: 0.5,
        maxZoom: 1,
        duration: 800
      });
      isInitialized.current = true;
    }, 100);
    
    return () => clearTimeout(timer);
  };
  
  
      // Add a manual fit view function that can be called when needed
      const handleFitView = () => {
        fitView({
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1,
          duration: 800
        });
      };
  
    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);
  
    const onDrop = useCallback(
      (event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
    
        try {
          const dropData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
          const { nodeType, ...template } = dropData;
    
          const newNode = {
            id: `${nodeType}-${Date.now()}`,
            type: nodeType,
            position,
            data: {
              ...template,
              label: template.label || template.type?.charAt(0).toUpperCase() + template.type?.slice(1)
            },
            style: nodeType === 'shape' ? {
              width: 100,
              height: 100,
            } : template.style || {
              width: 280,
              height: 100,
            },
          };
    
          if (onNodesChange) {
            onNodesChange([{
              type: 'add',
              item: newNode
            }]);
          }
        } catch (error) {
          console.error('Error creating new node:', error);
        }
      },
      [project, onNodesChange]
    );
  


// Modified layout direction change handler
const handleLayoutChange= (direction=> {
    });



  /*
  const handleNodeClick = useCallback((event, node) => {
    
    event.preventDefault();
    // Get parent ID using the helper function
    const parentId = getParentNodeId(node.id);
    console.log("handleNodeClick:node",node);
    console.log("handleNodeClick:parentId",parentId);

    // Find parent node
    const parentNode = nodes.find(n => n.id === parentId);
    //const parentNode =selectedNode;
    
    if (parentNode) {
        selectedParentRef.current = {
            id: parentNode.id,
            nodeData: parentNode.data
        };
        onNodeSelect?.(parentNode);
        //clickNode(selectedParentRef.current.id);
    } else {
        // If no parent found, use current node
        selectedParentRef.current = {
            id: node.id,
            nodeData: node.data
        };
        onNodeSelect?.(node);
        //clickNode(selectedParentRef.current.id);
    }

}, [onNodeSelect, nodes, getParentNodeId]);

*/


const handleNodeClick = useCallback((event, node) => {
  event.preventDefault();
  
  // Get parent using lineage-aware function
  const parentNode = getParentNodeId(nodes, node.data);
  
  if (parentNode) {
    selectedParentRef.current = {
      id: parentNode.id,
      nodeData: {
        ...parentNode.data,
        lineage: parentNode.data.lineage
      }
    };
    onNodeSelect?.(parentNode);
  } else {
    selectedParentRef.current = {
      id: node.id,
      nodeData: node.data
    };
    onNodeSelect?.(node);
  }
}, [nodes, onNodeSelect]);
  
    const handleNodeDoubleClick = useCallback((event, node) => {
      event.preventDefault();
      onNodeDoubleClick?.(node);
    }, [onNodeDoubleClick]);
  
    const handlePaneClick = useCallback((event) => {
      event.preventDefault();
      onNodeSelect?.(null);
    }, [onNodeSelect]);
  
    // Update nodes with selection state
    const nodesWithSelection = useMemo(() => 
      nodes.map(node => ({
        ...node,
        selected: node.id === selectedNodeId
      }))
    , [nodes, selectedNodeId]);
    return (
    <div 
      ref={reactFlowWrapper} 
      className="h-full w-full relative overflow-auto"
      style={{
        minHeight: '800px',
        maxHeight: '100vh'
      }}
    >        
    <ReactFlow
          nodes={nodesWithSelection}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onPaneClick={handlePaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          
          defaultViewport={{ 
            x: 0, 
            y: 100, 
            zoom: 1 
          }}
          layoutdirection={layoutdirection}
          
          minZoom={0.1}
          maxZoom={2}
          className="bg-gray-50"
        >
        
        <div className="react-flow__panel react-flow__panel--top-left">
        <div className="mb-8">
        <div><NodeHeaderExtended selectedNode={selectedNode} /></div>  
        </div></div>
        <CustomControls direction={layoutdirection}
            onChange={handleLayoutChange}/>
        <Controls/>  
        <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    );
  };

  export default React.memo(FlowWithControls);