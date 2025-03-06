const ProcessDataHandler = {
  // Constants for level definitions remain the same
  LEVELS: {
    L0: {
      id: 'L0 JIO Domain ID',
      name: 'L0 JIO Domain Name',
    },
    L1: {
      id: 'L1 JIO LOB/Business Verticals ID',
      name: 'L1 JIO LOB/Business Verticals Name',
    },
    L2: {
      id: 'L2 JIO Journey ID',
      name: 'L2 JIO Journey Name',
    },
    L3: {
      id: 'L3 JIO Process Area ID',
      name: 'L3 JIO Process Area Name',
    },
    L4: {
      id: 'L4 JIO Process ID1',
      name: 'L4 JIO Process Name1',
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
      metadata: [
        'L5 ETOM Process11',
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
      metadata: [
        'L6 ETOM Process19',
        'L6 Task Type20',
        'L6 System21',
        'L6 Application Type22',
        'L6 Role',
        'L6 API Details23',
      ],
    },
    L7: {
      id: 'L7 JIO Process ID4',
      name: 'L7 JIO Process Name4',
      metadata: [
        'L7 ETOM Process26',
        'L7 Task Type27',
        'L7 System28',
        'L7 Application Type29',
        'L7 Role30',
        'L7 API Details31',
      ],
    },
  },

  // Check if node already exists and merge if needed
  mergeOrCreateNode(existingNode, newData, type,data) {
console.log("mergeOrCreateNode:existingNode",existingNode);
console.log("mergeOrCreateNode:newData",newData);
console.log("mergeOrCreateNode:data",data);
console.log("mergeOrCreateNode:type",type);
console.log("mergeOrCreateNode:this.LEVELS[type]?.metadata",this.LEVELS[type]?.metadata);
console.log("mergeOrCreateNode:this.LEVELS[type]?.relationship",this.LEVELS[type]?.relationship);
console.log("mergeOrCreateNode:newData.metadata",newData.metadata);
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

  // Transform flat data into hierarchical structure with duplicate prevention
  transformToHierarchy(data) {
    const hierarchy = {};
    const processMap = new Map(); // Track all processes by their IDs
    console.log("data in transformToHierarchy:",data);
    console.log("Array.from(data) in transformToHierarchy:",Array.from(data)); // This should return true if data is an array
      console.log(typeof data); // This should return 'object' for arrays
      //console.log("Object.keys",Array.isArray(Array.from(data[Object.keys(data)[1]])));
      Array.from(data).forEach(row => {
      // Build hierarchy for L0-L3 levels with duplicate checking
      const l0Key = row[this.LEVELS.L0.id];
      const l1Key = row[this.LEVELS.L1.id];
      const l2Key = row[this.LEVELS.L2.id];
      const l3Key = row[this.LEVELS.L3.id];

      // Create or merge L0 (Domain)
      if (!hierarchy[l0Key]) {
        hierarchy[l0Key] = this.mergeOrCreateNode(null, {
          id: l0Key,
          name: row[this.LEVELS.L0.name]
        }, 'domain');
      }

      // Create or merge L1 (LOB)
      if (!hierarchy[l0Key].children[l1Key]) {
        hierarchy[l0Key].children[l1Key] = this.mergeOrCreateNode(null, {
          id: l1Key,
          name: row[this.LEVELS.L1.name]
        }, 'lob');
      }

      // Create or merge L2 (Journey)
      if (!hierarchy[l0Key].children[l1Key].children[l2Key]) {
        hierarchy[l0Key].children[l1Key].children[l2Key] = this.mergeOrCreateNode(null, {
          id: l2Key,
          name: row[this.LEVELS.L2.name]
        }, 'journey');
      }

      // Create or merge L3 (Process Area)
      if (!hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key]) {
        hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key] = this.mergeOrCreateNode(null, {
          id: l3Key,
          name: row[this.LEVELS.L3.name]
        }, 'processArea');
      }

      const processArea = hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key];
      if (!processArea.processes) {
        processArea.processes = {};
      }

      // Add process nodes (L4-L7) with duplicate checking
      this.addProcessNode(processArea, row, processMap);
    });
    console.log("hierarchy: in transformToHierarchy",hierarchy);
    return hierarchy;
  },
   // Add the hierarchy transformation methods to ProcessDataHandler
   transformToHierarchy_New(data) {
    if (!Array.isArray(data)) {
      throw new Error('Input data must be an array');
    }

    const hierarchy = {};
    const processMap = new Map();

    data.forEach(row => {
      let currentLevel = hierarchy;
      const levels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
      
      // Process each level
      levels.forEach(level => {
        const levelConfig = this.LEVELS[level];
        const id = row[levelConfig.id]?.trim();
        const name = row[levelConfig.name]?.trim();

        // Skip if no ID (handles empty process levels)
        if (!id) return;

        // Create node if it doesn't exist
        if (!currentLevel[id]) {
          currentLevel[id] = this.createNode({
            id,
            name,
            type: level,
            level,
            metadata: this.extractMetadata(row, levelConfig.metadata, row),
            relationships: this.extractRelationships(row, levelConfig.relationship, row)
          });
        }

        // Move to next level's children
        if (!currentLevel[id].children) {
          currentLevel[id].children = {};
        }
        currentLevel = currentLevel[id].children;
      });
    });

    return this.cleanupEmptyChildren(hierarchy);
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
        hierarchy[l0Key] = this.createNode({
          id: l0Key,
          name: row[this.LEVELS.L0.name]?.trim(),
          type: 'domain'
        });
      }

      if (!l1Key) return;

      // Create or get L1 (LOB)
      if (!hierarchy[l0Key].children[l1Key]) {
        hierarchy[l0Key].children[l1Key] = this.createNode({
          id: l1Key,
          name: row[this.LEVELS.L1.name]?.trim(),
          type: 'lob'
        });
      }

      if (!l2Key) return;

      // Create or get L2 (Journey)
      if (!hierarchy[l0Key].children[l1Key].children[l2Key]) {
        hierarchy[l0Key].children[l1Key].children[l2Key] = this.createNode({
          id: l2Key,
          name: row[this.LEVELS.L2.name]?.trim(),
          type: 'journey'
        });
      }

      if (!l3Key) return;

      // Create or get L3 (Process Area)
      if (!hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key]) {
        hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key] = this.createNode({
          id: l3Key,
          name: row[this.LEVELS.L3.name]?.trim(),
          type: 'processArea'
        });
      }

      // Initialize processes object for L3 if it doesn't exist
      const processArea = hierarchy[l0Key].children[l1Key].children[l2Key].children[l3Key];
      if (!processArea.processes) {
        processArea.processes = {};
      }

      // Handle process levels (L4-L7)
      this.addProcessNode(processArea, row, processMap);
    });

    return hierarchy;
  },

  createNode({ id, name, type }) {
    return {
      id,
      name,
      type,
      children: {},  // for L0-L3
      metadata: {},
      relationships: null
    };
  },

  addProcessNode(processArea, row, processMap) {
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
          type: level,  // Using L4, L5, L6, L7 as types for processes
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

    // Process each level and establish parent-child relationships
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
          }
        }
      }
    }
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
    console.log("addProcessNode:processArea",processArea);
    console.log("addProcessNode:row",row);
    console.log("addProcessNode:processMap",processMap);
    
    function isWhitespaceOnly(str) {
      return typeof str === "string" && str.trim().length === 0;
  }
    const addProcess = (level) => {
      console.log("addProcess:level",level);

      const id = row[this.LEVELS[level].id];
      console.log("addProcess:level+id",level +" : " + id );
      if (id==='JCB-MOB-PLM-PLC-04-01-03'){

        console.log("addProcess:id:JCB-MOB-PLM-PLC-04-01-03 found");
      }

      if (!id || isWhitespaceOnly(id)) return null;

      // Check if we've already processed this ID
      if (processMap.has(id)) {
        return processMap.get(id);
      }

      const newProcess = this.mergeOrCreateNode(null, {
        id: id,
        name: row[this.LEVELS[level].name]
      }, level.toUpperCase(),row);

      console.log("addProcessNode:newProcess",newProcess);

      processMap.set(id, newProcess);
      processArea.processes[id] = newProcess;
      return newProcess;
    };

    // Build L4-L7 hierarchy with duplicate prevention
    const l4Process = addProcess('L4');
    console.log("addProcessNode:l4Process",l4Process);

    if (l4Process) {
      const l5Process = addProcess('L5');
      console.log("addProcessNode:l5Process",l5Process);

      if (l5Process && !l4Process.children[l5Process.id]) {
        l4Process.children[l5Process.id] = l5Process;
    console.log("addProcessNode:l4Process",l4Process);
        
        const l6Process = addProcess('L6');
        if (l6Process && !l5Process.children[l6Process.id]) {
          l5Process.children[l6Process.id] = l6Process;
          
          const l7Process = addProcess('L7');
          if (l7Process && !l6Process.children[l7Process.id]) {
            l6Process.children[l7Process.id] = l7Process;
          }
        }
      }
    }
  },

  // Extract metadata fields from row
  extractMetadata(row, fields,data, level) {
    const metadata = {};
    console.log("extractMetadata:row]",row);
    console.log("extractMetadata:fields]",fields);
    console.log("extractMetadata:data]",data);
    console.log("extractMetadata:level]",level);
         
    fields?.forEach(field => {
      if (data[field]) {
        metadata[field] = data[field];
      }
    });
    return metadata;
  },

  // Extract relationship information with duplicate handling
  extractRelationships(row, relationshipConfig, data,level) {
    console.log("extractRelationships:data]",data);
    console.log("extractRelationships:relationshipConfig]",relationshipConfig);
    if (!relationshipConfig) return null;

    const relationships = {};
    
    if (data[relationshipConfig.predecessor]) {
      console.log("row[relationshipConfig.predecessor]",data[relationshipConfig.predecessor]);
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
    console.log("relationships:conditions]]",data[relationshipConfig.condition]);

    console.log("relationships:conditions]",relationships);
    return relationships;
  },

  // Get process flow for visualization (now with duplicate-free edges)
  getProcessFlow(processes) {
    console.log("getProcessFlow:processes",processes);
    const nodes = new Map();
    const edges = new Map();

    const processNodes = (process) => {

      let combinedChildren = {};
    
      if (process.children) {
          combinedChildren = { ...combinedChildren, ...process.children };
      }
      if (process.processes) {
          combinedChildren = { ...combinedChildren, ...process.processes };
      }


      if (!nodes.has(process.id)) {
        nodes.set(process.id, {
          id: process.id,
          label: process.name,
          type: process.type,
          metadata: process.metadata,
          children:combinedChildren
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

    console.log("getProcessFlow:nodes.values()",Array.from(nodes.values()));
    console.log("getProcessFlow:edges.values()",Array.from(edges.values()));
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
  // Add direct level mappings
  L0: 'L0',
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  L4: 'L4',
  L5: 'L5',
  L6: 'L6',
  L7: 'L7'
};

// Helper function to get level config from node type
export const getLevelConfig = (nodeType) => {
  console.log("getLevelConfig:nodeType",nodeType);
  
  const levelKey = NODE_TYPE_TO_LEVEL[nodeType] || 'L0';

  console.log("getLevelConfig:levelKey",levelKey);
  console.log("getLevelConfig:ProcessDataHandler.LEVELS[levelKey]",ProcessDataHandler.LEVELS[levelKey]);

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