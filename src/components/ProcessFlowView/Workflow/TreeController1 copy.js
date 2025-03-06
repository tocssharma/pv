
import { create } from 'zustand';
import { useData } from '../../../contexts/DataContext';
import ProcessDataHandler from "../../../lib/dataHelper";

// Create a store to manage tree state
const useTreeStore = create((set) => ({
  expandedNodes: [],
  selectedNode: null,
  setExpandedNodes: (nodes) => set({ 
    expandedNodes: Array.isArray(nodes) ? nodes : Array.from(nodes)
  }),
  
  isNodeExpanded: (nodeId) => {
    const state = useTreeStore.getState();
    return state.expandedNodes.includes(nodeId);
  },
  
  toggleNode: (nodeId) => {
    const state = useTreeStore.getState();
    const currentExpanded = state.expandedNodes;
    const isExpanded = currentExpanded.includes(nodeId);
    
    set({
      expandedNodes: isExpanded 
        ? currentExpanded.filter(id => id !== nodeId)
        : [...currentExpanded, nodeId]
    });
  },
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  // Add initializeState function
  initializeState: (expanded, selectedNodeId) => {
    const state = useTreeStore.getState();
    set({
      expandedNodes: expanded || [],
      selectedNode: selectedNodeId ? { id: selectedNodeId } : null
    });
  }
}));

// Helper function to find a node in the tree
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

// Custom hook to use TreeController with DataProvider
export const useTreeController = () => {
  const { data } = useData();
  
  // Transform data to hierarchy when needed
  const getHierarchy = () => {
    return ProcessDataHandler.transformToHierarchy(data);
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
    
    // Update expanded nodes to include all parents
    useTreeStore.getState().setExpandedNodes(parents);
    
    // Update selected node
    useTreeStore.getState().setSelectedNode(node);
    
    return true;
  };

  return {
    clickNode,
    hierarchy: getHierarchy(),
    ...useTreeStore()
  };
};

export { useTreeStore };