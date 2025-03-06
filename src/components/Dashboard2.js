import React, { useState, useCallback } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, Cell, Scatter, ScatterChart, RadialBarChart, RadialBar,
  ComposedChart, Treemap
} from 'recharts';
import Select from './Select';
import DateRangePicker from './DateRangePicker';
import DataTable from './DataTable';

// Utility function for CSV export
const exportToCSV = (data, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + data.map(row => Object.values(row).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Advanced Filter Component
const AdvancedFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    category: 'all',
    priority: 'all',
    team: 'all',
    status: 'all',
    slaStatus: 'all'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DateRangePicker
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          onStartDateChange={(date) => handleFilterChange('dateRange', { ...filters.dateRange, start: date })}
          onEndDateChange={(date) => handleFilterChange('dateRange', { ...filters.dateRange, end: date })}
        />
        <Select
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'network', label: 'Network' },
            { value: 'software', label: 'Software' },
            { value: 'hardware', label: 'Hardware' },
            { value: 'security', label: 'Security' }
          ]}
          placeholder="Category"
        />
        <Select
          value={filters.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ]}
          placeholder="Priority"
        />
        <Select
          value={filters.team}
          onChange={(value) => handleFilterChange('team', value)}
          options={[
            { value: 'all', label: 'All Teams' },
            { value: 'teamA', label: 'Team A' },
            { value: 'teamB', label: 'Team B' },
            { value: 'teamC', label: 'Team C' }
          ]}
          placeholder="Team"
        />
        <Select
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'inProgress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' }
          ]}
          placeholder="Status"
        />
        <Select
          value={filters.slaStatus}
          onChange={(value) => handleFilterChange('slaStatus', value)}
          options={[
            { value: 'all', label: 'All SLA Status' },
            { value: 'withinSla', label: 'Within SLA' },
            { value: 'nearBreach', label: 'Near Breach' },
            { value: 'breached', label: 'Breached' }
          ]}
          placeholder="SLA Status"
        />
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, trend, trendValue, color }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg`}>
    <h3 className={`text-lg font-semibold text-${color}-900`}>{title}</h3>
    <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
    <p className={`text-sm text-${color}-600`}>
      {trend === 'up' ? '↑' : '↓'} {trendValue}
    </p>
  </div>
);

// Interactive Chart Component with Drill-down
const InteractiveChart = ({ type, data, onDrillDown }) => {
  const [selectedData, setSelectedData] = useState(null);

  const handleClick = (data) => {
    setSelectedData(data);
    if (onDrillDown) onDrillDown(data);
  };

  // Different chart types based on the 'type' prop
  switch(type) {
    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis dataKey="y" />
            <Tooltip />
            <Legend />
            <Scatter data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    // Add more chart types as needed
    default:
      return null;
  }
};

// Main Dashboard Component
const AdvancedTicketsDashboard = () => {
  const [currentView, setCurrentView] = useState('executive');
  const [filters, setFilters] = useState({});
  const [drillDownData, setDrillDownData] = useState(null);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Apply filters to data
  }, []);

  // Handle drill-down
  const handleDrillDown = useCallback((data) => {
    setDrillDownData(data);
    // Show detailed view or modal
  }, []);

  // Export functionality
  const handleExport = useCallback((viewType) => {
    // Export different data based on view type
    let exportData;
    let filename;

    switch(viewType) {
      case 'executive':
        exportData = [/* Executive summary data */];
        filename = 'executive-summary';
        break;
      case 'operational':
        exportData = [/* Operational data */];
        filename = 'operational-metrics';
        break;
      case 'analyst':
        exportData = [/* Detailed analytics data */];
        filename = 'detailed-analytics';
        break;
      default:
        return;
    }

    exportToCSV(exportData, filename);
  }, []);

  // Render functions for different views...
  // (Previous view components remain the same but with enhanced features)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* View Selector */}
      <div className="mb-6">
        <Select
          value={currentView}
          onChange={setCurrentView}
          options={[
            { value: 'executive', label: 'Executive View' },
            { value: 'operational', label: 'Operational View' },
            { value: 'analyst', label: 'Analyst View' }
          ]}
          placeholder="Select View"
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters onFilterChange={handleFilterChange} />

      {/* Export Button */}
      <button
        onClick={() => handleExport(currentView)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Report
      </button>

      {/* View Content */}
      {/* Previous view components with enhanced features */}
    </div>
  );
};

export default AdvancedTicketsDashboard;