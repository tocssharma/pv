import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Slider } from '../../components/ui/slider';
import {
  Plus,
  Save,
  Upload,
  Trash2,
  Edit2,
  Download,
  Search,
  ZoomIn,
  ZoomOut,
  Copy,
  Clipboard,
  WrapText,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useToast } from '../../components/ui/use-toast';
import {cn, removeDuplicates, processExcelData, preprocessJSON, dataProcessing } from "../../lib/utils";


const DEFAULT_CELL_WIDTH = 150;
const MIN_ZOOM = 50;
const MAX_ZOOM = 150;

const ExcelViewer = ({ data: initialData, onDataUpdate }) => {
  const [viewData, setViewData]= useState(initialData);
  const { toast } = useToast();
  const [tableData, setTableData] = useState(Array.isArray(initialData) ? initialData : Array.from(initialData));
  //const [columns, setColumns] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [zoom, setZoom] = useState(100);
  const [columnWidths, setColumnWidths] = useState({});
  const [textWrap, setTextWrap] = useState(true);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [filters, setFilters] = useState({});
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [clipboard, setClipboard] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const [activeCell, setActiveCell] = useState(null);
  const [showGridLines, setShowGridLines] = useState(true);
  const [frozenColumns, setFrozenColumns] = useState(0);
  const [frozenRows, setFrozenRows] = useState(0);
  
  console.log("tableData",tableData);
  console.log("viewData",viewData);
  console.log("initialData",initialData);
  //console.log("converted map to array", Array.from(initialData, ([key, value]) => ({ key, value })));
  const [columns, setColumns] = useState(
    Array.isArray(initialData) && initialData.length > 0 
      ? Object.keys(initialData[0]) 
      : []
  );
  console.log("columns",columns);
  
  // Handle zoom
  const handleZoom = (newZoom) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  };

  // Handle column resize
  const startResize = (e, column) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.pageX;
    const startWidth = columnWidths[column] || DEFAULT_CELL_WIDTH;

    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = Math.max(50, startWidth + (e.pageX - startX));
        setColumnWidths(prev => ({ ...prev, [column]: newWidth }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Search highlighting
  useEffect(() => {


    if (searchTerm) {
      const highlighted = new Set();
      tableData.forEach((row, rowIndex) => {
        Object.entries(row).forEach(([column, value]) => {
          if (String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
            highlighted.add(`${rowIndex}-${column}`);
          }
        });
      });
      setHighlightedCells(highlighted);
    } else {
      setHighlightedCells(new Set());
    }
  }, [searchTerm, tableData]);


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
      setEditingCell(`${rowIndex}-${column}`);
      setEditValue(tableData[rowIndex][column]);
    };
  
    const handleSave = async (rowIndex, column) => {
      try {
        const newData = [...tableData];
        newData[rowIndex][column] = editValue;
        setTableData(newData);
        setEditingCell(null);
  
        if (onDataUpdate) {
          //const processedData = processDataToMap(newData, columns);
          setViewData(dataProcessing(newData));
          onDataUpdate(newData);
          //onDataUpdate(processedData);
        }
      } catch (error) {
        setError('Error saving data: ' + error.message);
      }
    };

    
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
  
  // Safe filtering function that handles empty or invalid data
  const getFilteredData = () => {
    if (!Array.isArray(tableData)) return [];
    
    return tableData.filter(row =>
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };


  // Enhanced file drop handling with validation
  const onDrop = useCallback(async (acceptedFiles) => {
    setIsLoading(true);
    setError('');
    
    try {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size exceeds 5MB limit');
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const worksheet1 = workbook.Sheets[workbook.SheetNames[0]];
          const rawData = XLSX.utils.sheet_to_json(worksheet1);


          
          if (jsonData.length < 2) {
            throw new Error('File must contain headers and at least one data row');
          }

          const headers = jsonData[0];
          const rows = jsonData.slice(1);

          setColumns(headers);
          const processedRows = rows.map((row) => 
            Object.fromEntries(headers.map((header, i) => [header, row[i] ?? '']))
          );
          setTableData(processedRows);
          

          //console.log("removeDuplicates from processedRows:",removeDuplicates(processedRows));
          console.log("processedRows",processedRows);
            console.log("rawData",rawData);

          if (onDataUpdate) {

            //onDataUpdate(processDataToMap(processedRows, headers));
            setViewData(dataProcessing(processedRows));
            onDataUpdate(processedRows);
          }
        } catch (error) {
          setError('Error processing Excel file: ' + error.message);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [onDataUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });




  // Copy/Paste functionality
  const handleCopy = () => {
    const copiedData = Array.from(selectedCells).map(cellId => {
      const [rowIndex, column] = cellId.split('-');
      return tableData[rowIndex][column];
    });
    setClipboard(copiedData);
    navigator.clipboard.writeText(copiedData.join('\t'));
    toast({
      title: "Copied!",
      description: `${copiedData.length} cells copied to clipboard`,
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const pasteData = text.split('\t');
      const selectedCellsArray = Array.from(selectedCells);
      
      if (selectedCellsArray.length === 0) return;
      
      const newData = [...tableData];
      selectedCellsArray.forEach((cellId, index) => {
        if (index < pasteData.length) {
          const [rowIndex, column] = cellId.split('-');
          newData[rowIndex][column] = pasteData[index];
        }
      });
      
      setTableData(newData);
      toast({
        title: "Pasted!",
        description: `Data pasted into ${Math.min(selectedCellsArray.length, pasteData.length)} cells`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to paste data",
        variant: "destructive",
      });
    }
  };

  // Cell selection
  const handleCellClick = (e, rowIndex, column) => {
    if (e.shiftKey) {
      // Range selection
      if (activeCell) {
        const [activeRow, activeCol] = activeCell.split('-');
        const startRow = Math.min(parseInt(activeRow), rowIndex);
        const endRow = Math.max(parseInt(activeRow), rowIndex);
        const startCol = Math.min(columns.indexOf(activeCol), columns.indexOf(column));
        const endCol = Math.max(columns.indexOf(activeCol), columns.indexOf(column));
        
        const newSelection = new Set();
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startCol; j <= endCol; j++) {
            newSelection.add(`${i}-${columns[j]}`);
          }
        }
        setSelectedCells(newSelection);
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Multi-select
      const cellId = `${rowIndex}-${column}`;
      const newSelection = new Set(selectedCells);
      if (newSelection.has(cellId)) {
        newSelection.delete(cellId);
      } else {
        newSelection.add(cellId);
      }
      setSelectedCells(newSelection);
    } else {
      // Single select
      const cellId = `${rowIndex}-${column}`;
      setSelectedCells(new Set([cellId]));
      setActiveCell(cellId);
    }
  };

  // Enhanced cell editing
  const handleDoubleClick = (rowIndex, column) => {
    setEditingCell(`${rowIndex}-${column}`);
    setEditValue(tableData[rowIndex][column]);
  };

  const handleKeyDown = (e, rowIndex, column) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        setEditValue(prev => prev + '\n');
      } else {
        handleSave(rowIndex, column);
        // Move to next row
        if (rowIndex < tableData.length - 1) {
          setEditingCell(`${rowIndex + 1}-${column}`);
          setEditValue(tableData[rowIndex + 1][column]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleSave(rowIndex, column);
      // Move to next/previous column
      const currentColIndex = columns.indexOf(column);
      const nextColIndex = e.shiftKey ? 
        currentColIndex - 1 : 
        currentColIndex + 1;
      
      if (nextColIndex >= 0 && nextColIndex < columns.length) {
        setEditingCell(`${rowIndex}-${columns[nextColIndex]}`);
        setEditValue(tableData[rowIndex][columns[nextColIndex]]);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-lg">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={selectedCells.size === 0}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            disabled={selectedCells.size === 0}
          >
            <Clipboard className="w-4 h-4 mr-1" />
            Paste
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextWrap(!textWrap)}
          >
            <WrapText className={`w-4 h-4 mr-1 ${textWrap ? 'text-blue-500' : ''}`} />
            Wrap
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGridLines(!showGridLines)}
          >
            <FileSpreadsheet className={`w-4 h-4 mr-1 ${showGridLines ? 'text-blue-500' : ''}`} />
            Grid
          </Button>
        </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`
          p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
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

      {/* Export Controls */}
      {Array.isArray(tableData) && tableData.length > 0 && (
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(zoom - 10)}
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-32">
            <Slider
              value={[zoom]}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={10}
              onValueChange={([value]) => handleZoom(value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(zoom + 10)}
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500">{zoom}%</span>
        </div>
      </div>

      {/* Search Bar with Advanced Options */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilters({})}>
              Clear All Filters
            </DropdownMenuItem>
            {/* Add more filter options */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Container */}
      <div 
        className={`border rounded-lg overflow-hidden ${
          showGridLines ? 'border-gray-200' : 'border-transparent'
        }`}
        style={{ fontSize: `${zoom / 100}rem` }}
      >
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, colIndex) => (
                  <TableHead
                    key={column}
                    className={cn(
                      "relative group select-none",
                      colIndex < frozenColumns ? "sticky left-0 z-20 bg-white" : ""
                    )}
                    style={{ width: columnWidths[column] || DEFAULT_CELL_WIDTH }}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="cursor-pointer"
                        onClick={() => handleSort(column)}
                      >
                        {column}
                        {sortConfig.key === column && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="inline w-4 h-4 ml-1" /> : 
                            <ChevronDown className="inline w-4 h-4 ml-1" />
                        )}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setFrozenColumns(colIndex + 1);
                          }}>
                            Freeze to Here
                          </DropdownMenuItem>
                          {/* Add more column options */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                      onMouseDown={(e) => startResize(e, column)}
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className={cn(
                    "group hover:bg-gray-50",
                    rowIndex < frozenRows ? "sticky top-0 z-10 bg-white" : ""
                  )}
                >
                  {columns.map((column, colIndex) => {
const cellId = `${rowIndex}-${column}`;
const isSelected = selectedCells.has(cellId);
const isHighlighted = highlightedCells.has(cellId);

return (
  <TableCell
    key={cellId}
    className={cn(
      "relative",
      colIndex < frozenColumns ? "sticky left-0 z-20 bg-white" : "",
      isSelected ? "bg-blue-100" : "",
      isHighlighted ? "bg-yellow-100" : "",
      !showGridLines && "border-transparent",
      textWrap ? "whitespace-normal" : "whitespace-nowrap"
    )}
    style={{ 
      width: columnWidths[column] || DEFAULT_CELL_WIDTH,
      maxWidth: columnWidths[column] || DEFAULT_CELL_WIDTH 
    }}
    onClick={(e) => handleCellClick(e, rowIndex, column)}
    onDoubleClick={() => handleDoubleClick(rowIndex, column)}
  >
    {editingCell === cellId ? (
      <div className="absolute inset-0 -m-px">
        <textarea
          className="w-full h-full p-2 border-2 border-blue-500 focus:outline-none resize-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, rowIndex, column)}
          autoFocus
          style={{
            minHeight: textWrap ? 'auto' : '24px',
            overflow: textWrap ? 'auto' : 'hidden'
          }}
        />
      </div>
    ) : (
      <div className="flex items-center justify-between group/cell">
        <span className={cn(
          "flex-1",
          textWrap ? "break-words" : "truncate"
        )}>
          {row[column]}
        </span>
        <div className="opacity-0 group-hover/cell:opacity-100 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(rowIndex, column);
            }}
          >
            <Edit2 className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>
    )}
  </TableCell>
);
})}
</TableRow>
))}
</TableBody>
</Table>
</div>

{/* Context Menu for Right-Click */}
<DropdownMenu>
<DropdownMenuContent>
<DropdownMenuItem onClick={handleCopy}>
<Copy className="w-4 h-4 mr-2" />
Copy
</DropdownMenuItem>
<DropdownMenuItem onClick={handlePaste}>
<Clipboard className="w-4 h-4 mr-2" />
Paste
</DropdownMenuItem>
<DropdownMenuItem onClick={() => {
const newData = [...tableData];
Array.from(selectedCells).forEach(cellId => {
const [rowIndex, column] = cellId.split('-');
newData[rowIndex][column] = '';
});
setTableData(newData);
}}>
<Trash2 className="w-4 h-4 mr-2" />
Clear
</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>

{/* Keyboard Shortcuts Help */}
<div className="p-4 text-xs text-gray-500">
<p>Shortcuts: Shift+Click for range selection • Ctrl/Cmd+Click for multiple selection</p>
<p>Tab to move right • Shift+Tab to move left • Enter to move down • Shift+Enter for new line</p>
</div>
</div>

{/* Status Bar */}
<div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
<div>
{selectedCells.size > 0 ? 
`${selectedCells.size} cell${selectedCells.size > 1 ? 's' : ''} selected` : 
`${tableData.length} rows • ${columns.length} columns`
}
</div>
<div className="flex items-center gap-4">
{searchTerm && 
`${highlightedCells.size} match${highlightedCells.size !== 1 ? 'es' : ''} found`
}
<Button
variant="ghost"
size="sm"
onClick={() => handleZoom(100)}
className="text-xs"
>
<RefreshCw className="w-3 h-3 mr-1" />
Reset Zoom
</Button>
</div>
</div>
</div>
);
};

export default ExcelViewer;