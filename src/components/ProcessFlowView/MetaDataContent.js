import React, { useState } from 'react';
import { Table } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';


const MetadataContent = ({ metadata }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'stacked', 'table', or 'grid'

  const formatMetadataKey = (key) => {
    let formattedKey = key.replace(/\d+$/, '');
    const preserveAcronyms = ['ETOM', 'ID'];
    //let formattedKey = key;
    preserveAcronyms.forEach((acronym, index) => {
      formattedKey = formattedKey.replace(new RegExp(acronym, 'g'), `___${index}___`);
    });
    formattedKey = formattedKey.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                              .replace(/([a-z])([A-Z])/g, '$1 $2');
    preserveAcronyms.forEach((acronym, index) => {
      formattedKey = formattedKey.replace(`___${index}___`, acronym);
    });
    return formattedKey.trim();
  };

  // Layout options buttons
  const ViewSelector = () => (
    <div className="flex gap-2 mb-4">

      <button
        onClick={() => setViewMode('table')}
        className={`px-3 py-1 text-xs rounded-md ${
          viewMode === 'table' 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Table
      </button>

      <button
        onClick={() => setViewMode('stacked')}
        className={`px-3 py-1 text-xs rounded-md ${
          viewMode === 'stacked' 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Stacked
      </button>

      <button
        onClick={() => setViewMode('grid')}
        className={`px-3 py-1 text-xs rounded-md ${
          viewMode === 'grid' 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Grid
      </button>
    </div>
  );

  // Stacked Layout (Vertical)
  const StackedLayout = () => (
    <div className="space-y-4">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="font-medium text-gray-700">
              {formatMetadataKey(key)}
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-gray-800 whitespace-pre-wrap break-words">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // Table Layout
  const TableLayout = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
              Property
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(metadata).map(([key, value]) => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                {formatMetadataKey(key)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-pre-wrap break-words">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Grid Layout (2 columns)
  const GridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="font-medium text-gray-700 text-sm">
              {formatMetadataKey(key)}
            </span>
          </div>
          <div className="px-3 py-2">
            <span className="text-gray-800 text-sm whitespace-pre-wrap break-words">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <ViewSelector />
      {viewMode === 'table' && <TableLayout />}
      {viewMode === 'stacked' && <StackedLayout />}
      {viewMode === 'grid' && <GridLayout />}
    </div>
  );
};

// Usage in DetailsPane accordion
const MetadataSection = ({ metadata }) => (
  <AccordionItem value="metadata" className="border-gray-200">
    <AccordionTrigger className="text-sm font-medium hover:no-underline">
      <div className="flex items-center gap-2">
        <Table className="w-4 h-4" />
        Metadata
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="pt-4">
        <MetadataContent metadata={metadata} />
      </div>
    </AccordionContent>
  </AccordionItem>
);

export { MetadataContent, MetadataSection };