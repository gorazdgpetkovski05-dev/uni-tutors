import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const COLORS = ['#6366f1', '#eab308', '#22c55e', '#a855f7', '#ec4899'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  isCircle: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const items: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 200),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 4,
      rotation: Math.random() * 720 - 360,
      isCircle: Math.random() > 0.5,
    }));
    setParticles(items);
    const timer = setTimeout(() => { setParticles([]); onComplete?.(); }, 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: '50vw', y: '40vh', opacity: 1, scale: 0, rotate: 0 }}
              animate={{ x: `calc(50vw + ${p.x}px)`, y: `calc(40vh + ${p.y}px)`, opacity: 0, scale: 1, rotate: p.rotation }}
              transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ position: 'absolute', width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.isCircle ? '50%' : '2px' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
