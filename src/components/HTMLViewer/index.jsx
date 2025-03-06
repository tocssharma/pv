import React, { useEffect, useRef } from 'react';

import { cssContent } from './styles';
import { createJsContent } from './script';
import { htmlContent } from './template';
import { levelSchema1 } from '../../lib/levels';


const ProcessViewer = (data) => {
  const iframeRef = useRef(null);
//console.log("ProcessViewer:rawdata",rawdata);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    
    console.log("ProcessViewer:data",data);

        // Generate JavaScript content with injected levelSchema
        const jsContent = createJsContent(levelSchema1, data.rawData);
    // Create a blob URL for the content
    const fullHTML = `
      <!DOCTYPE html>
      <html  style="height: 100%; margin: 0; padding: 0;">
        <head>
          <style>${cssContent}</style>
           <style>
            ${cssContent}
            /* Additional styles to ensure full height */
            body {
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            .container {
              height: calc(100vh - 80px); /* 80px accounts for the header */
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            .left-pane, .right-pane, .details-pane {
              height: 100%;
              margin: 0;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>const jsonData = ${JSON.stringify(data.rawData)};
          ${jsContent}</script>
        </body>
      </html>
    `;

    // Create blob and URL
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Set the src attribute
    iframe.src = url;

    // Cleanup
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [data.rawdata]);

  return (
    <div className="w-full h-full min-h-[400px] border border-gray-200 rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        className="flex-1 w-full h-full"
        title="Process Viewer"
        sandbox="allow-scripts allow-same-origin"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default ProcessViewer;