export const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <base href="">
    <title>JIo Business Process Framework Viewer</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"><\/script>
    
    

</head>
<body>
    <header>
        <h1>Jio Business Process Viewer</h1>
        <button id="toggle-left-pane" class="toggle-button">
            <span class="material-icons"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M560-280h200v-200h-80v120H560v80ZM200-480h80v-120h120v-80H200v200Zm-40 320q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/></svg></span>
        </button>
    </header>
    <div class="container">
        <div class="left-pane">
            <h1>Business Processes</h1>
            <div id="tree"></div>
        </div>
        <div class="right-pane">
            <div id="breadcrumb"></div>
            <div id="flowchart"></div>
        </div>
        <div class="details-pane">
            <div id="node-details"></div>
        </div>
    </div>
</body>
</html>
`;
