import React, { useState, useEffect } from 'react';

const CustomCursorFlow = ({ children }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Primary cursor ring */}
      <div
        className={`pointer-events-none fixed z-50 w-6 h-6 rounded-full border-2 transition-all duration-150 ${
          isDragging ? 'scale-150 border-orange-500' : 'border-cyan-400'
        }`}
        style={{
          left: cursorPosition.x - 12,
          top: cursorPosition.y - 12,
          backgroundColor: isDragging ? 'rgba(249, 115, 22, 0.2)' : 'rgba(34, 211, 238, 0.2)',
          boxShadow: isDragging 
            ? '0 0 10px rgba(249, 115, 22, 0.5), inset 0 0 4px rgba(249, 115, 22, 0.5)' 
            : '0 0 10px rgba(34, 211, 238, 0.5), inset 0 0 4px rgba(34, 211, 238, 0.5)',
          transform: `translate(${isDragging ? '-5px' : '0'}, ${
            isDragging ? '-5px' : '0'
          })`,
        }}
      />

      {/* Secondary cursor dot */}
      <div
        className={`pointer-events-none fixed z-40 w-2 h-2 rounded-full transition-colors duration-150 ${
          isDragging ? 'bg-orange-400' : 'bg-cyan-300'
        }`}
        style={{
          left: cursorPosition.x - 1,
          top: cursorPosition.y - 1,
          transition: 'all 0.1s ease',
          boxShadow: isDragging 
            ? '0 0 6px rgba(249, 115, 22, 0.8)' 
            : '0 0 6px rgba(34, 211, 238, 0.8)',
        }}
      />

      {/* Content wrapper */}
      <div className="w-full h-full cursor-none">
        {children}
      </div>
    </div>
  );
};

export default CustomCursorFlow;