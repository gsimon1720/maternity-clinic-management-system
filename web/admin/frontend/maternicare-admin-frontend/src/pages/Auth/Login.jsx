import React, { useState, useEffect } from 'react';
import {
  Heart, Users, Calendar, FileText,
  ShieldCheck, Stethoscope, Mail, Lock, Eye, EyeOff,
  ArrowRight, Baby, Activity, UserPlus, Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PINK = '#F48FB1';
const PINK_DARK = '#e07a9e';
const PLUM = '#4A3B53';
const PLUM_DARK = '#3a2e42';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const identifier = email.trim();
    const pwd = password.trim();

    if (!identifier || !pwd) {
      toast.error('Please enter your email/username/NIC and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Backend accepts email, username, or NIC as the identifier
      const result = await login(identifier, pwd);
      toast.success('Login successful!');
      
      const role = String(result?.userType || '').toLowerCase();
      const roleLandingPage = {
        super_admin: '/super-admin/dashboard',
        sphm: '/sphm/midwives',
        ad_officer: '/ado/areas',
      };
      navigate(roleLandingPage[role] || '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials. Please check your login details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const FeatureItem = ({ icon: Icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: 'rgba(244, 143, 177, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={14} color={PINK} />
      </div>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #FFF7FA 0%, #FCE4EC 55%, #FFF0F5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Curves */}
      <svg 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.15
        }} 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="none"
      >
        <path 
          d="M600,0 
             C620,100 650,200 620,300 
             C590,400 540,450 560,500 
             C580,550 620,600 600,700 
             C580,800 590,900 600,800"
          fill="none" 
          stroke={PINK} 
          strokeWidth="8"
        />
        <path 
          d="M600,0 
             C580,100 550,200 580,300 
             C610,400 660,450 640,500 
             C620,550 580,600 600,700 
             C620,800 610,900 600,800"
          fill="none" 
          stroke={PLUM} 
          strokeWidth="8"
        />
      </svg>

      {/* Decorative Curves - Left Side */}
      <svg 
        style={{ 
          position: 'absolute', 
          top: '20%', 
          left: '5%', 
          width: '30%', 
          height: '60%', 
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.1
        }} 
        viewBox="0 0 400 600" 
        preserveAspectRatio="none"
      >
        <path 
          d="M0,100 C100,150 150,250 100,350 C50,450 80,550 0,600" 
          fill="none" 
          stroke={PINK} 
          strokeWidth="6"
        />
        <path 
          d="M50,50 C150,100 200,200 150,300 C100,400 130,500 50,550" 
          fill="none" 
          stroke={PLUM} 
          strokeWidth="4"
        />
      </svg>

      {/* Floating Elements */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.15, animation: 'float 6s ease-in-out infinite', zIndex: 0 }}>
        <Baby size={50} color={PINK} />
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.15, animation: 'float 8s ease-in-out infinite', zIndex: 0 }}>
        <Heart size={45} color={PLUM} />
      </div>

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '450px' : '950px',
        background: '#fff',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Left Panel - Branding */}
        <div style={{
          width: isMobile ? '100%' : '38%',
          background: `linear-gradient(145deg, ${PLUM} 0%, ${PLUM_DARK} 100%)`,
          padding: isMobile ? '30px 24px' : '40px 32px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Decorative Circles */}
          <svg style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, opacity: 0.1 }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="80" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="50" cy="50" r="60" fill="none" stroke="#fff" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="1" />
          </svg>

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? '20px' : '40px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'rgba(244, 143, 177, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={22} color={PINK} fill="rgba(244, 143, 177, 0.3)" />
              </div>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>
                MaterniCare
              </span>
            </div>

            {/* Welcome Message */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                width: '50px',
                height: '3px',
                background: PINK,
                borderRadius: '3px',
                marginBottom: '20px'
              }} />
              <h2 style={{
                color: '#fff',
                fontSize: '26px',
                fontWeight: '700',
                lineHeight: '1.3',
                marginBottom: '12px',
                letterSpacing: '-0.5px'
              }}>
                Welcome Back
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5' }}>
                Sign in to access your clinic management dashboard
              </p>
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
              <FeatureItem icon={Users} label="Patient Management" />
              <FeatureItem icon={Calendar} label="Appointment Scheduling" />
              <FeatureItem icon={FileText} label="Electronic Health Records" />
            </div>
          </div>

          {/* Security Badge */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={14} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              HIPAA Compliant & Secure
            </span>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div style={{
          flex: 1,
          padding: isMobile ? '32px 24px' : '48px 40px',
          background: '#fff'
        }}>
          <div style={{ maxWidth: '340px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${PINK}20, ${PLUM}10)`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Stethoscope size={26} color={PINK} />
              </div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '6px',
                letterSpacing: '-0.3px'
              }}>
                Sign In
              </h1>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                Enter your credentials to continue
              </p>
            </div>



            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)' }} />
              <span style={{ fontSize: '10px', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Access Account
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email / Username / NIC
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <Mail size={16} color={emailFocused ? PINK : '#9ca3af'} />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 44px',
                      fontSize: '14px',
                      border: `1.5px solid ${emailFocused ? PINK : '#e5e7eb'}`,
                      borderRadius: '14px',
                      background: emailFocused ? '#fff' : '#fafafa',
                      outline: 'none',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter your email, username, or NIC"
                    required
                  />
                </div>
                {/* Hint for all user types */}
                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px' }}>
                  You may log in using your email address, username, or NIC number
                </p>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <span>Password</span>
                  <button
                    type="button"
                    style={{
                      fontSize: '11px',
                      color: PINK,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = PINK_DARK}
                    onMouseLeave={(e) => e.currentTarget.style.color = PINK}
                  >
                    Forgot Password?
                  </button>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <Lock size={16} color={passFocused ? PINK : '#9ca3af'} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    style={{
                      width: '100%',
                      padding: '11px 44px 11px 44px',
                      fontSize: '14px',
                      border: `1.5px solid ${passFocused ? PINK : '#e5e7eb'}`,
                      borderRadius: '14px',
                      background: passFocused ? '#fff' : '#fafafa',
                      outline: 'none',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: `linear-gradient(135deg, ${PINK}, ${PINK_DARK})`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            

            

            {/* Footer */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#d1d5db' }}>
                © 2026 MaterniCare Healthcare. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Login;