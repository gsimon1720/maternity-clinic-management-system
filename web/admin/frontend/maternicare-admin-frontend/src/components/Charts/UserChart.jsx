import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const data = [
  { name: 'Doctors', value: 15, color: '#10B981' },
  { name: 'Nurses', value: 25, color: '#3B82F6' },
  { name: 'Patients', value: 220, color: '#F59E0B' },
  { name: 'Staff', value: 12, color: '#8B5CF6' },
];

const UserChart = () => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${COLORS.bgPink200}`
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '20px' }}>
        User Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserChart;