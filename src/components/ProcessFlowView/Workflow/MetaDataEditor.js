import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MetaDataEditor = ({ node, onSave, onClose }) => {
  const [metadata, setMetadata] = useState({
    id: node.id,
    label: node.data.label || '',
    description: node.data.description || '',
    metadata: {
      ...(node.data.metadata || {}),
      'System': '',
      'Application': '',
      'L4 Step type': '',
      'L5 Step type2': '',
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(metadata);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Node Properties</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ID</label>
            <input
              type="text"
              value={metadata.id}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={metadata.label}
              onChange={(e) => setMetadata({ ...metadata, label: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Metadata Fields */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Metadata</h3>
            {Object.entries(metadata.metadata).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setMetadata({
                    ...metadata,
                    metadata: {
                      ...metadata.metadata,
                      [key]: e.target.value
                    }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetaDataEditor