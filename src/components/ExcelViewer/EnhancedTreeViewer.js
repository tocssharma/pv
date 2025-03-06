import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save } from 'lucide-react';
import ProcessDataHandler from "../../lib/dataHelper";



// Simple Modal Component
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

const EnhancedTreeViewer = ({ data, columns, onUpdate }) => {
  const [hierarchicalData, setHierarchicalData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableRows, setEditableRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Transform flat data to hierarchy on data change
  useEffect(() => {
    if (data) {
      // Use ProcessDataHandler to transform data
      const transformedData = ProcessDataHandler.transformToHierarchy(data);
      setHierarchicalData(transformedData);
    }
  }, [data]);

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
    // Find all related rows in original data
    const relatedRows = data.filter(row => {
      // Match based on node type and ID
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
                 row[ProcessDataHandler.LEVELS.L7.id] === node.id ||
                 row[ProcessDataHandler.LEVELS.L8.id] === node.id;
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
    // Create new row with current node context
    const newRow = { ...editableRows[0] };
    // Clear all values but maintain structure
    Object.keys(newRow).forEach(key => {
      newRow[key] = '';
    });
    setEditableRows([...editableRows, newRow]);
  };

  const handleSaveChanges = () => {
    // Update the original data while preserving other rows
    const updatedData = data.map(row => {
      const matchingRow = editableRows.find(editRow => {
        // Match based on appropriate ID fields
        return Object.values(ProcessDataHandler.LEVELS).some(level => 
          level.id && row[level.id] === editRow[level.id]
        );
      });
      return matchingRow || row;
    });

    // Add any new rows
    const existingIds = new Set(data.map(row => {
      return Object.values(ProcessDataHandler.LEVELS).map(level => 
        level.id && row[level.id]
      ).filter(Boolean);
    }).flat());

    editableRows.forEach(editRow => {
      const isNew = !Object.values(ProcessDataHandler.LEVELS).some(level => 
        level.id && existingIds.has(editRow[level.id])
      );
      if (isNew) {
        updatedData.push(editRow);
      }
    });

    onUpdate(updatedData);
    setShowEditModal(false);
  };

  const renderTreeNode = (node, level = 0) => {
    const hasChildren = (node.children && Object.keys(node.children).length > 0) ||
                       (node.processes && Object.keys(node.processes).length > 0);
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded
            ${level === 0 ? 'ml-0' : 'ml-4'}`}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            handleNodeSelect(node);
          }}
        >
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
            ) : (
              <span className="w-3 h-3" />
            )}
          </div>
          
          <div className="flex-1 flex items-center">
            <span className={`text-sm font-medium text-gray-900 ${
              searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase()) 
                ? 'bg-yellow-100' 
                : ''
            }`}>
              {getNodeIcon(node.type)} {node.name}
              <span className="ml-2 text-xs text-gray-500">({node.id})</span>
            </span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children && Object.values(node.children).map((child) => 
              renderTreeNode(child, level + 1)
            )}
            {node.processes && Object.values(node.processes).map((process) => 
              renderTreeNode(process, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full px-3 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        {hierarchicalData ? (
          Object.values(hierarchicalData).map((node) => renderTreeNode(node))
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
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-3 py-2 text-left text-sm font-medium text-gray-600">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {editableRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map(col => (
                      <td key={col} className="px-3 py-2">
                        <input
                          value={row[col] || ''}
                          onChange={(e) => handleRowUpdate(rowIndex, col, e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleAddRow}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Add Row
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedTreeViewer;