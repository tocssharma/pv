import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DatePickerWithRange } from ".ui/date-range-picker";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DataTable } from "./ui/data-table";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  AreaChart, Area, ComposedChart, Cell, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Treemap, RadialBarChart, RadialBar
} from 'recharts';
import { TrendingUp, Clock, Filter, Download, RefreshCcw } from 'lucide-react';

const EnhancedDashboard = () => {
  const [drilldownLevel, setDrilldownLevel] = useState(0);
  const [selectedData, setSelectedData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: null,
    category: 'all',
    priority: 'all',
    team: 'all'
  });

  // Hierarchical data structure with multiple levels
  const ticketData = {
    overview: {
      categories: [
        {
          name: 'Network',
          count: 450,
          subCategories: [
            {
              name: 'Connectivity',
              count: 200,
              details: {
                priority: { high: 80, medium: 70, low: 50 },
                resolution: { resolved: 180, pending: 20 },
                timeline: [/* hourly data */]
              }
            },
            // More subcategories...
          ]
        },
        // More categories...
      ],
      teams: [
        {
          name: 'Team A',
          metrics: {
            resolved: 850,
            pending: 150,
            satisfaction: 92
          },
          members: [
            {
              name: 'John',
              performance: {
                resolved: 300,
                avgTime: 2.5,
                satisfaction: 94,
                tickets: [/* detailed ticket data */]
              }
            },
            // More team members...
          ]
        },
        // More teams...
      ]
    }
  };

  const handleDrilldown = (data, level) => {
    setSelectedData(data);
    setDrilldownLevel(level);
  };

  const renderFilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <DatePickerWithRange 
        className="w-[300px]"
        onChange={(date) => setFilters(prev => ({ ...prev, dateRange: date }))}
      />
      <Select 
        value={filters.category}
        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="network">Network</SelectItem>
          <SelectItem value="software">Software</SelectItem>
          <SelectItem value="hardware">Hardware</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        value={filters.priority}
        onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" className="gap-2">
        <RefreshCcw className="h-4 w-4" />
        Reset Filters
      </Button>
      <Button variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Export Data
      </Button>
    </div>
  );

  const renderDrilldownLevel = () => {
    switch (drilldownLevel) {
      case 1: // Category Level
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subcategory Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={selectedData.subCategories}
                      dataKey="count"
                      nameKey="name"
                      onClick={(data) => handleDrilldown(data, 2)}
                    >
                      <Tooltip />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resolution Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedData.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="count" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Subcategory Level
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      data={Object.entries(selectedData.details.priority).map(([key, value]) => ({
                        name: key,
                        value: value
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="80%"
                    >
                      <RadialBar dataKey="value" />
                      <Legend />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(selectedData.details.resolution).map(([key, value]) => ({
                          name: key,
                          value: value
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {Object.entries(selectedData.details.resolution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Detailed Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={selectedData.details.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" fill="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="resolutionTime" stroke="#ff7300" />
                      <Scatter yAxisId="right" dataKey="satisfaction" fill="#82ca9d" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderFilterBar()}
      
      <div className="space-y-6">
        {/* Level 0: Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Category Overview (Click to drill down)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ticketData.overview.categories}
                    onClick={(data) => handleDrilldown(data.payload, 1)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance (Click to drill down)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={ticketData.overview.teams}
                    onClick={(data) => handleDrilldown(data.payload, 1)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="metrics.resolved" fill="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="metrics.satisfaction" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drill-down content */}
        {drilldownLevel > 0 && renderDrilldownLevel()}
      </div>
    </div>
  );
};

export default EnhancedDashboard;