import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#64748b', '#a855f7'];

export const OccupancyChart = ({ data }) => {
  const chartData = [
    { name: 'Available', value: data?.available || 0 },
    { name: 'Occupied', value: data?.occupied || 0 },
    { name: 'Reserved', value: data?.reserved || 0 },
    { name: 'Maintenance', value: data?.maintenance || 0 },
    { name: 'Blocked', value: data?.blocked || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
