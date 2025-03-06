import { Position, MarkerType } from 'reactflow';

const LINE_SPACING = 20;
const NODE_PADDING = 20;

// Helper to determine edge handle based on condition
const getNodeType = (node) => {
  const metadata = node?.data?.metadata || {};
  return metadata?.['L5 Step type2']?.toLowerCase() || 
         metadata?.['L4 Step type']?.toLowerCase() || 
         'normal';
};

const calculateEnhancedLayout = (nodes, edges, direction = 'TB') => {
  // Constants for layout calculation
  const REPULSION = 150;
  const ATTRACTION = 0.25;
  const EDGE_LENGTH = direction === 'TB' ? 350 : 350;
  const ITERATIONS = 106;
  const MIN_NODE_DISTANCE = direction === 'TB' ? 100 : 150;
  const NODE_WIDTH = 480;
  const NODE_HEIGHT = 220;

  const distance = (p1, p2) => Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
  );

  // Initialize node positions based on layout direction
  const initializeNodePositions = () => {
    const positions = new Map();
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const spacingX = direction === 'TB' ? NODE_WIDTH * 1.5 : EDGE_LENGTH;
    const spacingY = direction === 'TB' ? EDGE_LENGTH : NODE_HEIGHT * 1.5;
    
    nodes.forEach((node, index) => {
      if (node.position) {
        positions.set(node.id, {
          x: node.position.x + (Math.random() - 0.5) * 50,
          y: node.position.y + (Math.random() - 0.5) * 50
        });
      } else {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        positions.set(node.id, {
          x: direction === 'TB' 
            ? col * spacingX + (Math.random() - 0.5) * 50
            : row * spacingX + (Math.random() - 0.5) * 50,
          y: direction === 'TB'
            ? row * spacingY + (Math.random() - 0.5) * 50
            : col * spacingY + (Math.random() - 0.5) * 50
        });
      }
    });
    return positions;
  };

  const nodePositions = initializeNodePositions();
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  // Calculate node levels for hierarchical layout
  const calculateNodeLevels = () => {
    const levels = new Map();
    const visited = new Set();
    
    const getConnectedNodes = (nodeId) => {
      const outgoing = edges.filter(e => e.source === nodeId).map(e => e.target);
      const incoming = edges.filter(e => e.target === nodeId).map(e => e.source);
      return [...new Set([...outgoing, ...incoming])];
    };

    const calculateLevel = (nodeId, level = 0, visited = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      levels.set(nodeId, Math.max(level, levels.get(nodeId) || 0));
      
      edges.filter(edge => edge.source === nodeId)
           .forEach(edge => calculateLevel(edge.target, level + 1, visited));
    };

    nodes.forEach(node => {
      if (!visited.has(node.id) && getConnectedNodes(node.id).length > 0) {
        calculateLevel(node.id, 0, visited);
      }
    });

    return levels;
  };

  const nodeLevels = calculateNodeLevels();

  // Apply force-directed layout
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const forces = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));

    // Apply repulsion between nodes
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        const pos1 = nodePositions.get(node1.id);
        const pos2 = nodePositions.get(node2.id);
        const dist = distance(pos1, pos2);
        
        if (dist < MIN_NODE_DISTANCE) {
          const force = REPULSION * (MIN_NODE_DISTANCE / Math.max(dist, 1));
          const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
          const fx = force * Math.cos(angle);
          const fy = force * Math.sin(angle);

          forces.get(node1.id).x -= fx * 2;
          forces.get(node1.id).y -= fy * 2;
          forces.get(node2.id).x += fx * 2;
          forces.get(node2.id).y += fy * 2;
        }
      });
    });

    // Apply edge forces
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

    // Apply final position updates
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      const force = forces.get(node.id);
      const level = nodeLevels.get(node.id);

      // Apply direction-based constraints
      if (direction === 'TB') {
        const idealY = level * EDGE_LENGTH;
        force.y += (idealY - pos.y) * 0.2;
      } else {
        const idealX = level * EDGE_LENGTH;
        force.x += (idealX - pos.x) * 0.2;
      }

      const damping = 0.9 - (iteration / ITERATIONS) * 0.3;
      pos.x += force.x * damping;
      pos.y += force.y * damping;
    });
  }

  // Route edges and set positions
  const routeEdges = edges.map(edge => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    const sourceType = getNodeType(sourceNode);
    const targetType = getNodeType(targetNode);
    
    const isValidationNode = sourceType === 'validation';
    const isDistributionNode = sourceType === 'distribution';
    const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');

    // Determine positions based on layout direction and node type
    let sourcePosition, targetPosition;

    if (isValidationNode) {
      // Validation nodes maintain side outputs regardless of layout
      if (direction === 'TB') {
        sourcePosition = isNotFeasible ? Position.Left : Position.Right;
        targetPosition = Position.Top;
      } else {
        sourcePosition = isNotFeasible ? Position.Top : Position.Bottom;
        targetPosition = Position.Left;
      }
    } else if (isDistributionNode) {
      // Distribution nodes maintain bottom/right outputs
      sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
      targetPosition = direction === 'TB' ? Position.Top : Position.Left;
    } else {
      // Default node positions
      sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
      targetPosition = direction === 'TB' ? Position.Top : Position.Left;
    }

    // Debug log for edge routing
    console.log('Edge routing:', {
      source: edge.source,
      target: edge.target,
      sourceType,
      direction,
      sourcePosition,
      targetPosition,
      condition: edge.data?.condition
    });

    return {
      ...edge,
      sourcePosition,
      targetPosition,
      type: 'custom',
      data: {
        ...edge.data,
        animated: true,
        isNotFeasible
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: isNotFeasible ? '#ef4444' : '#2563eb'
      },
      style: {
        stroke: isNotFeasible ? '#ef4444' : '#2563eb'
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