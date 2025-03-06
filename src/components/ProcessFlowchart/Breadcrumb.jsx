import React from 'react';
import PropTypes from  'prop-types';
import { ChevronRight, Home, Layers } from 'lucide-react';

const Breadcrumb = ({ 
  items = [], 
  onNodeSelect,
  processData 
}) => {
  // Get node process name
  const getProcessName = (nodeId) => {
    // For root node
    if (nodeId === 'JIN') return 'Home';

    // Search through process data
    for (const [_, nodes] of processData || []) {
      const node = nodes.find(n => n.id === nodeId);
      if (node?.attributes) {
        const processNameAttr = node.attributes.find(attr => 
          attr.key.includes('Process Name') || attr.key === 'processName'
        );
        return processNameAttr?.value || nodeId;
      }
    }
    return nodeId;
  };

  // Get visual category for node (used for styling)
  const getNodeCategory = (nodeId) => {
    if (nodeId === 'JIN') return 'root';
    
    const level = nodeId.split('-').length;
    switch(level) {
      case 1: return 'primary';
      case 2: return 'secondary';
      case 3: return 'tertiary';
      default: return 'default';
    }
  };

  // Render individual breadcrumb item
  const BreadcrumbItem = ({ nodeId, isLast }) => {
    const category = getNodeCategory(nodeId);
    const processName = getProcessName(nodeId);

    return (
      <div className="flex items-center">
        {/* Separator */}
        {nodeId !== items[0] && (
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
        )}

        {/* Breadcrumb Item */}
        <div
          onClick={() => !isLast && onNodeSelect(nodeId)}
          className={`
            flex items-center space-x-1 px-2 py-1 rounded-md text-sm
            ${!isLast ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'}
            ${isLast ? 'font-semibold' : 'font-medium'}
            ${category === 'root' ? 'text-gray-700' :
              category === 'primary' ? 'text-blue-600' :
              category === 'secondary' ? 'text-green-600' :
              category === 'tertiary' ? 'text-purple-600' :
              'text-gray-600'}
          `}
        >
          {/* Icon */}
          {nodeId === 'JIN' ? (
            <Home className="w-4 h-4" />
          ) : (
            <Layers className="w-4 h-4" />
          )}

          {/* Text */}
          <span className={`
            truncate max-w-[200px]
            ${isLast ? 'text-gray-900' : ''}
          `}>
            {processName}
          </span>
        </div>

        {/* Process ID Tooltip */}
        {nodeId !== 'JIN' && (
          <span className="ml-1 text-xs text-gray-400 hidden group-hover:inline">
            {nodeId}
          </span>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        {/* Mobile View (Simplified) */}
        <div className="sm:hidden">
          <select
            onChange={(e) => onNodeSelect(e.target.value)}
            value={items[items.length - 1]}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {items.map((item) => (
              <option key={item} value={item}>
                {getProcessName(item)}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex sm:items-center">
          <div className="flex flex-wrap items-center gap-y-2">
            {items.map((item, index) => (
              <BreadcrumbItem 
                key={item} 
                nodeId={item} 
                isLast={index === items.length - 1} 
              />
            ))}
          </div>

          {/* Current Process Details */}
          {items.length > 0 && (
            <div className="ml-4 pl-4 border-l border-gray-200">
              <div className="text-xs text-gray-500">
                Current Process
              </div>
              <div className="text-sm font-medium text-gray-900">
                {getProcessName(items[items.length - 1])}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters/Context (if needed) */}
      {false && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {/* Add any active filters or context here */}
          </div>
        </div>
      )}
    </nav>
  );
};

// PropTypes for development
Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  processData: PropTypes.instanceOf(Map)
};

export default Breadcrumb;