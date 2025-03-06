import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const KnowledgeGraph = ({ data = null }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data) return;

    const width = 960;
    const height = 600;

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    // Create the force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Process the data
    const nodes = Array.from(data.keys()).map(id => ({ id }));
    const links = [];
    
    data.forEach((children, parentId) => {
      children.forEach(child => {
        links.push({
          source: parentId,
          target: child.id,
          type: child.relationships?.[0]?.type || 'default'
        });
      });
    });

    // Create the links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'Validation' ? '#3B82F6' : 
                          d.type === 'Distribution' ? '#10B981' : '#9CA3AF')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.type === 'Validation' ? '5,5' : null);

    // Create the nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 8)
      .attr('fill', '#fff')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5);

    // Add labels to nodes
    node.append('text')
      .attr('x', 12)
      .attr('y', '.31em')
      .text(d => d.id)
      .clone(true).lower()
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Update positions on tick
    simulation.nodes(nodes).on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    simulation.force('link').links(links);

    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <svg
        ref={svgRef}
        className="w-full h-[calc(100vh-12rem)]"
      />
    </div>
  );
};

export default KnowledgeGraph;