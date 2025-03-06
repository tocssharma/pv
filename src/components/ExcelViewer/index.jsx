import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, Save, Upload, Trash2, Edit2, Download, Search } from 'lucide-react';
import { dataProcessing } from "../../lib/utils";
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ExcelProcessor } from './ExcelProcessor';


const ExcelViewer = () => {
  const { data: initialData, updateData, loading, error: contextError, isInitialDataLoaded } = useData();
  const { isAdmin } = useAuth();
  
  
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  console.log("columns",columns);
  const [viewData, setViewData]= useState(initialData);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  
   // Update useEffect to handle initial data
   useEffect(() => {
    if (initialData) {
      try {
        // Ensure initialData is an array
        const dataArray = Array.isArray(initialData) ? initialData : [];
        setTableData(dataArray);
        if (dataArray.length > 0) {
          setColumns(Object.keys(dataArray[0]));
        }
        setViewData(dataArray);
      } catch (error) {
        console.error('Error processing initial data:', error);
        setError('Error processing data');
      }
    }
  }, [initialData]);

  // Process data to Map structure
  const processDataToMap = (rows, headers) => {
    try {
      const processMap = new Map();
      
      rows.forEach(row => {
        const id = row.id || row.ID;
        const parent = row.parent || row.PARENT;
        
        if (!processMap.has(parent)) {
          processMap.set(parent, []);
        }
        
        processMap.get(parent).push({
          id,
          attributes: Object.entries(row)
            .filter(([key]) => !['id', 'ID', 'parent', 'PARENT'].includes(key))
            .map(([key, value]) => ({ key, value }))
        });
      });

      return processMap;
    } catch (error) {
      console.error('Error processing data to map:', error);
      return new Map();
    }
  };


  const onDrop = useCallback(async (acceptedFiles) => {
    if (!isAdmin) {
      setError('Only administrators can upload files');
      return;
    }
  
    setIsLoading(true);
    setError('');
    
    try {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
  
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
          console.log('Parsed Excel data:', jsonData); // Debug log
  
          if (jsonData.length < 2) {
            throw new Error('File must contain headers and at least one data row');
          }
  
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
  
          const processedData = rows.map((row) => 
            Object.fromEntries(headers.map((header, i) => [header, row[i] ?? '']))
          );
  
          console.log('Processed data:', processedData); // Debug log
  
          setColumns(headers);
          setTableData(processedData);
          setViewData(processedData);
  
          // Save to database
          await updateData(processedData);
        } catch (error) {
          console.error('Error processing file:', error);
          setError('Error processing Excel file: ' + error.message);
        }
      };
  
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Drop error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, updateData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: !isAdmin
  });

  // Safe filtering function that handles empty or invalid data
  const getFilteredData = () => {
    if (!Array.isArray(tableData)) return [];
    
    return tableData.filter(row =>
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Sorting functionality with safety checks
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    const filteredData = getFilteredData();
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });
  };

  // Export functionality
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'exported_data.xlsx');
  };

  // Enhanced cell editing with validation
  const handleEdit = (rowIndex, column) => {
    if (!isAdmin) return;
    setEditingCell(`${rowIndex}-${column}`);
    setEditValue(tableData[rowIndex][column]);
  };

  const handleSave = async (rowIndex, column) => {
    if (!isAdmin) return;
    try {
      const newData = [...tableData];
      newData[rowIndex][column] = editValue;
      setTableData(newData);
      setEditingCell(null);
      await updateData(newData);
    } catch (error) {
      setError('Error saving data: ' + error.message);
    }
  };

  const handleKeyPress = (e, rowIndex, column) => {
    if (e.key === 'Enter') {
      handleSave(rowIndex, column);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Add new row handler with safety check
  const handleAddRow = () => {
    if (!isAdmin) return;
    const newRow = Object.fromEntries(columns.map(col => [col, '']));
    setTableData(prev => [...prev, newRow]);
  };

  // Delete row handler with safety check
  const handleDeleteRow = async (rowIndex) => {
    if (!isAdmin) return;
    try {
      const newData = tableData.filter((_, i) => i !== rowIndex);
      setTableData(newData);
      await updateData(newData);
    } catch (error) {
      setError('Error deleting row: ' + error.message);
    }
  };

  const sortedData = getSortedData();

   // Add loading and error handling in the return statement
   if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (contextError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading data: {contextError}</AlertDescription>
      </Alert>
    );
  }


  // If there's no initial data and user is not admin, show message
  if (!isInitialDataLoaded && !isAdmin) {
    return (
      <Alert>
        <AlertDescription>
          No data available. Please contact an administrator to upload initial data.
        </AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isAdmin && (
        <div 
          {...getRootProps()} 
          className={`
            p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`
            w-8 h-8 mx-auto mb-2
            ${isDragActive ? 'text-blue-500' : 'text-gray-400'}
          `} />
          <p className="text-sm text-gray-600">
            {isLoading ? 'Processing...' : 
             isDragActive ? 'Drop the Excel file here' : 
             'Drag & drop an Excel file here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: .xlsx, .xls (max 5MB)
          </p>
        </div>
      )}

      {tableData.length > 0 && (
        <>
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const ws = XLSX.utils.json_to_sheet(tableData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                XLSX.writeFile(wb, 'exported_data.xlsx');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          
          
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead className="w-16">Actions</TableHead>}
                    {columns.map((column) => (
                      <TableHead 
                        key={column}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(rowIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell 
                          key={`${rowIndex}-${column}`}
                          className="relative"
                        >
                          {editingCell === `${rowIndex}-${column}` && isAdmin ? (
                            <div className="flex space-x-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSave(rowIndex, column)}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                            className={`flex justify-between items-center ${isAdmin ? 'group/cell' : ''}`}
                            onClick={() => isAdmin && handleEdit(rowIndex, column)}
                          >
                            <span>{row[column]}</span>
                            {isAdmin && (
                              <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover/cell:opacity-100" />
                            )}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isAdmin && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
};

export default ExcelViewer;