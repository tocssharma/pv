import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';

const BreadcrumbPopover = ({ items, hiddenCount, onItemClick }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="px-2 py-1 rounded-full hover:bg-blue-100"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="ml-1 text-xs">{hiddenCount}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-auto min-w-[300px]">
        <div className="flex flex-col items-center">
          {items.slice(1).map((item, index) => (
            <div key={item.id} className="flex flex-col items-center w-full">
              <div 
                onClick={() => onItemClick(item)}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 
                         text-white cursor-pointer transition-all duration-300 
                         hover:transform hover:-translate-y-0.5 hover:shadow-md
                         text-center"
              >
                {item.name}
              </div>
              {index < items.slice(1).length - 1 && (
                <div className="my-2 flex flex-col items-center">
                  <div className="h-2 w-px bg-blue-900"></div>
                  <ChevronDown className="w-5 h-5 text-blue-900" />
                  {/*<div className="h-4 w-px bg-blue-300"></div>*/}
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BreadcrumbPopover;