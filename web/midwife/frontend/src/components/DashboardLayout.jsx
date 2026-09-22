import { Outlet, Link } from 'react-router-dom';
import { Users, Search, LayoutDashboard, LogOut, Baby } from 'lucide-react';

/* ── Single performant floating heart ── */
function HeartFloat({ delay = '0s', left = '50%', size = 14 }) {
  return (
    <div
      className="absolute pointer-events-none will-change-transform"
      style={{
        left,
        bottom: '10%',
        animation: `heartFloat 3.5s ease-in ${delay} infinite`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#ec4899" opacity="0.85">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .font-sharp {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* ---------- LIGHTWEIGHT ANIMATIONS ---------- */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }

        @keyframes heartFloat {
          0%   { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; }
          15%  { transform: translateY(-20px) scale(0.7) rotate(5deg); opacity: 0.8; }
          40%  { transform: translateY(-45px) scale(0.9) rotate(-5deg); opacity: 0.9; }
          70%  { transform: translateY(-65px) scale(0.5) rotate(3deg); opacity: 0.4; }
          100% { transform: translateY(-90px) scale(0) rotate(-8deg); opacity: 0; }
        }

        /* Belly breathing via scale (no layout recalc) */
        @keyframes bellyBreatheLight {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
          will-change: transform;
        }

        .animate-belly {
          animation: bellyBreatheLight 4s ease-in-out infinite;
          transform-origin: center;
          will-change: transform;
        }

        /* Respect user motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-belly,
          .animate-bg {
            animation: none !important;
          }
        }

        /* Optimised gradient – static, no pulse */
        .bg-soft-gradient {
          background: linear-gradient(135deg, #fce7f1 0%, #fdf2f7 40%, #fff0f5 100%);
        }
      `}</style>

      <div className="flex h-screen bg-soft-gradient relative overflow-hidden font-sharp">
        {/* Sidebar */}
        <aside className="w-72 bg-pink-100/80 backdrop-blur-md border-r border-pink-200/60 flex flex-col relative shadow-2xl z-10">
          {/* Logo area with one heart & breathing mother */}
          <div className="p-6 border-b border-pink-200/70 flex flex-col items-center gap-4 bg-white/30 backdrop-blur-sm">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <HeartFloat delay="0s" left="50%" size={12} />

              <svg viewBox="0 0 100 100" className="w-24 h-24 animate-float">
                <defs>
                  <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbcfe3" />
                    <stop offset="100%" stopColor="#f9a8d4" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="25" r="10" fill="#fce7f1" stroke="#db2777" strokeWidth="1.5" />
                <circle cx="50" cy="20" r="6" fill="#be185d" />
                <path d="M38,35 Q40,55 50,70 Q60,55 62,35" fill="#fce7f1" stroke="#db2777" strokeWidth="1.5" />
                <path d="M38,40 Q25,55 20,60" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeLinecap="round" />
                <path d="M62,40 Q75,55 80,60" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeLinecap="round" />
                {/* Belly now uses scale only – no r/cy changes */}
                <circle cx="50" cy="68" r="16" fill="url(#bellyGrad)" className="animate-belly" />
                <path d="M34,75 Q50,90 66,75" fill="#fce7f1" stroke="#db2777" strokeWidth="1" />
                <circle cx="42" cy="63" r="3" fill="#f9a8d4" />
                <circle cx="58" cy="63" r="3" fill="#f9a8d4" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-pink-900 tracking-tight">
              Maternity Care
            </span>
          </div>

          <nav className="flex-1 p-5 space-y-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-4 text-lg font-semibold text-pink-900 hover:bg-pink-200/70 rounded-2xl transition-all duration-300 hover:shadow-md group"
            >
              <LayoutDashboard size={22} className="text-pink-600 group-hover:scale-110 transition-transform duration-300" />
              Dashboard
            </Link>
            <Link
              to="/midwife/pending"
              className="flex items-center gap-3 p-4 text-lg font-semibold text-pink-900 hover:bg-pink-200/70 rounded-2xl transition-all duration-300 hover:shadow-md group"
            >
              <Users size={22} className="text-pink-600 group-hover:scale-110 transition-transform duration-300" />
              Pending Patients
            </Link>
            <Link
              to="/midwife/pregnancy-requests"
              className="flex items-center gap-3 p-4 text-lg font-semibold text-pink-900 hover:bg-pink-200/70 rounded-2xl transition-all duration-300 hover:shadow-md group"
            >
              <Baby size={22} className="text-pink-600 group-hover:scale-110 transition-transform duration-300" />
              Pregnancy Requests
            </Link>
            <Link
              to="/search"
              className="flex items-center gap-3 p-4 text-lg font-semibold text-pink-900 hover:bg-pink-200/70 rounded-2xl transition-all duration-300 hover:shadow-md group"
            >
              <Search size={22} className="text-pink-600 group-hover:scale-110 transition-transform duration-300" />
              Search Patients
            </Link>
          </nav>

          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-3 p-5 text-lg font-semibold text-pink-800 hover:bg-pink-200/70 border-t border-pink-200/70 transition-all duration-300 hover:shadow-inner rounded-bl-2xl"
          >
            <LogOut size={22} className="text-pink-600" />
            Logout
          </button>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto relative z-0">
          <Outlet />
        </main>
      </div>
    </>
  );
}