import React from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart, 
  Line 
} from 'recharts';
import { Clock, CheckSquare, Calendar, Award, Zap, ChevronRight, BarChart2, TrendingUp, RotateCcw, Trash2 } from 'lucide-react';
import { HistoryEntry } from '../types';

interface WeeklyAnalyticsProps {
  history: HistoryEntry[];
  onResetHistory: () => void;
}

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getWeekdayLabel = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return weekdayNames[dateObj.getDay()];
};

// Formatter to read "YYYY-MM-DD" inside chart labels
const formatDateLabel = (dateStr: string) => {
  const [, month, day] = dateStr.split('-');
  const weekday = getWeekdayLabel(dateStr);
  return `${weekday} (${month}/${day})`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/95 border border-white/10 backdrop-blur-md p-3 px-4 rounded-xl shadow-2xl text-xs font-sans">
        <p className="text-zinc-400 font-bold mb-1.5">{label}</p>
        <p className="font-mono text-white flex items-center gap-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: payload[0].color || payload[0].fill }} 
          />
          {payload[0].name}: <span className="font-bold text-zinc-100">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyAnalytics({ history, onResetHistory }: WeeklyAnalyticsProps) {
  const [confirmReset, setConfirmReset] = React.useState(false);

  React.useEffect(() => {
    if (confirmReset) {
      const timer = setTimeout(() => {
        setConfirmReset(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmReset]);

  // Sort history by date to ensure chronological charts
  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));

  // Map history to chart formats
  const chartData = sortedHistory.map((entry) => ({
    ...entry,
    formattedDate: formatDateLabel(entry.date),
    weekday: getWeekdayLabel(entry.date),
  }));

  // Standard aggregates for visual excellence
  const totalFocus = history.reduce((sum, entry) => sum + entry.focusMinutes, 0);
  const totalHabits = history.reduce((sum, entry) => sum + entry.habitsCompleted, 0);
  const avgFocus = history.length > 0 ? Math.round(totalFocus / history.length) : 0;
  const activeFocusDays = history.filter((entry) => entry.focusMinutes > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header section with Reset */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#1a1a1c] border border-white/5 p-5 px-6 rounded-3xl relative overflow-hidden">
        {/* Subtle accent light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            Performance Insights
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Real-time track of your daily focus rhythm and habit completion rates.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          {confirmReset ? (
            <button
              onClick={() => {
                onResetHistory();
                setConfirmReset(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Confirm Reset?</span>
            </button>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-white/5 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
              title="Reset weekly analytics data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Analytics</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Focus widget */}
        <div className="bg-[#1a1a1c] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition duration-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#A855F7]">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Total Focus
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-sans font-black text-white">
            {totalFocus} <span className="text-xs text-zinc-500 font-normal">mins</span>
          </div>
        </div>

        {/* Weekly Avg focus widget */}
        <div className="bg-[#1a1a1c] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition duration-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Daily Avg
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-sans font-black text-white">
            {avgFocus} <span className="text-xs text-zinc-500 font-normal">m / day</span>
          </div>
        </div>

        {/* Total Habits widget */}
        <div className="bg-[#1a1a1c] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#10B981]">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Habits Checked
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-sans font-black text-white">
            {totalHabits} <span className="text-xs text-zinc-500 font-normal">done</span>
          </div>
        </div>

        {/* Active Days widget */}
        <div className="bg-[#1a1a1c] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition duration-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Active Days
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-sans font-black text-white">
            {activeFocusDays} <span className="text-xs text-zinc-500 font-normal">/ 7 days</span>
          </div>
        </div>
      </div>

      {/* Responsive Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART A: Focus minutes (Bar Chart) */}
        <div className="bg-[#1a1a1c] border border-white/5 p-6 sm:p-8 rounded-[32px] shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                Daily Focus Minutes
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 border border-white/5 bg-zinc-900 px-2 py-0.5 rounded-full">
                7-Day Spectrum
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#71717a" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
                  <Bar 
                    dataKey="focusMinutes" 
                    name="Focus Minutes" 
                    fill="#A855F7" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 mt-4 italic flex items-center gap-1.5 select-none border-t border-white/5 pt-4">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Highest focus spike: {Math.max(...history.map(d => d.focusMinutes), 0)}m</span>
          </div>
        </div>

        {/* CHART B: Habits Completed (Line Chart) */}
        <div className="bg-[#1a1a1c] border border-white/5 p-6 sm:p-8 rounded-[32px] shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Habits Completed
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 border border-white/5 bg-zinc-900 px-2 py-0.5 rounded-full">
                7-Day Output
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#71717a" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="habitsCompleted" 
                    name="Habits Completed" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 mt-4 italic flex items-center gap-1.5 select-none border-t border-white/5 pt-4">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target completion streak is ticking upward daily!</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
