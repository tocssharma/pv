import ProcessDataHandler from "../../lib/dataHelper";
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save, Trash2, Upload  } from 'lucide-react';
import * as XLSX from 'xlsx';

// Import Options Modal
const ImportOptionsModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-lg font-semibold mb-4">Import Options</h3>
        <div className="space-y-4">
          <button
            onClick={() => onConfirm('overwrite')}
            className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Overwrite All Children
          </button>
          <button
            onClick={() => onConfirm('add')}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Add as New Rows
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Modal Component remains the same
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const FILTER_TYPES = {
  DOMAIN: 'domain',
  LOB: 'lob',
  JOURNEY: 'journey',
  PROCESS_AREA: 'processArea',
  PROCESS: 'process'
};

const TreeNode = ({ node, level, expandedNodes, toggleNode, onSelect, searchTerm }) => {
  const hasChildren = (node.children && Object.keys(node.children).length > 0) ||
                     (node.processes && Object.keys(node.processes).length > 0);
  const isExpanded = expandedNodes.has(node.id);
  const matchesSearch = searchTerm && 
    node.name.toLowerCase().includes(searchTerm.toLowerCase());
    
  const processHierarchy = node.processes ? 
    ProcessDataHandler.createHierarchy(node.processes) : null;

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
    <div className="relative">
      {/* Connector Lines */}
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 border-l-2 border-gray-200" 
          style={{ 
            height: '100%',
            left: `${(level - 1) * 24 + 12}px` 
          }}
        />
      )}
      
      <div 
        className={`relative flex items-center py-2 hover:bg-gray-50 rounded group
          ${matchesSearch ? 'bg-yellow-50' : ''}`}
        style={{ paddingLeft: `${level * 24}px` }}
      >
        {/* Horizontal connector line */}
        {level > 0 && (
          <div 
            className="absolute border-t-2 border-gray-200"
            style={{ 
              width: '24px',
              left: `${(level - 1) * 24}px` 
            }}
          />
        )}

        {/* Toggle button with icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleNode(node.id);
          }}
          className={`w-6 h-6 flex items-center justify-center rounded
            ${hasChildren ? 'hover:bg-gray-200' : ''}`}
        >
          {hasChildren && (
            isExpanded ? 
              <ChevronDown className="w-4 h-4 text-gray-600" /> : 
              <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Node content */}
        <div 
          className="flex-1 flex items-center gap-2 pl-1 cursor-pointer"
          onClick={() => onSelect(node)}
        >
          <span className={`text-sm font-medium ${
            node.type === FILTER_TYPES.DOMAIN ? 'text-blue-600' :
            node.type === FILTER_TYPES.LOB ? 'text-green-600' :
            node.type === FILTER_TYPES.JOURNEY ? 'text-purple-600' :
            node.type === FILTER_TYPES.PROCESS_AREA ? 'text-orange-600' :
            'text-gray-600'
          }`}>
            {getNodeIcon(node.type)} {node.name}
            <span className="ml-2 text-xs text-gray-500">({node.id})</span>
          </span>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative">
          {node.children && Object.values(node.children).map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
          {node.processes && Object.values(processHierarchy || {}).map((process) => (
            <TreeNode
              key={process.id}
              node={process}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EnhancedTreeViewer = ({ data, columns, onUpdate }) => {
  const [hierarchicalData, setHierarchicalData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editableRows, setEditableRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [importedData, setImportedData] = useState(null);

  useEffect(() => {
    if (data) {
      try {
        const transformedData = ProcessDataHandler.transformToHierarchy(Array.from(data));
        console.log('Transformed hierarchy:', transformedData);
        setHierarchicalData(transformedData);
      } catch (error) {
        console.error('Error transforming data:', error);
      }
    }
  }, [data]);

  // Debug logging for hierarchy
  useEffect(() => {
    if (hierarchicalData) {
      console.log('Current hierarchical data:', hierarchicalData);
    }
  }, [hierarchicalData]);

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

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    const relatedRows = data.filter(row => {
      switch (node.type) {
        case 'domain':
          return row[ProcessDataHandler.LEVELS.L0.id] === node.id;
        case 'lob':
          return row[ProcessDataHandler.LEVELS.L1.id] === node.id;
        case 'journey':
          return row[ProcessDataHandler.LEVELS.L2.id] === node.id;
        case 'processArea':
          return row[ProcessDataHandler.LEVELS.L3.id] === node.id;
        case 'process':
          return row[ProcessDataHandler.LEVELS.L4.id] === node.id ||
                 row[ProcessDataHandler.LEVELS.L5.id] === node.id ||
                 row[ProcessDataHandler.LEVELS.L6.id] === node.id ||
                 row[ProcessDataHandler.LEVELS.L7.id] === node.id;
        default:
          return false;
      }
    });
    
    setEditableRows(relatedRows);
    setShowEditModal(true);
  };

  const handleRowUpdate = (index, field, value) => {
    const updatedRows = [...editableRows];
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value
    };
    setEditableRows(updatedRows);
  };

  const handleAddRow = () => {
    const newRow = { ...editableRows[0] };
    Object.keys(newRow).forEach(key => {
      newRow[key] = '';
    });
    setEditableRows([...editableRows, newRow]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: columns });

          // Remove header row if it exists
          if (jsonData.length > 0 && Object.keys(jsonData[0]).some(key => columns.includes(key))) {
            jsonData.shift();
          }

          setImportedData(jsonData);
          setShowImportModal(true);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          alert('Error processing Excel file. Please check the format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleImportOption = (option) => {
    if (!importedData) return;

    let newRows;
    if (option === 'overwrite') {
      // Remove existing children and add imported data
      newRows = editableRows.filter(row => {
        // Keep rows that are not children of the selected node
        return !isChildOfNode(row, selectedNode);
      });
      newRows = [...newRows, ...importedData];
    } else {
      // Add as new rows
      newRows = [...editableRows, ...importedData];
    }

    setEditableRows(newRows);
    setShowImportModal(false);
    setImportedData(null);
  };

  const isChildOfNode = (row, node) => {
    if (!node) return false;

    switch (node.type) {
      case 'domain':
        return row[ProcessDataHandler.LEVELS.L0.id] === node.id;
      case 'lob':
        return row[ProcessDataHandler.LEVELS.L1.id] === node.id;
      case 'journey':
        return row[ProcessDataHandler.LEVELS.L2.id] === node.id;
      case 'processArea':
        return row[ProcessDataHandler.LEVELS.L3.id] === node.id;
      case 'process':
        return row[ProcessDataHandler.LEVELS.L4.id] === node.id ||
               row[ProcessDataHandler.LEVELS.L5.id] === node.id ||
               row[ProcessDataHandler.LEVELS.L6.id] === node.id ||
               row[ProcessDataHandler.LEVELS.L7.id] === node.id;
      default:
        return false;
    }
  };

  const handleDeleteRow = (indexToDelete) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      setEditableRows(prev => prev.filter((_, index) => index !== indexToDelete));
    }
  };

  const handleSaveChanges = () => {
    // Deep clone the original data
    let updatedData = [...data];

    // Track IDs of rows we've processed
    const processedIds = new Set();

    // Function to get all relevant IDs for a row
    const getRowIds = (row) => {
      return Object.values(ProcessDataHandler.LEVELS)
        .map(level => level.id && row[level.id])
        .filter(Boolean);
    };

    // First, update existing rows
    editableRows.forEach(editRow => {
      const rowIds = getRowIds(editRow);
      
      // Try to find matching existing row
      const existingRowIndex = updatedData.findIndex(dataRow => {
        return rowIds.some(id => 
          Object.values(ProcessDataHandler.LEVELS).some(level => 
            level.id && dataRow[level.id] === id
          )
        );
      });

      if (existingRowIndex !== -1) {
        // Update existing row
        updatedData[existingRowIndex] = { ...editRow };
        processedIds.add(existingRowIndex);
      } else {
        // This is a new row, will be added later
        processedIds.add(`new-${rowIds.join('-')}`);
      }
    });

    // Add new rows that didn't exist before
    editableRows.forEach(editRow => {
      const rowIds = getRowIds(editRow);
      const isNew = !updatedData.some(dataRow => 
        rowIds.some(id => 
          Object.values(ProcessDataHandler.LEVELS).some(level => 
            level.id && dataRow[level.id] === id
          )
        )
      );

      if (isNew) {
        updatedData.push({ ...editRow });
      }
    });

    // Handle deleted rows
    if (selectedNode) {
      // Only remove rows that were children of the selected node and weren't in editableRows
      updatedData = updatedData.filter(row => {
        const isChild = isChildOfNode(row, selectedNode);
        if (!isChild) return true; // Keep non-child rows

        // Check if this row exists in editableRows
        const rowExists = editableRows.some(editRow => {
          return Object.values(ProcessDataHandler.LEVELS).some(level => 
            level.id && row[level.id] === editRow[level.id]
          );
        });

        return rowExists; // Keep the row if it exists in editableRows
      });
    }

    onUpdate(updatedData);
    setShowEditModal(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        {hierarchicalData ? (
          <div className="space-y-1">
            {Object.values(hierarchicalData).map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                onSelect={handleNodeSelect}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">Loading...</div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${selectedNode?.name || ''} Data`}
      >
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group">
                    {columns.map(col => (
                      <td key={col} className="px-3 py-2">
                        <input
                          value={row[col] || ''}
                          onChange={(e) => handleRowUpdate(rowIndex, col, e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 w-10">
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={handleAddRow}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
              <label className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Import Excel
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Import Options Modal */}
          <ImportOptionsModal
            isOpen={showImportModal}
            onClose={() => {
              setShowImportModal(false);
              setImportedData(null);
            }}
            onConfirm={handleImportOption}
          />
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedTreeViewer;