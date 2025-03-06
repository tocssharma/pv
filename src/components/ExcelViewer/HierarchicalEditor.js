import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Save, X } from 'lucide-react';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
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

const HierarchicalEditor = ({ 
  data, 
  columns, 
  onUpdate, 
  parentField = 'parent',
  idField = 'id' 
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [newRows, setNewRows] = useState([{}]);
  const [editingNode, setEditingNode] = useState(null);

  // Create hierarchical structure
  const createHierarchy = (items) => {
    const hierarchy = new Map();
    const roots = [];

    // First pass: Create nodes
    items.forEach(item => {
      hierarchy.set(item[idField], {
        data: item,
        children: []
      });
    });

    // Second pass: Build tree
    items.forEach(item => {
      const node = hierarchy.get(item[idField]);
      const parentId = item[parentField];

      if (parentId && hierarchy.has(parentId)) {
        hierarchy.get(parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const hierarchy = createHierarchy(data);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddRows = () => {
    const newData = [...data];
    newRows.forEach(row => {
      newData.push({
        ...row,
        [parentField]: selectedParent,
        [idField]: Math.max(...data.map(d => parseInt(d[idField]) || 0)) + 1
      });
    });
    onUpdate(newData);
    setShowAddModal(false);
    setNewRows([{}]);
    setSelectedParent(null);
  };

  const addNewRowField = () => {
    setNewRows([...newRows, {}]);
  };

  const updateNewRowField = (index, field, value) => {
    const updatedRows = [...newRows];
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value
    };
    setNewRows(updatedRows);
  };

  const removeNewRowField = (index) => {
    if (newRows.length === 1) return; // Keep at least one row
    const updatedRows = newRows.filter((_, i) => i !== index);
    setNewRows(updatedRows);
  };

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.data[idField]);
    const isEditing = editingNode === node.data[idField];
    const parentName = data.find(d => d[idField] === node.data[parentField])?.[columns[0]] || 'Root';

    return (
      <div key={node.data[idField]} className="border-b border-gray-100 last:border-b-0">
        <div 
          className="group flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.data[idField])}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          {isEditing ? (
            <div className="flex-1 grid grid-cols-3 gap-2">
              {columns.map(col => (
                <input
                  key={col}
                  value={node.data[col] || ''}
                  onChange={(e) => {
                    const updatedData = [...data];
                    const index = updatedData.findIndex(d => d[idField] === node.data[idField]);
                    updatedData[index] = {
                      ...updatedData[index],
                      [col]: e.target.value
                    };
                    onUpdate(updatedData);
                  }}
                  placeholder={col}
                  className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                />
              ))}
              <button
                onClick={() => setEditingNode(null)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 grid grid-cols-3 gap-4">
                {columns.map(col => (
                  <span key={col} className="truncate">
                    {col === parentField ? parentName : node.data[col]}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingNode(node.data[idField])}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedParent(node.data[idField]);
                    setShowAddModal(true);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
        
        {isExpanded && node.children.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Root Level Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedParent(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Root Item
        </button>
      </div>

      {/* Tree View */}
      <div className="border rounded-lg bg-white">
        {hierarchy.map(node => renderNode(node))}
        {hierarchy.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No data available. Click "Add Root Item" to start.
          </div>
        )}
      </div>

      {/* Add Rows Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewRows([{}]);
        }}
        title={`Add New ${selectedParent ? 'Child' : 'Root'} Items`}
      >
        <div className="space-y-4">
          {selectedParent && (
            <div className="p-2 bg-gray-50 rounded">
              <span className="font-medium">Parent: </span>
              {data.find(d => d[idField] === selectedParent)?.[columns[0]] || 'Root'}
            </div>
          )}
          
          {newRows.map((row, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded bg-gray-50">
              <div className="flex-1 grid grid-cols-3 gap-2">
                {columns.map(col => (
                  <input
                    key={col}
                    value={row[col] || ''}
                    onChange={(e) => updateNewRowField(index, col, e.target.value)}
                    placeholder={col}
                    className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
              <button
                onClick={() => removeNewRowField(index)}
                className="p-1 text-gray-500 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={addNewRowField}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Row
            </button>
            <button
              onClick={handleAddRows}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save All Rows
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HierarchicalEditor;