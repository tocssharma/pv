import React, { useState } from 'react';
import { Layers, GitBranch, Grid, Share2, Eye } from 'lucide-react';
import ProcessFlowchart from './components/ProcessFlowchart';

const App = () => {
  const [activeView, setActiveView] = useState('flowchart');
  
  // For now, we'll only handle the flowchart view
  const renderActiveView = () => {
    switch (activeView) {
      case 'flowchart':
        return <ProcessFlowchart />;
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              Process Visualizer
            </h1>
            <div className="flex items-center space-x-4">
              <button 
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium
                  ${activeView === 'flowchart' 
                    ? 'border-blue-500 text-blue-500 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveView('flowchart')}
              >
                <Layers className="w-4 h-4 mr-2" />
                Flowchart
              </button>
              {/* Other view buttons will be added here */}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default App;