import React, { useEffect, useRef } from 'react';
import { 
  Trash2, Edit, Palette, 
  Maximize, Link, Square, Circle, 
  Triangle, Diamond, Save
} from 'lucide-react';

const NodeContextMenu = ({ 
  node, 
  onDelete, 
  onResize, 
  onColorChange,
  onShapeChange,
  onMetaDataEdit,
  position,
  onClose 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', onClose);

    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', onClose);
    };
  }, [onClose]);

  const shapes = [
    { id: 'square', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'triangle', icon: Triangle },
    { id: 'diamond', icon: Diamond }
  ];

  const colors = [
    '#ffffff', '#f3f4f6', '#fee2e2', 
    '#fef3c7', '#ecfccb', '#dcfce7',
    '#dbeafe', '#f3e8ff'
  ];

  return (
    <div 
      ref={menuRef}
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in duration-200"
      style={{ 
        left: position.x, 
        top: position.y,
        minWidth: '200px' 
      }}
    >
      {/* Quick Actions */}
      <div className="flex gap-2 p-2 border-b border-gray-100">
        <button 
          onClick={() => { onDelete(node.id); onClose(); }}
          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
          title="Delete node"
        >
          <Trash2 size={16} />
        </button>
        <button 
          onClick={() => { onMetaDataEdit(node); onClose(); }}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Edit metadata"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={() => { onResize(node); onClose(); }}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Resize node"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Shape Selection */}
      <div className="p-2 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-2">Shape</div>
        <div className="flex gap-2">
          {shapes.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onShapeChange(node.id, id);
                onClose();
              }}
              className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                node.data.type === id ? 'bg-gray-100' : ''
              }`}
              title={`Change to ${id}`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="p-2">
        <div className="text-xs text-gray-500 mb-2">Color</div>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => {
                onColorChange(node.id, color);
                onClose();
              }}
              className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-all duration-200"
              style={{ 
                backgroundColor: color,
                boxShadow: node.data?.backgroundColor === color ? '0 0 0 2px #3b82f6' : 'none'
              }}
              title={`Change to ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodeContextMenu