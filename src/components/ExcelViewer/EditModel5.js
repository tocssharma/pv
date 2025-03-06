import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save, Trash2, Upload, Search, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import ProcessDataHandler,  { 
    VALIDATION_RULES, 
    getLevelFields, 
    getLevelConfig,
    validateField 
  } from  "../../lib/dataHelper";
  import PredecessorInput from "./PredecessorInput";

  const EditableRow = ({ 
    row, 
    levelConfig, 
    onUpdate, 
    validationErrors,
    rowNumber,
    allRows
  }) => {
    const fields = getLevelFields(levelConfig);
    const isNewRow = !row._originalData;
    const isModified = row._originalData && Object.keys(fields).some(
      field => row[field] !== row._originalData[field]
    );
    
    return (
      <tr className={`
        border-b hover:bg-gray-50
        ${isNewRow ? 'bg-green-50' : ''}
        ${isModified ? 'bg-yellow-50' : ''}
      `}>
        {/* Row Number */}
        <td className="p-2 text-sm text-gray-500 font-mono text-center border-r">
          {rowNumber}
        </td>
        
        {/* Database ID */}
        <td className="p-2 text-sm font-mono border-r">
          {row._originalData?.id || 'New'}
        </td>
        
        {fields.map(field => {
          const isMetadata = levelConfig.metadata?.includes(field);
          const isPredecessor = field.toLowerCase().includes('predecessor');
          const isCondition = field.toLowerCase().includes('condition');
          
          // Skip condition field if it's handled by predecessor input
          if (isCondition && fields.some(f => f.toLowerCase().includes('predecessor'))) {
            return null;
          }
  
          return (
            <td key={field} className="p-2">
              {isPredecessor ? (
                <PredecessorInput
                  value={row[field] || ''}
                  conditions={row[fields.find(f => 
                    f.toLowerCase().includes('condition') && 
                    !f.toLowerCase().includes('predecessor')
                  )] || ''}
                  siblingIds={allRows.map(r => r[levelConfig.id])}
                  currentId={row[levelConfig.id]}
                  validationError={validationErrors[field]}
                  onChange={value => onUpdate(field, value)}
                  onConditionChange={value => {
                    const conditionField = fields.find(f => 
                      f.toLowerCase().includes('condition') && 
                      !f.toLowerCase().includes('predecessor')
                    );
                    if (conditionField) {
                      onUpdate(conditionField, value);
                    }
                  }}
                />
              ) : (
                <>
                  <input
                    value={row[field] || ''}
                    onChange={e => onUpdate(field, e.target.value)}
                    className={`w-full px-2 py-1 border rounded 
                      ${validationErrors[field] ? 'border-red-500' : 'border-gray-300'}
                      ${isMetadata ? 'bg-gray-50' : ''}
                      focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {validationErrors[field] && (
                    <div className="text-xs text-red-500 mt-1">
                      {validationErrors[field]}
                    </div>
                  )}
                </>
              )}
            </td>
          );
        })}
        
        {/* Status Indicator */}
        <td className="p-2 text-sm text-center whitespace-nowrap">
          {isNewRow ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
              New
            </span>
          ) : isModified ? (
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
              Modified
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
              Unchanged
            </span>
          )}
        </td>
      </tr>
    );
  };

const EditModal = ({ isOpen, node, rows, onClose, onSave }) => {
    console.log("EditModal:node",node);
    const [editableRows, setEditableRows] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFields, setSelectedFields] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    
    // Determine the child level configuration
    const getChildLevelType = (currentType) => {
        const levels = ['L4', 'L5', 'L6', 'L7', 'L8'];
        const currentIndex = levels.indexOf(currentType);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'L8';
    };
    
    // Use child level config instead of same level
    const levelConfig = getLevelConfig(
        node?.type === 'L8' ? 'L8' : getChildLevelType(node?.type || 'L4')
    );
    
    const fields = useMemo(() => getLevelFields(levelConfig), [levelConfig]);
    
  
    useEffect(() => {
      if (rows) {
        setEditableRows(rows.map(row => ({
          ...row,
          _originalData: row
        })));
        setSelectedFields(fields.slice(0, 5));
      }
    }, [rows, fields]);
  
    const validateRow = (row, allRows = []) => {
      const errors = {};
      
      fields.forEach(field => {
        const value = row[field];
        const validationRule = VALIDATION_RULES[levelConfig.type]?.[field];
        
        // Special handling for predecessor fields
        if (field.toLowerCase().includes('predecessor')) {
          if (value) {
            const predecessorIds = value.split(',').map(id => id.trim());
            const siblingIds = allRows
              .filter(r => r[levelConfig.id] !== row[levelConfig.id]) // Exclude current row
              .map(r => r[levelConfig.id]);
            
            // Validate each predecessor ID
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
  /*
    const generateNextId = (parentId, existingIds) => {
      // Get the level based on parent ID pattern
      const getNextLevel = (currentLevel) => {
        const levels = ['L4', 'L5', 'L6', 'L7'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
      };
  
      const getProcessLevel = (id) => {
        const parts = id.split('-');
        if (parts.length < 5) return null;
        
        const lastPart = parts[parts.length - 1];
        if (lastPart.match(/^\d+$/)) return 'L4';
        if (lastPart.match(/^\d+-\d+$/)) return 'L5';
        if (lastPart.match(/^\d+-\d+-\d+$/)) return 'L6';
        if (lastPart.match(/^\d+-\d+-\d+$/)) return 'L7';
        return null;
      };
  
      const parentLevel = getProcessLevel(parentId);
      if (!parentLevel) return null;
  
      const nextLevel = getNextLevel(parentLevel);
      if (!nextLevel) return null;
  
      // Filter existing IDs that are direct children of the parent
      const childIds = existingIds.filter(id => id.startsWith(parentId + '-'));
      
      // Find the highest sequence number
      let maxSeq = 0;
      childIds.forEach(id => {
        const lastPart = id.split('-').pop();
        const seq = parseInt(lastPart.split('-').pop());
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      });
  
      // Generate new ID based on level
      const nextSeq = (maxSeq + 1).toString().padStart(2, '0');
      const newId = `${parentId}-${nextSeq}`;
      
      return newId;
    };*/
    const generateNextId = (parentId, existingIds) => {
        console.log("generateNextId:existingIds",existingIds);
        console.log("generateNextId:parentId",parentId);
        
        // Filter to get only direct children of the parent
        const childIds = existingIds.filter(id => id.startsWith(parentId + '-'));
        console.log("generateNextId:childIds",childIds);
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
        const newId = `${parentId}-${nextNumber}`;
        
        return newId;
      };

    const handleAddRow = () => {
        console.log("handleAddRow:editableRows",editableRows);
        
        
        
        // Get existing IDs from editableRows
        const existingIds = editableRows.map(row => row[levelConfig.id] || '');
        
        // Generate new ID based on parent node
        console.log("handleAddRow:existingIds",existingIds);
        console.log("handleAddRow:parentID",node?.id || '');
        
        const newId = generateNextId(node?.id || '', existingIds);
        if (!newId) {
          console.error('Unable to generate valid ID for new row');
          return;
        }
      
        // Get the last row's data if it exists
        const lastRow = editableRows[editableRows.length - 1];
        console.log("handleAddRow:levelConfig",levelConfig);  
        // Create empty row with copied values from last row or parent node
        const newRow = fields.reduce((acc, field) => {
          // Skip ID and name fields - they'll be set explicitly
          if (field === levelConfig.id || field === levelConfig.name) {
            return acc;
          }
          
          // Skip predecessor and condition fields if they exist in relationships config
          if (levelConfig.relationship && (
            field === levelConfig.relationship.predecessor ||
            field === levelConfig.relationship.condition
          )) {
            acc[field] = '';
            return acc;
          }
          
          // For metadata fields, try to get value from:
          // 1. Last row if exists
          // 2. Parent node if exists
          // 3. Default value from validation rules
          if (levelConfig.metadata?.includes(field)) {
            acc[field] = lastRow?.[field] || 
                         node?.[field] || 
                         VALIDATION_RULES[levelConfig.type]?.[field]?.default || '';
            return acc;
          }
          
          // For other fields, copy from last row if exists, otherwise use default
          acc[field] = lastRow?.[field] || 
                       VALIDATION_RULES[levelConfig.type]?.[field]?.default || '';
          return acc;
        }, {
          // Always set ID and name to the new generated ID
          [levelConfig.id] : newId,
          [levelConfig.name]: newId
        });
      
        // Add metadata if configured (copying from parent node)
        if (levelConfig.metadata) {
          levelConfig.metadata.forEach(field => {
            if (!newRow[field]) {
              newRow[field] = node?.[field] || '';
            }
          });
        }
      
        // Set empty values for relationship fields if configured
        if (levelConfig.relationship) {
          newRow[levelConfig.relationship.predecessor] = '';
          newRow[levelConfig.relationship.condition] = '';
        }
      
        // Validate the new row
        const newRowErrors = validateRow(newRow);
        setValidationErrors(prev => ({
          ...prev,
          [editableRows.length]: newRowErrors
        }));
      
        // Add the new row
        setEditableRows(prev => [...prev, { ...newRow, _originalData: null }]);
        
        // Move to the last page to show the new row
        const newTotalPages = Math.ceil((editableRows.length + 1) / rowsPerPage);
        setPage(newTotalPages);
      };
    
      const handleSave = () => {
        // Validate all rows before saving
        const allErrors = {};
        let hasErrors = false;
    
        editableRows.forEach((row, index) => {
          const rowErrors = validateRow(row, editableRows);
          if (Object.keys(rowErrors).length > 0) {
            allErrors[index] = rowErrors;
            hasErrors = true;
          }
        });
    
        if (hasErrors) {
          setValidationErrors(allErrors);
          return;
        }
    
        // If all validations pass, proceed with save
        onSave(editableRows);
      };
  
  // Filter rows based on search term
    const filteredRows = useMemo(() => {
      return editableRows.filter(row => {
        return fields.some(field => {
          const value = row[field]?.toString().toLowerCase() || '';
          return value.includes(searchTerm.toLowerCase());
        });
      });
    }, [editableRows, fields, searchTerm]);
  
    // Get current page rows
    const currentRows = useMemo(() => {
      const startIndex = (page - 1) * rowsPerPage;
      return filteredRows.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);
  
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  
    const handleFieldToggle = (field) => {
      setSelectedFields(prev => 
        prev.includes(field) 
          ? prev.filter(f => f !== field)
          : [...prev, field]
      );
    };
  
    
    if (!isOpen || !levelConfig) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-hidden">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-6xl m-4 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">
              Edit {node?.name || 'Node'} Data
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
  
          {/* Toolbar */}
          <div className="p-4 border-b space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
              {/* Add Row Button */}
              <button
                onClick={handleAddRow}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
              >
                <Plus className="w-5 h-5" />
                Add Row
              </button>
                          <div className="relative group">
                            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                              <Filter className="w-5 h-5" />
                              Select Fields
                            </button>
                            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg p-2 hidden group-hover:block z-10 w-64">
                              {fields.map(field => (
                                <label key={field} className="flex items-center p-2 hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field)}
                                    onChange={() => handleFieldToggle(field)}
                                    className="mr-2"
                                  />
                                  {field}
                                </label>
                              ))}
                            </div>
                          </div>
            </div>
          </div>
        
        {/* Table Container */}
          <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white shadow z-10">
              <tr>

              <th className="p-2 text-left text-sm font-medium text-gray-500 bg-gray-50 w-16 text-center border-r">
                  #
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-500 bg-gray-50 w-40 border-r">
                  DB ID
                </th>

                {selectedFields.map(field => (
                  <th key={field} 
                    className="p-2 text-left text-sm font-medium text-gray-500 bg-gray-50">
                    {field}
                  </th>
                ))}
                 <th className="p-2 text-left text-sm font-medium text-gray-500 bg-gray-50 w-24 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <EditableRow
                  key={index}
                  row={row}
                  rowNumber={(page - 1) * rowsPerPage + index + 1}
                  levelConfig={levelConfig}
                  onUpdate={(field, value) => {
                    const newRows = [...editableRows];
                    const actualIndex = (page - 1) * rowsPerPage + index;
                    newRows[actualIndex] = {
                      ...newRows[actualIndex],
                      [field]: value
                    };
                    setEditableRows(newRows);
                  }}
                  validationErrors={validationErrors}
                  allRows={editableRows}
                  />
              ))}
            </tbody>
          </table>
        </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-between items-center bg-white">
            <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-1">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            </div>
            <div className="flex gap-2">
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
                Save Changes ({editableRows.length} rows)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default EditModal;