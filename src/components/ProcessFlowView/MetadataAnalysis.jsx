import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const MetadataAnalysis = ({ data }) => {
  const metadataAnalytics = useMemo(() => {
    const stats = {
      systems: new Set(),
      actors: new Set(),
      taskTypes: new Set(),
      etomProcesses: new Set(),
      relationships: {
        predecessor: 0,
        condition: 0
      }
    };

    // Helper function to process metadata from a process node
    const processMetadata = (process) => {
      if (!process) return;

      // Extract metadata from the process node based on your structure
      if (process.metadata) {
        Object.entries(process.metadata).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            if (key.includes('System')) stats.systems.add(value);
            if (key.includes('Actor') || key.includes('Role')) stats.actors.add(value);
            if (key.includes('Task Type')) stats.taskTypes.add(value);
            if (key.includes('ETOM')) stats.etomProcesses.add(value);
          }
        });
      }

      // Process relationships
      if (process.relationship) {
        if (process.relationship.predecessor) stats.relationships.predecessor++;
        if (process.relationship.condition) stats.relationships.condition++;
      }
    };

    // Helper function to traverse the hierarchy
    const traverseNode = (node) => {
      if (!node) return;

      // Process node's processes if any
      if (node.processes) {
        Object.values(node.processes).forEach(process => {
          processMetadata(process);
        });
      }

      // Traverse children
      if (node.children) {
        Object.values(node.children).forEach(child => {
          traverseNode(child);
        });
      }
    };

    // Process the entire hierarchy
    Object.values(data || {}).forEach(node => traverseNode(node));

    // Prepare chart data
    const metadataDistribution = [
      { name: 'Systems', count: stats.systems.size },
      { name: 'Actors/Roles', count: stats.actors.size },
      { name: 'Task Types', count: stats.taskTypes.size },
      { name: 'ETOM Processes', count: stats.etomProcesses.size }
    ];

    const relationshipData = [
      { name: 'Predecessor', value: stats.relationships.predecessor },
      { name: 'Condition', value: stats.relationships.condition }
    ];

    return {
      metadataDistribution,
      relationshipData,
      stats
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Metadata Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metadataAnalytics.metadataDistribution}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8">
                  {metadataAnalytics.metadataDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Relationship Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metadataAnalytics.relationshipData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {metadataAnalytics.relationshipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Additional Statistics */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600">Predecessors</h3>
              <p className="text-2xl font-bold">{metadataAnalytics.stats.relationships.predecessor}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600">Conditions</h3>
              <p className="text-2xl font-bold">{metadataAnalytics.stats.relationships.condition}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetadataAnalysis;