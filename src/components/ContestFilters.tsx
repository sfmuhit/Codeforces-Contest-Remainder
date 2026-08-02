import React from 'react';
import { Search, Filter, Bell, Clock, CheckCircle2, Flame, X } from 'lucide-react';
import { StatusFilter, DivisionFilter } from '../types';

interface ContestFiltersProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  divisionFilter: DivisionFilter;
  onDivisionChange: (div: DivisionFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    upcoming: number;
    reminders: number;
    active: number;
    finished: number;
  };
}

export const ContestFilters: React.FC<ContestFiltersProps> = ({
  statusFilter,
  onStatusChange,
  divisionFilter,
  onDivisionChange,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const divisions: { label: string; value: DivisionFilter }[] = [
    { label: 'All Divs', value: 'ALL' },
    { label: 'Div. 1', value: 'DIV1' },
    { label: 'Div. 2', value: 'DIV2' },
    { label: 'Div. 3', value: 'DIV3' },
    { label: 'Div. 4', value: 'DIV4' },
    { label: 'Educational', value: 'EDUCATIONAL' },
    { label: 'Global', value: 'GLOBAL' },
    { label: 'Other', value: 'OTHER' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Main Status Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => onStatusChange('UPCOMING')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              statusFilter === 'UPCOMING'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Upcoming</span>
            <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
              statusFilter === 'UPCOMING' ? 'bg-blue-950 text-blue-200' : 'bg-slate-800 text-slate-300'
            }`}>
              {counts.upcoming}
            </span>
          </button>

          <button
            onClick={() => onStatusChange('REMINDERS')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              statusFilter === 'REMINDERS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>My Reminders</span>
            <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
              statusFilter === 'REMINDERS' ? 'bg-blue-950 text-blue-200' : 'bg-slate-800 text-slate-300'
            }`}>
              {counts.reminders}
            </span>
          </button>

          <button
            onClick={() => onStatusChange('ACTIVE')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className={`w-4 h-4 ${counts.active > 0 ? 'text-emerald-300 animate-bounce' : ''}`} />
            <span>Active Now</span>
            {counts.active > 0 && (
              <span className="px-2 py-0.2 text-[10px] font-bold bg-emerald-950 text-emerald-200 rounded-full animate-pulse">
                {counts.active}
              </span>
            )}
          </button>

          <button
            onClick={() => onStatusChange('FINISHED')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              statusFilter === 'FINISHED'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finished</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contest (e.g. Div 2, Educational)..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Division Chips Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5 text-blue-400" /> Division:
        </span>
        {divisions.map((div) => (
          <button
            key={div.value}
            onClick={() => onDivisionChange(div.value)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
              divisionFilter === div.value
                ? 'bg-blue-950/80 text-blue-200 border border-blue-700/60 font-semibold shadow-sm'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {div.label}
          </button>
        ))}
      </div>
    </div>
  );
};
