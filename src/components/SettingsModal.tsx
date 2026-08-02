import React from 'react';
import { X, Settings, Volume2, VolumeX, Globe, Clock, User, Bell, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';
import { COMMON_TIMEZONES } from '../lib/timeUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onAddToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onAddToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl text-white p-6 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 text-blue-400 rounded-xl border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Reminder Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          {/* Default Lead Time */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" /> Default Reminder Notice
            </label>
            <select
              value={settings.defaultLeadMinutes}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings({ defaultLeadMinutes: val });
                onAddToast(`Default reminder notice set to ${val} minutes before start`);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={5}>5 minutes before start</option>
              <option value={10}>10 minutes before start</option>
              <option value={20}>20 minutes before start (Recommended)</option>
              <option value={30}>30 minutes before start</option>
              <option value={60}>1 hour before start</option>
              <option value={1440}>1 day before start</option>
            </select>
            <p className="text-xs text-slate-400">
              When you click "Set Reminder", this notice time will be applied by default.
            </p>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <h4 className="font-semibold text-slate-200 text-xs sm:text-sm">Audio Chime Alarm</h4>
                <p className="text-[11px] text-slate-400">Play pleasant 3-tone chime when reminder triggers</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                onUpdateSettings({ soundEnabled: next });
                onAddToast(`Audio alarm ${next ? 'enabled' : 'disabled'}`);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Timezone Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Timezone Format
            </label>
            <select
              value={settings.selectedTimezone}
              onChange={(e) => {
                onUpdateSettings({ selectedTimezone: e.target.value });
                onAddToast('Updated contest display timezone');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Refresh Interval */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Auto-Refresh Contest List
            </label>
            <select
              value={settings.autoRefreshInterval}
              onChange={(e) => {
                onUpdateSettings({ autoRefreshInterval: Number(e.target.value) });
                onAddToast('Auto-refresh interval updated');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
              <option value={900}>Every 15 minutes</option>
              <option value={0}>Manual refresh only</option>
            </select>
          </div>

          {/* User Handle input */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" /> Your Codeforces Handle
            </label>
            <input
              type="text"
              value={settings.userHandle}
              onChange={(e) => onUpdateSettings({ userHandle: e.target.value })}
              placeholder="e.g. tourist"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Save & Done
          </button>
        </div>

      </div>
    </div>
  );
};
