import { Position, MarkerType } from 'reactflow';
import {
  lineIntersectsRect,
  findIntersectionPoints,
  getNodeRect,
  LINE_SPACING,
  NODE_PADDING
} from './EdgeRoutingUtilities';

const routeEdgeAroundNodes = (edge, sourcePos, targetPos, nodes, nodeMap) => {
  const intersectingNodes = nodes.filter(node => {
    if (node.id === edge.source || node.id === edge.target) return false;
    const rect = getNodeRect(node);
    return lineIntersectsRect(
      sourcePos.x, sourcePos.y,
      targetPos.x, targetPos.y,
      rect
    );
  });

  if (intersectingNodes.length === 0) {
    return [sourcePos, targetPos];
  }

  // Sort nodes by distance from source
  intersectingNodes.sort((a, b) => {
    const distA = Math.hypot(
      a.position.x - sourcePos.x,
      a.position.y - sourcePos.y
    );
    const distB = Math.hypot(
      b.position.x - sourcePos.x,
      b.position.y - sourcePos.y
    );
    return distA - distB;
  });

  // Create route points array
  const routePoints = [sourcePos];
  
  intersectingNodes.forEach(node => {
    const rect = getNodeRect(node);
    const prevPoint = routePoints[routePoints.length - 1];
    const nextPoint = routePoints.length === 1 ? targetPos : routePoints[routePoints.length - 2];

    // Determine which side to route around
    const nodeCenterX = rect.x + rect.width / 2;
    const nodeCenterY = rect.y + rect.height / 2;
    
    // Calculate if we should go left/right or up/down
    const goHorizontal = Math.abs(targetPos.x - sourcePos.x) > Math.abs(targetPos.y - sourcePos.y);
    
    if (goHorizontal) {
      // Route horizontally around node
      const goLeft = prevPoint.x > nodeCenterX;
      const x = goLeft ? rect.x - NODE_PADDING : rect.x + rect.width + NODE_PADDING;
      
      routePoints.push(
        { x, y: prevPoint.y },
        { x, y: targetPos.y }
      );
    } else {
      // Route vertically around node
      const goUp = prevPoint.y > nodeCenterY;
      const y = goUp ? rect.y - NODE_PADDING : rect.y + rect.height + NODE_PADDING;
      
      routePoints.push(
        { x: prevPoint.x, y },
        { x: targetPos.x, y }
      );
    }
  });

  routePoints.push(targetPos);

  // Simplify route by removing unnecessary points
  return simplifyRoute(routePoints);
};

const COLUMN_MAPPINGS = {
  L4: 'L4 Step type',
  L5: 'L5 Step type2',
  L6: 'L6 Step type2',
  L7: 'L7 Step type2',
  L8: 'L8 Step type'
};
// Simplify route by removing unnecessary bends
const simplifyRoute = (points) => {
  if (points.length <= 2) return points;
  
  const result = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    // If current point doesn't create a significant change in direction, skip it
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    
    if (Math.abs(angle1 - angle2) > 0.1) {
      result.push(curr);
    }
  }
  
  result.push(points[points.length - 1]);
  return result;
};


export const calculateEnhancedLayout = (nodes, edges, direction = 'TB') => {
  // Adjusted constants for better spacing
  const REPULSION = 150;
  const ATTRACTION = 0.25;
  const EDGE_LENGTH = direction === 'TB' ? 250 : 250; // Increased for LR layout
  const ITERATIONS = 106;
  const MIN_NODE_DISTANCE = direction === 'TB' ? 35 : 35;
  const NODE_WIDTH = 480;
  const NODE_HEIGHT = 220;

  
  const distance = (p1, p2) => {
    if (!p1 || !p2) {
      console.error('Invalid points in distance calculation:', { p1, p2 });
      return Infinity; // Return a safe default
    }
    if (typeof p1.x !== 'number' || typeof p1.y !== 'number' || 
        typeof p2.x !== 'number' || typeof p2.y !== 'number') {
      console.error('Invalid coordinates:', { p1, p2 });
      return Infinity;
    }
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

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

  // Calculate node levels with direction support
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

    nodes.forEach(node => {
      if (!levels.has(node.id)) {
        let nearestDist = Infinity;
        let nearestLevel = 0;
        
        nodes.forEach(otherNode => {
          if (levels.has(otherNode.id)) {
            const dist = distance(
              nodePositions.get(node.id),
              nodePositions.get(otherNode.id)
            );
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestLevel = levels.get(otherNode.id);
            }
          }
        });
        
        levels.set(node.id, nearestLevel + 1);
      }
    });

    return levels;
  };

  const nodeLevels = calculateNodeLevels();

  // Force-directed layout with direction support
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const forces = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));

    // Apply repulsion forces
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
        } else {
          const force = REPULSION / (dist * dist);
          const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
          const fx = force * Math.cos(angle);
          const fy = force * Math.sin(angle);

          forces.get(node1.id).x -= fx;
          forces.get(node1.id).y -= fy;
          forces.get(node2.id).x += fx;
          forces.get(node2.id).y += fy;
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

    // Apply forces with direction-based constraints
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      const force = forces.get(node.id);
      const level = nodeLevels.get(node.id);

      // Apply directional constraints
      if (direction === 'TB') {
        const idealY = level * EDGE_LENGTH;
        const verticalForce = (idealY - pos.y) * 0.2;
        force.y += verticalForce;
      } else {
        const idealX = level * EDGE_LENGTH;
        const horizontalForce = (idealX - pos.x) * 0.2;
        force.x += horizontalForce;
      }

      // Apply level-based spreading force
      nodes.forEach(otherNode => {
        if (node.id !== otherNode.id && nodeLevels.get(otherNode.id) === level) {
          const otherPos = nodePositions.get(otherNode.id);
          if (direction === 'TB') {
            const horizontalDist = Math.abs(pos.x - otherPos.x);
            if (horizontalDist < NODE_WIDTH * 1.5) {
              force.x += pos.x < otherPos.x ? -10 : 10;
            }
          } else {
            const verticalDist = Math.abs(pos.y - otherPos.y);
            if (verticalDist < NODE_HEIGHT * 1.5) {
              force.y += pos.y < otherPos.y ? -10 : 10;
            }
          }
        }
      });

      const damping = 0.9 - (iteration / ITERATIONS) * 0.3;
      pos.x += force.x * damping;
      pos.y += force.y * damping;
    });
  }


  const findStepType = (metadata) => {
    if (!metadata) return "";
    const stepTypeKey = Object.keys(metadata).find(key => key.includes('Step type'));
    return metadata[stepTypeKey]?.toLowerCase() || "";
  };
  // Update edge routing based on direction
  const getNodeType = (node) => {
    const metadata = node?.data?.metadata || {};
    return findStepType(metadata)  || 'normal';
  };

  const routeEdges = edges.map(edge => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    const sourceType = getNodeType(sourceNode);
    const isValidationNode = sourceType === 'validation';
    const isDistributionNode = sourceType === 'distribution';
    const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');
      

    // Determine positions based on layout direction
    let sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
    let targetPosition = direction === 'TB' ? Position.Top : Position.Left;

// For validation nodes, adjust positions based on condition
if (isValidationNode) {
  if (direction === 'TB') {
    sourcePosition = isNotFeasible ? Position.Left : Position.Right;
    targetPosition = Position.Top;
  } else {
    sourcePosition = isNotFeasible ? Position.Top : Position.Bottom;
    targetPosition = Position.Left;
  }
} else if (isDistributionNode) {
  // Distribution nodes should maintain consistent output direction
  sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
  targetPosition = direction === 'TB' ? Position.Top : Position.Left;
}
   
      
  const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const midPoint = {
      x: sourcePos.x + dx * 0.5,
      y: sourcePos.y + dy * 0.5
    };

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
      type: 'custom',
      data: {
        ...edge.data,
        controlPoint,
        condition: edge.condition || edge.data?.condition,
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

 export const calculateProcessLayout = (nodes, edges, direction = 'TB') => {
  console.log("calculateProcessLayout");
  // Step 1: Assign Layers
  const assignLayers = () => {
    const ranks = new Map();
    const visited = new Set();
    
    const findLongestPath = (nodeId, currentRank = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      ranks.set(nodeId, Math.max(currentRank, ranks.get(nodeId) || 0));
      
      // Get all outgoing edges
      const outgoing = edges.filter(e => e.source === nodeId);
      outgoing.forEach(edge => {
        findLongestPath(edge.target, currentRank + 1);
      });
    };
    
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    // Start from each root node
    rootNodes.forEach(node => findLongestPath(node.id));
    
    // Handle cycles and disconnected components
    nodes.forEach(node => {
      if (!ranks.has(node.id)) {
        findLongestPath(node.id);
      }
    });
    
    return ranks;
  };

  // Step 2: Order nodes within layers to minimize crossings
  const orderNodesInLayers = (ranks) => {
    const layers = new Map();
    ranks.forEach((rank, nodeId) => {
      if (!layers.has(rank)) {
        layers.set(rank, []);
      }
      layers.get(rank).push(nodeId);
    });
    
    // Order nodes based on their connections
    layers.forEach((nodeIds, rank) => {
      nodeIds.sort((a, b) => {
        const aConnections = edges.filter(e => e.source === a || e.target === a);
        const bConnections = edges.filter(e => e.source === b || e.target === b);
        return bConnections.length - aConnections.length;
      });
    });
    
    return layers;
  };

  // Step 3: Assign coordinates
  const assignCoordinates = (layers) => {
    const positions = new Map();
    const LAYER_HEIGHT = 250;
    const NODE_SPACING = 350;
    
    layers.forEach((nodeIds, rank) => {
      const layerWidth = (nodeIds.length - 1) * NODE_SPACING;
      nodeIds.forEach((nodeId, index) => {
        const x = -layerWidth/2 + index * NODE_SPACING;
        const y = rank * LAYER_HEIGHT;
        
        positions.set(nodeId, direction === 'TB' 
          ? { x, y }
          : { x: y, y: x }
        );
      });
    });
    
    return positions;
  };

  // Execute layout
  const ranks = assignLayers();
  const layers = orderNodesInLayers(ranks);
  const positions = assignCoordinates(layers);
  
  // Return positioned nodes and edges
  return {
    nodes: nodes.map(node => ({
      ...node,
      position: positions.get(node.id)
    })),
    edges: edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      sourcePosition: direction === 'TB' ? 'bottom' : 'right',
      targetPosition: direction === 'TB' ? 'top' : 'left'
    }))
  };
};

export const calculateSimplifiedLayout = (nodes, edges, direction = 'TB') => {
  console.log("calculateSimplifiedLayout");
  // Constants for spacing
  const NODE_WIDTH = 480;
  const NODE_HEIGHT = 220;
  const EDGE_LENGTH = direction === 'TB' ? 250 : 250;
  const NODE_SPACING =100;
  
  // 1. Assign Layers (from calculateProcessLayout)
  const assignLayers = () => {
    const ranks = new Map();
    const visited = new Set();
    
    const findLongestPath = (nodeId, currentRank = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      ranks.set(nodeId, Math.max(currentRank, ranks.get(nodeId) || 0));
      
      // Get all outgoing edges
      const outgoing = edges.filter(e => e.source === nodeId);
      outgoing.forEach(edge => {
        findLongestPath(edge.target, currentRank + 1);
      });
    };
    
    // Find root nodes
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    rootNodes.forEach(node => findLongestPath(node.id));
    
    // Handle disconnected components
    nodes.forEach(node => {
      if (!ranks.has(node.id)) {
        findLongestPath(node.id);
      }
    });
    
    return ranks;
  };

  // 2. Order nodes within layers (from calculateProcessLayout)
  const orderNodesInLayers = (ranks) => {
    const layers = new Map();
    ranks.forEach((rank, nodeId) => {
      if (!layers.has(rank)) {
        layers.set(rank, []);
      }
      layers.get(rank).push(nodeId);
    });
    
    layers.forEach((nodeIds, rank) => {
      nodeIds.sort((a, b) => {
        const aConnections = edges.filter(e => e.source === a || e.target === a);
        const bConnections = edges.filter(e => e.source === b || e.target === b);
        return bConnections.length - aConnections.length;
      });
    });
    
    return layers;
  };

  // 3. Apply Directional Constraints (modified from calculateEnhancedLayout)
  const applyDirectionalConstraints = (layers) => {
    const positions = new Map();
    const LAYER_HEIGHT = direction === 'TB' ? EDGE_LENGTH : NODE_WIDTH * 1.5;
    
    layers.forEach((nodeIds, rank) => {
      const layerWidth = (nodeIds.length - 1) * NODE_SPACING;
      nodeIds.forEach((nodeId, index) => {
        let x = -layerWidth/2 + index * NODE_SPACING;
        let y = rank * LAYER_HEIGHT;
        
        // Apply directional constraints
        if (direction === 'TB') {
          positions.set(nodeId, { x, y });
        } else {
          positions.set(nodeId, { x: y, y: x });
        }
      });
    });
    
    return positions;
  };

  
  // 4. Edge Routing (from calculateEnhancedLayout)
  const routeEdges = (positions) => {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    const getNodeType = (node) => {
      const metadata = node?.data?.metadata || {};
      return metadata?.['L5 Step type2']?.toLowerCase() || 
             metadata?.['L4 Step type']?.toLowerCase() || metadata?.['Step type']?.toLowerCase() ||
             'normal';
    };

    return edges.map(edge => {
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      const sourceType = getNodeType(sourceNode);
      const isValidationNode = sourceType === 'validation';
      const isDistributionNode = sourceType === 'distribution';
      const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');

      // Determine positions based on layout direction
      let sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
      let targetPosition = direction === 'TB' ? Position.Top : Position.Left;

      // For validation nodes, adjust positions based on condition
      if (isValidationNode) {
        if (direction === 'TB') {
          sourcePosition = isNotFeasible ? Position.Left : Position.Right;
          targetPosition = Position.Top;
        } else {
          sourcePosition = isNotFeasible ? Position.Top : Position.Bottom;
          targetPosition = Position.Left;
        }
      } else if (isDistributionNode) {
        sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
        targetPosition = direction === 'TB' ? Position.Top : Position.Left;
      }

      // Calculate edge routing
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const midPoint = {
        x: sourcePos.x + dx * 0.5,
        y: sourcePos.y + dy * 0.5
      };

      // Handle parallel edges
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
        type: 'custom',
        data: {
          ...edge.data,
          controlPoint,
          condition: edge.condition || edge.data?.condition,
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
  };

  /*
  const routeEdges = (positions) => {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    const getNodeType = (node) => {
      const metadata = node?.data?.metadata || {};
      return metadata?.['L5 Step type2']?.toLowerCase() || 
             metadata?.['L4 Step type']?.toLowerCase() || 
             'normal';
    };
  
    return edges.map(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      const sourceType = getNodeType(sourceNode);
      const isValidationNode = sourceType === 'validation';
      const isDistributionNode = sourceType === 'distribution';
      const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');
  
      // Determine positions based on layout direction
      let sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
      let targetPosition = direction === 'TB' ? Position.Top : Position.Left;
  
      // For validation nodes, adjust positions based on condition
      if (isValidationNode) {
        if (direction === 'TB') {
          sourcePosition = isNotFeasible ? Position.Left : Position.Right;
          targetPosition = Position.Top;
        } else {
          sourcePosition = isNotFeasible ? Position.Top : Position.Bottom;
          targetPosition = Position.Left;
        }
      } else if (isDistributionNode) {
        sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
        targetPosition = direction === 'TB' ? Position.Top : Position.Left;
      }
  
      return {
        ...edge,
        sourcePosition,
        targetPosition,
        type: 'straight',  // Changed to straight
        data: {
          ...edge.data,
          condition: edge.condition || edge.data?.condition,
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
  };*/

  // Execute layout
  const ranks = assignLayers();
  const layers = orderNodesInLayers(ranks);
  const positions = applyDirectionalConstraints(layers);
  const routedEdges = routeEdges(positions);
  
  return {
    nodes: nodes.map(node => ({
      ...node,
      position: positions.get(node.id)
    })),
    edges: routedEdges
  };
};

export const calculateSimplifiedLayout_new = (nodes, edges, direction = 'TB') => {
  console.log("calculateSimplifiedLayout");
  // Constants for spacing
  const NODE_WIDTH = 480;
  const NODE_HEIGHT = 220;
  const EDGE_LENGTH = direction === 'TB' ? 250 : 250;
  const NODE_SPACING =100;
  
  // 1. Assign Layers (from calculateProcessLayout)
  const assignLayers = () => {
    const ranks = new Map();
    const visited = new Set();
    
    const findLongestPath = (nodeId, currentRank = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      ranks.set(nodeId, Math.max(currentRank, ranks.get(nodeId) || 0));
      
      // Get all outgoing edges
      const outgoing = edges.filter(e => e.source === nodeId);
      outgoing.forEach(edge => {
        findLongestPath(edge.target, currentRank + 1);
      });
    };
    
    // Find root nodes
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    rootNodes.forEach(node => findLongestPath(node.id));
    
    // Handle disconnected components
    nodes.forEach(node => {
      if (!ranks.has(node.id)) {
        findLongestPath(node.id);
      }
    });
    
    return ranks;
  };

  // 2. Order nodes within layers (from calculateProcessLayout)
  const orderNodesInLayers = (ranks) => {
    const layers = new Map();
    ranks.forEach((rank, nodeId) => {
      if (!layers.has(rank)) {
        layers.set(rank, []);
      }
      layers.get(rank).push(nodeId);
    });
    
    layers.forEach((nodeIds, rank) => {
      nodeIds.sort((a, b) => {
        const aConnections = edges.filter(e => e.source === a || e.target === a);
        const bConnections = edges.filter(e => e.source === b || e.target === b);
        return bConnections.length - aConnections.length;
      });
    });
    
    return layers;
  };

  // 3. Apply Directional Constraints (modified from calculateEnhancedLayout)
  const applyDirectionalConstraints = (layers) => {
    const positions = new Map();
    const LAYER_HEIGHT = direction === 'TB' ? EDGE_LENGTH : NODE_WIDTH * 1.5;
    
    layers.forEach((nodeIds, rank) => {
      const layerWidth = (nodeIds.length - 1) * NODE_SPACING;
      nodeIds.forEach((nodeId, index) => {
        let x = -layerWidth/2 + index * NODE_SPACING;
        let y = rank * LAYER_HEIGHT;
        
        // Apply directional constraints
        if (direction === 'TB') {
          positions.set(nodeId, { x, y });
        } else {
          positions.set(nodeId, { x: y, y: x });
        }
      });
    });
    
    return positions;
  };

  
  // 4. Edge Routing (from calculateEnhancedLayout)
  const routeEdges = (positions) => {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    const getNodeType = (node) => {
      const metadata = node?.data?.metadata || {};
      return metadata?.['L5 Step type2']?.toLowerCase() || 
             metadata?.['L4 Step type']?.toLowerCase() || metadata?.['Step type']?.toLowerCase() ||
             'normal';
    };

    return edges.map(edge => {
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      const sourceType = getNodeType(sourceNode);
      const isValidationNode = sourceType === 'validation';
      const isDistributionNode = sourceType === 'distribution';
      const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');

      // Determine positions based on layout direction
      let sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
      let targetPosition = direction === 'TB' ? Position.Top : Position.Left;

      // For validation nodes, adjust positions based on condition
      if (isValidationNode) {
        if (direction === 'TB') {
          sourcePosition = isNotFeasible ? Position.Left : Position.Right;
          targetPosition = Position.Top;
        } else {
          sourcePosition = isNotFeasible ? Position.Top : Position.Bottom;
          targetPosition = Position.Left;
        }
      } else if (isDistributionNode) {
        sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
        targetPosition = direction === 'TB' ? Position.Top : Position.Left;
      }

      // Calculate edge routing
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const midPoint = {
        x: sourcePos.x + dx * 0.5,
        y: sourcePos.y + dy * 0.5
      };

      // Handle parallel edges
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
        type: 'custom',
        data: {
          ...edge.data,
          controlPoint,
          condition: edge.condition || edge.data?.condition,
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
  };

  /*
  const routeEdges = (positions) => {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    const getNodeType = (node) => {
      const metadata = node?.data?.metadata || {};
      return metadata?.['L5 Step type2']?.toLowerCase() || 
             metadata?.['L4 Step type']?.toLowerCase() || 
             'normal';
    };
  
    return edges.map(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      const sourceType = getNodeType(sourceNode);
      const isValidationNode = sourceType === 'validation';
      const isDistributionNode = sourceType === 'distribution';
      const isNotFeasible = edge.data?.condition?.toLowerCase().includes('not feasible');
  
      // Determine positions based on layout direction
      let sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
      let targetPosition = direction === 'TB' ? Position.Top : Position.Left;
  
      // For validation nodes, adjust positions based on condition
      if (isValidationNode) {
        if (direction === 'TB') {
          sourcePosition = isNotFeasible ? Position.Left : Position.Right;
          targetPosition = Position.Top;
        } else {
          sourcePosition = isNotFeasible ? Position.Top : Position.Bottom;
          targetPosition = Position.Left;
        }
      } else if (isDistributionNode) {
        sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;
        targetPosition = direction === 'TB' ? Position.Top : Position.Left;
      }
  
      return {
        ...edge,
        sourcePosition,
        targetPosition,
        type: 'straight',  // Changed to straight
        data: {
          ...edge.data,
          condition: edge.condition || edge.data?.condition,
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
  };*/

  // Execute layout
  const ranks = assignLayers();
  const layers = orderNodesInLayers(ranks);
  const positions = applyDirectionalConstraints(layers);
  const routedEdges = routeEdges(positions);
  
  return {
    nodes: nodes.map(node => ({
      ...node,
      position: positions.get(node.id)
    })),
    edges: routedEdges
  };
};
    //export default {calculateProcessLayout, calculateEnhancedLayout};