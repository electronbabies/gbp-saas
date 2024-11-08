import React from 'react';
import { RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';

interface ReportChartProps {
  data: Array<{
    name: string;
    score: number;
    fill: string;
  }>;
}

export default function ReportChart({ data }: ReportChartProps) {
  return (
    <RadialBarChart 
      width={300} 
      height={300} 
      innerRadius="10%" 
      outerRadius="80%" 
      data={data}
      startAngle={180} 
      endAngle={0}
    >
      <RadialBar
        minAngle={15}
        background
        clockWise={true}
        dataKey="score"
      />
      <Legend />
      <Tooltip />
    </RadialBarChart>
  );
}