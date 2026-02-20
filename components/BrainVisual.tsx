import React from 'react';

interface BrainVisualProps {
  state: 'idle' | 'listening' | 'speaking';
}

export const BrainVisual: React.FC<BrainVisualProps> = ({ state }) => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center">
      {/* Core Glow */}
      <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
        state === 'speaking' ? 'bg-purple-500/30 scale-110' : 
        state === 'listening' ? 'bg-accent/30 scale-100' : 
        'bg-accent/10 scale-90'
      }`}></div>

      {/* Brain/Orb Representation */}
      <div className="relative w-full h-full">
         <div className={`absolute inset-0 border-2 rounded-full border-accent/20 animate-[spin_10s_linear_infinite]`}></div>
         <div className={`absolute inset-4 border border-accent/10 rounded-full animate-[spin_15s_linear_infinite_reverse]`}></div>
         
         {/* Center Pulse */}
         <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-black to-elevated border border-accent/30 shadow-[0_0_30px_rgba(0,212,255,0.2)] flex items-center justify-center transition-all duration-300 ${
              state === 'speaking' ? 'scale-110 border-purple-400/50 shadow-[0_0_50px_rgba(168,85,247,0.4)]' :
              state === 'listening' ? 'scale-105 border-accent/50 shadow-[0_0_50px_rgba(0,212,255,0.4)]' :
              'scale-100'
            }`}>
              <div className={`w-2 h-2 rounded-full bg-white transition-all duration-100 ${
                 state === 'speaking' ? 'animate-bounce' : 'opacity-50'
              }`}></div>
            </div>
         </div>

         {/* Particles */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
            <div className={`absolute w-2 h-2 bg-accent rounded-full top-0 left-1/2 animate-pulse`}></div>
            <div className={`absolute w-1 h-1 bg-white rounded-full bottom-0 left-1/2 animate-pulse delay-75`}></div>
            <div className={`absolute w-1.5 h-1.5 bg-accent rounded-full top-1/2 left-0 animate-pulse delay-150`}></div>
            <div className={`absolute w-2 h-2 bg-purple-400 rounded-full top-1/2 right-0 animate-pulse delay-300`}></div>
         </div>
      </div>
    </div>
  );
};