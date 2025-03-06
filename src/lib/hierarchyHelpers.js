
const isSignificantChange = (oldHierarchy, newHierarchy) => {
    // Check for node deletions
    const hasDeletedNodes = (oldNodes, newNodes) => {
      return Object.keys(oldNodes).some(id => !newNodes[id]);
    };
  
    // Check for level changes
    const hasLevelChanges = (oldNodes, newNodes) => {
      return Object.keys(oldNodes).some(id => {
        if (!newNodes[id]) return false;
        return oldNodes[id].level !== newNodes[id].level;
      });
    };
  
    // Check for parent changes (restructuring)
    const hasParentChanges = (oldNodes, newNodes) => {
      return Object.keys(oldNodes).some(id => {
        if (!newNodes[id]) return false;
        return JSON.stringify(oldNodes[id].lineage) !== JSON.stringify(newNodes[id].lineage);
      });
    };
  
    return (
      hasDeletedNodes(oldHierarchy, newHierarchy) ||
      hasLevelChanges(oldHierarchy, newHierarchy) ||
      hasParentChanges(oldHierarchy, newHierarchy)
    );
  };