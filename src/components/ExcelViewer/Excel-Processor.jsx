import * as XLSX from 'xlsx';

// Constants
const VALID_STEP_TYPES = ['Normal', 'Distribution', 'Validation'];

// Helper Functions
const createValidation = (type, message, rowIndex, column = null, nodeId = null) => {
  const location = column ? `Row ${rowIndex}, ${column}` : `Row ${rowIndex}`;
  return { type, message, location, rowIndex, column, nodeId };
};

const validateIdFormat = (id, level, LEVELS) => {
  const format = LEVELS[level].idformat;
  const parts = id.split('-');
  const formatParts = format.split('-');
  
  if (parts.length !== formatParts.length) {
    return {
      isValid: false,
      error: `Invalid ID format for ${level}. Expected format: ${format}`
    };
  }
  return { isValid: true };
};

const isValidId = (id) => {
  return id !== null && id !== undefined && id.toString().trim() !== '';
};

const isDuplicateNode = (nodes, newNode) => {
  return nodes.some(existingNode => {
    if (existingNode.id !== newNode.id) return false;
    if (existingNode.level !== newNode.level) return false;
    
    if (!existingNode.lineage || !newNode.lineage) {
      console.warn(`Warning: Missing lineage for node comparison ${existingNode.id}`);
      return existingNode.id === newNode.id;
    }
    
    const level = parseInt(newNode.level.substring(1));
    for (let i = 0; i <= level; i++) {
      const levelKey = `L${i}_ID`;
      if (existingNode.lineage[levelKey] !== newNode.lineage[levelKey]) {
        return false;
      }
    }
    return true;
  });
};

const collectMetadataForNode = (row, headers, level, LEVELS) => {
  const metadata = {};
  const levelDef = LEVELS[level];
  
  if (levelDef.metadata) {
    levelDef.metadata.forEach(metadataField => {
      const metadataColIndex = headers.indexOf(metadataField);
      if (metadataColIndex !== -1) {
        metadata[metadataField] = row[metadataColIndex];
      }
    });
  }
  return metadata;
};

const collectRelationshipForNode = (row, headers, level, LEVELS) => {
  const relationship = {};
  const levelDef = LEVELS[level];
  
  if (levelDef.relationship) {
    const predecessorField = levelDef.relationship.predecessor;
    const conditionField = levelDef.relationship.condition;
    
    const predecessorColIndex = headers.indexOf(predecessorField);
    const conditionColIndex = headers.indexOf(conditionField);
    
    if (predecessorColIndex !== -1) {
      relationship[predecessorField] = row[predecessorColIndex];
    }
    if (conditionColIndex !== -1) {
      relationship[conditionField] = row[conditionColIndex];
    }
  }
  return relationship;
};

const processL0ToL3Nodes = (row, headers, LEVELS, ProcessDataHandler) => {
  const nodesForRow = [];
  
  const convertRowWithHeaders = (row, headers) => {
    const rowWithHeaders = [];
    for (let i = 0; i < headers.length; i++) {
      rowWithHeaders[headers[i]] = row[i];
    }
    return rowWithHeaders;
  };

  for (let i = 0; i <= 10; i++) {
    const level = `L${i}`;
    const levelDef = LEVELS[level];
    
    if (!levelDef) continue;
    
    const idColIndex = headers.indexOf(levelDef.id);
    const nameColIndex = headers.indexOf(levelDef.name);
    
    if (idColIndex !== -1) {
      const id = row[idColIndex];
      
      if (!isValidId(id)) {
        console.log(`Skipping node with invalid ID at level ${level}`);
        continue;
      }
      
      const name = nameColIndex !== -1 ? row[nameColIndex] : null;
      let parentId = null;
      
      if (i > 0) {
        const parentLevel = `L${i-1}`;
        const parentIdCol = headers.indexOf(LEVELS[parentLevel].id);
        if (parentIdCol !== -1) {
          parentId = row[parentIdCol];
        }
      }

      const metadata = collectMetadataForNode(row, headers, level, LEVELS);
      const relationship = collectRelationshipForNode(row, headers, level, LEVELS);
      const lineage = {};
      
      for (let j = 0; j <= i; j++) {
        const lineageLevel = `L${j}`;
        const lineageIdCol = headers.indexOf(LEVELS[lineageLevel].id);
        if (lineageIdCol !== -1) {
          lineage[`${lineageLevel}_ID`] = row[lineageIdCol];
        }
      }

      const type = levelDef.type;
      const rowWithHeaders = convertRowWithHeaders(row, headers);
      const relationships = ProcessDataHandler.extractRelationships(row, levelDef.relationship, rowWithHeaders);

      const newNode = {
        id,
        name,
        level,
        type,
        parentId,
        metadata,
        relationship,
        relationships,
        lineage
      };
      
      if (!isDuplicateNode(nodesForRow, newNode)) {
        nodesForRow.push(newNode);
      }
    }
  }
  return nodesForRow;
};

const buildHierarchy = (nodes) => {
    console.log("buildHierarchy:nodes", nodes);
    const hierarchy = {};
    const orphans = [];
    const validationErrors = [];
    
    // Track all node dispositions
    const nodeDisposition = {
      total: nodes.length,
      included: [],
      discarded: {
        orphaned: [],
        invalidLineage: [],
        duplicates: [],
        missingParent: [],
        other: []
      }
    };
  
    // Helper function to track node disposition
    const trackNodeDisposition = (node, status, reason) => {
      if (status === 'included') {
        nodeDisposition.included.push({
          id: node.id,
          level: node.level,
          lineage: node.lineage
        });
      } else {
        nodeDisposition.discarded[reason].push({
          id: node.id,
          level: node.level,
          lineage: node.lineage,
          reason: reason
        });
      }
    };
  
    const deepCloneChildren = (children) => {
      const clone = {};
      Object.entries(children).forEach(([key, value]) => {
        clone[key] = {
          ...value,
          children: value.children ? deepCloneChildren(value.children) : {}
        };
      });
      return clone;
    };
  
    const findNodeByLineage = (hierarchy, lineage, level) => {
      if (level === 'L0') return hierarchy[lineage['L0_ID']] || null;
  
      const levelNum = parseInt(level.substring(1));
      let current = hierarchy[lineage['L0_ID']];
      
      for (let i = 1; i < levelNum; i++) {
        if (!current?.children) return null;
        const levelKey = `L${i}_ID`;
        const nodeId = lineage[levelKey];
        current = current.children[nodeId];
        if (!current) return null;
      }
      
      return current;
    };
  
    const processL3Nodes = (node) => {
      if (node.level === 'L3') {
        node.processes = deepCloneChildren(node.children);
      }
      if (node.children) {
        Object.values(node.children).forEach(child => {
          processL3Nodes(child);
        });
      }
    };
  
    // Sort nodes by level
    const sortedNodes = [...nodes].sort((a, b) => 
      parseInt(a.level.substring(1)) - parseInt(b.level.substring(1))
    );
  
    // Process each node
    sortedNodes.forEach(node => {
      console.log(`Processing node: ${node.id} (${node.level})`);
  
      if (node.level === 'L0') {
        hierarchy[node.id] = { 
          ...node, 
          children: {},
          lineage: node.lineage
        };
        trackNodeDisposition(node, 'included');
        return;
      }
  
      if (!node.lineage) {
        trackNodeDisposition(node, 'discarded', 'invalidLineage');
        validationErrors.push({
          type: 'error',
          nodeId: node.id,
          message: 'Missing lineage information'
        });
        return;
      }
  
      const parent = findNodeByLineage(hierarchy, node.lineage, node.level);
  
      if (parent) {
        const nodeWithChildren = {
          ...node,
          children: {},
          lineage: node.lineage
        };
  
        if (node.level === 'L3') {
          parent.children[node.id] = {
            ...nodeWithChildren,
            processes: {}
          };
        } else {
          parent.children[node.id] = nodeWithChildren;
        }
        trackNodeDisposition(node, 'included');
      } else {
        console.log(`Could not find parent in hierarchy for node: ${node.id}`);
        orphans.push(node);
        trackNodeDisposition(node, 'discarded', 'missingParent');
        validationErrors.push({
          type: 'error',
          nodeId: node.id,
          level: node.level,
          lineage: node.lineage,
          message: 'Could not find parent in hierarchy using lineage path'
        });
      }
    });
  
    Object.values(hierarchy).forEach(rootNode => {
      processL3Nodes(rootNode);
    });
  
    // Generate disposition summary
    const dispositionSummary = {
      totalNodes: nodeDisposition.total,
      includedNodes: nodeDisposition.included.length,
      discardedNodes: {
        total: Object.values(nodeDisposition.discarded)
          .reduce((sum, arr) => sum + arr.length, 0),
        byReason: Object.entries(nodeDisposition.discarded)
          .reduce((acc, [reason, nodes]) => ({
            ...acc,
            [reason]: nodes.length
          }), {})
      },
      details: nodeDisposition
    };
  
    console.log("Node Disposition Summary:", dispositionSummary);
    console.log("Built hierarchy", hierarchy);
  
    return {
      hierarchy,
      orphans,
      validationErrors,
      dispositionSummary
    };
  };

/**
 * Process Excel data and create a hierarchical structure
 * @param {File} file - The Excel file to process
 * @param {Array} DBData - Array containing [headers, rows] from the database
 * @param {Object} LEVELS - Level definitions
 * @param {Object} ProcessDataHandler - Handler for processing data
 * @returns {Promise<Object>} Processed data including nodes, hierarchy, and validations
 */
export const processExcelData = async (file, DBData, LEVELS, ProcessDataHandler, source = 'file') => {
    try {
        let rows;
        let headers;
        let datarows;
        if (source === 'file') {
          // Handle file input
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, {
            cellDates: true,
            cellStyles: true,
            cellNF: true,
            sheetStubs: true
          });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          headers = rows[0];
          rows = rows.slice(1);
        } else if (source === 'DB') {
          // Combine ProcessDataHandler.headers with DBData
          headers = ProcessDataHandler.Headers;
          const rowData = DBData;
          
          // Transform the row data to match headers
          rows = rowData.map(row => {
            // Create an array matching the length of headers, initialized with null
            const transformedRow = new Array(headers.length).fill(null);
            
            // Map each value from the row to its corresponding header position
            Object.entries(row).forEach(([key, value]) => {
              const headerIndex = headers.indexOf(key);
              if (headerIndex !== -1) {
                transformedRow[headerIndex] = value;
              }
            });
            
            return transformedRow;
          });
    
          console.log("Combined data:", {
            headers,
            rows,
            rowCount: rows.length,
            headerCount: headers.length
          });
        } else {
          throw new Error('Invalid source specified');
        }
    
        // Validate data structure
        if (!Array.isArray(headers) || headers.length === 0) {
          throw new Error('Invalid data structure: No headers found');
        }
    
        if (!Array.isArray(rows) || rows.length === 0) {
          throw new Error('Invalid data structure: No data rows found');
        }


    console.log("processing headers rows.slice(0)",rows[0]);    
    const nodes = [];
    const validations = [];
    const duplicateNodes = [];

    // Process each row
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      
      try {
        const L0toL3Nodes = processL0ToL3Nodes(row, headers, LEVELS, ProcessDataHandler);
        
        L0toL3Nodes.forEach(newNode => {
          if (!isDuplicateNode(nodes, newNode)) {
            nodes.push(newNode);
          } else {
            duplicateNodes.push({
              id: newNode.id,
              level: newNode.level,
              lineage: newNode.lineage,
              rowIndex: rowIndex + 2
            });
            validations.push(createValidation(
              'warning',
              `Duplicate node found: ${newNode.id}`,
              rowIndex + 2,
              'ID',
              newNode.id
            ));
          }
        });
      } catch (rowError) {
        validations.push(createValidation(
          'error',
          rowError.message,
          rowIndex + 2
        ));
      }
    }

    if (nodes.length === 0) {
      throw new Error('No valid nodes found in the Excel file');
    }

    const hierarchyResults = buildHierarchy(nodes);
    
    if (!hierarchyResults) {
      throw new Error('Failed to build node hierarchy');
    }

    const { hierarchy, orphans, validationErrors, dispositionSummary } = hierarchyResults;

    const summary = {
      totalNodes: nodes.length,
      nodesPerLevel: {},
      validations,
      orphanNodes: orphans.length,
      duplicateNodes: duplicateNodes.map(dup => ({
        ...dup,
        lineageString: Object.entries(dup.lineage)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      })),
      dispositionSummary
    };

    nodes.forEach(node => {
      summary.nodesPerLevel[node.level] = (summary.nodesPerLevel[node.level] || 0) + 1;
    });

    return {
      nodes,
      hierarchy,
      validations,
      summary
    };

  } catch (err) {
    console.error('Error processing Excel file:', err);
    throw new Error(`Error processing Excel file: ${err.message}`);
  } 
};

export default {
  processExcelData,
  // Export helper functions if needed externally
  createValidation,
  validateIdFormat,
  isDuplicateNode
};