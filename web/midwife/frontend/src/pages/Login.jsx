import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';

/* ── Floating heart sub‑component ── */
function HeartFloat({ delay, left, size = 14, bottom = '12%', speed = 3 }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: left || '50%',
        bottom,
        animation: `heartFloat ${speed}s ease-in ${delay || '0s'} infinite`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#ec4899" opacity="0.9">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
}

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setAuth(true);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Login failed. Please check your network connection.'
      );
    }
  };

  return (
    <>
      {/* ── Fonts, animations, and rich background effects ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .font-sharp {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          25%      { transform: translateY(-6px); }
          50%      { transform: translateY(-2px); }
          75%      { transform: translateY(-8px); }
        }

        @keyframes heartFloat {
          0%   { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; }
          15%  { transform: translateY(-25px) scale(0.7) rotate(5deg); opacity: 0.9; }
          40%  { transform: translateY(-60px) scale(1.1) rotate(-8deg); opacity: 1; }
          70%  { transform: translateY(-95px) scale(0.6) rotate(3deg); opacity: 0.5; }
          100% { transform: translateY(-140px) scale(0) rotate(-12deg); opacity: 0; }
        }

        @keyframes bellyBreathe {
          0%, 100% { r: 16; cy: 68; }
          30%      { r: 17.5; cy: 67; }
          60%      { r: 16.3; cy: 67.8; }
          85%      { r: 18; cy: 66.5; }
        }

        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(30px, -40px) scale(1.1); }
          50%      { transform: translate(-20px, 20px) scale(0.9); }
          75%      { transform: translate(-30px, -10px) scale(1.05); }
        }

        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(-40px, 30px) scale(1.15); }
          50%      { transform: translate(20px, -30px) scale(0.85); }
          75%      { transform: translate(30px, 20px) scale(1.08); }
        }

        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(50px, -20px) scale(0.9); }
          66%      { transform: translate(-30px, -50px) scale(1.2); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-belly {
          animation: bellyBreathe 4s ease-in-out infinite;
        }

        .animate-blob1 {
          animation: blob1 20s ease-in-out infinite;
        }

        .animate-blob2 {
          animation: blob2 25s ease-in-out infinite;
        }

        .animate-blob3 {
          animation: blob3 22s ease-in-out infinite;
        }

        /* Soft glow for the card */
        .card-glow {
          box-shadow:
            0 0 30px rgba(236,72,153,0.2),
            0 0 80px rgba(236,72,153,0.1),
            0 20px 50px -10px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="flex h-screen items-center justify-center bg-pink-50 relative overflow-hidden font-sharp">
        {/* ── DYNAMIC BACKGROUND BLOBS ── */}
        {/* Big soft blobs that move continuously */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-pink-200 opacity-30 blur-3xl animate-blob1"
          style={{ top: '-10%', left: '-5%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-rose-200 opacity-25 blur-3xl animate-blob2"
          style={{ bottom: '-10%', right: '-5%' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-pink-300 opacity-20 blur-3xl animate-blob3"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />

        {/* ── Floating hearts all over the screen ── */}
        <div className="absolute inset-0 pointer-events-none">
          <HeartFloat delay="0s" left="5%" size={16} bottom="80%" speed={4} />
          <HeartFloat delay="1.2s" left="12%" size={12} bottom="60%" speed={3.5} />
          <HeartFloat delay="2.4s" left="85%" size={18} bottom="75%" speed={4.5} />
          <HeartFloat delay="0.8s" left="78%" size={10} bottom="30%" speed={3} />
          <HeartFloat delay="3.2s" left="25%" size={14} bottom="90%" speed={5} />
          <HeartFloat delay="1.8s" left="92%" size={11} bottom="45%" speed={3.8} />
          <HeartFloat delay="4.0s" left="45%" size={20} bottom="85%" speed={4.2} />
          <HeartFloat delay="2.0s" left="8%" size={13} bottom="20%" speed={3.3} />
        </div>

        {/* ── LOGIN CARD ── */}
        <div className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-3xl w-96 border border-white/50 card-glow
                        transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(236,72,153,0.3)]">
          {/* Pregnant mother animation */}
          <div className="flex justify-center mb-4">
            <div className="relative w-28 h-28">
              {/* Extra hearts around the mother */}
              <HeartFloat delay="0s" left="-10%" size={10} bottom="20%" speed={2.5} />
              <HeartFloat delay="1.5s" left="90%" size={8} bottom="70%" speed={2.2} />
              <HeartFloat delay="3s" left="40%" size={12} bottom="0%" speed={3} />

              <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto animate-float">
                <defs>
                  <radialGradient id="bellyGradLogin" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbcfe3" />
                    <stop offset="100%" stopColor="#f9a8d4" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="25" r="10" fill="#fce7f1" stroke="#db2777" strokeWidth="1.5" />
                <circle cx="50" cy="20" r="6" fill="#be185d" />
                <path d="M38,35 Q40,55 50,70 Q60,55 62,35" fill="#fce7f1" stroke="#db2777" strokeWidth="1.5" />
                <path d="M38,40 Q25,55 20,60" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeLinecap="round" />
                <path d="M62,40 Q75,55 80,60" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="68" r="16" fill="url(#bellyGradLogin)" className="animate-belly" />
                <path d="M34,75 Q50,90 66,75" fill="#fce7f1" stroke="#db2777" strokeWidth="1" />
                <circle cx="42" cy="63" r="3" fill="#f9a8d4" />
                <circle cx="58" cy="63" r="3" fill="#f9a8d4" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold mb-1 text-center text-pink-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-center text-sm font-medium text-pink-600/80 mb-8">
            Maternity Clinic Portal
          </p>

          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm text-red-600 p-3 rounded-xl mb-5 text-sm font-semibold text-center border border-red-100 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label className="block text-xs font-bold text-pink-900 mb-1.5 uppercase tracking-widest px-1">
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-pink-100 bg-white/70 p-4 mb-4 rounded-2xl focus:border-pink-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-pink-400/70 focus:bg-white focus:shadow-md"
            />

            <label className="block text-xs font-bold text-pink-900 mb-1.5 uppercase tracking-widest px-1">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-pink-100 bg-white/70 p-4 mb-6 rounded-2xl focus:border-pink-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-pink-400/70 focus:bg-white focus:shadow-md"
            />

            <Button type="submit" className="w-full text-base py-3.5 font-semibold">
              Login
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}