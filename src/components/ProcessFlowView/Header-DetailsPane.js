import React, { useState } from 'react';
import { 
  FoldersIcon, 
  Menu, 
  Settings, 
  HelpCircle, 
  User, 
  LogOut,
  FileText,
  Database,
  Share2,
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';

import  { MetadataContent, MetadataSection }  from './MetaDataContent';
import SampleFlowGenerator from './Workflow/SampleFlowGenerator'

// Simple Button component
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gray-900 text-gray-50 hover:bg-gray-900/90",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        ring-offset-white transition-colors focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Enhanced Header with Burger Menu
const Header = () => {
  const menuItems = [
    {
      label: 'File',
      items: [
        { icon: <FileText className="w-4 h-4 mr-2" />, label: 'Export Data', onClick: () => console.log('Export') },
        { icon: <Share2 className="w-4 h-4 mr-2" />, label: 'Share', onClick: () => console.log('Share') },
      ]
    },
    {
      label: 'Settings',
      items: [
        { icon: <Database className="w-4 h-4 mr-2" />, label: 'Data Sources', onClick: () => console.log('Data Sources') },
        { icon: <Settings className="w-4 h-4 mr-2" />, label: 'Preferences', onClick: () => console.log('Preferences') },
      ]
    },
    {
      label: 'Help',
      items: [
        { icon: <HelpCircle className="w-4 h-4 mr-2" />, label: 'Documentation', onClick: () => console.log('Documentation') },
        { icon: <User className="w-4 h-4 mr-2" />, label: 'Support', onClick: () => console.log('Support') },
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <div className="bg-white/10 p-2 rounded-lg">
          <FoldersIcon className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-semibold">Jio Business Process Viewer</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 focus:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {menuItems.map((section, idx) => (
              <React.Fragment key={section.label}>
                {idx > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
                {section.items.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={item.onClick}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </React.Fragment>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Helper function to determine node type
const getNodeType = (node) => {
    // Base types that should be preserved
    const baseTypes = ['domain', 'lob', 'processArea'];
    
    // If it's one of the predefined base types, return it as is
    if (baseTypes.includes(node.type)) {
      return node.type;
    }
  
    // Check if node has children and meets process criteria
    const hasChildren = node.children && Object.keys(node.children).length > 0;
    const idParts = node.id?.split('-') || [];
  
    // Process type: has 4+ ID parts and has children
    if (idParts.length >= 4 && hasChildren) {
      return 'process';
    }
  
    // Process Step type: has more than 4 ID parts and no children
    if (idParts.length > 4 && !hasChildren) {
      return 'process step';
    }
  
    // Return original type if no special cases match
    return node.type;
  };
  
  // Utility function to preserve Acronyms
  const formatMetadataKey = (key) => {
    // Special case for known acronyms
    const preserveAcronyms = ['ETOM', 'ID'];
    
    // First, preserve known acronyms by temporarily replacing them
    let formattedKey = key;
    preserveAcronyms.forEach((acronym, index) => {
      formattedKey = formattedKey.replace(new RegExp(acronym, 'g'), `___${index}___`);
    });
  
    // Add spaces between camelCase words
    formattedKey = formattedKey.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                              .replace(/([a-z])([A-Z])/g, '$1 $2');
  
    // Restore acronyms
    preserveAcronyms.forEach((acronym, index) => {
      formattedKey = formattedKey.replace(`___${index}___`, acronym);
    });
  
    return formattedKey;
  };


// Enhanced DetailsPane
const DetailsPane = ({ node }) => {
  if (!node) {
    return (
      <div className="h-full m-2 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
          <HelpCircle className="w-8 h-8 text-gray-400" />
          <p>Select a node to view details</p>
        </div>
      </div>
    );
  }

  const getTypeColor = (type) => {
    const colors = {
      domain: 'bg-blue-100 text-blue-800 border-blue-200',
      lob: 'bg-green-100 text-green-800 border-green-200',
      journey: 'bg-purple-100 text-purple-800 border-purple-200',
      processArea: 'bg-orange-100 text-orange-800 border-orange-200',
      process: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'process step': 'bg-pink-100 text-pink-800 border-pink-200' // Added style for process step
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

    // Get the determined node type
    const nodeType = getNodeType(node);
 
    // Debug information to show type determination factors
 const debugInfo = {
    'ID Parts': node.id?.split('-').length || 0,
    'Has Children': node.children ? Object.keys(node.children).length > 0 : false,
    'Original Type': node.type,
    'Determined Type': nodeType
  };

  return (
    <div className="h-full m-2 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
          </div>
          <Badge className={`${getTypeColor(nodeType)} capitalize`}>
            {nodeType}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <Accordion type="single" collapsible className="w-full" defaultValue="metadata">
          <AccordionItem value="basic-info" className="border-gray-200">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Basic Information
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">ID</span>
                  <span className="font-medium text-gray-900">{node.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">{node.name}</span>
                </div>
                
                {/* Debug section
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Original Type</span>
                  <span className="font-medium text-gray-900">{node.type}</span>
                </div>
                 
                <div className="mt-4 pt-2 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Type Determination Factors:</p>
                  {Object.entries(debugInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium text-gray-900">
                        {typeof value === 'boolean' ? value.toString() : value}
                      </span>
                    </div>
                  ))}
                </div>*/}
              </div>
            </AccordionContent>
          </AccordionItem >

                {node.metadata && Object.keys(node.metadata).length > 0 && (
                <MetadataSection metadata={node.metadata} />
                )}

          {node.relationships && (
            <AccordionItem value="relationships" className="border-gray-200">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Relationships
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm bg-gray-50 rounded-lg p-4">
                  {node.relationships.predecessors && (
                    <div className="py-2">
                      <span className="text-gray-600 block mb-2">Predecessors:</span>
                      <div className="flex flex-wrap gap-2">
                        {node.relationships.predecessors.map((pred) => (
                          <Badge 
                            key={pred} 
                            variant="secondary" 
                            className="text-xs bg-white border border-gray-200"
                          >
                            {pred}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {node.relationships.condition && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Condition</span>
                      <span className="font-medium text-gray-900">
                        {node.relationships.condition}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export { Header, DetailsPane };