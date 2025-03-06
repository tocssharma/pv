import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { HierarchicalView, RowDataView } from './importUtils';
import { AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const ResizablePane = ({ children, width, minWidth, onResize, isLastPane }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        const newWidth = e.clientX - dragRef.current.getBoundingClientRect().left;
        if (newWidth >= minWidth) {
          onResize(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, onResize]);

  return (
    <div 
      ref={dragRef}
      className="h-full relative" 
      style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
    >
      {children}
      {!isLastPane && (
        <div
          className="absolute top-0 right-0 w-1 h-full bg-gray-200 hover:bg-blue-400 cursor-col-resize"
          onMouseDown={() => setIsDragging(true)}
        />
      )}
    </div>
  );
};

const MultiPaneDataViewer = ({ rowData, hierarchicalData, validations, onFileUpload }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    console.log("MultiPaneDataViewer:hierarchicalData", hierarchicalData);
 // Calculate base widths based on container width
 const calculateBaseWidths = (totalWidth) => ({
    left: Math.floor(totalWidth * 0.23),    // ~23% for left pane
    middle: Math.floor(totalWidth * 0.54),   // ~54% base width for middle
    right: Math.floor(totalWidth * 0.23)     // ~23% for JSON pane
});
      
   
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    const [uploadError, setUploadError] = useState(null);
    const [isJsonViewVisible, setIsJsonViewVisible] = useState(false);
    // Initialize with dummy values, will be updated in useEffect
    const [baseWidths, setBaseWidths] = useState({ left: 300, middle: 700, right: 300 });
    const [paneWidths, setPaneWidths] = useState([
        baseWidths.left,
        baseWidths.middle + baseWidths.right,
        baseWidths.right
    ]);
    const [previousPaneWidths, setPreviousPaneWidths] = useState([
        baseWidths.left,
        baseWidths.middle,
        baseWidths.right
    ]);


    useEffect(() => {
        const updateWidths = () => {
            if (containerRef.current) {
                const newContainerWidth = containerRef.current.offsetWidth;
                setContainerWidth(newContainerWidth);
                
                const newBaseWidths = calculateBaseWidths(newContainerWidth);
                setBaseWidths(newBaseWidths);
                
                // Update pane widths maintaining proportions
                setPaneWidths(prev => {
                    const totalCurrentWidth = prev.reduce((sum, width) => sum + width, 0);
                    const ratio = newContainerWidth / totalCurrentWidth;
                    
                    if (isJsonViewVisible) {
                        return [
                            Math.floor(prev[0] * ratio),
                            Math.floor(prev[1] * ratio),
                            Math.floor(prev[2] * ratio)
                        ];
                    } else {
                        return [
                            newBaseWidths.left,
                            newContainerWidth - newBaseWidths.left,
                            newBaseWidths.right
                        ];
                    }
                });
            }
        };

        // Initial update
        updateWidths();

        // Add resize observer
        const resizeObserver = new ResizeObserver(updateWidths);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup
        return () => {
            resizeObserver.disconnect();
        };
    }, [isJsonViewVisible]);



   const handlePaneResize = (index, newWidth) => {
        setPaneWidths(prev => {
            const updated = [...prev];
            updated[index] = newWidth;

            // Ensure total width doesn't exceed container width
            const totalWidth = updated.reduce((sum, width) => sum + width, 0);
            if (totalWidth > containerWidth) {
                const excess = totalWidth - containerWidth;
                // Adjust the next pane's width
                const nextIndex = (index + 1) % updated.length;
                updated[nextIndex] = Math.max(200, updated[nextIndex] - excess);
            }

            return updated;
        });
    };

    const toggleJsonView = () => {
        setIsJsonViewVisible(prev => {
            if (prev) {
                // When hiding JSON view
                setPaneWidths([
                    baseWidths.left,
                    containerWidth - baseWidths.left,
                    baseWidths.right
                ]);
            } else {
                // When showing JSON view
                const middleWidth = Math.floor((containerWidth - baseWidths.left - baseWidths.right) * 0.7);
                setPaneWidths([
                    baseWidths.left,
                    middleWidth,
                    containerWidth - baseWidths.left - middleWidth
                ]);
            }
            return !prev;
        });
    };

    
     // Add useEffect to monitor props changes
    useEffect(() => {
        console.log('MultiPaneDataViewer received new hierarchicalData:', hierarchicalData);
    }, [hierarchicalData]);


    const handleNodeClick = (nodeId) => {
      setSelectedNodeId(nodeId);
    };
  
    
  
// Helper function to compare lineage between nodes
const compareLineage = (nodeA, nodeB) => {
    if (!nodeA.lineage || !nodeB.lineage) return false;
    
    // Get the minimum level between the two nodes to compare
    const levelA = parseInt(nodeA.level.substring(1));
    const levelB = parseInt(nodeB.level.substring(1));
    const minLevel = Math.min(levelA, levelB);
    
    // Compare all levels up to and including the minimum level
    for (let i = 0; i <= minLevel; i++) {
      const levelKey = `L${i}_ID`;
      if (nodeA.lineage[levelKey] !== nodeB.lineage[levelKey]) {
        return false;
      }
    }
    return true;
  };

  const getNodeData = (nodeId) => {
    if (!nodeId || !rowData) return [];

    // Find the selected node with proper lineage
    const nodeInHierarchy = findNodeWithLineage(hierarchicalData, nodeId);
    const selectedNode = nodeInHierarchy ? rowData.find(row => 
      row.id === nodeId && compareLineage(nodeInHierarchy, row)
    ) : rowData.find(row => row.id === nodeId);

    if (!selectedNode) return [];

    // Group rows by ID to handle duplicates
    const groupedRows = rowData.reduce((acc, row) => {
      if (row.id === nodeId) {
        // For the selected node itself
        if (!acc[row.id] || compareLineage(selectedNode, row)) {
          acc[row.id] = row;
        }
      } else if (row.parentId === nodeId) {
        // For child nodes
        if (!acc[row.id]) {
          // First occurrence of this ID
          acc[row.id] = row;
        } else if (compareLineage(selectedNode, row)) {
          // Replace if this one has matching lineage
          acc[row.id] = row;
        }
      }
      return acc;
    }, {});

    // Convert back to array
    return Object.values(groupedRows);
  };

    const getNodeData1 = (nodeId) => {
      if (!nodeId || !rowData) return [];
      return rowData.filter(row => {
        // Check if this row is a child of the selected node
        return row.parentId === nodeId || row.id === nodeId;
      });
    };

    
         // Find the selected node in the hierarchy to get its lineage
         const findNodeWithLineage = (hierarchy, nodeId) => {
            for (const key in hierarchy) {
                if (key === nodeId) return hierarchy[key];
                if (hierarchy[key].children) {
                    const found = findNodeWithLineage(hierarchy[key].children, nodeId);
                    if (found) return found;
                }
            }
            return null;
        };

// Update the handleFileUploadForNode function
const handleFileUploadForNode = async (event) => {
    if (!selectedNodeId) {
      setUploadError('Please select a node before uploading data');
      return;
    }


    
    const selectedNode = findNodeWithLineage(hierarchicalData, selectedNodeId);
    if (!selectedNode) {
        setUploadError('Selected node not found');
        return;
    }


    try {
        const currentNodeId = selectedNodeId; 
      const result = await onFileUpload(event, selectedNodeId, {
            level: selectedNode.level,
            lineage: selectedNode.lineage
        });
      console.log('Upload result:', result); // Debug log
      
      // If we received updated data, find the first new child
      if (result?.nodes && selectedNodeId === currentNodeId) {
        const firstNewChild = result.nodes.find(node => 
          node.parentId === selectedNodeId
        );
        if (firstNewChild) {
          // Wait for next render cycle
          setTimeout(() => setSelectedNodeId(firstNewChild.id), 0);
        }
      }

      setUploadError(null);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    }
};
  
    return (
      <div ref={containerRef} className="flex h-screen max-h-[800px] bg-white border rounded-lg overflow-hidden">
        <ResizablePane 
          width={paneWidths[0]} 
          minWidth={200} 
          onResize={(w) => handlePaneResize(0, w)}
        >
          <div className="h-full overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">Hierarchy Tree</h3>
            <HierarchicalView
              data={hierarchicalData}
              validations={validations}
              onNodeClick={handleNodeClick}
            />
          </div>
        </ResizablePane>
  
        <ResizablePane 
          width={paneWidths[1]} 
          minWidth={400} 
          onResize={(w) => handlePaneResize(1, w)}
          isLastPane={!isJsonViewVisible}
        >
          <div className="h-full overflow-y-auto p-4 w-full">
            <div className="mb-4 flex justify-between items-center overflow-y-auto w-full">
              <h3 className="font-semibold flex-shrink-0">
                {selectedNodeId ? `Node Details: ${selectedNodeId}` : 'Select a node to view details'}
              </h3>
              <div className="flex items-center space-x-2">
                            <button
                                onClick={() => toggleJsonView()}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md whitespace-nowrap"
                            >
                                {isJsonViewVisible ? 'Hide JSON' : 'Show JSON'}
                            </button>
              {selectedNodeId && (
                <div className="relative">
                  <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    Import Data
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUploadForNode}
                      accept=".xlsx,.xls"
                    />
                  </label>
                </div>
              )}
              </div>
            </div>
  
            {uploadError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
  
            <Card  className="w-full"> 
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                <RowDataView
                  data={getNodeData(selectedNodeId)}
                  validations={validations}
                  onNodeClick={handleNodeClick}
                  parentNodeId={selectedNodeId} 
                />
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePane>
        {isJsonViewVisible && (
        <ResizablePane 
          width={paneWidths[2]} 
          minWidth={200} 
          onResize={(w) => handlePaneResize(2, w)}
          isLastPane
        >
          <div className="h-full overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">JSON View</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Node Data</h4>
                <pre className="text-xs overflow-auto max-h-64">
                  {JSON.stringify(getNodeData(selectedNodeId), null, 2)}
                </pre>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Hierarchy Data</h4>
                <pre className="text-xs overflow-auto max-h-64">
                  {JSON.stringify(hierarchicalData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </ResizablePane> 
          )}
      </div>
    );
  };
  
  export default MultiPaneDataViewer;