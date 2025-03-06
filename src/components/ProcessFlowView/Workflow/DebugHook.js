import React, { useCallback } from 'react';
import {  useReactFlow } from 'reactflow';


// Debug Hook
const useDebugHandles = () => {
    const { getNodes, getEdges } = useReactFlow();
  
    const checkHandles = useCallback(() => {
      const nodes = getNodes();
      const edges = getEdges();
      
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        
        // Check if handles exist in the DOM
        const sourceHandleElement = document.querySelector(`[data-handleid="${edge.sourceHandle}"]`);
        const targetHandleElement = document.querySelector(`[data-handleid="${edge.targetHandle}"]`);
        
        
        if (sourceHandleElement) {
        }
        
        if (targetHandleElement) {
        }
        
      });
    }, [getNodes, getEdges]);
  
    return checkHandles;
  };
  
  // Debug Button Component
  const DebugButton = () => {
    const checkHandles = useDebugHandles();
    
    return (
      <button
        onClick={checkHandles}
        className="absolute top-4 right-4 px-2 py-1 bg-red-100 text-red-800 rounded
                  hover:bg-red-200 transition-colors z-50"
      >
        Debug Handles
      </button>
    );
  };
  
  export { useDebugHandles, DebugButton };