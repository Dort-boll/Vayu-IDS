
import React, { useMemo } from 'react';
import { Threat } from '../types';

interface ThreatLineageProps {
  focusedThreat: Threat;
  allThreats: Threat[];
}

const ThreatLineage: React.FC<ThreatLineageProps> = ({ focusedThreat, allThreats }) => {
  const lineage = useMemo(() => {
    return allThreats
      .filter(t => t.id !== focusedThreat.id)
      .filter(t => 
        t.asn === focusedThreat.asn || 
        Math.abs(t.neuralScore - focusedThreat.neuralScore) < 0.02
      )
      .slice(0, 4);
  }, [focusedThreat, allThreats]);

  if (lineage.length === 0) {
    return (
      <div className="py-4 px-6 border border-white/5 rounded-2xl bg-black/20 text-center">
        <p className="text-[10px] font-black text-cyan-950 uppercase tracking-[0.3em]">No direct correlates identified</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-cyan-800 uppercase tracking-[0.4em] flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#00d4ff]"></span>
          Coordinated_Lineage
        </h4>
        <span className="text-[8px] font-mono text-cyan-900 font-bold uppercase">{lineage.length + 1} SIBLING_NODES</span>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Connecting Line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-cyan-500 via-cyan-500/20 to-transparent"></div>

        {/* Current Node (Focused) */}
        <div className="relative group">
          <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border border-cyan-400 bg-cyan-400 shadow-[0_0_10px_#00d4ff] z-10"></div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white tracking-tighter">{focusedThreat.srcIP}</span>
            <span className="text-[7px] font-mono text-cyan-400 font-black uppercase tracking-widest">PRIMARY_SUBJECT</span>
          </div>
        </div>

        {/* Correlated Nodes */}
        {lineage.map((node, idx) => (
          <div key={node.id} className="relative group opacity-60 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full border border-cyan-500/40 bg-black z-10 group-hover:bg-cyan-500/40 transition-colors"></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/80 font-bold">{node.srcIP}</span>
                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${node.asn === focusedThreat.asn ? 'border-purple-500/50 text-purple-400' : 'border-cyan-500/20 text-cyan-700'}`}>
                  {node.asn === focusedThreat.asn ? 'ASN_MATCH' : 'NEURAL_LINK'}
                </span>
              </div>
              <span className="text-[6px] font-mono text-white/20 uppercase tracking-widest mt-0.5">Vector: {node.threatVector}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatLineage;
