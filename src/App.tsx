/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star, Quote, Info, BookOpen, Clock, Heart, RefreshCw } from 'lucide-react';
import XPHeader from './components/XPHeader';
import PomodoroTimer from './components/PomodoroTimer';
import HabitList, { getTodayStr, getYesterdayStr } from './components/HabitList';
import LevelUpModal from './components/LevelUpModal';
import { Habit, UserStats, HistoryEntry } from './types';
import WeeklyAnalytics from './components/WeeklyAnalytics';

const INITIAL_HABITS: Habit[] = [
  {
    id: 'setup-1',
    name: 'Meditate for 10 minutes',
    streak: 3,
    lastCompletedDate: getYesterdayStr(),
    createdAt: new Date().toISOString(),
    category: 'mind',
  },
  {
    id: 'setup-2',
    name: 'Read 15 pages of book',
    streak: 5,
    lastCompletedDate: getYesterdayStr(),
    createdAt: new Date().toISOString(),
    category: 'learn',
  },
  {
    id: 'setup-3',
    name: 'Hydrate (8 glasses of water)',
    streak: 0,
    lastCompletedDate: null,
    createdAt: new Date().toISOString(),
    category: 'health',
  }
];

const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  totalXpNeeded: 100,
  focusSessionsCompleted: 0,
  totalFocusTime: 0,
  habitsCompletedCount: 0,
};

const MOTIVATIONS = [
  "Focus is a quiet muscle. Flex it one 25-minute cycle at a time.",
  "Your future self is waiting for you to build these habits today.",
  "Routine isn't a cage; it is the launchpad of your creative freedom.",
  "Consistent mini-gains always defeat massive irregular bursts.",
  "When you feel like giving up, remember why you clicked the start button.",
  "Small daily blocks of focus build mountains over time.",
  "Power up your routine. A tiny emerald tick is a massive success."
];

export function getPastDates(daysCount = 7): string[] {
  const dates: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [username, setUsername] = useState('Zen Seeker');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(1);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<'workspace' | 'analytics'>('workspace');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [liveViewers, setLiveViewers] = useState<number>(1);

  useEffect(() => {
    const eventSource = new EventSource('/api/live-viewers');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.count === 'number') {
          setLiveViewers(Math.max(1, data.count));
        }
      } catch (err) {
        console.error('Failed to parse active viewers:', err);
      }
    };

    eventSource.onerror = () => {
      // Re-connect logic is handled natively by EventSource
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Load from local storage
  useEffect(() => {
    const storedHabits = localStorage.getItem('vibefocus_habits');
    if (storedHabits) {
      try {
        setHabits(JSON.parse(storedHabits));
      } catch (e) {
        setHabits(INITIAL_HABITS);
      }
    } else {
      setHabits(INITIAL_HABITS);
      localStorage.setItem('vibefocus_habits', JSON.stringify(INITIAL_HABITS));
    }

    const storedStats = localStorage.getItem('vibefocus_stats');
    if (storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch (e) {
        setStats(INITIAL_STATS);
      }
    } else {
      setStats(INITIAL_STATS);
      localStorage.setItem('vibefocus_stats', JSON.stringify(INITIAL_STATS));
    }

    const storedUser = localStorage.getItem('vibefocus_username');
    if (storedUser) {
      setUsername(storedUser);
    }

    // Load and synchronize 7-day tracking spectrum template
    const dates = getPastDates(7);
    const storedHistory = localStorage.getItem('vibefocus_history');
    let parsedHistory: HistoryEntry[] = [];
    if (storedHistory) {
      try {
        parsedHistory = JSON.parse(storedHistory);
      } catch (e) {
        parsedHistory = [];
      }
    }

    const useMock = !storedHistory || parsedHistory.length === 0;
    const finalHistory: HistoryEntry[] = dates.map((dateStr, idx) => {
      const existing = parsedHistory.find((h) => h.date === dateStr);
      if (existing) return existing;

      if (useMock) {
        // High-fidelity, beautifully full mock curves for visual excellence
        const mockFocus = [45, 25, 60, 15, 90, 50, 0];
        const mockHabits = [2, 1, 3, 1, 4, 2, 0];
        return {
          date: dateStr,
          focusMinutes: mockFocus[idx],
          habitsCompleted: mockHabits[idx],
        };
      } else {
        return {
          date: dateStr,
          focusMinutes: 0,
          habitsCompleted: 0,
        };
      }
    });

    setHistory(finalHistory);
    localStorage.setItem('vibefocus_history', JSON.stringify(finalHistory));

    // Set interactive random quote index
    setCurrentQuoteIndex(Math.floor(Math.random() * MOTIVATIONS.length));
  }, []);

  const handleUpdateUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem('vibefocus_username', name);
  };

  // Safe arithmetic for XP additions & leveling boundaries
  const addXp = (amount: number, currentStats: UserStats) => {
    let newXp = currentStats.xp + amount;
    let newLevel = currentStats.level;
    let didLevelUp = false;

    // Standard leveled limits
    while (newXp >= currentStats.totalXpNeeded) {
      newXp -= currentStats.totalXpNeeded;
      newLevel += 1;
      didLevelUp = true;
    }

    return {
      stats: {
        ...currentStats,
        level: newLevel,
        xp: newXp,
      },
      didLevelUp,
      newLevel,
    };
  };

  const handleFocusSessionComplete = (durationMinutes: number) => {
    const updatedStats = {
      ...stats,
      focusSessionsCompleted: stats.focusSessionsCompleted + 1,
      totalFocusTime: stats.totalFocusTime + durationMinutes,
    };

    const { stats: newStats, didLevelUp, newLevel } = addXp(25, updatedStats);
    setStats(newStats);
    localStorage.setItem('vibefocus_stats', JSON.stringify(newStats));

    // Register minutes spent focusing in history
    const todayStr = getTodayStr();
    setHistory((prev) => {
      const exists = prev.some((h) => h.date === todayStr);
      let updated: HistoryEntry[];
      if (exists) {
        updated = prev.map((h) =>
          h.date === todayStr ? { ...h, focusMinutes: h.focusMinutes + durationMinutes } : h
        );
      } else {
        updated = [...prev, { date: todayStr, focusMinutes: durationMinutes, habitsCompleted: 0 }];
      }
      localStorage.setItem('vibefocus_history', JSON.stringify(updated));
      return updated;
    });

    if (didLevelUp) {
      setNewLevelReached(newLevel);
      setIsModalOpen(true);
    }
  };

  const handleAddHabit = (name: string, category: Habit['category']) => {
    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      name,
      streak: 0,
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
      category,
    };

    const updated = [newHabit, ...habits];
    setHabits(updated);
    localStorage.setItem('vibefocus_habits', JSON.stringify(updated));
  };

  const handleToggleHabit = (id: string) => {
    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();
    let xpReward = 0;
    let countIncrement = 0;

    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const checked = habit.lastCompletedDate === todayStr;

        if (checked) {
          // Toggle off (Undo completion today)
          xpReward = -10;
          countIncrement = -1;
          
          return {
            ...habit,
            lastCompletedDate: null,
            streak: Math.max(0, habit.streak - 1),
          };
        } else {
          // Complete habit today
          xpReward = 10;
          countIncrement = 1;

          let newStreak = habit.streak;
          if (habit.lastCompletedDate === yesterdayStr) {
            newStreak = habit.streak + 1;
          } else if (habit.lastCompletedDate === todayStr) {
            // Already checked
          } else {
            newStreak = 1; // Restart/start streak
          }

          return {
            ...habit,
            lastCompletedDate: todayStr,
            streak: newStreak,
          };
        }
      }
      return habit;
    });

    setHabits(updatedHabits);
    localStorage.setItem('vibefocus_habits', JSON.stringify(updatedHabits));

    // Log habit completion changes within local storage history
    if (countIncrement !== 0) {
      setHistory((prev) => {
        const exists = prev.some((h) => h.date === todayStr);
        let updated: HistoryEntry[];
        if (exists) {
          updated = prev.map((h) =>
            h.date === todayStr ? { ...h, habitsCompleted: Math.max(0, h.habitsCompleted + countIncrement) } : h
          );
        } else {
          updated = [
            ...prev,
            {
              date: todayStr,
              focusMinutes: 0,
              habitsCompleted: countIncrement > 0 ? 1 : 0,
            },
          ];
        }
        localStorage.setItem('vibefocus_history', JSON.stringify(updated));
        return updated;
      });
    }

    if (xpReward !== 0) {
      if (xpReward > 0) {
        // Gain 10 XP
        const updatedStats = {
          ...stats,
          habitsCompletedCount: Math.max(0, stats.habitsCompletedCount + countIncrement),
        };
        const { stats: newStats, didLevelUp, newLevel } = addXp(xpReward, updatedStats);
        setStats(newStats);
        localStorage.setItem('vibefocus_stats', JSON.stringify(newStats));

        if (didLevelUp) {
          setNewLevelReached(newLevel);
          setIsModalOpen(true);
        }
      } else {
        // Revert 10 XP on uncheck
        let newXp = stats.xp + xpReward;
        let newLevel = stats.level;

        if (newXp < 0) {
          if (newLevel > 1) {
            newLevel -= 1;
            newXp = 100 + newXp; // Backward roll
          } else {
            newXp = 0;
          }
        }

        const newStats = {
          ...stats,
          level: newLevel,
          xp: newXp,
          habitsCompletedCount: Math.max(0, stats.habitsCompletedCount + countIncrement),
        };

        setStats(newStats);
        localStorage.setItem('vibefocus_stats', JSON.stringify(newStats));
      }
    }
  };

  const handleDeleteHabit = (id: string) => {
    // If the deleted habit was completed today, we don't strictly need to deduct, just remove it simply.
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    localStorage.setItem('vibefocus_habits', JSON.stringify(updated));
  };

  const handleResetHistory = () => {
    const dates = getPastDates(7);
    const resetHistory: HistoryEntry[] = dates.map((dateStr) => ({
      date: dateStr,
      focusMinutes: 0,
      habitsCompleted: 0,
    }));
    setHistory(resetHistory);
    localStorage.setItem('vibefocus_history', JSON.stringify(resetHistory));
  };

  const rotateQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONS.length);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col justify-between py-10 px-4 md:px-12 relative font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Dynamic ambient environment backdrop */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#0c0c0e] overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-500/3s rounded-full blur-[160px] opacity-20" />
      </div>

      <div className="max-w-6xl w-full mx-auto space-y-8 relative z-10">
        {/* Global Platform Topbar Header */}
        <div className="flex justify-between items-center bg-[#141416]/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xs font-black tracking-widest text-[#e2e8f0] font-mono">🎯 VIBEFOCUS</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">LIVE VIBE</span>
          </div>

          {/* Connected Seekers State Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/15 rounded-full text-[9px] font-mono font-black tracking-widest text-[#10B981] select-none hover:bg-emerald-500/10 transition-all duration-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
            </span>
            <span>{liveViewers} {liveViewers === 1 ? 'SEEKER ONLINE' : 'SEEKERS ONLINE'}</span>
          </div>
        </div>
        
        {/* Core Profile & XP level bar */}
        <XPHeader
          stats={stats}
          username={username}
          onUpdateUsername={handleUpdateUsername}
        />

        {/* TAB NAVIGATION MENU */}
        <div className="flex bg-[#1a1a1c] p-1.5 rounded-2xl border border-white/5 max-w-sm sm:max-w-md mx-auto relative z-20 shadow-md">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-black tracking-wider relative transition-all duration-300 uppercase cursor-pointer ${
              activeTab === 'workspace' ? 'text-[#e2e8f0]' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {activeTab === 'workspace' && (
              <motion.div
                layoutId="activeNavigationTab"
                className="absolute inset-0 bg-purple-500/10 border border-[#A855F7]/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Focus Workspace</span>
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-black tracking-wider relative transition-all duration-300 uppercase cursor-pointer ${
              activeTab === 'analytics' ? 'text-[#e2e8f0]' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {activeTab === 'analytics' && (
              <motion.div
                layoutId="activeNavigationTab"
                className="absolute inset-0 bg-purple-500/10 border border-[#A855F7]/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>📊</span>
              <span>Weekly Analytics</span>
            </span>
          </button>
        </div>

        {/* CORE INTERFACE SWITCHBOARD CONTAINER */}
        {activeTab === 'workspace' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Pomodoro Focus session */}
            <div className="lg:col-span-5 h-full">
              <PomodoroTimer
                onFocusSessionComplete={handleFocusSessionComplete}
              />
            </div>

            {/* Gamified Checklist */}
            <div className="lg:col-span-7 h-full">
              <HabitList
                habits={habits}
                onAddHabit={handleAddHabit}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            </div>

          </div>
        ) : (
          <WeeklyAnalytics 
            history={history} 
            onResetHistory={handleResetHistory} 
          />
        )}

        {/* Motivations & Small Tips banner footer wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#1a1a1c] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle accent light */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="md:col-span-8 flex items-start gap-4 min-w-0 relative z-10">
            <Quote className="w-5 h-5 text-[#A855F7] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black mb-1">
                Daily Focus Vibe
              </span>
              <p className="text-sm text-zinc-300 italic truncate font-sans">
                "{MOTIVATIONS[currentQuoteIndex]}"
              </p>
            </div>
          </div>
          
          <div className="md:col-span-4 flex justify-end gap-3 shrink-0 relative z-10 w-full md:w-auto">
            <button
              onClick={rotateQuote}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-white/5 rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
              title="Next motivation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Core Vibe</span>
            </button>
            <div className="px-4 py-2 bg-zinc-900 text-[11px] font-mono text-zinc-400 rounded-xl border border-white/5 select-none flex items-center gap-2 shadow-md">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>+25XP / +10XP</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer information bar */}
      <footer className="text-center text-xs text-zinc-600 select-none pt-12 font-mono relative z-10">
        VibeFocus &copy; {new Date().getFullYear()} &middot; Built for Zen Seekers
      </footer>

      {/* Pop up overlay for level-up transitions */}
      <LevelUpModal
        isOpen={isModalOpen}
        newLevel={newLevelReached}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
