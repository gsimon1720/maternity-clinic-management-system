import React, { useState } from 'react';
import { 
  Users, 
  Baby, 
  Calendar, 
  Activity, 
  Clock, 
  ChevronRight, 
  MoreVertical, 
  Phone, 
  Mail,
  Stethoscope  // ← Added Stethoscope import
} from 'lucide-react';
import StatCard from '../../components/DashboardCards/StatCard';
import PatientChart from '../../components/Charts/PatientChart';
import DeliveryChart from '../../components/Charts/DeliveryChart';
import UserChart from '../../components/Charts/UserChart';

const Dashboard = () => {
  const stats = [
    { title: 'Total Patients', value: '1,234', icon: Users, color: 'pink', trend: 'up', trendValue: '+12%' },
    { title: 'Active Pregnancies', value: '156', icon: Baby, color: 'plum', trend: 'up', trendValue: '+8%' },
    { title: 'Appointments Today', value: '28', icon: Calendar, color: 'success', trend: 'up', trendValue: '+5%' },
    { title: 'Deliveries This Month', value: '45', icon: Activity, color: 'warning', trend: 'up', trendValue: '+15%' },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientAge: 28,
      time: '09:00 AM',
      doctor: 'Dr. Nuwam Perera',
      department: 'Prenatal Care',
      type: 'Regular Checkup',
      status: 'confirmed',
      phone: '+94 71 234 5678',
      email: 'sarah.j@example.com'
    },
    {
      id: 2,
      patientName: 'Amali Fernando',
      patientAge: 32,
      time: '10:30 AM',
      doctor: 'Dr. Sanduni Jayasinghe',
      department: 'Ultrasound',
      type: 'Growth Scan',
      status: 'confirmed',
      phone: '+94 77 891 2345',
      email: 'amali.f@example.com'
    },
    {
      id: 3,
      patientName: 'Thashara Wijesinghe',
      patientAge: 26,
      time: '11:45 AM',
      doctor: 'Dr. Nuwam Perera',
      department: 'Postnatal Care',
      type: 'Follow-up',
      status: 'pending',
      phone: '+94 70 112 3344',
      email: 'thashara.w@example.com'
    },
    {
      id: 4,
      patientName: 'Nethmi Perera',
      patientAge: 30,
      time: '02:00 PM',
      doctor: 'Midwife Kumari Bandara',
      department: 'Delivery Ward',
      type: 'Labor Assessment',
      status: 'confirmed',
      phone: '+94 76 445 6789',
      email: 'nethmi.p@example.com'
    },
    {
      id: 5,
      patientName: 'Dilini Rathnayake',
      patientAge: 29,
      time: '03:30 PM',
      doctor: 'Dr. Sanduni Jayasinghe',
      department: 'Prenatal Care',
      type: 'First Visit',
      status: 'cancelled',
      phone: '+94 71 998 7766',
      email: 'dilini.r@example.com'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return { bg: '#10b981', light: '#d1fae5', text: '#065f46' };
      case 'pending': return { bg: '#f59e0b', light: '#fed7aa', text: '#92400e' };
      case 'cancelled': return { bg: '#ef4444', light: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#6b7280', light: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏰';
      case 'cancelled': return '✗';
      default: return '•';
    }
  };

  return (
    <div className="fade-in" style={{ padding: '24px', background: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Welcome to MaterniCare Management System
        </p>
      </div>

      {/* Statistics Grid */}
      <div style={{ marginBottom: '40px' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          <PatientChart />
          <DeliveryChart />
        </div>
      </div>

      {/* User Distribution Chart */}
      <div style={{ marginBottom: '40px' }}>
        <UserChart />
      </div>

      {/* Upcoming Appointments Section - Redesigned */}
      <div>
        {/* Section Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              Upcoming Appointments
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Today's scheduled appointments and patient visits
            </p>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            color: '#F48FB1',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F48FB1';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#F48FB1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#F48FB1';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}>
            View All Appointments
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Appointments Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px'
        }}>
          {upcomingAppointments.map((appointment) => {
            const statusColor = getStatusColor(appointment.status);
            return (
              <div
                key={appointment.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -12px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#F48FB1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Header with Time and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `linear-gradient(135deg, #F48FB1, #e07a9e)`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock size={20} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>Appointment Time</p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{appointment.time}</p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: statusColor.light,
                    borderRadius: '30px'
                  }}>
                    <span style={{ color: statusColor.text, fontSize: '12px', fontWeight: '600' }}>
                      {getStatusIcon(appointment.status)} {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Patient Info */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                    {appointment.patientName}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    Age: {appointment.patientAge} years • {appointment.type}
                  </p>
                </div>

                {/* Doctor & Department Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: '#F48FB115',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Stethoscope size={18} color="#F48FB1" />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Doctor</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{appointment.doctor}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Department</p>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#F48FB1' }}>{appointment.department}</p>
                  </div>
                </div>

                {/* Contact Actions */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <button style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px',
                    background: '#F9FAFB',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#3b82f6',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}>
                    <Phone size={14} />
                    Call
                  </button>
                  <button style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px',
                    background: '#F9FAFB',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#F48FB1',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}>
                    <Mail size={14} />
                    Message
                  </button>
                  <button style={{
                    flex: 0.3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    background: '#F9FAFB',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}>
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Appointments Message */}
        {upcomingAppointments.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Calendar size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
              No Appointments Today
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              All appointments for today have been completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;