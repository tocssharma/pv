import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { DataViewer } from './importUtils';
import  ProcessDataHandler  from '../../lib/dataHelper';
import MultiPaneDataViewer from './MultiPaneDataViewer'
import { node } from 'prop-types';

import { processExcelData } from './Excel-Processor';

const VALID_STEP_TYPES = ['Normal', 'Distribution', 'Validation'];
const LEVELS=ProcessDataHandler.LEVELS;

  
 const ExcelProcessor = () => {
  const [processingResult, setProcessingResult] = useState(null);
  const [error, setError] = useState(null);


  const createValidation = (type, message, rowIndex, column = null, nodeId = null) => {
    const location = column 
      ? `Row ${rowIndex}, ${column}`
      : `Row ${rowIndex}`;
  
    return {
      type,
      message,
      location,
      rowIndex,
      column,
      nodeId
    };
  };


  const validateIdFormat = (id, level) => {
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

  
  // Helper function to check if header is an ID or Name column from LEVELS
const isLevelColumn = (header) => {
    return Object.values(LEVELS).some(level => 
      level.id === header || level.name === header
    );
  };



  // Helper to build grandparent ID
const buildGrandparentId = (node, nodes) => {
    const parts = [];
    let currentNode = node;
    let depth = parseInt(node.level.substring(1));
    
    // Start from the current node and work backwards
    while (currentNode && currentNode.level !== 'L0') {
      parts.unshift(currentNode.id);
      currentNode = nodes.find(n => n.id === currentNode.parentId);
    }
    
    // Add L0 node if found
    if (currentNode && currentNode.level === 'L0') {
      parts.unshift(currentNode.id);
    }
    
    // For L4+ nodes, include all parts
    // For L3 nodes, include up to L0-L1-L2
    // For L2 nodes, include up to L0-L1
    const maxParts = depth <= 4 ? depth : 4;
    return parts.slice(0, maxParts).join('-');
  };


// Helper function to get complete path for a node
const getNodePath = (node, nodes) => {
    const parts = [node.id];
    let currentNode = node;
    
    while (currentNode.parentId) {
      const parent = nodes.find(n => n.id === currentNode.parentId);
      if (!parent) break;
      parts.unshift(parent.id);
      currentNode = parent;
    }
    
    return parts.join('-');
  };
  
  // Helper function to validate L4 node parent relationship
  const validateL4NodeParent = (node, parentNode, nodes) => {
    if (node.level !== 'L4' || !node.grandparentId) {
      return true; // Only validate L4 nodes with grandparentId
    }
    
    if (parentNode) {
      const parentPath = getNodePath(parentNode, nodes);
      return node.grandparentId === parentPath;
    }
    
    return false;
  };


// Helper to collect lineage information for a node
const collectLineage = (row, currentLevel) => {
    const lineage = {};
    
    // Collect all parent level IDs up to current level
    for (let i = 0; i <= parseInt(currentLevel.substring(1)); i++) {
      const levelPrefix = `L${i}`;
      const idKey = `${levelPrefix}_ID`;
      lineage[idKey] = row[idKey];
    }
    
    return lineage;
  };
  
  // Helper to validate lineage match between node and parent
  const validateLineage = (node, parentNode, allNodes) => {
    if (!node.lineage || !parentNode.lineage) return false;
    
    // Get parent level number
    const parentLevel = parseInt(parentNode.level.substring(1));
    
    // Check all ancestor levels match
    for (let i = 0; i <= parentLevel; i++) {
      const levelKey = `L${i}_ID`;
      if (node.lineage[levelKey] !== parentNode.lineage[levelKey]) {
        console.log(`Lineage mismatch for node ${node.id} at ${levelKey}:`,
          `Expected: ${node.lineage[levelKey]},`,
          `Found: ${parentNode.lineage[levelKey]}`);
        return false;
      }
    }
    return true;
  };


  const buildHierarchy1 = (nodes) => {
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

  

  const validatePredecessorRelationship = (node, allNodes, rowIndex) => {
    const validations = [];
    
    const levelDef = LEVELS[node.level];
    if (levelDef?.relationship) {
      const predecessorField = levelDef.relationship.predecessor;
      const predecessorId = node.relationship[predecessorField];
      
      if (predecessorId) {
        const siblings = allNodes.filter(n => n.parentId === node.parentId);
        if (!siblings.some(s => s.id === predecessorId)) {
          validations.push({
            type: 'error',
            message: `Invalid predecessor: ${predecessorId}. Predecessor must be an existing sibling node.`,
            location: `Row ${rowIndex + 1}, ${predecessorField} column`
          });
        }
      }
    }
    
    return validations;
  };

  const validateValidationNodeSuccessors = (nodes) => {
    const changes = [];
    const validations = [];
    
    nodes.forEach((node, index) => {
      const levelDef = LEVELS[node.level];
      const stepTypeField = levelDef?.metadata?.find(field => field.toLowerCase().includes('step type'));
      
      if (stepTypeField && node.metadata[stepTypeField]?.toLowerCase() === 'validation') {
        // Find successors using proper relationship fields
        const successors = nodes.filter(n => {
          const nLevelDef = LEVELS[n.level];
          const predecessorField = nLevelDef?.relationship?.predecessor;
          return predecessorField && n.relationship[predecessorField] === node.id;
        });
        
        // Rest of validation logic remains similar but uses proper field names
        if (successors.length > 2) {
          validations.push(createValidation(
            'error',
            `Validation node ${node.id} has more than 2 successors`,
            index + 1,
            'Predecessors',
            node.id
          ));
        } else if (successors.length === 2) {
          // Check conditions using proper field names
          const hasNegativeCondition = successors.some(s => {
            const conditionField = LEVELS[s.level]?.relationship?.condition;
            return conditionField && 
                   (s.relationship[conditionField]?.toLowerCase().includes('no') || 
                    s.relationship[conditionField]?.toLowerCase().includes('not'));
          });
          
          if (!hasNegativeCondition) {
            const firstSuccessor = successors[0];
            const conditionField = LEVELS[firstSuccessor.level]?.relationship?.condition;
            if (conditionField) {
              firstSuccessor.relationship[conditionField] = 'No';
              changes.push({
                type: 'fix',
                message: `Added "No" condition to successor node ${firstSuccessor.id} of validation node ${node.id}`,
                location: `Row ${nodes.indexOf(firstSuccessor) + 1}, ${conditionField} column`
              });
            }
          }
        }
      }
    });
    
    return { changes, validations };
  };

const validateNode = (node, allNodes, rowIndex) => {
    const validations = [];
    
    // ID format validation
    const idValidation = validateIdFormat(node.id, node.level);
    if (!idValidation.isValid) {
      validations.push(createValidation(
        'error',
        idValidation.error,
        rowIndex + 1,
        'ID',
        node.id
      ));
    }

    // Name validation
    if (!node.name) {
      node.name = node.id;
      validations.push(createValidation(
        'warning',
        'Name missing, using ID as name',
        rowIndex + 1,
        'Name',
        node.id
      ));
    }

    // Step type validation
    if (node.stepType && !VALID_STEP_TYPES.includes(node.stepType)) {
      node.stepType = 'Normal';
      validations.push(createValidation(
        'warning',
        'Invalid step type, defaulting to Normal',
        rowIndex + 1,
        'Step Type',
        node.id
      ));
    }

    // Sibling ID uniqueness
    const siblings = allNodes.filter(n => n.parentId === node.parentId && n.id !== node.id);
    if (siblings.some(s => s.id === node.id)) {
      validations.push({
        type: 'error',
        message: `Duplicate sibling ID found`,
        location: `Row ${rowIndex + 1}, ID column`
      });
    }

    return validations;
  };

// Helper function to find a node in the hierarchy by ID
const findNodeInHierarchy = (hierarchy, nodeId, level) => {
    // Check direct children
    for (const key in hierarchy) {
      if (key === nodeId) return hierarchy[key];
      
      // Check nested children recursively
      if (hierarchy[key].children) {
        const found = findNodeInHierarchy(hierarchy[key].children, nodeId, level);
        if (found) return found;
      }
    }
    return null;
  };



  const collectMetadataForNode = (row, headers, level) => {
    const metadata = {};
    const levelDef = LEVELS[level];
    
    // If level has defined metadata fields
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
  const collectRelationshipForNode = (row, headers, level) => {
    const relationship = {};
    const levelDef = LEVELS[level];
    

  
    // If level has defined relationships
    if (levelDef.relationship) {
      // Get predecessor and condition fields
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
    // Helper function to determine level from ID format
const determineLevelFromFormat = (id) => {
    if (!id) return null;
    const parts = id.split('-');
    return `L${parts.length - 1}`; // e.g., "JCB-HOM-PLM" has 3 parts, so it's L2
  };

  // Helper function to get parent ID
  const getParentId = (id) => {
    const parts = id.split('-');
    return parts.slice(0, -1).join('-');
  };

  
// Helper function to check if ID is valid
const isValidId = (id) => {
    return id !== null && id !== undefined && id.toString().trim() !== '';
  };
  
  // Helper function to check if node already exists in the global nodes array
const isDuplicateNode = (nodes, newNode) => {
    return nodes.some(existingNode => {
      // If IDs don't match, definitely not a duplicate
      if (existingNode.id !== newNode.id) return false;
      
      // If levels don't match, not a duplicate
      if (existingNode.level !== newNode.level) return false;
      
      // If either node doesn't have lineage, compare just IDs (fallback)
      if (!existingNode.lineage || !newNode.lineage) {
        console.warn(`Warning: Missing lineage for node comparison ${existingNode.id}`);
        return existingNode.id === newNode.id;
      }
      
      // Get the level number to know how many ancestors to check
      const level = parseInt(newNode.level.substring(1));
      
      // Check all ancestor levels in the lineage
      for (let i = 0; i <= level; i++) {
        const levelKey = `L${i}_ID`;
        if (existingNode.lineage[levelKey] !== newNode.lineage[levelKey]) {
          return false;
        }
      }
      
      // If we get here, all ancestors match - it's a true duplicate
      return true;
    });
  };
  

  
  const processL0ToL3Nodes = (row, headers) => {
    const nodesForRow = [];

    const convertRowWithHeaders=(row, headers)=>{

      const rowWithHeaders=[];
      for(let i=0;i<headers.length;i++){
        rowWithHeaders[headers[i]]= row[i];
      }
      return rowWithHeaders;
    }
    // Process in order from L0 to L10 to maintain parent relationships
    for (let i = 0; i <= 10; i++) {
      const level = `L${i}`;
      const levelDef = LEVELS[level];
      
      if (!levelDef) continue;
      
      const idColIndex = headers.indexOf(levelDef.id);
      const nameColIndex = headers.indexOf(levelDef.name);
      
      if (idColIndex !== -1) {
        const id = row[idColIndex];
        
        // Skip if ID is not valid
        if (!isValidId(id)) {
          console.log(`Skipping node with invalid ID at level ${level}`);
          continue;
        }
        
        const name = nameColIndex !== -1 ? row[nameColIndex] : null;
        
        // Find parent ID
        let parentId = null;
        if (i > 0) {
          const parentLevel = `L${i-1}`;
          const parentIdCol = headers.indexOf(LEVELS[parentLevel].id);
          if (parentIdCol !== -1) {
            parentId = row[parentIdCol];
          }
        }
  
        // Collect metadata and relationship data
        const metadata = collectMetadataForNode(row, headers, level);
        const relationship = collectRelationshipForNode(row, headers, level);
        
        // Collect lineage information
        const lineage = {};
        for (let j = 0; j <= i; j++) {
          const lineageLevel = `L${j}`;
          const lineageIdCol = headers.indexOf(LEVELS[lineageLevel].id);
          if (lineageIdCol !== -1) {
            lineage[`${lineageLevel}_ID`] = row[lineageIdCol];
          }
        }
    
        const type=levelDef.type;
        const rowWithHeaders=convertRowWithHeaders(row, headers);


        const relationships= ProcessDataHandler.extractRelationships(row, levelDef.relationship, rowWithHeaders);
        console.log("processL0ToL3Nodes:relationships",relationships);
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
        
        // Check for duplicates using enhanced lineage check
        if (!isDuplicateNode(nodesForRow, newNode)) {
          nodesForRow.push(newNode);
        } else {
          console.log(`Skipping duplicate node with ID ${id} at level ${level} and lineage:`, 
            Object.entries(lineage)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')
          );
        }
      }
    }
  
    return nodesForRow;
  };

  
/*
   const processExcelData = async (file,DBData) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        cellDates: true,
        cellStyles: true,
        cellNF: true,
        sheetStubs: true
      });
  
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const rowsWithHeaders = XLSX.utils.sheet_to_json(worksheet);
      
      const rowsHeaders=DBData[0];
      const rowsWithoutHeaders=DBData[1];
      

      console.log("processExcelData:rows",rows);    
      console.log("processExcelData:DBData:Headers",rowsHeaders);    
      console.log("processExcelData:DBData:rowsWithoutHeaders",rowsWithoutHeaders);    
      

      // Validate basic data structure
      if (!Array.isArray(rows) || rows.length < 2) {
        throw new Error('Invalid Excel structure: File must contain headers and data rows');
      }
  
      const headers = rows[0];

      
      if (!Array.isArray(headers) || headers.length === 0) {
        throw new Error('Invalid Excel structure: No headers found');
      }
  
      const dataRows = rows.slice(1);
      console.log("processExcelData:DBData:Headers",rowsHeaders);    
      console.log("processExcelData:DBData:rowsWithoutHeaders",rowsWithoutHeaders);    


      const nodes = [];
      const validations = [];
      const duplicateNodes = [];
  
      // Process each row
      for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
        const row = dataRows[rowIndex];
        
        try {

          // Process L0-L10 nodes, passing the accumulated nodes for grandparentId calculation
          const L0toL3Nodes = processL0ToL3Nodes(row, headers, nodes);
          console.log("Nodes After processL0ToL3Nodes",L0toL3Nodes);
          // Check for duplicates against existing nodes before adding
          L0toL3Nodes.forEach(newNode => {
            if (!isDuplicateNode(nodes, newNode)) {
              nodes.push(newNode);
            } else {
              duplicateNodes.push({
                id: newNode.id,
                level: newNode.level,
                lineage: newNode.lineage,
                rowIndex: rowIndex + 2 // Adding 2 to account for 0-based index and header row
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
          console.error(`Error processing row ${rowIndex + 2}:`, rowError);
          validations.push(createValidation(
            'error',
            rowError.message,
            rowIndex + 2
          ));
        }
      }
  
      console.log("L0toL3Nodes DulicationNodes",duplicateNodes);
      console.log("L0toL3Nodes nodes After DulicationCheck",nodes);
      // Validate we have some nodes after processing
      if (nodes.length === 0) {     
        throw new Error('No valid nodes found in the Excel file');
      }
  
      console.log("Processed nodes:", nodes);
      
      // Validate validation nodes and their successors
      const validationResults = validateValidationNodeSuccessors(nodes);
      const validationNodeChanges = validationResults?.changes || [];
      const validationNodeValidations = validationResults?.validations || [];
      validations.push(...validationNodeValidations);
  
      // Build hierarchy with error handling
      const hierarchyResults = buildHierarchy1(nodes);
      
      if (!hierarchyResults) {
        throw new Error('Failed to build node hierarchy');
      }
  
      const { hierarchy, orphans } = hierarchyResults;
      
      console.log("ProcessExcelData:hierarchyResults",hierarchyResults );

      // Generate summary
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
        duplicateNames: findDuplicateNames(nodes),
        validationNodeChanges: validationNodeChanges
      };
  
      // Calculate nodes per level
      nodes.forEach(node => {
        summary.nodesPerLevel[node.level] = (summary.nodesPerLevel[node.level] || 0) + 1;
      });
  
      // Set the results in state
      setProcessingResult({ nodes, hierarchy, summary });
      
      setError(null);
  
      // Return the processed data
      return {
        nodes,
        hierarchy,
        validations,
        summary
      };
  
    } catch (err) {
      console.error('Error processing Excel file:', err);
      const errorMessage = err.message || 'Unknown error occurred while processing Excel file';
      setError(errorMessage);
      setProcessingResult(null);
      
      // Throw the error to be handled by the caller
      throw new Error(`Error processing Excel file: ${errorMessage}`);
    }
  }; */


  

  const processExcelDataForParent = async (file, parentNodeId, parentLineage) => {
    console.log("processExcelDataForParent:parentNodeId", parentNodeId);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        cellDates: true,
        cellStyles: true,
        cellNF: true,
        sheetStubs: true
      });
  
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
       // Create validations with proper location
       const createValidation = (type, message, rowIndex, column, nodeId) => ({
        type,
        message,
        location: `Row ${rowIndex}, ${column || ''}`,
        rowIndex,
        column,
        nodeId,
        parentNodeId
    });


      // Validate basic data structure
      if (!Array.isArray(rows) || rows.length < 2) {
        throw new Error('Invalid Excel structure: File must contain headers and data rows');
      }
  
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      const nodes = [];
      const validations = [];
      const discardedNodes = [];
  
      // Helper function to check if a node should be included based on parent
      const isRelevantNode = (node) => {
        if (!node.lineage) return false;
  
        // If parentLineage is provided, check if this node's lineage matches up to parent's level
        if (parentLineage) {
          const parentLevel = parseInt(parentLineage.level.substring(1));
          for (let i = 0; i <= parentLevel; i++) {
            const levelKey = `L${i}_ID`;
            if (node.lineage[levelKey] !== parentLineage.lineage[levelKey]) {
              return false;
            }
          }
          return true;
        }
  
        // Otherwise, check if node is a descendant of parentNodeId
        return node.lineage[`L${parentLineage.level.substring(1)}_ID`] === parentNodeId;
      };
  
      // Process rows
      dataRows.forEach((row, rowIndex) => {
        try {
          // Process nodes with lineage information
          const processedNodes = processL0ToL3Nodes(row, headers);
          
          // Filter for relevant nodes and add them
          processedNodes.forEach(node => {
            if (isRelevantNode(node)) {
              nodes.push(node);
            } else {
              discardedNodes.push({
                node,
                reason: 'not_relevant_to_parent'
              });
              validations.push(createValidation(
                'warning',
                `Node ${node.id} not relevant to parent ${parentNodeId}`,
                rowIndex + 2,
                'ID',
                node.id
            ));
            }
          });
  
        } catch (rowError) {
          console.error(`Error processing row ${rowIndex + 2}:`, rowError);
          validations.push(createValidation(
            'error',
            rowError.message,
            rowIndex + 2,
            null,
            null
        ));
        }
      });
  
      // Build hierarchy starting from parent node
      const { hierarchy, orphans, validationErrors, dispositionSummary } = buildHierarchy1(nodes);
  
      // If parent node isn't in hierarchy but we have relevant nodes, create its entry
      if (parentNodeId && !hierarchy[parentNodeId] && nodes.length > 0) {
        hierarchy[parentNodeId] = {
          id: parentNodeId,
          level: parentLineage.level,
          lineage: parentLineage.lineage,
          children: {}
        };
  
        // Add direct children to the parent
        nodes
          .filter(node => node.parentId === parentNodeId)
          .forEach(node => {
            hierarchy[parentNodeId].children[node.id] = {
              ...node,
              children: {}
            };
          });
      }
  
      // Generate comprehensive summary
      const summary = {
        totalNodes: nodes.length + discardedNodes.length,
        nodesPerLevel: {},
        validations: validations.map(v => ({
          ...v,
          location: v.location || `Row ${v.rowIndex}, ${v.column || ''}`,
          parentNodeId: parentNodeId
      })),
        orphanNodes: orphans.length,
        parentNodeId,
        dispositionSummary: {
          ...dispositionSummary,
          discardedBeforeProcessing: {
            total: discardedNodes.length,
            nodes: discardedNodes
          }
        }
      };
      
      // Calculate nodes per level
      nodes.forEach(node => {
        summary.nodesPerLevel[node.level] = (summary.nodesPerLevel[node.level] || 0) + 1;
      });
  
      console.log("Final hierarchy for parent:", hierarchy);
      console.log("Summary:", summary);
  
   // Adjust validation locations for the parent context
   const adjustValidationLocations = (validations, parentNodeId) => {
    return validations.map(validation => ({
      ...validation,
      location: `${parentNodeId}:${validation.location}`,
      parentNodeId // Add parent context
    }));
  };

  // Process and adjust validations
  const adjustedValidations = adjustValidationLocations(validations, parentNodeId);


      return { nodes, hierarchy, summary };
  
    } catch (error) {
      throw new Error('Error processing Excel: ' + error.message);
    }
  };



  const findDuplicateNames = (nodes) => {
    const names = {};
    const duplicates = [];
    
    nodes.forEach((node, index) => {
      if (names[node.name]) {
        duplicates.push({
          name: node.name,
          locations: [names[node.name], index + 1]
        });
      } else {
        names[node.name] = index + 1;
      }
    });
    
    return duplicates;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const { nodes, hierarchy, validations } = await processExcelData(file, null, LEVELS, ProcessDataHandler,'file');
        
        console.log("processexceldata:Import result:", nodes, hierarchy, validations);
        // Build the summary object
        const summary = {
          totalNodes: nodes.length,
          orphanNodes: nodes.filter(node => !node.parentId).length,
          nodesPerLevel: {},
          validations: validations || []
        };
        
        // Calculate nodes per level
        nodes.forEach(node => {
          summary.nodesPerLevel[node.level] = (summary.nodesPerLevel[node.level] || 0) + 1;
        });

        setProcessingResult({ nodes, hierarchy, summary });
        setError(null);
      } catch (err) {
        setError('Error processing Excel file: ' + err.message);
        setProcessingResult(null);
      }
    }
  };

  const handleFileUploadForParent = async (event, parentNodeId, parentLineage) => {
    const file = event.target.files[0];
    if (file) {
        try {


            const result = await processExcelDataForParent(file, parentNodeId, parentLineage);
            console.log("Import result:", result);

            const adjustValidationLocations = (validations, parentNodeId, baseRowCount) => {
              return validations.map(v => ({
                ...v,
                location: v.location.includes('Row') 
                  ? `${parentNodeId}:${v.location}`  // Prefix with parent node ID
                  : v.location
              }));
            };

            setProcessingResult(prevResult => {
                // Create new hierarchy by deep cloning
                const newHierarchy = JSON.parse(JSON.stringify(prevResult.hierarchy));
                
                // Find the node to update
                const updateNodeChildren = (obj) => {
                    for (const key in obj) {
                        if (key === parentNodeId) {
                            // Keep the existing node but update its children
                            obj[key] = {
                                ...obj[key],
                                children: {
                                    ...result.hierarchy[parentNodeId]?.children || {}
                                }
                            };
                            console.log("Updated node in hierarchy:", obj[key]);
                            return true;
                        }
                        if (obj[key].children && updateNodeChildren(obj[key].children)) {
                            return true;
                        }
                    }
                    return false;
                };

                // Update the hierarchy
                updateNodeChildren(newHierarchy);
                console.log("Updated full hierarchy:", newHierarchy);

                // Update nodes array
                const updatedNodes = [
                    ...prevResult.nodes.filter(node => !node.id.startsWith(parentNodeId + '-')),
                    ...result.nodes
                ];

                const adjustedValidations = adjustValidationLocations(
                  result.summary.validations,
                  parentNodeId,
                  prevResult.nodes.length
                );

                   // Ensure all validations have proper location
    const ensureValidationLocation = (validation) => {
      if (!validation.location) {
          return {
              ...validation,
              location: `Row ${validation.rowIndex}, ${validation.column || ''}`
          };
      }
      return validation;
  };
                
                return {
                    nodes: updatedNodes,
                    hierarchy: newHierarchy,
                    summary: {
                        ...prevResult.summary,
                        totalNodes: updatedNodes.length,
                        nodesPerLevel: {},
                        validations: [
                          ...prevResult.summary.validations
                              .filter(v => !v.location?.includes(parentNodeId))
                              .map(ensureValidationLocation),
                          ...result.summary.validations.map(ensureValidationLocation)
                      ]
                    }
                };
            });

            return result;
        } catch (err) {
            setError('Error processing Excel file: ' + err.message);
            throw err;
        }
    }
};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Excel Data Processor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!processingResult && (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx,.xls" />
              </label>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processingResult && processingResult.summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Processing Summary</h3>
                  <p>Total Nodes: {processingResult.summary.totalNodes || 0}</p>
                  <p>Orphan Nodes: {processingResult.summary.orphanNodes || 0}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Nodes per Level</h3>
                  {Object.entries(processingResult.summary?.nodesPerLevel || {}).map(([level, count]) => (
                    <p key={level}>{level}: {count}</p>
                  ))}
                </div>
              </div>

              <MultiPaneDataViewer
                rowData={processingResult.nodes || []}
                hierarchicalData={processingResult.hierarchy || {}}
                validations={processingResult.summary?.validations || []}
                onFileUpload={handleFileUploadForParent}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelProcessor;