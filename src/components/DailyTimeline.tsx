import React from 'react';
import { Calendar, AlertCircle, ArrowRight, Bell, Sparkles } from 'lucide-react';
import { CodeforcesContest, ContestReminder, AppSettings } from '../types';
import { formatEpochToDateTime, formatDuration } from '../lib/timeUtils';

interface DailyTimelineProps {
  contests: CodeforcesContest[];
  reminders: ContestReminder[];
  settings: AppSettings;
  onToggleReminder: (contest: CodeforcesContest) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  contests,
  reminders,
  settings,
  onToggleReminder,
}) => {
  // Find upcoming contests scheduled for TODAY
  const todayContests = contests.filter((c) => {
    if (!c.startTimeSeconds || c.phase === 'FINISHED') return false;
    const { relativeDay } = formatEpochToDateTime(c.startTimeSeconds, settings.selectedTimezone);
    return relativeDay === 'TODAY';
  });

  if (todayContests.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-amber-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300">
            <AlertCircle className="w-5 h-5" />
          </span>
          <h3 className="font-bold text-sm sm:text-base text-amber-100 tracking-wide">
            🔥 Codeforces Contest Scheduled TODAY!
          </h3>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full animate-pulse">
          {todayContests.length} Contest{todayContests.length > 1 ? 's' : ''} Today
        </span>
      </div>

      <div className="space-y-3">
        {todayContests.map((c) => {
          const reminderSet = reminders.some((r) => r.contestId === c.id);
          const { timeStr } = formatEpochToDateTime(c.startTimeSeconds!, settings.selectedTimezone);

          return (
            <div
              key={c.id}
              className="bg-slate-950/70 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">{c.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Start: {timeStr}
                  </span>
                  <span>Duration: {formatDuration(c.durationSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleReminder(c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    reminderSet
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-700/50'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{reminderSet ? '20-Min Reminder Active' : 'Set 20-Min Alert'}</span>
                </button>
                <a
                  href={`https://codeforces.com/contest/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
