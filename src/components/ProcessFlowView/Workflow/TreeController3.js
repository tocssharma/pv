// treeController.js
import { create } from 'zustand';
import { useData } from '../../../contexts/DataContext';
import ProcessDataHandler from "../../../lib/dataHelper";

// Helper functions
const findNode = (tree, nodeId) => {
  if (!tree) return null;
  
  // Check current level
  for (const node of Object.values(tree)) {
    if (node.id === nodeId) return node;
    
    // Check children
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
    
    // Check processes
    if (node.processes) {
      const found = findNode(node.processes, nodeId);
      if (found) return found;
    }
  }
  
  return null;
};

// Function to get parent nodes
const getParentNodes = (tree, nodeId, parents = []) => {
  if (!tree) return parents;
  
  for (const node of Object.values(tree)) {
    if (node.children && findNode(node.children, nodeId)) {
      parents.push(node.id);
      return getParentNodes(node.children, nodeId, parents);
    }
    if (node.processes && findNode(node.processes, nodeId)) {
      parents.push(node.id);
      return getParentNodes(node.processes, nodeId, parents);
    }
  }
  
  return parents;
};

// Create a store to manage tree state
const useTreeStore = create((set, get) => ({
  expandedNodes: [],
  selectedNode: null,
  
  setExpandedNodes: (nodes) => {
    console.log("Setting expanded nodes:", nodes);
    set({ expandedNodes: Array.isArray(nodes) ? nodes : Array.from(nodes) });
  },
  
  isNodeExpanded: (nodeId) => {
    return get().expandedNodes.includes(nodeId);
  },
  
  toggleNode: (nodeId) => {
    const currentExpanded = get().expandedNodes;
    const isExpanded = currentExpanded.includes(nodeId);
    console.log("Toggling node:", nodeId, "Current expanded:", currentExpanded);
    
    set({
      expandedNodes: isExpanded 
        ? currentExpanded.filter(id => id !== nodeId)
        : [...currentExpanded, nodeId]
    });
  },
  
  setSelectedNode: (node) => {
    console.log("Setting selected node:", node);
    set({ selectedNode: node });
  },
  
  // Initialize state with both expansion and selection
  initializeState: (expanded, node) => {
    console.log('Initializing tree state with:', { expanded, node });
    set({
      expandedNodes: expanded || [],
      selectedNode: node || null
    });
  }
}));

// Custom hook to use TreeController with DataProvider
const useTreeController = () => {
  const { data } = useData();
  const treeStore = useTreeStore();
  
  // Transform data to hierarchy when needed
  const getHierarchy = () => {
    return ProcessDataHandler.transformToHierarchy_New1(data);
  };

  const clickNode = (nodeId) => {
    const hierarchy = getHierarchy();
    const node = findNode(hierarchy, nodeId);
    
    if (!node) {
      console.warn(`Node with id ${nodeId} not found`);
      return false;
    }

    // Get all parent nodes that need to be expanded
    const parents = getParentNodes(hierarchy, nodeId);
    
    // Update expanded nodes to include all parents and the current node
    const expandedNodes = [...new Set([...parents, nodeId])];
    console.log('Clicking node:', { nodeId, node, parents, expandedNodes });
    treeStore.setExpandedNodes(expandedNodes);
    treeStore.setSelectedNode(node);
    
    return true;
  };

  return {
    clickNode,
    hierarchy: getHierarchy(),
    findNode,
    getParentNodes,
    ...treeStore
  };
};

export { useTreeStore, useTreeController };