import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const data = [
  { supply: 0, price: 0.1 },
  { supply: 10, price: 0.15 },
  { supply: 20, price: 0.22 },
  { supply: 30, price: 0.35 },
  { supply: 40, price: 0.55 },
  { supply: 50, price: 0.85 },
  { supply: 60, price: 1.3 },
  { supply: 70, price: 2.1 },
  { supply: 80, price: 3.5 },
  { supply: 90, price: 5.8 },
  { supply: 100, price: 10.0 },
];

export const BondingCurveChart = () => {
  return (
    <div className="h-[120px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};