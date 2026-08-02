import React, { useState } from 'react';
import { User, Search, Award, TrendingUp, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { CodeforcesUser } from '../types';
import { fetchUserInfo, getRankColorClass } from '../lib/codeforcesApi';

interface UserHandleCardProps {
  userInfo: CodeforcesUser | null;
  dailySolvedCount?: number;
  onUpdateUserHandle: (handle: string, info: CodeforcesUser | null) => void;
  onClose?: () => void;
  onAddToast: (msg: string) => void;
}

export const UserHandleCard: React.FC<UserHandleCardProps> = ({
  userInfo,
  dailySolvedCount,
  onUpdateUserHandle,
  onClose,
  onAddToast,
}) => {
  const [handleInput, setHandleInput] = useState(userInfo?.handle || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!handleInput.trim()) return;

    setLoading(true);
    setError(null);

    const user = await fetchUserInfo(handleInput.trim());
    setLoading(false);

    if (user) {
      onUpdateUserHandle(user.handle, user);
      onAddToast(`Loaded Codeforces profile for ${user.handle}`);
      if (onClose) onClose();
    } else {
      setError(`Codeforces handle "${handleInput}" not found.`);
    }
  };

  const rankStyle = getRankColorClass(userInfo?.rank);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-white">Codeforces Profile Tracker</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Handle Search Form */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            placeholder="Enter CF handle (e.g. tourist, Benq)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center gap-1"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Fetch'}
        </button>
      </form>

      {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}

      {/* User Info Display */}
      {userInfo ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={userInfo.avatar || 'https://codeforces.org/s/0/favicon.png'}
            alt={userInfo.handle}
            className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover shadow-md shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://codeforces.org/s/0/favicon.png';
            }}
          />

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className={`text-base font-bold ${rankStyle.text}`}>
                {userInfo.handle}
              </h4>
              <span className={`px-2.5 py-0.5 text-xs rounded-full uppercase tracking-wider ${rankStyle.bg} ${rankStyle.text} border ${rankStyle.border}`}>
                {userInfo.rank || 'Unrated'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {userInfo.organization || userInfo.country || 'Codeforces Competitive Programmer'}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Rating:</span>
                <span className={`font-bold ${rankStyle.text}`}>{userInfo.rating || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Max:</span>
                <span className="font-bold text-slate-200">{userInfo.maxRating || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Today:</span>
                <span className="font-bold text-emerald-400">{dailySolvedCount ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <p>Search your Codeforces handle to view your rating & rank status.</p>
        </div>
      )}
    </div>
  );
};
