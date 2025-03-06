import { Position } from 'reactflow';

const calculateEnhancedLayout = (nodes, edges) => {
  // Constants for force-directed layout
  const REPULSION = 1000;  // Force between nodes
  const ATTRACTION = 0.3; // Force along edges
  const EDGE_LENGTH = 300; // Desired edge length
  const ITERATIONS = 1000;   // Number of iterations for force calculation
  
  // Helper function to calculate distance between points
  const distance = (p1, p2) => Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
  );

  // Initialize node positions if not set
  const nodePositions = new Map(
    nodes.map(node => [
      node.id,
      node.position || {
        x: Math.random() * 1000,
        y: Math.random() * 1000
      }
    ])
  );

  // Create a map for quick node lookups
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  // Calculate node levels (for hierarchical constraints)
  const nodeLevels = new Map();
  const visited = new Set();
  const incomingEdges = new Map(
    nodes.map(node => [node.id, edges.filter(e => e.target === node.id)])
  );

  // Calculate node levels using topological sort
  const calculateLevels = (nodeId, level = 0) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    nodeLevels.set(nodeId, Math.max(level, nodeLevels.get(nodeId) || 0));
    
    edges
      .filter(edge => edge.source === nodeId)
      .forEach(edge => calculateLevels(edge.target, level + 1));
  };

  // Find root nodes and calculate levels
  nodes
    .filter(node => !edges.some(e => e.target === node.id))
    .forEach(node => calculateLevels(node.id));

  // Force-directed layout algorithm with constraints
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const forces = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));

    // Calculate repulsive forces between nodes
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        const pos1 = nodePositions.get(node1.id);
        const pos2 = nodePositions.get(node2.id);
        const dist = distance(pos1, pos2);
        
        if (dist < 1) return; // Prevent division by zero

        const force = REPULSION / (dist * dist);
        const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
        const fx = force * Math.cos(angle);
        const fy = force * Math.sin(angle);

        forces.get(node1.id).x -= fx;
        forces.get(node1.id).y -= fy;
        forces.get(node2.id).x += fx;
        forces.get(node2.id).y += fy;
      });
    });

    // Calculate attractive forces along edges
    edges.forEach(edge => {
      const sourcePos = nodePositions.get(edge.source);
      const targetPos = nodePositions.get(edge.target);
      const dist = distance(sourcePos, targetPos);
      
      const force = (dist - EDGE_LENGTH) * ATTRACTION;
      const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
      const fx = force * Math.cos(angle);
      const fy = force * Math.sin(angle);

      forces.get(edge.source).x += fx;
      forces.get(edge.source).y += fy;
      forces.get(edge.target).x -= fx;
      forces.get(edge.target).y -= fy;
    });

    // Apply forces with constraints
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      const force = forces.get(node.id);
      const level = nodeLevels.get(node.id);

      // Apply hierarchical constraints
      const verticalPosition = level * EDGE_LENGTH;
      const verticalForce = (verticalPosition - pos.y) * 0.1;
      force.y += verticalForce;

      // Update positions with damping
      const damping = 0.9;
      pos.x += force.x * damping;
      pos.y += force.y * damping;
    });
  }

  // Helper to determine node type
  const getNodeType = (node) => {
    const metadata = node?.data?.metadata || {};
    return metadata?.['L5 Step type2']?.toLowerCase() || 
           metadata?.['L4 Step type']?.toLowerCase() || 
           'normal';
  };

  // Add edge routing to prevent overlaps
  const routeEdges = edges.map(edge => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    // Determine source and target positions based on node types
    const sourceType = getNodeType(sourceNode);
    const targetType = getNodeType(targetNode);

    let sourcePosition = Position.Bottom;  // Default for normal nodes
    let targetPosition = Position.Top;     // Default for normal nodes

    // Special handling for validation nodes
    if (sourceType === 'validation' ||  sourceType === 'distribution') {
      const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');
      sourcePosition = isNotFeasible ? Position.Left : Position.Right;
    }
    
    // Calculate other edge properties
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const midPoint = {
      x: sourcePos.x + dx * 0.5,
      y: sourcePos.y + dy * 0.5
    };

    // Edge bundling logic
    const parallelEdges = edges.filter(e =>
      (e.source === edge.source && e.target === edge.target) ||
      (e.source === edge.target && e.target === edge.source)
    );
    
    const edgeIndex = parallelEdges.indexOf(edge);
    const offset = parallelEdges.length > 1 
      ? (edgeIndex - (parallelEdges.length - 1) / 2) * 30
      : 0;

    const controlPoint = {
      x: midPoint.x - dy * 0.2 + (offset * Math.cos(Math.atan2(dy, dx) + Math.PI/2)),
      y: midPoint.y + dx * 0.2 + (offset * Math.sin(Math.atan2(dy, dx) + Math.PI/2))
    };

    return {
      ...edge,
      sourcePosition,
      targetPosition,
      data: {
        ...edge.data,
        controlPoint
      }
    };
  });

  return {
    nodes: nodes.map(node => ({
      ...node,
      position: nodePositions.get(node.id)
    })),
    edges: routeEdges
  };
};

export default calculateEnhancedLayout;