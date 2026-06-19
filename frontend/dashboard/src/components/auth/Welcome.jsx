import { Radio, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import logo from '../auth/images/Frame 409.png';

const features = [
  { icon: Radio, title: 'Live multiple-channel intake', desc: 'Sms, app, and web reports in one feed.' },
  { icon: ShieldCheck, title: 'Triage with confidence', desc: 'Severity scoring and clear next actions.' },
  { icon: Users, title: 'Coordinate responders', desc: 'Assign cases and track resolution time.' },
];

export default function Welcome({ onSignIn, onRequestAccess }) {
  return (
    <div className="flex w-full min-h-screen overflow-y-auto md:overflow-hidden md:h-screen">
      {/* Left panel — hidden below md, exactly as before */}
      <div
        className="hidden md:flex flex-1 flex-col p-8 relative overflow-hidden"
        style={{ background: '#1b4332' }}
      >
        <div className="absolute rounded-full" style={{ width: '420px', height: '420px', border: '1px solid rgba(255,255,255,0.07)', top: '-80px', left: '-100px' }} />
        <div className="absolute rounded-full" style={{ width: '320px', height: '320px', border: '1px solid rgba(255,255,255,0.07)', top: '-30px', left: '-50px' }} />
        <div className="absolute rounded-full" style={{ width: '380px', height: '380px', border: '1px solid rgba(255,255,255,0.05)', bottom: '-80px', right: '-100px' }} />

        <div className="relative z-10 flex items-center justify-center flex-1 py-8">
          <div
            className="rounded-2xl overflow-hidden p-4 w-full max-w-sm shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
          >
            <img src={logo} alt="Report" className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Right panel — responsive padding so it never crowds on small phones */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-10" style={{ background: '#f5f4ef' }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome to SafePulse</h1>
            <p className="text-gray-500 text-sm">Monitors incidents, identify patterns, and coordinate response</p>
          </div>

          <div className="flex flex-col gap-3 mb-6 sm:mb-8">
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

          <p className="text-center text-xs text-gray-400 mt-6 sm:mt-8">
            For verified NGO and partner organizations only.
          </p>
        </div>
      </div>
    </div>
  );
}