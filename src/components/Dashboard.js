import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Select from './Select';
import DateRangePicker from './DateRangePicker';
import DataTable from './DataTable';

const Dashboard = () => {
  // State for filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Sample data
  const data = [
    { month: 'Jan', tickets: 120, resolved: 100 },
    { month: 'Feb', tickets: 150, resolved: 130 },
    { month: 'Mar', tickets: 180, resolved: 160 },
    { month: 'Apr', tickets: 160, resolved: 140 },
  ];

  // Options for filters
  const categoryOptions = [
    { value: 'network', label: 'Network' },
    { value: 'software', label: 'Software' },
    { value: 'hardware', label: 'Hardware' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  // Table columns
  const columns = [
    { key: 'month', header: 'Month' },
    { key: 'tickets', header: 'Total Tickets' },
    { key: 'resolved', header: 'Resolved' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onStartDateChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
          onEndDateChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
        />
        <Select
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryOptions}
          placeholder="Select Category"
        />
        <Select
          value={selectedPriority}
          onChange={setSelectedPriority}
          options={priorityOptions}
          placeholder="Select Priority"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ticket Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tickets" stroke="#8884d8" />
                <Line type="monotone" dataKey="resolved" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Resolution Statistics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tickets" fill="#8884d8" />
                <Bar dataKey="resolved" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Detailed Data</h3>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Dashboard;