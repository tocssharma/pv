const calculateProcessLayout = (nodes, edges, direction = 'TB') => {
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
    const LAYER_HEIGHT = 200;
    const NODE_SPACING = 250;
    
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

export default calculateProcessLayout;