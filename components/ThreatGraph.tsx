
import React, { useMemo } from 'react';
import { Threat } from '../types';

interface ThreatGraphProps {
  focusedThreat: Threat;
  allThreats: Threat[];
}

const ThreatGraph: React.FC<ThreatGraphProps> = ({ focusedThreat, allThreats }) => {
  const connections = useMemo(() => {
    return allThreats
      .filter(t => t.id !== focusedThreat.id)
      .filter(t => t.asn === focusedThreat.asn || t.countryCode === focusedThreat.countryCode)
      .slice(0, 6);
  }, [focusedThreat, allThreats]);

  return (
    <div className="relative w-full h-48 bg-black/40 border border-white/10 rounded-[3rem] overflow-hidden mt-6 shadow-inner group">
      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
        <span className="text-[9px] font-black text-cyan-700 uppercase tracking-[0.4em]">Neural_Correlation_Graph</span>
      </div>

      <svg className="w-full h-full" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center Node: Focused Threat */}
        <circle 
          cx="200" cy="100" r="12" 
          fill="#00d4ff" 
          filter="url(#glow)"
          className="animate-pulse"
        />
        <circle cx="200" cy="100" r="25" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />

        {/* Connection Lines & Sibling Nodes */}
        {connections.map((node, i) => {
          const angle = (i / connections.length) * Math.PI * 2;
          const radius = 70;
          const tx = 200 + Math.cos(angle) * radius;
          const ty = 100 + Math.sin(angle) * radius;

          return (
            <g key={node.id}>
              <line 
                x1="200" y1="100" x2={tx} y2={ty} 
                stroke="url(#linkGradient)" 
                strokeWidth="1" 
                strokeDasharray="2 4"
                className="opacity-40"
              />
              <circle 
                cx={tx} cy={ty} r="5" 
                fill={node.asn === focusedThreat.asn ? "#ff0040" : "#00d4ff"} 
                className="opacity-80 transition-all duration-500 hover:r-8 cursor-help"
              />
              <text 
                x={tx + 10} y={ty + 4} 
                fill="#ffffff33" 
                fontSize="6" 
                className="font-mono uppercase tracking-tighter pointer-events-none"
              >
                {node.srcIP.split('.').slice(0, 2).join('.')}.*
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-6 flex gap-4 text-[7px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> LINK</div>
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> ASN_MATCH</div>
      </div>
    </div>
  );
};

export default ThreatGraph;
