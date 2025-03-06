import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import Select from './Select';
import DateRangePicker from './DateRangePicker';
import DataTable from './DataTable';

const TicketsDashboard = () => {
  const [currentView, setCurrentView] = useState('executive');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample data
  const monthlyData = [
    { month: 'Jan', tickets: 520, resolved: 480, satisfaction: 94, responseTime: 2.1 },
    { month: 'Feb', tickets: 580, resolved: 550, satisfaction: 92, responseTime: 1.8 },
    { month: 'Mar', tickets: 620, resolved: 590, satisfaction: 95, responseTime: 1.5 },
    { month: 'Apr', tickets: 550, resolved: 530, satisfaction: 93, responseTime: 1.6 },
  ];

  const categoryData = [
    { name: 'Network', value: 35 },
    { name: 'Software', value: 25 },
    { name: 'Hardware', value: 20 },
    { name: 'Security', value: 20 }
  ];

  const teamPerformance = [
    { team: 'Team A', resolved: 180, backlog: 20, sla: 95 },
    { team: 'Team B', resolved: 160, backlog: 15, sla: 92 },
    { team: 'Team C', resolved: 140, backlog: 25, sla: 88 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Executive View Components
  const ExecutiveView = () => (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-700">2,270</p>
          <p className="text-sm text-blue-600">↑ 12% vs last month</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Resolution Rate</h3>
          <p className="text-3xl font-bold text-green-700">94.5%</p>
          <p className="text-sm text-green-600">↑ 2.3% vs last month</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900">CSAT Score</h3>
          <p className="text-3xl font-bold text-purple-700">4.8/5</p>
          <p className="text-sm text-purple-600">↑ 0.2 vs last month</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900">Avg Response Time</h3>
          <p className="text-3xl font-bold text-orange-700">1.8h</p>
          <p className="text-sm text-orange-600">↓ 15% vs last month</p>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Overall Performance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="tickets" stackId="1" fill="#8884d8" />
              <Area type="monotone" dataKey="resolved" stackId="1" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">SLA Compliance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sla" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Operational View Components
  const OperationalView = () => (
    <div className="space-y-6">
      {/* Team Performance Matrix */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#82ca9d" />
              <Bar dataKey="backlog" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teamPerformance.map((team, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{team.team}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Resolved:</span>
                <span className="font-semibold">{team.resolved}</span>
              </div>
              <div className="flex justify-between">
                <span>Backlog:</span>
                <span className="font-semibold">{team.backlog}</span>
              </div>
              <div className="flex justify-between">
                <span>SLA Compliance:</span>
                <span className="font-semibold">{team.sla}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics Table */}
      <DataTable 
        columns={[
          { key: 'team', header: 'Team' },
          { key: 'resolved', header: 'Resolved Tickets' },
          { key: 'backlog', header: 'Backlog' },
          { key: 'sla', header: 'SLA Compliance %' }
        ]} 
        data={teamPerformance} 
      />
    </div>
  );

  // Analyst View Components
  const AnalystView = () => (
    <div className="space-y-6">
      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Response Time Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="responseTime" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Satisfaction Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="satisfaction" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <DataTable 
          columns={[
            { key: 'month', header: 'Month' },
            { key: 'tickets', header: 'Total Tickets' },
            { key: 'resolved', header: 'Resolved' },
            { key: 'satisfaction', header: 'CSAT %' },
            { key: 'responseTime', header: 'Avg Response (hrs)' }
          ]} 
          data={monthlyData} 
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* View Selector and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
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
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onStartDateChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
            onEndDateChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
          />
        </div>
      </div>

      {/* View Content */}
      {currentView === 'executive' && <ExecutiveView />}
      {currentView === 'operational' && <OperationalView />}
      {currentView === 'analyst' && <AnalystView />}
    </div>
  );
};

export default TicketsDashboard;