import React from 'react';
import { Bell, BellOff, Settings, Code2, User, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AppSettings, CodeforcesUser } from '../types';
import { getNotificationPermissionStatus } from '../lib/notificationService';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenUserModal: () => void;
  onRequestNotificationPermission: () => void;
  onRefreshContests: () => void;
  isRefreshing: boolean;
  userInfo: CodeforcesUser | null;
  reminderCount: number;
  dailySolvedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenGuide,
  onOpenUserModal,
  onRequestNotificationPermission,
  onRefreshContests,
  isRefreshing,
  userInfo,
  reminderCount,
  dailySolvedCount,
}) => {
  const permStatus = getNotificationPermissionStatus();

  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-rose-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-rose-300 bg-clip-text text-transparent">
                Codeforces Reminders
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-950/80 text-blue-300 border border-blue-800/50 rounded-full">
                Live API
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              20-Min Desktop & Mobile Contest Alerts
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefreshContests}
            disabled={isRefreshing}
            title="Refresh contest list"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* User Handle Badge / Button */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline font-medium">
              {userInfo ? userInfo.handle : (settings.userHandle || 'Set Handle')}
            </span>
            {typeof dailySolvedCount === 'number' && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{dailySolvedCount}</span>
              </span>
            )}
          </button>

          {/* Notification Permission Indicator Button */}
          <button
            onClick={onRequestNotificationPermission}
            title={`Notification status: ${permStatus}. Click to enable.`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              permStatus === 'granted'
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                : permStatus === 'denied'
                ? 'bg-rose-950/50 text-rose-300 border-rose-800/60 hover:bg-rose-900/60'
                : 'bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-900/60 animate-pulse'
            }`}
          >
            {permStatus === 'granted' ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Alerts On</span>
                {reminderCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full">
                    {reminderCount}
                  </span>
                )}
              </>
            ) : permStatus === 'denied' ? (
              <>
                <BellOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Alerts Blocked</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Enable Alerts</span>
              </>
            )}
          </button>

          {/* How to setup / Guide */}
          <button
            onClick={onOpenGuide}
            title="Notification Setup Guide for Desktop & Mobile"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Reminder Settings"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
