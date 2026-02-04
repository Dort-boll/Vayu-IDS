
import React, { useEffect, useRef } from 'react';
import { ThreatSeverity } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface HeaderParticlesProps {
  burstTrigger?: ThreatSeverity | null;
}

const HeaderParticles: React.FC<HeaderParticlesProps> = ({ burstTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 100;
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticle = (x: number, y: number, color: string, isBurst: boolean) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst ? Math.random() * 4 + 2 : Math.random() * 1 + 0.5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 2 + (isBurst ? 2 : 1),
      };
    };

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Automatic ambient particles
      if (Math.random() > 0.8 && particles.current.length < 50) {
        particles.current.push(createParticle(canvas.width / 2, canvas.height / 2, '#00d4ff', false));
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (burstTrigger && canvasRef.current) {
      const color = burstTrigger === ThreatSeverity.CRITICAL ? '#ff0040' : '#ff7700';
      const count = burstTrigger === ThreatSeverity.CRITICAL ? 40 : 15;
      const canvas = canvasRef.current;
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 4,
          life: 1.0,
          color,
          size: Math.random() * 3 + 1,
        });
      }
    }
  }, [burstTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-60"
    />
  );
};

export default HeaderParticles;
