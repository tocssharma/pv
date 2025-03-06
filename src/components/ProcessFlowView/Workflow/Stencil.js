import React, { useState } from 'react';
import { Panel } from 'reactflow';
import { Shapes, X, Box, Circle, Diamond, Triangle, Component } from 'lucide-react';

const Stencil = () => {
  const [isOpen, setIsOpen] = useState(false);

  const nodes = [
    {
      type: 'custom',
      label: 'Process Node',
      icon: Component,
      template: {
        type: 'custom',
        data: {
          label: 'New Process',
          metadata: {
            'System': '',
            'Application': '',
            'L4 Step type': 'process',
            'L5 Step type2': 'normal'
          }
        },
        style: { width: 280, height: 100 }
      }
    },
    {
      type: 'shape',
      label: 'Circle',
      icon: Circle,
      template: { type: 'circle' }
    },
    {
      type: 'shape',
      label: 'Square',
      icon: Box,
      template: { type: 'square' }
    },
    {
      type: 'shape',
      label: 'Diamond',
      icon: Diamond,
      template: { type: 'diamond' }
    },
    {
      type: 'shape',
      label: 'Triangle',
      icon: Triangle,
      template: { type: 'triangle' }
    }
  ];

  const onDragStart = (event, nodeType, template) => {
    const data = {
      nodeType,
      ...template
    };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <Panel position="top-left" className="m-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 
                     transition-all duration-200 ease-in-out
                     ${isOpen ? 'rotate-180' : ''}`}
          title={isOpen ? "Close nodes" : "Show nodes"}
        >
          <Shapes size={20} className="text-gray-600" />
        </button>
      </Panel>

      <div
        className={`
          fixed top-4 left-16 
          transition-all duration-300 ease-in-out
          ${isOpen 
            ? 'translate-x-0 opacity-100 visible' 
            : '-translate-x-full opacity-0 invisible'
          }
        `}
      >
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-sm">Drag nodes to canvas</div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-2">
            {nodes.map((node) => (
              <div
                key={`${node.type}-${node.label}`}
                className={`
                  p-2 cursor-grab 
                  rounded-lg border border-gray-200
                  flex items-center gap-2
                  transition-all duration-200
                  hover:shadow-md hover:border-blue-300 hover:bg-gray-50
                  active:cursor-grabbing
                `}
                onDragStart={(e) => onDragStart(e, node.type, node.template)}
                draggable
                title={`Drag ${node.label} to canvas`}
              >
                <node.icon size={20} className="text-gray-600" />
                <span className="text-sm">{node.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Stencil;