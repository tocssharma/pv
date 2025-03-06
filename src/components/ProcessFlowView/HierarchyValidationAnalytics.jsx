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
  YAxis,
  ComposedChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const HierarchyValidationAnalytics = ({ originalData, transformedData }) => {
  const analytics = useMemo(() => {
    // Analyze original data
    const originalStats = {
      totalRows: 0,
      levelCounts: {
        L0: 0, L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, L7: 0, L8: 0
      },
      uniqueValues: {
        domains: new Set(),
        lobs: new Set(),
        journeys: new Set(),
        processAreas: new Set()
      },
      metadata: {
        systems: new Set(),
        actors: new Set(),
        taskTypes: new Set(),
        etomProcesses: new Set()
      }
    };

    // Process original data
    originalData.forEach(row => {
      originalStats.totalRows++;
      
      // Count non-empty values at each level
      if (row['L0 JIO Domain ID']?.trim()) originalStats.levelCounts.L0++;
      if (row['L1 JIO LOB/Business Verticals ID']?.trim()) originalStats.levelCounts.L1++;
      if (row['L2 JIO Journey ID']?.trim()) originalStats.levelCounts.L2++;
      if (row['L3 JIO Process Area ID']?.trim()) originalStats.levelCounts.L3++;
      if (row['L4 JIO Process ID1']?.trim()) originalStats.levelCounts.L4++;
      if (row['L5 JIO Process ID2']?.trim()) originalStats.levelCounts.L5++;
      if (row['L6 JIO Process ID3']?.trim()) originalStats.levelCounts.L6++;
      if (row['L7 JIO Process ID4']?.trim()) originalStats.levelCounts.L7++;
      if (row['L8 JIO Process ID']?.trim()) originalStats.levelCounts.L8++;

      // Collect unique values
      if (row['L0 JIO Domain ID']?.trim()) {
        originalStats.uniqueValues.domains.add(row['L0 JIO Domain ID']);
      }
      if (row['L1 JIO LOB/Business Verticals ID']?.trim()) {
        originalStats.uniqueValues.lobs.add(row['L1 JIO LOB/Business Verticals ID']);
      }
      if (row['L2 JIO Journey ID']?.trim()) {
        originalStats.uniqueValues.journeys.add(row['L2 JIO Journey ID']);
      }
      if (row['L3 JIO Process Area ID']?.trim()) {
        originalStats.uniqueValues.processAreas.add(row['L3 JIO Process Area ID']);
      }

      // Collect metadata
      if (row['L4 System']?.trim()) originalStats.metadata.systems.add(row['L4 System']);
      if (row['L4 Actor']?.trim()) originalStats.metadata.actors.add(row['L4 Actor']);
      if (row['L4 Task Type']?.trim()) originalStats.metadata.taskTypes.add(row['L4 Task Type']);
      if (row['L4 ETOM Process ID']?.trim()) originalStats.metadata.etomProcesses.add(row['L4 ETOM Process ID']);
    });

    // Analyze transformed data
    const transformedStats = {
      domains: 0,
      lobs: 0,
      journeys: 0,
      processAreas: 0,
      processes: 0
    };

    // Helper function to count nodes in transformed hierarchy
    const countNodes = (node) => {
      if (!node) return;
      
      // Count children
      if (node.children) {
        Object.values(node.children).forEach(child => {
          switch(child.type) {
            case 'domain': transformedStats.domains++; break;
            case 'lob': transformedStats.lobs++; break;
            case 'journey': transformedStats.journeys++; break;
            case 'processArea': transformedStats.processAreas++; break;
          }
          countNodes(child);
        });
      }

      // Count processes
      if (node.processes) {
        transformedStats.processes += Object.keys(node.processes).length;
      }
    };

    Object.values(transformedData).forEach(countNodes);

    // Prepare comparison data
    const comparisonData = [
      {
        category: 'Domains',
        original: originalStats.uniqueValues.domains.size,
        transformed: transformedStats.domains,
        difference: Math.abs(originalStats.uniqueValues.domains.size - transformedStats.domains)
      },
      {
        category: 'LOBs',
        original: originalStats.uniqueValues.lobs.size,
        transformed: transformedStats.lobs,
        difference: Math.abs(originalStats.uniqueValues.lobs.size - transformedStats.lobs)
      },
      {
        category: 'Journeys',
        original: originalStats.uniqueValues.journeys.size,
        transformed: transformedStats.journeys,
        difference: Math.abs(originalStats.uniqueValues.journeys.size - transformedStats.journeys)
      },
      {
        category: 'Process Areas',
        original: originalStats.uniqueValues.processAreas.size,
        transformed: transformedStats.processAreas,
        difference: Math.abs(originalStats.uniqueValues.processAreas.size - transformedStats.processAreas)
      }
    ];

    return {
      originalStats,
      transformedStats,
      comparisonData,
      levelDistribution: Object.entries(originalStats.levelCounts).map(([level, count]) => ({
        level,
        count
      }))
    };
  }, [originalData, transformedData]);

  return (
    <div className="space-y-6">
      {/* Transformation Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Transformation Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.comparisonData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="original" fill="#8884d8" name="Original Count" />
                <Bar dataKey="transformed" fill="#82ca9d" name="Transformed Count" />
                <Line type="monotone" dataKey="difference" stroke="#ff7300" name="Difference" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.levelDistribution}>
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8">
                  {analytics.levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600">Total Rows</h3>
              <p className="text-2xl font-bold">{analytics.originalStats.totalRows}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600">Unique Systems</h3>
              <p className="text-2xl font-bold">{analytics.originalStats.metadata.systems.size}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600">Unique Actors</h3>
              <p className="text-2xl font-bold">{analytics.originalStats.metadata.actors.size}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600">Task Types</h3>
              <p className="text-2xl font-bold">{analytics.originalStats.metadata.taskTypes.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HierarchyValidationAnalytics;