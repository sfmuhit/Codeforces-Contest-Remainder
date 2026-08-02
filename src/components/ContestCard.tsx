import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  Share2,
  Check,
  Sparkles,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { CodeforcesContest, ContestReminder, AppSettings } from '../types';
import { parseDivision } from '../lib/codeforcesApi';
import { formatEpochToDateTime, formatTimeRemaining, formatDuration } from '../lib/timeUtils';
import { getGoogleCalendarUrl, downloadICalFile } from '../lib/calendarService';

interface ContestCardProps {
  contest: CodeforcesContest;
  reminder: ContestReminder | undefined;
  settings: AppSettings;
  onToggleReminder: (contest: CodeforcesContest, leadMinutes?: number) => void;
  onAddToast: (msg: string) => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({
  contest,
  reminder,
  settings,
  onToggleReminder,
  onAddToast,
}) => {
  const [nowSeconds, setNowSeconds] = useState<number>(Math.floor(Date.now() / 1000));
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live ticker for countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const division = parseDivision(contest.name);
  const isUpcoming = contest.phase === 'BEFORE';
  const isActive = contest.phase === 'CODING';
  const isFinished = contest.phase === 'FINISHED';

  // Calculate live time remaining
  const startTimeSeconds = contest.startTimeSeconds || 0;
  const endTimeSeconds = startTimeSeconds + contest.durationSeconds;

  const secondsUntilStart = startTimeSeconds - nowSeconds;
  const secondsUntilEnd = endTimeSeconds - nowSeconds;

  const { dateStr, timeStr, relativeDay } = formatEpochToDateTime(startTimeSeconds, settings.selectedTimezone);

  // Lead options for reminder
  const leadOptions = [
    { label: '5 minutes before', value: 5 },
    { label: '10 minutes before', value: 10 },
    { label: '20 minutes before (Default)', value: 20 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
  ];

  const handleCopyLink = () => {
    const url = `https://codeforces.com/contest/${contest.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    onAddToast('Copied contest link to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Division Styling
  const getDivisionBadge = () => {
    switch (division) {
      case 'DIV1':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-red-950/60 text-red-400 border border-red-800/50">Div. 1</span>;
      case 'DIV2':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-950/60 text-blue-400 border border-blue-800/50">Div. 2</span>;
      case 'DIV3':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">Div. 3</span>;
      case 'DIV4':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">Div. 4</span>;
      case 'EDUCATIONAL':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/50">Educational</span>;
      case 'GLOBAL':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50">Global</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">Codeforces</span>;
    }
  };

  return (
    <div
      className={`group relative bg-slate-900/90 hover:bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md hover:shadow-xl ${
        isActive
          ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900'
          : reminder
          ? 'border-blue-500/50 bg-slate-900/95'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Meta Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {getDivisionBadge()}
          {relativeDay && (
            <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {relativeDay}
            </span>
          )}
          {reminder && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Reminder Set ({reminder.leadTimeMinutes}m before)
            </span>
          )}
        </div>

        {/* Phase Pill */}
        <div>
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              CODING NOW
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full">
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-slate-800 text-slate-400 rounded-full">
              Finished
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
        <a
          href={`https://codeforces.com/contest/${contest.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline flex items-center gap-1.5"
        >
          {contest.name}
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 shrink-0" />
        </a>
      </h3>

      {/* Date, Time & Duration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs sm:text-sm text-slate-300 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">{dateStr}</span>
            <span className="text-slate-400 ml-1">@ {timeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-slate-400">Duration:</span>
            <span className="font-medium text-white ml-1">{formatDuration(contest.durationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Live Timer Section */}
      {isUpcoming && secondsUntilStart > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-blue-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Starts in:</span>
          </div>
          <div className="font-mono font-bold text-sm sm:text-base text-blue-200 bg-slate-950/80 px-3 py-1 rounded-lg border border-blue-800/40">
            {formatTimeRemaining(secondsUntilStart).formatted}
          </div>
        </div>
      )}

      {isActive && secondsUntilEnd > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-emerald-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Time Remaining:</span>
          </div>
          <div className="font-mono font-bold text-sm sm:text-base text-emerald-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-emerald-800/40">
            {formatTimeRemaining(secondsUntilEnd).formatted}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Reminder Toggle */}
        {isUpcoming ? (
          <div className="relative">
            <div className="flex items-center">
              <button
                onClick={() => onToggleReminder(contest, settings.defaultLeadMinutes)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-l-xl transition-all flex items-center gap-2 border shadow-sm ${
                  reminder
                    ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {reminder ? (
                  <>
                    <BellRing className="w-4 h-4 text-emerald-300" />
                    <span>20-Min Reminder ON</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span>Set 20-Min Reminder</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowLeadDropdown(!showLeadDropdown)}
                title="Change notification lead time"
                className={`px-2 py-2 text-xs rounded-r-xl border-t border-b border-r transition-colors ${
                  reminder
                    ? 'bg-blue-700 text-white border-blue-500 hover:bg-blue-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Lead Time Dropdown */}
            {showLeadDropdown && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-20">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Notify Me Before Start
                </div>
                {leadOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onToggleReminder(contest, opt.value);
                      setShowLeadDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      reminder?.leadTimeMinutes === opt.value
                        ? 'bg-blue-900/60 text-blue-200 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {reminder?.leadTimeMinutes === opt.value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <a
            href={`https://codeforces.com/contest/${contest.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>Open Contest Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Right: Calendar Export & Share */}
        <div className="flex items-center gap-1.5">
          {isUpcoming && (
            <>
              {/* Google Calendar Link */}
              <a
                href={getGoogleCalendarUrl(contest)}
                target="_blank"
                rel="noopener noreferrer"
                title="Add to Google Calendar"
                className="p-2 text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">GCal</span>
              </a>

              {/* Download .ics */}
              <button
                onClick={() => {
                  downloadICalFile(contest);
                  onAddToast('Downloaded .ics calendar reminder file');
                }}
                title="Download iCal file (.ics) for Apple/Outlook/Mobile Calendar"
                className="p-2 text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">.ics</span>
              </button>
            </>
          )}

          {/* Share / Copy Link */}
          <button
            onClick={handleCopyLink}
            title="Copy link to contest"
            className="p-2 text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
