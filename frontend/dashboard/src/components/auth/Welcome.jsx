import { Radio, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import spLogo from '../../assets/safepulse-icon.png';


// Dashboard illustration SVG
const DashboardIllustration = () => (
  <svg viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
    {/* Background panel */}
    <rect x="8" y="8" width="324" height="204" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    {/* Sidebar */}
    <rect x="8" y="8" width="52" height="204" rx="12" fill="rgba(0,0,0,0.2)"/>
    <circle cx="34" cy="32" r="10" fill="rgba(200,240,220,0.5)"/>
    {[52, 72, 92, 112, 132].map((y) => (
      <rect key={y} x="22" y={y} width="24" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
    ))}
    {/* Main area */}
    <rect x="70" y="20" width="80" height="12" rx="3" fill="rgba(255,255,255,0.35)"/>
    <rect x="70" y="36" width="55" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
    {/* Stats cards */}
    {[70, 138, 206, 274].map((x, ) => (
      <g key={x}>
        <rect x={x} y="56" width="54" height="46" rx="7" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <rect x={x + 6} y={62} width="20" height="6" rx="2" fill="rgba(255,255,255,0.25)"/>
        <rect x={x + 6} y={74} width="28" height="12" rx="3" fill="rgba(200,240,220,0.6)"/>
        <rect x={x + 6} y={90} width="16" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
      </g>
    ))}
    {/* Incident feed */}
    <rect x="70" y="114" width="160" height="86" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
    <rect x="78" y="122" width="60" height="8" rx="3" fill="rgba(255,255,255,0.3)"/>
    {[136, 152, 168, 184].map((y, i) => (
      <g key={y}>
        <circle cx="84" cy={y + 5} r="5" fill={['#f87171','#fbbf24','#34d399','#60a5fa'][i]} opacity="0.7"/>
        <rect x="94" y={y} width="80" height="5" rx="2" fill="rgba(255,255,255,0.2)"/>
        <rect x="94" y={y + 7} width="50" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      </g>
    ))}
    {/* Map area */}
    <rect x="244" y="114" width="84" height="86" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
    <rect x="252" y="122" width="40" height="6" rx="3" fill="rgba(255,255,255,0.25)"/>
    <circle cx="286" cy="158" r="24" fill="rgba(200,240,220,0.15)" stroke="rgba(200,240,220,0.3)" strokeWidth="1"/>
    {[[276,148],[294,162],[280,170],[298,150]].map(([cx,cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="4" fill={['#f87171','#fbbf24','#34d399','#f87171'][i]} opacity="0.8"/>
    ))}
    {/* People silhouettes at bottom-left */}
    {[0,20,40,60].map((x) => (
      <g key={x} transform={`translate(${x}, 0)`}>
        <circle cx="24" cy="176" r="5" fill="rgba(200,240,220,0.5)"/>
        <rect x="20" y="182" width="8" height="14" rx="3" fill="rgba(200,240,220,0.35)"/>
      </g>
    ))}
  </svg>
);

const features = [
  { icon: Radio, title: 'Live multiple-channel intake', desc: 'Sms, app, and web reports in one feed.' },
  { icon: ShieldCheck, title: 'Triage with confidence', desc: 'Severity scoring and clear next actions.' },
  { icon: Users, title: 'Coordinate responders', desc: 'Assign cases and track resolution time.' },
];

export default function Welcome({ onSignIn, onRequestAccess }) {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Left panel */}
      <div
        className="hidden md:flex flex-1 flex-col p-8 relative overflow-hidden"
        style={{ background: '#1b4332' }}
      >
        {/* Decorative rings */}
        <div className="absolute rounded-full" style={{ width: '420px', height: '420px', border: '1px solid rgba(255,255,255,0.07)', top: '-80px', left: '-100px' }} />
        <div className="absolute rounded-full" style={{ width: '320px', height: '320px', border: '1px solid rgba(255,255,255,0.07)', top: '-30px', left: '-50px' }} />
        <div className="absolute rounded-full" style={{ width: '380px', height: '380px', border: '1px solid rgba(255,255,255,0.05)', bottom: '-80px', right: '-100px' }} />


        {/* Illustration card */}
        <div className="relative z-10 flex items-center justify-center flex-1 py-8">
          <div
            className="rounded-2xl overflow-hidden p-4 w-full max-w-sm shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
          >
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 mb-auto">
          <img src={spLogo} alt="SafePulse Logo" className="w-16 h-16" />
          <span className="text-white font-semibold text-lg tracking-wide">SafePulse</span>
        </div>
            <DashboardIllustration />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10" style={{ background: '#f5f4ef' }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SafePulse</h1>
            <p className="text-gray-500 text-sm">Monitors incidents, identify patterns, and coordinate response</p>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: '#f0faf5' }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ background: '#c8eedd' }}>
                  <Icon size={18} style={{ color: '#1b4332' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onSignIn}
              className="flex items-center justify-center text-white gap-2 w-full py-3.5 rounded-full text-sm border border-gray-300 font-semibold bg-emerald-900 hover:text-white transition-all duration-200 hover:bg-emerald-400 cursor-pointer active:scale-[0.98]"
            >
              Sign in <ArrowRight size={16} />
            </button>
            <button
              onClick={onRequestAccess}
              className="w-full py-3.5 rounded-full text-gray-800 font-semibold text-sm border border-gray-300 bg-white hover:text-white transition-all duration-200 hover:bg-emerald-400 cursor-pointer active:scale-[0.98]"
            >
              Request access
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            For verified NGO and partner organizations only.
          </p>
        </div>
      </div>
    </div>
  );
}
