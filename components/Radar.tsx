
import React from 'react';

const Radar: React.FC = () => {
  return (
    <div className="relative w-32 h-32 md:w-44 md:h-44 border-2 border-cyan-500/20 rounded-full overflow-hidden bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,212,255,0.1)] group">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-[0.5px] bg-cyan-500/10"></div>
        <div className="h-full w-[0.5px] bg-cyan-500/10 absolute"></div>
        <div className="w-3/4 h-3/4 border border-cyan-500/10 rounded-full absolute"></div>
        <div className="w-1/2 h-1/2 border border-cyan-500/10 rounded-full absolute"></div>
        <div className="w-1/4 h-1/4 border border-cyan-500/10 rounded-full absolute"></div>
      </div>
      
      {/* Scanning Beam */}
      <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-tr from-cyan-500/30 to-transparent origin-top-left -translate-x-0 -translate-y-0 animate-[spin_4s_linear_infinite]"></div>
      
      {/* Target Blips */}
      <div className="absolute top-[30%] left-[60%] w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse blur-[1px]"></div>
      <div className="absolute top-[70%] left-[25%] w-1 h-1 bg-cyan-400 rounded-full animate-ping blur-[1px]"></div>
      
      {/* Radar Labels */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-2 pointer-events-none">
        <span className="text-[7px] text-cyan-900 font-bold uppercase tracking-[0.2em]">North_Sector</span>
        <span className="text-[7px] text-cyan-900 font-bold uppercase tracking-[0.2em]">Range_400km</span>
      </div>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-cyan-500/50 font-black uppercase tracking-widest">
        SEC_GRID_ALPHA
      </div>
    </div>
  );
};

export default Radar;
