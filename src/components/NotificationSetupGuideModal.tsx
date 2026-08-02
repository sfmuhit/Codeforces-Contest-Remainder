import React from 'react';
import { X, Monitor, Smartphone, Volume2, ShieldCheck, Calendar, Bell, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sendTestNotification } from '../lib/notificationService';

interface NotificationSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPermission: () => void;
  onAddToast: (msg: string) => void;
}

export const NotificationSetupGuideModal: React.FC<NotificationSetupGuideModalProps> = ({
  isOpen,
  onClose,
  onRequestPermission,
  onAddToast,
}) => {
  if (!isOpen) return null;

  const handleTest = () => {
    sendTestNotification(true);
    onAddToast('Test alert triggered! Check your screen for pop-up and sound.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white p-6 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Desktop & Mobile Notification Setup
              </h2>
              <p className="text-xs text-slate-400">
                Get notified 20 minutes before every Codeforces contest
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-blue-200">Step 1: Grant Permission</h3>
            <p className="text-xs text-slate-300">Click below to grant browser notification permission.</p>
          </div>
          <button
            onClick={() => {
              onRequestPermission();
            }}
            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Allow Notifications</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Instructions */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" /> Desktop (Windows / Mac / Linux)
          </h3>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Chrome / Edge / Brave:</strong> Look for the lock icon <strong className="text-white">🔒</strong> near the URL bar &gt; Site Settings &gt; Allow Notifications.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Audio Chime:</strong> Keep this app tab open or pinned in your browser so the 20-minute audio alarm sounds even when working in another window.
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Instructions */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" /> Mobile Devices (Android & iPhone)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-indigo-300">Android Phone</h4>
              <p className="text-slate-300">
                Open in Chrome or Edge on Android &gt; Click <strong>"Allow Notifications"</strong> when prompted. Notifications will display on your phone lock screen!
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-rose-300">iPhone / iPad (iOS)</h4>
              <p className="text-slate-300">
                Tap Safari's Share button &gt; <strong>"Add to Home Screen"</strong> to enable Web Push. Or use <strong>".ics Calendar Download"</strong> to sync directly with Apple Calendar!
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Sync Alternative */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3 text-xs">
          <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white">Calendar Alarm Backup</h4>
            <p className="text-slate-400">
              You can also click the <strong>"GCal"</strong> or <strong>".ics"</strong> button on any contest card to automatically insert a 20-minute alarm directly into Google Calendar or phone calendars.
            </p>
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleTest}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>Test Sound & Notification Now</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
