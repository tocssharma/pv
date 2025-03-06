import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className="z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs text-slate-50 animate-in fade-in-0 zoom-in-95"
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };