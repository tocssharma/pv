import React, { createContext, useContext, useState, useEffect } from 'react';
const DataContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004';
const API_CHECK_ENDPOINT = process.env.REACT_APP_API_CHECK_ENDPOINT || '/api/excel-data/check';
const API_DATA_ENDPOINT = process.env.REACT_APP_API_DATA_ENDPOINT || '/api/excel-data';



export const DataProvider = ({ children }) => {
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
    
    //const [data, setData] = useState(initialData);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);


  // Load initial data from database
  useEffect(() => {
    const checkAndFetchData = async () => {
        try {
          setLoading(true);
          setError(null);  // Clear any previous errors
          //http://10.144.115.110:3003/
 
          // Check if data exists
          const checkResponse = await fetch(`${API_BASE_URL}${API_CHECK_ENDPOINT}`);
          //const checkResponse = await fetch('http://10.144.115.110:3004/api/excel-data/check');
          
          const { hasData } = await checkResponse.json();
          
          if (hasData) {
            const response = await fetch(`${API_BASE_URL}${API_DATA_ENDPOINT}`);
            //const response = await fetch('http://10.144.115.110:3004/api/excel-data');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text(); // Get raw response text
            console.log('Raw response:', text); // Debug log
            
            try {
              const initialData = JSON.parse(text);
              setData(Array.isArray(initialData) ? initialData : []);
              setIsInitialDataLoaded(true);
            } catch (parseError) {
              console.error('JSON Parse Error:', parseError);
              console.log('Problematic response:', text);
              throw new Error('Invalid JSON response from server');
            }
          } else {
            setIsInitialDataLoaded(false);
            setData([]);
          }
        } catch (err) {
          console.error('Error checking/fetching data:', err);
          setError(err.message);
          setIsInitialDataLoaded(false);
        } finally {
          setLoading(false);
        }
      };

    checkAndFetchData();
  }, []);



  // Update data both in state and database
 const updateData = async (newData) => {
  console.log("updateData:newData",newData);
  let isCancelled = false;
    try {
        setLoading(true);
        setError(null);
      // Update local state
      

      // Save to database
      //http://10.144.115.110:3003/
      const response = await fetch(`${API_BASE_URL}${API_DATA_ENDPOINT}`, {
      
      //const response = await fetch('http://10.144.115.110:3004/api/excel-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: newData }),
      });

      if (isCancelled) return;

      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      setData(newData);
      setIsInitialDataLoaded(true);

    } catch (err) {
        if (!isCancelled) {
            console.error('Error saving data:', err);
            setError(err.message);
            throw err;
          }
    }finally {
        if (!isCancelled) {
            setLoading(false);
          }
      }

      return () => {
        isCancelled = true;
      };
  };

  return (
    
    <DataContext.Provider value={{ 
      data, 
      updateData, 
      loading, 
      error,
      isInitialDataLoaded,
      setError 
    }}>
      {children}
    </DataContext.Provider>
  );
};


  

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error('useData must be used within a DataProvider');
    }
    return context;
  };
