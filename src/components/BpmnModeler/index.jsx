import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { ZoomIn, ZoomOut, RotateCw, Download, Move } from 'lucide-react';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

const BpmnViewer = ({ data }) => {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isPanning, setIsPanning] = useState(false);

  const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   id="sample-diagram"
                   targetNamespace="http://bpmn.io/schema/bpmn"
                   exporter="bpmn-js (https://demo.bpmn.io)"
                   exporterVersion="9.0.3">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;


 // Add custom styles to remove palette
 const customStyles = `
 .djs-palette { display: none !important; }
 .djs-container { overflow: auto !important; }
 .canvas { overflow: auto !important; }
 .bjs-powered-by { display: none !important; }
`;

// Add zoom controls
const handleZoom = (type) => {
 if (!modelerRef.current) return;

 const canvas = modelerRef.current.get('canvas');
 switch (type) {
   case 'in':
     canvas.zoom(canvas.zoom() + 0.1);
     break;
   case 'out':
     canvas.zoom(canvas.zoom() - 0.1);
     break;
   case 'fit':
     canvas.zoom('fit-viewport', 'auto');
     break;
   default:
     break;
 }
};

// Export SVG
const handleExport = async () => {
 if (!modelerRef.current) return;

 try {
   const { svg } = await modelerRef.current.saveSVG();
   
   // Create download link
   const blob = new Blob([svg], { type: 'image/svg+xml' });
   const url = window.URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = 'process-diagram.svg';
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   window.URL.revokeObjectURL(url);
 } catch (err) {
   console.error('Export error:', err);
   setError('Failed to export diagram');
 }
};


const getProcessName = (node) => {
  return node.attributes?.find(attr => 
    attr.key.includes('Process Name') || attr.key === 'processName'
  )?.value || node.id;
};

// Add styling options
const elementStyles = {
  task: {
    stroke: '#666',
    fill: '#fff',
    strokeWidth: 2
  },
  gateway: {
    stroke: '#666',
    fill: '#fff',
    strokeWidth: 2
  },
  event: {
    stroke: '#666',
    fill: '#fff',
    strokeWidth: 2
  },
  subprocess: {
    stroke: '#888',
    fill: '#f8f8f8',
    strokeWidth: 2
  }
};

useEffect(() => {
  let mounted = true;

  const initializeBpmn = async () => {
    try {
      
          // Add custom styles to head
          const styleSheet = document.createElement('style');
          styleSheet.textContent = customStyles;
          document.head.appendChild(styleSheet);    
      
          const modeler = new BpmnModeler({
            container: containerRef.current,
            keyboard: { bindTo: document },
            // Disable default modules we don't want
            additionalModules: [{
              paletteProvider: ['value', {}],  // Disable palette
            }]
          });

      // Store element references for connections
      const elementMap = new Map();

      modelerRef.current = modeler;
      await modeler.importXML(emptyBpmn);

      if (!mounted) return;

      const canvas = modeler.get('canvas');
      const modeling = modeler.get('modeling');
      const elementRegistry = modeler.get('elementRegistry');
      const processElement = elementRegistry.get('Process_1');

      // Clear existing start event
      const existingStartEvent = elementRegistry.get('StartEvent_1');
      if (existingStartEvent) {
        modeling.removeShape(existingStartEvent);
      }

      // Helper functions
      const getHyphenCount = (id) => (id.match(/-/g) || []).length;
      const isProcessNode = (id) => getHyphenCount(id) === 4;
      const isChildNode = (potentialChild, parentId) => 
        potentialChild.startsWith(parentId + '-') && 
        getHyphenCount(potentialChild) === getHyphenCount(parentId) + 1;

      if (data) {
        const allNodes = Array.from(data.values()).flat();
        const processNodes = allNodes.filter(node => isProcessNode(node.id));
        let yOffset = 150; // Increased initial offset

        // First pass: Create all elements and store references
        for (const processNode of processNodes) {
          const children = allNodes.filter(node => 
            isChildNode(node.id, processNode.id)
          );

          // Calculate sizes with more spacing
          const subprocessWidth = Math.max(children.length * 200 + 200, 600);
          const subprocessHeight = 300; // Increased height

          // Create subprocess
          const subprocess = modeling.createShape(
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            },
            {
              x: 400, // Centered position
              y: yOffset,
              width: subprocessWidth,
              height: subprocessHeight
            },
            processElement
          );

          // Apply subprocess styling
          modeling.updateProperties(subprocess, {
            name: getProcessName(processNode),
            ...elementStyles.subprocess
          });

          // Create start event
          const startEvent = modeling.createShape(
            { type: 'bpmn:StartEvent' },
            { x: 100, y: subprocessHeight/2 },
            subprocess
          );
          elementMap.set('start_' + processNode.id, startEvent);

          let previousElement = startEvent;
          let xOffset = 250; // Increased initial x-offset

          // Create child elements
          for (const child of children) {
            let elementType = 'bpmn:Task';
            let elementWidth = 120;
            let elementHeight = 80;
            
            if (child.relationships?.some(r => r.type === 'Validation')) {
              elementType = 'bpmn:ExclusiveGateway';
              elementWidth = 50;
              elementHeight = 50;
            } else if (child.relationships?.some(r => r.type === 'Distribution')) {
              elementType = 'bpmn:IntermediateThrowEvent';
              elementWidth = 40;
              elementHeight = 40;
            }

            const element = modeling.createShape(
              { type: elementType },
              { 
                x: xOffset, 
                y: subprocessHeight/2,
                width: elementWidth,
                height: elementHeight
              },
              subprocess
            );

            // Store element reference
            elementMap.set(child.id, element);

            // Apply styling based on type
            let style = elementStyles.task;
            if (elementType === 'bpmn:ExclusiveGateway') {
              style = elementStyles.gateway;
            } else if (elementType === 'bpmn:IntermediateThrowEvent') {
              style = elementStyles.event;
            }

            modeling.updateProperties(element, {
              name: getProcessName(child),
              ...style
            });

            // Connect to previous element
            modeling.connect(previousElement, element);

            previousElement = element;
            xOffset += 200; // Increased spacing between elements
          }

          // Add end event
          const endEvent = modeling.createShape(
            { type: 'bpmn:EndEvent' },
            { x: xOffset, y: subprocessHeight/2 },
            subprocess
          );
          elementMap.set('end_' + processNode.id, endEvent);

          // Connect last element to end event
          modeling.connect(previousElement, endEvent);

          yOffset += subprocessHeight + 150; // Increased vertical spacing
        }

        // Second pass: Add relationship connections
        allNodes.forEach(node => {
          if (node.relationships) {
            node.relationships.forEach(rel => {
              if (rel.successor) {
                const sourceElement = elementMap.get(node.id);
                const targetElement = elementMap.get(rel.successor);

                if (sourceElement && targetElement) {
                  const connection = modeling.connect(sourceElement, targetElement);
                  
                  // Style connection based on type
                  const connectionStyle = {
                    type: rel.type === 'Validation' ? 'bpmn:SequenceFlow' : 'bpmn:MessageFlow',
                    ...elementStyles.connection
                  };
                  
                  modeling.updateProperties(connection, {
                    name: rel.condition || rel.type,
                    ...connectionStyle
                  });
                }
              }
            });
          }

          // Check for predecessor connections
          if (node.relationships?.some(r => r.predecessor)) {
            node.relationships
              .filter(r => r.predecessor)
              .forEach(rel => {
                const sourceElement = elementMap.get(rel.predecessor);
                const targetElement = elementMap.get(node.id);

                if (sourceElement && targetElement) {
                  const connection = modeling.connect(sourceElement, targetElement);
                  modeling.updateProperties(connection, {
                    name: rel.condition || rel.type,
                    ...elementStyles.connection
                  });
                }
              });
          }
        });

        // Fit the viewport and adjust zoom
        canvas.zoom('fit-viewport', 'auto');
        
        // Add interaction handlers
        const eventBus = modeler.get('eventBus');
        
        // Hover effect
        eventBus.on('element.hover', (e) => {
          const { element } = e;
          if (element.type !== 'bpmn:SubProcess') {
            modeling.setColor(element, {
              stroke: '#3b82f6',
              fill: '#eff6ff'
            });
          }
        });

        // Mouse leave effect
        eventBus.on('element.out', (e) => {
          const { element } = e;
          if (element.type !== 'bpmn:SubProcess') {
            const style = elementStyles[element.type === 'bpmn:Task' ? 'task' : 
                         element.type === 'bpmn:ExclusiveGateway' ? 'gateway' : 'event'];
            modeling.setColor(element, style);
          }
        });

        // Click handler
        eventBus.on('element.click', (e) => {
          const { element } = e;
          console.log('Clicked element:', element);
          // Add your click handling logic here
        });
      }
        
      
        // Add pan handling
        let isPanning = false;
        let lastX, lastY;

        containerRef.current.addEventListener('mousedown', (e) => {
          if (e.button === 1 || (e.button === 0 && e.altKey)) {
            isPanning = true;
            lastX = e.clientX;
            lastY = e.clientY;
            setIsPanning(true);
            e.preventDefault();
          }
        });

        window.addEventListener('mousemove', (e) => {
          if (isPanning) {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const viewbox = canvas.viewbox();
            canvas.viewbox({
              x: viewbox.x - dx * viewbox.scale,
              y: viewbox.y - dy * viewbox.scale,
              width: viewbox.width,
              height: viewbox.height
            });
            lastX = e.clientX;
            lastY = e.clientY;
          }
        });

        window.addEventListener('mouseup', () => {
          isPanning = false;
          setIsPanning(false);
        });
             // Add node overlap prevention
             const overlayPadding = 10;
             const preventOverlap = (elements) => {
               elements.forEach(element => {
                 if (element.type === 'bpmn:SubProcess') {
                   const bounds = element.bounds;
                   const overlapping = elements.filter(other => 
                     other !== element && 
                     other.type === 'bpmn:SubProcess' &&
                     !(bounds.x + bounds.width + overlayPadding < other.bounds.x ||
                       bounds.x > other.bounds.x + other.bounds.width + overlayPadding ||
                       bounds.y + bounds.height + overlayPadding < other.bounds.y ||
                       bounds.y > other.bounds.y + other.bounds.height + overlayPadding)
                   );
     
                   if (overlapping.length) {
                     modeling.moveShape(element, {
                       x: 0,
                       y: overlayPadding + Math.max(...overlapping.map(o => o.bounds.y + o.bounds.height)) - bounds.y
                     });
                   }
                 }
               });
             };
      // Clean up event listeners
        return () => {
          window.removeEventListener('mousemove', null);
          window.removeEventListener('mouseup', null);
          document.head.removeChild(styleSheet);
        };

    } catch (err) {
      console.error('BPMN modeling error:', err);
      if (mounted) {
        setError('Failed to create BPMN diagram');
      }
    }
  };

  
  initializeBpmn();

  return () => {
    mounted = false;
    if (modelerRef.current) {
      modelerRef.current.destroy();
    }
  };
}, [data]);

return (
  <div className="bg-white p-4 rounded-lg shadow-lg">
    {/* Controls */}
    <div className="mb-4 flex justify-between items-center">
      <div className="flex space-x-2">
        {isPanning ? (
          <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md">
            Panning Mode
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Hold Alt + Left Click to pan
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom('fit')}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Fit to View"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <button
          onClick={handleExport}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Export as SVG"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Error display */}
    {error && (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )}

    {/* BPMN container */}
    <div 
      ref={containerRef}
      className="border rounded-lg overflow-auto"
      style={{ 
        height: 'calc(100vh - 200px)',
        cursor: isPanning ? 'move' : 'default'
      }}
    />
  </div>
);
};

export default BpmnViewer;