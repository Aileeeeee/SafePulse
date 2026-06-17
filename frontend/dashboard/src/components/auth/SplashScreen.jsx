import { useEffect } from 'react';
import spLogo from '../../assets/safepulse-icon.png';



export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#1b4332' }}
    >
         
      {/* Decorative rings */}
      <div className="absolute rounded-full" style={{ width: '640px', height: '640px', border: '1px solid rgba(255,255,255,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute rounded-full" style={{ width: '480px', height: '480px', border: '1px solid rgba(255,255,255,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute rounded-full" style={{ width: '320px', height: '320px', border: '1px solid rgba(255,255,255,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      {/* Off-center bottom-left accent */}
      <div className="absolute rounded-full" style={{ width: '480px', height: '480px', border: '1px solid rgba(255,255,255,0.05)', bottom: '-160px', left: '-160px' }} />
      <div className="absolute rounded-full" style={{ width: '360px', height: '360px', border: '1px solid rgba(255,255,255,0.05)', bottom: '-100px', left: '-100px' }} />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center gap-5"
        style={{ animation: 'splashFadeIn 0.9s ease-out both' }}
      >
        
        <div className="flex flex-col items-center gap-2">
            <img 
            src={spLogo} 
            alt="SafePulse Logo" 
            className="w-16 h-16" 
            />
          <h1 className="text-emerald-950 font-semibold text-4xl">
            SAFE<span className='text-white font-semibold text-4xl'>PULSE</span>
          </h1>
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase font-semibold">
            Report •&nbsp; Illuminate •&nbsp; Act
          </p>
        </div>
      </div>

      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
