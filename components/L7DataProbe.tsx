
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Threat, ThreatSeverity } from '../types';

interface L7DataProbeProps {
  threats: Threat[];
  onSelect: (threat: Threat) => void;
  onHover: (threat: Threat | null) => void;
  selectedId?: string;
  isTactical?: boolean;
}

const WaveformVisualizer: React.FC<{ active: boolean; color: string; intensity: number }> = ({ active, color, intensity }) => {
  const [points, setPoints] = useState<number[]>(new Array(10).fill(2));

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPoints(prev => {
        const next = [...prev];
        next.shift();
        next.push(Math.random() * 20 * intensity + 2);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [active, intensity]);

  return (
    <div className={`h-4 md:h-6 w-full overflow-hidden transition-all duration-700 flex items-center gap-[1px] bg-black/40 rounded-md px-1.5 border ${active ? 'border-white/20' : 'border-white/5'}`}>
      {points.map((p, i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-all duration-200"
          style={{
            height: `${active ? p : 2}px`,
            backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
            boxShadow: active && p > 10 ? `0 0 8px ${color}` : 'none',
            opacity: active ? 0.8 : 0.1
          }}
        />
      ))}
    </div>
  );
};

const L7DataProbe: React.FC<L7DataProbeProps> = ({ threats, onSelect, onHover, selectedId, isTactical }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredThreats = useMemo(() => {
    if (filterSeverity === 'ALL') return threats;
    return threats.filter(t => t.severity === filterSeverity);
  }, [threats, filterSeverity]);

  return (
    <div className={`h-full flex flex-col bg-black/60 border-x border-b border-white/10 rounded-2xl lg:rounded-b-[2.5rem] backdrop-blur-3xl transition-all duration-1000 relative overflow-hidden ${isTactical ? 'border-rose-500/30' : 'border-cyan-500/10'}`}>
      
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-white/10 bg-white/[0.02] shrink-0">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-0.5 h-2.5 md:w-1 md:h-3 ${isTactical ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
              <h4 className="text-[8px] md:text-[10px] font-black text-white/80 tracking-widest uppercase italic">LIVE_FEED</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[7px] md:text-[8px] font-mono ${isTactical ? 'text-rose-500' : 'text-cyan-500'} font-black animate-pulse`}>SYNC</span>
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`text-[7px] md:text-[8px] px-2 py-0.5 md:px-2.5 md:py-1 rounded border font-black transition-all whitespace-nowrap ${filterSeverity === s ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-transparent text-white/20 border-white/10'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto forensic-scroll px-3 py-4 md:px-4 md:py-6 space-y-2 md:space-y-3 min-h-0"
      >
        {filteredThreats.length > 0 ? filteredThreats.map((t) => {
          const isSelected = selectedId === t.id;
          const severityColor = t.severity === ThreatSeverity.CRITICAL ? '#ff0040' : isSelected ? '#00d4ff' : '#ffffff';
          
          return (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              onMouseEnter={() => onHover(t)}
              onMouseLeave={() => onHover(null)}
              className={`relative cursor-pointer transition-all duration-300 rounded-xl md:rounded-2xl overflow-hidden border ${
                isSelected ? 'bg-white/5 border-white/20 scale-[1.01] md:scale-[1.02] shadow-xl z-10' : 'border-white/5 hover:bg-white/[0.03]'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-700 ${isSelected ? (t.severity === ThreatSeverity.CRITICAL ? 'bg-rose-500 shadow-[0_0_10px_#ff0040]' : 'bg-cyan-500 shadow-[0_0_10px_#00d4ff]') : 'bg-transparent'}`}></div>

              <div className="p-3 md:p-4">
                <div className="flex justify-between items-center mb-1.5 md:mb-2.5">
                  <span className={`text-[11px] md:text-[13px] font-black tracking-tighter transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>{t.srcIP}</span>
                  <span className={`text-[6px] md:text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${t.severity === ThreatSeverity.CRITICAL ? 'border-rose-500/40 text-rose-500' : 'border-white/10 text-white/30'}`}>{t.severity.slice(0, 4)}</span>
                </div>
                <WaveformVisualizer active={isSelected} color={severityColor} intensity={t.riskScore / 100} />
                <div className="mt-1.5 md:mt-2.5 flex items-center justify-between opacity-30">
                   <span className="text-[6px] md:text-[7px] font-mono text-white uppercase truncate max-w-[80px] md:max-w-[120px] font-bold">{t.type.split('_')[0]}</span>
                   <span className="text-[6px] md:text-[7px] font-mono text-white font-black tracking-tighter">{t.countryCode}</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-10">
            <p className="text-[8px] font-black uppercase tracking-widest">Feed Empty</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 md:px-6 md:py-3 bg-white/[0.01] border-t border-white/5 shrink-0 flex items-center justify-between">
         <span className="text-[7px] font-mono text-cyan-900 uppercase">Buffer: OK</span>
         <span className="text-[7px] font-mono text-cyan-900 uppercase">{Math.random().toFixed(3)}</span>
      </div>
    </div>
  );
};

export default L7DataProbe;
