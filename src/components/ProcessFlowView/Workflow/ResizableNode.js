import React, { useState, useCallback } from 'react';

const ResizableNode = ({ children, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const handleResizeStart = useCallback((e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({
      width: e.currentTarget.parentElement.offsetWidth,
      height: e.currentTarget.parentElement.offsetHeight,
    });

    const handleMouseMove = (moveEvent) => {
      if (!isResizing) return;

      const dx = moveEvent.clientX - startPos.x;
      const dy = moveEvent.clientY - startPos.y;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      switch (direction) {
        case 'right':
          newWidth += dx;
          break;
        case 'bottom':
          newHeight += dy;
          break;
        case 'corner':
          newWidth += dx;
          newHeight += dy;
          break;
      }

      // Enforce minimum size
      newWidth = Math.max(100, newWidth);
      newHeight = Math.max(50, newHeight);

      onResize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isResizing, onResize, startPos, startSize]);

  return (
    <div className="relative group w-full h-full">
      {children}
      
      {/* Resize handles */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500/20"
        onMouseDown={(e) => handleResizeStart(e, 'right')}
      />
      <div 
        className="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500/20"
        onMouseDown={(e) => handleResizeStart(e, 'bottom')}
      />
      <div 
        className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500/20"
        onMouseDown={(e) => handleResizeStart(e, 'corner')}
      />
    </div>
  );
};

export default ResizableNode