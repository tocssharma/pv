import React, { useEffect, useRef } from 'react';

const jsContent=`$(document).ready(function() {
    $('#file-input').on('change', function(e) {
        var file = e.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, {type: 'array'});
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];
                var jsonData = XLSX.utils.sheet_to_json(worksheet);
                var treeData = convertExcelToTree(jsonData);
                console.log("jsonData:",jsonData);
                initializeJSTree(treeData);
            } catch (error) {
                console.error('Error processing file:', error);
            }
        };
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
        };
        reader.readAsArrayBuffer(file);
    });

    function convertExcelToTree(data) {
        if (!Array.isArray(data)) {
            console.error('Invalid data format');
            return [];
        }

        const tree = [];
        const map = {};

        data.forEach((row, index) => {
            const levels = [
                { id: row['JIO Domain ID'], name: row['JIO Domain Name'] },
                { id: row['JIO Business Verticals ID'], name: row['JIO Business Verticals Name'] },
                { id: row['JIO Journey ID'], name: row['JIO Journey Name'] },
                { id: row['JIO Process Area ID'], name: row['JIO Process Area Name'] },
                { id: row['JIO Process ID1'], name: row['JIO Process Name1'] },
                { id: row['JIO Process ID2'], name: row['JIO Process Name2'] },
                { id: row['JIO Process ID3'], name: row['JIO Process Name3'] },
                { id: row['JIO Process ID4'], name: row['JIO Process Name4'] }
            ];

            let parent = '#';
            levels.forEach((level, i) => {
                if (level && level.id && level.name) {
                    const nodeId = level.id;
                    if (!map[nodeId]) {
                        const node = {
                            id: nodeId,
                            text: level.name,
                            parent: parent,
                            data: row,
                            column: i,
                            type: \`level\${i}\`
                        };
                        map[nodeId] = node;
                        tree.push(node);
                    }
                    parent = nodeId;
                }
            });
        });

        console.log("tree",tree);
        return tree;
    }

    function initializeJSTree(treeData) {
        $('#tree').jstree('destroy');
        $('#tree').jstree({
            'core' : {
                'data' : treeData,
                'themes': {
                    'name': 'default',
                    'responsive': true
                }
            },
            'plugins': ['types'],
            'types': {
                'default': {
                    'icon': 'material-icons folder'
                },
                'level0': {
                    'icon': 'material-icons domain'
                },
                'level1': {
                    'icon': 'material-icons business'
                },
                'level2': {
                    'icon': 'material-icons route'
                },
                'level3': {
                    'icon': 'material-icons category'
                },
                'level4': {
                    'icon': 'material-icons integration_instructions'
                },
                'level5': {
                    'icon': 'material-icons account_tree'
                },
                'level6': {
                    'icon': 'material-icons device_hub'
                },
                'level7': {
                    'icon': 'material-icons settings_ethernet'
                }
            }
        });

        $('#tree').on("select_node.jstree", function (e, data) {
            if (data && data.node) {
                var selectedNode = data.node;
                var parentTexts = getParentTexts(data.instance, selectedNode);

                updateBreadcrumb(parentTexts, selectedNode);
                updateNodeDetails(selectedNode);
                generateFlowchart(selectedNode);
            }
        });
    }
    $(function () {
    $("#plugins4").jstree({
    "plugins" : [ "search" ]
                        });
            var to = false;
        $('#plugins4_q').keyup(function () {
        if(to) { clearTimeout(to); }
        to = setTimeout(function () {
        var v = $('#plugins4_q').val();
        $('#plugins4').jstree(true).search(v);
        }, 250);
        });
        });
    function updateBreadcrumb(parentTexts, selectedNode) {
        var breadcrumbHtml = '';
        parentTexts.forEach(function(parent, index) {
            breadcrumbHtml += '<span data-node-id="' + parent.id + '">' + parent.text + '</span>';
            if (index < parentTexts.length - 1) {
                breadcrumbHtml += '<span class="separator"> > </span>';
            }
        });
        breadcrumbHtml += '<span class="separator"> > </span><span>' + selectedNode.text + '</span>';
        $('#breadcrumb').html(breadcrumbHtml);

        $('#breadcrumb span[data-node-id]').on('click', function() {
            var nodeId = $(this).data('node-id');
            $('#tree').jstree('deselect_all');
            $('#tree').jstree('select_node', nodeId);
        });
    }

//Show Details Styles Start


    function getParentTexts(instance, node) {
        var parentTexts = [];
        var parent = instance.get_parent(node);

        while (parent && parent !== "#") {
            var parentNode = instance.get_node(parent);
            if (parentNode) {
                parentTexts.unshift({
                    text: parentNode.text,
                    id: parentNode.id
                });
                parent = instance.get_parent(parentNode);
            } else {
                break;
            }
        }

        return parentTexts;
    }

// CSS styles as a string
const styles = \`
body {
font-family: Arial, sans-serif;
line-height: 1.6;
color: #333;
max-width: 1000px;
margin: 0 auto;
padding: 20px;
}
h1 {
color: #0066cc;
border-bottom: 2px solid #0066cc;
padding-bottom: 10px;
text-align: center;
}
ul {
padding-left: 20px;
}
li {
margin-bottom: 10px;
}
.level1 { font-weight: bold; color: #0066cc; }
.level2 { font-weight: bold; color: #009933; }
.level3 { font-weight: bold; color: #cc6600; }
.level4 { font-weight: bold; color: #990099; }
.level5 { color: #666; }
.level6 { color: #333; }
.process-details {
background-color: #f0f0f0;
padding: 10px;
border-radius: 5px;
margin-top: 5px;
}
.process-details h4 {
margin-top: 0;
}
\`;
//Collesible divs creation function start
function createCollapsibleDiv(content, isExpanded, heading) {
const htmlContent = \`
<button class="collapsible \${isExpanded ? 'active' : ''}">\${heading}</button>
<div class="content \${isExpanded ? 'expanded' : ''}">
<p>\${content}</p>
</div>
\`;
return htmlContent;
}
// Collespsible dive creation function end


function ShowDetails(data) {
let html=\`    <button class="collapsible true ? 'active' : ''">\${data.processAreaName}</button>
            <div class="content true ? 'expanded' : ''">
\`;
html += \`
    <ul>
\`;
//<style>\${styles}</style>

// JIO Domain
html += \`
<li class="level1">JIO Domain
    <ul>
        <li>ID: \${data.domainId}</li>
        <li>Name: \${data.domainName}</li>
    </ul>
</li>
\`;

// LOB/Business Verticals
html += \`
<li class="level2">JIO LOB/Business Verticals
    <ul>
        <li>ID: \${data.lobId}</li>
        <li>Name: \${data.lobName}</li>
    </ul>
</li>
\`;

// Journey
html += \`
<li class="level2">JIO Journey
    <ul>
        <li>ID: \${data.journeyId}</li>
        <li>Name: \${data.journeyName}</li>
    </ul>
</li> 
\`;

// Process Area
html += \`
<li class="level3">JIO Process Area
    <ul>
        <li>ID: \${data.processAreaId}</li>
        <li>Name: \${data.processAreaName}</li>
    </ul>
</li></div><br>
\`;



// Process Levels
function generateProcessHTML(process, level) {
let html=\`
        <li class="level\${level}">JIO Process Level \${level - 3}
        <button class="collapsible true ? 'active' : ''">\${process.name}</button>
            <div class="content true ? 'expanded' : ''">
             <div class="process-details">
            <h4>Process Details</h4>
            <ul>
                <li>JIO Process ID: \${process.id}</li>
                <li>JIO Process Name: \${process.name}</li>
                <li>ETOM Process ID: \${process.etomProcessId}</li>
                <li>Task Type: \${process.taskType}</li>
                <li>System: \${process.system}</li>
                <li>Application Type: \${process.applicationType}</li>
                <li>Actor: \${process.actor}</li>
            </ul>
        </div>
    </div></div>
</li>\`;
if (process.subProcesses && process.subProcesses.length > 0) {
    html += '<ul>';
    process.subProcesses.forEach(subProcess => {
        html += generateProcessHTML(subProcess, level + 1);
    });
    html += '</ul>';
}


return html;
}   

data.processes.forEach(process => {
html += generateProcessHTML(process, 4);
});

html += \`
    </ul>
</body>
</html>
\`;

return html;
}

    function updateNodeDetails(node) {
        if (!node) {
            console.error('Node is undefined');
            return;
        }

        var detailsHtml = '<div class="detail-card">';
        detailsHtml += '<h3>' + node.text + '</h3>';
        detailsHtml += '</div>';
        const structuredData = transformData(node.data);
        console.log("Transformed Data=",JSON.stringify(structuredData, null, 2));
                        

        if (node.data) {
            detailsHtml += ShowDetails(structuredData);
        }
        
        $('#node-details').html(detailsHtml);
        addEventListenersToCollapsibles();
        var nodeTextRow = document.getElementById('node-text-row');
        if (nodeTextRow) {
            nodeTextRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
function addEventListenersToCollapsibles() {
const collapsibles = document.querySelectorAll('.collapsible');
collapsibles.forEach(button => {
button.removeEventListener('click', toggleCollapsible);
button.addEventListener('click', toggleCollapsible);
});
}

function toggleCollapsible() {
this.classList.toggle("active");
const content = this.nextElementSibling;
content.classList.toggle("expanded");
if (content.style.maxHeight) {
content.style.maxHeight = null;
} else {
content.style.maxHeight = content.scrollHeight + "px";
}
}

    function getLevelName(level) {
        const levelNames = [
            'JIO Domain',
            'JIO Business Verticals',
            'JIO Journey',
            'JIO Process Area',
            'JIO Process 1',
            'JIO Process 2',
            'JIO Process 3',
            'JIO Process 4'
        ];
        return levelNames[level] || 'Unknown';
    }

    function generateFlowchart(node) {
        const chart = document.getElementById('flowchart');
        $("#tree").jstree("open_node", node);
        const children = $('#tree').jstree(true).get_children_dom(node);
        
        if (children.length === 0) {
            chart.innerHTML = '<p></p>';
            return;
        }

        let flowchartHtml = \`<div class="flowchart">\`;
        flowchartHtml += \`<div class="flowchart-node">\${node.text}</div>\`;
        flowchartHtml += \`<div class="flowchart-arrow"></div>\`;
        flowchartHtml += \`<div class="flowchart-children">\`;
        
        children.each(function() {
            const childNode = $('#tree').jstree(true).get_node(this);
            flowchartHtml += \`<div class="flowchart-node" data-node-id="\${childNode.id}">\${childNode.text}</div>\`;
        });
        
        flowchartHtml += \`</div></div>\`;

        chart.innerHTML = flowchartHtml;

        chart.addEventListener('click', function(event) {
            const clickedNode = event.target.closest('.flowchart-node[data-node-id]');
            if (clickedNode) {
                const nodeId = clickedNode.getAttribute('data-node-id');
                const treeInstance = $('#tree').jstree(true);
                const selectedNode = treeInstance.get_node(nodeId);
               
                treeInstance.deselect_all();
                treeInstance.select_node(nodeId);
                var parentTexts = getParentTexts(treeInstance, selectedNode);
                updateBreadcrumb(parentTexts, selectedNode);
                updateNodeDetails(selectedNode);
            }
        });
    }
function transformData(flatData) {
const result = {
domainId: flatData['JIO Domain ID'],
domainName: flatData['JIO Domain Name'],
lobId: flatData['JIO LOB/Business Verticals ID'],
lobName: flatData['JIO LOB/Business Verticals Name'],
journeyId: flatData['JIO Journey ID'],
journeyName: flatData['JIO Journey Name'],
processAreaId: flatData['JIO Process Area ID'],
processAreaName: flatData['JIO Process Area Name'],
processes: []
};

const processLevels = new Set();
const processMap = new Map();

// Identify all process levels
for (const key in flatData) {
if (key.startsWith('JIO Process ID')) {
    const level = key.replace('JIO Process ID', '');
    processLevels.add(level);
}
}

// Sort process levels
const sortedLevels = Array.from(processLevels).sort((a, b) => {
return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
});

// Create process objects
sortedLevels.forEach(level => {
const process = {
    id: flatData[\`JIO Process ID\${level}\`],
    name: flatData[\`JIO Process Name\${level}\`],
    etomProcessId: flatData[\`ETOM Process ID\${level}\`] || flatData['ETOM Process ID'],
    taskType: flatData[\`Task Type\${level}\`] || flatData['Task Type'],
    system: flatData[\`System\${level}\`] || flatData['System'],
    applicationType: flatData[\`Application Type\${level}\`] || flatData['Application Type'],
    actor: flatData[\`Actor\${level}\`] || flatData['Actor'],
    subProcesses: []
};

processMap.set(level, process);

// If it's the top level process, add it to the result
if (level === sortedLevels[0]) {
    result.processes.push(process);
} else {
    // Otherwise, find its parent and add it as a subprocess
    const parentLevel = sortedLevels[sortedLevels.indexOf(level) - 1];
    const parentProcess = processMap.get(parentLevel);
    parentProcess.subProcesses.push(process);
}
});

return result;
}

function transformData(flatData) {
const result = {
domainId: flatData['JIO Domain ID'],
domainName: flatData['JIO Domain Name'],
lobId: flatData['JIO LOB/Business Verticals ID'],
lobName: flatData['JIO LOB/Business Verticals Name'],
journeyId: flatData['JIO Journey ID'],
journeyName: flatData['JIO Journey Name'],
processAreaId: flatData['JIO Process Area ID'],
processAreaName: flatData['JIO Process Area Name'],
processes: []
};

const processLevels = new Set();
const processMap = new Map();

// Identify all process levels
for (const key in flatData) {
if (key.startsWith('JIO Process ID')) {
    const level = key.replace('JIO Process ID', '');
    processLevels.add(level);
}
}

// Sort process levels
const sortedLevels = Array.from(processLevels).sort((a, b) => {
return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
});

// Create process objects
sortedLevels.forEach(level => {
const process = {
    id: flatData[\`JIO Process ID\${level}\`],
    name: flatData[\`JIO Process Name\${level}\`],
    etomProcessId: flatData[\`ETOM Process ID\${level}\`] || flatData['ETOM Process ID'],
    taskType: flatData[\`Task Type\${level}\`] || flatData['Task Type'],
    system: flatData[\`System\${level}\`] || flatData['System'],
    applicationType: flatData[\`Application Type\${level}\`] || flatData['Application Type'],
    actor: flatData[\`Actor\${level}\`] || flatData['Actor'],
    subProcesses: []
};

processMap.set(level, process);

// If it's the top level process, add it to the result
if (level === sortedLevels[0]) {
    result.processes.push(process);
} else {
    // Otherwise, find its parent and add it as a subprocess
    const parentLevel = sortedLevels[sortedLevels.indexOf(level) - 1];
    const parentProcess = processMap.get(parentLevel);
    parentProcess.subProcesses.push(process);
}
});

return result;
}





    $(".left-pane, .right-pane, .details-pane").resizable({
        handles: 'e, w',
        minWidth: 200,
        maxWidth: 800,
        resize: function(event, ui) {
            $(this).css('width', ui.size.width);
            $(this).siblings().css('width', 'calc((100% - ' + ui.size.width + 'px) / 2)');
        }
    });


    $('#toggle-left-pane').on('click', function() {
        $('.left-pane').toggleClass('hidden');
        if ($('.left-pane').hasClass('hidden')) {
            $('.right-pane, .details-pane').css('width', 'calc(50% - 10px)');
        } else {
            $('.right-pane, .details-pane').css('width', 'calc((100% - 600px) / 2)');
        }
    });
});`;

const  cssContent=`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    font-size: 1vw;
}
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #0066cc, #1a1f24);
    color: #e6f3ff;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
header h1 {
    margin: 0;
    font-size: 2.5em;
    font-weight: 300;
    letter-spacing: 1px;
    color: inherit;
}
.collapsible {
background-color: #3498db;
color: white;
cursor: pointer;
padding: 18px;
width: 100%;
border: none;
text-align: left;
outline: none;
font-size: 16px;
transition: 0.4s;
border-radius: 5px 5px 0 0;
display: flex;
justify-content: space-between;
align-items: center;
}

.collapsible:after {
content: '\\002B';
color: white;
font-weight: bold;
float: right;
margin-left: 5px;
}

.active, .collapsible:hover {
background-color: #2980b9;
}

.active:after {
content: "\\2212";
}

.content {
padding: 0 18px;
background-color: white;
max-height: 0;
overflow: hidden;
transition: max-height 0.2s ease-out;
border-radius: 0 0 5px 5px;
box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.content.expanded {
max-height: 500px; /* Adjust as needed */
}

#output {
margin-top: 20px;
padding: 20px;
background-color: white;
border-radius: 5px;
box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

button {
background-color: #2ecc71;
color: white;
border: none;
padding: 10px 20px;
text-align: center;
text-decoration: none;
display: inline-block;
font-size: 16px;
margin: 4px 2px;
cursor: pointer;
border-radius: 5px;
transition: background-color 0.3s;
}

button:hover {
background-color: #27ae60;
}

.toggle-button {
    background: none;
    border: none;
    color: #e6f3ff;
    cursor: pointer;
    font-size: 24px;
}
.container {
    display: flex;
    max-width: 100%;
    height: calc(100vh - 80px);
    padding: 20px;
    margin: 0 auto;
    transition: all 0.3s ease;
}
.right-pane, .details-pane {
    height: 100%;
    overflow: auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin: 10px;
    resize: horizontal;
    transition: all 0.3s ease;
}
.left-pane {
    flex: 1;
    min-width: 200px;
    max-width: 600px;
    height: 100%;
    overflow: auto;
    background-color: white;
    padding: 0px;
    border-radius: 0px;
    margin: 0px;
    resize: horizontal;
    transition: all 0.3s ease;
}
.left-pane.hidden {
    margin-left: -620px;
    width: 0;
    padding: 0;
    overflow: hidden;
}
.right-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    max-width: 800px;
}
.details-pane {
    flex: 1;
    min-width: 350px;
    max-width: 1200px;
}
h1, h2, h3 {
    color: #2c3e50;
    margin-top: 0;
}
#tree {
    overflow-y: auto;
    max-height: 600px;
}
#breadcrumb {
    background-color: #e9f2f9;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}
#breadcrumb:empty {
    display: none;
}
#breadcrumb span {
    display: inline-block;
    padding: 5px 10px;
    background-color: #3498db;
    color: white;
    border-radius: 20px;
    margin-right: 10px;
    font-size: 14px;
    transition: all 0.3s ease;
    cursor: pointer;
}
#breadcrumb span:last-child {
    background-color: #2ecc71;
}
#breadcrumb span:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
#breadcrumb .separator {
    color: #fbfdfd;
    margin: 0 5px;
    cursor: default;
}
#flowchart {
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
#node-details {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    flex-grow: 1;
    overflow-y: auto;
    margin-top: 0px;
}
#file-input {
    margin-bottom: 20px;
}
.details-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    box-shadow: 0 2px 3px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
}
.details-table th, .details-table td {
    border: 1px solid #e0e0e0;
    padding: 12px 15px;
    text-align: left;
}
.details-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #333;
    text-transform: uppercase;
    font-size: 0.9em;
}
.details-table tr:nth-child(even) {
    background-color: #f9f9f9;
}
.details-table tr:hover {
    background-color: #f0f0f0;
    transition: background-color 0.3s ease;
}
.ui-resizable-handle {
    background: #f1f1f1;
    border-radius: 3px;
}
.ui-resizable-e {
    cursor: e-resize;
    width: 7px;
    right: -5px;
    top: 0;
    height: 100%;
}
.flowchart {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.flowchart-node {
    padding: 10px;
    border: 2px solid #3498db;
    border-radius: 5px;
    margin: 10px 0;
    background-color: #ecf0f1;
    cursor: pointer;
    transition: all 0.3s ease;
}
.flowchart-node:hover {
    background-color: #3498db;
    color: white;
}
.flowchart-children {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.flowchart-arrow {
    width: 2px;
    height: 20px;
    background-color: #3498db;
}
.detail-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.detail-card h3 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.4em;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
    margin-bottom: 15px;
}
.jstree-default .jstree-anchor {
    line-height: 24px;
    height: 24px;
}
.jstree-default .jstree-icon {
    width: 24px;
    height: 24px;
    line-height: 24px;
}
.jstree-default .jstree-icon.material-icons {
    font-size: 20px;
    width: 20px;
    height: 20px;
    line-height: 20px;
}
ul {
padding-left: 20px;
}
li {
margin-bottom: 10px;
}
.level1 { font-weight: bold; color: #0066cc; }
.level2 { font-weight: bold; color: #009933; }
.level3 { font-weight: bold; color: #cc6600; }
.level4 { font-weight: bold; color: #990099; }
.level5 { color: #666; }
.level6 { color: #333; }
.process-details {
background-color: #f0f0f0;
padding: 10px;
border-radius: 5px;
margin-top: 5px;
}
.process-details h4 {
margin-top: 0;
}`;
const  htmlContent=`<html><head><base href="">
<title>JIo Business Process Framework Viewer</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css" />
<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>

</head>
<body>
<header>
<h1>Jio Business Process Viewer</h1>
<button id="toggle-left-pane" class="toggle-button">
    <span class="material-icons" ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M560-280h200v-200h-80v120H560v80ZM200-480h80v-120h120v-80H200v200Zm-40 320q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/></svg></span>
</button>
</header>
<div class="container">
<div class="left-pane">
    <h1>Business Processes</h1>
    <input type="file" id="file-input" accept=".xlsx,.xls">
    <div id="tree"></div>
</div>
<div class="right-pane">
    <div id="breadcrumb"></div>
    <div id="flowchart"></div>
</div>
<div class="details-pane">
    <div id="node-details">
</div>
</div></body></html>`;

const HTMLViewer = () => {
    const iframeRef = useRef(null);
  
    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
  
      // Create a blob URL for the content
      const fullHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${cssContent || ''}</style>
          </head>
          <body>
            ${htmlContent || ''}
            <script>${jsContent || ''}</script>
          </body>
        </html>
      `;
  
      // Create blob and URL
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
  
      // Set the src attribute instead of using document.write
      iframe.src = url;
  
      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }, [htmlContent, cssContent, jsContent]);
  
    return (
      <div className="w-full h-full min-h-[400px] border border-gray-200 rounded-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          title="HTML Content Viewer"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  };
  
  export default HTMLViewer;