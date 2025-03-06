import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

  // Convert the Map data structure into a more easily traversable object
  
  
  
  const processData = new Map([
    [
        "JIN",
        [
            {
                "id": "NIC",
                "group": 2,
                "attributes": [
                    {
                        "key": "L1 JIO LOB/Business Verticals Name",
                        "value": "NLD/Intracity"
                    }
                ],
                "relationships": [],
                "parent": "JIN"
            }
        ]
    ],
    [
        "NIC",
        [
            {
                "id": "P2B",
                "group": 3,
                "attributes": [
                    {
                        "key": "L2 JIO Journey Name",
                        "value": "Plan to Build"
                    }
                ],
                "relationships": [],
                "parent": "NIC"
            }
        ]
    ],
    [
        "P2B",
        [
            {
                "id": "NPD",
                "group": 4,
                "attributes": [
                    {
                        "key": "L3 JIO Process Area Name",
                        "value": "Network Planning and Design"
                    }
                ],
                "relationships": [],
                "parent": "P2B"
            }
        ]
    ],
    [
        "NPD",
        [
            {
                "id": "JIN-NIC-P2B-NPD-01",
                "group": 5,
                "attributes": [
                    {
                        "key": "L4 JIO Process Name1",
                        "value": "Scope and Planning"
                    },
                    {
                        "key": "L4 ETOM Process",
                        "value": "1.5.4.1.1"
                    },
                    {
                        "key": "L4 Task Type",
                        "value": "Task - User/ Send"
                    },
                    {
                        "key": "L4 System",
                        "value": "LandBase Inventory/ Workflow Orchestrator"
                    },
                    {
                        "key": "L4 Application Type",
                        "value": "WEB"
                    },
                    {
                        "key": "L4 Actor",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    }
                ],
                "relationships": [
                    {
                        "successor": "JIN-NIC-P2B-NPD-02-01",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "NPD"
            },
            {
                "id": "JIN-NIC-P2B-NPD-02",
                "group": 12,
                "attributes": [
                    {
                        "key": "L4 JIO Process Name1",
                        "value": "Survey"
                    },
                    {
                        "key": "L4 ETOM Process",
                        "value": "1.5.4.1.1"
                    },
                    {
                        "key": "L4 Task Type",
                        "value": "Task - User/ Send"
                    },
                    {
                        "key": "L4 System",
                        "value": "LandBase Inventory/ Workflow Orchestrator"
                    },
                    {
                        "key": "L4 Application Type",
                        "value": "WEB/Mobile"
                    },
                    {
                        "key": "L4 Actor",
                        "value": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M"
                    },
                    {
                        "key": "L4 Predessesor",
                        "value": "JIN-NIC-P2B-NPD-01"
                    },
                    {
                        "key": "L4 Task Type",
                        "value": "Task - User/"
                    },
                    {
                        "key": "L4 System",
                        "value": "LandBase Inventory/"
                    }
                ],
                "relationships": [],
                "parent": "NPD"
            }
        ]
    ],
    [
        "JIN-NIC-P2B-NPD-01",
        [
            {
                "id": "JIN-NIC-P2B-NPD-01-01",
                "group": 6,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Review information of deployed Links / SPANs in the vicinity of new Link / SPAN to be constructed"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "LandBase Inventory"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "processName",
                        "value": "Review information of deployed Links / SPANs in the vicinity of new Link / SPAN to be constructed"
                    }
                ],
                "relationships": [
                    {
                        "successor": "JIN-NIC-P2B-NPD-01-02",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            },
            {
                "id": "JIN-NIC-P2B-NPD-01-02",
                "group": 7,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Construct the Planned Link / SPAN route in Landbase Inventory"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "LandBase Inventory"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-01-01"
                    },
                    {
                        "key": "processName",
                        "value": "Construct the Planned Link / SPAN route in Landbase Inventory"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01-01",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-01-03",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            },
            {
                "id": "JIN-NIC-P2B-NPD-01-03",
                "group": 8,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Generate Link ID / SPAN ID for Finalised Route"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "LandBase Inventory"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-01-02"
                    },
                    {
                        "key": "processName",
                        "value": "Generate Link ID / SPAN ID for Finalised Route"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01-02",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-01-04",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            },
            {
                "id": "JIN-NIC-P2B-NPD-01-04",
                "group": 9,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Release Generated Link ID / SPAN ID to Workflow Orchestrator"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "LandBase Inventory"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-01-03"
                    },
                    {
                        "key": "processName",
                        "value": "Release Generated Link ID / SPAN ID to Workflow Orchestrator"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01-03",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-01-05",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-01-06",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-01-07",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            },
            {
                "id": "JIN-NIC-P2B-NPD-01-05",
                "group": 10,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Release Scope of Link  ID / SPAN ID"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "Workflow Orchestrator"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-01-04"
                    },
                    {
                        "key": "processName",
                        "value": "Release Scope of Link  ID / SPAN ID"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01-04",
                        "type": "Distribution",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            },
            {
                "id": "JIN-NIC-P2B-NPD-01-06",
                "group": 11,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Scope Released "
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - Send"
                    },
                    {
                        "key": "L5 System13",
                        "value": "Workflow Orchestrator"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-01-04"
                    },
                    {
                        "key": "processName",
                        "value": "Scope Released "
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01-04",
                        "type": "Distribution",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            },
            {
                "id": "JIN-NIC-P2B-NPD-01-07",
                "group": 19,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Test"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "LandBase Inventory"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "NHQ / SHQ Network Planning Engineering Team"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-01-04"
                    },
                    {
                        "key": "processName",
                        "value": "Test"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01-04",
                        "type": "Distribution",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-01"
            }
        ]
    ],
    [
        "JIN-NIC-P2B-NPD-02",
        [
            {
                "id": "JIN-NIC-P2B-NPD-02-01",
                "group": 13,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Scope Released"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - Receive"
                    },
                    {
                        "key": "L5 System13",
                        "value": "Workflow Orchestrator"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "SHQ /NHQ NPE"
                    },
                    {
                        "key": "processName",
                        "value": "Scope Released"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-01",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-02-02",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-02"
            },
            {
                "id": "JIN-NIC-P2B-NPD-02-02",
                "group": 14,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Release Link ID / SPAN ID for SURvey"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "Workflow Orchestrator"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "Central Project Controller"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-02-01"
                    },
                    {
                        "key": "processName",
                        "value": "Release Link ID / SPAN ID for SURvey"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-02-01",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-02-03",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-02"
            },
            {
                "id": "JIN-NIC-P2B-NPD-02-03",
                "group": 15,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "SURvey Assigned "
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - Receive"
                    },
                    {
                        "key": "L5 System13",
                        "value": "Workflow Orchestrator"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "WEB"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "Central Project Controller"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-02-02"
                    },
                    {
                        "key": "processName",
                        "value": "SURvey Assigned "
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-02-02",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-02-04",
                        "type": "Normal",
                        "condition": null
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-02"
            },
            {
                "id": "JIN-NIC-P2B-NPD-02-04",
                "group": 16,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Initiate Link / SPAN Field SURvey (Decision of SURvey/Construction feasibility is done here)"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "mDsurvey"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "Mobile"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-02-03"
                    },
                    {
                        "key": "processName",
                        "value": "Initiate Link / SPAN Field SURvey (Decision of SURvey/Construction feasibility is done here)"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-02-03",
                        "type": "Normal",
                        "condition": null
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-02-05",
                        "type": "Validation",
                        "condition": "Not Feasible"
                    },
                    {
                        "successor": "JIN-NIC-P2B-NPD-02-06",
                        "type": "Normal",
                        "condition": "Feasible"
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-02"
            },
            {
                "id": "JIN-NIC-P2B-NPD-02-05",
                "group": 17,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Suggest alternate route ( If SURvey / Construction not Feasible )"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "mDsurvey"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "Mobile"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-02-04"
                    },
                    {
                        "key": "processName",
                        "value": "Suggest alternate route ( If SURvey / Construction not Feasible )"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-02-04",
                        "type": "Normal",
                        "condition": "Not Feasible"
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-02"
            },
            {
                "id": "JIN-NIC-P2B-NPD-02-06",
                "group": 18,
                "attributes": [
                    {
                        "key": "L5 JIO Process Name2",
                        "value": "Adjust Link alignment as per Road Condition (if SURvey / Construction Feasible)"
                    },
                    {
                        "key": "L5 ETOM Process11",
                        "value": "NA"
                    },
                    {
                        "key": "L5 Task Type12",
                        "value": "Task - User"
                    },
                    {
                        "key": "L5 System13",
                        "value": "mDsurvey"
                    },
                    {
                        "key": "L5 Application Type14",
                        "value": "Mobile"
                    },
                    {
                        "key": "L5 Actor15",
                        "value": "Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM"
                    },
                    {
                        "key": "L5 Predessesor3",
                        "value": "JIN-NIC-P2B-NPD-02-04"
                    },
                    {
                        "key": "processName",
                        "value": "Adjust Link alignment as per Road Condition (if SURvey / Construction Feasible)"
                    }
                ],
                "relationships": [
                    {
                        "predecessor": "JIN-NIC-P2B-NPD-02-04",
                        "type": "Normal",
                        "condition": "Feasible"
                    }
                ],
                "parent": "JIN-NIC-P2B-NPD-02"
            }
        ]
    ]
]);



const ProcessFlowchart = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(['JIN']);
  const [nodeDetails, setNodeDetails] = useState(null);


  const getNodeName = (node) => {
    if (!node?.attributes) return node.id;
    
    const processNameAttr = node.attributes.find(attr => 
      attr.key.includes('Process Name') || attr.key === 'processName'
    );
    return processNameAttr?.value || node.id;
  };


    // Parse node ID to get hierarchy level
    const parseNodeId = (id) => {
        const parts = id.split('-');
        return {
          base: parts.slice(0, -2).join('-'), // Base part without sequence
          sequence: parts[parts.length - 2],   // Sequence number (01, 02, etc)
          step: parts[parts.length - 1],       // Step number
          level: parts.length                  // Hierarchy level
        };
      };


  // Get siblings for a node
  const getSiblings = (nodeId) => {
    const { base, sequence } = parseNodeId(nodeId);
    const allNodes = Array.from(processData.values()).flat();
    
    return allNodes.filter(node => {
      const parsedNode = parseNodeId(node.id);
      return node.id.startsWith(base) && 
             parsedNode.sequence === sequence &&
             node.id !== nodeId;
    }).sort((a, b) => {
      const stepA = parseInt(parseNodeId(a.id).step);
      const stepB = parseInt(parseNodeId(b.id).step);
      return stepA - stepB;
    });
  };

   // Get direct children (only -01 suffixed nodes)
   const getDirectChildren = (nodeId) => {
    const children = processData.get(nodeId) || [];
    return children.filter(child => child.id.endsWith('-01'));
  };
  
   // Calculate node positions with modified layout
   const calculateNodePositions = (nodeId, level = 0, index = 0) => {
    const NODE_VERTICAL_SPACING = 120;
    const NODE_HORIZONTAL_SPACING = 200;
    const positions = new Map();
    
    // Position current node
    positions.set(nodeId, {
      x: index * NODE_HORIZONTAL_SPACING,
      y: level * NODE_VERTICAL_SPACING
    });

    // Get siblings and position them horizontally
    const siblings = getSiblings(nodeId);
    siblings.forEach((sibling, idx) => {
      positions.set(sibling.id, {
        x: (index + idx + 1) * NODE_HORIZONTAL_SPACING,
        y: level * NODE_VERTICAL_SPACING
      });
    });

    // Position children below
    const children = getDirectChildren(nodeId);
    children.forEach((child, idx) => {
      const childPositions = calculateNodePositions(
        child.id,
        level + 1,
        index + idx
      );
      childPositions.forEach((pos, id) => positions.set(id, pos));
    });

    return positions;
  };


  // Get node shape based on relationships
  const getNodeShape = (nodeId) => {
    const findNode = (id) => {
      for (const [_, nodes] of processData) {
        const node = nodes.find(n => n.id === id);
        if (node) return node;
      }
      return null;
    };

    const node = findNode(nodeId);
    if (!node) return 'rectangle';

    const hasValidation = node.relationships?.some(r => r.type === 'Validation');
    const hasDistribution = node.relationships?.some(r => r.type === 'Distribution');

    if (hasValidation) return 'diamond';
    if (hasDistribution) return 'circle';
    return 'rectangle';
  };

  // Get children nodes
  const getChildren = (nodeId) => {
    const children = processData.get(nodeId) || [];
    return children.map(child => ({
      ...child,
      shape: getNodeShape(child.id)
    }));
  };

  // Handle node click
  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
    updateBreadcrumbs(nodeId);
    
    // Find node details
    for (const [_, nodes] of processData) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setNodeDetails(node);
        break;
      }
    }
  };

  // Update breadcrumbs
  const updateBreadcrumbs = (nodeId) => {
    const path = [nodeId];
    let currentId = nodeId;
    
    while (currentId) {
      for (const [_, nodes] of processData) {
        const node = nodes.find(n => n.id === currentId);
        if (node && node.parent) {
          path.unshift(node.parent);
          currentId = node.parent;
          break;
        }
      }
      if (currentId === 'JIN') break;
    }

    setBreadcrumbs(path);
  };


    
  // Render node with name
  const renderNode = (node, position) => {
    const shape = getNodeShape(node.id);
    const nodeSize = 80; // Increased size to accommodate name
    const { x, y } = position;
    const nodeName = getNodeName(node);
    
    return (
      <g 
        key={node.id} 
        transform={`translate(${x},${y})`}
        onClick={() => handleNodeClick(node.id)}
        className="cursor-pointer group"
      >
        {shape === "diamond" ? (
          <path
            d={`M0,-${nodeSize/2} L${nodeSize/2},0 L0,${nodeSize/2} L-${nodeSize/2},0 Z`}
            className="fill-blue-100 stroke-blue-500"
          />
        ) : shape === "circle" ? (
          <circle
            r={nodeSize/2}
            className="fill-green-100 stroke-green-500"
          />
        ) : (
          <rect
            x={-nodeSize/2}
            y={-nodeSize/2}
            width={nodeSize}
            height={nodeSize}
            rx={4}
            className="fill-gray-100 stroke-gray-500"
          />
        )}
        
        {/* Node ID */}
        <text
          dy="-0.5em"
          textAnchor="middle"
          className="text-xs font-medium fill-gray-700"
        >
          {node.id}
        </text>
        
        {/* Node Name */}
        <foreignObject
          x={-nodeSize/2}
          y={5}
          width={nodeSize}
          height={nodeSize-10}
        >
          <div className="w-full h-full flex items-center justify-center px-2">
            <div className="text-xs text-center line-clamp-3">
              {nodeName}
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

 // Render connector lines
 const renderConnector = (sourcePos, targetPos, type, condition) => {
    const { x: startX, y: startY } = sourcePos;
    const { x: endX, y: endY } = targetPos;

    // For sibling connections (same y position)
    if (startY === endY) {
      return (
        <path
          d={`M${startX + 40},${startY} H${endX - 40}`}
          className="stroke-gray-400 fill-none"
          markerEnd="url(#arrowhead)"
        />
      );
    }

    // For parent-child connections
    if (type === "Validation" || type === "Distribution") {
      const controlPoint1Y = startY + (endY - startY) / 2;
      
      return (
        <g>
          <path
            d={`M${startX},${startY + 40} C${startX},${controlPoint1Y} ${endX},${controlPoint1Y} ${endX},${endY - 40}`}
            className="stroke-gray-400 fill-none"
            markerEnd="url(#arrowhead)"
          />
          {condition && (
            <text
              x={(startX + endX) / 2}
              y={controlPoint1Y}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {condition}
            </text>
          )}
        </g>
      );
    }

    return (
      <path
        d={`M${startX},${startY + 40} C${startX},${startY + 80} ${endX},${endY - 80} ${endX},${endY - 40}`}
        className="stroke-gray-400 fill-none"
        markerEnd="url(#arrowhead)"
      />
    );
  };

  // Recursive function to render the tree
  const renderTree = (nodeId, positions) => {
    const currentPos = positions.get(nodeId);
    const siblings = getSiblings(nodeId);
    const children = getDirectChildren(nodeId);
    const node = { id: nodeId };

    return (
      <g key={nodeId}>
        {renderNode(node, currentPos)}
        
        {/* Render sibling connections */}
        {siblings.map((sibling, index) => {
          const siblingPos = positions.get(sibling.id);
          return (
            <g key={sibling.id}>
              {renderConnector(currentPos, siblingPos, 'Normal', null)}
              {renderNode(sibling, siblingPos)}
            </g>
          );
        })}

        {/* Render child connections */}
        {children.map(child => {
          const childPos = positions.get(child.id);
          return (
            <g key={child.id}>
              {renderConnector(
                currentPos,
                childPos,
                child.relationships?.[0]?.type,
                child.relationships?.[0]?.condition
              )}
              {renderTree(child.id, positions)}
            </g>
          );
        })}
      </g>
    );
  };
  
  // Calculate tree layout
  const treePositions = calculateNodePositions(selectedNode || 'JIN');
  const bounds = Array.from(treePositions.values()).reduce(
    (acc, pos) => ({
      minX: Math.min(acc.minX, pos.x),
      maxX: Math.max(acc.maxX, pos.x),
      minY: Math.min(acc.minY, pos.y),
      maxY: Math.max(acc.maxY, pos.y)
    }),
    { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2 p-4 bg-gray-50">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb}>
            <button
              onClick={() => handleNodeClick(crumb)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {crumb}
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Flowchart */}
        <div className="flex-1 relative overflow-auto">
          <svg 
            className="w-full h-full"
            viewBox={`${bounds.minX - 100} ${bounds.minY - 50} ${bounds.maxX - bounds.minX + 200} ${bounds.maxY - bounds.minY + 100}`}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  className="fill-gray-400"
                />
              </marker>
            </defs>
            
            {renderTree(selectedNode || 'JIN', treePositions)}
          </svg>
        </div>

        {/* Node details sidebar */}
        {nodeDetails && (
          <div className="w-80 border-l border-gray-200 p-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{nodeDetails.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nodeDetails.attributes?.map((attr, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">{attr.key}</div>
                      <div className="text-sm">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessFlowchart;