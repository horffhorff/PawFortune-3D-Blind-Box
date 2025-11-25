import React from 'react';
import { AppState } from '../types';

interface BlindBoxProps {
  onClick: () => void;
  appState: AppState;
  disabled: boolean;
}

// Configuration for the internal capsules
const CAPSULES = [
  { color: 'from-pink-400 to-rose-300', top: '65%', left: '30%', size: 'w-14 h-14', rotate: '-12deg', delay: '0s' },
  { color: 'from-blue-400 to-cyan-300', top: '70%', left: '60%', size: 'w-16 h-16', rotate: '45deg', delay: '0.1s' },
  { color: 'from-yellow-400 to-amber-300', top: '50%', left: '75%', size: 'w-12 h-12', rotate: '15deg', delay: '0.2s' },
  { color: 'from-purple-400 to-violet-300', top: '55%', left: '20%', size: 'w-14 h-14', rotate: '-25deg', delay: '0.3s' },
  { color: 'from-green-400 to-emerald-300', top: '45%', left: '50%', size: 'w-12 h-12', rotate: '10deg', delay: '0.15s' },
  { color: 'from-orange-400 to-red-300', top: '35%', left: '80%', size: 'w-10 h-10', rotate: '30deg', delay: '0.4s' },
  { color: 'from-indigo-400 to-blue-300', top: '30%', left: '15%', size: 'w-10 h-10', rotate: '-10deg', delay: '0.25s' },
];

export const BlindBox: React.FC<BlindBoxProps> = ({ onClick, appState, disabled }) => {
  const isShaking = appState === AppState.SHAKING;
  const isGeneratingText = appState === AppState.GENERATING_TEXT;
  const isGeneratingImage = appState === AppState.GENERATING_IMAGE;
  const isBusy = isShaking || isGeneratingText || isGeneratingImage;

  // Determine content based on state
  const getContent = () => {
    switch (appState) {
      case AppState.SHAKING:
        return { 
          icon: '🎲', 
          title: '摇匀中...', 
          subtitle: 'MIXING LUCK',
          iconClass: 'animate-spin-slow' 
        };
      case AppState.GENERATING_TEXT:
        return { 
          icon: '🔮', 
          title: '感应中...', 
          subtitle: 'DIVINING',
          iconClass: 'animate-pulse' 
        };
      case AppState.GENERATING_IMAGE:
        return { 
          icon: '⚡', 
          title: '3D打印...', 
          subtitle: 'PRINTING',
          iconClass: 'animate-bounce' 
        };
      default:
        return { 
          icon: null, // No icon for default state as requested
          title: '每日运势', 
          subtitle: 'BLIND BOX',
          iconClass: '' 
        };
    }
  };

  const { icon, title, subtitle, iconClass } = getContent();

  return (
    <div 
      className="relative w-72 h-72 mx-auto cursor-pointer group perspective-1000 select-none scale-[1.2] md:scale-[1.5] mt-32 mb-12 md:mt-48 md:mb-24" 
      onClick={!disabled ? onClick : undefined}
    >
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes scan {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 200%; opacity: 0; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes tumble {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            25% { transform: translate(-55%, -45%) rotate(5deg); }
            50% { transform: translate(-45%, -55%) rotate(-5deg); }
            75% { transform: translate(-52%, -48%) rotate(3deg); }
            100% { transform: translate(-50%, -50%) rotate(0deg); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-scan {
            animation: scan 2s linear infinite;
          }
          .animate-spin-slow {
             animation: spin-slow 3s linear infinite;
          }
          .animate-tumble {
             animation: tumble 0.2s linear infinite;
          }
        `}
      </style>

      {/* Container that handles movement transforms */}
      <div 
        className={`
          w-full h-full relative z-10 transition-all duration-300 transform-style-3d
          ${isShaking ? 'animate-shake-hard' : ''}
          ${isGeneratingText ? 'animate-float' : ''}
          ${!isBusy ? 'group-hover:scale-105' : ''}
        `}
      >
        {/* Crystal Ball Sphere */}
        <div 
          className={`
            absolute inset-0 rounded-full shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500
            border-[6px] border-white/30 backdrop-blur-sm
            bg-gradient-to-b from-blue-100/20 via-indigo-500/10 to-indigo-900/40
            ${isGeneratingText ? 'shadow-[0_0_50px_rgba(99,102,241,0.6)] scale-105 border-indigo-300/60' : ''}
            ${isGeneratingImage ? 'shadow-[0_0_60px_rgba(255,255,255,0.5)]' : ''}
          `}
          style={{
            boxShadow: 'inset -10px -20px 30px rgba(0,0,0,0.2), inset 10px 10px 30px rgba(255,255,255,0.6), 0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          
          {/* Internal Capsules (Gachapon) */}
          <div className="absolute inset-0 z-0">
             {CAPSULES.map((c, i) => (
               <div 
                 key={i}
                 className={`absolute rounded-full bg-gradient-to-br ${c.color} shadow-lg border border-white/40 flex items-center justify-center ${c.size}`}
                 style={{ 
                   top: c.top, 
                   left: c.left, 
                   transform: `translate(-50%, -50%) rotate(${c.rotate})`,
                   animation: isShaking ? `tumble 0.3s infinite ${c.delay}` : undefined,
                   opacity: 0.85
                 }}
               >
                 {/* Plastic reflection on capsule */}
                 <div className="absolute top-2 left-2 w-2/5 h-2/5 bg-white/50 rounded-full blur-[1px]"></div>
                 {/* Seam line */}
                 <div className="absolute w-full h-[1px] bg-black/10 rotate-45"></div>
               </div>
             ))}
          </div>

          {/* Destiny Label */}
          <div className="absolute top-6 z-10 w-full text-center">
             <div className="relative inline-block">
                <span className="font-display font-black text-xs tracking-[0.3em] text-yellow-100 drop-shadow-md border border-yellow-200/30 px-3 py-0.5 rounded-full bg-black/10 backdrop-blur-md">
                   DESTINY
                </span>
             </div>
          </div>

          {/* Main Status Content (Floating in center) */}
          <div className="text-center text-white z-20 relative w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            {icon && (
              <div className={`text-6xl mb-1 filter transition-all duration-300 ${iconClass} ${isGeneratingText ? 'scale-110' : ''}`}>
                {icon}
              </div>
            )}
            <h2 className="text-3xl font-display font-bold tracking-widest mb-1">
              {title}
            </h2>
            <p className="text-sm opacity-90 font-light mt-1 tracking-[0.2em]">
              {subtitle}
            </p>
          </div>

          {/* Glass Reflections / Specular Highlights */}
          {/* Large top-left reflection */}
          <div className="absolute top-4 left-6 w-32 h-16 bg-gradient-to-br from-white to-transparent opacity-40 rounded-full blur-md z-30 pointer-events-none -rotate-12"></div>
          {/* Small bottom-right reflection */}
          <div className="absolute bottom-8 right-8 w-12 h-6 bg-gradient-to-tl from-white to-transparent opacity-20 rounded-full blur-sm z-30 pointer-events-none -rotate-12"></div>

          
          {/* Scan Effect (Generating Image) */}
          {isGeneratingImage && (
            <div className="absolute left-0 w-full h-full bg-gradient-to-b from-transparent via-white/30 to-transparent animate-scan z-20 pointer-events-none mix-blend-overlay"></div>
          )}

          {/* Glow particles (Generating Text) */}
          {isGeneratingText && (
             <div className="absolute inset-0 z-0 pointer-events-none">
               <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-indigo-500/20 rounded-full animate-pulse"></div>
             </div>
          )}
        </div>

        {/* Paws holding the ball - Adjusted for round shape */}
        <div className={`absolute -left-10 top-1/2 -translate-y-1/2 w-24 h-24 z-20 transition-all duration-500 ${isBusy ? 'translate-x-4 opacity-80' : 'group-hover:-translate-x-2'}`}>
           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-10deg)' }}>
             <path d="M10 50 C10 30 40 20 60 40 C70 50 80 50 90 45 L95 60 C80 80 40 90 20 80 C10 75 10 60 10 50 Z" fill="#D4A373" stroke="#8D6E63" strokeWidth="2"/>
             <circle cx="30" cy="40" r="8" fill="#5D4037" />
             <circle cx="50" cy="30" r="8" fill="#5D4037" />
             <circle cx="70" cy="35" r="8" fill="#5D4037" />
             <ellipse cx="50" cy="60" rx="20" ry="15" fill="#5D4037" />
           </svg>
        </div>

        <div className={`absolute -right-10 top-1/2 -translate-y-1/2 w-24 h-24 z-20 transition-all duration-500 ${isBusy ? '-translate-x-4 opacity-80' : 'group-hover:translate-x-2'}`}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform scale-x-[-1]" style={{ transform: 'scaleX(-1) rotate(-10deg)' }}>
             <path d="M10 50 C10 30 40 20 60 40 C70 50 80 50 90 45 L95 60 C80 80 40 90 20 80 C10 75 10 60 10 50 Z" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="2"/>
             <circle cx="30" cy="40" r="8" fill="#FFAB91" />
             <circle cx="50" cy="30" r="8" fill="#FFAB91" />
             <circle cx="70" cy="35" r="8" fill="#FFAB91" />
             <ellipse cx="50" cy="60" rx="20" ry="15" fill="#FFAB91" />
           </svg>
        </div>

      </div>

      {/* Shadow underneath */}
      <div 
        className={`
          absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/20 blur-xl rounded-full transition-all duration-500
          ${isGeneratingText ? 'w-40 h-8 opacity-30 animate-pulse' : 'w-56 h-10 opacity-20'}
          ${!isBusy ? 'group-hover:w-60 group-hover:opacity-30' : ''}
        `}
      ></div>
      
      {!disabled && !isBusy && (
        <div className="absolute -top-16 left-0 w-full text-center animate-bounce z-30">
          <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg border border-indigo-100">
            点我抽卡 👇
          </span>
        </div>
      )}
    </div>
  );
};