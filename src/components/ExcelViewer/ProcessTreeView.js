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

const ProcessTreeView = ({ data, columns, onUpdate }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newRows, setNewRows] = useState([{}]);

  // Create tree structure
  const createTreeStructure = (items) => {
    const tree = new Map();
    const roots = [];

    // First pass: Create nodes
    items.forEach(item => {
      tree.set(item.id || item.ID, {
        data: item,
        children: []
      });
    });

    // Second pass: Build tree
    items.forEach(item => {
      const node = tree.get(item.id || item.ID);
      const parentId = item.parent || item.PARENT;

      if (parentId && tree.has(parentId)) {
        tree.get(parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const treeData = createTreeStructure(data);

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

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setNewRows([{}]);
    setShowAddModal(true);
  };

  const handleAddRows = () => {
    const newData = [...data];
    const parentId = selectedNode.data.id || selectedNode.data.ID;
    
    newRows.forEach(row => {
      newData.push({
        ...row,
        parent: parentId,
        id: Math.max(...data.map(d => parseInt(d.id || d.ID) || 0)) + 1
      });
    });
    
    onUpdate(newData);
    setShowAddModal(false);
    setNewRows([{}]);
    setSelectedNode(null);
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
    if (newRows.length === 1) return;
    const updatedRows = newRows.filter((_, i) => i !== index);
    setNewRows(updatedRows);
  };

  const renderTreeNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.data.id || node.data.ID);
    const label = node.data[columns[0]] || node.data.id || node.data.ID;

    return (
      <div key={node.data.id || node.data.ID}>
        <div 
          className="flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded"
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div 
            className="w-6 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleNode(node.data.id || node.data.ID);
              }
            }}
          >
            {hasChildren && (
              isExpanded ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
            )}
          </div>
          
          <div 
            className="flex-1 flex items-center gap-2 group"
            onClick={() => handleNodeClick(node)}
          >
            <span className="text-sm">{label}</span>
            <button 
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Root Level Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedNode({ data: { id: null } });
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Root Item
        </button>
      </div>

      {/* Tree View */}
      <div className="border rounded-lg bg-white p-4">
        {treeData.map(node => renderTreeNode(node))}
        {treeData.length === 0 && (
          <div className="text-center text-gray-500">
            No data available. Click "Add Root Item" to start.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewRows([{}]);
          setSelectedNode(null);
        }}
        title={`Add Child Items${selectedNode?.data[columns[0]] ? ` to ${selectedNode.data[columns[0]]}` : ''}`}
      >
        <div className="space-y-4">
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

export default ProcessTreeView;