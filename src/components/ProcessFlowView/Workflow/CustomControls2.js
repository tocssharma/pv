import React, { useRef, useState,  useLayoutEffect } from 'react';
import {
  Panel,
  useReactFlow
} from 'reactflow';
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import 'reactflow/dist/style.css';
import {
  DownloadControls,
  LayoutToggle,
} from './index.js';


const CustomControls = (layoutDirection,handleLayoutChange) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { zoomIn: flowZoomIn, zoomOut: flowZoomOut, setViewport, getViewport, fitView  } = useReactFlow();
    const [zoomLevel, setZoomLevel] = useState(1);
  
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    };
  
  // Add dynamic positioning
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const controlsRef = useRef(null);
    // Wrapper component that has access to ReactFlow context

    const handleZoomChange = (e) => {
      const newZoom = parseFloat(e.target.value);
      setZoomLevel(newZoom);
      const viewport = getViewport();
      setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom });
    };
  
    const handleZoomIn = () => {
      const newZoom = Math.min(zoomLevel + 0.1, 2);
      setZoomLevel(newZoom);
      const viewport = getViewport();
      setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom });
    };
  
    const handleZoomOut = () => {
      const newZoom = Math.max(zoomLevel - 0.1, 0.1);
      setZoomLevel(newZoom);
      const viewport = getViewport();
      setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom });
    };
  
    const handleFitView = () => {
      fitView({ padding: 0.2, duration: 800 });
    };
    
      // Initialize position after render
  useLayoutEffect(() => {
    if (controlsRef.current) {
      const stencilHeight = 180; // Approximate height of stencil
      setPosition({ x: 16, y: stencilHeight + 32 }); // Position below stencil with some padding
    }
  }, []);
  
    // Update zoomLevel when ReactFlow's zoom changes
    useLayoutEffect(() => {
      const viewport = getViewport();
      setZoomLevel(viewport.zoom);
    }, [getViewport]);
  
    return (
      <>
        {/* Zoom Controls */}
        <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg m-2">
          <div className="flex flex-col gap-2">
            {/*<div className="text-sm text-gray-500 font-medium">Zoom: {(zoomLevel * 100).toFixed(0)}%</div>*/}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-32 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoomLevel - 0.1) * 52.6}%, #e2e8f0 ${(zoomLevel - 0.1) * 52.6}%, #e2e8f0 100%)`
                }}
              />
              
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        {/* Additional Controls */}
      <div className="flex gap-2">
      </div>
        </Panel>
  

        <Panel position="top-right" className="m-2">
      <div>

        {/* Fit View Button */}
      <div>
       
{    /*  <LayoutToggle 
      direction={layoutDirection}
      onChange={handleLayoutChange}
      /> */}
      <DownloadControls />
        <button
          onClick={handleFitView}
          className="p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
          title="Fit View"
        >
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24">
        {/* Top-left arrow */}
        <path d="M4 14v-4h4M4 10l5 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
        {/* Top-right arrow */}
        <path d="M20 14v-4h-4M20 10l-5 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
        {/* Bottom-left arrow */}
        <path d="M4 10v4h4M4 14l5-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
        {/* Bottom-right arrow */}
        <path d="M20 10v4h-4M20 14l-5-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        </button>
        <span className="inline-block w-5"></span>
        {/* Fullscreen Toggle */}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <span className="inline-block w-5"></span>
          </div>
</div>          
        </Panel>
      </>
    );
  };

  export default CustomControls