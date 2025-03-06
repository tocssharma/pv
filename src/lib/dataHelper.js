

const ProcessDataHandler = {
  // Constants for level definitions remain the same
  LEVELS: {
    L0: {
      id: 'L0 JIO Domain ID',
      name: 'L0 JIO Domain Name',
      idformat:"domainid",
      type: 'domain',
    },
    L1: {
      id: 'L1 JIO LOB/Business Verticals ID',
      name: 'L1 JIO LOB/Business Verticals Name',
      idformat:"lobid",
      type: 'lob',
    },
    L2: {
      id: 'L2 JIO Journey ID',
      name: 'L2 JIO Journey Name',
      idformat:"journeyid",
      type: 'journey',
    },
    L3: {
      id: 'L3 JIO Process Area ID',
      name: 'L3 JIO Process Area Name',
      idformat:"processareaid",
      type: 'processArea',
    },
    L4: {
      id: 'L4 JIO Process ID1',
      name: 'L4 JIO Process Name1',
      idformat:"domainid-lobid-journeyid-processareaid-xx",
      type: 'L4',
      metadata: [
        'L4 ETOM Process ID',
        'L4 Task Type',
        'L4 System',
        'L4 Application Type',
        'L4 Actor',
        'L4 API Details',
        'L4 Step type',
      ],
      relationship: {
        predecessor: 'L4 Predessesor',
        condition: 'L4 Predesessor Condition',
      },
    },
    L5: {
      id: 'L5 JIO Process ID2',
      name: 'L5 JIO Process Name2',
      idformat:"domainid-lobid-journeyid-processareaid-xx-xx",
      type: 'L5',
      metadata: [
        'L5 ETOM Process ID11',
        'L5 Task Type12',
        'L5 System13',
        'L5 Application Type14',
        'L5 Actor15',
        'L5 API Details16',
        'L5 Step type2',
      ],
      relationship: {
        predecessor: 'L5 Predessesor3',
        condition: 'L5 Predesessor Condition4',
      },
    },
    L6: {
      id: 'L6 JIO Process ID3',
      name: 'L6 JIO Process Name3',
      idformat:"domainid-lobid-journeyid-processareaid-xx-xx-xx",
      type: 'L6',
      metadata: [
        'L6 ETOM Process ID19',
        'L6 Task Type20',
        'L6 System21',
        'L6 Application Type22',
        'L6 Role',
        'L6 API Details23',
        'L6 Step type2'
      ],
      relationship: {
        predecessor: 'L6 Predessesor3',
        condition: 'L6 Predesessor Condition4',
      },
    },
    L7: {
      id: 'L7 JIO Process ID4',
      name: 'L7 JIO Process Name4',
      idformat:"domainid-lobid-journeyid-processareaid-xx-xx-xx-xx",
      type: 'L7',
      metadata: [
        'L7 ETOM Process ID26',
        'L7 Task Type27',
        'L7 System28',
        'L7 Application Type29',
        'L7 Role30',
        'L7 API Details31',
        'L7 Step type2'
      ],
      relationship: {
        predecessor: 'L7 Predessesor3',
        condition: 'L7 Predesessor Condition4',
      },
    },
    L8: {
        id: 'L8 JIO Process ID',
        name: 'L8 JIO Process Name',
        idformat:"domainid-lobid-journeyid-processareaid-xx-xx-xx-xx-xx",
        type: 'L8',
        metadata: [
          'L8 ETOM Process ID',
          'L8 Task Type',
          'L8 System',
          'L8 Application Type',
          'L8 Role',
          'L8 API Details',
          'L8 Step type'
        ],
        relationship: {
          predecessor: 'L8 Predessesor',
          condition: 'L8 Predesessor Condition',
        },
  
    },
    
    L9: {
        id: 'L9 JIO Process ID',
        name: 'L9 JIO Process Name',
        idformat:"domainid-lobid-journeyid-processareaid-xx-xx-xx-xx-xx-xx",
        type: 'L9',
        metadata: [
          'L9 ETOM Process ID',
          'L9 Task Type',
          'L9 System',
          'L9 Application Type',
          'L8 Role',
          'L9 API Details',
          'L9 Step type'
        ],
        relationship: {
          predecessor: 'L9 Predessesor',
          condition: 'L9 Predesessor Condition',
        },
  
    },
    L10: {
      id: 'L10 JIO Process ID',
      name: 'L10 JIO Process Name',
      idformat:"domainid-lobid-journeyid-processareaid-xx-xx-xx-xx-xx-xx-xx",
      type: 'L10',
      metadata: [
        'L10 ETOM Process ID',
        'L10 Task Type',
        'L10 System',
        'L10 Application Type',
        'L10 Role',
        'L10 API Details',
        'L10 Step type'
      ],
      relationship: {
        predecessor: 'L10 Predessesor',
        condition: 'L10 Predesessor Condition',
      },

  },
  },

  Headers:[
    "L0 JIO Domain ID",
    "L0 JIO Domain Name",
    "L1 JIO LOB/Business Verticals ID",
    "L1 JIO LOB/Business Verticals Name",
    "L2 JIO Journey ID",
    "L2 JIO Journey Name",
    "L3 JIO Process Area ID",
    "L3 JIO Process Area Name",
    "L4 JIO Process ID1",
    "L4 JIO Process Name1",
    "L4 ETOM Process ID",
    "L4 Task Type",
    "L4 System",
    "L4 Application Type",
    "L4 Actor",
    "L4 API Details",
    "L4 Step type",
    "L4 Predessesor",
    "L4 Predesessor Condition",
    "L5 JIO Process ID2",
    "L5 JIO Process Name2",
    "L5 ETOM Process ID11",
    "L5 Task Type12",
    "L5 System13",
    "L5 Application Type14",
    "L5 Actor15",
    "L5 API Details16",
    "L5 Step type2",
    "L5 Predessesor3",
    "L5 Predesessor Condition4",
    "L6 JIO Process ID3",
    "L6 JIO Process Name3",
    "L6 ETOM Process ID19",
    "L6 Task Type20",
    "L6 System21",
    "L6 Application Type22",
    "L6 Role",
    "L6 API Details23",
    "L6 Step type2",
    "L6 Predessesor3",
    "L6 Predesessor Condition4",
    "L7 JIO Process ID4",
    "L7 JIO Process Name4",
    "L7 ETOM Process ID26",
    "L7 Task Type27",
    "L7 System28",
    "L7 Application Type29",
    "L7 Role30",
    "L7 API Details31",
    "L7 Step type2",
    "L7 Predessesor3",
    "L7 Predesessor Condition4",
    "L8 JIO Process ID",
    "L8 JIO Process Name",
    "L8 ETOM Process ID",
    "L8 Task Type",
    "L8 System",
    "L8 Application Type",
    "L8 Role",
    "L8 API Details",
    "L8 Step type",
    "L8 Predessesor",
    "L8 Predesessor Condition"
],
  // Check if node already exists and merge if needed
  mergeOrCreateNode(existingNode, newData, type,data) {
    if (!existingNode) {
      return {
        id: newData.id,
        name: newData.name,
        children: {},
        type: type,
        metadata: this.extractMetadata(newData, this.LEVELS[type]?.metadata,data,type),
        relationships: this.extractRelationships(newData, this.LEVELS[type]?.relationship,data)
      };
    }

    // Merge metadata if it exists
    if (newData.metadata) {
      existingNode.metadata = {
        ...existingNode.metadata,
        ...newData.metadata
      };
    }

    // Merge relationships if they exist
    if (newData.relationships) {
      existingNode.relationships = {
        ...existingNode.relationships,
        ...newData.relationships
      };
    }

    return existingNode;
  },

  transformToHierarchy_New1(data) {
  
    
  if (!Array.isArray(data)) {
      throw new Error('Input data must be an array');
    }

    const hierarchy = {};
    const processMap = new Map();

    data.forEach(row => {
      // Handle L0-L3 hierarchy
      const l0Key = row[this.LEVELS.L0.id]?.trim();
      const l1Key = row[this.LEVELS.L1.id]?.trim();
      const l2Key = row[this.LEVELS.L2.id]?.trim();
      const l3Key = row[this.LEVELS.L3.id]?.trim();

      if (!l0Key) return;

      // Create or get L0 (Domain)
      if (!hierarchy[l0Key]) {
        hierarchy[l0Key] = this.createNode_New1({
          id: l0Key,
          name: row[this.LEVELS.L0.name]?.trim(),
          type: 'domain',
          level: 'L0'
        });
      }

      if (!l1Key) return;

      // Create or get L1 (LOB)
      if (!hierarchy[l0Key].children[l1Key]) {
        hierarchy[l0Key].children[l1Key] = this.createNode_New1({
          id: l1Key,
          name: row[this.LEVELS.L1.name]?.trim(),
          type: 'lob',
          level: 'L1' 
        });
      }

      if (!l2Key) return;

      // Create or get L2 (Journey)
      if (!hierarchy[l0Key].children[l1Key].children[l2Key]) {
        hierarchy[l0Key].children[l1Key].children[l2Key] = this.createNode_New1({
          id: l2Key,
          name: row[this.LEVELS.L2.name]?.trim(),
          type: 'journey',
          level: 'L2' 
        });
      }

      if (!l3Key) return;

      // Create or get L3 (Process Area)
      if (!hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key]) {
        hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key] = this.createNode_New1({
          id: l3Key,
          name: row[this.LEVELS.L3.name]?.trim(),
          type: 'processArea',
          level: 'L3'
        });
      }

      // Initialize processes object for L3 if it doesn't exist
      const processArea = hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key];
      if (!processArea.processes) {
        processArea.processes = {};
      }

      // Handle process levels (L4-L8)
      this.addProcessNode_New1(processArea, row, processMap);
    });

    return hierarchy;
  }
  ,

  createNode({ id, name, type, level, metadata, relationships }) {
    return {
      id,
      name,
      type,
      level,
      children: {},
      metadata: metadata || {},
      relationships: relationships || null
    };
  },
  createNode_New1({ id, name, type, level }) {
    return {
      id,
      name,
      type,
      level,
      children: {},  // for L0-L3
      metadata: {},
      relationships: null
    };
  },

  cleanupEmptyChildren(node) {
    if (!node) return null;

    if (typeof node === 'object') {
      // Convert children object to array and clean it
      if (node.children && Object.keys(node.children).length > 0) {
        const cleanedChildren = Object.entries(node.children)
          .map(([key, child]) => this.cleanupEmptyChildren(child))
          .filter(child => child !== null);

        if (cleanedChildren.length > 0) {
          node.children = cleanedChildren;
        } else {
          delete node.children;
        }
      } else {
        delete node.children;
      }

      // Clean all object properties
      Object.keys(node).forEach(key => {
        if (typeof node[key] === 'object') {
          const cleaned = this.cleanupEmptyChildren(node[key]);
          if (cleaned === null) {
            delete node[key];
          } else {
            node[key] = cleaned;
          }
        }
      });
    }

    return Object.keys(node).length > 0 ? node : null;
  }
  ,

  // Add process nodes with duplicate prevention
  addProcessNode(processArea, row, processMap) {
    
    function isWhitespaceOnly(str) {
      return typeof str === "string" && str.trim().length === 0;
  }
    const addProcess = (level) => {
      
      const id = row[this.LEVELS[level].id];
      
      if (!id || isWhitespaceOnly(id)) return null;

      // Check if we've already processed this ID
      if (processMap.has(id)) {
        return processMap.get(id);
      }

      const newProcess = this.mergeOrCreateNode(null, {
        id: id,
        name: row[this.LEVELS[level].name]
      }, level.toUpperCase(),row);

      
      processMap.set(id, newProcess);
      processArea.processes[id] = newProcess;
      return newProcess;
    };

    // Build L4-L7 hierarchy with duplicate prevention
    const l4Process = addProcess('L4');
    
    if (l4Process) {
      const l5Process = addProcess('L5');
      
      if (l5Process && !l4Process.children[l5Process.id]) {
        l4Process.children[l5Process.id] = l5Process;
        
        const l6Process = addProcess('L6');
        if (l6Process && !l5Process.children[l6Process.id]) {
          l5Process.children[l6Process.id] = l6Process;
          
          const l7Process = addProcess('L7');
          if (l7Process && !l6Process.children[l7Process.id]) {
            l6Process.children[l7Process.id] = l7Process;

            const l8Process = addProcess('L8');
            if (l8Process && !l7Process.children[l8Process.id]) {
              l7Process.children[l8Process.id] = l8Process;

              const l9Process = addProcess('L9');
              if (l9Process && !l8Process.children[l9Process.id]) {
                l8Process.children[l9Process.id] = l9Process;
  
                const l10Process = addProcess('L10');
                if (l10Process && !l9Process.children[l10Process.id]) {
                  l9Process.children[l10Process.id] = l10Process;
                }
              }
            }

          }
        }
      }
    } 
  },
  addProcessNode_New1(processArea, row, processMap) {
    const isWhitespaceOnly = (str) => typeof str === "string" && str.trim().length === 0;

    const addProcess = (level) => {
      const levelConfig = this.LEVELS[level];
      const id = row[levelConfig.id]?.trim();

      
      if (!id || isWhitespaceOnly(id)) return null;

      // Only create new process if it doesn't exist in the map
      if (!processMap.has(id)) {
        const newProcess = {
          id: id,
          name: row[levelConfig.name]?.trim(),
          type: level,  // Using L4, L5, L6, L7, L8 as types for processes
          level: level,
          children: {},
          metadata: this.extractMetadata(row, levelConfig.metadata, row),
          relationships: this.extractRelationships(row, levelConfig.relationship, row)
        };
        processMap.set(id, newProcess);
        
        // For L4 processes, add directly to processArea.processes
        if (level === 'L4') {
          processArea.processes[id] = newProcess;
        }
      }

      return processMap.get(id);
    };

    const levels = ['L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
    const processes = levels.map(level => addProcess(level));
    if (processes[0] && processes[1]) {  // L4 -> L5
      processes[0].children[processes[1].id] = processes[1];
    }
    if (processes[1] && processes[2]) {  // L5 -> L6
      processes[1].children[processes[2].id] = processes[2];
    }
    if (processes[2] && processes[3]) {  // L6 -> L7
      processes[2].children[processes[3].id] = processes[3];
    }
    if (processes[3] && processes[4]) {  // L7 -> L8
      processes[3].children[processes[4].id] = processes[4];
    }
    if (processes[4] && processes[5]) {  // L8 -> L9
      processes[4].children[processes[5].id] = processes[5];
    }
    if (processes[5] && processes[6]) {  // L9 -> L10
      processes[5].children[processes[6].id] = processes[6];
    }


  }
  ,

  // Extract metadata fields from row
  extractMetadata(row, fields,data, level) {
    const metadata = {};
         
    fields?.forEach(field => {
      if (data[field]) {
        metadata[field] = data[field];
      }
    });
    return metadata;
  },

  // Extract relationship information with duplicate handling
  extractRelationships(row, relationshipConfig, data,level) {

    if (!relationshipConfig) return null;

    const relationships = {};

    if (data[relationshipConfig.predecessor]) {
      
      // Remove duplicates from predecessors array
      relationships.predecessors = [...new Set(
        data[relationshipConfig.predecessor]
          .split(',')
          .map(p => p.trim())
          .filter(Boolean)
      )];
    }
    
    if (data[relationshipConfig.condition]) {
      
      relationships.condition = [...
        data[relationshipConfig.condition]
          .split(',')
          .map(p => p.trim())
          .filter(Boolean)
      ];
    }
    
    return relationships;
  },

  // Get process flow for visualization (now with duplicate-free edges)
  getProcessFlow(processes) {
    const nodes = new Map();
    const edges = new Map();
    console.log("getProcessFlow:processes",processes);

    const processNodes = (process) => {
    console.log("getProcessFlow:process",process);
      let combinedChildren = {};
    
      if (process.children) {
          combinedChildren = { ...combinedChildren, ...process.children };
      }
      /*if (process.processes) {
          combinedChildren = { ...combinedChildren, ...process.processes };
      }*/


      if (!nodes.has(process.id)) {
        nodes.set(process.id, {
          id: process.id,
          label: process.name,
          type: process.type,
          metadata: process.metadata,
          children:process.children,
          lineage: process.lineage,
          parentId:process.parentId
        });
      }

      if (process.relationships?.predecessors) {
        process.relationships.predecessors.forEach((predecessorId, index) => {
          const edgeKey = `${predecessorId}-${process.id}`;
          if (!edges.has(edgeKey)) {

            const condition = 
           (process.relationships.condition && 
          index < process.relationships.condition.length) 
          ? process.relationships.condition[index] 
          : undefined;

            edges.set(edgeKey, {
              from: predecessorId,
              to: process.id,
              condition: condition
            });
          }
        });
      }

      /*Object.values(process.children || {}).forEach(child => {
        processNodes(child);
      });*/
    };

    Object.values(processes).forEach(process => {
      processNodes(process);
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values())
    };
  },


isDirectParent(parentId, childId) {
  const parentParts = parentId.split('-');
  const childParts = childId.split('-');
  
  // Parent should have exactly one fewer part than child
  if (parentParts.length !== childParts.length - 1) {
      return false;
  }
  
  // All parent parts should match the beginning of child parts
  return parentParts.every((part, index) => part === childParts[index]);
},

isDirectParent1(parentId, childId, hierarchy) {
  // Helper function to get node by ID from hierarchy
  const findNode = (id, tree) => {
    if (tree.id === id) return tree;
    if (tree.children) {
      for (const child of Object.values(tree.children)) {
        const found = findNode(id, child);
        if (found) return found;
      }
    }
    return null;
  };

  // Get parent and child nodes
  const parentNode = findNode(parentId, hierarchy);
  const childNode = findNode(childId, hierarchy);

  // If either node doesn't exist, return false
  if (!parentNode || !childNode) return false;

  // Get the levels from the nodes
  const parentLevel = parentNode.level;  // e.g. 'L5'
  const childLevel = childNode.level;    // e.g. 'L6'

  // Get level numbers for comparison
  const parentLevelNum = parseInt(parentLevel.substring(1));
  const childLevelNum = parseInt(childLevel.substring(1));

  // Check if they are consecutive levels
  if (childLevelNum - parentLevelNum !== 1) return false;

  // Use lineage to verify direct parent-child relationship
  const parentLevelKey = `L${parentLevelNum}_ID`;
  const childLineage = childNode.lineage;

  return childLineage[parentLevelKey] === parentId;
},

isDirectParent2(parentId, childId) {
  // First, let's handle the process level relationships
  const getProcessLevel = (id) => {
    // Extract level from the process ID pattern
    const parts = id.split('-');
    if (parts.length < 5) return null;
    
    // Check the pattern of the last segment
    const lastPart = parts[parts.length - 1];
    if (lastPart.match(/^\d+$/)) {
      // If it ends with just numbers, it's L4
      return 'L4';
    } else if (lastPart.match(/^\d+-\d+$/)) {
      // If it has one dash (e.g., "01-02"), it's L5
      return 'L5';
    } else if (lastPart.match(/^\d+-\d+-\d+$/)) {
      // If it has two dashes (e.g., "01-02-03"), it's L6
      return 'L6';
    } else if (lastPart.match(/^\d+-\d+-\d+-\d+$/)) {
      // If it has three dashes, (e.g., "01-02-03-01"), it's L7
      return 'L7';
    }else if (lastPart.match(/^\d+-\d+-\d+-\d+-\d+$/)) {
      // If it has four dashes (e.g., "01-02-03-01-01"), it's L8
      return 'L8';
    } 

    return null;
  };

  // Get levels for both IDs
  const parentLevel = getProcessLevel(parentId);
  const childLevel = getProcessLevel(childId);

  // If we can't determine levels, return false
  if (!parentLevel || !childLevel) return false;

  // Check if levels are consecutive
  const levels = ['L4', 'L5', 'L6', 'L7', 'L8'];
  const parentIndex = levels.indexOf(parentLevel);
  const childIndex = levels.indexOf(childLevel);
  
  if (childIndex !== parentIndex + 1) return false;

  // Check if child ID starts with parent ID
  return childId.startsWith(parentId + '-');
},

createHierarchy(data) {
     // Store reference to ProcessDataHandler for use inside buildTree
     const self = this;
  // Find all root level items (items with no parents)
  const allIds = Object.keys(data);
  
  const rootIds = allIds.filter(id => {
      return !allIds.some(otherId => self.isDirectParent(otherId, id) && otherId !== id);
  });

  // Recursive function to build the tree structure
  const buildTree= function (parentId) {
      const node = {...data[parentId]};
      // Find all direct children and build their subtrees
      node.children = allIds
          .filter(id => self.isDirectParent(parentId, id))
          .map(childId => buildTree(childId))
          .reduce((acc, child) => {
              acc[child.id] = child;
              return acc;
          }, {});
      return node;
  }
  
  // Build final hierarchical structure starting from root nodes
  return rootIds.reduce((acc, rootId) => {
      acc[rootId] = buildTree(rootId);
      return acc;
  }, {});
},

createHierarchy1(data) {
  const self = this;
  const allIds = Object.keys(data);

  // Helper function to get level number from level string (e.g., 'L4' -> 4)
  const getLevelNumber = (level) => parseInt(level.substring(1));

  // Identify root nodes (L4 processes)
  const rootIds = allIds.filter(id => {
    const node = data[id];
    // A root node is one that:
    // 1. Is an L4 process
    // 2. Has no parent in the data set at L3 level
    return node.level === 'L4';
  });

  // Recursive function to build the tree structure
  const buildTree = function(parentId) {
    const node = { ...data[parentId] };
    const parentLevel = getLevelNumber(node.level);

    // Find and build all direct children
    const children = allIds
      .filter(childId => {
        const childNode = data[childId];
        if (!childNode) return false;

        // Check if this is a direct child using lineage
        const childLevel = getLevelNumber(childNode.level);
        
        // Must be consecutive levels
        if (childLevel - parentLevel !== 1) return false;

        // Check if parent ID matches the corresponding level in child's lineage
        return childNode.lineage[`L${parentLevel}_ID`] === parentId;
      })
      .map(childId => buildTree(childId))
      .reduce((acc, child) => {
        acc[child.id] = child;
        return acc;
      }, {});

    // Only add children property if there are children
    if (Object.keys(children).length > 0) {
      node.children = children;
    }

    return node;
  };

  // Build final hierarchical structure starting from root nodes
  return rootIds.reduce((acc, rootId) => {
    acc[rootId] = buildTree(rootId);
    return acc;
  }, {});
}


,
createHierarchy2(data) {
  console.log("createHierarchy1:data",data);

  const self = this;
  const allIds = Object.keys(data);

  // Identify root nodes (L4 processes)
  const rootIds = allIds.filter(id => {
    // A root node is one that:
    // 1. Has no parent in the data set
    // 2. Is an L4 process (doesn't contain internal dashes in the last segment)
    const parts = id.split('-');
    const lastPart = parts[parts.length - 1];
    return !lastPart.includes('-') && !allIds.some(otherId => self.isDirectParent1(otherId, id));
  });

  // Recursive function to build the tree structure
  const buildTree = function(parentId) {
    const node = { ...data[parentId] };
    
    // Find and build all direct children
    const children = allIds
      .filter(id => self.isDirectParent1(parentId, id))
      .map(childId => buildTree(childId))
      .reduce((acc, child) => {
        acc[child.id] = child;
        return acc;
      }, {});

    // Only add children property if there are children
    if (Object.keys(children).length > 0) {
      node.children = children;
    }

    return node;
  };

  // Build final hierarchical structure starting from root nodes
  return rootIds.reduce((acc, rootId) => {
    acc[rootId] = buildTree(rootId);
    return acc;
  }, {});
}



};

//Utilities
// Validation rules for different field types
export const VALIDATION_RULES = {
  ID: {
    required: true,
    pattern: /^[A-Za-z0-9_\s]+$/,
    message: 'ID must contain only letters, numbers, spaces, and underscores'
  },
  Name: {
    required: true,
    minLength: 2,
    message: 'Name must be at least 2 characters long'
  }
};

export const validateRow = (row, allRows) => {
  const errors = {};

  // Helper functions
  const isEmptyValue = (value) => value === null || value === undefined || value.toString().trim() === '';
  const isValidId = (id) => /^[A-Z]+-[A-Z]+-[A-Z]+-[A-Z]+-\d+(-\d+)?$/.test(id);
  const isValidETOM = (etom) => /^\d+(\.\d+)*$/.test(etom.trim());

  // Validate Process ID (L5)
  if (isEmptyValue(row['L5 JIO Process ID2'])) {
    errors['L5 JIO Process ID2'] = 'Process ID is required';
  } else if (!isValidId(row['L5 JIO Process ID2'])) {
    errors['L5 JIO Process ID2'] = 'Invalid Process ID format. Expected format: XXX-XXX-XXX-XXX-NN(-NN)';
  }

  // Validate Process Name (L5)
  if (isEmptyValue(row['L5 JIO Process Name2'])) {
    errors['L5 JIO Process Name2'] = 'Process Name is required';
  }

  // Validate ETOM Process ID if provided
  if (!isEmptyValue(row['L5 ETOM Process ID11']) && !isValidETOM(row['L5 ETOM Process ID11'])) {
    errors['L5 ETOM Process ID11'] = 'Invalid ETOM Process ID format. Expected format: N.N.N.N';
  }

  // Validate Step Type
  const validStepTypes = ['Normal', 'Distribution', 'Validation', ''];
  if (!validStepTypes.includes(row['L5 Step type2'])) {
    errors['L5 Step type2'] = 'Invalid Step Type. Must be Normal, Distribution, or Validation';
  }

  // Validate Predecessor relationships
  if (row['L5 Predessesor3']) {
    const predecessors = row['L5 Predessesor3'].split(',').map(p => p.trim());
    
    // Check each predecessor exists and is valid
    const invalidPredecessors = predecessors.filter(predId => {
      // Don't count empty strings
      if (!predId) return false;
      
      // Check if predecessor exists in all rows
      return !allRows.some(r => r['L5 JIO Process ID2'] === predId);
    });

    if (invalidPredecessors.length > 0) {
      errors['L5 Predessesor3'] = `Invalid predecessors: ${invalidPredecessors.join(', ')}`;
    }

    // Detect circular dependencies
    if (predecessors.includes(row['L5 JIO Process ID2'])) {
      errors['L5 Predessesor3'] = 'Self-reference detected in predecessor';
    }
  }

  /*// Validate Predecessor Condition if Step Type is Validation
  if (row['L5 Step type2'] === 'Validation' && isEmptyValue(row['L5 Predesessor Condition4'])) {
    errors['L5 Predesessor Condition4'] = 'Condition is required for Validation step type';
  }*/

  // Validate Required Fields based on Type
  if (row['L5 Task Type12'] === 'Manual task') {
    if (isEmptyValue(row['L5 Actor15'])) {
      errors['L5 Actor15'] = 'Actor is required for Manual tasks';
    }
  }

  return errors;
};

// Helper function to get all fields for a level
export const getLevelFields = (level) => {
  const fields = [level.id, level.name];
  
  if (level.metadata) {
    fields.push(...level.metadata);
  }
  
  if (level.relationship) {
    fields.push(level.relationship.predecessor);
    fields.push(level.relationship.condition);
  }
  
  return fields;
};

// Map node types to level keys
// Map node types to level keys
const NODE_TYPE_TO_LEVEL = {
  domain: 'L0',
  lob: 'L1',
  journey: 'L2',
  processArea: 'L3',
  process4: 'L4',
  process5: 'L5',
  process6: 'L6',
  process7: 'L7',
  process8: 'L8',
  process9: 'L9',
  process10: 'L10',
  // Add direct level mappings
  L0: 'L0',
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  L4: 'L4',
  L5: 'L5',
  L6: 'L6',
  L7: 'L7',
  L8: 'L8',
  L9: 'L9',
  L10: 'L10'
};

// Helper function to get level config from node type
export const getLevelConfig = (nodeType) => {
  //console.log("getLevelConfig:nodeType",nodeType);
  
  const levelKey = NODE_TYPE_TO_LEVEL[nodeType] || 'L0';

  //console.log("getLevelConfig:levelKey",levelKey);
  //console.log("getLevelConfig:ProcessDataHandler.LEVELS[levelKey]",ProcessDataHandler.LEVELS[levelKey]);

  return ProcessDataHandler.LEVELS[levelKey];
};

// Helper function to validate a field
export const validateField = (field, value) => {
  // Check if field is an ID or Name field
  const isIdField = field.toLowerCase().includes('id');
  const isNameField = field.toLowerCase().includes('name');
  
  if (isIdField) {
    const rules = VALIDATION_RULES.ID;
    if (rules.required && !value) return 'This field is required';
    if (rules.pattern && !rules.pattern.test(value)) return rules.message;
  }
  
  if (isNameField) {
    const rules = VALIDATION_RULES.Name;
    if (rules.required && !value) return 'This field is required';
    if (rules.minLength && value.length < rules.minLength) return rules.message;
  }
  
  return null;
};

export default ProcessDataHandler;