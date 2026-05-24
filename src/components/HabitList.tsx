import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Flame, Sparkles, BookOpen, Heart, Briefcase, Eye, Laptop } from 'lucide-react';
import { Habit } from '../types';
import { playClickSound } from '../utils/audio';
import Confetti from './Confetti';

interface HabitListProps {
  habits: Habit[];
  onAddHabit: (name: string, category: Habit['category']) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

const CATEGORY_DETAILS: Record<Habit['category'], { label: string; icon: any; colorClass: string; activeColor: string }> = {
  learn: { label: 'Learn', icon: BookOpen, colorClass: 'text-purple-400 border-purple-500/20 bg-purple-500/5', activeColor: 'bg-purple-600 text-white border-purple-500' },
  health: { label: 'Health', icon: Heart, colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', activeColor: 'bg-emerald-600 text-white border-emerald-500' },
  work: { label: 'Work', icon: Briefcase, colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5', activeColor: 'bg-cyan-600 text-white border-cyan-500' },
  mind: { label: 'Mind', icon: Eye, colorClass: 'text-pink-400 border-pink-500/20 bg-pink-500/5', activeColor: 'bg-pink-600 text-white border-pink-500' },
  routine: { label: 'Routine', icon: Laptop, colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5', activeColor: 'bg-amber-600 text-white border-amber-500' },
};

export function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HabitList({ habits, onAddHabit, onToggleHabit, onDeleteHabit }: HabitListProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Habit['category']>('learn');
  const [confettiTrigger, setConfettiTrigger] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newHabitName.trim();
    if (!name) return;
    playClickSound();
    onAddHabit(name, selectedCategory);
    setNewHabitName('');
  };

  const handleToggle = (habit: Habit, e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    const isNowCompleted = habit.lastCompletedDate !== getTodayStr();
    
    // If checking it off, trigger confetti explosion at the clicked element location coordinates!
    if (isNowCompleted) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
      
      if (rect && parentRect) {
        // Calculate relative coordinates in percentage points
        const clickX = ((rect.left + rect.width / 2 - parentRect.left) / parentRect.width) * 100;
        const clickY = ((rect.top + rect.height / 2 - parentRect.top) / parentRect.height) * 100;
        
        setConfettiTrigger({
          id: habit.id + '-' + Date.now(),
          x: clickX,
          y: clickY,
        });
      } else {
        setConfettiTrigger({ id: habit.id + '-' + Date.now(), x: 15, y: 50 });
      }
    }
    
    onToggleHabit(habit.id);
  };

  const isCompletedToday = (habit: Habit) => {
    return habit.lastCompletedDate === getTodayStr();
  };

  const isStreakActive = (habit: Habit) => {
    if (!habit.lastCompletedDate) return false;
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    return habit.lastCompletedDate === today || habit.lastCompletedDate === yesterday;
  };

  return (
    <div className="bg-[#1a1a1c] rounded-3xl border border-white/5 p-6 flex flex-col h-full shadow-2xl justify-between relative overflow-hidden min-h-[500px]">
      
      {/* Confetti container portal mapped inside relative cards */}
      {confettiTrigger && (
        <Confetti
          triggerId={confettiTrigger.id}
          originX={confettiTrigger.x}
          originY={confettiTrigger.y}
        />
      )}

      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
            Daily Habits
          </h2>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-white/5 px-2.5 py-0.5 rounded-full select-none">
            {habits.length} total
          </span>
        </div>

        {/* Dynamic Habit Creation Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 relative z-10">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new habit..."
              maxLength={40}
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="flex-grow bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#A855F7]/50 focus:ring-1 focus:ring-[#A855F7]/20 text-zinc-200 placeholder-zinc-500 font-sans"
            />
            <button
              type="submit"
              disabled={!newHabitName.trim()}
              className="w-12 h-12 bg-[#A855F7] rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Add habit"
            >
              <Plus className="w-5 h-5 stroke-2" />
            </button>
          </div>

          {/* Quick Category Rail selection */}
          <div className="flex flex-wrap gap-1.5 pt-1 items-center">
            <span className="text-[10px] font-sans font-bold text-zinc-500 tracking-wider uppercase mr-1 select-none">
              Category:
            </span>
            {Object.entries(CATEGORY_DETAILS).map(([key, value]) => {
              const active = selectedCategory === key;
              const Icon = value.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedCategory(key as Habit['category']);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold border transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-zinc-800 text-white border-[#A855F7]/60 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                      : 'border-white/5 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{value.label}</span>
                </button>
              );
            })}
          </div>
        </form>

        {/* Habit Checklist Stream */}
        <div className="space-y-3 max-h-[285px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {habits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/20 rounded-2xl p-4 border border-dashed border-white/5"
              >
                <Sparkles className="w-8 h-8 text-[#A855F7]/30 mb-2 animate-bounce" />
                <p className="text-sm text-zinc-400 font-sans font-medium">No habits initialized</p>
                <p className="text-xs text-zinc-500 font-sans mt-0.5">Use the prompt bar above to start routines</p>
              </motion.div>
            ) : (
              habits.map((habit) => {
                const checked = isCompletedToday(habit);
                const activeStreak = isStreakActive(habit);
                const CatInfo = CATEGORY_DETAILS[habit.category];
                const CatIcon = CatInfo.icon;

                return (
                  <motion.div
                    key={habit.id}
                    layoutId={`habit-card-${habit.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      checked
                        ? 'bg-[#10B981]/5 border-[#10B981]/20 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]'
                        : 'bg-zinc-900/40 border-white/5 hover:border-[#A855F7]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      {/* Checkbox button */}
                      <button
                        onClick={(e) => handleToggle(habit, e)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-350 transform active:scale-90 cursor-pointer ${
                          checked
                            ? 'bg-[#10B981] text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'border-2 border-zinc-700 hover:border-[#A855F7] bg-transparent text-transparent hover:scale-105'
                        }`}
                        title={checked ? 'Mark uncomplete' : 'Complete habit'}
                      >
                        <motion.svg
                          className="w-3.5 h-3.5 stroke-current stroke-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          initial={false}
                          animate={checked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                          style={{ stroke: checked ? '#06060c' : undefined }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </motion.svg>
                      </button>

                      {/* Content block */}
                      <div className="min-w-0">
                        <span
                          className={`block text-sm font-semibold truncate transition-all duration-300 ${
                            checked 
                              ? 'text-[#10B981] line-through opacity-80' 
                              : 'text-zinc-200 font-medium'
                          }`}
                        >
                          {habit.name}
                        </span>
                        
                        {/* Tags list */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5`}>
                            <CatIcon className="w-2.5 h-2.5" />
                            {CatInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right features: Streaks and Deletion and Hover dynamics */}
                    <div className="flex items-center gap-3">
                      {/* Streak flame count */}
                      <div 
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-sans text-xs font-bold leading-none ${
                          checked 
                            ? 'bg-[#10B981]/20 text-[#10B981]' 
                            : activeStreak 
                            ? 'bg-orange-500/10 text-orange-400' 
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                        title={activeStreak ? "Streak is burning hot!" : "Cold streak, ignite it!"}
                      >
                        <Flame className={`w-3.5 h-3.5 ${activeStreak ? 'text-orange-500' : 'text-zinc-650'}`} />
                        <span>{habit.streak} days</span>
                      </div>

                      {/* Trash action visible on hover */}
                      <button
                        onClick={() => {
                          playClickSound();
                          onDeleteHabit(habit.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all focus:opacity-100 cursor-pointer"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
