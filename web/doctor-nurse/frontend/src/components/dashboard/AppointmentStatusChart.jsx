// src/components/dashboard/AppointmentStatusChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FaCalendarCheck, FaCalendarDay, FaCalendarTimes } from 'react-icons/fa';

const AppointmentStatusChart = ({ data }) => {
  
  const COLORS = {
    Upcoming: '#f48fb1',    // Light Pink
    Today: '#f06292',       // Medium Pink
    Completed: '#ec407a',   // Dark Pink
  };

  const defaultData = [
    { name: 'Upcoming', value: 0 },
    { name: 'Today', value: 0 },
    { name: 'Completed', value: 0 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const totalVisits = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = totalVisits > 0 ? Math.round((item.value / totalVisits) * 100) : 0;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-pink-200">
          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
          <p className="text-lg font-bold text-pink-400">{item.value} visits</p>
          <p className="text-xs text-gray-400">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (totalVisits === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Clinic Visit Status</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Total: 0 visits
          </span>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>No clinic visit data available.</p>
          <p className="text-sm mt-1">Start adding clinic visits to see statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Clinic Visit Status</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total: {totalVisits} visits
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Pie Chart - Left side */}
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || '#f48fb1'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => <span className="text-gray-700 text-sm font-medium">{value}</span>}
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards - Right side */}
        <div className="w-full md:w-1/2 space-y-4">
          {chartData.map((item, index) => {
            const percentage = totalVisits > 0 ? Math.round((item.value / totalVisits) * 100) : 0;
            const color = COLORS[item.name] || '#f48fb1';
            
            // Icon based on status
            let Icon = FaCalendarCheck;
            if (item.name === 'Today') Icon = FaCalendarDay;
            else if (item.name === 'Completed') Icon = FaCalendarTimes;

            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Icon className="text-xs" />
                        <span>{item.name === 'Today' ? 'Today' : item.name === 'Completed' ? 'Past visits' : 'Future visits'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: color }}>
                      {item.value}
                    </span>
                    <p className="text-xs text-gray-400">{percentage}%</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatusChart;