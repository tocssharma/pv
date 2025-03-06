import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save, Trash2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import ProcessDataHandler,  { 
    VALIDATION_RULES, 
    getLevelFields, 
    getLevelConfig,
    validateField 
  } from  "../../lib/dataHelper";

  const EditableRow = ({ row, levelConfig, onUpdate, validationErrors }) => {
    const fields = getLevelFields(levelConfig);
    
    return (
      <tr className="hover:bg-gray-50">
        {fields.map(field => {
          const isMetadata = levelConfig.metadata?.includes(field);
          const isRelationship = levelConfig.relationship && 
            (field === levelConfig.relationship.predecessor || 
             field === levelConfig.relationship.condition);
          
          return (
            <td key={field} className="p-2">
              <input
                value={row[field] || ''}
                onChange={e => onUpdate(field, e.target.value)}
                className={`w-full px-2 py-1 border rounded 
                  ${validationErrors[field] ? 'border-red-500' : 'border-gray-300'}
                  ${isMetadata ? 'bg-gray-50' : ''}
                  ${isRelationship ? 'bg-blue-50' : ''}
                  focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {validationErrors[field] && (
                <div className="text-xs text-red-500 mt-1">
                  {validationErrors[field]}
                </div>
              )}
            </td>
          );
        })}
      </tr>
    );
  };
  
  const EditModal = ({ isOpen, node, rows, onClose, onSave }) => {
    const [editableRows, setEditableRows] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const levelConfig = getLevelConfig(node?.type || 'L0');
  
    useEffect(() => {
      if (rows) {
        setEditableRows(rows.map(row => ({
          ...row,
          _originalData: row // Keep original data for comparison
        })));
      }
    }, [rows]);
  
    const validateField = (field, value) => {
      // Check if field is an ID or Name field
      const isIdField = field.toLowerCase().includes('id');
      const isNameField = field.toLowerCase().includes('name');
      
      if (isIdField) {
        const rules = VALIDATION_RULES.ID;
        if (rules.required && !value) return 'This field is required';
        if (rules.pattern && !rules.pattern.test(value)) return rules.message;
      }
      
      if (isNameField) {
        const rules = VALIDATION_RULES.Name;
        if (rules.required && !value) return 'This field is required';
        if (rules.minLength && value.length < rules.minLength) return rules.message;
      }
      
      return null;
    };
  
    const handleRowUpdate = (rowIndex, field, value) => {
      const newRows = [...editableRows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        [field]: value
      };
      
      // Validate the updated field
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [`${rowIndex}-${field}`]: error
      }));
      
      setEditableRows(newRows);
    };
  
    const handleSave = () => {
      // Validate all fields before saving
      let hasErrors = false;
      const errors = {};
      
      editableRows.forEach((row, rowIndex) => {
        const fields = getLevelFields(levelConfig);
        fields.forEach(field => {
          const error = validateField(field, row[field]);
          if (error) {
            errors[`${rowIndex}-${field}`] = error;
            hasErrors = true;
          }
        });
      });
      
      if (hasErrors) {
        setValidationErrors(errors);
        return;
      }
  
      // Only include changed fields in the update
      const updates = editableRows.map(row => {
        const changes = {};
        const originalData = row._originalData || {};
        const fields = getLevelFields(levelConfig);
        
        fields.forEach(field => {
          if (row[field] !== originalData[field]) {
            changes[field] = row[field];
          }
        });
        
        return {
          id: row[levelConfig.id],
          changes: changes
        };
      });
  
      onSave(updates, node.type);
    };
  
    if (!isOpen || !levelConfig) return null;
  
    const fields = getLevelFields(levelConfig);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl m-4">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">
              Edit {node?.name || 'Node'} Data
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {fields.map(field => {
                    const isMetadata = levelConfig.metadata?.includes(field);
                    const isRelationship = levelConfig.relationship && 
                      (field === levelConfig.relationship.predecessor || 
                       field === levelConfig.relationship.condition);
                    
                    return (
                      <th key={field} 
                        className={`text-left p-2 text-sm font-medium
                          ${isMetadata ? 'text-gray-600 bg-gray-50' : 
                            isRelationship ? 'text-blue-600 bg-blue-50' : 
                            'text-gray-500'}`}>
                        {field}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {editableRows.map((row, index) => (
                  <EditableRow
                    key={index}
                    row={row}
                    levelConfig={levelConfig}
                    onUpdate={(field, value) => handleRowUpdate(index, field, value)}
                    validationErrors={Object.fromEntries(
                      Object.entries(validationErrors)
                        .filter(([key]) => key.startsWith(`${index}-`))
                        .map(([key, value]) => [key.split('-')[1], value])
                    )}
                  />
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default EditModal;