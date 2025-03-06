import React from 'react';
import { Card, CardHeader } from '../../ui/card';

const NodeHeaderExtended = ({ selectedNode }) => {
  return (
    <div className="node-header-extended" data-testid="node-header-extended">
    <Card className="border-none shadow-none bg-transparent ">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 max-w-md"> {/* Added max-width constraint */}
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight break-words overflow-hidden">
              {/* If name is too long, show truncated version with tooltip */}
              <span className="inline-block max-w-[320px] hover:whitespace-normal whitespace-nowrap overflow-hidden text-ellipsis" 
                    title={selectedNode?.name}>
                {selectedNode?.name}
              </span>
            </h1>
            <div className="h-1 w-20 bg-blue-500 rounded-full" />
          </div>
        </div>
        
      </CardHeader>
    </Card>
    </div>
  );
};
export default NodeHeaderExtended;