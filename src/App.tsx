import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CodeforcesContest,
  ContestReminder,
  AppSettings,
  CodeforcesUser,
  DailySolvedStats,
  StatusFilter,
  DivisionFilter,
} from './types';
import {
  fetchContests,
  fetchUserInfo,
  fetchUserSubmissions,
  calculateDailySolvedStats,
  parseDivision,
} from './lib/codeforcesApi';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  triggerSystemNotification,
} from './lib/notificationService';

// Components
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { ContestCard } from './components/ContestCard';
import { ContestFilters } from './components/ContestFilters';
import { DailyTimeline } from './components/DailyTimeline';
import { DailySolvedCard } from './components/DailySolvedCard';
import { UserHandleCard } from './components/UserHandleCard';
import { NotificationSetupGuideModal } from './components/NotificationSetupGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';

// Icons
import {
  Bell,
  RefreshCw,
  Trophy,
  Zap,
  Calendar,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_REMINDERS_KEY = 'cf_reminders_v2';
const STORAGE_SETTINGS_KEY = 'cf_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  defaultLeadMinutes: 20,
  soundEnabled: true,
  desktopNotificationsEnabled: true,
  selectedTimezone: 'local',
  userHandle: '',
  autoRefreshInterval: 300, // 5 mins
  theme: 'dark',
};

export default function App() {
  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Reminders State
  const [reminders, setReminders] = useState<ContestReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMINDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Contests Data State
  const [contests, setContests] = useState<CodeforcesContest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User Profile & Daily Solved State
  const [userInfo, setUserInfo] = useState<CodeforcesUser | null>(null);
  const [dailyStats, setDailyStats] = useState<DailySolvedStats | null>(null);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState<boolean>(false);
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cf_daily_goal');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const handleUpdateGoal = useCallback((newGoal: number) => {
    setDailyGoal(newGoal);
    try {
      localStorage.setItem('cf_daily_goal', newGoal.toString());
    } catch (e) {
      console.error('Failed to save daily goal:', e);
    }
  }, []);

  // Fetch user daily solved stats
  const loadDailyStats = useCallback(
    async (handle: string, goal = dailyGoal) => {
      if (!handle.trim()) {
        setDailyStats(null);
        return;
      }
      setIsSubmissionsLoading(true);
      try {
        const subs = await fetchUserSubmissions(handle);
        const stats = calculateDailySolvedStats(handle, subs, goal);
        setDailyStats(stats);
      } catch (err) {
        console.error('Error fetching submissions for daily stats:', err);
      } finally {
        setIsSubmissionsLoading(false);
      }
    },
    [dailyGoal]
  );

  // Filters State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('UPCOMING');
  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Views State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save Settings to LocalStorage
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
      return updated;
    });
  }, []);

  // Save Reminders to LocalStorage
  const updateReminders = useCallback((newReminders: ContestReminder[]) => {
    setReminders(newReminders);
    try {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(newReminders));
    } catch (e) {
      console.error('Failed to save reminders:', e);
    }
  }, []);

  // Load Codeforces Contests
  const loadContests = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await fetchContests(force);
      setContests(data);
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Could not load Codeforces contests. Please check your network or try refreshing.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load Initial Contests
  useEffect(() => {
    loadContests(false);
  }, [loadContests]);

  // Load User Info and Daily Stats when handle changes
  useEffect(() => {
    if (settings.userHandle) {
      fetchUserInfo(settings.userHandle).then((info) => {
        if (info) setUserInfo(info);
      });
      loadDailyStats(settings.userHandle, dailyGoal);
    } else {
      setUserInfo(null);
      setDailyStats(null);
    }
  }, [settings.userHandle, loadDailyStats, dailyGoal]);

  // Auto Refresh Interval
  useEffect(() => {
    if (settings.autoRefreshInterval <= 0) return;
    const timer = setInterval(() => {
      loadContests(true);
    }, settings.autoRefreshInterval * 1000);
    return () => clearInterval(timer);
  }, [settings.autoRefreshInterval, loadContests]);

  // Request Notification Permission Wrapper
  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      addToast('Notification permissions granted! You will get 20-min contest alerts.');
    } else if (res === 'denied') {
      addToast('Notification permission blocked by browser. Please enable in site settings.');
    } else if (res === 'unsupported') {
      addToast('Browser Notifications not supported on this device.');
    }
  };

  // Toggle Reminder for a specific contest
  const handleToggleReminder = (contest: CodeforcesContest, leadMinutes?: number) => {
    const existing = reminders.find((r) => r.contestId === contest.id);
    const chosenLead = leadMinutes || settings.defaultLeadMinutes;

    if (existing) {
      // If same lead time, remove reminder; if different, update lead time
      if (existing.leadTimeMinutes === chosenLead) {
        const next = reminders.filter((r) => r.contestId !== contest.id);
        updateReminders(next);
        addToast(`Removed reminder for ${contest.name}`);
      } else {
        const next = reminders.map((r) =>
          r.contestId === contest.id ? { ...r, leadTimeMinutes: chosenLead, notified: false } : r
        );
        updateReminders(next);
        addToast(`Updated reminder: ${chosenLead} minutes before ${contest.name}`);
      }
    } else {
      if (!contest.startTimeSeconds) return;
      const newReminder: ContestReminder = {
        contestId: contest.id,
        contestName: contest.name,
        startTimeSeconds: contest.startTimeSeconds,
        durationSeconds: contest.durationSeconds,
        leadTimeMinutes: chosenLead,
        notified: false,
        createdAt: Date.now(),
      };
      updateReminders([...reminders, newReminder]);
      addToast(`🔔 Set ${chosenLead}-min reminder for ${contest.name}`);

      // Auto check permission if needed
      const currentPerm = getNotificationPermissionStatus();
      if (currentPerm === 'default') {
        handleRequestPermission();
      }
    }
  };

  // Active Background Reminder Ticker (Checks every 10 seconds)
  useEffect(() => {
    const ticker = setInterval(() => {
      const nowSeconds = Math.floor(Date.now() / 1000);

      reminders.forEach((r) => {
        if (r.notified) return;

        const secondsUntilStart = r.startTimeSeconds - nowSeconds;
        const triggerThresholdSeconds = r.leadTimeMinutes * 60;

        // Trigger if time until start is within threshold (and contest hasn't started more than 5 mins ago)
        if (secondsUntilStart <= triggerThresholdSeconds && secondsUntilStart >= -300) {
          // Trigger Notification!
          const minsBefore = Math.max(1, Math.round(secondsUntilStart / 60));
          const title = `🚨 Codeforces Contest Starting in ${minsBefore} min!`;
          const body = `${r.contestName} is starting soon! Get ready on Codeforces.`;

          triggerSystemNotification(
            title,
            {
              body,
              tag: `cf-contest-${r.contestId}`,
              data: { url: `https://codeforces.com/contest/${r.contestId}` },
            },
            settings.soundEnabled
          );

          addToast(`🚨 ALARM: ${r.contestName} starts in ${minsBefore} mins!`);

          // Mark as notified
          const updated = reminders.map((item) =>
            item.contestId === r.contestId ? { ...item, notified: true } : item
          );
          updateReminders(updated);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(ticker);
  }, [reminders, settings.soundEnabled, updateReminders, addToast]);

  // Compute Filtered Contests
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      // Status Filter
      if (statusFilter === 'UPCOMING' && c.phase !== 'BEFORE') return false;
      if (statusFilter === 'ACTIVE' && c.phase !== 'CODING') return false;
      if (statusFilter === 'FINISHED' && c.phase !== 'FINISHED') return false;
      if (statusFilter === 'REMINDERS') {
        const isSaved = reminders.some((r) => r.contestId === c.id);
        if (!isSaved) return false;
      }

      // Division Filter
      if (divisionFilter !== 'ALL') {
        const div = parseDivision(c.name);
        if (div !== divisionFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!c.name.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [contests, statusFilter, divisionFilter, searchQuery, reminders]);

  // Counts for status tabs
  const counts = useMemo(() => {
    let upcoming = 0;
    let active = 0;
    let finished = 0;

    contests.forEach((c) => {
      if (c.phase === 'BEFORE') upcoming++;
      else if (c.phase === 'CODING') active++;
      else if (c.phase === 'FINISHED') finished++;
    });

    return {
      upcoming,
      reminders: reminders.length,
      active,
      finished,
    };
  }, [contests, reminders]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onRequestNotificationPermission={handleRequestPermission}
        onRefreshContests={() => {
          loadContests(true);
          if (settings.userHandle) loadDailyStats(settings.userHandle);
        }}
        isRefreshing={isRefreshing}
        userInfo={userInfo}
        reminderCount={reminders.length}
        dailySolvedCount={dailyStats?.uniqueSolvedTodayCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Banner: Desktop/Mobile Notification Setup Callout */}
        <NotificationBanner
          onRequestPermission={handleRequestPermission}
          onOpenGuide={() => setIsGuideOpen(true)}
          onAddToast={addToast}
        />

        {/* Daily Solved Problems Card */}
        <DailySolvedCard
          stats={dailyStats}
          isLoading={isSubmissionsLoading}
          userHandle={settings.userHandle}
          onRefresh={() => {
            if (settings.userHandle) {
              loadDailyStats(settings.userHandle);
              addToast('Refreshed Codeforces submissions');
            }
          }}
          onUpdateHandle={(handle) => {
            updateSettings({ userHandle: handle });
            if (handle) {
              fetchUserInfo(handle).then((info) => setUserInfo(info));
              loadDailyStats(handle);
              addToast(`Tracking Codeforces profile: @${handle}`);
            }
          }}
          onUpdateGoal={(newGoal) => {
            handleUpdateGoal(newGoal);
            if (settings.userHandle && dailyStats) {
              setDailyStats({ ...dailyStats, dailyGoal: newGoal });
            }
          }}
        />

        {/* Daily Schedule Banner */}
        <DailyTimeline
          contests={contests}
          reminders={reminders}
          settings={settings}
          onToggleReminder={handleToggleReminder}
        />

        {/* Filters and Search Bar */}
        <ContestFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          divisionFilter={divisionFilter}
          onDivisionChange={setDivisionFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
        />

        {/* Error Callout if fetch failed */}
        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadContests(true)}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Fetching Codeforces contest schedule...</p>
          </div>
        ) : filteredContests.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Contests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter === 'REMINDERS'
                ? "You haven't set any contest reminders yet. Click 'Set 20-Min Reminder' on any upcoming contest!"
                : 'No contests match your current division filter or search query.'}
            </p>
            {(divisionFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setDivisionFilter('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Contest Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredContests.map((contest) => {
              const reminder = reminders.find((r) => r.contestId === contest.id);
              return (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  reminder={reminder}
                  settings={settings}
                  onToggleReminder={handleToggleReminder}
                  onAddToast={addToast}
                />
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Powered by Official Codeforces API & Browser Web Notifications Engine</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Desktop & Mobile Alert Setup
            </button>
            <span>•</span>
            <a
              href="https://codeforces.com/contests"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Codeforces official site
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onAddToast={addToast}
      />

      <NotificationSetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onRequestPermission={handleRequestPermission}
        onAddToast={addToast}
      />

      {/* User Handle Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <UserHandleCard
              userInfo={userInfo}
              dailySolvedCount={dailyStats?.uniqueSolvedTodayCount}
              onUpdateUserHandle={(handle, info) => {
                updateSettings({ userHandle: handle });
                setUserInfo(info);
              }}
              onClose={() => setIsUserModalOpen(false)}
              onAddToast={addToast}
            />
          </div>
        </div>
      )}
    </div>
  );
}
