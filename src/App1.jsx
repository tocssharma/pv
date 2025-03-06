import React, { useState, useEffect } from 'react';
import ProcessFlowchart from './components/ProcessFlowchart';
import KnowledgeGraph from './components/KnowledgeGraph';
import TreeView from './components/TreeView';
import ExcelViewer from './components/ExcelViewer/index3.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import MermaidChart from './components/MermaidChart';
import BpmnModeler from './components/BpmnModeler';
import ProcessFlowView from './components/ProcessFlowView';
import HTMLViewer from './components/HTMLViewer';



import { Toaster } from "./components/ui/toaster";
import { 
    Layers, 
    Share2, 
    GitBranch, 
    Grid, 
    FileText,      // Changed from FileFlow
    LayoutGrid    
  } from 'lucide-react';

import { removeDuplicates, processExcelData, preprocessJSON, dataProcessing } from "./lib/utils";
import { ProcessDataHandler } from "./lib/dataHelper";
const App = () => {
  const [processData, setProcessData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define views with their components and configurations
  const views = {
    data: {
      name: 'Data',
      component: ExcelViewer,
      requiresDataUpdate: true
    },
    flowchart: {
      name: 'Process Flow',
      component: ProcessFlowchart,
      requiresDataUpdate: false
    },
    graph: {
      name: 'Process Graph',
      component: KnowledgeGraph,
      requiresDataUpdate: false
    },
    tree: {
      name: 'Process Model',
      component: TreeView,
      requiresDataUpdate: false
    },
    mermaid: {
      name: 'Process FlowChart',
      icon: Share2,
      component: MermaidChart,
      requiresDataUpdate: false
    },
    bpmn: {
      name: 'BPMN Model',
      icon: FileText,     // Changed from FileFlow
      component: BpmnModeler,
      requiresDataUpdate: false
    },
    Process: {
      name: 'Process Viewer',
      icon: FileText,     // Changed from FileFlow
      component: ProcessFlowView,
      requiresDataUpdate: false
    },
    HTMLViewer: {
        name: 'JBPV',
        icon: FileText,     // Changed from FileFlow
        component: HTMLViewer,
        requiresDataUpdate: false
      },
    };

  

const initialData=(([
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-01",
        "L5 JIO Process Name2": "Review information of deployed Links / SPANs in the vicinity of new Link / SPAN to be constructed",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "LandBase Inventory",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-02",
        "L5 JIO Process Name2": "Construct the Planned Link / SPAN route in Landbase Inventory",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "LandBase Inventory",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-01-01",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-03",
        "L5 JIO Process Name2": "Generate Link ID / SPAN ID for Finalised Route",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "LandBase Inventory",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-01-02",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-04",
        "L5 JIO Process Name2": "Release Generated Link ID / SPAN ID to Workflow Orchestrator",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "LandBase Inventory",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-01-03",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-05",
        "L5 JIO Process Name2": "Release Scope of Link  ID / SPAN ID",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "Workflow Orchestrator",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Distribution",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-01-04",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-06",
        "L5 JIO Process Name2": "Scope Released ",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - Send",
        "L5 System13": "Workflow Orchestrator",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Distribution",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-01-04",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-02",
        "L4 JIO Process Name1": "Survey",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB/Mobile",
        "L4 Actor": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "JIN-NIC-P2B-NPD-01",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-02-01",
        "L5 JIO Process Name2": "Scope Released",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - Receive",
        "L5 System13": "Workflow Orchestrator",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "SHQ /NHQ NPE",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-02",
        "L4 JIO Process Name1": "Survey",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/",
        "L4 System": "LandBase Inventory/",
        "L4 Application Type": "WEB/Mobile",
        "L4 Actor": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "JIN-NIC-P2B-NPD-01",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-02-02",
        "L5 JIO Process Name2": "Release Link ID / SPAN ID for SURvey",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "Workflow Orchestrator",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "Central Project Controller",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-02-01",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-02",
        "L4 JIO Process Name1": "Survey",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/",
        "L4 System": "LandBase Inventory/",
        "L4 Application Type": "WEB/Mobile",
        "L4 Actor": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "JIN-NIC-P2B-NPD-01",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-02-03",
        "L5 JIO Process Name2": "SURvey Assigned ",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - Receive",
        "L5 System13": "Workflow Orchestrator",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "Central Project Controller",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-02-02",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-02",
        "L4 JIO Process Name1": "Survey",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/",
        "L4 System": "LandBase Inventory/",
        "L4 Application Type": "WEB/Mobile",
        "L4 Actor": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "JIN-NIC-P2B-NPD-01",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-02-04",
        "L5 JIO Process Name2": "Initiate Link / SPAN Field SURvey (Decision of SURvey/Construction feasibility is done here)",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "mDsurvey",
        "L5 Application Type14": "Mobile",
        "L5 Actor15": "Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM",
        "L5 API Details16": "",
        "L5 Step type2": "Normal",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-02-03",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-02",
        "L4 JIO Process Name1": "Survey",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/",
        "L4 System": "LandBase Inventory/",
        "L4 Application Type": "WEB/Mobile",
        "L4 Actor": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "JIN-NIC-P2B-NPD-01",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-02-05",
        "L5 JIO Process Name2": "Suggest alternate route ( If SURvey / Construction not Feasible )",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "mDsurvey",
        "L5 Application Type14": "Mobile",
        "L5 Actor15": "Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM",
        "L5 API Details16": "",
        "L5 Step type2": "Validation",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-02-04",
        "L5 Condition4": "Not Feasible",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-02",
        "L4 JIO Process Name1": "Survey",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/",
        "L4 System": "LandBase Inventory/",
        "L4 Application Type": "WEB/Mobile",
        "L4 Actor": "SHQ /NHQ NPE/ Central Project Controller/ Central Project Controller/ Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM/ MP O&M",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "JIN-NIC-P2B-NPD-01",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-02-06",
        "L5 JIO Process Name2": "Adjust Link alignment as per Road Condition (if SURvey / Construction Feasible)",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "mDsurvey",
        "L5 Application Type14": "Mobile",
        "L5 Actor15": "Intercity Field Engineer / Intercity MPCM / Intracity Field Engineer / Intracity MPCM",
        "L5 API Details16": "",
        "L5 Step type2": "Validation",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-02-04",
        "L5 Condition4": "Feasible",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    },
    {
        "L0 JIO Domain ID": "JIN",
        "L0 JIO Domain Name": "Jio Infra",
        "L1 JIO LOB/Business Verticals ID": "NIC",
        "L1 JIO LOB/Business Verticals Name": "NLD/Intracity",
        "L2 JIO Journey ID": "P2B",
        "L2 JIO Journey Name": "Plan to Build",
        "L3 JIO Process Area ID": "NPD",
        "L3 JIO Process Area Name": "Network Planning and Design",
        "L4 JIO Process ID1": "JIN-NIC-P2B-NPD-01",
        "L4 JIO Process Name1": "Scope and Planning",
        "L4 ETOM Process": "1.5.4.1.1",
        "L4 Task Type": "Task - User/ Send",
        "L4 System": "LandBase Inventory/ Workflow Orchestrator",
        "L4 Application Type": "WEB",
        "L4 Actor": "NHQ / SHQ Network Planning Engineering Team",
        "L4 API Details": "",
        "L4 Step type": "Normal",
        "L4 Predessesor": "",
        "L4 Condition": "",
        "L5 JIO Process ID2": "JIN-NIC-P2B-NPD-01-07",
        "L5 JIO Process Name2": "Test",
        "L5 ETOM Process11": "NA",
        "L5 Task Type12": "Task - User",
        "L5 System13": "LandBase Inventory",
        "L5 Application Type14": "WEB",
        "L5 Actor15": "NHQ / SHQ Network Planning Engineering Team",
        "L5 API Details16": "",
        "L5 Step type2": "Distribution",
        "L5 Predessesor3": "JIN-NIC-P2B-NPD-01-04",
        "L5 Condition4": "",
        "L6 JIO Process ID3": "",
        "L6 JIO Process Name3": "",
        "L6 ETOM Process19": "",
        "L6 Task Type20": "",
        "L6 System21": "",
        "L6 Application Type22": "",
        "L6 Role": "",
        "L6 API Details23": "",
        "L7 JIO Process ID4": "",
        "L7 JIO Process Name4": "",
        "L7 ETOM Process26": "",
        "L7 Task Type27": "",
        "L7 System28": "",
        "L7 Application Type29": "",
        "L7 Role30": "",
        "L7 API Details31": ""
    }
]));



  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProcessData(initialData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle data updates
  const handleDataUpdate = (newData) => {
    try {
       const updatedData=dataProcessing(newData);
      console.log('newData:', newData); // Debug 
      console.log('updatedData:', updatedData); // Debug 
      
      setProcessData(newData);


      /* // Save to backend
      fetch('/api/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: newData }),
      }).catch(error => {
        console.error('Error saving data:', error);
      }); */

    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Render component based on view type
  const renderComponent = (viewKey) => {
    const view = views[viewKey];
    if (!view) return null;

    const ViewComponent = view.component;
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden h-screen w-full flex flex-col">
        {view.requiresDataUpdate ? (
          <ViewComponent 
            data={processData} 
            onDataUpdate={handleDataUpdate}
          />
        ) : (
          <ViewComponent data={dataProcessing(processData)} rawData={processData} />
        )}
      </div>
    );
  };

  const shouldShowTabs = false;
  /*
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Tabs defaultValue="Process" className="space-y-4">
      {shouldShowTabs && (
      
      <TabsList>
            {Object.entries(views).map(([key, view]) => (
            <TabsTrigger key={key} value={key}>
                {view.name}
            </TabsTrigger>
            ))}
            </TabsList>
      
      )}

        {Object.keys(views).map((key) => (
          <TabsContent key={key} value={key}>
            {renderComponent(key)}
          </TabsContent>
        ))}
      </Tabs>

      
    </div>
  );
};*/


return (
    <div className="min-h-screen bg-gray-50 p-4">
        {renderComponent('Process')}
    </div>
  );
};
export default App;