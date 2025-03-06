// EditModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Search, Filter, LayoutGrid, GitBranch } from 'lucide-react';
import { EditForm, validateRow, updateRowData } from './processUtils';
import ProcessFlow from './ProcessFlow';
import PredecessorInput from './PredecessorInput';
import ProcessDataHandler,  { 
    VALIDATION_RULES, 
    getLevelFields, 
    getLevelConfig,
    validateField 
  } from  "../../lib/dataHelper";
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
      <td className="p-2 text-sm text-gray-500 font-mono text-center border-r">
        {rowNumber}
      </td>
      
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
  const [editableRows, setEditableRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Determine the child level configuration
  const getChildLevelType = (currentType) => {
    const levels = ['L4', 'L5', 'L6', 'L7','L8'];
    const currentIndex = levels.indexOf(currentType);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'L8';
  };
  
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

  const handleAddRow = () => {
    setSelectedNode(null);
setIsEditFormOpen(true);
};

const handleSave = () => {
// Validate all rows before saving
const allErrors = {};
let hasErrors = false;

editableRows.forEach((row, index) => {
  const rowErrors = validateRow(row, fields, levelConfig, editableRows);
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

const handleUpdateNode = (formData) => {
const updatedRows = updateRowData(formData, editableRows, levelConfig);
setEditableRows(updatedRows);
setIsEditFormOpen(false);
setSelectedNode(null);
};

const handleUpdateRelationship = (sourceId, targetId) => {
const targetRow = editableRows.find(row => row[levelConfig.id] === targetId);
if (!targetRow) return;

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

        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 flex items-center gap-2 ${
              viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            Table
          </button>
          <button
            onClick={() => setViewMode('flow')}
            className={`px-4 py-2 flex items-center gap-2 ${
              viewMode === 'flow' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <GitBranch className="w-5 h-5" />
            Flow
          </button>
        </div>

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

    {/* Content Area */}
    <div className="flex-1 overflow-auto min-h-0">
      {isEditFormOpen && (
        <EditForm
          isOpen={isEditFormOpen}
          node={selectedNode}
          levelConfig={levelConfig}
          rows={editableRows}
          onSave={handleUpdateNode}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedNode(null);
          }}
          parentId={node?.id}
        />
      )}

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
                validationErrors={validationErrors[index] || {}}
                allRows={editableRows}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <ProcessFlow
          rows={editableRows}
          levelConfig={levelConfig}
          onAddNode={handleAddRow}
          onUpdateNode={handleUpdateNode}
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