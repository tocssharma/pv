export const createJsContent = (levelSchema, initialData) => `
// Inject levelSchema into the script scope
const levelSchema1 = ${JSON.stringify(levelSchema, null, 2)};
console.log("createJsContent:levelSchema1",levelSchema1);
const passedData=${JSON.stringify(initialData)};
console.log("createJsContent:passedData",passedData);
//console.log("createJsContent:jsonData",JSON.parse(jsonData));

        $(document).ready(function() {

    // Initialize with provided data if available
    if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
        const treeData = convertExcelToTree(jsonData);
        console.log("Initial jsonData:", jsonData);
        initializeJSTree(treeData);
    }

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
                        //var jsonData = XLSX.utils.sheet_to_json(worksheet);
                        
                        var treeData = convertExcelToTree(jsonData);
                        //treeData = convertExcelToTree(data);
                        console.log("jsonData:",jsonData);
                        console.log("ProcessDataHandler",levelSchema1);
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
                        { id: row[levelSchema1.L0.id], name: row[levelSchema1.L0.name] },
                        { id: row[levelSchema1.L1.id], name: row[levelSchema1.L0.name] },
                        { id: row[levelSchema1.L2.id], name: row[levelSchema1.L2.name] },
                        { id: row[levelSchema1.L3.id], name: row[levelSchema1.L3.name] },
                        { id: row[levelSchema1.L4.id], name: row[levelSchema1.L4.name] },
                        { id: row[levelSchema1.L5.id], name: row[levelSchema1.L5.name] },
                        { id: row[levelSchema1.L6.id], name: row[levelSchema1.L6.name] },
                        { id: row[levelSchema1.L7.id], name: row[levelSchema1.L7.name] },
                    ];
                        console.log("levels",levelSchema1);
                    let parent = '#';
                    levels.forEach((level, i) => {
                        console.log("level in convertExcelToTree for each:",level && level.id && level.name);
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
                    console.log("data in select_node event",data);
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
let html=\`\`;
/*
    html +=\`    <button class="collapsible true ? 'active' : ''">\${data.processAreaName}</button>
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
        </li>
    \`;
*/
  html+=\`</div><br>\`;

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
        //const ButtonHeading = process.name + '   (Process Level'+ (level-3) + ')';
        //html = createCollapsibleDiv(html, true, ButtonHeading);
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
                //const treeInstance = $('#tree').jstree(true);
                //const parentstext=getParentTexts(treeInstance, node);
                const structuredData = transformData(node.data);
                console.log("Transformed Data=",JSON.stringify(structuredData, null, 2));
                                

                if (node.data) {
                /*
                   detailsHtml += '<table class="details-table">';
                    detailsHtml += '<tr><th>Property</th><th>Value</th></tr>';

                    
                    for (var key in node.data) {
                         InParentHierarchy =parentstext.find(o => (o.id === node.data[key] || o.text === node.data[key]));
                         console.log("node.data=",node.data);
                         console.log("InParentHierarchy=",InParentHierarchy);
                        if (node.data.hasOwnProperty(key) && InParentHierarchy === undefined ) {
                            detailsHtml += '<tr' + (key === 'JIO Process Name' + (node.column + 1) ? ' id="node-text-row"' : '') + '>';
                            detailsHtml += '<td>' + key + '</td>';
                            detailsHtml += '<td>' + node.data[key] + '</td>';
                            detailsHtml += '</tr>';
                        }
                    }
                    detailsHtml += '</table>'; */
                    detailsHtml += ShowDetails(structuredData);
                }
                
                //console.log("Details HTML",detailsHtml);
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
        domainId: flatData[levelSchema1.L0.id],
        domainName: flatData[levelSchema1.L0.name],
        lobId: flatData[levelSchema1.L1.id],
        lobName: flatData[levelSchema1.L1.name],
        journeyId: flatData[levelSchema1.L2.id],
        journeyName: flatData[levelSchema1.L2.name],
        processAreaId: flatData[levelSchema1.L3.id],
        processAreaName: flatData[levelSchema1.L3.name],
        processes: []
    };

    const processLevels = new Set();
    const processMap = new Map();

    console.log("flatData",flatData);
    console.log("levelSchema1",levelSchema1);
    // Identify all process levels
    for (const key in levelSchema1) {
        if (key.includes('JIO Process ID')) {
            const level = getSubstringAfter(key,'JIO Process ID');
            processLevels.add(level);
        }
    }

    for (const key in levelSchema1) {
        if (levelSchema1.hasOwnProperty(key)) {
            const id = levelSchema1[key].id;
            // Check if 'JIO Process ID' is included in the id
            if (id.includes("JIO Process ID")) {
                // Get the second character from the key
                processLevels.add(key.charAt(1));
            }
        }
    }
    


    function getSubstringAfter(mainString, searchString) {
    // Find the index of the searchString in mainString
    const index = mainString.indexOf(searchString);

    // Check if searchString was found
    if (index !== -1) {
        // Calculate the start position for substring extraction
        const startIndex = index + searchString.length; // Move past the searchString
        return mainString.substring(startIndex).trim(); // Extract and trim any leading spaces
    } else {
        return null; // Return null if searchString is not found
    }
}

    // Sort process levels
    const sortedLevels = Array.from(processLevels).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
console.log("sortedLevels",sortedLevels);
console.log("processLevels",processLevels);

    // Create process objects
    sortedLevels.forEach(level => {
        console.log(" in sorted for each level",level);
        let levelstring= \`L\${level}\`;
        console.log("levelstring",levelstring);
        //console.log("levelSchema1[levelstring].metadata[0]",levelSchema1[levelstring].metadata[0]);
        //console.log("In sorted for each Object.entries(levelSchema1[levelstring].metadata)[0]",Object.entries(levelSchema1[levelstring].metadata)[0]);
        console.log("[levelSchema1[levelstring].metadata]",flatData[levelSchema1[levelstring].metadata[0]]);
        const process = {
            id: flatData[levelSchema1[levelstring].id],
            name: flatData[levelSchema1[levelstring].name],
            etomProcessId: flatData[levelSchema1[levelstring].metadata[0]],
            taskType: flatData[levelSchema1[levelstring].metadata[1]],
            system: flatData[levelSchema1[levelstring].metadata[2]],
            applicationType: flatData[levelSchema1[levelstring].metadata[3]],
            actor: flatData[levelSchema1[levelstring].metadata[4]],
            Role: flatData[levelSchema1[levelstring].metadata[5]],
            APIDetails: flatData[levelSchema1[levelstring].metadata[6]],
            subProcesses: []
        };
        
        /*
        'L6 ETOM Process19',
        'L6 Task Type20',
        'L6 System21',
        'L6 Application Type22',
        'L6 Role',
        'L6 API Details23', */

        processMap.set(level, process);

        // If it's the top level process, add it to the result
        if (level === sortedLevels[0]) {
            result.processes.push(process);
        } else {
            if (process.id){// Otherwise, find its parent and add it as a subprocess
            const parentLevel = sortedLevels[sortedLevels.indexOf(level) - 1];
            const parentProcess = processMap.get(parentLevel);
            parentProcess.subProcesses.push(process);
                }
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

/*            fetch('URL') //From database
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(data => {
                // Handle the data
              })
              .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
              }); 
*/

            $('#toggle-left-pane').on('click', function() {
                $('.left-pane').toggleClass('hidden');
                if ($('.left-pane').hasClass('hidden')) {
                    $('.right-pane, .details-pane').css('width', 'calc(50% - 10px)');
                } else {
                    $('.right-pane, .details-pane').css('width', 'calc((100% - 600px) / 2)');
                }
            });
        });
    
`;