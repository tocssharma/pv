// hooks/useProcessData.js
import create from 'zustand';

export const useProcessStore = create((set) => ({
  processData: null,
  selectedNode: null,
  setProcessData: (data) => set({ processData: data }),
  setSelectedNode: (node) => set({ selectedNode: node }),
}));