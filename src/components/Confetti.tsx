import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
}

interface ConfettiProps {
  triggerId: string | number | null;
  originX?: number; // percentage or px
  originY?: number;
}

const CONFETTI_COLORS = [
  '#A855F7', // Neon Purple
  '#10B981', // Electric Emerald
  '#06B6D4', // Electric Cyan
  '#F59E0B', // Amber
  '#EC4899', // Hot Pink
  '#3B82F6', // Neon Blue
];

export default function Confetti({ triggerId, originX = 50, originY = 50 }: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!triggerId) return;

    // Generate fresh burst of particles
    const newParticles: ConfettiParticle[] = [];
    const particleCount = 35;

    for (let i = 0; i < particleCount; i++) {
      // Random direction between 0 and 360 degrees
      const angle = Math.random() * Math.PI * 2;
      // Random initial velocity
      const velocity = 8 + Math.random() * 15;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const size = 6 + Math.random() * 10;

      newParticles.push({
        id: Date.now() + i,
        // Start precisely at the specified origin
        x: originX,
        y: originY,
        color,
        size,
        angle,
        velocity,
      });
    }

    setParticles(newParticles);

    // Clear particles after animation completes
    const timer = setTimeout(() => {
      setParticles([]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [triggerId, originX, originY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((p) => {
          // Calculate destination path with random gravity and spread arc
          const targetX = Math.cos(p.angle) * p.velocity * 12;
          const targetY = Math.sin(p.angle) * p.velocity * 12 + 80; // Add simulated gravity pull downwards

          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}80`,
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: targetX,
                y: targetY,
                scale: [1, 1.2, 0.4],
                opacity: [1, 1, 0],
                rotate: Math.random() * 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
