import React, { useState, useEffect } from 'react';
import NodeComponent from './NodeComponentcopy';
import SidePanel from './SidePanel';
import Breadcrumb from './Breadcrumb';

const ProcessFlowchart = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [processData, setProcessData] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(['JIN']);

  // Fetch or initialize process data
  useEffect(() => {
    // For testing, we'll use the data directly
    // In production, this would be fetched from an API  
  
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
    }, []);
  
/*
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
]); */
  // Handle node selection
  const handleNodeSelect = (nodeId) => {
    setSelectedNode(nodeId);
    updateBreadcrumbs(nodeId);
  };

  // Handle node hover
  const handleNodeHover = (nodeId) => {
    setHoveredNode(nodeId);
  };

  // Update breadcrumbs based on selected node
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

  // Helper function to find node by ID
  const findNodeById = (nodeId) => {
    for (const [_, nodes] of processData || []) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  };

  if (!processData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg shadow">
      {/* Breadcrumb navigation */}
      <Breadcrumb 
        items={breadcrumbs}
        onNodeSelect={handleNodeSelect}
        processData={processData}
      />
      
      <div className="flex flex-1 min-h-0">
        {/* Main flowchart area */}
        <div className="flex-1 overflow-auto p-4">
          <NodeComponent
            nodeId={selectedNode || 'JIN'}
            processData={processData}
            onNodeSelect={handleNodeSelect}
            onNodeHover={handleNodeHover}
          />
        </div>

        {/* Side panel */}
        <SidePanel
          selectedNode={findNodeById(selectedNode)}
          hoveredNode={findNodeById(hoveredNode)}
          processData={processData}
        />
      </div>
    </div>
  );
};

export default ProcessFlowchart;
