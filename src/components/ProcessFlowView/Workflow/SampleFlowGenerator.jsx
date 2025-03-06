import ProcessDataHandler from '../../../lib/dataHelper';
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize, Minimize, Move, ScanLine } from 'lucide-react';

const FlowGenerator = ({ data }) => {
    const [svgContent, setSvgContent] = useState('');
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef(null);
    const diagramRef = useRef(null);
    const contentRef = useRef(null);
  
    // Function to determine if a node is a decision point (has conditional outgoing edges)
    const isDecisionPoint = (nodeId, allNodes) => {
      // Check if this node has any outgoing edges with conditions
      return Object.values(allNodes).some(node => 
        node.relationships?.predecessors?.[0] === nodeId && 
        node.relationship['L8 Predesessor Condition']
      );
    };
  
    // Function to determine if a node is a branching point (has multiple outgoing connections)
    const isBranchingPoint = (nodeId, allNodes) => {
      // Count how many nodes have this node as a predecessor
      const outgoingConnections = Object.values(allNodes).filter(node => 
        node.relationships?.predecessors?.[0] === nodeId
      ).length;
      return outgoingConnections > 2; // Consider it a branching point if it has more than 2 outgoing connections
    };
  
    const generateMermaidDefinition = (processData) => {
      if (!processData?.children) return '';
      
      let definition = 'flowchart TD\n';
      const allNodes = processData.children;
      
      // Style definitions
      definition += `%% Node styles
      classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1px;
      classDef decision fill:#f1f5f9,stroke:#1e40af,stroke-width:2px;
      classDef branching fill:#fef2f2,stroke:#b91c1c,stroke-width:2px;
      linkStyle default stroke:#64748b,stroke-width:1px;
      \n`;
      
      // First pass: Create nodes with appropriate shapes
      Object.values(allNodes).forEach(node => {
        const shortId = node.id.split('-').pop();
        const name = node.name.replace(/&/g, 'and');
        
        // Format node text with HTML-like styling
        const nodeText = `<div style='text-align: center;'>
          <div style='font-weight: bold; color: #1e40af; font-size: 14px; padding: 4px;'>${node.id}</div>
          <hr style='border-top: 1px dashed #CBD5E1; margin: 4px 0;'/>
          <div style='font-size: 12px; color: #334155; padding: 4px;'>${name}</div>
        </div>`;
        
        if (isDecisionPoint(node.id, allNodes)) {
          // Diamond shape for decision points
          definition += `    ${shortId}{"${nodeText}"}\n`;
          definition += `    class ${shortId} decision\n`;
        } else if (isBranchingPoint(node.id, allNodes)) {
          // Circle shape for branching points
          definition += `    ${shortId}(("${nodeText}"))\n`;
          definition += `    class ${shortId} branching\n`;
        } else {
          // Rectangle for normal nodes
          definition += `    ${shortId}["${nodeText}"]\n`;
        }
      });
  
      // Second pass: Create connections
      Object.values(allNodes).forEach(node => {
        if (node.relationships?.predecessors) {
          const fromId = node.relationships.predecessors[0].split('-').pop();
          const toId = node.id.split('-').pop();
          const condition = node.relationship['L8 Predesessor Condition'];
          
          if (condition) {
            definition += `    ${fromId} -->|${condition}| ${toId}\n`;
          } else {
            definition += `    ${fromId} --> ${toId}\n`;
          }
        }
      });
  
      return definition;
    };

  // Calculate zoom to fit
  const calculateZoomToFit = () => {
    if (!containerRef.current || !contentRef.current) return 1;

    const containerWidth = containerRef.current.clientWidth - 40; // Accounting for padding
    const containerHeight = containerRef.current.clientHeight - 40;
    const contentWidth = contentRef.current.getBoundingClientRect().width;
    const contentHeight = contentRef.current.getBoundingClientRect().height;

    const widthRatio = containerWidth / contentWidth;
    const heightRatio = containerHeight / contentHeight;

    // Use the smaller ratio to ensure content fits both dimensions
    return Math.min(widthRatio, heightRatio, 1) * 0.9; // 0.9 to add some margin
  };

  // Handle zoom to fit
  const handleZoomToFit = () => {
    const newZoom = calculateZoomToFit();
    setZoom(newZoom);
    
    // Center the content
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const contentWidth = contentRef.current.getBoundingClientRect().width * newZoom;
      const contentHeight = contentRef.current.getBoundingClientRect().height * newZoom;

      setPosition({
        x: (containerWidth - contentWidth) / 2,
        y: (containerHeight - contentHeight) / 2
      });
    }
  };

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true
          }
        });

        const definition = generateMermaidDefinition(data.data);
        if (definition) {
          const { svg } = await mermaid.render('flow-diagram', definition);
          setSvgContent(svg);
          
          // Wait for the SVG to be rendered in the DOM
          setTimeout(() => {
            handleZoomToFit();
          }, 100);
        }
      } catch (error) {
        console.error('Error rendering diagram:', error);
      }
    };

    renderDiagram();
  }, [data]);

  // Recalculate zoom to fit when container size changes
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      handleZoomToFit();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
    
    // Recalculate zoom after fullscreen change
    setTimeout(handleZoomToFit, 100);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-6xl mx-auto p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        {/* Controls Panel */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 rounded">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-200 rounded"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-200 rounded"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 rounded"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button
            onClick={handleZoomToFit}
            className="p-2 hover:bg-gray-200 rounded"
            title="Zoom to Fit"
          >
            <ScanLine size={20} />
          </button>
          <div className="ml-2 text-sm text-gray-600">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#f9f9f9] border border-gray-300 mr-2"></div>
            <span>Normal Step</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#e3f2fd] border-2 border-[#1976d2] mr-2 rotate-45"></div>
            <span>Decision Point</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#fff3e0] border-2 border-[#f57c00] mr-2 rounded-full"></div>
            <span>Branching Point</span>
          </div>
        </div>

        {/* Diagram Container */}
        <div 
          ref={diagramRef}
          className="overflow-hidden relative"
          style={{
            height: isFullscreen ? '90vh' : '600px'
          }}
        >
          <div
            ref={contentRef}
            className="cursor-move absolute"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s'
            }}
            onMouseDown={handleMouseDown}
          >
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          </div>
        </div>
      </div>
    </div>
  );
};
// Example usage with sample data
const SampleFlowGenerator = (data) => {
  const sampleData = {
    edges: [
      {
        from: "JCB-HOM-PLM-PRC-01-03-01-01-01",
        to: "JCB-HOM-PLM-PRC-01-03-01-01-02"
      },
      {
        from: "JCB-HOM-PLM-PRC-01-03-01-01-02",
        to: "JCB-HOM-PLM-PRC-01-03-01-01-03",
        condition: "No"
      },
      {
        from: "JCB-HOM-PLM-PRC-01-03-01-01-02",
        to: "JCB-HOM-PLM-PRC-01-03-01-01-04",
        condition: "Yes"
      },
      // ... rest of the edges
    ],
    layoutDirection: "TB"
  };
  console.log("SampleFlowGenerator:data", data);
  console.log("SampleFlowGenerator:data.data", data.data);
  if (data) {
    const flow = ProcessDataHandler.getProcessFlow(data.data);
    console.log("SampleFlowGenerator:flow", flow);

    //data = { edges: flow.edges, layoutDirection: "TB"; }
        return <FlowGenerator data={data} />;
    }
  else {return null}
 

};

export default SampleFlowGenerator;