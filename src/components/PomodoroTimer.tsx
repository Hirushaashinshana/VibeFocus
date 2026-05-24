import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Flame, Check, Bell, Plus, Minus } from 'lucide-react';
import { TimerMode, TimerPreset } from '../types';
import { playChimeSuccess, playClickSound } from '../utils/audio';

interface PomodoroTimerProps {
  onFocusSessionComplete: (durationMinutes: number) => void;
}

const PRESETS: TimerPreset[] = [
  { id: 'focus', label: 'Focus', duration: 25 },
  { id: 'shortBreak', label: 'Short Break', duration: 5 },
  { id: 'longBreak', label: 'Long Break', duration: 15 },
];

export default function PomodoroTimer({ onFocusSessionComplete }: PomodoroTimerProps) {
  const [activeMode, setActiveMode] = useState<TimerMode>('focus');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customDurations, setCustomDurations] = useState<Record<TimerMode, number>>({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep track of maximum duration for percentage calculate
  const [initialTotalSeconds, setInitialTotalSeconds] = useState(25 * 60);

  // Sync state with selected preset, tracking custom adjustments
  useEffect(() => {
    const defaultMins = customDurations[activeMode];
    setMinutes(defaultMins);
    setSeconds(0);
    setInitialTotalSeconds(defaultMins * 60);
    setIsRunning(false);
  }, [activeMode, customDurations]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSec) => {
          if (prevSec > 0) {
            return prevSec - 1;
          } else {
            // Need to decrement minute
            setMinutes((prevMin) => {
              if (prevMin > 0) {
                return prevMin - 1;
              } else {
                // Timer reached 0:00! Completion logic
                handleTimerFinished();
                return 0;
              }
            });
            return 59;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleTimerFinished = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    playChimeSuccess();
    
    const completedDuration = customDurations[activeMode];
    
    // Reset timer back to selection
    setMinutes(completedDuration);
    setSeconds(0);

    // Only award XP and session updates on 'focus' modes
    if (activeMode === 'focus') {
      onFocusSessionComplete(completedDuration);
    } else {
      // Small alert for breaks
      if (Notification.permission === 'granted') {
        new Notification("Break finished!", { body: "Time to get back to VibeFocus!" });
      } else {
        alert(`${activeMode === 'shortBreak' ? 'Short Break' : 'Long Break'} has completed!`);
      }
    }
  };

  const handleStartPause = () => {
    playClickSound();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playClickSound();
    setIsRunning(false);
    setMinutes(customDurations[activeMode]);
    setSeconds(0);
    setInitialTotalSeconds(customDurations[activeMode] * 60);
  };

  // Adjust duration manually
  const adjustDuration = (amount: number) => {
    playClickSound();
    const currentMins = customDurations[activeMode];
    const newMins = Math.max(1, Math.min(120, currentMins + amount));
    
    setCustomDurations((prev) => ({
      ...prev,
      [activeMode]: newMins,
    }));
  };

  // SVG ring details
  const totalSeconds = minutes * 60 + seconds;
  const progressRatio = initialTotalSeconds > 0 ? totalSeconds / initialTotalSeconds : 0;
  
  const radius = 110;
  const circumference = 2 * Math.PI * radius; // Approx 691.15
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Mode based layout decorations
  const getThemeColor = () => {
    if (activeMode === 'focus') return 'text-[#A855F7]';
    if (activeMode === 'shortBreak') return 'text-[#10B981]';
    return 'text-cyan-400';
  };

  const getStrokeColorClass = () => {
    if (activeMode === 'focus') return 'text-[#A855F7] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]';
    if (activeMode === 'shortBreak') return 'text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]';
  };

  const getButtonBgClass = () => {
    if (activeMode === 'focus') return 'bg-white text-black hover:bg-zinc-100';
    if (activeMode === 'shortBreak') return 'bg-[#10B981] text-zinc-950 hover:bg-emerald-400';
    return 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400';
  };

  return (
    <div className="bg-[#1a1a1c] rounded-[40px] border border-white/5 p-10 flex flex-col justify-between h-full shadow-2xl relative min-h-[500px]">
      
      {/* Glowing background halo reflecting the active state */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#A855F7] rounded-full blur-[120px]"></div>
      </div>

      {/* Preset tabs */}
      <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl gap-1 relative z-10 border border-white/5 w-full max-w-md mx-auto">
        {PRESETS.map((preset) => {
          const isSelected = activeMode === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                playClickSound();
                setActiveMode(preset.id);
              }}
              className={`flex-1 text-sm font-semibold tracking-wide py-2.5 rounded-xl transition-all duration-300 relative ${
                isSelected 
                  ? 'text-white font-bold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeTabOutline"
                  className={`absolute inset-0 rounded-xl ${
                    preset.id === 'focus' 
                      ? 'bg-[#A855F7] shadow-lg shadow-purple-900/20' 
                      : preset.id === 'shortBreak'
                      ? 'bg-emerald-600 shadow-lg shadow-emerald-900/10'
                      : 'bg-cyan-600 shadow-lg shadow-cyan-900/10'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Center Circle SVG Timer */}
      <div className="flex flex-col items-center justify-center my-6 relative z-10">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          
          {/* Circular Countdown Tracker */}
          <svg className="absolute w-full h-full transform -rotate-90">
            {/* Background circle outline */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="stroke-zinc-800 fill-transparent"
              strokeWidth="8"
            />
            {/* Countdown animated progress ring */}
            <motion.circle
              cx="50%"
              cy="50%"
              r={radius}
              className={`fill-transparent ${getStrokeColorClass()}`}
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ ease: 'linear' }}
            />
          </svg>

          {/* Time digits & context */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-sans font-bold tracking-tighter text-white font-mono">
              {formattedTime}
            </span>
            <span className="text-zinc-500 text-xs font-semibold tracking-widest uppercase mt-3 select-none">
              {activeMode === 'focus' ? 'Stay Sharp' : 'Mind Rest'}
            </span>
          </div>
        </div>

        {/* Small Adjust Time Option */}
        <div className="flex items-center gap-4 mt-6 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-2xl shadow-inner shadow-black/40">
          <button
            onClick={() => adjustDuration(-1)}
            disabled={customDurations[activeMode] <= 1}
            className="p-1 text-zinc-500 hover:text-white transition disabled:opacity-20 cursor-pointer"
            title="Remove 1 minute"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-zinc-400 select-none font-semibold">
            {customDurations[activeMode]} min preset
          </span>
          <button
            onClick={() => adjustDuration(1)}
            disabled={customDurations[activeMode] >= 120}
            className="p-1 text-zinc-500 hover:text-white transition disabled:opacity-20 cursor-pointer"
            title="Add 1 minute"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 w-full max-w-sm mx-auto relative z-10">
        <button
          onClick={handleStartPause}
          className={`flex-1 h-14 rounded-2xl font-bold text-lg select-none hover:scale-[1.02] transform transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${getButtonBgClass()}`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>START</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
