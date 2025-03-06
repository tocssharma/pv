// src/components/KnowledgeGraph/index.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const KnowledgeGraph = ({ data = null }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const zoomRef = useRef(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Utility function to get process name
  const getProcessName = (nodeData) => {
    const processNameAttr = nodeData.attributes?.find(attr => 
      attr.key.includes('Process Name') || attr.key === 'processName'
    );
    return processNameAttr?.value || 'N/A';
  };

  // Position tooltip
  const positionTooltip = (event, tooltipElement) => {
    const padding = 10;
    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = event.pageX + padding;
    let top = event.pageY + padding;

    if (left + tooltipWidth > viewportWidth - padding) {
      left = event.pageX - tooltipWidth - padding;
    }

    if (top + tooltipHeight > viewportHeight - padding) {
      top = event.pageY - tooltipHeight - padding;
    }

    if (left < padding) {
      left = padding;
    }

    if (top < padding) {
      top = padding;
    }

    return { left, top };
  };

  // Show tooltip
  const showTooltip = (event, d) => {
    // If clicking the same node that's already selected, hide tooltip
    if (selectedNodeId === d.id && tooltipVisible) {
      hideTooltip();
      return;
    }

  const tooltip = d3.select(tooltipRef.current);
  setSelectedNodeId(d.id);
  setTooltipVisible(true);
    
  const groupedAttributes = d.attributes?.reduce((acc, attr) => {
    const category = attr.key.split(' ')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(attr);
    return acc;
  }, {}) || {};

  tooltip.html(`
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
      <div class="flex justify-between items-center bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div>
          <div class="font-bold text-lg text-gray-900">${d.id}</div>
          <div class="text-sm text-gray-600">${getProcessName(d)}</div>
        </div>
        <button class="close-tooltip p-1 hover:bg-gray-200 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
        
         <div class="px-4 py-3">
        <div class="mb-3">
          <div class="text-sm font-semibold text-gray-500 mb-1">Type</div>
          <span class="px-2 py-1 rounded-full text-sm ${
            d.type === 'validation' 
              ? 'bg-blue-100 text-blue-800' 
              : d.type === 'distribution'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }">
            ${d.type.charAt(0).toUpperCase() + d.type.slice(1)}
          </span>
        </div>


   ${Object.entries(groupedAttributes).map(([category, attrs]) => `
          <div class="mb-3">
            <div class="text-sm font-semibold text-gray-500 mb-1">${category}</div>
            <div class="space-y-1">
              ${attrs.map(attr => `
                <div class="bg-gray-50 px-3 py-2 rounded-md">
                  <div class="text-xs font-medium text-gray-500">${attr.key}</div>
                  <div class="text-sm text-gray-900">${attr.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      </div>
    `);

    tooltip.select('.close-tooltip')
    .on('click', (closeEvent) => {
      closeEvent.stopPropagation();
      hideTooltip();
    });

    const { left, top } = positionTooltip(event, tooltipRef.current);
    tooltip
      .style('visibility', 'visible')
      .style('left', `${left}px`)
      .style('top', `${top}px`);
  };

  // Hide tooltip
  const hideTooltip = () => {
    d3.select(tooltipRef.current)
      .style('visibility', 'hidden');
    setSelectedNodeId(null);
    setTooltipVisible(false);
  };

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  useEffect(() => {
    if (!data) return;

    try {
      const width = 960;
      const height = 600;
      const nodeRadius = 20;
      
      // Clear previous content
      d3.select(svgRef.current).selectAll("*").remove();

      // Create container with zoom support
      const svg = d3.select(svgRef.current)
        .attr('viewBox', [0, 0, width, height]);

      const g = svg.append('g');

      // Initialize zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      zoomRef.current = zoom;
      svg.call(zoom);

      // Add drop shadow filter
      const defs = svg.append('defs');
      defs.append('filter')
        .attr('id', 'drop-shadow')
        .attr('height', '130%')
        .append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 1)
        .attr('stdDeviation', 2)
        .attr('flood-color', '#000000')
        .attr('flood-opacity', 0.3);

      // Process data
      const nodes = [];
      const links = [];
      const nodeMap = new Map();

      // First pass: collect nodes
      data.forEach((children, parentId) => {
        if (!nodeMap.has(parentId)) {
          const nodeData = {
            id: parentId,
            type: 'default',
            group: 0,
            attributes: [],
            level: 0
          };
          nodes.push(nodeData);
          nodeMap.set(parentId, nodeData);
        }

        children.forEach(child => {
          if (!nodeMap.has(child.id)) {
            const nodeData = {
              id: child.id,
              group: child.group,
              type: child.relationships?.some(r => r.type === 'Validation') ? 'validation' :
                    child.relationships?.some(r => r.type === 'Distribution') ? 'distribution' :
                    'default',
              attributes: child.attributes || [],
              level: 1
            };
            nodes.push(nodeData);
            nodeMap.set(child.id, nodeData);
          }
        });
      });

      // Apply filters
      const filteredNodes = nodes.filter(node => {
        if (searchTerm && !node.id.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (filter !== 'all' && node.type !== filter) {
          return false;
        }
        return true;
      });

      // Create links
      data.forEach((children, parentId) => {
        if (filteredNodes.find(n => n.id === parentId)) {
          children.forEach(child => {
            if (filteredNodes.find(n => n.id === child.id)) {
              links.push({
                source: parentId,
                target: child.id,
                type: 'hierarchy'
              });

              if (child.relationships) {
                child.relationships.forEach(rel => {
                  if (rel.successor && nodeMap.has(rel.successor) &&
                      filteredNodes.find(n => n.id === rel.successor)) {
                    links.push({
                      source: child.id,
                      target: rel.successor,
                      type: rel.type,
                      condition: rel.condition
                    });
                  }
                });
              }
            }
          });
        }
      });

      // Force simulation
      const simulation = d3.forceSimulation(filteredNodes)
        .force('link', d3.forceLink(links)
          .id(d => d.id)
          .distance(150)
          .strength(1)
        )
        .force('charge', d3.forceManyBody()
          .strength(d => d.level === 0 ? -1000 : -500)
          .distanceMax(350)
        )
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(nodeRadius * 2.5))
        .alpha(1)
        .alphaDecay(0.05)
        .alphaMin(0.001);

      // Create links
      const link = g.append('g')
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('class', 'link')
        .attr('stroke', d => d.type === 'Validation' ? '#3B82F6' :
                            d.type === 'Distribution' ? '#059669' :
                            '#9CA3AF')
        .attr('stroke-width', d => d.type === 'hierarchy' ? 1 : 2)
        .attr('stroke-dasharray', d => d.type === 'Validation' ? '5,5' : null);

      // Create nodes
      const node = g.append('g')
        .selectAll('g')
        .data(filteredNodes)
        .join('g')
        .attr('class', 'node')
        .style('cursor', 'pointer')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
        );

      // Add node shapes
      node.each(function(d) {
        const el = d3.select(this);
        
        const shapeGroup = el.append('g')
          .attr('class', 'shape-group');

        if (d.type === 'validation') {
          shapeGroup.append('path')
            .attr('d', `M0,${-nodeRadius} L${nodeRadius},0 L0,${nodeRadius} L${-nodeRadius},0 Z`)
            .attr('class', 'node-shape')
            .attr('fill', '#EFF6FF')
            .attr('stroke', '#3B82F6')
            .attr('stroke-width', d.id === selectedNodeId ? 3 : 1.5);
        } else if (d.type === 'distribution') {
          shapeGroup.append('circle')
            .attr('r', nodeRadius)
            .attr('class', 'node-shape')
            .attr('fill', '#ECFDF5')
            .attr('stroke', '#059669')
            .attr('stroke-width', d.id === selectedNodeId ? 3 : 1.5);
        } else {
          shapeGroup.append('rect')
            .attr('x', -nodeRadius)
            .attr('y', -nodeRadius)
            .attr('width', nodeRadius * 2)
            .attr('height', nodeRadius * 2)
            .attr('rx', 4)
            .attr('class', 'node-shape')
            .attr('fill', '#F3F4F6')
            .attr('stroke', '#9CA3AF')
            .attr('stroke-width', d.id === selectedNodeId ? 3 : 1.5);
        }

        // Add labels
        shapeGroup.append('text')
          .attr('dy', nodeRadius + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', '#374151')
          .attr('font-size', '12px')
          .text(d.id);

        // Add click handler
        el.on('click', (event, datum) => {
            event.stopPropagation();
            showTooltip(event, datum);
          });
        });

      // Add click handler to background to close tooltip
      svg.on('click', (event) => {
        event.stopPropagation();
        hideTooltip();
      });

      // Update positions
      simulation.on('tick', () => {
        // Limit node movement within bounds
        filteredNodes.forEach(d => {
          d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
          d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
        });

        link.attr('d', d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 2;
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

      // Drag functions
      function dragstarted(event) {
        if (!event.active) {
          simulation.alphaTarget(0.1).restart();
        }
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) {
          simulation.alphaTarget(0);
        }
        // Keep nodes fixed after dragging
        // event.subject.fx = null;
        // event.subject.fy = null;
      }

      return () => {
        simulation.stop();
      };
    } catch (err) {
      setError(err.message);
      console.error('Error in KnowledgeGraph:', err);
    }
  }, [data, searchTerm, filter, selectedNodeId]);

  return (
    <div className="w-full h-full relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-4">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 border rounded-md text-sm"
            />
            <Search className="w-4 h-4 absolute left-2 top-3 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="validation">Validation</option>
            <option value="distribution">Distribution</option>
            <option value="default">Default</option>
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow p-2 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-100 rounded flex items-center justify-center"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph */}
      <svg
        ref={svgRef}
        className="w-full h-[calc(100vh-12rem)]"
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed pointer-events-auto z-50"
        style={{ 
          visibility: 'hidden',
          backgroundColor: 'white',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;