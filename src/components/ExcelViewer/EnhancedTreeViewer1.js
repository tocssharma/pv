import ProcessDataHandler from "../../lib/dataHelper";
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save } from 'lucide-react';

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
          {node.processes && Object.values(node.processes).map((process) => (
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
  const [editableRows, setEditableRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (data) {
      const transformedData = ProcessDataHandler.transformToHierarchy(data);
      setHierarchicalData(transformedData);
    }
  }, [data]);

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
                 row[ProcessDataHandler.LEVELS.L7.id] === node.id||
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
    const newRow = { ...editableRows[0] };
    Object.keys(newRow).forEach(key => {
      newRow[key] = '';
    });
    setEditableRows([...editableRows, newRow]);
  };

  const handleSaveChanges = () => {
    const updatedData = data.map(row => {
      const matchingRow = editableRows.find(editRow => {
        return Object.values(ProcessDataHandler.LEVELS).some(level => 
          level.id && row[level.id] === editRow[level.id]
        );
      });
      return matchingRow || row;
    });

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
                  <tr key={rowIndex}>
                    {columns.map(col => (
                      <td key={col} className="px-3 py-2">
                        <input
                          value={row[col] || ''}
                          onChange={(e) => handleRowUpdate(rowIndex, col, e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-4 border-t">
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