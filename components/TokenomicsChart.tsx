import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Ecosystem', value: 40 },
  { name: 'Treasury', value: 20 },
  { name: 'Team', value: 15 },
  { name: 'Public', value: 10 },
  { name: 'Liquidity', value: 10 },
  { name: 'Airdrop', value: 5 },
];

// Monochrome / Sophisticated Palette
const COLORS = [
  '#ffffff',   // White
  '#a1a1aa',   // Zinc 400
  '#52525b',   // Zinc 600
  '#27272a',   // Zinc 800
  '#ff5733',   // Accent (Mars)
  '#3f3f46',   // Zinc 700
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-white text-sm font-medium">{payload[0].name}</p>
        <p className="text-text-secondary text-xs">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export const TokenomicsChart = () => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span className="text-xs text-text-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};