import { motion } from 'motion/react';
import { UserStats } from '../types';
import { Award, Zap, Flame, Clock, Sparkles, Edit2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface XPHeaderProps {
  stats: UserStats;
  onUpdateUsername: (name: string) => void;
  username: string;
}

export default function XPHeader({ stats, onUpdateUsername, username }: XPHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(username);

  const getLevelTitle = (level: number) => {
    if (level === 1) return 'Focus Wizard';
    if (level === 2) return 'Routine Alchemist';
    if (level === 3) return 'Zen Master';
    if (level === 4) return 'Productivity Sage';
    if (level === 5) return 'Chronos Champion';
    if (level === 6) return 'Vibe Overlord';
    return 'Grandmaster of Flow';
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      onUpdateUsername(trimmed);
      setIsEditing(false);
    }
  };

  const percent = Math.min(100, Math.max(0, (stats.xp / stats.totalXpNeeded) * 100));

  return (
    <div className="bg-[#1a1a1c] rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
      {/* Absolute ambient lights */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left column: Avatar, Level, Username & Title */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto text-center sm:text-left">
          {/* Avatar frame */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 opacity-30 blur-sm group-hover:opacity-100 transition duration-500" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition duration-300" />
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-[#10B981] text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider border border-[#1a1a1c]">
              LV {stats.level}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Customizable Username */}
            <div className="flex items-center justify-center sm:justify-start gap-2 group mb-0.5">
              {isEditing ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={20}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans font-medium w-36"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-sans font-bold text-white tracking-tight">
                    {username}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-[#A855F7] transition focus:opacity-100"
                    title="Edit username"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Profile Title based on Level */}
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Award className="w-4 h-4 text-[#A855F7] shrink-0" />
              <span className="text-xs font-sans font-semibold text-zinc-400 uppercase tracking-widest">
                Level {stats.level} {getLevelTitle(stats.level)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle column: Experience Point (XP) Bar */}
        <div className="flex-grow max-w-md w-full lg:px-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5 px-0.5">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#A855F7]" />
              EXPERIENCE POINTS
            </span>
            <span className="font-bold text-[#A855F7]">
              {stats.xp} <span className="text-zinc-600">/</span> {stats.totalXpNeeded} XP
            </span>
          </div>

          {/* XP Track Frame with soft outer glow */}
          <div className="relative h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#A855F7] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 text-right italic">
            Next Unlock: {stats.level === 1 ? 'Routine Alchemist Powers' : 'Zen Aura Upgrade'}
          </div>
        </div>

        {/* Right column: Life Stats Overview Grid */}
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
          <div className="bg-zinc-900/40 p-2.5 rounded-2xl border border-white/5 text-center min-w-[76px]">
            <div className="flex justify-center mb-0.5 text-[#A855F7]">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono text-zinc-300 font-bold">
              {stats.totalFocusTime}m
            </div>
            <div className="text-[10px] font-sans text-zinc-500 tracking-wider uppercase select-none">
              Focused
            </div>
          </div>

          <div className="bg-zinc-900/40 p-2.5 rounded-2xl border border-white/5 text-center min-w-[76px]">
            <div className="flex justify-center mb-0.5 text-[#10B981]">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono text-zinc-300 font-bold">
              {stats.focusSessionsCompleted}
            </div>
            <div className="text-[10px] font-sans text-zinc-500 tracking-wider uppercase select-none">
              Sessions
            </div>
          </div>

          <div className="bg-zinc-900/40 p-2.5 rounded-2xl border border-white/5 text-center min-w-[76px]">
            <div className="flex justify-center mb-0.5 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono text-zinc-300 font-bold">
              {stats.habitsCompletedCount}
            </div>
            <div className="text-[10px] font-sans text-zinc-500 tracking-wider uppercase select-none">
              Completed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
