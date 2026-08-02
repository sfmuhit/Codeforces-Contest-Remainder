import React, { useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Target,
  RefreshCw,
  ExternalLink,
  Award,
  Sparkles,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Search,
} from 'lucide-react';
import { DailySolvedStats, SolvedProblemItem } from '../types';
import { getRankColorClass } from '../lib/codeforcesApi';

interface DailySolvedCardProps {
  stats: DailySolvedStats | null;
  isLoading: boolean;
  userHandle: string;
  onRefresh: () => void;
  onUpdateHandle: (handle: string) => void;
  onUpdateGoal: (newGoal: number) => void;
}

export const DailySolvedCard: React.FC<DailySolvedCardProps> = ({
  stats,
  isLoading,
  userHandle,
  onRefresh,
  onUpdateHandle,
  onUpdateGoal,
}) => {
  const [handleInput, setHandleInput] = useState('');
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const solvedCount = stats?.uniqueSolvedTodayCount || 0;
  const goal = stats?.dailyGoal || 3;
  const progressPercent = Math.min(100, Math.round((solvedCount / goal) * 100));

  const handleHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleInput.trim()) {
      onUpdateHandle(handleInput.trim());
      setIsEditingHandle(false);
      setHandleInput('');
    }
  };

  const formatSolvedTime = (seconds: number) => {
    try {
      const date = new Date(seconds * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden transition-all">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
                Problems Solved Today
              </h3>
              {solvedCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Active Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Live daily competitive programming tracker
            </p>
          </div>
        </div>

        {/* Handle Action / Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {userHandle ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingHandle(!isEditingHandle)}
                title="Change handle"
                className="px-2.5 py-1 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>@{userHandle}</span>
              </button>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh submissions from Codeforces"
                className="p-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingHandle(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Set CF Handle</span>
            </button>
          )}
        </div>
      </div>

      {/* Editing handle form drop-down */}
      {isEditingHandle && (
        <form onSubmit={handleHandleSubmit} className="mt-3 p-3 bg-slate-950/90 border border-blue-500/40 rounded-xl flex items-center gap-2">
          <input
            type="text"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            placeholder={`Current: ${userHandle || 'none'}. Enter new handle...`}
            className="flex-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shrink-0"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditingHandle(false)}
            className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Main Content Area */}
      {!userHandle ? (
        <div className="py-8 text-center space-y-3 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 mt-4 p-4">
          <Target className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="font-bold text-slate-300 text-sm">No Codeforces Handle Set</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter your Codeforces username above to track how many problems you solve each day automatically!
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Daily Progress & Metric Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 items-center">
            
            {/* Big Stat Count */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-emerald-400">{solvedCount}</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white flex items-center gap-1.5">
                  <span>{solvedCount} Solved</span>
                  {solvedCount >= goal && (
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-400">Unique problems solved today</p>
              </div>
            </div>

            {/* Daily Goal Bar */}
            <div className="space-y-1.5 md:col-span-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-blue-400" /> Daily Target:
                </span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-1 py-0.5">
                  <button
                    onClick={() => onUpdateGoal(Math.max(1, goal - 1))}
                    title="Decrease daily goal"
                    className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-emerald-400 font-bold px-1">{goal}</span>
                  <button
                    onClick={() => onUpdateGoal(goal + 1)}
                    title="Increase daily goal"
                    className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    solvedCount >= goal
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {progressPercent}% completed ({solvedCount}/{goal})
              </p>
            </div>

            {/* Sub Stats Badges */}
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 text-xs">
              <div className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300">
                <span className="text-slate-400">Total Submissions OK: </span>
                <span className="font-bold text-white">{stats?.totalOkTodayCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Solved Problems List */}
          {stats?.problemsSolvedToday && stats.problemsSolvedToday.length > 0 ? (
            <div className="space-y-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1"
              >
                <span>
                  Solved List ({stats.problemsSolvedToday.length} Problem
                  {stats.problemsSolvedToday.length > 1 ? 's' : ''})
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>{isExpanded ? 'Hide' : 'Show'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {stats.problemsSolvedToday.map((prob) => {
                    const ratingStyle = getRankColorClass(
                      prob.rating ? `rating-${prob.rating}` : undefined
                    );

                    return (
                      <div
                        key={prob.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2 transition-all hover:shadow-md"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded">
                              {prob.contestId ? `${prob.contestId}${prob.index}` : prob.index}
                            </span>
                            <span className="font-semibold text-xs text-white truncate">
                              {prob.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                            {prob.rating ? (
                              <span
                                className={`px-1.5 py-0.2 rounded font-bold text-[10px] bg-slate-900 border border-slate-800 ${
                                  prob.rating >= 1900
                                    ? 'text-purple-400'
                                    : prob.rating >= 1600
                                    ? 'text-blue-400'
                                    : prob.rating >= 1400
                                    ? 'text-cyan-400'
                                    : prob.rating >= 1200
                                    ? 'text-emerald-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                Rating: {prob.rating}
                              </span>
                            ) : null}

                            <span>Solved at {formatSolvedTime(prob.solvedAtSeconds)}</span>
                          </div>
                        </div>

                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open problem on Codeforces"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-dashed border-slate-800/80 rounded-xl p-4 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No problems solved on Codeforces yet today (since 00:00 local time).
              </p>
              <a
                href="https://codeforces.com/problemset"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                <span>Go to Codeforces Problemset</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
