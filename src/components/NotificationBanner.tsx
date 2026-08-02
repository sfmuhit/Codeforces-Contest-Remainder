import React from 'react';
import { Bell, ShieldAlert, Sparkles, Volume2, Smartphone, Monitor, CheckCircle, ArrowRight } from 'lucide-react';
import { getNotificationPermissionStatus, sendTestNotification } from '../lib/notificationService';

interface NotificationBannerProps {
  onRequestPermission: () => void;
  onOpenGuide: () => void;
  onAddToast: (msg: string) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  onRequestPermission,
  onOpenGuide,
  onAddToast,
}) => {
  const permStatus = getNotificationPermissionStatus();

  const handleTestClick = () => {
    sendTestNotification(true);
    onAddToast('Sent test notification! Check your screen/phone and sound.');
  };

  if (permStatus === 'granted') {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-white">
                Desktop & Mobile Notifications Ready
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              You will receive automatic alerts 20 minutes before selected Codeforces contests begin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTestClick}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Test Sound & Popup</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Guide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-slate-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl text-blue-300 shrink-0 shadow-inner">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-white">
                Never Miss a Codeforces Round
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                20-Min Alert Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Enable browser permissions to get popup notifications & sound chimes directly on your desktop or smartphone 20 minutes before contests start.
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-blue-400" /> Mac & Windows Desktop
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> Android & iPhone
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            onClick={onRequestPermission}
            className="px-5 py-2.5 font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Enable 20-Min Notifications</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenGuide}
            className="px-4 py-2.5 font-medium text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors flex items-center justify-center"
          >
            Setup Guide
          </button>
        </div>
      </div>
    </div>
  );
};
