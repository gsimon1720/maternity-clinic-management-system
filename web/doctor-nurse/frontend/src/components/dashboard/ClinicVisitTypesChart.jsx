// src/components/dashboard/ClinicVisitTypesChart.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import toast from 'react-hot-toast';

const ClinicVisitTypesChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([
    { name: 'Antenatal Clinic Visit', value: 0, patients: 0, description: 'Pregnancy period clinic visits', color: '#f48fb1' },
    { name: 'Postnatal Clinic Visit', value: 0, patients: 0, description: 'After delivery clinic visits', color: '#f06292' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getClinicVisitTypes();
      
      if (response.success) {
        setData(response.data);
      } else {
        toast.error('Failed to load clinic visit data');
      }
    } catch (error) {
      console.error('Error fetching clinic visit types:', error);
      toast.error('Failed to load clinic visit data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f48fb1', '#f06292'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-pink-200">
          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
          <p className="text-lg font-bold text-pink-400">{item.value} visits</p>
          <p className="text-sm text-gray-500">{item.patients} patients</p>
          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-center h-72">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading clinic visit data...</p>
        </div>
      </div>
    );
  }

  const totalVisits = data.reduce((sum, item) => sum + item.value, 0);

  if (totalVisits === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Visit Types</h3>
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
        <h3 className="text-lg font-semibold text-gray-900">Clinic Visit Types</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total: {totalVisits} visits
        </span>
      </div>

      {/*  Full width layout - merged */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Pie Chart - Left side */}
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
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
          {data.map((item, index) => {
            const percentage = totalVisits > 0 ? Math.round((item.value / totalVisits) * 100) : 0;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-pink-400">{item.value}</span>
                    <p className="text-xs text-gray-400">👤 {item.patients} patients</p>
                    <span className="text-xs font-medium text-gray-500">{percentage}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.color || COLORS[index % COLORS.length]
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

export default ClinicVisitTypesChart;