import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save, Trash2, Upload, Search, Filter } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const levelConfig = getLevelConfig(node?.type || 'L0');
  
  const fields = useMemo(() => getLevelFields(levelConfig), [levelConfig]);

  useEffect(() => {
    if (rows) {
      setEditableRows(rows.map(row => ({
        ...row,
        _originalData: row
      })));
      setSelectedFields(fields.slice(0, 5)); // Initially show first 5 fields
    }
  }, [rows, fields]);

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
          {/* Search and Field Selection */}
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
                {selectedFields.map(field => (
                  <th key={field} 
                    className="p-2 text-left text-sm font-medium text-gray-500 bg-gray-50">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <EditableRow
                  key={index}
                  row={row}
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
                  selectedFields={selectedFields}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
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
              onClick={() => onSave(editableRows)}
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