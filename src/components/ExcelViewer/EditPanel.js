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
  import { LayoutGrid, GitBranch } from 'lucide-react';
  import ProcessFlow from './ProcessFlow4';
  import { useToast } from '../ui/use-toast';
  import { ContextMenu } from './contextMenu';
  import { EditForm } from './processEditForm';
  import  ExcelProcessor  from './ExcelProcessor1';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '../ui/alert-dialog';
  import ConfirmDeleteModal from './ConfirmDeleteModal';
  


  

  const EditableRow = ({ 
    row, 
    levelConfig, 
    onUpdate,
    onDelete, 
    validationErrors,
    rowNumber,
    allRows,isDialogOpen,
    onDialogOpen,
    onDialogClose
  }) => {
//    const [showEditForm, setShowEditForm] = useState(false);
//    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const fields = getLevelFields(levelConfig);
    const isNewRow = !row._originalData;
    const isModified = row._originalData && Object.keys(fields).some(
      field => row[field] !== row._originalData[field]
    );
  
    const handleEdit = () => {
      onDialogOpen();
    };
  
    // Handle delete button click
    const handleDelete = () => {
      onDialogOpen();
    };
  
    // Handle save from edit form
    const handleEditFormSave = (updatedData) => {
      handleUpdate(updatedData);
      onDialogClose();
    };
  
    // Handle confirm delete
    const handleConfirmDelete = () => {
      onDelete(row);
      onDialogClose();
    };
    // Unified update handler that works for both field updates and form updates
    const handleUpdate = (fieldOrData, value) => {
      if (typeof fieldOrData === 'object') {
        // Handle full row update from EditForm
        onUpdate(row => ({
          ...row,
          ...fieldOrData,
          _isModified: true
        }));
      } else {
        // Handle single field update
        onUpdate(row => ({
          ...row,
          [fieldOrData]: value,
          _isModified: true
        }));
      }
    };
  
    
  
    return (
      <>
        <tr className={`
          border-b hover:bg-gray-50
          ${isNewRow ? 'bg-green-50' : ''}
          ${isModified ? 'bg-yellow-50' : ''}
        `}>
          {/* Row Number */}
          <td className="p-2 text-sm text-gray-500 font-mono text-center border-r">
            <ContextMenu onEdit={handleEdit} onDelete={handleDelete}>
              <div className="cursor-context-menu w-full h-full">
                {rowNumber}
              </div>
            </ContextMenu>
          </td>
          
          {/* Database ID */}
          <td className="p-2 text-sm font-mono border-r">
            {row._originalData?.id || 'New'}
          </td>
          
          {fields.map(field => {
            const isMetadata = levelConfig.metadata?.includes(field);
            const isPredecessor = field.toLowerCase().includes('predecessor');
            const isCondition = field.toLowerCase().includes('condition');
            
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
                    onChange={value => handleUpdate(field, value)}
                    onConditionChange={value => {
                      const conditionField = fields.find(f => 
                        f.toLowerCase().includes('condition') && 
                        !f.toLowerCase().includes('predecessor')
                      );
                      if (conditionField) {
                        handleUpdate(conditionField, value);
                      }
                    }}
                  />
                ) : (
                  <>
                    <input
                      value={row[field] || ''}
                      onChange={e => handleUpdate(field, e.target.value)}
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
  
        {/* Edit Form Dialog */}
        {isDialogOpen && (
        <EditForm
          data={row}
          levelConfig={levelConfig}
          onSave={handleEditFormSave}
          onClose={onDialogClose}
          allRows={allRows}
          mode="row"
        />
      )}
  
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={onDialogClose}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Process</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete this process? ID: {row[levelConfig.id]}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onDialogClose}>
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
      </>
    );
  };

const EditPanel = ({  node, rows, onClose, onSave }) => {
    console.log("EditModal:node1",node);
    const [editableRows, setEditableRows] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFields, setSelectedFields] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('flow'); // 'table' or 'flow'
    const [isLoading, setIsLoading]= useState(false);
    const { toast } = useToast();
    const [activeDialogs, setActiveDialogs] = useState(new Set());


    const handleRowUpdate = (rowId,fieldOrUpdater) => {
      setEditableRows(prev => {
        const newRows = [...prev];
        const index = newRows.findIndex(r => r[levelConfig.id] === rowId);
        if (index === -1) return prev;
  
        if (typeof fieldOrUpdater === 'function') {
          newRows[index] = fieldOrUpdater(newRows[index]);
        } else if (typeof fieldOrUpdater === 'object') {
          // Handle complete row update
          newRows[index] = {
            ...newRows[index],
            ...fieldOrUpdater,
            _isModified: true
          };
        } else {
          // This case shouldn't occur with the new implementation
          console.warn('Unexpected update type:', fieldOrUpdater);
          return prev;
        }
        return newRows;
      });
    };

    const handleDialogOpen = (dialogId) => {
      setActiveDialogs(prev => new Set([...prev, dialogId]));
    };
    
    const handleDialogClose = (dialogId) => {
      setActiveDialogs(prev => {
        const next = new Set(prev);
        next.delete(dialogId);
        return next;
      });
    };
// Add these handlers
const handleUpdateRelationship = (sourceId, targetId) => {
    // Find the target row
    const targetRow = editableRows.find(row => row[levelConfig.id] === targetId);
    if (!targetRow) return;
  
    // Update the predecessor field
    const predecessorField = levelConfig.relationship?.predecessor;
    if (!predecessorField) return;
  
    const currentPredecessors = targetRow[predecessorField] 
      ? targetRow[predecessorField].split(',').map(p => p.trim())
      : [];
    
    if (!currentPredecessors.includes(sourceId)) {
      const newPredecessors = [...currentPredecessors, sourceId].join(', ');
      
      const newRows = editableRows.map(row => {
        if (row[levelConfig.id] === targetId) {
          return {
            ...row,
            [predecessorField]: newPredecessors
          };
        }
        return row;
      });
      
      setEditableRows(newRows);
    }
  };

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

      const handleUpdateRow = (updatedRows) => {
        setEditableRows(updatedRows);
      };
    
      const handleAddRow = () => {
        console.log("handleAddRow:editableRows", editableRows);
        
        // Determine current level from levelConfig
        const currentLevel = Object.entries(ProcessDataHandler.LEVELS).find(
          ([level, config]) => config.id === levelConfig.id
        )?.[0];
      
        if (!currentLevel) {
          console.error('Unable to determine current level');
          return;
        }
      
        console.log("handleAddRow:currentLevel", currentLevel);
        
        // Get existing IDs from editableRows
        const existingIds = editableRows.map(row => row[levelConfig.id] || '');
        
        const newId = generateNextId(node?.id || '', existingIds);
        if (!newId) {
          console.error('Unable to generate valid ID for new row');
          return;
        }
      
        // Get the last row's data if it exists
        const lastRow = editableRows[editableRows.length - 1];
        
        // Initialize new row with ALL level fields
        const newRow = {};
      
        // Helper function to set field value
        const setFieldValue = (field, defaultValue = '') => {
          return lastRow?.[field] || 
                 node?.[field] || 
                 defaultValue;
        };
      
        // Add fields from all levels
        Object.entries(ProcessDataHandler.LEVELS).forEach(([level, config]) => {
          const isParentLevel = ProcessDataHandler.LEVELS[level].id < ProcessDataHandler.LEVELS[currentLevel].id;
          const isCurrentLevel = level === currentLevel;
          
          // Add ID and Name fields
          if (isCurrentLevel) {
            // For current level, use generated ID
            newRow[config.id] = newId;
            newRow[config.name] = newId;
          } else if (isParentLevel) {
            // For parent levels, copy from last row or node
            newRow[config.id] = setFieldValue(config.id);
            newRow[config.name] = setFieldValue(config.name);
          } else {
            // For child levels, set empty
            newRow[config.id] = '';
            newRow[config.name] = '';
          }
      
          // Add metadata fields if any
          if (config.metadata) {
            config.metadata.forEach(field => {
              if (isCurrentLevel) {
                // For current level metadata
                newRow[field] = setFieldValue(field, VALIDATION_RULES[level]?.[field]?.default || '');
              } else if (isParentLevel) {
                // Copy parent level metadata
                newRow[field] = setFieldValue(field);
              } else {
                // Empty for child levels
                newRow[field] = '';
              }
            });
          }
      
          // Add relationship fields if any
          if (config.relationship) {
            if (isCurrentLevel) {
              // Empty for current level relationships
              newRow[config.relationship.predecessor] = '';
              newRow[config.relationship.condition] = '';
            } else if (isParentLevel) {
              // Copy parent relationships
              newRow[config.relationship.predecessor] = setFieldValue(config.relationship.predecessor);
              newRow[config.relationship.condition] = setFieldValue(config.relationship.condition);
            } else {
              // Empty for child relationships
              newRow[config.relationship.predecessor] = '';
              newRow[config.relationship.condition] = '';
            }
          }
        });
      
        console.log("handleAddRow:newRow", newRow);
      
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


      
      const handleDeleteRow = (rowToDelete) => {
        console.log("handleDeleteRow:rowToDelete",rowToDelete);
        try {
          // Mark the row for deletion instead of removing immediately
          setEditableRows(prev => prev.map(row => 
            row[levelConfig.id] === rowToDelete[levelConfig.id] 
              ? { ...row, _deleted: true }
              : row
          ));
        } catch (error) {
          console.error('Error marking row for deletion:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete row.',
          });
        }
      };
    
/*
      const handleSave = async () => {
        try{ 
        // Add loading state
          setIsLoading(true);

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
          //toast.error("Please fix validation errors before saving");
          toast({
            title: 'Validation Errors',
            description: 'handlesave:Please fix validation errors before saving.',
          });
          return;
        }
    
      // Add optimistic state update
      const previousData = [...editableRows];

      try {
      console.log("handlesave:saving editableRows",editableRows);
        await onSave(editableRows, null,levelConfig);
        
        toast({
          title: 'Save',
          description: 'Saved successfully.',
        });
      } catch (error) {
        // Rollback on failure
        console.log("handlesave:Rolling  back previousData",previousData);

        setEditableRows(previousData);
        throw error;
      }
  
    } catch (error) {
      console.error('handlesave::Save failed:', error);

      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Failed to save changes.',
      });
    } finally {
      setIsLoading(false);
    }
      };

      */


      const handleSave = async () => {
        try {
          setIsLoading(true);
      
          // Track different types of changes
          const rowsToUpdate = [];
          const rowsToAdd = [];
          const rowsToDelete = [];
      
          // Categorize rows based on their state
          editableRows.forEach(row => {
            if (row._deleted) {
              rowsToDelete.push(row);
            } else if (row._originalData) {
              // Check if row has actual changes
              const hasChanges = Object.keys(row).some(key => 
                key !== '_originalData' && 
                key !== '_deleted' && 
                row[key] !== row._originalData[key]
              );
              if (hasChanges) {
                rowsToUpdate.push(row);
              }
            } else {
              // No _originalData means it's a new row
              rowsToAdd.push(row);
            }
          });
      
          // Validate rows (excluding deleted ones)
          const rowsToValidate = [...rowsToUpdate, ...rowsToAdd];
          const allErrors = {};
          let hasErrors = false;
      
          rowsToValidate.forEach((row, index) => {
            const rowErrors = validateRow(row, editableRows);
            if (Object.keys(rowErrors).length > 0) {
              allErrors[index] = rowErrors;
              hasErrors = true;
            }
          });
      
          if (hasErrors) {
            setValidationErrors(allErrors);
            toast({
              title: 'Validation Errors',
              description: 'Please fix validation errors before saving.',
            });
            return;
          }
      
          // Keep track of original state for rollback
          const previousData = [...editableRows];
      
          try {
            // Create final data set
            const finalData = [...editableRows]
              .filter(row => !row._deleted) // Remove deleted rows
              .map(row => {
                // Clean up temporary properties
                const { _originalData, _deleted, ...cleanRow } = row;
                return cleanRow;
              });
      
            console.log("handleSave: Saving changes", {
              total: finalData.length,
              updates: rowsToUpdate.length,
              additions: rowsToAdd.length,
              deletions: rowsToDelete.length
            });
      
            await onSave(finalData, null, levelConfig);
      
            toast({
              title: 'Save Successful',
              description: `Saved ${rowsToUpdate.length} updates, ${rowsToAdd.length} additions, and ${rowsToDelete.length} deletions.`,
            });
      
            // Clear deleted rows from state after successful save
            setEditableRows(finalData);
          } catch (error) {
            console.error("handleSave: Save failed", error);
            setEditableRows(previousData);
            
            toast({
              variant: 'destructive',
              title: 'Save Failed',
              description: error.message || 'Failed to save changes.',
            });
            throw error;
          }
        } catch (error) {
          console.error('handleSave: Operation failed:', error);
          toast({
            variant: 'destructive',
            title: 'Operation Failed',
            description: 'An unexpected error occurred.',
          });
        } finally {
          setIsLoading(false);
        }
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
  
    
    if (!levelConfig) return null;
  
    return (
      <div className="h-full flex flex-col bg-white">
  
      {/* Header and Toolbar Combined Row */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        {/* Left Section - Add Row & View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg flex items-center gap-1 hover:bg-green-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 flex items-center gap-1 text-sm ${
                viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1.5 flex items-center gap-1 text-sm ${
                viewMode === 'flow' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Flow
            </button>
            <button
              onClick={() => setViewMode('import')}
              className={`px-3 py-1.5 flex items-center gap-1 text-sm ${
                viewMode === 'import' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              import
            </button>
          </div>
        </div>

        {/* Center Section - Header */}
        <h2 className="text-base font-semibold flex items-center gap-2">
           {node?.name || 'Node'} 

        </h2>

        {/* Right Section - Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rows..."
              className="w-48 pl-8 pr-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative group">
            <button className="px-3 py-1.5 border rounded-lg flex items-center gap-1 hover:bg-gray-50 text-sm">
              <Filter className="w-4 h-4" />
              Fields
            </button>

            
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg p-2 hidden group-hover:block z-10 w-48">
              {fields.map(field => (
                <label key={field} className="flex items-center p-2 hover:bg-gray-50 text-sm">
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
  
        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {viewMode === 'table' ? (
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
                    <th key={field} className="p-2 text-left text-sm font-medium text-gray-500 bg-gray-50">
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
    key={row[levelConfig.id] || index}
    row={row}
    rowNumber={(page - 1) * rowsPerPage + index + 1}
    levelConfig={levelConfig}
    onUpdate={(fieldOrUpdater) => {
      const rowId = row[levelConfig.id];
      handleRowUpdate(rowId, fieldOrUpdater);
    }}
    onDelete={handleDeleteRow}
    validationErrors={validationErrors[row[levelConfig.id]] || {}}
    allRows={editableRows}
    isDialogOpen={activeDialogs.has(row[levelConfig.id])}
    onDialogOpen={() => handleDialogOpen(row[levelConfig.id])}
    onDialogClose={() => handleDialogClose(row[levelConfig.id])}
  />
))}
              </tbody>
            </table>
          ) : (
            <ProcessFlow
              rows={editableRows}
              levelConfig={levelConfig}
              onAddNode={handleAddRow}
              onUpdateNode={handleRowUpdate}
              onUpdateRelationship={handleUpdateRelationship}
            />
          )}
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
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : `Save Changes (${editableRows.length} rows)`}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default EditPanel;