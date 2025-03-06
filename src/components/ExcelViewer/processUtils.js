// processUtils.js
import React, {useState, useEffect} from 'react';
import Modal from './Modal';
import { Label } from '../../components/ui/label';
import ProcessDataHandler,  { 
    VALIDATION_RULES, 
    getLevelFields, 
    getLevelConfig,
    validateField 
  } from  "../../lib/dataHelper";



// Shared utility functions
export const generateNextId = (parentId, existingIds) => {
  // Filter to get only direct children of the parent
  const childIds = existingIds.filter(id => id.startsWith(parentId + '-'));
  
  // Extract the last number from each child ID
  const lastNumbers = childIds.map(id => {
    const lastPart = id.split('-').pop();
    return parseInt(lastPart, 10);
  });

  // Find the maximum number, defaulting to 0 if no children exist
  const maxNumber = lastNumbers.length > 0 ? Math.max(...lastNumbers) : 0;
  
  // Generate the next number
  const nextNumber = (maxNumber + 1).toString().padStart(2, '0');
  
  // Construct the new ID by appending the next number to parent ID
  return `${parentId}-${nextNumber}`;
};

export const initializeFormData = ({ node, levelConfig, rows, parentId }) => {
    if (node) {
      // We're editing an existing node
      const initialData = {
        // For node from Flow view
        [levelConfig.id]: node.data?.id || 
                         // For node from Table view
                         node[levelConfig.id] ||
                         // For direct node data
                         node.id || '',
        [levelConfig.name]: node.data?.name || 
                           node[levelConfig.name] || 
                           node.id || '',
      };
  
      console.log("initializeFormData - Editing existing node:", {
        node,
        initialId: initialData[levelConfig.id],
        levelConfigId: levelConfig.id
      });
  
      // Add metadata fields
      levelConfig.metadata?.forEach(field => {
        initialData[field] = node.data?.metadata?.[field] || 
                            node[field] || 
                            '';
      });
  
      return initialData;
    } else {
      // We're creating a new node
      const existingIds = rows?.map(row => row[levelConfig.id]) || [];
      const newId = generateNextId(parentId || rows?.[0]?.[levelConfig.id]?.split('-').slice(0, -1).join('-') || '', existingIds);
      
      console.log("initializeFormData - Creating new node:", {
        newId,
        parentId,
        existingIds
      });
  
      const initialData = {
        [levelConfig.id]: newId,
        [levelConfig.name]: newId,
      };
  
      // Add metadata fields
      levelConfig.metadata?.forEach(field => {
        if (field.toLowerCase().includes('step type')) {
          initialData[field] = 'Normal';
        } else if (levelConfig.relationship && (
          field === levelConfig.relationship.predecessor ||
          field === levelConfig.relationship.condition
        )) {
          initialData[field] = '';
        } else {
          initialData[field] = rows?.[rows.length - 1]?.[field] || '';
        }
      });
  
      return initialData;
    }
  };

// Shared validation logic
export const validateRow = (row, fields, levelConfig, allRows = []) => {
  const errors = {};
  
  fields.forEach(field => {
    const value = row[field];
    const validationRule = VALIDATION_RULES[levelConfig.type]?.[field];
    
    // Special handling for predecessor fields
    if (field.toLowerCase().includes('predecessor')) {
      if (value) {
        const predecessorIds = value.split(',').map(id => id.trim());
        const siblingIds = allRows
          .filter(r => r[levelConfig.id] !== row[levelConfig.id])
          .map(r => r[levelConfig.id]);
        
        const invalidIds = predecessorIds.filter(id => !siblingIds.includes(id));
        if (invalidIds.length > 0) {
          errors[field] = `Invalid predecessor IDs: ${invalidIds.join(', ')}. Must be valid sibling IDs.`;
        }
      }
    } else if (validationRule) {
      const error = validateField(value, validationRule);
      if (error) {
        errors[field] = error;
      }
    }
  });
  return errors;
};

export const EditForm = ({
  isOpen,
  node,
  levelConfig,
  rows,
  onSave,
  onClose,
  parentId
}) => {
  const [formData, setFormData] = useState(() => {
    console.log("EditForm - Initializing with node:", node);
    return initializeFormData({ node, levelConfig, rows, parentId });
  });

  /*useEffect(() => {
    console.log("EditForm - Form data updated:", {
      formData,
      idField: levelConfig.id,
      currentId: formData[levelConfig.id]
    });
  }, [formData, levelConfig.id]); */

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("EditForm - Submitting:", {
      formData,
      node,
      idField: levelConfig.id,
      submittingId: formData[levelConfig.id]
    });

    onSave(formData);
    console.log("After form Submit");
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={node ? 'Edit Node' : 'Add New Node'}
      description={node ? 'Edit the details of this node' : 'Add a new node to the process'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor={levelConfig.id}>{levelConfig.id}</Label>
          <input
            id={levelConfig.id}
            value={formData[levelConfig.id] || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [levelConfig.id]: e.target.value 
            }))}
            required
            className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label htmlFor={levelConfig.name}>{levelConfig.name}</Label>
          <input
            id={levelConfig.name}
            value={formData[levelConfig.name] || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [levelConfig.name]: e.target.value 
            }))}
            required
            className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {levelConfig.metadata?.map(field => {
          if (field.toLowerCase().includes('step type')) {
            return (
              <div key={field}>
                <Label htmlFor={field}>{field}</Label>
                <select
                  id={field}
                  value={formData[field] || 'Normal'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [field]: e.target.value 
                  }))}
                  className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Validation">Validation</option>
                </select>
              </div>
            );
          }
          return (
            <div key={field}>
              <Label htmlFor={field}>{field}</Label>
              <input
                id={field}
                value={formData[field] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [field]: e.target.value 
                }))}
                className="w-full px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          );
        })}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Shared row/node update logic
export const updateRowData = (formData, rows, levelConfig) => {
    // First, ensure formData is in the correct format
    const formDataObj = Array.isArray(formData) ? formData[0] : formData;
    
    console.log("updateRowData - Processing data:", {
      formDataObj,
      levelConfigId: levelConfig.id,
      searchingFor: formDataObj[levelConfig.id],
      availableIds: rows.map(r => r[levelConfig.id])
    });
  
    const existingIds = rows.map(r => r[levelConfig.id]);
    
    if (existingIds.includes(formDataObj[levelConfig.id])) {
      return rows.map(row => {
        if (row[levelConfig.id] === formDataObj[levelConfig.id]) {
          const updatedRow = {
            ...row,
            ...formDataObj,
            _originalData: row
          };
          console.log("updateRowData - Updating row:", {
            before: row,
            after: updatedRow
          });
          return updatedRow;
        }
        return row;
      });
    } else {
      console.warn("updateRowData - ID mismatch details:", {
        searchingFor: formDataObj[levelConfig.id],
        availableIds: existingIds,
        levelConfigId: levelConfig.id,
        formDataObj
      });
      return rows;
    }
  };