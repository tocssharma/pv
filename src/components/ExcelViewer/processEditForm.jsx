import {memo, useState} from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import 'reactflow/dist/style.css';
import { generateNextId } from './processUtils';


// components/ProcessEditForm.jsx
export const EditForm = memo(({ 
    data, // Can be either node.data or row
    levelConfig, 
    onSave, 
    onClose, 
    allRows,
    mode = 'node' // 'node' or 'row'
  }) => {
    const lastRow = allRows?.[allRows.length - 1];
    
    const initializeFormData = () => {
      if (data) {
        // For existing data (edit mode)
        if (mode === 'node') {
          // Node data structure
          return {
            [levelConfig.id]: data.id || '',
            [levelConfig.name]: data.name || '',
            ...data.metadata || {}
          };
        } else {
          // Row data structure
          return {
            [levelConfig.id]: data[levelConfig.id] || '',
            [levelConfig.name]: data[levelConfig.name] || '',
            ...(levelConfig.metadata?.reduce((acc, field) => ({
              ...acc,
              [field]: data[field] || ''
            }), {}))
          };
        }
      } else {
        // For new data (add mode)
        const existingIds = allRows?.map(row => row[levelConfig.id]) || [];
        const newId = generateNextId(
          allRows?.[0]?.[levelConfig.id]?.split('-').slice(0, -1).join('-') || '', 
          existingIds
        );
  
        return {
          [levelConfig.id]: newId,
          [levelConfig.name]: newId,
          ...(levelConfig.metadata?.reduce((acc, field) => {
            if (field.toLowerCase().includes('step type')) {
              acc[field] = 'Normal';
            } else if (levelConfig.relationship && (
              field === levelConfig.relationship.predecessor ||
              field === levelConfig.relationship.condition
            )) {
              acc[field] = '';
            } else {
              acc[field] = lastRow?.[field] || '';
            }
            return acc;
          }, {}))
        };
      }
    };
  
    const [formData, setFormData] = useState(initializeFormData());
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Format data according to mode
      const formattedData = mode === 'node' ? {
        id: formData[levelConfig.id],
        name: formData[levelConfig.name],
        metadata: levelConfig.metadata?.reduce((acc, field) => ({
          ...acc,
          [field]: formData[field]
        }), {})
      } : formData;
  
      onSave(formattedData);
    };
  
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {data ? 'Edit Process' : 'Add New Process'}
            </DialogTitle>
          </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor={levelConfig.id}>ID</Label>
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
                      <Label htmlFor={levelConfig.name}>Name</Label>
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
                    <div className="flex justify-end gap-2">
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
        </DialogContent>
      </Dialog>
    );
  });