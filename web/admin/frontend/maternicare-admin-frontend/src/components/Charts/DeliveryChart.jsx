import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
};

const data = [
  { month: 'Jan', deliveries: 12, csection: 3 },
  { month: 'Feb', deliveries: 15, csection: 4 },
  { month: 'Mar', deliveries: 18, csection: 5 },
  { month: 'Apr', deliveries: 22, csection: 6 },
  { month: 'May', deliveries: 25, csection: 7 },
  { month: 'Jun', deliveries: 28, csection: 8 },
];

const DeliveryChart = () => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${COLORS.bgPink200}`
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPink900, marginBottom: '20px' }}>
        Delivery Statistics
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar dataKey="deliveries" fill={COLORS.textPink600} radius={[4, 4, 0, 0]} />
          <Bar dataKey="csection" fill={COLORS.textPink800} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeliveryChart;