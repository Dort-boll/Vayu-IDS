
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Threat, NeuralStats, ThreatSeverity } from './types';
import { NeuralBus } from './services/threatFeed';
import { performLocalAnalysis } from './services/forensicEngine';
import MatrixRain from './components/MatrixRain';
import Globe from './components/Globe';
import Radar from './components/Radar';
import ThreatOrb from './components/ThreatOrb';
import HeaderParticles from './components/HeaderParticles';
import L7DataProbe from './components/L7DataProbe';
import ThreatGraph from './components/ThreatGraph';

const App: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [focusedThreat, setFocusedThreat] = useState<Threat | null>(null);
  const [hoveredThreat, setHoveredThreat] = useState<Threat | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isTacticalAlert, setIsTacticalAlert] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState<ThreatSeverity | null>(null);
  const [stats, setStats] = useState<NeuralStats>({
    threatCount: 0,
    abuseCount: 0,
    accuracy: 99.998,
    entropy: 0.012,
    uptime: 0
  });
  const [report, setReport] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMaterializing, setIsMaterializing] = useState<boolean>(false);
  
  const busRef = useRef<NeuralBus | null>(null);
  const uptimeRef = useRef<number>(0);

  // Selection priority: Focused > Hovered > Latest in feed
  const activeSubject = useMemo(() => {
    if (focusedThreat) return focusedThreat;
    if (hoveredThreat) return hoveredThreat;
    return threats[0] || null;
  }, [focusedThreat, hoveredThreat, threats]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      uptimeRef.current += 1;
      setStats(prev => ({ 
        ...prev, 
        uptime: uptimeRef.current,
        accuracy: 99.9982 + (Math.random() * 0.0001)
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleThreatReception = useCallback((threat: Threat) => {
    setThreats(prev => [threat, ...prev].slice(0, 50));
    setStats(prev => ({
      ...prev,
      threatCount: prev.threatCount + 1,
      abuseCount: threat.source.match(/THREATFOX|URLHAUS/) ? prev.abuseCount + 1 : prev.abuseCount,
    }));
    
    if (threat.severity === ThreatSeverity.CRITICAL) {
      setBurstTrigger(threat.severity);
      setIsTacticalAlert(true);
      setTimeout(() => setBurstTrigger(null), 1000);
      setTimeout(() => setIsTacticalAlert(false), 5000);
    }
  }, []);

  useEffect(() => {
    const bus = new NeuralBus();
    busRef.current = bus;
    bus.sub(handleThreatReception);

    const init = async () => {
      for(let i=0; i<12; i++) {
        const t = await bus.fetchLiveIntelligence();
        bus.pub(t);
        handleThreatReception(t);
      }
    };
    init();

    const fetchInterval = setInterval(async () => {
      const newThreat = await bus.fetchLiveIntelligence();
      bus.pub(newThreat);
      handleThreatReception(newThreat);
    }, 5000);

    return () => clearInterval(fetchInterval);
  }, [handleThreatReception]);

  const selectThreat = useCallback((threat: Threat) => {
    if (focusedThreat?.id === threat.id) {
      setFocusedThreat(null);
      setReport('');
      return;
    }
    
    setIsMaterializing(true);
    setFocusedThreat(threat);
    setIsProcessing(true);
    
    // Deterministic forensic processing
    setTimeout(() => {
      const forensicOutput = performLocalAnalysis(threat, threats);
      setReport(forensicOutput);
      setIsProcessing(false);
      setIsMaterializing(false);
    }, 500);
  }, [focusedThreat, threats]);

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#010208] flex flex-col items-center justify-center font-mono text-cyan-500 overflow-hidden p-6">
        <div className="text-4xl md:text-7xl font-black italic mb-2 animate-pulse tracking-[0.3em] md:tracking-[0.5em] text-white drop-shadow-[0_0_15px_#00d4ff] text-center">VAYU.IX</div>
        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[1em] mb-12 opacity-30 text-center">ABUSE.CH_UPLINK_STABILIZING</div>
        <div className="w-64 md:w-80 h-0.5 bg-white/5 rounded-full overflow-hidden relative">
          <div className="h-full bg-cyan-400 shadow-[0_0_15px_#00d4ff] animate-[loading_0.8s_ease-in-out]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-screen w-full bg-[#020308] text-cyan-400 overflow-hidden font-mono transition-all duration-1000 ${isTacticalAlert ? 'ring-inset ring-2 ring-rose-500/20' : ''}`}>
      
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ${focusedThreat ? 'blur-md opacity-20 scale-105' : 'blur-0 opacity-100 scale-100'}`}>
        <MatrixRain />
      </div>

      {/* COMMAND HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 px-4 md:px-12 flex items-center justify-between z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <HeaderParticles burstTrigger={burstTrigger} />
        <div className="flex items-center gap-4 md:gap-8 relative z-10">
          <div className="relative w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-cyan-500/50 rounded-lg bg-cyan-500/5 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
            <span className="text-xl md:text-2xl font-black italic text-white">V</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-xl font-black italic tracking-widest text-white leading-none uppercase">Vayu IDS</h1>
            <p className="text-[7px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-black text-white/20 mt-1">Live Intelligence Terminal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-16 relative z-10">
          <div className="text-right">
            <p className="text-[7px] md:text-[9px] text-white/30 uppercase tracking-widest mb-0.5 md:mb-1">Confidence</p>
            <p className="text-sm md:text-2xl font-black tabular-nums text-cyan-400 drop-shadow-[0_0_10px_#00d4ff]">{stats.accuracy.toFixed(3)}%</p>
          </div>
          <div className="h-8 md:h-10 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="text-right hidden md:block">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Session Active</p>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter">
               {Math.floor(stats.uptime / 60).toString().padStart(2, '0')}:{(stats.uptime % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </header>

      {/* TACTICAL GRID - Responsive Flex */}
      <main className="relative h-full pt-16 md:pt-20 pb-20 px-4 md:px-8 z-20 overflow-y-auto lg:overflow-hidden" onClick={() => setFocusedThreat(null)}>
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 h-full w-full">
          
          {/* LEFT: Live Telemetry */}
          <div className={`w-full lg:w-[24%] flex flex-col h-auto lg:h-full min-h-0 relative transition-all duration-700 ${focusedThreat ? 'lg:blur-md lg:opacity-30 lg:pointer-events-none' : 'blur-0 opacity-100'}`} onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#03050a]/90 border border-white/10 rounded-2xl lg:rounded-t-[2.5rem] lg:rounded-b-none p-4 md:p-6 backdrop-blur-3xl shrink-0">
               <Globe lat={activeSubject?.lat || "0.00"} lon={activeSubject?.lon || "0.00"} countryCode={activeSubject?.countryCode} />
            </div>
            <div className="flex-1 min-h-[300px] lg:min-h-0 relative mt-4 lg:mt-0">
              <L7DataProbe 
                threats={threats} 
                onSelect={selectThreat} 
                onHover={setHoveredThreat} 
                selectedId={focusedThreat?.id} 
                isTactical={isTacticalAlert} 
              />
            </div>
          </div>

          {/* CENTER: Visualization Hub */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px] md:min-h-0">
             <div className={`absolute inset-0 transition-all duration-1000 ${focusedThreat ? 'opacity-0 scale-110 blur-3xl' : 'opacity-100 scale-100 blur-0'}`}>
              {threats.slice(0, 12).map((t) => (
                <ThreatOrb key={`node-${t.id}`} threat={t} onClick={selectThreat} onHover={setHoveredThreat} isFocused={focusedThreat?.id === t.id} />
              ))}
            </div>

            {/* Subject Focus Area */}
            {focusedThreat && (
              <div 
                className={`relative flex flex-col items-center transition-all duration-700 w-full max-w-sm md:max-w-none ${isMaterializing ? 'scale-90 opacity-0 blur-xl' : 'scale-100 opacity-100 blur-0'}`} 
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 1000 }}
              >
                <div className={`absolute -inset-24 md:-inset-[20rem] rounded-full blur-[100px] md:blur-[180px] opacity-40 transition-colors duration-1000 ${isTacticalAlert ? 'bg-rose-600' : 'bg-cyan-600'}`}></div>
                
                <div className="relative px-6 py-10 md:px-16 md:py-20 bg-black/70 backdrop-blur-3xl border border-white/20 rounded-3xl md:rounded-[4rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] md:shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden w-full lg:min-w-[450px]">
                  <div className="absolute top-4 left-4 md:top-8 md:left-8 w-8 h-8 md:w-12 md:h-12 border-t-2 border-l-2 border-cyan-400/50"></div>
                  <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-8 h-8 md:w-12 md:h-12 border-b-2 border-r-2 border-cyan-400/50"></div>
                  
                  <div className="flex flex-col items-center relative">
                    <span className="text-[8px] md:text-[11px] text-cyan-400 font-black uppercase tracking-[1em] md:tracking-[1.5em] mb-6 md:mb-10 italic opacity-60">Subject_Lock</span>
                    
                    <h2 className={`text-3xl md:text-6xl lg:text-7xl font-black font-jetbrains leading-none tracking-tighter whitespace-nowrap px-4 md:px-8 select-all ${isTacticalAlert ? 'text-rose-500' : 'text-white'}`}>
                      {focusedThreat.srcIP}
                    </h2>

                    <div className="mt-8 md:mt-16 flex flex-col md:flex-row gap-6 md:gap-24 items-center justify-between w-full border-t border-white/10 pt-8 md:pt-12">
                       <div className="flex flex-col items-center md:items-start">
                         <span className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-[0.4em] mb-1 font-black">Region</span>
                         <span className="text-xl md:text-3xl font-mono text-cyan-400 font-bold uppercase tracking-tighter">{focusedThreat.countryName}</span>
                       </div>
                       <div className="flex flex-col items-center md:items-end">
                         <span className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-[0.4em] mb-1 font-black">Risk</span>
                         <span className={`text-xl md:text-3xl font-black italic tracking-tighter ${focusedThreat.riskScore > 80 ? 'text-rose-500' : 'text-cyan-400'}`}>{focusedThreat.riskScore}%</span>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => setFocusedThreat(null)} 
                      className="mt-8 md:hidden px-6 py-2 border border-white/20 rounded-full text-[10px] uppercase font-black tracking-widest text-white/40"
                    >
                      Release
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Intelligence Dossier */}
          <div className="w-full lg:w-[32%] flex flex-col h-auto lg:h-full relative pb-8 lg:pb-0" onClick={(e) => e.stopPropagation()}>
            <div className={`flex-1 flex flex-col bg-[#050810]/95 border border-white/10 rounded-2xl md:rounded-[3rem] p-6 md:p-10 backdrop-blur-2xl shadow-6xl transition-all duration-700 ${activeSubject ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'}`}>
                {activeSubject ? (
                  <div className="flex-1 flex flex-col space-y-6 md:space-y-8 font-mono relative overflow-hidden">
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] text-cyan-500 font-black tracking-widest uppercase mb-1">Dossier</span>
                        <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter truncate max-w-[180px] md:max-w-none">{activeSubject.srcIP}</h3>
                      </div>
                      <div className={`px-3 py-1 md:px-5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black border transition-all duration-500 ${focusedThreat ? 'bg-white text-black border-white' : 'bg-white/5 text-white/20 border-white/5'}`}>
                        {focusedThreat ? 'LOCKED' : 'SYNOPSIS'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-8 text-[12px] md:text-[14px]">
                      <div className="flex flex-col gap-1 md:gap-2">
                        <span className="text-[7px] md:text-[9px] text-white/30 font-black uppercase tracking-widest">Signature</span>
                        <span className="text-xs md:text-lg font-bold text-white tracking-tight leading-tight truncate">{activeSubject.type}</span>
                      </div>
                      <div className="flex flex-col gap-1 md:gap-2">
                        <span className="text-[7px] md:text-[9px] text-white/30 font-black uppercase tracking-widest">Origin</span>
                        <span className="text-xs md:text-lg font-bold text-white tracking-tight leading-tight truncate">{activeSubject.countryName}</span>
                      </div>
                      <div className="flex flex-col gap-1 md:gap-2">
                        <span className="text-[7px] md:text-[9px] text-white/30 font-black uppercase tracking-widest">ASN</span>
                        <span className="text-xs md:text-lg font-bold text-white tracking-tight leading-tight truncate">{activeSubject.asn}</span>
                      </div>
                      <div className="flex flex-col gap-1 md:gap-2">
                        <span className="text-[7px] md:text-[9px] text-white/30 font-black uppercase tracking-widest">Severity</span>
                        <span className={`text-xs md:text-lg font-bold tracking-tight leading-tight ${activeSubject.severity === 'CRITICAL' ? 'text-rose-500' : 'text-cyan-400'}`}>{activeSubject.severity}</span>
                      </div>
                    </div>

                    <div className="shrink-0 bg-black/40 border border-white/5 rounded-2xl md:rounded-[2.5rem] p-4 hidden md:block">
                      <ThreatGraph focusedThreat={activeSubject} allThreats={threats} />
                    </div>

                    <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl md:rounded-[3rem] p-4 md:p-8 overflow-y-auto forensic-scroll shadow-inner min-h-[150px]">
                      {isProcessing && focusedThreat?.id === activeSubject.id ? (
                        <div className="animate-pulse space-y-4">
                           <div className="h-3 w-full bg-white/5 rounded-full"></div>
                           <div className="h-3 w-3/4 bg-white/5 rounded-full"></div>
                           <p className="text-cyan-400/40 text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] mt-4 italic">Processing...</p>
                        </div>
                      ) : (
                        <div className="text-[11px] md:text-[13px] leading-relaxed text-white/60 whitespace-pre-wrap font-jetbrains tracking-tight">
                          {focusedThreat?.id === activeSubject.id ? report : ">>> STANDBY. TELEMETRY_READY."}
                        </div>
                      )}
                    </div>

                    {focusedThreat && (
                      <button 
                        onClick={() => selectThreat(focusedThreat)} 
                        className="w-full py-4 md:py-8 bg-white text-black font-black text-[10px] md:text-[14px] uppercase tracking-widest rounded-xl md:rounded-[2rem] hover:bg-cyan-400 transition-all active:scale-95"
                      >
                        Release Lock
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-10 uppercase font-black tracking-[1em] md:tracking-[1.5em] gap-8 md:gap-12">
                    <div className="w-16 h-16 md:w-32 md:h-32 border-2 border-dashed border-white rounded-full animate-[spin_40s_linear_infinite]"></div>
                    Standby
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER TICKER */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-black/95 backdrop-blur-3xl border-t border-white/5 flex items-center px-4 md:px-12 z-[100]">
        <div className="hidden md:flex items-center gap-10 text-[12px] font-black text-cyan-950 uppercase tracking-widest mr-20 shrink-0 italic">
          <span className={`w-5 h-5 rounded-lg ${isTacticalAlert ? 'bg-rose-900 animate-pulse' : 'bg-cyan-900'}`}></span>
          L7_PROBE
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-10 md:gap-20 ticker-animate whitespace-nowrap">
            {threats.map((t, i) => (
              <div 
                key={`${t.id}-footer-${i}`} 
                className={`flex items-center gap-4 md:gap-8 text-[11px] md:text-[13px] font-mono pr-10 md:pr-20 border-r border-white/5 cursor-pointer transition-all ${activeSubject?.id === t.id ? 'text-white scale-105' : 'text-cyan-900 hover:text-cyan-400'}`}
                onMouseEnter={() => setHoveredThreat(t)}
                onClick={() => selectThreat(t)}
              >
                <span className="opacity-40 hidden sm:inline">[{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                <span className="font-black tracking-tighter">{t.srcIP}</span>
                <span className={`font-black text-[8px] md:text-[10px] ${t.severity === 'CRITICAL' ? 'text-rose-600' : 'text-cyan-800'}`}>#{t.severity.slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ml-4 md:ml-16 flex items-center gap-4 md:gap-16 shrink-0">
          <div className="hidden sm:block">
            <Radar />
          </div>
          <div className="text-[10px] md:text-[12px] text-cyan-950 font-black flex flex-col items-end gap-0.5 md:gap-1">
            <span className="tracking-widest uppercase hidden md:inline">{isTacticalAlert ? 'CRITICAL' : 'OPTIMAL'}</span>
            <div className="text-cyan-900 italic text-[8px] md:text-[10px] opacity-20 tracking-wider">v12.0.4</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
