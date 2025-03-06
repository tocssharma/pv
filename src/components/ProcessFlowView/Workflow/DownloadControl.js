import React, { useState } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';
import { useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import * as htmlToImage from 'html-to-image';
import Papa from 'papaparse';

const DownloadControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getNodes, getEdges, viewport } = useReactFlow();

  const getExpandedBounds = (nodes, edges) => {
    const nodesBounds = getRectOfNodes(nodes);
    const expandedBounds = { ...nodesBounds };
    
    // First expand bounds for edges
    edges.forEach(edge => {
      if (edge.sourceHandle && edge.targetHandle) {
        const sourceHandleEl = document.querySelector(`[data-handleid="${edge.sourceHandle}"]`);
        const targetHandleEl = document.querySelector(`[data-handleid="${edge.targetHandle}"]`);
        
        if (sourceHandleEl) {
          const rect = sourceHandleEl.getBoundingClientRect();
          expandedBounds.x = Math.min(expandedBounds.x, rect.x);
          expandedBounds.y = Math.min(expandedBounds.y, rect.y);
          expandedBounds.width = Math.max(expandedBounds.width, rect.x - expandedBounds.x + rect.width);
          expandedBounds.height = Math.max(expandedBounds.height, rect.y - expandedBounds.y + rect.height);
        }
        if (targetHandleEl) {
          const rect = targetHandleEl.getBoundingClientRect();
          expandedBounds.x = Math.min(expandedBounds.x, rect.x);
          expandedBounds.y = Math.min(expandedBounds.y, rect.y);
          expandedBounds.width = Math.max(expandedBounds.width, rect.x - expandedBounds.x + rect.width);
          expandedBounds.height = Math.max(expandedBounds.height, rect.y - expandedBounds.y + rect.height);
        }
      }
    });

    // Then include node header in bounds calculation
    const headerElement = document.querySelector('.node-header-extended');
    //console.log("getExpandBounds:headerElement",headerElement);
    if (headerElement) {
        console.log("getExpandBounds:headerElement",headerElement);
      const headerRect = headerElement.getBoundingClientRect();
      console.log("getExpandBounds:headerRect",headerRect);
      
      expandedBounds.x = Math.min(expandedBounds.x, headerRect.x);
      expandedBounds.y = Math.min(expandedBounds.y, headerRect.y);
      expandedBounds.width = Math.max(expandedBounds.width, headerRect.x - expandedBounds.x + headerRect.width);
      expandedBounds.height = Math.max(expandedBounds.height, headerRect.y - expandedBounds.y + headerRect.height+50);
    }



    console.log("getExpandBounds:headerRect:including header",expandedBounds);

    // Add padding
    const padding = 50;
    expandedBounds.x -= padding;
    expandedBounds.y -= padding;
    expandedBounds.width += padding * 2;
    expandedBounds.height += padding * 2;

    return expandedBounds;
  };
  
    // Create a wrapper function for all downloads that also closes the dropdown
  const handleDownload = (downloadFunction) => async () => {
    try {
      await downloadFunction();
    } finally {
      setIsOpen(false); // Close dropdown after download
    }
  };

  
  // Function to remove all controls before taking screenshot
  const hideControls = () => {
    const elements = document.querySelectorAll(`
      .react-flow__panel,
      .react-flow__controls,
      .react-flow__attribution,
      button,
      [role="button"],
      .absolute
    `);
    elements.forEach(el => {
      if (!el.classList.contains('react-flow__edge') && 
          !el.classList.contains('react-flow__node') &&
          !el.classList.contains('node-header-extended')) {
        el.style.visibility = 'hidden';
      }
    });
  };

  // Function to restore controls after screenshot
  const showControls = () => {
    const elements = document.querySelectorAll(`
      .react-flow__panel,
      .react-flow__controls,
      .react-flow__attribution,
      button,
      [role="button"]
    `);
    elements.forEach(el => {
        if (!el.classList.contains('node-header-extended')) {
            el.style.visibility = 'visible';
          }
    });
  };


  // Helper function to get DOM path
function getNodePath(el) {
    let path = [];
    while (el.parentNode) {
      path.unshift(el.nodeName + (el.className ? '.' + el.className : ''));
      el = el.parentNode;
    }
    return path.join(' > ');
  }


  const downloadSvg = async () => {
    try {
      const flowElement = document.querySelector('.react-flow');
      if (!flowElement) return;

      hideControls();


 // Create temporary copies of headers
 const headers = document.querySelectorAll('.node-header-extended');
   const copy = headers[0].cloneNode(true);
   const rect = headers[0].getBoundingClientRect();

           // Simplify the header structure
           const headerContent = copy.querySelector('h1')?.textContent || '';
           copy.innerHTML = `
           <div style="padding: 10px 0 30px 0;">
             <h1 style="font-size: 24px; font-weight: 600; margin: 0; padding: 0;">${headerContent}</h1>
             <div style="height: 4px; width: 80px; background: rgb(59, 130, 246); border-radius: 9999px; margin: 8px auto;"></div>
           </div>
         `;
   copy.style.position = 'absolute';
   copy.style.left = '50%';
   copy.style.transform = 'translateX(-50%)';
   copy.style.top = '2px';
   copy.style.width = `${rect.width}px`;
   copy.style.height = `${rect.height}px`;
   copy.style.zIndex = '1000';
   copy.style.textAlign = 'center';
   flowElement.appendChild(copy);
   //headerCopies.push(copy);
 

      const nodes = getNodes();
      const edges = getEdges();
      const bounds = getExpandedBounds(nodes, edges);

      console.log('downloadSvg:Header hierarchy:', 
        Array.from(document.querySelectorAll('.node-header-extended')).map(el => ({
          path: getNodePath(el),
          styles: window.getComputedStyle(el)
        }))
      );

      const header = document.querySelector('.node-header-extended');
const originalStyles = {
  position: header.style.position,
  zIndex: header.style.zIndex
};

// Before generation
header.style.position = 'relative';
header.style.zIndex = '1000';

// After generation
header.style.position = originalStyles.position;
header.style.zIndex = originalStyles.zIndex;


const headerRect = document.querySelector('.node-header-extended').getBoundingClientRect();
    console.log('downloadSvg:Header bounds:', headerRect);
    console.log('downloadSvg:Is header within flow bounds:', 
  headerRect.top >= bounds.y && 
  headerRect.left >= bounds.x &&
  headerRect.right <= bounds.x + bounds.width &&
  headerRect.bottom <= bounds.y + bounds.height
);

      const svgString = await htmlToImage.toSvg(flowElement, {
        width: bounds.width,
        height: bounds.height,
        style: {
          background: '#f9fafb'
        },
        filter: (node) => {
          // Include node-header-extended while excluding control elements
          const exclude = [
            'react-flow__panel',
            'react-flow__controls',
            'react-flow__attribution',
            'lucide'
          ];
          
          // Allow node-header-extended through
          if (node.className?.includes?.('node-header-extended')) {
            console.log('downloadSvg:Including node-header-extended');
            return true;
          }


          
          const shouldInclude = !exclude.some(className => 
            node.className?.includes?.(className)
          );
          console.log('downloadSvg:Final decision:', shouldInclude);
          return shouldInclude;

        /*
          // Filter out control elements
          return !exclude.some(className => 
            node.className?.includes?.(className)
          );*/

        }
        
      });

      copy.remove();          

      const link = document.createElement('a');
      link.download = 'workflow-diagram.svg';
      link.href = svgString;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating SVG:', error);
    } finally {
      showControls();
    }
  };

  const downloadPng = async () => {
    try {
      const flowElement = document.querySelector('.react-flow');
      if (!flowElement) return;

      hideControls();

      const nodes = getNodes();
      const edges = getEdges();
      const bounds = getExpandedBounds(nodes, edges);

      const dataUrl = await htmlToImage.toPng(flowElement, {
        width: bounds.width,
        height: bounds.height,
        pixelRatio: 2,
        style: {
          background: '#f9fafb'
        },
        filter: (node) => {
          // Include node-header-extended while excluding control elements
          const exclude = [
            'react-flow__panel',
            'react-flow__controls',
            'react-flow__attribution',
            'lucide'
          ];
          
          // Allow node-header-extended through
          if (node.className?.includes?.('node-header-extended')) {
            return true;
          }
          
          // Filter out control elements
          return !exclude.some(className => 
            node.className?.includes?.(className)
          );
        }
      });

      const link = document.createElement('a');
      link.download = 'workflow-diagram.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PNG:', error);
    } finally {
      showControls();
    }
  };

  const downloadJson = () => {
    const nodes = getNodes();
    const edges = getEdges();
    const flowData = { nodes, edges, viewport };
    
    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow-diagram.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const nodes = getNodes();
    const edges = getEdges();

    // Prepare nodes data
    const nodesData = nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.data?.label || '',
      positionX: node.position.x,
      positionY: node.position.y,
      width: node.width,
      height: node.height,
      ...node.data // Spread additional node data
    }));

    // Prepare edges data
    const edgesData = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      label: edge.label,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      condition: edge.data?.condition || ''
    }));

    // Create two CSV files - one for nodes and one for edges
    const nodesBlob = new Blob(
      [Papa.unparse(nodesData, { header: true })], 
      { type: 'text/csv;charset=utf-8;' }
    );
    const edgesBlob = new Blob(
      [Papa.unparse(edgesData, { header: true })], 
      { type: 'text/csv;charset=utf-8;' }
    );

    // Download nodes CSV
    const nodesUrl = URL.createObjectURL(nodesBlob);
    const nodesLink = document.createElement('a');
    nodesLink.href = nodesUrl;
    nodesLink.download = 'workflow-nodes.csv';
    document.body.appendChild(nodesLink);
    nodesLink.click();
    document.body.removeChild(nodesLink);
    URL.revokeObjectURL(nodesUrl);

    // Download edges CSV
    setTimeout(() => {
      const edgesUrl = URL.createObjectURL(edgesBlob);
      const edgesLink = document.createElement('a');
      edgesLink.href = edgesUrl;
      edgesLink.download = 'workflow-edges.csv';
      document.body.appendChild(edgesLink);
      edgesLink.click();
      document.body.removeChild(edgesLink);
      URL.revokeObjectURL(edgesUrl);
    }, 100);
  };

  const buttonClass = "w-full px-3 py-2 text-left hover:bg-gray-100 text-sm flex items-center gap-2";

  
  return (
    <div className="download-controls-button">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50 
                     border border-gray-200 text-sm text-gray-600
                     flex items-center gap-2"
        >
          <Download size={16} />
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white rounded-md shadow-lg 
                          border border-gray-200 overflow-hidden min-w-[160px] z-10">
            <button onClick={handleDownload(downloadSvg)} className={buttonClass}>
              Download SVG
            </button>
            <button onClick={handleDownload(downloadPng)} className={buttonClass}>
              Download PNG
            </button>
            <button onClick={handleDownload(downloadJson)} className={buttonClass}>
              Download JSON
            </button>
            <button onClick={handleDownload(downloadCsv)} className={buttonClass}>
              Download CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadControls;