import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function removeDuplicates(map) {
  const uniqueMap = new Map();

  map.forEach((value, key) => {
      const uniqueEntries = value.map(item => {
          const uniqueAttributes = [];
          const attributeSet = new Set();

          item.attributes.forEach(attr => {
              const attrKeyValue = `${attr.key}:${attr.value}`; // Create a unique identifier for each attribute
              if (!attributeSet.has(attrKeyValue)) {
                  attributeSet.add(attrKeyValue);
                  uniqueAttributes.push(attr);
              }
          });

          return { ...item, attributes: uniqueAttributes };
      });

      uniqueMap.set(key, uniqueEntries);
  });

  return uniqueMap;
}

export function preprocessJSON(jsonData) {
  // Create a map of parent-child relationships
  const hierarchyMap = new Map();
  
  jsonData.nodes.forEach(node => {
      if (node.parent) {
          if (!hierarchyMap.has(node.parent)) {
              hierarchyMap.set(node.parent, []);
          }
          hierarchyMap.get(node.parent).push(node);
      }
  });
  console.log("hierarchyMap",hierarchyMap);
  return hierarchyMap;
}

export function processExcelData(data) {
  const nodes = new Set();
  const links = [];
  const nodeGroups = {};
  let groupCounter = 1;
  const nodeAttributes = {};
  const nodeRelationships = {};

  function isIdColumn(columnName) {
    return columnName.toLowerCase().includes('id');
  }

  function isRelationshipColumn(columnName) {
    return ['step type', 'predecessor', 'condition'].some(term => columnName.toLowerCase().includes(term));
  }

  data.forEach(row => {
    let currentParentId = null;
    let currentNodeId = null;
    let processName = null;
    Object.entries(row).forEach(([key, value]) => {
      if (isIdColumn(key) && value) {
        if (currentNodeId) {
          currentParentId = currentNodeId;
        }
        currentNodeId = value;
        nodes.add(currentNodeId);
        if (!nodeGroups[currentNodeId]) {
          nodeGroups[currentNodeId] = groupCounter++;
        }
        if (currentParentId) {
          links.push({ source: currentParentId, target: currentNodeId, value: 1, type: 'hierarchy' });
        }
        if (!nodeAttributes[currentNodeId]) {
          nodeAttributes[currentNodeId] = [];
        }
        if (!nodeRelationships[currentNodeId]) {
          nodeRelationships[currentNodeId] = [];
        }
      } else if (!isRelationshipColumn(key) && currentNodeId && value) {
        nodeAttributes[currentNodeId].push({ key, value });
        if ((key.toLowerCase().includes('process') && key.toLowerCase().includes('name')) || key.toLowerCase().includes('processname')) {
          processName = value;
        }
      }
    });
    if (processName) {
      nodeAttributes[currentNodeId].push({ key: 'processName', value: processName });
    }
  });

  data.forEach(row => {
    let relationshipSource = null;
    let relationshipTarget = null;
    let relationshipType = null;
    let relationshipCondition = null;

    Object.entries(row).forEach(([key, value]) => {
      if (key.toLowerCase().includes('jio process id') && value) {
        relationshipSource = value;
      } else if (key.toLowerCase().includes('predessesor') && value) {
        relationshipTarget = value;
      } else if (key.toLowerCase().includes('step type')) {
        relationshipType = value;
      } else if (key.toLowerCase().includes('condition')) {
        relationshipCondition = value;
      }
    });

    if (relationshipSource && relationshipTarget && nodes.has(relationshipSource) && nodes.has(relationshipTarget)) {
      links.push({
        source: relationshipTarget,
        target: relationshipSource,
        value: 1,
        type: relationshipType || 'relationship',
        condition: relationshipCondition
      });
      nodeRelationships[relationshipSource].push({
        predecessor: relationshipTarget,
        type: relationshipType,
        condition: relationshipCondition
      });
      nodeRelationships[relationshipTarget].push({
        successor: relationshipSource,
        type: relationshipType,
        condition: relationshipCondition
      });
    }
  });

  return {
    nodes: Array.from(nodes).map(id => ({
      id,
      group: nodeGroups[id] || 0,
      attributes: nodeAttributes[id],
      relationships: nodeRelationships[id],
      parent: links.find(link => link.target === id && link.type === 'hierarchy')?.source || null
    })),
    links: links
  };
}

export function dataProcessing (rawData)  {
  const processedExcelData = processExcelData(rawData);
  const preprocessedJSON=preprocessJSON(processedExcelData);
  const DuplicateRemovedData=removeDuplicates(preprocessedJSON);
  console.log("processedExcelData:",processedExcelData);
  console.log("preprocessedJSON:",preprocessedJSON);
  console.log("DuplicateRemovedData",DuplicateRemovedData);

  return DuplicateRemovedData;
};


// Define schema structure for validation and mapping
const SCHEMA = {
  levels: {
    L0: {
      id: "L0 JIO Domain ID",
      name: "L0 JIO Domain Name"
    },
    L1: {
      id: "L1 JIO LOB/Business Verticals ID",
      name: "L1 JIO LOB/Business Verticals Name"
    },
    L2: {
      id: "L2 JIO Journey ID",
      name: "L2 JIO Journey Name"
    },
    L3: {
      id: "L3 JIO Process Area ID",
      name: "L3 JIO Process Area Name"
    },
    L4: {
      id: "L4 JIO Process ID1",
      name: "L4 JIO Process Name1",
      attributes: {
        etomProcess: "L4 ETOM Process",
        taskType: "L4 Task Type",
        system: "L4 System",
        applicationType: "L4 Application Type",
        actor: "L4 Actor",
        apiDetails: "L4 API Details",
        stepType: "L4 Step type"
      },
      relationships: {
        predecessor: "L4 Predessesor",
        condition: "L4 Condition"
      }
    },
    L5: {
      id: "L5 JIO Process ID2",
      name: "L5 JIO Process Name2",
      attributes: {
        etomProcess: "L5 ETOM Process11",
        taskType: "L5 Task Type12",
        system: "L5 System13",
        applicationType: "L5 Application Type14",
        actor: "L5 Actor15",
        apiDetails: "L5 API Details16",
        stepType: "L5 Step type2"
      },
      relationships: {
        predecessor: "L5 Predessesor3",
        condition: "L5 Condition4"
      }
    },
    L6: {
      id: "L6 JIO Process ID3",
      name: "L6 JIO Process Name3",
      attributes: {
        etomProcess: "L6 ETOM Process19",
        taskType: "L6 Task Type20",
        system: "L6 System21",
        applicationType: "L6 Application Type22",
        role: "L6 Role",
        apiDetails: "L6 API Details23"
      }
    },
    L7: {
      id: "L7 JIO Process ID4",
      name: "L7 JIO Process Name4",
      attributes: {
        etomProcess: "L7 ETOM Process26",
        taskType: "L7 Task Type27",
        system: "L7 System28",
        applicationType: "L7 Application Type29",
        role: "L7 Role30",
        apiDetails: "L7 API Details31"
      }
    }
  }
};

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

function validateData(data, expectedColumns) {
  const errors = [];
  const firstRow = data[0];

  // Check for missing required columns
  Object.values(SCHEMA.levels).forEach(level => {
    const requiredFields = [level.id, level.name];
    requiredFields.forEach(field => {
      if (!(field in firstRow)) {
        errors.push(`Missing required column: ${field}`);
      }
    });
  });

  // Validate data consistency
  data.forEach((row, index) => {
    Object.entries(SCHEMA.levels).forEach(([levelKey, level]) => {
      const idValue = row[level.id];
      const nameValue = row[level.name];

      if (idValue && !nameValue) {
        errors.push(`Row ${index + 1}: ${levelKey} has ID but missing name`);
      }
      if (!idValue && nameValue) {
        errors.push(`Row ${index + 1}: ${levelKey} has name but missing ID`);
      }
    });
  });

  if (errors.length > 0) {
    throw new ValidationError('Data validation failed', errors);
  }
}

export function processRelationships(data) {
  try {
    // Validate data against schema
    validateData(data);

    const relationships = new Map();
    const nodes = new Map();

    // Helper function to create node ID
    const createNodeId = (level, id) => `${level}_${id}`;

    // Process each row
    data.forEach((entry, rowIndex) => {
      // Create nodes for each level
      Object.entries(SCHEMA.levels).forEach(([levelKey, levelSchema]) => {
        const id = entry[levelSchema.id];
        const name = entry[levelSchema.name];

        if (id && name) {
          const nodeId = createNodeId(levelKey, id);
          
          if (!nodes.has(nodeId)) {
            const nodeAttributes = {};
            
            // Add level-specific attributes if defined in schema
            if (levelSchema.attributes) {
              Object.entries(levelSchema.attributes).forEach(([attrKey, columnName]) => {
                nodeAttributes[attrKey] = entry[columnName];
              });
            }

            nodes.set(nodeId, {
              id: nodeId,
              level: levelKey,
              processId: id,
              name,
              attributes: nodeAttributes
            });
          }
        }
      });

      // Build hierarchical relationships
      const levelKeys = Object.keys(SCHEMA.levels);
      for (let i = 0; i < levelKeys.length - 1; i++) {
        const parentLevel = levelKeys[i];
        const childLevel = levelKeys[i + 1];
        
        const parentId = entry[SCHEMA.levels[parentLevel].id];
        const childId = entry[SCHEMA.levels[childLevel].id];

        if (parentId && childId) {
          const relationshipKey = `${createNodeId(parentLevel, parentId)}->${createNodeId(childLevel, childId)}`;
          
          if (!relationships.has(relationshipKey)) {
            relationships.set(relationshipKey, {
              type: 'parent-child',
              source: createNodeId(parentLevel, parentId),
              target: createNodeId(childLevel, childId)
            });
          }
        }
      }

      // Process predecessor relationships for each level
      Object.entries(SCHEMA.levels).forEach(([levelKey, levelSchema]) => {
        if (levelSchema.relationships?.predecessor) {
          const currentId = entry[levelSchema.id];
          const predecessorId = entry[levelSchema.relationships.predecessor];
          
          if (currentId && predecessorId) {
            const relationshipKey = `${createNodeId(levelKey, predecessorId)}->${createNodeId(levelKey, currentId)}`;
            
            if (!relationships.has(relationshipKey)) {
              relationships.set(relationshipKey, {
                type: 'predecessor-successor',
                source: createNodeId(levelKey, predecessorId),
                target: createNodeId(levelKey, currentId),
                condition: levelSchema.relationships.condition ? entry[levelSchema.relationships.condition] : null,
                stepType: levelSchema.attributes?.stepType ? entry[levelSchema.attributes.stepType] : null
              });
            }
          }
        }
      });
    });

    console.log("nodes",nodes);
    console.log("relationships",relationships);

    return {
      nodes: Array.from(nodes.values()),
      relationships: Array.from(relationships.values())
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation Errors:', error.details);
      throw error;
    }
    throw error;
  }
}