import React, { useRef, useState, useLayoutEffect } from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import 'reactflow/dist/style.css';
import { DownloadControls, LayoutToggle } from './index.js';

const CustomControls = ({ layoutDirection, handleLayoutChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { zoomIn: flowZoomIn, zoomOut: flowZoomOut, setViewport, getViewport, fitView } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState(1);
  const controlsRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  useLayoutEffect(() => {
    if (controlsRef.current) {
      const stencilHeight = 180;
      setPosition({ x: 16, y: stencilHeight + 32 });
    }
  }, []);

  useLayoutEffect(() => {
    const viewport = getViewport();
    setZoomLevel(viewport.zoom);
  }, [getViewport]);

  return (
    <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg m-2">
      <div className="flex items-center gap-4">
        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 rounded hover:bg-gray-100"
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
          className="w-24 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoomLevel - 0.1) * 52.6}%, #e2e8f0 ${(zoomLevel - 0.1) * 52.6}%, #e2e8f0 100%)`
          }}
        />
        
        <button
          onClick={handleZoomIn}
          className="p-2 rounded hover:bg-gray-100"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />
        
        
        <div className="px-1">
          <DownloadControls />
        </div>
        
        <button
          onClick={handleFitView}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-200"
          title="Fit View"
        >
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24">
            <path d="M4 14v-4h4M4 10l5 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 14v-4h-4M20 10l-5 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 10v4h4M4 14l5-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 10v4h-4M20 14l-5-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-200"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-gray-600" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    </Panel>
  );
};

export default CustomControls;