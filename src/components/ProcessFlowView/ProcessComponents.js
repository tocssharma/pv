import React, { useState } from 'react';

import { Edit, ArrowLeftCircle, ArrowRightCircle, Settings, Trash, X, PlusCircle } from 'lucide-react';

const PROCESS_SHAPES = {
    TASK: 'task',              // Regular rectangle
    DECISION: 'decision',      // Diamond
    MERGE: 'merge',           // Diamond with multiple inputs
    VALIDATION: 'validation',  // Octagon
    DISTRIBUTION: 'distribution', // Circle with multiple outputs
    START: 'start',           // Circle
    END: 'end',              // Bold circle
    SUBPROCESS: 'subprocess', // Rectangle with plus sign
  };


  
  const contextMenuStyles = {
    position: 'fixed', // changed from absolute
    zIndex: 1000,     // ensure it's above other elements
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  };

  // Add needed state for modals
export const ProcessContextMenu = ({ 
    position, 
    node, 
    onClose, 
    onEdit,
    onDelete,
    onAddBefore,
    onAddAfter,
    onChangeType 
  }) => {
console.log('ProcessContextMenu:onAddBefore', onAddBefore);

    const menuItems = [
      { label: 'Edit', icon: <Edit className="w-4 h-4" />, action: 'edit' },
      { label: 'Add Step Before', icon: <ArrowLeftCircle className="w-4 h-4" />, action: 'addBefore' },
      { label: 'Add Step After', icon: <ArrowRightCircle className="w-4 h-4" />, action: 'addAfter' },
      { label: 'Change Type', icon: <Settings className="w-4 h-4" />, action: 'changeType' },
      { label: 'Delete', icon: <Trash className="w-4 h-4" />, action: 'delete' },
    ];
  
    const handleAction = (action) => {
      switch(action) {
        case 'edit':
          onEdit(node);
          break;
        case 'addBefore':
          onAddBefore(node);
          break;
        case 'addAfter':
          onAddAfter(node);
          break;
        case 'delete':
          onDelete(node);
          break;
        case 'changeType':
          onChangeType(node);
          break;
      }
      onClose();
    };
  
    return (
        <div 
          className="absolute z-50 bg-white rounded-lg shadow-xl border p-1 min-w-[200px]"
          style={{  ...contextMenuStyles, top: position.y, left: position.x }}
        >
          {menuItems.map((item) => (
        <button
        key={item.label}
        onClick={() => {
          item.action(node);
          onClose();
        }}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left
          hover:bg-gray-100 rounded transition-colors"
      >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      );
  };


// Edit Modal Component
export const ProcessEditModal = ({ node, onSave, onClose }) => {
  const [formData, setFormData] = useState({
            name: node?.name || '',
            type: node?.type || PROCESS_SHAPES.TASK,
            metadata: { ...node?.metadata } || {},
          });
        
          const metadataFields = {
            [PROCESS_SHAPES.DECISION]: ['conditions', 'defaultPath'],
            [PROCESS_SHAPES.VALIDATION]: ['validationRules', 'errorHandling'],
            [PROCESS_SHAPES.DISTRIBUTION]: ['distributionRules', 'targets'],
            [PROCESS_SHAPES.TASK]: ['actor', 'system', 'apiDetails'],
          };
        
  
   // Handle form submission
   const handleSubmit = (e) => {
      e.preventDefault();
  
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Name is required');
        return;
      }
  
      // Create new node or update existing
      const updatedNode = {
        ...(node || {}),
        id: node?.id || `process-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        metadata: formData.metadata,
      };
  
      // Save changes
      onSave(updatedNode);
      onClose();
    };
  
  
     // Save handler with validation
  const handleSave = () => {
    const errors = validateMetadata();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // Prepare node data
    const nodeData = {
      ...formData,
      id: node?.id || `process-${Date.now()}`,
      parentId: node?.parentId
    };

    // Save changes
    onSave(nodeData);
    onClose();
  };
       // Handle metadata changes for array fields
       const handleMetadataArrayChange = (field, index, value) => {
          setFormData(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              [field]: prev.metadata[field].map((item, i) => 
                i === index ? value : item
              )
            }
          }));
        };
  
  
  
          // Remove item from metadata array
      const handleRemoveMetadataItem = (field, index) => {
          setFormData(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              [field]: prev.metadata[field].filter((_, i) => i !== index)
            }
          }));
        };
  
  
  
  
         // Add new item to metadata array
      const handleAddMetadataItem = (field) => {
          setFormData(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              [field]: [...(prev.metadata[field] || []), '']
            }
          }));
        };
  
  
  
           // Handle changes to single-value metadata fields
      const handleMetadataChange = (field, value) => {
          setFormData(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              [field]: value
            }
          }));
        };
  
  
           // Validate metadata based on process type
      const validateMetadata = () => {
          const errors = [];
          const requiredFields = {
            [PROCESS_SHAPES.DECISION]: ['conditions'],
            [PROCESS_SHAPES.VALIDATION]: ['validationRules'],
            [PROCESS_SHAPES.DISTRIBUTION]: ['distributionRules'],
            [PROCESS_SHAPES.TASK]: ['actor']
          };
    
          const required = requiredFields[formData.type] || [];
          required.forEach(field => {
            if (!formData.metadata[field] || 
                (Array.isArray(formData.metadata[field]) && 
                 formData.metadata[field].length === 0)) {
              errors.push(`${field} is required for ${formData.type} type`);
            }
          });
    
          return errors;
        };
  
        /*
         // Save handler with validation
      const handleSave = () => {
          const errors = validateMetadata();
          if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
          }
    
          // If adding new node
          if (!node) {
            const newNode = {
              ...formData,
              id: `process-${Date.now()}`,
              parentId: editingNode.parentId
            };
    
            // Update parent's children array
            const updatedNodes = nodes.map(n => {
              if (n.id === editingNode.parentId) {
                const children = [...(n.children || [])];
                if (editingNode.insertPosition === 'before') {
                  const index = children.findIndex(c => c.id === editingNode.relativeTo);
                  children.splice(index, 0, newNode);
                } else {
                  const index = children.findIndex(c => c.id === editingNode.relativeTo);
                  children.splice(index + 1, 0, newNode);
                }
                return { ...n, children };
              }
              return n;
            });
    
            setNodes(updatedNodes);
          } 
          // If editing existing node
          else {
            const updatedNodes = nodes.map(n => 
              n.id === node.id ? { ...n, ...formData } : n
            );
            setNodes(updatedNodes);
          }
    
          onClose();
        }; */
    
  
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {node ? 'Edit Process Step' : 'Add New Step'}
                </h2>
        
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
        
                  {/* Process Type Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        type: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {Object.entries(PROCESS_SHAPES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
        
                  {/* Dynamic Metadata Fields */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Metadata</h3>
                    {metadataFields[formData.type]?.map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        {Array.isArray(formData.metadata[field]) ? (
                          <div className="space-y-2">
                            {formData.metadata[field]?.map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => handleMetadataArrayChange(field, index, e.target.value)}
                                  className="flex-1 px-3 py-2 border rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMetadataItem(field, index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddMetadataItem(field)}
                              className="text-sm text-blue-500 hover:text-blue-600"
                            >
                              + Add Item
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.metadata[field] || ''}
                            onChange={(e) => handleMetadataChange(field, e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
        
                  {/* Buttons */}
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
};

// Metadata Helper
export const getMetadataTemplate = (type) => {
    switch(type) {
        case PROCESS_SHAPES.DECISION:
          return {
            conditions: [],
            defaultPath: ''
          };
        case PROCESS_SHAPES.VALIDATION:
          return {
            validationRules: [],
            errorHandling: ''
          };
        case PROCESS_SHAPES.DISTRIBUTION:
          return {
            distributionRules: [],
            targets: []
          };
        case PROCESS_SHAPES.TASK:
          return {
            actor: '',
            system: '',
            apiDetails: ''
          };
        default:
          return {};
      }
  
};