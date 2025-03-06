import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowRight, Circle, Square, Search, Filter, Save, Download, Settings, PlusCircle,X,Diamond, Octagon, Edit,ArrowLeftCircle,ArrowRightCircle,Trash } from 'lucide-react';
//import {ProcessContextMenu,ProcessEditModal,getMetadataTemplate} from './ProcessComponents';

// Advanced Search Component
const AdvancedSearch = ({ onSearch }) => {
    const [searchFields, setSearchFields] = useState({
      name: '',
      id: '',
      type: '',
      metadata: ''
    });
  
    const handleSearch = (e) => {
      e.preventDefault();
      onSearch(searchFields);
    };
  
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              className="px-3 py-2 border rounded"
              value={searchFields.name}
              onChange={(e) => setSearchFields(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="ID"
              className="px-3 py-2 border rounded"
              value={searchFields.id}
              onChange={(e) => setSearchFields(prev => ({ ...prev, id: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Type"
              className="px-3 py-2 border rounded"
              value={searchFields.type}
              onChange={(e) => setSearchFields(prev => ({ ...prev, type: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Metadata"
              className="px-3 py-2 border rounded"
              value={searchFields.metadata}
              onChange={(e) => setSearchFields(prev => ({ ...prev, metadata: e.target.value }))}
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Apply Advanced Search
          </button>
        </form>
      </div>
    );
  };
  
  // Filter Preset Management
  const FilterPresets = ({ onApplyPreset, onSavePreset, presets }) => {
    const [presetName, setPresetName] = useState('');
    const [showSave, setShowSave] = useState(false);
  
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="font-medium">Filter Presets</h3>
          <button onClick={() => setShowSave(!showSave)} className="text-blue-500">
            <Save className="w-4 h-4" />
          </button>
        </div>
        
        {showSave && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Preset name"
              className="flex-1 px-2 py-1 border rounded"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <button 
              onClick={() => {
                onSavePreset(presetName);
                setPresetName('');
                setShowSave(false);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Save
            </button>
          </div>
        )}
  
        <div className="space-y-1">
          {presets.map(preset => (
            <button
              key={preset.name}
              onClick={() => onApplyPreset(preset)}
              className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    );
  };


// Process node types and their visual representations
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
  
  // Function to get shape component based on type
  const getProcessShape = (type, metadata) => {
    switch(type) {
      case PROCESS_SHAPES.DECISION:
        return (
          <Diamond 
            className="w-12 h-12 text-yellow-500" 
            title={metadata?.conditions?.join('\n')}
          />
        );
      case PROCESS_SHAPES.MERGE:
        return (
          <Diamond 
            className="w-12 h-12 text-blue-500"
            style={{ transform: 'rotate(45deg)' }}
          />
        );
      case PROCESS_SHAPES.VALIDATION:
        return (
          <Octagon 
            className="w-12 h-12 text-red-500"
            title={metadata?.validationRules?.join('\n')}
          />
        );
      case PROCESS_SHAPES.DISTRIBUTION:
        return (
          <Circle 
            className="w-12 h-12 text-green-500"
            style={{ strokeDasharray: '4 2' }}
          />
        );
      // ... other shape types
      default:
        return <Square className="w-12 h-12 text-blue-500" />;
    }
  };  

const HierarchyVisualizations = ({ data = {} }) => {
  const [activeTab, setActiveTab] = useState('swimlanes');
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  const [selectedDownstreamPaths, setSelectedDownstreamPaths] = useState([]);
  const [filterPresets, setFilterPresets] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedLevels, setSelectedLevels] = useState([]);
   const [selectedTypes, setSelectedTypes] = useState([]);


   // New state variables for path management
const [selectedPath, setSelectedPath] = useState(null);
const [showOnlyPaths, setShowOnlyPaths] = useState(false);


const [pathColors] = useState([
  'bg-blue-500 text-white', 
  'bg-green-500 text-white', 
  'bg-purple-500 text-white', 
  'bg-yellow-500 text-black', 
  'bg-pink-500 text-white', 
  'bg-indigo-500 text-white'
]);


const [selectedNode, setSelectedNode] = useState(null);
const [activeFilters, setActiveFilters] = useState({
  pathsOnly: false,
  hideDuplicates: true
});


//////////////

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
const ProcessContextMenu = ({ 
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
console.log("handleAction:action",action);
      switch(action) {
        case 'edit':
          onEdit && onEdit(node);
          break;
        case 'addBefore':
          onAddBefore && onAddBefore(node);
          break;
        case 'addAfter':
          onAddAfter && onAddAfter(node);
          break;
        case 'delete':
          onDelete && onDelete(node);
          break;
        case 'changeType':
          onChangeType && onChangeType(node);
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
        onClick= {() => handleAction(item.action)}
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
 const ProcessEditModal = ({ node, onSave, onClose }) => {
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

/*
// Metadata Helper
 const getMetadataTemplate = (type) => {
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
*/

////////////


// Function to clear all filters and selections
const clearFilters = () => {
  setSelectedNode(null);
  setSelectedPath(null);
  setSelectedDownstreamPaths([]);
  setActiveFilters({
    pathsOnly: false,
    hideDuplicates: true
  });
  setSearchTerm('');
  setSelectedLevels([]);
  setSelectedTypes([]);
};


    // Add editing states
    const [editingNode, setEditingNode] = useState(null);
    const [showContextMenu, setShowContextMenu] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Reference for context menu positioning
    const contextMenuRef = useRef(null);
  
    // Context menu position
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });


    // Handler for node deletion
  const handleDeleteNode = (node) => {
    if (!node) return;

    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this process step?')) {
      // Find parent process
      const parentProcess = nodes.find(n => n.id === node.parentId);
      if (!parentProcess) return;

      // Remove node from children/processes array
      const updatedNodes = nodes.map(n => {
        if (n.id === parentProcess.id) {
          return {
            ...n,
            children: n.children?.filter(child => child.id !== node.id) || [],
            processes: n.processes?.filter(proc => proc.id !== node.id) || []
          };
        }
        return n;
      });

      setNodes(updatedNodes);
      setSelectedNode(null);
    }
  };

    

 // Helper function to get metadata template for process type
 const getMetadataTemplate = (type) => {
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




  
 // Helper function for safe object access
 const safeGet = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    const value = path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    return value !== undefined ? value : defaultValue;
  };

  // Get nodes by level
  const getLevelNodes = (level) => {
    return nodes.filter(n => n.level === level);
  };

   // Get downstream paths from a node
   const getDownstreamPaths = (node) => {
    const paths = [];
    
    const traverse = (currentNode, currentPath = []) => {
      const newPath = [...currentPath, currentNode];
      const children = nodes.filter(n => n.parentId === currentNode.id);
      
      if (children.length === 0) {
        paths.push(newPath);
      } else {
        children.forEach(child => traverse(child, newPath));
      }
    };
    
    traverse(node);
    return paths;
  };

 // Function to check if a node shares lineage with selected node
 const isInSameLineage = (node) => {
    if (!selectedNode || !selectedNode.lineage || !node.lineage) return false;

    // Compare lineage objects level by level
    const selectedLevels = Object.entries(selectedNode.lineage);
    const nodeLevels = Object.entries(node.lineage);

    // For each level in the selected node's lineage
    for (const [level, id] of selectedLevels) {
      // If the other node has this level, compare IDs
      if (node.lineage[level] && node.lineage[level] === id) {
        return true;
      }
    }
    return false;
  };


   // Function to check if node is in any path that contains selected node
   const isInPathWithSelected = (node) => {
    if (!selectedNode) return true;
    
    // Get all paths that contain the selected node
    const allPaths = [];
    
    // Add upstream path if it contains selected node
    if (selectedPath?.some(n => n.id === selectedNode.id)) {
      allPaths.push(selectedPath);
    }
    
    // Add downstream paths that contain selected node
    selectedDownstreamPaths.forEach(path => {
      if (path.some(n => n.id === selectedNode.id)) {
        allPaths.push(path);
      }
    });
    
    // Check if current node is in any of these paths
    return allPaths.some(path => path.some(n => n.id === node.id));
  };

  



 // Get full path (upstream and downstream)
 const getFullPath = (node) => {
    if (!node || !node.lineage) return { upstream: [], downstream: [] };
    
    // Get upstream path using lineage
    const upstreamPath = [];
    const levels = Object.keys(node.lineage).sort();
    for (const level of levels) {
      const nodeId = node.lineage[level];
      const pathNode = nodes.find(n => n.id === nodeId);
      if (pathNode) {
        upstreamPath.push(pathNode);
      }
    }

    // Get downstream paths
    const downstreamPaths = getDownstreamPaths(node);
    
    return {
      upstream: upstreamPath,
      downstream: downstreamPaths
    };
  };
  

  // Check if node is in any path
  const isNodeInPath = (node) => {
    if (!selectedPath && selectedDownstreamPaths.length === 0) return true;
    
    const inUpstream = selectedPath?.some(n => n.id === node.id);
    const inDownstream = selectedDownstreamPaths.some(path => 
      path.some(n => n.id === node.id)
    );
    
    return inUpstream || inDownstream;
  };


  const handleNodeClick = (node) => {
    setSelectedNode(node);
    const paths = getFullPath(node);
    setSelectedPath(paths.upstream);
    setSelectedDownstreamPaths(paths.downstream);
  };



  const isDuplicate = (node) => {
    if (!activeFilters.hideDuplicates) return false;
    
    const sameNameNodes = nodes.filter(n => 
      n.name === node.name && n.id !== node.id
    );
    if (sameNameNodes.length === 0) return false;

    // Consider a node duplicate if it's not in the selected path
    return !isNodeInPath(node);
  };


  const isNodeVisible = (node) => {
    if (!selectedNode) return true;
    
    // Show node if it shares lineage with selected node
    if (isInSameLineage(node)) {
      // If it's in same lineage, show it if it's in a path with selected node
      return isInPathWithSelected(node);
    }
        
    return false;
  };


  const clearSelection = () => {
    setSelectedNode(null);
    setSelectedPath(null);
    setSelectedDownstreamPaths([]);
  };

  const FilterControls = () => (
    <div className="p-4 border-b space-y-4">
      {selectedNode && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
          <div>
            <div className="font-medium">Selected: {selectedNode.name}</div>
            <div className="text-sm text-gray-600">
              Level: {selectedNode.level} | Type: {selectedNode.type}
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-sm bg-white hover:bg-gray-100 
              rounded border transition-colors duration-200"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
  
  // Advanced Search Component
  const AdvancedSearch = ({ onSearch }) => {
    const [searchFields, setSearchFields] = useState({
      name: '',
      id: '',
      type: '',
      metadata: ''
    });

    const handleSearch = (e) => {
      e.preventDefault();
      onSearch(searchFields);
    };

    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              className="px-3 py-2 border rounded"
              value={searchFields.name}
              onChange={(e) => setSearchFields(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="ID"
              className="px-3 py-2 border rounded"
              value={searchFields.id}
              onChange={(e) => setSearchFields(prev => ({ ...prev, id: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Type"
              className="px-3 py-2 border rounded"
              value={searchFields.type}
              onChange={(e) => setSearchFields(prev => ({ ...prev, type: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Metadata"
              className="px-3 py-2 border rounded"
              value={searchFields.metadata}
              onChange={(e) => setSearchFields(prev => ({ ...prev, metadata: e.target.value }))}
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Apply Advanced Search
          </button>
        </form>
      </div>
    );
  };

  // Visibility Toggle Component
  const VisibilityToggle = () => (
    <div className="flex items-center gap-2 p-4 border-b">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showOnlyPaths}
          onChange={(e) => setShowOnlyPaths(e.target.checked)}
          className="rounded text-blue-500"
        />
        <span className="text-sm">Show only path nodes</span>
      </label>
    </div>
  );

  
  // Get styling based on node's position in path
  const getNodeStyle = (node) => {
    if (!selectedPath) return 'bg-white hover:bg-gray-50';
    const pathIndex = selectedPath.findIndex(n => n.id === node.id);
    if (pathIndex === -1) return 'bg-gray-100 opacity-50';
    return `${pathColors[pathIndex % pathColors.length]} hover:opacity-90`;
  };

  // Debug logging helper
  const debugLog = (message, data) => {
    console.log(`HierarchyVisualizations:Debug - ${message}:`, data);
  };

  useEffect(() => {
    try {
      debugLog('Initial data', data);
      
      if (!data || Object.keys(data).length === 0) {
        setError('No data provided');
        return;
      }

      const result = [];
      
      function traverse(currentNode) {
        if (!currentNode) return;
        
        // Add current node
        result.push({
          ...currentNode,
          id: currentNode.id || Math.random().toString(),
          level: currentNode.level || 'unknown'
        });
        
        // Process children if they exist
        if (currentNode.children) {
          Object.values(currentNode.children).forEach(child => {
            if (child) traverse(child);
          });
        }
        
        // Process processes if they exist
        if (currentNode.processes) {
          Object.values(currentNode.processes).forEach(process => {
            if (process) traverse(process);
          });
        }
      }
      
      // Start with the first value in the data object (JCB in this case)
      const rootNode = Object.values(data)[0];
      if (rootNode) {
        traverse(rootNode);
      
      debugLog('Processed nodes', result);
      setNodes(result);
      setError(null);
    }} catch (err) {
      console.error('Error processing data:', err);
      setError(err.message);
    }
  }, [data]);


  useEffect(() => {
    const handleKeyPress = (e) => {
      // Escape key clears filters
      if (e.key === 'Escape') {
        clearFilters();
      }
      
      // Ctrl/Cmd + D toggles duplicate hiding
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setActiveFilters(prev => ({
          ...prev,
          hideDuplicates: !prev.hideDuplicates
        }));
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Escape closes modals and menus
      if (e.key === 'Escape') {
        setShowContextMenu(false);
        setShowEditModal(false);
      }
  
      // Delete key on selected node
      if (e.key === 'Delete' && selectedNode) {
        handleDeleteNode(selectedNode);
      }
  
      // Ctrl/Cmd + E to edit selected node
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && selectedNode) {
        e.preventDefault();
        setEditingNode(selectedNode);
        setShowEditModal(true);
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNode]);

    // Flattening functions
    const flattenHierarchy = (node, result = []) => {
        if (!node) return result;
        
        result.push({
          id: node.id,
          name: node.name,
          type: node.type,
          level: node.level,
          metadata: node.metadata || {},
          parentId: node.parentId,
          lineage: node.lineage || {}
        });
    
        if (node.children) {
          Object.values(node.children).forEach(child => {
            flattenHierarchy(child, result);
          });
        }
    
        return result;
      };
    

  
      const ProcessNode = ({ node, onContextMenu }) => {
        const handleContextMenu = (e) => {
          e.preventDefault();
          onContextMenu(e, node);
        };
      
        return (
          <div
            onContextMenu={handleContextMenu}
            className="relative group"
          >
            {getProcessShape(node.type, node.metadata)}
            <div className="absolute -bottom-12 whitespace-nowrap text-xs">
              <div>{node.name}</div>
              <div className="text-gray-500">{node.metadata?.actor}</div>
            </div>
            {/* Quick action buttons */}
            <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContextMenu(e, { ...node, action: 'add' });
                }}
                className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
                title="Quick add"
              >
                <PlusCircle className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        );
      };

      const flattenProcesses = (node) => {
        const processes = [];
        
        const processNode = (currentNode, onClick, onContextMenu) => {
          if (!currentNode) return;
          

          const handleContextMenu = (e) => {
            e.preventDefault();
            onContextMenu(e, node);
          };
        
          const handleDoubleClick = () => {
            setEditingNode(node);
            setShowEditModal(true);
          };


          if (safeGet(currentNode, 'type') === 'processArea' && currentNode.processes) {
            Object.values(currentNode.processes).forEach(process => {
              if (process) {
                processes.push({
                  id: process.id || '',
                  name: process.name || '',
                  level: process.level || '',
                  type: process.type || '',
                  metadata: process.metadata || {},
                  children: process.children ? Object.values(process.children) : []
                });
              }
            });
          }
          
          if (currentNode.children) {
            Object.values(currentNode.children).forEach(child => {
              if (child) processNode(child);
            });
          }

          return (
            <div
              onContextMenu={handleContextMenu}
              onDoubleClick={handleDoubleClick}
              className="relative group"
            >
              {getProcessShape(node.type, node.metadata)}
              <div className="absolute -bottom-12 whitespace-nowrap text-xs">
                <div>{node.name}</div>
                <div className="text-gray-500">{node.metadata?.actor}</div>
              </div>
              {/* Quick action buttons on hover */}
              <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNode({ parentId: node.parentId, insertPosition: 'before', relativeTo: node.id });
                    setShowEditModal(true);
                  }}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
                  title="Add step before"
                >
                  <PlusCircle className="w-4 h-4 text-blue-500" />
                </button>

              </div>
            </div>
          );

        };
        

        processNode(nodes[0]);
        return processes;
      };
      
  // Filter nodes based on search and filters
  const filteredNodes = React.useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchTerm === '' || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesLevel = selectedLevels.length === 0 || 
        selectedLevels.includes(node.level);
        
      const matchesType = selectedTypes.length === 0 || 
        selectedTypes.includes(node.type);
        
      return matchesSearch && matchesLevel && matchesType;
    });
  }, [nodes, searchTerm, selectedLevels, selectedTypes]);

  // Get unique values for filters
  const allLevels = [...new Set(nodes.map(n => n.level))].sort();
  const allTypes = [...new Set(nodes.map(n => n.type))].filter(Boolean);



  // Error display component
  const ErrorDisplay = ({ message }) => (
    <div className="p-4 text-red-500">
      Error: {message}
    </div>
  );

  // Loading display component
  const LoadingDisplay = () => (
    <div className="p-4 text-gray-500">
      Loading...
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="p-4 text-gray-500">
      No data available to display
    </div>
  );


// Get styling for a node based on its position in paths
const getNodePathStyle = (node) => {
    if (!selectedPath && selectedDownstreamPaths.length === 0) 
      return 'bg-white hover:bg-gray-50';
    
    // Check upstream path
    const upstreamIndex = selectedPath?.findIndex(n => n.id === node.id);
    if (upstreamIndex !== -1) {
      return `${pathColors[upstreamIndex % pathColors.length]} hover:opacity-90`;
    }
    
    // Check downstream paths
    for (let i = 0; i < selectedDownstreamPaths.length; i++) {
      const pathIndex = selectedDownstreamPaths[i].findIndex(n => n.id === node.id);
      if (pathIndex !== -1) {
        // Use different colors for downstream paths (offset by 3 to distinguish from upstream)
        return `${pathColors[(pathIndex + 3) % pathColors.length]} hover:opacity-90`;
      }
    }
    
    // Node not in any path
    return showOnlyPaths ? 'hidden' : 'bg-gray-100 opacity-50';
  };
  
  // Get position description for a node in the path
  const getNodePathPosition = (node) => {
    // Check upstream path
    const upstreamIndex = selectedPath?.findIndex(n => n.id === node.id);
    if (upstreamIndex !== -1) {
      return `Up ${upstreamIndex + 1}/${selectedPath.length}`;
    }
    
    // Check downstream paths
    for (let i = 0; i < selectedDownstreamPaths.length; i++) {
      const pathIndex = selectedDownstreamPaths[i].findIndex(n => n.id === node.id);
      if (pathIndex !== -1) {
        return `Down ${pathIndex + 1}/${selectedDownstreamPaths[i].length}`;
      }
    }
    
    return '';
  };
  
  // Get styling for connections between nodes
  const getConnectionStyle = (node1, node2) => {
    // Check if both nodes are in upstream path
    const inUpstream = selectedPath?.includes(node1) && selectedPath?.includes(node2);
    if (inUpstream) {
      return 'bg-blue-500';  // Highlight upstream connections
    }
    
    // Check if both nodes are in same downstream path
    const inSameDownstreamPath = selectedDownstreamPaths.some(path => 
      path.includes(node1) && path.includes(node2) &&
      Math.abs(path.indexOf(node1) - path.indexOf(node2)) === 1
    );
    if (inSameDownstreamPath) {
      return 'bg-green-500';  // Highlight downstream connections
    }
    
    // Check if both nodes are visible when filtering
    if (showOnlyPaths && (!isNodeInPath(node1) || !isNodeInPath(node2))) {
      return 'hidden';
    }
    
    // Default connection style
    return 'bg-gray-300';
  };
  
  // Optional: Enhanced version with hover effects
  const getNodePathStyleWithHover = (node) => {
    const baseStyle = getNodePathStyle(node);
    if (baseStyle === 'hidden') return baseStyle;
    
    return `${baseStyle} 
      transition-all duration-200 
      hover:shadow-lg hover:scale-105 
      cursor-pointer`;
  };
  
  // Optional: Get style for path summary indicators
  const getPathIndicatorStyle = (pathType, index) => {
    const baseColor = pathType === 'upstream' 
      ? pathColors[index % pathColors.length]
      : pathColors[(index + 3) % pathColors.length];
      
    return `${baseColor} 
      px-2 py-1 rounded-full text-xs 
      font-medium shadow-sm`;
  };

  const SwimlanesView = () => {
    const levels = [...new Set(filteredNodes.map(n => n.level))].sort();

    return (
      <div className="p-4 overflow-x-auto">
        <div className="flex space-x-4">
          {levels.map(level => (
            <div key={`lane-${level}`} className="flex-none w-80">
              <div className="bg-gray-100 p-2 rounded-t text-center font-medium">
                {level}
              </div>
              <div className="border rounded-b p-2 space-y-2">
                {filteredNodes
                  .filter(n => n.level === level)
                  .map(node => (
                    <div
                      key={`node-${node.id}`}
                      className={`p-2 rounded shadow transition-all duration-200 
                        ${isNodeVisible(node) ? getNodePathStyle(node) : 'hidden'}
                        ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleNodeClick(node)}
                    >
                      <div className="font-medium">{node.name}</div>
                      <div className="text-xs opacity-75">ID: {node.id}</div>
                      {isInSameLineage(node) && (
                        <div className="text-xs text-blue-600">
                          Shared Lineage
                        </div>
                      )}
                      {selectedPath?.includes(node) && (
                        <div className="text-xs mt-1 font-medium">
                          {getNodePathPosition(node)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  const MetroLinesView = () => {
    const levels = [...new Set(nodes.map(n => n.level))].sort();
  
    return (
      <div className="p-8 overflow-x-auto">
        <div className="flex flex-col space-y-12">
          {levels.map(level => {
            const levelNodes = getLevelNodes(level);
            return (
              <div key={`metro-${level}`} className="relative">
                {/* Level Label */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 font-medium text-sm text-gray-500 w-40">
                  {level}
                </div>
                {/* Nodes and Connections */}
                <div className="ml-44 flex items-center space-x-4">
                  {levelNodes.map((node, index) => (
                    <div key={`metro-node-${node.id}-${index}`} className="flex items-center">
                      {isNodeInPath(node) && (
                        <>
                          <div 
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap 
                              transition-all duration-200 cursor-pointer ${getNodePathStyle(node)}`}
                            onClick={() => handleNodeClick(node)}
                          >
                            <div>{node.name}</div>
                            {(selectedPath?.includes(node) || selectedDownstreamPaths.some(path => path.includes(node))) && (
                              <div className="text-xs mt-1 text-center font-medium">
                                {getNodePathPosition(node)}
                              </div>
                            )}
                          </div>
                          {index < levelNodes.length - 1 && (
                            <div className={`w-8 h-0.5 mx-2 transition-colors duration-200 
                              ${getConnectionStyle(node, levelNodes[index + 1])}`} />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Path Summary (similar to Swimlanes View) */}
      </div>
    );
  };

  const BreadcrumbsView = () => {
    const leafNodes = nodes.filter(node => 
      !nodes.some(n => n.parentId === node.id)
    ).filter(node => !showOnlyPaths || isNodeInPath(node));
  
    return (
      <div className="p-4 space-y-4">
        {leafNodes.map((leaf, pathIndex) => {
          const path = [];
          let current = leaf;
          while (current) {
            path.unshift(current);
            current = nodes.find(n => n.id === current.parentId);
          }
          return (
            <div key={`path-${leaf.id}-${pathIndex}`} className="flex items-center flex-wrap gap-2">
              {path.map((node, nodeIndex) => (
                <React.Fragment key={`breadcrumb-${node.id}-${nodeIndex}`}>
                  <div 
                    className={`px-3 py-1 rounded text-sm cursor-pointer
                      ${getNodePathStyle(node)}`}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="font-medium">{node.name}</div>
                    <div className="text-xs opacity-75">{node.level}</div>
                  </div>
                  {nodeIndex < path.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const CircuitView = () => {
    const levels = [...new Set(nodes.map(n => n.level))].sort();
  
    return (
      <div className="p-8 overflow-x-auto">
        <div className="flex flex-col space-y-8">
          {levels.map(level => (
            <div key={`circuit-${level}`} className="relative">
              <div className="text-sm font-medium mb-2">{level}</div>
              <div className="flex flex-col space-y-4">
                {nodes
                  .filter(n => n.level === level)
                  .filter(node => !showOnlyPaths || isNodeInPath(node))
                  .map((node, index) => (
                    <div key={`circuit-node-${node.id}-${index}`} className="flex items-center">
                      <div className="w-4 h-0.5 bg-gray-400" />
                      <div 
                        className={`p-3 rounded cursor-pointer ${getNodePathStyle(node)}`}
                        onClick={() => handleNodeClick(node)}
                      >
                        <div className="font-medium text-sm">{node.name}</div>
                        <div className="text-xs opacity-75">ID: {node.id}</div>
                        {(selectedPath?.includes(node) || selectedDownstreamPaths.some(path => path.includes(node))) && (
                          <div className="text-xs mt-1 font-medium">
                            {getNodePathPosition(node)}
                          </div>
                        )}
                      </div>
                      <div className="w-4 h-0.5 bg-gray-400" />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProcessSwimlanes = () => {
    //const processes = flattenProcesses(data);
    
     // Local state management
  const [editingNode, setEditingNode] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [processes, setProcesses] = useState([]);
    
  const handleAddBefore = (node) => {
console.log("handleAddBefore:node", node);
    setEditingNode({ 
      parentId: node.parentId,
      insertPosition: 'before',
      relativeTo: node.id 
    });
    setShowEditModal(true);
  };


  // Add needed state for modals
  const ProcessContextMenu = ({ 
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
console.log('ProcessContextMenu:onAddAfter', onAddAfter);


const handleAction = (action) => {
  
  console.log("handleAction:", action);
  switch(action) {
    case 'edit':
      onEdit && onEdit(node);
      break;
    case 'addBefore':
      onAddBefore && onAddBefore(node);
      break;
    case 'addAfter':
      onAddAfter && onAddAfter(node);
      break;
    case 'delete':
      onDelete && onDelete(node);
      break;
    case 'changeType':
      onChangeType && onChangeType(node);
      break;
  }
  onClose();
};



    const menuItems = [
      { label: 'Edit', icon: <Edit className="w-4 h-4" />, action: 'edit' },
      { label: 'Add Step Before', icon: <ArrowLeftCircle className="w-4 h-4" />, action: 'addBefore' },
      { label: 'Add Step After', icon: <ArrowRightCircle className="w-4 h-4" />, action: 'addAfter' },
      { label: 'Change Type', icon: <Settings className="w-4 h-4" />, action: 'changeType' },
      { label: 'Delete', icon: <Trash className="w-4 h-4" />, action: 'delete' },
    ];

    
  
    return (
        <div 
          className="absolute z-50 bg-white rounded-lg shadow-xl border p-1 min-w-[200px]"
          style={{  ...contextMenuStyles, top: position.y, left: position.x }}
        >
          {menuItems.map((item) => (
        <button
        key={item.label}
        onClick={handleAction(item.action)}
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

   // Effect to initialize processes from data
   useEffect(() => {
    const initialProcesses = flattenProcesses(data);
    setProcesses(initialProcesses);
  }, [data]);

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (showContextMenu && !event.target.closest('.context-menu')) {
            setShowContextMenu(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [showContextMenu]);

 // Context menu handlers
 const handleContextMenu = (e, node) => {
  console.log("handleContextMenu:node", node);
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
    setEditingNode(node);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // Node manipulation handlers
const handleProcessAction = (action, node) => {
console.log("handleProcessAction",action, node);

    switch(action) {
      case 'edit':
        setEditingNode(node);
        setShowEditModal(true);
        break;
      case 'addBefore':
      case 'addAfter':
        setEditingNode({
          parentId: node.parentId,
          insertPosition: action === 'addBefore' ? 'before' : 'after',
          relativeTo: node.id,
          type: PROCESS_SHAPES.TASK, // Default type
        });
        setShowEditModal(true);
        break;
      case 'delete':
        handleDeleteNode(node);
        break;
      case 'changeType':
        setEditingNode(node);
        setShowTypeModal(true);
        break;
    }
    setShowContextMenu(false);
  };

  // Node update handlers
  const handleUpdateNode = (updatedNode) => {
    const newProcesses = processes.map(process => {
      if (process.id === updatedNode.parentId) {
        // Handle insertion
        const children = [...(process.children || [])];
        if (editingNode.insertPosition) {
          const index = children.findIndex(c => c.id === editingNode.relativeTo);
          const insertIndex = editingNode.insertPosition === 'before' ? index : index + 1;
          children.splice(insertIndex, 0, updatedNode);
        } else {
          // Handle update
          const index = children.findIndex(c => c.id === updatedNode.id);
          if (index !== -1) {
            children[index] = updatedNode;
          }
        }
        return { ...process, children };
      }
      return process;
    });
    setProcesses(newProcesses);
  };

  const handleDeleteNode = (node) => {
    if (window.confirm('Are you sure you want to delete this process step?')) {
      const newProcesses = processes.map(process => ({
        ...process,
        children: process.children?.filter(child => child.id !== node.id) || []
      }));
      setProcesses(newProcesses);
    }
  };
  

    if (processes.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No process data available
        </div>
      );
    }

  // Process Node Component
  const ProcessNode = ({ node }) => (
    <div
      className="relative group"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleContextMenu(e, node);
      }}
    >
      <div className={`p-3 rounded transition-all duration-200
        ${getNodePathStyle(node)}`}>
        {getProcessShape(node.type, node.metadata)}
        <div className="text-sm font-medium mt-2">{node.name}</div>
        {node.metadata?.actor && (
          <div className="text-xs text-gray-500">{node.metadata.actor}</div>
        )}
      </div>
      
      {/* Quick actions */}
      <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleProcessAction('addAfter', node);
          }}
          className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
          title="Add step after"
        >
          <PlusCircle className="w-4 h-4 text-blue-500" />
        </button>
      </div>
    </div>
  );


   // Type Selection Modal Component
   const ProcessTypeModal = ({ node, onSave, onClose }) => {
    const [selectedType, setSelectedType] = useState(node?.type || PROCESS_SHAPES.TASK);

    const processTypes = [
      { 
        type: PROCESS_SHAPES.TASK, 
        label: 'Task',
        description: 'Regular process step or activity',
        icon: <Square className="w-6 h-6" />
      },
      { 
        type: PROCESS_SHAPES.DECISION, 
        label: 'Decision',
        description: 'Conditional branching point',
        icon: <Diamond className="w-6 h-6" />
      },
      { 
        type: PROCESS_SHAPES.MERGE, 
        label: 'Merge',
        description: 'Combines multiple paths',
        icon: <Diamond className="w-6 h-6 rotate-45" />
      },
      { 
        type: PROCESS_SHAPES.VALIDATION, 
        label: 'Validation',
        description: 'Validates process data or conditions',
        icon: <Octagon className="w-6 h-6" />
      },
      { 
        type: PROCESS_SHAPES.DISTRIBUTION, 
        label: 'Distribution',
        description: 'Distributes to multiple paths',
        icon: <Circle className="w-6 h-6" />
      }
    ];

    const handleTypeSelect = () => {
      const metadataTemplate = getMetadataTemplate(selectedType);
      
      const updatedNode = {
        ...node,
        type: selectedType,
        metadata: {
          ...node.metadata,
          ...metadataTemplate
        }
      };

      onSave(updatedNode);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Select Process Type</h2>
          
          <div className="space-y-3">
            {processTypes.map((processType) => (
              <div
                key={processType.type}
                className={`p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedType === processType.type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200'}`}
                onClick={() => setSelectedType(processType.type)}
              >
                <div className="flex items-center gap-3">
                  {processType.icon}
                  <div>
                    <div className="font-medium">{processType.label}</div>
                    <div className="text-sm text-gray-500">
                      {processType.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleTypeSelect}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Change Type
            </button>
          </div>
        </div>
      </div>
    );
  };

  
  return (
    <div className="relative">
      {/* Swimlanes View */}
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          {processes.map((process) => (
            <div key={process.id} className="relative">
              {/* Lane Header */}
              <div className="bg-blue-100 p-2 rounded-t">
                <div className="font-medium">{process.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {process.metadata?.['L4 ETOM Process ID'] && (
                    <span className="mr-2">
                      ETOM: {process.metadata['L4 ETOM Process ID']}
                    </span>
                  )}
                  {process.metadata?.['L4 Task Type'] && (
                    <span className="mr-2">
                      Type: {process.metadata['L4 Task Type']}
                    </span>
                  )}
                </div>
              </div>

              {/* Process Steps */}
              <div className="bg-white p-4 border border-blue-100 rounded-b">
                <div className="flex items-center space-x-4 overflow-x-auto">
                  {process.children?.map((step, stepIndex) => (
                    <div key={step.id} className="flex items-center">
                      <ProcessNode node={step} />
                      {stepIndex < process.children.length - 1 && (
                        <ArrowRight className="w-6 h-6 text-blue-300 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
<ProcessContextMenu 
    position={menuPosition}
    node={editingNode}
    onClose={() => setShowContextMenu(false)}
    onEdit={(node) => handleProcessAction('edit', node)}
    onDelete={(node) => handleProcessAction('delete', node)}
    onAddBefore={(node) => handleProcessAction('addBefore', node)}
    onAddAfter={(node) => handleProcessAction('addAfter', node)}
    onChangeType={(node) => handleProcessAction('changeType', node)}
  />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ProcessEditModal
          node={editingNode}
          onSave={(updatedNode) => {
            handleUpdateNode(updatedNode);
            setShowEditModal(false);
            setEditingNode(null);
          }}
          onClose={() => {
            setShowEditModal(false);
            setEditingNode(null);
          }}
        />
      )}

      {/* Type Selection Modal */}
      {showTypeModal && (
        <ProcessTypeModal
          node={editingNode}
          onSave={(updatedNode) => {
            handleUpdateNode(updatedNode);
            setShowTypeModal(false);
            setEditingNode(null);
          }}
          onClose={() => {
            setShowTypeModal(false);
            setEditingNode(null);
          }}
        />
      )}
    </div>
  );

  };

  const BPMNView = () => {
    const [editingNode, setEditingNode] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [processes, setProcesses] = useState([]);
    
  //const processes = flattenProcesses(data);
    
   // Effect to initialize processes from data
   useEffect(() => {
    const initialProcesses = flattenProcesses(data);
    setProcesses(initialProcesses);
  }, [data]);

 // Context menu handlers
 const handleContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
    setEditingNode(node);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // Node manipulation handlers
  const handleEdit = (node) => {
    setEditingNode(node);
    setShowEditModal(true);
  };

  const handleAddBefore = (node) => {
    setEditingNode({ 
      parentId: node.parentId,
      insertPosition: 'before',
      relativeTo: node.id 
    });
    setShowEditModal(true);
  };

  const handleAddAfter = (node) => {
    setEditingNode({ 
      parentId: node.parentId,
      insertPosition: 'after',
      relativeTo: node.id 
    });
    setShowEditModal(true);
  };

  const handleDelete = (node) => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      const updatedProcesses = processes.map(process => ({
        ...process,
        children: process.children?.filter(child => child.id !== node.id)
      }));
      setProcesses(updatedProcesses);
    }
  };

  const handleUpdateNode = (updatedNode) => {
    const updatedProcesses = processes.map(process => {
      if (process.children) {
        return {
          ...process,
          children: process.children.map(child =>
            child.id === updatedNode.id ? updatedNode : child
          )
        };
      }
      return process;
    });
    setProcesses(updatedProcesses);
  };
    
      const handleProcessAction = (action, node) => {
        switch(action) {
          case 'edit':
            setShowEditModal(true);
            break;
          case 'delete':
            handleDeleteNode(node);
            break;
          // ... other actions
        }
        setShowContextMenu(false);
      };

    if (processes.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No process data available
        </div>
      );
    }

    return (
        <div className="relative">
          <div className="p-4">
            {/* Existing BPMN rendering */}
            {processes.map((process) => (
              <div key={process.id} className="relative">
                {/* Process header */}
                <div className="text-sm font-medium mb-2">
                  {process.name}
                </div>
                
                {/* Process steps */}
                <div className="flex items-center space-x-4 overflow-x-auto">
                  <Circle className="w-8 h-8 text-green-500 flex-shrink-0" fill="white" />
                  {process.children?.map((step, index) => (
                    <ProcessNode 
                      key={step.id}
                      node={step}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
    
          {/* Context Menu */}
          {showContextMenu && (
            <ProcessContextMenu 
              position={menuPosition}
              node={editingNode}
              onClose={() => setShowContextMenu(false)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddBefore={handleAddBefore}
              onAddAfter={handleAddAfter}
              onChangeType={(node) => {
                setEditingNode(node);
                setShowTypeModal(true);
              }}
            />
          )}
    
          {/* Edit Modal */}
          {showEditModal && editingNode && (
            <ProcessEditModal
              node={editingNode}
              onSave={(updatedNode) => {
                handleUpdateNode(updatedNode);
                setShowEditModal(false);
                setEditingNode(null);
              }}
              onClose={() => {
                setShowEditModal(false);
                setEditingNode(null);
              }}
            />
          )}
        </div>
      );
  };

  
  const ValueStreamView = ({ nodes }) => {
    const stages = [...new Set(nodes.map(n => n.stage))];
    
    return (
      <div className="p-4 overflow-x-auto">
        <div className="flex space-x-8">
          {stages.map((stage, index) => (
            <div key={stage} className="flex-none w-64">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium mb-2">{stage}</div>
                <div className="space-y-2">
                  {nodes
                    .filter(n => n.stage === stage)
                    .map(node => (
                      <div key={node.id} className="bg-white p-2 rounded shadow">
                        <div>{node.name}</div>
                        <div className="text-sm text-gray-500">
                          Value: {node.value}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-auto my-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const TreeMapView = ({ nodes }) => {
    // Simple treemap layout calculation
    const calculateSize = (node) => {
      if (!node.children) return 1;
      return Object.values(node.children).reduce((sum, child) => sum + calculateSize(child), 0);
    };
  
    return (
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {nodes.map(node => {
            const size = calculateSize(node);
            const cols = Math.ceil(Math.sqrt(size));
            return (
              <div 
                key={node.id}
                className={`p-4 rounded-lg bg-blue-50 col-span-${cols} row-span-${cols}`}
              >
                <div className="font-medium">{node.name}</div>
                <div className="text-sm text-gray-500">Size: {size}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const SunburstView = ({ nodes }) => {
    // Simplified sunburst visualization
    const renderLevel = (node, depth = 0) => {
      const rotation = (360 / nodes.length) * nodes.indexOf(node);
      const size = 100 - depth * 20;
      
      return (
        <div
          key={node.id}
          className="absolute rounded-full bg-blue-100 border border-blue-200"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            left: `${(100 - size) / 2}%`,
            top: `${(100 - size) / 2}%`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm font-medium">{node.name}</div>
          </div>
          {node.children && Object.values(node.children).map(child => 
            renderLevel(child, depth + 1)
          )}
        </div>
      );
    };
  
    return (
      <div className="p-4">
        <div className="relative w-full h-96">
          {nodes.map(node => renderLevel(node))}
        </div>
      </div>
    );
  };



  const handleAdvancedSearch = (searchFields) => {
    // Implement advanced search logic
  };

  const saveFilterPreset = (name) => {
    const newPreset = {
      name,
      filters: {
        searchTerm,
        selectedLevels,
        selectedTypes
      }
    };
    setFilterPresets([...filterPresets, newPreset]);
  };

  const applyFilterPreset = (preset) => {
    setSearchTerm(preset.filters.searchTerm);
    setSelectedLevels(preset.filters.selectedLevels);
    setSelectedTypes(preset.filters.selectedTypes);
  };

  const exportResults = () => {
    const csvContent = filteredNodes.map(node => 
      Object.values(node).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_results.csv';
    a.click();
  };

  // Tabs configuration
  const tabs = [
    { id: 'swimlanes', label: 'Swimlanes' },
    { id: 'metro', label: 'Metro Lines' },
    { id: 'breadcrumbs', label: 'Breadcrumbs' },
    { id: 'process-swimlanes', label: 'Process Swimlanes' },
    { id: 'bpmn', label: 'BPMN' },

  ];

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!nodes) {
    return <LoadingDisplay />;
  }

  debugLog('Rendering main component', { activeTab, nodesCount: nodes.length });

  return (
    <div className="max-w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="px-3 py-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="px-3 py-2 border rounded hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={exportResults}
            className="px-3 py-2 border rounded hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {showAdvancedSearch && (
          <AdvancedSearch onSearch={handleAdvancedSearch} />
        )}

        <FilterPresets
          presets={filterPresets}
          onSavePreset={saveFilterPreset}
          onApplyPreset={applyFilterPreset}
        />
      </div>

      <FilterControls />
      
      <div className="border-b">
        <div className="flex flex-wrap gap-2 p-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {activeTab === 'swimlanes' && <SwimlanesView nodes={filteredNodes} />}
        {activeTab === 'metro' && <MetroLinesView nodes={filteredNodes} />}
        {activeTab === 'breadcrumbs' && <BreadcrumbsView nodes={filteredNodes} />}
        {activeTab === 'circuit' && <CircuitView nodes={filteredNodes} />}
        {activeTab === 'process-swimlanes' && <ProcessSwimlanes nodes={filteredNodes} />}
        {activeTab === 'bpmn' && <BPMNView nodes={filteredNodes} />}
        {activeTab === 'value-stream' && <ValueStreamView nodes={filteredNodes} />}
        {activeTab === 'treemap' && <TreeMapView nodes={filteredNodes} />}
        {activeTab === 'sunburst' && <SunburstView nodes={filteredNodes} />}
      </div>
    </div>
  );
};

export default HierarchyVisualizations;