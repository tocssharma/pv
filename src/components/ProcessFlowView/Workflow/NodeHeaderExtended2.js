import React from 'react';
import { Card, CardHeader } from '../../ui/card';

const NodeHeaderExtended = ({ selectedNode }) => {
  return (
    <Card className="border-none shadow-none bg-transparent node-header-extended">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-500">Active Node</span>
            </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {selectedNode.name}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                ID: {selectedNode.id}
              </span>
              <span className="flex items-center">
                Type: {selectedNode.type}
              </span>
            </div>
            
            <div className="h-1 w-20 bg-blue-500 rounded-full" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default NodeHeaderExtended;