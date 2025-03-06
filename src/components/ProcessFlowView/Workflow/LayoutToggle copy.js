import React from 'react';
import { ArrowDownToLine, ArrowRightToLine } from 'lucide-react';

const LayoutToggle = ({ direction = 'TB', onChange }) => {
  return (
    <div className="absolute top-4 left-4 z-10">
    <button
      onClick={() => onChange(direction === 'TB' ? 'LR' : 'TB')}
      className="p-2 bg-white rounded-md shadow-sm 
                   hover:bg-gray-50 border border-gray-200 transition-colors
                   flex items-center gap-2 text-sm text-gray-600"
      title={`Switch to ${direction === 'TB' ? 'Left to Right' : 'Top to Bottom'} layout`}
    >
      {direction === 'TB' ? (
        <>
          <ArrowRightToLine size={16} />
          
        </>
      ) : (
        <>
          <ArrowDownToLine size={16} />
          
        </>
      )}
    </button>
    </div>
  );
};

export default LayoutToggle;