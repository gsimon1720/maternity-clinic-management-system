// src/pages/nurse/NurseDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboardApi';
import StatCard from '../../components/dashboard/StatCard';
import AppointmentStatusChart from '../../components/dashboard/AppointmentStatusChart';
import VisitsTable from '../../components/dashboard/VisitsTable';
import UpcomingVisitsCard from '../../components/dashboard/UpcomingVisitsCard';
import ClinicVisitTypesChart from '../../components/dashboard/ClinicVisitTypesChart';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaCalendarPlus, 
  FaBaby,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const NurseDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    upcomingVisits: 0,
    activePregnancies: 0,
    highRiskPregnancies: 0,
  });
  const [visitStatusData, setVisitStatusData] = useState([]);
  const [pregnancyRiskData, setPregnancyRiskData] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [todayVisits, setTodayVisits] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching nurse dashboard data...');
      
      const response = await dashboardApi.getNurseDashboard();
      console.log('📊 Nurse Dashboard Response:', response);
      
      if (response.success) {
        const data = response.data;
        setStats(data.stats);
        setVisitStatusData(data.visitStatus || []);
        setPregnancyRiskData(data.pregnancyRisk || []);
        setUpcomingVisits(data.upcomingVisits || []);
        setTodayVisits(data.todayVisits || []);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-medium">{user?.fullName}</span>! 
            Here's what's happening today.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards - 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<FaUsers />}
          color="primary"
        />
        <StatCard
          title="Today's Clinic Visits"
          value={stats.todayVisits}
          icon={<FaCalendarCheck />}
          color="green"
        />
        <StatCard
          title="Upcoming Clinic Visits"
          value={stats.upcomingVisits}
          icon={<FaCalendarPlus />}
          color="blue"
        />
        <StatCard
          title="Active Pregnancies"
          value={stats.activePregnancies}
          icon={<FaBaby />}
          color="purple"
        />
        <StatCard
          title="High Risk Pregnancies"
          value={stats.highRiskPregnancies}
          icon={<FaExclamationTriangle />}
          color="red"
          subtitle={stats.activePregnancies > 0 
            ? `${Math.round((stats.highRiskPregnancies / stats.activePregnancies) * 100)}% of active`
            : 'No active pregnancies'
          }
        />
      </div>

      {/*  Charts - Full width with both charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentStatusChart data={visitStatusData} />
        <ClinicVisitTypesChart />
      </div>

      {/*  Visits - Upcoming and Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingVisitsCard 
          visits={upcomingVisits} 
          title="📅 Upcoming Clinic Visits"
        />
        <VisitsTable 
          visits={todayVisits} 
          title="📋 Today's Clinic Visits"
          type="today"
        />
      </div>
    </div>
  );
};

export default NurseDashboard;