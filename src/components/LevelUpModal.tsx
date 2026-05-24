import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import { playLevelUpSound } from '../utils/audio';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  
  // Trigger sound exactly once when the modal is opened
  useEffect(() => {
    if (isOpen) {
      playLevelUpSound();
    }
  }, [isOpen]);

  const getLevelTitle = (level: number) => {
    if (level === 1) return 'Focus Wizard';
    if (level === 2) return 'Routine Alchemist';
    if (level === 3) return 'Zen Master';
    if (level === 4) return 'Productivity Sage';
    if (level === 5) return 'Chronos Champion';
    if (level === 6) return 'Vibe Overlord';
    return 'Grandmaster of Flow';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop screen lock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#06060c]/85 backdrop-blur-md"
          />

          {/* Modal Card frame */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-[#1a1a1c] border border-white/5 rounded-[32px] p-8 max-w-sm w-full text-center relative z-10 shadow-2xl overflow-hidden"
          >
            {/* Soft decorative visual blur glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Sparkles circle */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-[#A855F7] to-[#10B981] blur-md opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#A855F7] to-[#7C3AED] rounded-[24px] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  <Trophy className="w-10 h-10 text-white animate-bounce" />
                </div>
                {/* Floating star */}
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Text header content */}
            <h4 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-400 to-[#10B981] bg-clip-text text-transparent uppercase mb-2 font-sans select-none">
              Level Up!
            </h4>
            
            <p className="text-xs font-mono text-[#10B981] uppercase tracking-widest mb-6 font-semibold">
              You ascended to new coordinates
            </p>

            {/* Status box indicating power scaling */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl py-4 px-6 mb-8 text-center">
              <span className="block text-zinc-500 text-xs font-sans font-bold uppercase tracking-wider mb-1">
                Current Title
              </span>
              <span className="block text-[17px] font-sans font-extrabold text-white">
                Level {newLevel} {getLevelTitle(newLevel)}
              </span>
              
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-medium text-zinc-400">
                <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Habit streak power multiplier active</span>
              </div>
            </div>

            {/* Dismiss check */}
            <button
              onClick={onClose}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-900 py-3.5 px-5 rounded-2xl font-bold tracking-wide transition shadow-xl active:scale-95 cursor-pointer"
            >
              KEEP FLOWING
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
