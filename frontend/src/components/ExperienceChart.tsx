import React from 'react';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface ExperienceChartProps {
  results: Array<{
    filename: string;
    experience_match: {
      years_difference: number;
    };
  }>;
  requiredYears: number;
}

export const ExperienceChart = ({ results, requiredYears }: ExperienceChartProps) => {
  const processData = () => {
    return results.map(result => ({
      name: result.filename,
      years: requiredYears + result.experience_match.years_difference,
      required: requiredYears
    }));
  };

  const data = processData();

  if (!data.length) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Experience Distribution</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Years of Experience', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="years"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="required"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};