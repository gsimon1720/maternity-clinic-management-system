import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const data = [
  { month: 'Jan', patients: 65 },
  { month: 'Feb', patients: 75 },
  { month: 'Mar', patients: 85 },
  { month: 'Apr', patients: 95 },
  { month: 'May', patients: 110 },
  { month: 'Jun', patients: 125 },
  { month: 'Jul', patients: 140 },
  { month: 'Aug', patients: 155 },
  { month: 'Sep', patients: 170 },
  { month: 'Oct', patients: 185 },
  { month: 'Nov', patients: 200 },
  { month: 'Dec', patients: 220 },
];

const PatientChart = () => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${COLORS.bgPink200}`
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '20px' }}>
        Patient Growth Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              background: 'white', 
              border: 'none', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="patients" 
            stroke={COLORS.textPink600} 
            strokeWidth={3}
            dot={{ fill: COLORS.textPink600, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientChart;