import React, { useState, useEffect, useRef } from 'react';
import NodeComponent from './NodeComponent';
import ConnectionLines from './ConnectionLines';
import SidePanel from './SidePanel';
import Breadcrumb from './Breadcrumb';

const ProcessFlowchart = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState('JIN'); // Start with root node
  const [hoveredNode, setHoveredNode] = useState(null);
  const [processData, setProcessData] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(['JIN']);
  const [nodePositions, setNodePositions] = useState(new Map());
  const svgRef = useRef(null);


  // Initialize process data
  useEffect(() => {
    
    if (data.size==0){
        console.log("setting default data to processfloeechart comonent", data);
        setProcessData(new Map([
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
        ]));
    } 
    else {
        setProcessData(data);
        console.log("setting Excel data to processfloeechart comonent",data);
    }
  }, []);

  // Get immediate children of a node
  const getChildren = (nodeId) => {
    return processData?.get(nodeId) || [];
  };

  // Find node by ID
  const findNodeById = (nodeId) => {
    if (!nodeId || !processData) return null;
    
    for (const [_, nodes] of processData) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  };

  // Handle node selection
  const handleNodeSelect = (nodeId) => {
    setSelectedNode(nodeId);
    setHoveredNode(null);
    updateBreadcrumbs(nodeId);
  };

  // Handle node hover
  const handleNodeHover = (nodeId) => {
    setHoveredNode(nodeId);
  };

  // Update breadcrumbs
  const updateBreadcrumbs = (nodeId) => {
    if (!nodeId) return;
    
    const path = [nodeId];
    let currentId = nodeId;
    
    while (currentId) {
      const currentNode = findNodeById(currentId);
      if (currentNode?.parent) {
        path.unshift(currentNode.parent);
        currentId = currentNode.parent;
      } else {
        break;
      }
    }

    setBreadcrumbs(path);
  };

  // Calculate positions for parent and immediate children only
  const calculateNodePositions = () => {
    const positions = new Map();
    const NODE_SPACING = 200;
    
    if (!selectedNode || !processData) {
      return positions;
    }
  
    // Position parent node
    positions.set(selectedNode, {
      x: 0,
      y: 0
    });
  
    // Get and position children
    const children = getChildren(selectedNode) || [];
    if (children.length > 0) {
      const totalWidth = (children.length - 1) * NODE_SPACING;
      const startX = -totalWidth / 2;
  
      children.forEach((child, index) => {
        if (child && child.id) {  // Make sure child exists and has an id
          positions.set(child.id, {
            x: startX + (index * NODE_SPACING),
            y: 120
          });
        }
      });
    }
  
    setNodePositions(positions);
    return positions;
  };

  useEffect(() => {
    if (processData && selectedNode) {
      calculateNodePositions();
    }
  }, [processData, selectedNode]);

  // Get connections between siblings
  const getSiblingConnections = () => {
    const connections = [];
    const children = getChildren(selectedNode);
    
    // Connect siblings sequentially
    for (let i = 0; i < children.length - 1; i++) {
      connections.push({
        source: children[i].id,
        target: children[i + 1].id,
        type: 'sibling',
        condition: null
      });
    }

    return connections;
  };

  // Render flowchart
  const renderFlowchart = () => {
    if (!processData || !nodePositions.size) return null;
  
    const connections = getSiblingConnections();
    const bounds = calculateBounds();
    const parentPosition = nodePositions.get(selectedNode);
  
    if (!parentPosition) return null;
  
    return (
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${bounds.minX - 100} ${bounds.minY - 50} ${bounds.width + 200} ${bounds.height + 100}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render Connections */}
        <g className="connections">
          {connections.map((conn, index) => {
            const sourcePos = nodePositions.get(conn.source);
            const targetPos = nodePositions.get(conn.target);
            if (!sourcePos || !targetPos) return null;
  
            return (
              <ConnectionLines
                key={`${conn.source}-${conn.target}-${index}`}
                sourceNode={sourcePos}
                targetNode={targetPos}
                connectionType="sibling"
              />
            );
          })}
        </g>
  
        {/* Render Parent Node */}
        <NodeComponent
          key={selectedNode}
          nodeId={selectedNode}
          position={parentPosition}
          processData={processData}
          isSelected={true}
          isHovered={hoveredNode === selectedNode}
          onSelect={handleNodeSelect}
          onHover={handleNodeHover}
        />
  
        {/* Render Children Nodes */}
        {getChildren(selectedNode).map((child) => {
          const childPosition = nodePositions.get(child.id);
          if (!childPosition) return null;
  
          return (
            <NodeComponent
              key={child.id}
              nodeId={child.id}
              position={childPosition}
              processData={processData}
              isSelected={false}
              isHovered={hoveredNode === child.id}
              onSelect={handleNodeSelect}
              onHover={handleNodeHover}
            />
          );
        })}
      </svg>
    );
  };

  // Calculate bounds for SVG viewBox
  const calculateBounds = () => {
    if (!nodePositions.size) {
      return { minX: 0, minY: 0, width: 1000, height: 1000 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodePositions.forEach(({ x, y }) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  if (!processData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg shadow">
      <Breadcrumb 
        items={breadcrumbs}
        onNodeSelect={handleNodeSelect}
        processData={processData}
      />
      
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto p-4">
          {renderFlowchart()}
        </div>

        <div className="w-96 border-l border-gray-200 p-4 overflow-y-auto">
          {/* Simplified hover panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {hoveredNode ? 'Hover Details' : 'Selected Node'}
            </h3>
            
            {(hoveredNode ? findNodeById(hoveredNode) : findNodeById(selectedNode))?.attributes.map((attr, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-500">{attr.key}</div>
                <div className="mt-1 text-sm text-gray-900">{attr.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessFlowchart;