import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Download, 
    Maximize2, 
    Minimize2, 
    Search,
    ArrowDownToLine,
    ArrowRightToLine,
    Palette
  } from 'lucide-react';
  import { removeDuplicates, processExcelData, preprocessJSON, dataProcessing, processRelationships } from "../../lib/utils";
  
  const THEMES = {
    default: {
      name: 'Default',
      background: '#ffffff',
      primaryColor: '#475569',
      distribution: '#dcfce7',
      distributionBorder: '#166534',
      validation: '#eff6ff',
      validationBorder: '#1e40af',
      subprocess: '#f5f3ff',
      subprocessBorder: '#5b21b6',
      task: '#fff7ed',
      taskBorder: '#9a3412'
    },
    dark: {
      name: 'Dark',
      background: '#1e293b',
      primaryColor: '#e2e8f0',
      distribution: '#064e3b',
      distributionBorder: '#34d399',
      validation: '#1e3a8a',
      validationBorder: '#60a5fa',
      subprocess: '#3b0764',
      subprocessBorder: '#a855f7',
      task: '#431407',
      taskBorder: '#fb923c'
    },
    neutral: {
      name: 'Neutral',
      background: '#f8fafc',
      primaryColor: '#334155',
      distribution: '#f0fdf4',
      distributionBorder: '#166534',
      validation: '#f0f9ff',
      validationBorder: '#0369a1',
      subprocess: '#f5f3ff',
      subprocessBorder: '#6b21a8',
      task: '#fff7ed',
      taskBorder: '#9a3412'
    }
  };
const MermaidChart = ({ data, rawData } ) => {
    const mermaidRef = useRef(null);
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [direction, setDirection] = useState('TD');
    const [currentTheme, setCurrentTheme] = useState('default');
    const [showThemeMenu, setShowThemeMenu] = useState(false);
  
    // Initialize mermaid with updated settings
    useEffect(() => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          flowchart: {
            curve: 'basis',
            padding: 30,
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
    }, [currentTheme]);
  
    const getNodeType = (node) => {
      if (node.attributes?.stepType === 'Distribution') return 'distribution';
      if (node.attributes?.stepType === 'Validation') return 'validation';
      if (node.level === 'L4') return 'subprocess';
      if (node.level === 'L5') return 'task';
      return 'default';
    };
  
    const generateMermaidDef = () => {
      if (!data) return '';
        data=processRelationships(rawData);
      try {
        let def = `graph ${direction}\n\n`;
        const { nodes, relationships } = data;
        
        // Filter nodes to only L4 and L5
        const relevantNodes = nodes.filter(node => ['L4', 'L5'].includes(node.level));
        
        // Group L5 nodes by their L4 parent
        const l4Groups = new Map();
        const l4Nodes = relevantNodes.filter(node => node.level === 'L4');
        
        l4Nodes.forEach(l4Node => {
          const l5Nodes = relevantNodes.filter(node => {
            const parentRel = relationships.find(rel => 
              rel.type === 'parent-child' && 
              rel.target === node.id && 
              rel.source === l4Node.id
            );
            return parentRel !== undefined;
          });
          l4Groups.set(l4Node, l5Nodes);
        });
  
        // Generate subgraphs for each L4 process
        let subgraphCount = 0;
        l4Groups.forEach((l5Nodes, l4Node) => {
          const subgraphId = `subGraph${subgraphCount}`;
          def += `    subgraph ${subgraphId}["${l4Node.name}"]\n`;
          def += `        style ${subgraphId} fill:${THEMES[currentTheme].background},stroke:${THEMES[currentTheme].primaryColor},stroke-width:2px\n`;
  
          // Add L5 nodes within the subgraph
          l5Nodes.forEach(node => {
            const systemLabel = node.attributes?.system ? `<br/>[${node.attributes.system}]` : '';
            const actorLabel = node.attributes?.actor ? `<br/>(${node.attributes.actor})` : '';
            def += `        ${node.id}["${node.name}${systemLabel}${actorLabel}"]\n`;
          });
  
          // Add connections between L5 nodes within the same subgraph
          l5Nodes.forEach(sourceNode => {
            const successors = relationships.filter(rel => 
              rel.type === 'predecessor-successor' && 
              rel.source === sourceNode.id
            );
            
            successors.forEach(rel => {
              if (l5Nodes.some(n => n.id === rel.target)) {
                const linkStyle = rel.condition ? 
                  `-->|${rel.condition}|` : 
                  '-->';
                def += `        ${rel.source} ${linkStyle} ${rel.target}\n`;
              }
            });
          });
  
          def += '    end\n\n';
          subgraphCount++;
        });
  
        // Add connections between subgraphs
        relationships
          .filter(rel => rel.type === 'predecessor-successor')
          .forEach(rel => {
            const sourceL4 = l4Nodes.find(n => n.id === rel.source);
            const targetL4 = l4Nodes.find(n => n.id === rel.target);
            if (sourceL4 && targetL4) {
              def += `    subGraph${l4Nodes.indexOf(sourceL4)} --> subGraph${l4Nodes.indexOf(targetL4)}\n`;
            }
          });
  
        // Add styling based on current theme
        def += `
      %% Styling
      classDef default fill:${THEMES[currentTheme].background},stroke:${THEMES[currentTheme].primaryColor},stroke-width:1px;
      classDef distribution fill:${THEMES[currentTheme].distribution},stroke:${THEMES[currentTheme].distributionBorder},stroke-width:1px;
      classDef validation fill:${THEMES[currentTheme].validation},stroke:${THEMES[currentTheme].validationBorder},stroke-width:1px;
      classDef subprocess fill:${THEMES[currentTheme].subprocess},stroke:${THEMES[currentTheme].subprocessBorder},stroke-width:1px;
      classDef task fill:${THEMES[currentTheme].task},stroke:${THEMES[currentTheme].taskBorder},stroke-width:1px;
  
      %% Apply styles
      ${relevantNodes.map(node => `class ${node.id} ${getNodeType(node)}`).join('\n    ')}
        `;
  
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
            const mermaidCode = generateMermaidDef();
            diagramDiv.textContent = mermaidCode;
            mermaidRef.current.appendChild(diagramDiv);
            
            await mermaid.run({
              nodes: [diagramDiv]
            });
  
            const nodes = mermaidRef.current.querySelectorAll('.node');
            nodes.forEach(node => {
              node.style.cursor = 'pointer';
              node.addEventListener('click', () => {
                const nodeData = data.nodes.find(n => n.id === node.id);
                setSelectedNode(nodeData);
              });
            });
  
            setError(null);
          }
        } catch (err) {
          console.error('Mermaid rendering error:', err);
          setError('Failed to render diagram');
        }
      };
  
      renderDiagram();
    }, [data, isInitialized, searchTerm, direction, currentTheme]);
  
    const handleZoom = (factor) => {
      setZoom(prev => {
        const newZoom = Math.min(Math.max(prev * factor, 0.5), 2);
        return parseFloat(newZoom.toFixed(2));
      });
    };
  
    const toggleDirection = () => {
      setDirection(prev => prev === 'TD' ? 'LR' : 'TD');
    };
  
    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullScreen(true);
      } else {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    };
  
    const handleDownload = () => {
      const svg = mermaidRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'process_flow.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };
  
    return (
      <div 
        ref={containerRef} 
        className="bg-white p-4 rounded-lg shadow-lg"
        style={{
          backgroundColor: THEMES[currentTheme].background,
          color: THEMES[currentTheme].primaryColor
        }}
      >
        {/* Enhanced Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={() => handleZoom(1.1)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZoom(0.9)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-2" />
            
            {/* Direction Toggle */}
            <button
              onClick={toggleDirection}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={`Switch to ${direction === 'TD' ? 'Left-Right' : 'Top-Down'} Layout`}
            >
              {direction === 'TD' ? 
                <ArrowDownToLine className="w-5 h-5" /> : 
                <ArrowRightToLine className="w-5 h-5" />
              }
            </button>
  
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Change Theme"
              >
                <Palette className="w-5 h-5" />
              </button>
              
              {showThemeMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {Object.entries(THEMES).map(([themeKey, theme]) => (
                      <button
                        key={themeKey}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          currentTheme === themeKey ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setCurrentTheme(themeKey);
                          setShowThemeMenu(false);
                        }}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
  
            <div className="h-6 w-px bg-gray-200 mx-2" />
  
            {/* Other Controls */}
            <button
              onClick={toggleFullScreen}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Download SVG"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex gap-4">
        {/* Diagram Container */}
        <div className="flex-1 overflow-auto border rounded-lg" 
          style={{ 
            height: '700px',
            backgroundColor: THEMES[currentTheme].background,
            borderColor: THEMES[currentTheme].primaryColor 
          }}
        >
          <div 
            ref={mermaidRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-out',
              padding: '20px',
              minWidth: 'fit-content'
            }}
          />
        </div>

        {/* Details Panel */}
        {selectedNode && (
          <div 
            className="w-80 border-l p-4 overflow-y-auto" 
            style={{ 
              maxHeight: '700px',
              backgroundColor: THEMES[currentTheme].background,
              borderColor: THEMES[currentTheme].primaryColor,
              color: THEMES[currentTheme].primaryColor
            }}
          >
            <h3 className="font-medium text-lg mb-2">{selectedNode.name}</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Process ID: </span>
                <span>{selectedNode.processId}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Level: </span>
                <span>{selectedNode.level}</span>
              </div>
              {Object.entries(selectedNode.attributes || {}).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}: </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 border-t" style={{ borderColor: THEMES[currentTheme].primaryColor }}>
        <h3 className="text-sm font-medium mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{
              backgroundColor: THEMES[currentTheme].background,
              borderWidth: '2px',
              borderColor: THEMES[currentTheme].primaryColor
            }} />
            <span className="text-sm">Process Group</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{
              backgroundColor: THEMES[currentTheme].task,
              borderColor: THEMES[currentTheme].taskBorder,
              borderWidth: '1px'
            }} />
            <span className="text-sm">Task</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{
              backgroundColor: THEMES[currentTheme].distribution,
              borderColor: THEMES[currentTheme].distributionBorder,
              borderWidth: '1px'
            }} />
            <span className="text-sm">Distribution</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{
              backgroundColor: THEMES[currentTheme].validation,
              borderColor: THEMES[currentTheme].validationBorder,
              borderWidth: '1px'
            }} />
            <span className="text-sm">Validation</span>
          </div>
          {/* Display current layout direction */}
          <div className="flex items-center">
            <span className="text-sm">Layout: {direction === 'TD' ? 'Top-Down' : 'Left-Right'}</span>
          </div>
          {/* Display current theme */}
          <div className="flex items-center">
            <span className="text-sm">Theme: {THEMES[currentTheme].name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidChart;