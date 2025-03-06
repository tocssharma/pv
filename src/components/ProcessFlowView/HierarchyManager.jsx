import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import NodeEditForm from "./NodeEditForm";



const HierarchyManager = ({ data, onUpdate, onSelect }) => {
  const [editingNode, setEditingNode] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  console.log("HierarchyManager:data",data);
  // Node manipulation functions
  const addNode = (parentId, newNodeData) => {
    const updateHierarchy = (nodes) => {
      const result = { ...nodes };
      
      if (!parentId) {
        // Adding a root node
        const newId = generateUniqueId(newNodeData.level);
        result[newId] = {
          ...newNodeData,
          id: newId,
          children: {},
          lineage: {
            [`L${newNodeData.level.substring(1)}_ID`]: newId
          }
        };
      } else {
        // Find and update the parent node
        const findAndUpdate = (currentNodes) => {
          const updated = { ...currentNodes };
          
          for (const [id, node] of Object.entries(updated)) {
            if (id === parentId) {
              const newId = generateUniqueId(newNodeData.level);
              if (!node.children) node.children = {};
              node.children[newId] = {
                ...newNodeData,
                id: newId,
                children: {},
                lineage: {
                  ...node.lineage,
                  [`L${newNodeData.level.substring(1)}_ID`]: newId
                }
              };
              return updated;
            }
            if (node.children) {
              node.children = findAndUpdate(node.children);
            }
          }
          return updated;
        };
        
        return findAndUpdate(result);
      }
      
      return result;
    };
    
    const hierarchyWithNewNode = updateHierarchy(data);
    onUpdate(hierarchyWithNewNode);
  };

  const editNode = (nodeId, updatedData) => {
    const updateHierarchy = (nodes) => {
      const result = { ...nodes };
      
      const findAndUpdate = (currentNodes) => {
        const updated = { ...currentNodes };
        
        for (const [id, node] of Object.entries(updated)) {
          if (id === nodeId) {
            updated[id] = {
              ...node,
              ...updatedData,
              children: node.children // Preserve children
            };
            return updated;
          }
          if (node.children) {
            node.children = findAndUpdate(node.children);
          }
        }
        return updated;
      };
      
      return findAndUpdate(result);
    };
    
    const hierarchyAfterEdit = updateHierarchy(data);
    onUpdate(hierarchyAfterEdit);
  };

  const deleteNode = (nodeId) => {
    const updateHierarchy = (nodes) => {
      const result = { ...nodes };
      
      // Handle root level deletion
      if (result[nodeId]) {
        delete result[nodeId];
        return result;
      }
      
      // Handle nested deletion
      const findAndDelete = (currentNodes) => {
        const updated = { ...currentNodes };
        
        for (const [id, node] of Object.entries(updated)) {
          if (node.children && node.children[nodeId]) {
            delete node.children[nodeId];
            if (Object.keys(node.children).length === 0) {
              delete node.children;
            }
            return updated;
          }
          if (node.children) {
            node.children = findAndDelete(node.children);
          }
        }
        return updated;
      };
      
      return findAndDelete(result);
    };
    
    const hierarchyAfterDelete = updateHierarchy(data);
    onUpdate(hierarchyAfterDelete);
  };

  // Helper function to generate unique IDs based on level
  const generateUniqueId = (level) => {
    const levelNum = level.substring(1); // Extract number from "L4", "L5" etc.
    const timestamp = Date.now();
    return `NODE-${levelNum}-${timestamp}`;
  };

// In HierarchyManager.jsx
const handleEdit = (node) => {
    setEditingNode(node);
  };
  
  const handleSave = (nodeId, formData) => {
    const updatedNode = {
      ...data[nodeId],
      ...formData,
      // Preserve system-generated fields
      id: data[nodeId].id,
      type: data[nodeId].type,
      level: data[nodeId].level,
    };
    
    const newHierarchy = {
      ...data,
      [nodeId]: updatedNode
    };
    
    onUpdate(newHierarchy);
  };

  // Node component with edit/delete actions
  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = node.children && Object.keys(node.children).length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const childrenCount=Object.keys(node.children).length;
    
    return (
      <div className="ml-4">
        <div className="flex items-center py-2 hover:bg-gray-50 rounded">
          <div 
            className="w-4 h-4 mr-1 cursor-pointer"
            onClick={() => {
                onSelect(node);
                setExpandedNodes(prev => {
                const newSet = new Set(prev);
                if (newSet.has(node.id)) {
                  newSet.delete(node.id);
                } else {
                  newSet.add(node.id);
                }
                return newSet;
              });
              
            }}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm"             onClick={() => {
                onSelect(node);
                setExpandedNodes(prev => {
                const newSet = new Set(prev);
                if (newSet.has(node.id)) {
                  newSet.delete(node.id);
                } else {
                  newSet.add(node.id);
                }
                return newSet;
              });
              
            }}
          >{node.name}</span>
            <span className="text-xs text-gray-500">({node.level})</span>
            <span className="text-xs text-gray-500">({childrenCount})</span>

            
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setEditingNode(node)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this node?')) {
                  deleteNode(node.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedNode(node);
                setShowAddDialog(true);
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {Object.values(node.children).map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  /*// Node edit form
  const NodeEditForm = ({ node, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: node.name,
      level: node.level,
      type: node.type
    });

    return (
      <div className="p-4 border rounded-lg mt-2">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Level</Label>
            <Select 
              value={formData.level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {['L4', 'L5', 'L6', 'L7', 'L8'].map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(formData)}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };*/

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Process Hierarchy</h3>
        <Button
          onClick={() => {
            setSelectedNode(null);
            setShowAddDialog(true);
          }}
        >
          Add Root Node
        </Button>
      </div>

      <div className="border rounded-lg">
        {Object.values(data).map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>

      {/* Edit Dialog */}
      {editingNode && (
        <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Node</DialogTitle>
            </DialogHeader>
            <NodeEditForm 
              node={editingNode}
              onSave={(formData) => {
                editNode(editingNode.id, formData);
                setEditingNode(null);
              }}
              onCancel={() => setEditingNode(null)}
              allNodes={data}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Node Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNode ? `Add Child Node to ${selectedNode.name}` : 'Add Root Node'}
            </DialogTitle>
          </DialogHeader>
          <NodeEditForm 
            node={{ name: '', level: selectedNode ? `L${parseInt(selectedNode.level.substring(1)) + 1}` : 'L4', type: '' }}
            onSave={(formData) => {
              addNode(selectedNode?.id, formData);
              setShowAddDialog(false);
              setSelectedNode(null);
            }}
            onCancel={() => {
              setShowAddDialog(false);
              setSelectedNode(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HierarchyManager;