
import React from 'react';

interface GlobeProps {
  lat: string;
  lon: string;
  countryCode?: string;
}

const Globe: React.FC<GlobeProps> = ({ lat, lon, countryCode }) => {
  return (
    <div className="relative w-full bg-black/40 border border-white/10 rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 overflow-hidden group">
      <div className="flex justify-between items-center mb-3 md:mb-6">
        <h4 className="text-[8px] md:text-[10px] font-black text-white/40 tracking-widest uppercase italic">🌐 PROVENANCE</h4>
        <div className="flex items-center gap-1 md:gap-1.5">
          {countryCode && countryCode !== "??" && (
            <img 
              src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`} 
              className="w-3 h-2 md:w-4 md:h-2.5 opacity-80" 
              alt="flag" 
            />
          )}
          <span className="text-[7px] md:text-[8px] font-mono text-cyan-700 font-black">SYNC</span>
        </div>
      </div>
      
      <div className="relative w-full aspect-square flex items-center justify-center">
        <div className="w-4/5 h-4/5 border border-white/10 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.1)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,212,255,0.2)_10deg,transparent_15deg)] animate-[spin_6s_linear_infinite]"></div>
          
          <div 
            className="absolute w-4 h-4 md:w-6 md:h-6 bg-rose-500/20 rounded-full blur-[4px] md:blur-[8px] animate-pulse"
            style={{ top: '42%', left: '52%' }}
          ></div>
          <div 
            className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"
            style={{ top: '42%', left: '52%' }}
          ></div>

          <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-full scale-[0.7]"></div>
          <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-full scale-[0.4]"></div>
        </div>

        <div className="absolute inset-0 border-[0.5px] border-cyan-500/20 rounded-full border-dashed animate-[spin_40s_linear_infinite]"></div>
        <div className="absolute inset-[-8px] md:inset-[-15px] border-[0.5px] border-white/5 rounded-full animate-[spin_60s_linear_infinite_reverse]"></div>
      </div>

      <div className="mt-3 md:mt-6 text-center">
        <p className="text-[9px] md:text-[11px] font-mono flex items-center justify-center gap-2 md:gap-3">
          <span className="text-white/20 font-black">LOC:</span> 
          <span className="text-white font-bold tabular-nums tracking-tighter text-[8px] md:text-[11px]">{lat}°N / {lon}°E</span> 
        </p>
      </div>
    </div>
  );
};

export default Globe;
