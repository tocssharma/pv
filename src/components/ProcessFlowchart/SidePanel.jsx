import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Users, Database, GitBranch } from 'lucide-react';

const SidePanel = ({ selectedNode, hoveredNode, processData }) => {
  const [expandedSections, setExpandedSections] = useState({
    attributes: true,
    relationships: true,
    children: true
  });

  // Reset expanded sections when selected node changes
  useEffect(() => {
    setExpandedSections({
      attributes: true,
      relationships: true,
      children: true
    });
  }, [selectedNode?.id]);

  // Display node is either hovered node or selected node
  const displayNode = hoveredNode || selectedNode;

  if (!displayNode) {
    return (
      <div className="w-96 border-l border-gray-200 bg-gray-50 p-4">
        <div className="text-gray-500 text-center">
          Select a node to view details
        </div>
      </div>
    );
  }

  // Group attributes by category (based on key prefix)
  const groupAttributes = (attributes) => {
    return attributes.reduce((groups, attr) => {
      const category = attr.key.split(' ')[0];
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(attr);
      return groups;
    }, {});
  };

  const groupedAttributes = groupAttributes(displayNode.attributes || []);

  // Get process name
  const getProcessName = () => {
    const processNameAttr = displayNode.attributes?.find(attr => 
      attr.key.includes('Process Name') || attr.key === 'processName'
    );
    return processNameAttr?.value || displayNode.id;
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Section Header Component
  const SectionHeader = ({ title, isExpanded, icon: Icon, onToggle }) => (
    <div 
      className="flex items-center justify-between p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-gray-600" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-600" />
      )}
    </div>
  );

  return (
    <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {displayNode.id}
          </h2>
          {hoveredNode && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Hover Preview
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {getProcessName()}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Attributes Section */}
        <div className="space-y-3">
          <SectionHeader 
            title="Attributes"
            icon={Database}
            isExpanded={expandedSections.attributes}
            onToggle={() => toggleSection('attributes')}
          />
          
          {expandedSections.attributes && (
            <div className="space-y-4 mt-2">
              {Object.entries(groupedAttributes).map(([category, attrs]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">
                      {category}
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    {attrs.map((attr, index) => (
                      <div 
                        key={index}
                        className="text-sm bg-gray-50 p-2 rounded"
                      >
                        <div className="text-gray-500 text-xs">
                          {attr.key}
                        </div>
                        <div className="mt-1 text-gray-900">
                          {attr.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Relationships Section */}
        {displayNode.relationships?.length > 0 && (
          <div className="space-y-3">
            <SectionHeader 
              title="Relationships"
              icon={GitBranch}
              isExpanded={expandedSections.relationships}
              onToggle={() => toggleSection('relationships')}
            />
            
            {expandedSections.relationships && (
              <div className="space-y-2 mt-2">
                {displayNode.relationships.map((rel, index) => (
                  <div 
                    key={index}
                    className="bg-white p-3 rounded-lg shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Type
                      </span>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${rel.type === 'Validation' ? 'bg-blue-100 text-blue-800' :
                          rel.type === 'Distribution' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {rel.type}
                      </span>
                    </div>
                    {rel.successor && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Target
                        </span>
                        <span className="text-sm text-gray-600">
                          {rel.successor}
                        </span>
                      </div>
                    )}
                    {rel.condition && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Condition
                        </span>
                        <span className="text-sm text-gray-600">
                          {rel.condition}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Children Section */}
        {processData.get(displayNode.id)?.length > 0 && (
          <div className="space-y-3">
            <SectionHeader 
              title="Child Nodes"
              icon={Users}
              isExpanded={expandedSections.children}
              onToggle={() => toggleSection('children')}
            />
            
            {expandedSections.children && (
              <div className="space-y-2 mt-2">
                {processData.get(displayNode.id).map((child) => (
                  <div 
                    key={child.id}
                    className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {child.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getProcessName(child)}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;