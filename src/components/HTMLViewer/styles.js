export const cssContent = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');


 body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    font-size: 1vw;
    height: 100%;
    overflow: hidden;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #0066cc, #1a1f24);
    color: #e6f3ff;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    height: 80px;
    box-sizing: border-box;
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
    width: 100%;
    height: calc(100vh - 80px);
    margin: 0;
    padding: 10px;
    box-sizing: border-box;
    overflow: hidden;
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
            padding: 5px;
            border-radius: 0px;
            box-sizing: border-box;
            margin-right  : 5px;
            resize: horizontal;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .left-pane.hidden {
            margin-left: -620px;
            width: 0;
            padding: 0;
            overflow: hidden;
        }
  .right-pane {
    flex: 1;
    height: 100%;
    overflow: auto;
    background-color: white;
    padding: 5px;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-right: 5px;
  }
  .details-pane {
    flex: 1;
    height: 100%;
    overflow: auto;
    background-color: white;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
            height: 100%;
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
            height: calc(100% - 60px); /* Account for the breadcrumb height */
            overflow: auto;
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
  /* Rest of your CSS content */
  /* Note: The rest of the CSS remains the same, just indented properly */
`;