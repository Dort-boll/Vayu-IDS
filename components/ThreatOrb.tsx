
import React, { useMemo } from 'react';
import { Threat, ThreatSeverity } from '../types';

interface ThreatOrbProps {
  threat: Threat;
  onClick: (threat: Threat) => void;
  onHover: (threat: Threat | null) => void;
  isFocused?: boolean;
}

const ThreatOrb: React.FC<ThreatOrbProps> = ({ threat, onClick, onHover, isFocused }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  const severityConfig = useMemo(() => {
    const scoreMultiplier = threat.neuralScore;
    switch (threat.severity) {
      case ThreatSeverity.CRITICAL:
        return { 
          color: '#ff0040', 
          label: 'CRIT', 
          shadow: `0 0 ${isMobile ? 30 : 60 * scoreMultiplier}px #ff0040`, 
          baseSize: isMobile ? 68 : 92, 
          glowIntensity: 'animate-pulse'
        };
      case ThreatSeverity.HIGH:
        return { 
          color: '#ff7700', 
          label: 'HIGH', 
          shadow: `0 0 ${isMobile ? 22 : 40 * scoreMultiplier}px #ff7700`, 
          baseSize: isMobile ? 60 : 80, 
          glowIntensity: ''
        };
      case ThreatSeverity.MEDIUM:
        return { 
          color: '#ffaa00', 
          label: 'MED', 
          shadow: `0 0 ${isMobile ? 15 : 28 * scoreMultiplier}px #ffaa00`, 
          baseSize: isMobile ? 52 : 70, 
          glowIntensity: ''
        };
      default:
        return { 
          color: '#00ccff', 
          label: 'LOW', 
          shadow: `0 0 15px #00ccff`, 
          baseSize: isMobile ? 44 : 56, 
          glowIntensity: ''
        };
    }
  }, [threat.severity, threat.neuralScore, isMobile]);

  const finalSize = severityConfig.baseSize * (0.9 + threat.neuralScore * 0.2);

  const position = useMemo(() => {
    const seed = threat.countryCode.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const baseX = (seed % (isMobile ? 70 : 60)) + (isMobile ? 10 : 20);
    const baseY = (seed % (isMobile ? 60 : 40)) + (isMobile ? 15 : 30);
    
    const jitterX = (parseInt(threat.id.slice(0, 2), 36) % 20) - 10;
    const jitterY = (parseInt(threat.id.slice(2, 4), 36) % 15) - 7.5;
    
    return {
      top: `${baseY + jitterY}%`,
      left: `${baseX + jitterX}%`,
      animationDelay: `${(seed % 50) / 10}s`,
      floatDuration: `${isMobile ? 12 : 8 + (seed % 7)}s`
    };
  }, [threat.countryCode, threat.id, isMobile]);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(threat); }}
      onMouseEnter={() => onHover(threat)}
      onMouseLeave={() => onHover(null)}
      className={`absolute cursor-pointer transition-all duration-700 active:scale-95 group ${isFocused ? 'scale-125 z-[999]' : 'z-20'}`}
      style={{
        top: position.top,
        left: position.left,
        animation: `orb-float-advanced ${position.floatDuration} ease-in-out infinite`,
        animationDelay: position.animationDelay,
        width: finalSize,
        height: finalSize,
        filter: isFocused ? 'blur(0px) saturate(1.2)' : 'blur(0px)'
      }}
    >
      <div 
        className={`w-full h-full rounded-full flex flex-col items-center justify-center p-2 text-white border-2 border-white/20 backdrop-blur-3xl transition-all duration-500 relative overflow-hidden ${isFocused ? 'border-white/80 ring-2 ring-white/10 shadow-[0_0_50px_rgba(255,255,255,0.2)]' : ''} ${severityConfig.glowIntensity}`}
        style={{ 
          backgroundColor: `${severityConfig.color}44`,
          boxShadow: isFocused ? `0 0 40px ${severityConfig.color}AA` : severityConfig.shadow
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        <span className="text-[7px] md:text-[10px] font-black tracking-widest text-white leading-none mb-1 uppercase italic">{severityConfig.label}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_white] z-10"></div>
        <span className="text-[6px] md:text-[10px] font-mono font-black truncate w-full text-center tracking-tighter text-white mt-1.5 z-10">
           {threat.srcIP.split('.').slice(0, 2).join('.')}.*
        </span>
      </div>
      
      <style>{`
        @keyframes orb-float-advanced {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, -12px); }
        }
      `}</style>
    </div>
  );
};

export default ThreatOrb;
