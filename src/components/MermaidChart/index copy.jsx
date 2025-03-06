import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const MermaidChart = ({ data }) => {
  const mermaidRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize mermaid
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          curve: 'basis',
          padding: 20,
          nodeSpacing: 50,
          rankSpacing: 50,
          htmlLabels: true,
          diagramPadding: 8
        }
      });
      setIsInitialized(true);
    } catch (err) {
      console.error('Mermaid initialization error:', err);
      setError('Failed to initialize diagram renderer');
    }
  }, []);

  // Helper function to get parent group ID
  const getParentGroupId = (nodeId) => {
    const parts = nodeId.split('-');
    if (parts.length > 4) {
      return parts.slice(0, 5).join('-'); // Get base process ID (e.g., JIN-NIC-P2B-NPD-01)
    }
    return null;
  };

  // Helper function to sort nodes
  const sortNodes = (nodes) => {
    return nodes.sort((a, b) => {
      const aNum = parseInt(a.id.split('-').pop());
      const bNum = parseInt(b.id.split('-').pop());
      return aNum - bNum;
    });
  };

  // Generate diagram definition
  const generateMermaidDef = () => {
    if (!data) return '';
  
    try {
      let def = 'graph TD\n\n';
  
      // Helper functions
      const getHyphenCount = (id) => (id.match(/-/g) || []).length;
      const isProcessNode = (id) => getHyphenCount(id) === 4;
      const isChildNode = (potentialChild, parentId) => 
        potentialChild.startsWith(parentId + '-') && 
        getHyphenCount(potentialChild) === getHyphenCount(parentId) + 1;
  
      // Get all nodes in a flat array
      const allNodes = Array.from(data.values()).flat();
  
      // Find process nodes (nodes with 4 hyphens)
      const processNodes = allNodes.filter(node => isProcessNode(node.id));
  
      // Build hierarchy map
      const buildHierarchy = (nodes) => {
        const hierarchy = new Map();
  
        nodes.forEach(node => {
          // Find children for this node
          const children = allNodes.filter(potentialChild => 
            isChildNode(potentialChild.id, node.id)
          );
  
          if (children.length > 0) {
            hierarchy.set(node, children);
          }
        });
  
        return hierarchy;
      };
  
      // Build the hierarchy for process nodes and their children
      const processHierarchy = buildHierarchy(processNodes);
      let subgraphIndex = 0;
  
      // Generate Mermaid code for each process and its children
      processHierarchy.forEach((children, processNode) => {
        // Get process name
        const processName = processNode.attributes?.find(attr => 
          attr.key.includes('Process Name') || attr.key === 'processName'
        )?.value || processNode.id;
  
        def += `    subgraph SG_${subgraphIndex}[${processName}]\n`;
  
        // Add nodes
        children.forEach(child => {
          const childName = child.attributes?.find(attr => 
            attr.key.includes('Process Name') || attr.key === 'processName'
          )?.value || child.id;
  
          def += `        ${child.id}["${childName}"]\n`;
        });
  
        def += '\n        %% Internal flows\n';
  
        // Add connections between children
        children.forEach(child => {
          if (child.relationships) {
            child.relationships.forEach(rel => {
              if (rel.successor && children.some(c => c.id === rel.successor)) {
                const connectionLabel = rel.condition || rel.type;
                def += `        ${child.id} -->|${connectionLabel}| ${rel.successor}\n`;
              }
            });
          }
        });
  
        def += '    end\n\n';
  
        // Check if any child is a parent in another subgraph
        children.forEach(child => {
          const childHierarchy = buildHierarchy([child]);
          if (childHierarchy.size > 0) {
            childHierarchy.forEach((grandChildren, childNode) => {
              subgraphIndex++;
              const childProcessName = childNode.attributes?.find(attr => 
                attr.key.includes('Process Name') || attr.key === 'processName'
              )?.value || childNode.id;
  
              def += `    subgraph SG_${subgraphIndex}[${childProcessName}]\n`;
  
              // Add grandchildren nodes
              grandChildren.forEach(grandChild => {
                const grandChildName = grandChild.attributes?.find(attr => 
                  attr.key.includes('Process Name') || attr.key === 'processName'
                )?.value || grandChild.id;
  
                def += `        ${grandChild.id}["${grandChildName}"]\n`;
              });
  
              def += '\n        %% Internal flows\n';
  
              // Add connections between grandchildren
              grandChildren.forEach(grandChild => {
                if (grandChild.relationships) {
                  grandChild.relationships.forEach(rel => {
                    if (rel.successor && grandChildren.some(gc => gc.id === rel.successor)) {
                      const connectionLabel = rel.condition || rel.type;
                      def += `        ${grandChild.id} -->|${connectionLabel}| ${rel.successor}\n`;
                    }
                  });
                }
              });
  
              def += '    end\n\n';
            });
          }
        });
  
        subgraphIndex++;
      });
  
      // Add connections between subgraphs
      def += '    %% Process flow\n';
      for (let i = 0; i < subgraphIndex - 1; i++) {
        def += `    SG_${i} --> SG_${i + 1}\n`;
      }
  
      // Add styling
      def += `
      %% Styling
      classDef mainProcess fill:#ffffff,stroke:#333,stroke-width:2px;
      classDef subprocesses fill:#ffffff,stroke:#666,stroke-dasharray:5 5;
      classDef startNode fill:#9ff0a8,stroke:#333;
      classDef processNode fill:#ffffff,stroke:#333;
      classDef endNode fill:#ffa3a3,stroke:#333;
      classDef validationNode fill:#ffe0bd,stroke:#333;
  
      %% Apply styles
      class SG_0,SG_1 subprocesses\n`;
  
      // Apply node styles
      const allNodeIds = allNodes.map(node => node.id).join(',');
      if (allNodeIds) {
        def += `class ${allNodeIds} processNode\n`;
      }
  
      // Find and style validation nodes
      const validationNodes = allNodes
        .filter(node => 
          node.relationships?.some(r => 
            r.type === 'Validation' || r.condition?.includes('Feasible')
          )
        )
        .map(node => node.id)
        .join(',');
  
      if (validationNodes) {
        def += `class ${validationNodes} validationNode\n`;
      }
  
      return def;
  
    } catch (err) {
      console.error('Error generating diagram:', err);
      setError('Failed to generate diagram');
      return '';
    }
  };

  // Render diagram
  useEffect(() => {
    if (!isInitialized || !data) return;
    const renderDiagram = async () => {
      try {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = '';
          const diagramDiv = document.createElement('div');
          diagramDiv.className = 'mermaid';
          const mermaidcode=generateMermaidDef();
          console.log("mermaidRef",mermaidcode);
          diagramDiv.textContent = generateMermaidDef();
          mermaidRef.current.appendChild(diagramDiv);
            console.log(mermaidRef);
          await mermaid.run({
            nodes: [diagramDiv]
          });
          setError(null);
        }
      } catch (err) {
        
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [data, isInitialized]);

  // Zoom handlers
  const handleZoom = (factor) => {
    setZoom(prev => Math.min(Math.max(prev * factor, 0.5), 2));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      {/* Controls */}
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => handleZoom(1.1)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleZoom(0.9)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Reset Zoom"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Diagram Container */}
      <div className="overflow-auto border rounded-lg bg-gray-50" style={{ minHeight: '500px' }}>
        <div 
          ref={mermaidRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease',
            padding: '20px',
            minWidth: 'fit-content'
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#F3F4F6] border border-[#9CA3AF] rounded mr-2" />
            <span className="text-sm text-gray-600">Default Node</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#EFF6FF] border border-[#3B82F6] rounded mr-2" />
            <span className="text-sm text-gray-600">Validation Node</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#ECFDF5] border border-[#059669] rounded mr-2" />
            <span className="text-sm text-gray-600">Distribution Node</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded mr-2" />
            <span className="text-sm text-gray-600">Process Group</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidChart;