import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const HierarchyAnalytics = ({ data }) => {
  // Process and analyze the data
  const analytics = useMemo(() => {
    const stats = {
      totalNodes: 0,
      nodesByLevel: {},
      nodesByType: {},
      uniqueIds: new Set(),
      processes: {
        total: 0,
        byLevel: {}
      }
    };

    // Helper function to traverse the hierarchy
    const traverseNode = (node, level = 0) => {
      if (!node) return;

      stats.totalNodes++;
      
      // Count by level
      stats.nodesByLevel[level] = (stats.nodesByLevel[level] || 0) + 1;
      
      // Count by type
      if (node.type) {
        stats.nodesByType[node.type] = (stats.nodesByType[node.type] || 0) + 1;
      }

      // Track unique IDs
      if (node.id) {
        stats.uniqueIds.add(node.id);
      }

      // Count processes
      if (node.processes) {
        const processCount = Object.keys(node.processes).length;
        stats.processes.total += processCount;
        stats.processes.byLevel[level] = (stats.processes.byLevel[level] || 0) + processCount;
      }

      // Traverse children
      if (node.children) {
        Object.values(node.children).forEach(child => {
          traverseNode(child, level + 1);
        });
      }
    };

    // Process each root node
    Object.values(data || {}).forEach(node => traverseNode(node));

    // Prepare chart data
    const levelDistribution = Object.entries(stats.nodesByLevel).map(([level, count]) => ({
      name: `Level ${level}`,
      count
    }));

    const typeDistribution = Object.entries(stats.nodesByType).map(([type, count]) => ({
      name: type,
      value: count
    }));

    const processDistribution = Object.entries(stats.processes.byLevel).map(([level, count]) => ({
      name: `Level ${level}`,
      count
    }));

    return {
      totalNodes: stats.totalNodes,
      uniqueIds: stats.uniqueIds.size,
      totalProcesses: stats.processes.total,
      levelDistribution,
      typeDistribution,
      processDistribution
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Nodes" value={analytics.totalNodes} />
        <MetricCard title="Unique IDs" value={analytics.uniqueIds} />
        <MetricCard title="Total Processes" value={analytics.totalProcesses} />
      </div>

      {/* Level Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Node Distribution by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.levelDistribution}>
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

      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution by Node Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.typeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {analytics.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Process Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Process Distribution by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.processDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for metric cards
const MetricCard = ({ title, value }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default HierarchyAnalytics;