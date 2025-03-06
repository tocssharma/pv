export const levelSchema1= {
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
        condition: 'L4 Condition',
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
        condition: 'L5 Condition4',
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
  };
  const levelSchema2= {
    L0: {
      id: 'JIO Domain ID',
      name: 'JIO Domain Name',
    },
    L1: {
      id: 'JIO LOB/Business Verticals ID',
      name: 'JIO LOB/Business Verticals Name',
    },
    L2: {
      id: 'JIO Journey ID',
      name: 'JIO Journey Name',
    },
    L3: {
      id: 'JIO Process Area ID',
      name: 'JIO Process Area Name',
    },
    L4: {
      id: 'JIO Process ID1',
      name: 'JIO Process Name1',
      metadata: [
        'ETOM Process',
        'Task Type',
        'System',
        'Application Type',
        'Actor',
        'API Details',
        'Step type',
      ],
      relationship: {
        predecessor: 'Predessesor',
        condition: 'Condition',
      },
    },
    L5: {
      id: 'JIO Process ID2',
      name: 'JIO Process Name2',
      metadata: [
        'ETOM Process11',
        'Task Type12',
        'System13',
        'Application Type14',
        'Actor15',
        'API Details16',
        'Step type2',
      ],
      relationship: {
        predecessor: 'Predessesor3',
        condition: 'Condition4',
      },
    },
    L6: {
      id: 'JIO Process ID3',
      name: 'JIO Process Name3',
      metadata: [
        'ETOM Process19',
        'Task Type20',
        'System21',
        'Application Type22',
        'Role',
        'API Details23',
      ],
    },
    L7: {
      id: 'JIO Process ID4',
      name: 'JIO Process Name4',
      metadata: [
        'ETOM Process26',
        'Task Type27',
        'System28',
        'Application Type29',
        'Role30',
        'API Details31',
      ],
    },
  }