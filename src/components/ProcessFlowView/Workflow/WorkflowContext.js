// components/workflow/WorkflowContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const WorkflowContext = createContext({
  selectedNode: null,
  setSelectedNode: () => {},
  contextMenu: null,
  setContextMenu: () => {},
  showMetaDataEditor: false,
  setShowMetaDataEditor: () => {},
  closeContextMenu: () => {},
});

export const WorkflowProvider = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showMetaDataEditor, setShowMetaDataEditor] = useState(false);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const value = {
    selectedNode,
    setSelectedNode,
    contextMenu,
    setContextMenu,
    showMetaDataEditor,
    setShowMetaDataEditor,
    closeContextMenu,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};