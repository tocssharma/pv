import React, { useState, useEffect, useRef } from 'react';
import { Table } from '../ui/table';
import { Alert } from '../ui/alert';
import { ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';

// Row Data Display Component
export const RowDataView = ({ data, validations, onNodeClick }) => {
    console.log("RowDataView:data", data);
    console.log("RowDataView:validations", validations);
    

    const [expandedColumns, setExpandedColumns] = useState({});
    
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="p-4 text-gray-500">No row data available</div>;
    }
    
    const toggleColumn = (columnName) => {
      setExpandedColumns(prev => ({
        ...prev,
        [columnName]: !prev[columnName]
      }));
    };
  
    const getValidationsForCell1 = (rowIndex, columnName) => {
      
        
        return validations.filter(v => 
        v.location.includes(`Row ${rowIndex + 1}`) && 
        v.location.toLowerCase().includes(columnName.toLowerCase())
      
    ); 

    };

    const getValidationsForCell = (rowIndex, columnName, nodeId) => {
        return validations.filter(v => {
            // Add null check for location
            if (!v.location) {
                console.warn('Validation missing location:', v);
                return false;
            }
    
            // Handle imported validations
            if (v.parentNodeId) {
                return v.nodeId === nodeId && 
                       v.column?.toLowerCase() === columnName.toLowerCase();
            }
            
            // For original data validations
            return v.location.includes(`Row ${rowIndex + 1}`) && 
                   v.location.toLowerCase().includes(columnName.toLowerCase());
        });
    };
  
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
  
    const formatCellValue = (value) => {
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    };
  
    return (
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th 
                  key={header}
                  className="px-4 py-2 text-left font-medium cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleColumn(header)}
                >
                  <div className="flex items-center gap-2">
                    {expandedColumns[header] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {headers.map((header) => {
                  const cellValidations = getValidationsForCell(rowIndex, header,row.id );
                  const hasError = cellValidations.some(v => v.type === 'error');
                  const hasWarning = cellValidations.some(v => v.type === 'warning');
                  const cellValue = formatCellValue(row[header]);
                  
                  return (
                    <td 
                      key={`${rowIndex}-${header}`}
                      className={`px-4 py-2 ${hasError ? 'bg-red-50' : hasWarning ? 'bg-yellow-50' : ''} 
                                ${row.id ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => row.id && onNodeClick(row.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="whitespace-pre-wrap">{cellValue}</span>
                        {(hasError || hasWarning) && (
                          <AlertCircle 
                            className={`w-4 h-4 flex-shrink-0 ${hasError ? 'text-red-500' : 'text-yellow-500'}`} 
                          />
                        )}
                      </div>
                      {expandedColumns[header] && cellValidations.length > 0 && (
                        <div className="mt-2">
                          {cellValidations.map((validation, index) => (
                            <Alert 
                              key={index}
                              variant={validation.type}
                              className="text-sm p-2 mb-1"
                            >
                              {validation.message}
                            </Alert>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };
  
  // Hierarchical Data Display Component
  export const HierarchicalView = ({ data, validations, onNodeClick }) => {
console.log("HierarchicalView:data", data);

    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const prevDataRef = useRef(data);

    useEffect(() => {
        if (data) {
            const newExpandedNodes = new Set(expandedNodes);
            
            // Keep all currently expanded nodes expanded
            const keepExpanded = (obj) => {
                Object.keys(obj).forEach(key => {
                    if (expandedNodes.has(key)) {
                        newExpandedNodes.add(key);
                        if (obj[key]?.children) {
                            keepExpanded(obj[key].children);
                        }
                    }
                });
            };
            keepExpanded(data);
            
            setExpandedNodes(newExpandedNodes);
        }
    }, [data]);

    const renderNode = (node, level = 0) => {
        if (!node?.id) return null;


        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && Object.keys(node.children).length > 0;
        
        console.log("Rendering node:", node.id, {
            isExpanded,
            hasChildren,
            children: node.children
        });

        return (
            <div key={node.id} className="select-none">
                <div 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onNodeClick(node.id)}
                >
                    {hasChildren && (
                        <div onClick={(e) => {
                            e.stopPropagation();
                            toggleNode(node.id);
                        }}>
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </div>
                    )}
                    <span>{node.name || node.id}</span><span>{node.id || node.name}</span>
                </div>
                
                {isExpanded && hasChildren && (
                    <div className="ml-4">
                        {Object.values(node.children).map(child => 
                            renderNode(child, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };


    const getNodeValidations = (nodeId) => {
        return validations.filter(v => v.location.includes(nodeId));
      };


    const toggleNode = (nodeId) => {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    };
    

  
    return (
        <div className="border rounded-lg p-4">
            {data && Object.values(data).length > 0 ? (
                Object.values(data).map(node => renderNode(node))
            ) : (
                <div className="text-gray-500">No data available</div>
            )}
        </div>
    );
  };
  
  export const DataViewer = ({ rowData, hierarchicalData, validations }) => {
    const [selectedView, setSelectedView] = useState('row');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [jsonView, setJsonView] = useState(false);
  
    if (!rowData || !hierarchicalData) {
      return <div className="p-4 text-gray-500">No data available to display</div>;
    }
  
    const handleNodeClick = (nodeId) => {
      setSelectedNodeId(nodeId);
      // If in row view, scroll to the corresponding row
      // If in tree view, expand the path to the node
    };
  
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg ${selectedView === 'row' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedView('row')}
          >
            Row View
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${selectedView === 'tree' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedView('tree')}
          >
            Hierarchical View
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${jsonView ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setJsonView(!jsonView)}
          >
            {jsonView ? 'Hide JSON' : 'Show JSON'}
          </button>
        </div>
  
        {jsonView && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Row Data JSON</h3>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(rowData, null, 2)}
              </pre>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Hierarchical Data JSON</h3>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(hierarchicalData, null, 2)}
              </pre>
            </div>
          </div>
        )}
  
        <div className="border rounded-lg">
          {selectedView === 'row' ? (
            <RowDataView 
              data={rowData} 
              validations={validations}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <HierarchicalView 
              data={hierarchicalData}
              validations={validations}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>
      </div>
    );
  };
  