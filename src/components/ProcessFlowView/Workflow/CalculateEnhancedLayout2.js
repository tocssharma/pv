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


const calculateEnhancedLayout = (nodes, edges) => {
  // Adjusted constants for better spacing
  const REPULSION = 150;  // Increased repulsion force
  const ATTRACTION = 0.25; // Slightly reduced attraction
  const EDGE_LENGTH = 350; // Increased edge length
  const ITERATIONS = 106;   // More iterations for better convergence
  const MIN_NODE_DISTANCE = 10; // Minimum distance between nodes
  const NODE_WIDTH = 480;  // Approximate width of nodes
  const NODE_HEIGHT = 220; // Approximate height of nodes
  
  const distance = (p1, p2) => Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
  );

  // Enhanced node position initialization
  const initializeNodePositions = () => {
    const positions = new Map();
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const spacing = Math.max(NODE_WIDTH * 1.5, MIN_NODE_DISTANCE);
    
    nodes.forEach((node, index) => {
      // If node already has a position, use it with some jitter
      if (node.position) {
        positions.set(node.id, {
          x: node.position.x + (Math.random() - 0.5) * 50,
          y: node.position.y + (Math.random() - 0.5) * 50
        });
      } else {
        // Grid-based initial positioning for nodes without position
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        positions.set(node.id, {
          x: col * spacing + (Math.random() - 0.5) * 50,
          y: row * spacing + (Math.random() - 0.5) * 50
        });
      }
    });
    return positions;
  };

  const nodePositions = initializeNodePositions();
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  // Enhanced level calculation with handling of disconnected nodes
  const calculateNodeLevels = () => {
    const levels = new Map();
    const visited = new Set();
    
    // Helper to get all connected nodes
    const getConnectedNodes = (nodeId) => {
      const outgoing = edges.filter(e => e.source === nodeId).map(e => e.target);
      const incoming = edges.filter(e => e.target === nodeId).map(e => e.source);
      return [...new Set([...outgoing, ...incoming])];
    };

    // Modified level calculation
    const calculateLevel = (nodeId, level = 0, visited = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      levels.set(nodeId, Math.max(level, levels.get(nodeId) || 0));
      
      // Process both outgoing and incoming edges
      edges.filter(edge => edge.source === nodeId)
           .forEach(edge => calculateLevel(edge.target, level + 1, visited));
    };

    // First pass: calculate levels for connected nodes
    nodes.forEach(node => {
      if (!visited.has(node.id) && getConnectedNodes(node.id).length > 0) {
        calculateLevel(node.id, 0, visited);
      }
    });

    // Second pass: handle disconnected nodes
    nodes.forEach(node => {
      if (!levels.has(node.id)) {
        // Find nearest connected node
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
        
        // Assign level based on nearest connected node
        levels.set(node.id, nearestLevel + 1);
      }
    });

    return levels;
  };

  const nodeLevels = calculateNodeLevels();

  // Force-directed layout with enhanced overlap prevention
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const forces = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));

    // Enhanced repulsion forces with overlap prevention
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        const pos1 = nodePositions.get(node1.id);
        const pos2 = nodePositions.get(node2.id);
        const dist = distance(pos1, pos2);
        
        // Strong repulsion for overlapping nodes
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
          // Normal repulsion for distant nodes
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

    // Enhanced edge forces with level constraints
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

    // Apply forces with enhanced constraints
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      const force = forces.get(node.id);
      const level = nodeLevels.get(node.id);

      // Enhanced hierarchical constraints
      const idealY = level * EDGE_LENGTH;
      const verticalForce = (idealY - pos.y) * 0.2; // Increased strength of vertical alignment
      force.y += verticalForce;

      // Add slight horizontal spreading force for nodes at the same level
      nodes.forEach(otherNode => {
        if (node.id !== otherNode.id && nodeLevels.get(otherNode.id) === level) {
          const otherPos = nodePositions.get(otherNode.id);
          const horizontalDist = Math.abs(pos.x - otherPos.x);
          if (horizontalDist < NODE_WIDTH * 1.5) {
            force.x += pos.x < otherPos.x ? -10 : 10;
          }
        }
      });

      // Apply forces with damping
      const damping = 0.9 - (iteration / ITERATIONS) * 0.3; // Progressive damping
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
    
        // Check for not feasible condition
        const isNotFeasible = 
          edge.data?.condition?.toLowerCase().includes('not feasible') ||
          edge.condition?.toLowerCase().includes('not feasible');
    
        // Special handling for validation nodes
        if (sourceType === 'validation' || sourceType === 'distribution') {
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
    
        // Return enhanced edge with color information and marker end
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
            isNotFeasible  // Add this flag for CustomEdge component
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isNotFeasible ? '#ef4444' : '#2563eb'  // Red for not feasible, blue for feasible
          },
          style: {
            stroke: isNotFeasible ? '#ef4444' : '#2563eb'  // Match the marker color
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